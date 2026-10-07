/* Steps the reel a frame at a time: puts the frame's design on the card and
   waits until the card has finished painting it, renders the frame's
   shutter, and writes the PNG. The same reel on every machine, whatever the
   frame rate.

   "Finished painting" is checked by looking: the mesh paints the faces,
   bakes surface maps in a worker, and uploads textures over a few animation
   frames, and none of that reports done. So once its flags are clear, small
   renders of both faces are compared frame to frame until they stop
   changing. */

import { flushDeferredPaints, flushDeferredPaintsNow } from '@/components/CardStage/card3d/deferredPaint';
import { surfaceJobs, surfaceMapsReady } from '@/components/CardStage/card3d/surfaceBakeClient';
import type { CardDesign } from '@/data/design';
import type { ReelBrand } from '@reel/brands/reelBrands';
import type { Reel, ReelFrame } from './reelTimeline';
import type { Pixels, ReelPose, ReelRenderer } from './ReelRenderer';
import type { SceneHandle } from './ReelScene';

const nextFrame = () => new Promise<number>((r) => requestAnimationFrame(r));
const CHECK_SIZE = 96;
const FRONT = { rotX: 0, rotY: 0, rotZ: 0, y: 0, z: 0 };
const BACK = { rotX: 0, rotY: 180, rotZ: 0, y: 0, z: 0 };

function signature(p: Pixels): number {
  let h = 2166136261;
  for (let i = 0; i < p.data.length; i += 7) h = Math.imul(h ^ p.data[i], 16777619);
  return h >>> 0;
}

export interface TakeOptions {
  take: string;
  from?: number;
  to?: number;
  onProgress?: (done: number, total: number) => void;
  signal?: AbortSignal;
}

export interface TrackEntry {
  frame: number;
  t: number;
  id: string;
  rotX: number;
  rotY: number;
  rotZ: number;
  y: number;
  z: number;
}

export async function writeFile(path: string, body: Blob | string) {
  const res = await fetch(`/__reel/write?path=${encodeURIComponent(path)}`, { method: 'POST', body });
  if (!res.ok) throw new Error(`write ${path}: ${res.status}`);
}

export async function toPng(p: Pixels): Promise<Blob> {
  const c = new OffscreenCanvas(p.width, p.height);
  c.getContext('2d')!.putImageData(new ImageData(p.data, p.width, p.height), 0, 0);
  return c.convertToBlob({ type: 'image/png' });
}

export class ReelDirector {
  private shown: CardDesign | null = null;

  constructor(
    private readonly scene: SceneHandle,
    private readonly renderer: ReelRenderer,
  ) {
    flushDeferredPaints();
  }

  /** Whether the card shows `design`, painted, both faces. */
  async show(design: CardDesign, timeoutMs = 15000) {
    if (this.shown === design) return;
    this.scene.setDesign(design);
    this.shown = design;
    const t0 = performance.now();
    let last: string | null = null;
    let stable = 0;
    for (let i = 0; ; i++) {
      await nextFrame();
      flushDeferredPaintsNow();
      const f = this.scene.flags();
      // The surface maps the design needs bake in a worker; until they are
      // in, the mesh keeps the last design's (its gloss pattern, its etch).
      const mapsIn = surfaceJobs(design).every((j) => surfaceMapsReady(j));
      if (!f.painted || f.pending || f.swapInFlight || !mapsIn || i < 2) {
        stable = 0;
        last = null;
        continue;
      }
      const opts = { size: CHECK_SIZE, cardFrac: 0.9, exposure: 1 };
      const sig = `${signature(this.renderer.render([FRONT], opts))}:${signature(this.renderer.render([BACK], opts))}`;
      if (sig === last) {
        // The maps go up to the GPU two a frame once they land, so the
        // picture can hold still for a frame or two mid-upload.
        if (++stable >= 5) return;
      } else {
        stable = 0;
        last = sig;
      }
      if (performance.now() - t0 > timeoutMs) {
        console.warn('[reel] the card did not settle; rendering anyway', design);
        return;
      }
    }
  }

  /** Every design once, so the images and the surface bakes are in hand. */
  async warm(brands: ReelBrand[], onProgress?: (done: number, total: number) => void) {
    for (let i = 0; i < brands.length; i++) {
      await this.show(brands[i].design);
      onProgress?.(i + 1, brands.length);
    }
  }

  /** The shutter's instants around `t`, posed as the timeline has them. */
  private shutter(reel: Reel<ReelBrand>, t: number): Array<ReelPose> {
    const { minSamples, maxSamples, stepDeg, shutter } = reel.config.blur;
    const span = shutter / reel.config.fps;
    // How far the card turns while the shutter is open, sampled finely
    // enough to catch the wobble's reversals.
    let travel = 0;
    let prev = reel.frame(t - span / 2);
    for (let i = 1; i <= 8; i++) {
      const f = reel.frame(t - span / 2 + (span * i) / 8);
      travel += Math.abs(f.spin - prev.spin) + Math.abs(f.roll - prev.roll);
      prev = f;
    }
    const n = Math.min(maxSamples, Math.max(minSamples, Math.ceil(travel / stepDeg)));
    return Array.from({ length: n }, (_, s) => reel.frame(t + (n === 1 ? 0 : ((s + 0.5) / n - 0.5) * span)));
  }

  async frame(reel: Reel<ReelBrand>, i: number): Promise<{ pixels: Pixels; f: ReelFrame }> {
    const t = i / reel.config.fps;
    const f = reel.frame(t);
    await this.show(reel.sequence[f.index].design);
    flushDeferredPaintsNow();
    const { size, cardFrac, exposure } = reel.config;
    return { pixels: this.renderer.render(this.shutter(reel, t), { size, cardFrac, exposure }), f };
  }

  async renderTake(reel: Reel<ReelBrand>, o: TakeOptions) {
    const from = o.from ?? 0;
    const to = Math.min(o.to ?? reel.frames, reel.frames);
    const track: TrackEntry[] = [];
    const writes: Promise<void>[] = [];
    for (let i = from; i < to; i++) {
      if (o.signal?.aborted) throw new DOMException('aborted', 'AbortError');
      const { pixels, f } = await this.frame(reel, i);
      const name = `frame_${String(i - from + 1).padStart(5, '0')}.png`;
      writes.push(toPng(pixels).then((png) => writeFile(`${o.take}/frames/${name}`, png)));
      if (writes.length > 6) await writes.shift();
      track.push({
        frame: i - from,
        t: i / reel.config.fps,
        id: reel.sequence[f.index].id,
        rotX: f.rotX,
        rotY: f.rotY,
        rotZ: f.rotZ,
        y: f.y,
        z: f.z,
      });
      o.onProgress?.(i - from + 1, to - from);
    }
    await Promise.all(writes);
    const meta = {
      fps: reel.config.fps,
      size: reel.config.size,
      frames: to - from,
      duration: (to - from) / reel.config.fps,
      config: reel.config,
      swaps: reel.swapTimes.map((t, k) => ({ t, id: reel.sequence[k].id })),
    };
    await writeFile(`${o.take}/track.json`, JSON.stringify({ meta, track }, null, 2));
  }
}
