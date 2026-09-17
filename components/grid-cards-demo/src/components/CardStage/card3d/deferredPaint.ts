/* The card's slow paints, taken off its first seconds.

   Two of the card's maps take the main thread for the better part of a
   second each on a phone: the foil's relief (a Sobel over the mark at texel
   size) and the hologram's five maps. Both are on the back, which no one
   sees until the card is turned, yet they were painted as the material was
   made, in the same seconds the shaders compile and the front paints, and
   the intro stalled with them.

   A material starts with a texel of a placeholder in each slot (the same
   slots, so its shader is the one it keeps; only the image changes) and
   queues the paint here. The page drains the queue when its intro is done
   (`flushDeferredPaints`), one job a frame so no single frame takes two;
   a timer drains it regardless, so a page without an intro is never left
   with placeholders. A still rendered earlier drains it first. */

type Job = () => void;

const queue: Job[] = [];
let fallback: number | null = null;
let draining = false;

/** Before the fallback drains the queue, if no page has. */
const FALLBACK_MS = 3000;

/** Queue `job`; the returned function withdraws it (the material is gone). */
export function deferPaint(job: Job): () => void {
  queue.push(job);
  if (fallback === null && typeof window !== 'undefined') {
    fallback = window.setTimeout(() => {
      fallback = null;
      flushDeferredPaints();
    }, FALLBACK_MS);
  }
  return () => {
    const i = queue.indexOf(job);
    if (i >= 0) queue.splice(i, 1);
  };
}

/** Run the queued paints, one a frame. */
export function flushDeferredPaints(): void {
  if (fallback !== null) {
    window.clearTimeout(fallback);
    fallback = null;
  }
  if (draining) return;
  draining = true;
  const next = () => {
    const job = queue.shift();
    if (!job) {
      draining = false;
      return;
    }
    job();
    if (queue.length) requestAnimationFrame(next);
    else draining = false;
  };
  next();
}

/** Run every queued paint now, in this task: for a render that needs the
 *  finished maps this frame (a still). */
export function flushDeferredPaintsNow(): void {
  if (fallback !== null) {
    window.clearTimeout(fallback);
    fallback = null;
  }
  while (queue.length) queue.shift()!();
}

/** A one-texel canvas of `fill`, to hold a texture's slot until the paint. */
export function placeholderCanvas(fill: string): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 1;
  c.height = 1;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, 1, 1);
  return c;
}

/** Give a texture its painted image. */
export function repaint(texture: { image: unknown; needsUpdate: boolean }, image: HTMLCanvasElement): void {
  texture.image = image;
  texture.needsUpdate = true;
}
