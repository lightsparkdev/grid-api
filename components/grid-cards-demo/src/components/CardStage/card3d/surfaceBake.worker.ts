/// <reference lib="webworker" />
/**
 * The surface bakes, off the main thread. The page sends the face artwork
 * once (as bitmaps); each bake request runs `getSurfaceMaps` here, on
 * OffscreenCanvas, and the finished maps go back as bitmaps. The bake code is
 * the page's own (`surfaceMaps`, `facePaint`); `makeCanvas` gives it an
 * OffscreenCanvas where there is no document.
 */
import { makeCanvas, type FaceAssets } from './facePaint';
import { forgetSurfaceMaps, getSurfaceMaps, type Surface } from './surfaceMaps';
import type { Orientation } from '@/data/design';

export interface BakeJob {
  surface: Surface;
  side: 'front' | 'back';
  plain: boolean;
  mark: boolean;
  orientation: Orientation;
}

export type BakeRequest =
  | { type: 'init'; assets: Record<keyof FaceAssets, ImageBitmap> }
  /** `encode`: a bake ahead of any need for it, sent back as PNG (a
   *  twentieth of the pixels' size) for the page to keep until a design
   *  asks; without it the maps come back as bitmaps, ready to upload. */
  | { type: 'bake'; id: number; job: BakeJob; encode?: boolean };

export type BakeResponse =
  | { type: 'baked'; id: number; orm: ImageBitmap; normal: ImageBitmap }
  | { type: 'encoded'; id: number; orm: Blob; normal: Blob }
  | { type: 'failed'; id: number; error: string };

let assets: FaceAssets | null = null;

self.onmessage = async (e: MessageEvent<BakeRequest>) => {
  const msg = e.data;
  if (msg.type === 'init') {
    // The bake code draws these with drawImage / createPattern, which take a
    // canvas as they take an image; the type is the page's. The bitmaps
    // arrive living on the GPU, and every bake that drew one into its
    // (software) canvas read it back from there: a stall in the GPU process
    // per bake, which the page's compositor shares. Each is drawn once into a
    // software canvas of its own size here, and the bakes draw from that.
    const soft: Partial<Record<keyof FaceAssets, HTMLCanvasElement>> = {};
    for (const name of Object.keys(msg.assets) as Array<keyof FaceAssets>) {
      const bitmap = msg.assets[name];
      const c = makeCanvas(bitmap.width, bitmap.height);
      c.getContext('2d')!.drawImage(bitmap, 0, 0);
      bitmap.close();
      soft[name] = c;
    }
    assets = soft as unknown as FaceAssets;
    return;
  }
  if (!assets) {
    (self as unknown as Worker).postMessage({ type: 'failed', id: msg.id, error: 'no assets' } satisfies BakeResponse);
    return;
  }
  try {
    const { surface, side, plain, mark, orientation } = msg.job;
    const maps = getSurfaceMaps(surface, side, assets, plain, mark, orientation);
    if (msg.encode) {
      // Ahead of need: lossless PNG, decoded (and flipped, see below) by the
      // page when a design asks for it.
      const png = (c: HTMLCanvasElement) => (c as unknown as OffscreenCanvas).convertToBlob({ type: 'image/png' });
      const [orm, normal] = await Promise.all([png(maps.orm), png(maps.normal)]);
      (self as unknown as Worker).postMessage({ type: 'encoded', id: msg.id, orm, normal } satisfies BakeResponse);
    } else {
      // Copies, flipped: a canvas texture is flipped as it uploads (canvas
      // rows run down, a texture's up), and a bitmap isn't, so the flip is
      // baked into the bitmap and its texture uploads as is (see
      // canvasTexture, and the decorate passes, which flip it back to draw
      // on it).
      const [orm, normal] = await Promise.all([
        createImageBitmap(maps.orm as unknown as OffscreenCanvas, { imageOrientation: 'flipY' }),
        createImageBitmap(maps.normal as unknown as OffscreenCanvas, { imageOrientation: 'flipY' }),
      ]);
      (self as unknown as Worker).postMessage({ type: 'baked', id: msg.id, orm, normal } satisfies BakeResponse, [orm, normal]);
    }
    forgetSurfaceMaps(surface, side, plain, mark, orientation);
    // And give the canvases' pixels back now rather than at the next
    // collection: two 2048-wide maps a bake, and the bakes run back to back.
    for (const c of [maps.orm, maps.normal]) {
      c.width = 0;
      c.height = 0;
    }
  } catch (err) {
    (self as unknown as Worker).postMessage({
      type: 'failed',
      id: msg.id,
      error: err instanceof Error ? err.message : String(err),
    } satisfies BakeResponse);
  }
};
