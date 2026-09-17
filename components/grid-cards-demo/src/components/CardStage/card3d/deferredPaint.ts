/* The card's slow paints, taken off its first seconds.

   Two of the card's maps take the main thread for the better part of a
   second each on a phone: the foil's relief (a Sobel over the mark at texel
   size) and the hologram's five maps. Both are on the back, which no one
   sees until the card is turned, yet they were painted as the material was
   made, in the same seconds the shaders compile and the front paints, and
   the intro stalled with them.

   A material starts with a texel of a placeholder in each slot (the same
   slots, so its shader is the one it keeps; only the image changes) and
   queues the paint here. A page with an intro holds the queue from mount
   and drains it when the intro is done (`flushDeferredPaints`), one job a
   frame so no single frame takes two. From then on the queue is settled:
   a paint queued later (a new preset's materials) runs on the next frame.
   A page that never holds it gets a timer, so nothing is left with
   placeholders. A still rendered earlier drains it first, in its task. */

type Job = () => void;

const queue: Job[] = [];
let fallback: number | null = null;
let draining = false;
/** Pages with an intro in progress. While any, no timer drains the queue. */
let holds = 0;
/** Set by the first flush: the intro is over, paints need not wait. */
let settled = false;

/** Before the timer drains the queue, on a page that never held it. */
const FALLBACK_MS = 3000;

function armFallback() {
  if (fallback !== null || typeof window === 'undefined') return;
  fallback = window.setTimeout(() => {
    fallback = null;
    flushDeferredPaints();
  }, FALLBACK_MS);
}

function clearFallback() {
  if (fallback === null) return;
  window.clearTimeout(fallback);
  fallback = null;
}

function drain() {
  if (draining) return;
  draining = true;
  const next = () => {
    const job = queue.shift();
    if (job) job();
    if (queue.length) requestAnimationFrame(next);
    else draining = false;
  };
  next();
}

/** Queue `job`; the returned function withdraws it (the material is gone). */
export function deferPaint(job: Job): () => void {
  queue.push(job);
  if (settled) requestAnimationFrame(drain);
  else if (holds === 0) armFallback();
  return () => {
    const i = queue.indexOf(job);
    if (i >= 0) queue.splice(i, 1);
  };
}

/** Keep the queue from draining on its own while an intro runs. The
 *  returned function lets go (the page left before its intro ended). */
export function holdDeferredPaints(): () => void {
  holds += 1;
  clearFallback();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    holds -= 1;
    if (holds === 0 && !settled && queue.length) armFallback();
  };
}

/** The intro is over: run the queued paints, one a frame, and from now on
 *  run a queued paint on the next frame. */
export function flushDeferredPaints(): void {
  clearFallback();
  settled = true;
  drain();
}

/** Run every queued paint now, in this task: for a render that needs the
 *  finished maps this frame (a still). */
export function flushDeferredPaintsNow(): void {
  clearFallback();
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
