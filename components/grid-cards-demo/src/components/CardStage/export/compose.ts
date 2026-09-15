/* The picture around the card: a backdrop drawn in 2D under the rendered
   frame. The stage's dot grid (light or dark), a dark studio, a wash of the
   card's own color, or nothing. */

import { EXPOSURE_DARK, EXPOSURE_LIGHT, type ExportFrame } from './exportRenderer';

export type BackdropId = 'light' | 'dark' | 'studio' | 'brand' | 'none';

export const BACKDROPS: Array<{ id: BackdropId; label: string }> = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'studio', label: 'Studio' },
  { id: 'brand', label: 'Brand' },
  { id: 'none', label: 'None' },
];

/** The stage's dot grid: spacing to card width, and dot to spacing. On stage
 *  the card is about 1.3× its 370 px under dots 20 px apart. */
const DOT_SPACING_PER_CARD = 20 / (370 * 1.3);
const DOT_SIZE_PER_SPACING = 2.5 / 20;

const DOTS = {
  light: { bg: '#f4f4f3', dot: '#deded9' },
  dark: { bg: '#1a1a1a', dot: '#2d2d2a' },
};

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(a: [number, number, number], b: [number, number, number], t: number): string {
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
function luminance([r, g, b]: [number, number, number]): number {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/** The tone mapping exposure the card takes over a backdrop: brighter over a
 *  light one, as on the stage. */
export function exposureFor(backdrop: BackdropId, brandColor: string): number {
  switch (backdrop) {
    case 'light':
      return EXPOSURE_LIGHT;
    case 'dark':
    case 'studio':
      return EXPOSURE_DARK;
    case 'brand':
      return luminance(hexToRgb(brandColor)) > 0.5 ? EXPOSURE_LIGHT : EXPOSURE_DARK;
    case 'none':
      return (EXPOSURE_LIGHT + EXPOSURE_DARK) / 2;
    default: {
      const never: never = backdrop;
      return never;
    }
  }
}

/** Draw the backdrop across `ctx` for a frame `w` × `h` whose card spans
 *  `cardPx` px along its long edge (sizes the dot grid). */
export function paintBackdrop(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  backdrop: BackdropId,
  brandColor: string,
  cardPx: number,
) {
  ctx.clearRect(0, 0, w, h);
  switch (backdrop) {
    case 'light':
    case 'dark': {
      const c = DOTS[backdrop];
      ctx.fillStyle = c.bg;
      ctx.fillRect(0, 0, w, h);
      const spacing = cardPx * DOT_SPACING_PER_CARD;
      const size = spacing * DOT_SIZE_PER_SPACING;
      // Centered lattice, so the middle of the frame lands between dots.
      const cols = Math.ceil(w / spacing) + 2;
      const rows = Math.ceil(h / spacing) + 2;
      const x0 = w / 2 - Math.floor(cols / 2) * spacing;
      const y0 = h / 2 - Math.floor(rows / 2) * spacing;
      ctx.fillStyle = c.dot;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          ctx.fillRect(x0 + i * spacing - size / 2, y0 + j * spacing - size / 2, size, size);
        }
      }
      return;
    }
    case 'studio': {
      const g = ctx.createRadialGradient(w / 2, h * 0.42, 0, w / 2, h * 0.42, Math.hypot(w, h) * 0.6);
      g.addColorStop(0, '#2a2a2e');
      g.addColorStop(0.55, '#15151a');
      g.addColorStop(1, '#08080a');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      return;
    }
    case 'brand': {
      const rgb = hexToRgb(brandColor);
      const light = luminance(rgb) > 0.5;
      // A light color darkens toward the edges; a dark one lifts at the
      // center, so the card's edge always separates from its own color.
      const center = light ? mix(rgb, [255, 255, 255], 0.12) : mix(rgb, [255, 255, 255], 0.16);
      const edge = light ? mix(rgb, [0, 0, 0], 0.22) : mix(rgb, [0, 0, 0], 0.45);
      const g = ctx.createRadialGradient(w / 2, h * 0.45, 0, w / 2, h * 0.45, Math.hypot(w, h) * 0.62);
      g.addColorStop(0, center);
      g.addColorStop(1, edge);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      return;
    }
    case 'none':
      return;
    default: {
      const never: never = backdrop;
      return never;
    }
  }
}

/** Put a rendered frame onto a canvas of its size (a scratch for drawImage). */
export function frameToCanvas(frame: ExportFrame, into?: HTMLCanvasElement): HTMLCanvasElement {
  const c = into ?? document.createElement('canvas');
  if (c.width !== frame.width || c.height !== frame.height) {
    c.width = frame.width;
    c.height = frame.height;
  }
  const ctx = c.getContext('2d')!;
  ctx.putImageData(new ImageData(frame.data, frame.width, frame.height), 0, 0);
  return c;
}

/** Backdrop, then the card over it, onto `target` (made if absent). */
export function compose(
  frame: ExportFrame,
  backdrop: BackdropId,
  brandColor: string,
  cardPx: number,
  scratch: { card?: HTMLCanvasElement; target?: HTMLCanvasElement } = {},
): HTMLCanvasElement {
  const card = frameToCanvas(frame, scratch.card);
  const target = scratch.target ?? document.createElement('canvas');
  scratch.card = card;
  scratch.target = target;
  if (target.width !== frame.width || target.height !== frame.height) {
    target.width = frame.width;
    target.height = frame.height;
  }
  const ctx = target.getContext('2d')!;
  paintBackdrop(ctx, frame.width, frame.height, backdrop, brandColor, cardPx);
  ctx.drawImage(card, 0, 0);
  return target;
}

/** Encode a canvas. WebP where the browser can (smaller, and X and iMessage
 *  take it), else PNG; a PNG over the crawlers' 5 MB is re-encoded as JPEG. */
export async function encodeCanvas(canvas: HTMLCanvasElement, wantTransparency: boolean): Promise<Blob> {
  const toBlob = (type: string, quality?: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  if (wantTransparency) {
    const png = await toBlob('image/png');
    if (!png) throw new Error('encode-failed');
    return png;
  }
  const webp = await toBlob('image/webp', 0.9);
  if (webp && webp.type === 'image/webp') return webp;
  const png = webp ?? (await toBlob('image/png'));
  if (!png) throw new Error('encode-failed');
  if (png.size <= 4.5 * 1024 * 1024) return png;
  const jpeg = await toBlob('image/jpeg', 0.92);
  return jpeg ?? png;
}
