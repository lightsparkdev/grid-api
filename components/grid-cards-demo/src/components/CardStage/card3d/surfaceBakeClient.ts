/**
 * The page's side of the surface bakes. Where the browser has workers with
 * OffscreenCanvas, the bakes run in `surfaceBake.worker` and come back as
 * bitmaps, so a surface change or a background bake never holds the main
 * thread (a bake is a frame or two of work, more in WebKit); elsewhere they
 * run here as before. Results are cached by the same key the mesh uses, so a
 * bake requested in the background is ready when a design asks for it.
 */
import type { FaceAssets } from './facePaint';
import { getSurfaceMaps, surfaceKey, surfaceOf, type Surface } from './surfaceMaps';
import type { BakeJob, BakeResponse } from './surfaceBake.worker';
import type { CardDesign, Orientation } from '@/data/design';

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

/** A bake ahead of need, as the worker sends it back: lossless PNG, a
 *  twentieth of the pixels' size. Decoded into `ready` when a design asks. */
interface EncodedMaps {
  orm: Blob;
  normal: Blob;
}

/** Decoded, ready to upload: the maps a design has asked for. Kept for the
 *  session, as the mesh keeps their textures. */
const ready = new Map<string, SurfaceMapImages>();
/** Baked ahead and waiting, compressed. Every variant bakes ahead (see
 *  CardMesh); held raw they were 500 MB, held this way some 25. */
const encoded = new Map<string, EncodedMaps>();
/** What is under way for a key (a bake, a decode), so nothing runs twice. */
const inflight = new Map<string, Promise<void>>();

const isEncoded = (m: SurfaceMapImages | EncodedMaps): m is EncodedMaps => m.orm instanceof Blob;

/** Run `work` for `key` unless something already is, in which case join it. */
function once(key: string, work: () => Promise<void>): Promise<void> {
  const running = inflight.get(key);
  if (running) return running;
  const p = work().finally(() => {
    if (inflight.get(key) === p) inflight.delete(key);
  });
  inflight.set(key, p);
  return p;
}

/** The worker's PNGs as bitmaps, flipped as its bitmaps come (see the worker). */
async function decode(e: EncodedMaps): Promise<SurfaceMapImages> {
  const [orm, normal] = await Promise.all([
    createImageBitmap(e.orm, { imageOrientation: 'flipY' }),
    createImageBitmap(e.normal, { imageOrientation: 'flipY' }),
  ]);
  return { orm, normal };
}

/**
 * Every bake a design's card needs: its surface on both faces (the back
 * with the foil mark's carrier only when the mark is there), and the blank's
 * and the base's for a material change. `body` is the slab's own design,
 * which lags the design's through a change (see CardMesh).
 */
export function surfaceJobs(design: CardDesign, body: CardDesign = design): BakeJob[] {
  const surface = surfaceOf(body);
  const bare: Surface = design.material === 'metal' ? 'bare-gloss' : `print-${design.finish}`;
  const base = surfaceOf(design);
  const backMark = body.visaMark === 'back';
  const orientation = body.orientation;
  const jobs: BakeJob[] = [];
  for (const side of ['front', 'back'] as const) {
    jobs.push({ surface, side, plain: false, mark: side === 'front' || backMark, orientation });
    jobs.push({ surface: bare, side, plain: true, mark: true, orientation });
    jobs.push({ surface: base, side, plain: true, mark: true, orientation });
  }
  return jobs;
}

// Dev: which bakes are in (`__surfaceBakes.ready()`), for tracing the queue.
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__surfaceBakes = { ready: () => Array.from(ready.keys()) };
}

let worker: Worker | null = null;
/** Resolves once the worker has the artwork; null until first asked for. */
let workerReady: Promise<Worker | null> | null = null;
let nextId = 1;
const waiting = new Map<number, { resolve: (m: SurfaceMapImages | EncodedMaps) => void; reject: (e: Error) => void }>();

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
        if (msg.type === 'baked' || msg.type === 'encoded') slot.resolve({ orm: msg.orm, normal: msg.normal } as SurfaceMapImages | EncodedMaps);
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

const keyOf = (job: BakeJob) => surfaceKey(job.surface, job.side, job.plain, job.mark, job.orientation);

/** One bake in the worker; null when it failed (the page bakes instead). */
function bakeInWorker(w: Worker, job: BakeJob, encode: boolean): Promise<SurfaceMapImages | EncodedMaps | null> {
  return new Promise<SurfaceMapImages | EncodedMaps>((resolve, reject) => {
    const id = nextId++;
    waiting.set(id, { resolve, reject });
    w.postMessage({ type: 'bake', id, job, encode });
  }).catch(() => null);
}

/** The maps for a bake, decoded and ready to upload: off the main thread
 *  where possible, cached once baked. The same job asked for twice is one
 *  bake. A bake ahead of it (see `prebakeSurfaceMaps`) is decoded; one
 *  still under way is waited for, then decoded. */
export async function loadSurfaceMaps(job: BakeJob, assets: FaceAssets): Promise<SurfaceMapImages> {
  const key = keyOf(job);
  const settle = async () => {
    const png = encoded.get(key);
    if (png) {
      encoded.delete(key);
      try {
        ready.set(key, await decode(png));
        return;
      } catch {
        // A bitmap it couldn't make: bake again below.
      }
    }
    const w = await startWorker(assets);
    let maps: SurfaceMapImages | null = null;
    if (w) {
      const r = await bakeInWorker(w, job, false);
      if (r) maps = isEncoded(r) ? await decode(r) : r;
    }
    // No worker, or it failed: the page bakes, as it always could.
    if (!maps) maps = getSurfaceMaps(job.surface, job.side, assets, job.plain, job.mark, job.orientation);
    ready.set(key, maps);
  };
  if (!ready.has(key)) await once(key, settle);
  // Joined a bake ahead, which lands compressed: now decode it.
  if (!ready.has(key)) await once(key, settle);
  return ready.get(key)!;
}

/** Bake ahead of any need, compressed, so a design that asks later finds
 *  its maps a decode away rather than a bake. Nothing when the maps are in
 *  (either way) or under way. Without a worker the page bakes as it does
 *  on demand (its canvases are the maps; there is nothing to compress). */
export function prebakeSurfaceMaps(job: BakeJob, assets: FaceAssets): Promise<void> {
  const key = keyOf(job);
  if (ready.has(key) || encoded.has(key)) return Promise.resolve();
  return once(key, async () => {
    const w = await startWorker(assets);
    if (!w) {
      ready.set(key, getSurfaceMaps(job.surface, job.side, assets, job.plain, job.mark, job.orientation));
      return;
    }
    const r = await bakeInWorker(w, job, true);
    // Failed: left for the on-demand path to bake when asked.
    if (!r) return;
    if (isEncoded(r)) encoded.set(key, r);
    else ready.set(key, r);
  });
}

/** Decode what these jobs need ahead of the click that will ask for it
 *  (the pointer over a material or finish tile), so the switch finds its
 *  maps ready. Nothing for maps not yet baked, or already decoded. */
export function warmSurfaceMaps(jobs: BakeJob[]): void {
  for (const job of jobs) {
    const key = keyOf(job);
    if (ready.has(key) || !encoded.has(key) || inflight.has(key)) continue;
    void once(key, async () => {
      const png = encoded.get(key);
      if (!png) return;
      try {
        const maps = await decode(png);
        encoded.delete(key);
        ready.set(key, maps);
      } catch {
        // Left compressed; the on-demand path bakes again if the decode fails there too.
      }
    });
  }
}

export type { BakeJob, Surface, Orientation };
