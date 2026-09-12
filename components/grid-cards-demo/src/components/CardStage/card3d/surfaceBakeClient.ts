/**
 * The page's side of the surface bakes. Where the browser has workers with
 * OffscreenCanvas, the bakes run in `surfaceBake.worker` and come back as
 * bitmaps, so a surface change or a background bake never holds the main
 * thread (a bake is a frame or two of work, more in WebKit); elsewhere they
 * run here as before. Results are cached by the same key the mesh uses, so a
 * bake requested in the background is ready when a design asks for it.
 */
import type { FaceAssets } from './facePaint';
import { getSurfaceMaps, surfaceKey, type Surface } from './surfaceMaps';
import type { BakeJob, BakeResponse } from './surfaceBake.worker';
import type { Orientation } from '@/data/design';

/** A baked map: a canvas from the main thread, a bitmap from the worker.
 *  Both draw as a texture's image and as a drawImage source. */
export type MapImage = HTMLCanvasElement | ImageBitmap;

export interface SurfaceMapImages {
  orm: MapImage;
  normal: MapImage;
}

export function canBakeOffThread(): boolean {
  return (
    typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined' && typeof createImageBitmap === 'function'
  );
}

const ready = new Map<string, SurfaceMapImages>();
const inflight = new Map<string, Promise<SurfaceMapImages>>();

let worker: Worker | null = null;
/** Resolves once the worker has the artwork; null until first asked for. */
let workerReady: Promise<Worker | null> | null = null;
let nextId = 1;
const waiting = new Map<number, { resolve: (m: SurfaceMapImages) => void; reject: (e: Error) => void }>();

/** The SVG artwork has no natural size (it is drawn to fit wherever it goes),
 *  which a bitmap needs: it is rasterized at a size well past any it is
 *  drawn at in the bakes (the lockup lands ~700 texels wide), at the aspect
 *  the bakes draw it in. The PNG tiles have their sizes. */
const RASTER: Partial<Record<keyof FaceAssets, [number, number]>> = {
  lockup: [2048, Math.round((2048 * 211.067) / 339)],
  dove: [1536, 2048],
  contactless: [1024, 1024],
};

function assetBitmap(name: keyof FaceAssets, img: HTMLImageElement): Promise<ImageBitmap> {
  const size = RASTER[name];
  if (!size || (img.naturalWidth > 0 && img.naturalHeight > 0 && !img.src.endsWith('.svg'))) {
    return createImageBitmap(img);
  }
  const c = document.createElement('canvas');
  c.width = size[0];
  c.height = size[1];
  c.getContext('2d')!.drawImage(img, 0, 0, size[0], size[1]);
  return createImageBitmap(c);
}

function startWorker(assets: FaceAssets): Promise<Worker | null> {
  if (workerReady) return workerReady;
  workerReady = (async () => {
    if (!canBakeOffThread()) return null;
    try {
      const names = Object.keys(assets) as Array<keyof FaceAssets>;
      const bitmaps = await Promise.all(names.map((n) => assetBitmap(n, assets[n])));
      const w = new Worker(new URL('./surfaceBake.worker.ts', import.meta.url));
      w.onmessage = (e: MessageEvent<BakeResponse>) => {
        const msg = e.data;
        const slot = waiting.get(msg.id);
        if (!slot) return;
        waiting.delete(msg.id);
        if (msg.type === 'baked') slot.resolve({ orm: msg.orm, normal: msg.normal });
        else slot.reject(new Error(msg.error));
      };
      w.onerror = () => {
        // The worker is gone: every request in flight falls back to the page.
        waiting.forEach((slot) => slot.reject(new Error('worker error')));
        waiting.clear();
        worker = null;
      };
      const record = Object.fromEntries(names.map((n, i) => [n, bitmaps[i]])) as Record<keyof FaceAssets, ImageBitmap>;
      w.postMessage({ type: 'init', assets: record }, bitmaps);
      worker = w;
      return w;
    } catch (err) {
      // The page bakes instead; say why, once, for whoever is looking.
      console.warn('[cards] surface bakes stay on the main thread:', err);
      return null;
    }
  })();
  return workerReady;
}

/** The maps for a bake, if already baked (from anywhere). */
export function surfaceMapsReady(job: BakeJob): SurfaceMapImages | undefined {
  return ready.get(surfaceKey(job.surface, job.side, job.plain, job.mark, job.orientation));
}

/** The maps for a bake: off the main thread where possible, cached once
 *  baked. The same job asked for twice is one bake. */
export function loadSurfaceMaps(job: BakeJob, assets: FaceAssets): Promise<SurfaceMapImages> {
  const key = surfaceKey(job.surface, job.side, job.plain, job.mark, job.orientation);
  const done = ready.get(key);
  if (done) return Promise.resolve(done);
  const running = inflight.get(key);
  if (running) return running;
  const p = (async () => {
    const w = await startWorker(assets);
    let maps: SurfaceMapImages | null = null;
    if (w) {
      maps = await new Promise<SurfaceMapImages>((resolve, reject) => {
        const id = nextId++;
        waiting.set(id, { resolve, reject });
        w.postMessage({ type: 'bake', id, job });
      }).catch(() => null);
    }
    if (!maps) {
      // No worker, or it failed: the page bakes, as it always could.
      maps = getSurfaceMaps(job.surface, job.side, assets, job.plain, job.mark, job.orientation);
    }
    ready.set(key, maps);
    inflight.delete(key);
    return maps;
  })();
  inflight.set(key, p);
  return p;
}

export type { BakeJob, Surface, Orientation };
