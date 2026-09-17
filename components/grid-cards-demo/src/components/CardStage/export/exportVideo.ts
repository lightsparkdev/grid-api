/* The spin, square like the still: the card turns once through the studio
   over a few seconds, the foil and the hologram catching the lights as it
   goes. Rendered a frame at a time at a fixed step, so it is the same video
   on every machine whatever the frame rate, and encoded in the browser
   (WebCodecs H.264 into an MP4), which is what X, iMessage, and a download
   all want. */

import { ArrayBufferTarget, Muxer } from 'mp4-muxer';
import { compose, exposureFor, prepareTemplate, type Palette } from './compose';
import type { CardExporter } from './exportRenderer';
import { flushDeferredPaintsNow } from '../card3d/deferredPaint';
import { cardFracFor } from './stills';

export const VIDEO_W = 1080;
export const VIDEO_H = 1080;
export const VIDEO_FPS = 60;
export const VIDEO_SECONDS = 5;
/** The pitch the card holds through the turn. */
const PITCH_DEG = -8;
/** Bit/s. A 1080 square of a slow turn compresses well; this keeps the foil's
 *  detail without the file outrunning a text message. */
const BITRATE = 5_000_000;
/** H.264 profiles to try, best first: High 4.0, Main 4.0, Baseline 3.1. */
const CODECS = ['avc1.640028', 'avc1.4d0028', 'avc1.42001f'];
/** The encoder is fed at most this many frames ahead. */
const QUEUE_MAX = 6;

/** Whether this browser can make the video at all. */
export function canEncodeVideo(): boolean {
  return typeof VideoEncoder !== 'undefined' && typeof VideoFrame !== 'undefined';
}

async function pickCodec(): Promise<string | null> {
  for (const codec of CODECS) {
    try {
      const { supported } = await VideoEncoder.isConfigSupported({
        codec,
        width: VIDEO_W,
        height: VIDEO_H,
        bitrate: BITRATE,
        framerate: VIDEO_FPS,
      });
      if (supported) return codec;
    } catch {
      // Try the next.
    }
  }
  return null;
}

/** Ease for the turn: constant speed reads mechanical; a long ease in and out
 *  of the turn is a hand turning it. Starts and ends front-on. */
function turn(u: number): number {
  const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  // Blend toward linear so the middle of the turn (the back) isn't rushed.
  return 360 * (0.35 * e + 0.65 * u);
}

export interface VideoOptions {
  palette: Palette;
  onProgress?: (done: number, total: number) => void;
  signal?: AbortSignal;
}

/**
 * Render and encode the spin. Resolves to the MP4, or null where the browser
 * has no encoder. Rejects on abort.
 */
export async function renderSpinVideo(exporter: CardExporter, opts: VideoOptions): Promise<Blob | null> {
  if (!canEncodeVideo()) return null;
  flushDeferredPaintsNow();
  const codec = await pickCodec();
  if (!codec) return null;
  await prepareTemplate();

  const total = VIDEO_FPS * VIDEO_SECONDS;
  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: 'avc', width: VIDEO_W, height: VIDEO_H, frameRate: VIDEO_FPS },
    fastStart: 'in-memory',
  });
  let failed: Error | null = null;
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => {
      failed = e;
    },
  });
  encoder.configure({
    codec,
    width: VIDEO_W,
    height: VIDEO_H,
    bitrate: BITRATE,
    framerate: VIDEO_FPS,
    latencyMode: 'quality',
    avc: { format: 'avc' },
  });

  const exposure = exposureFor(opts.palette);
  const cardFrac = cardFracFor(VIDEO_W, VIDEO_H, exporter.orientation);
  const scratch: { card?: HTMLCanvasElement; target?: HTMLCanvasElement } = {};
  const frameUs = 1_000_000 / VIDEO_FPS;
  const yieldToUi = () => new Promise<void>((r) => setTimeout(r, 0));

  try {
    for (let i = 0; i < total; i++) {
      if (opts.signal?.aborted) throw new DOMException('aborted', 'AbortError');
      if (failed) throw failed;
      const u = i / total;
      const frame = exporter.renderSafe({
        width: VIDEO_W,
        height: VIDEO_H,
        pose: { rotX: PITCH_DEG, rotY: turn(u) },
        cardFrac,
        exposure,
      });
      const canvas = compose(frame, { palette: opts.palette }, scratch);
      const vf = new VideoFrame(canvas, { timestamp: Math.round(i * frameUs), duration: Math.round(frameUs) });
      encoder.encode(vf, { keyFrame: i % VIDEO_FPS === 0 });
      vf.close();
      opts.onProgress?.(i + 1, total);
      // Let the page paint, and don't run ahead of the encoder.
      if (encoder.encodeQueueSize > QUEUE_MAX || i % 4 === 3) await yieldToUi();
      while (encoder.encodeQueueSize > QUEUE_MAX) await yieldToUi();
    }
    await encoder.flush();
    if (failed) throw failed;
    muxer.finalize();
    return new Blob([muxer.target.buffer], { type: 'video/mp4' });
  } finally {
    if (encoder.state !== 'closed') encoder.close();
  }
}
