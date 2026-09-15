/* The picture around the card: the share template (Figma `Lightspark Card`,
   og-image-template-light 2018:9911 and -dark 2018:9950) drawn in 2D under
   the rendered frame. An 800-unit square layout centered in the frame, 24
   of padding, a hairline rule down each outer edge, the Lightspark logomark
   top left, the card's color as an RGB tuple bottom left, "Lightspark /
   Cards Playground" top right, "docs.lightspark.com" bottom right, all in
   8-unit Suisse. Light and dark are the app's surfaces; Brand takes the
   card's own color (or the dominant color of its art), pushed a step so the
   card still separates from it. */

import { loadImage } from '../card3d/facePaint';
import { EXPOSURE_DARK, EXPOSURE_LIGHT, type ExportFrame } from './exportRenderer';

/** The three surfaces offered, and a color of the visitor's own. */
export type BackdropId = 'light' | 'dark' | 'brand' | 'custom';

export const BACKDROPS: Array<{ id: Exclude<BackdropId, 'custom'>; label: string }> = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'brand', label: 'Brand' },
];

/** The surfaces a design offers beyond the two fixed ones. */
export interface Surfaces {
  brand: string;
  custom: string | null;
}

/** The template's own colors (Origin: surface/primary, text/primary). */
export interface Palette {
  bg: string;
  ink: string;
}
const LIGHT: Palette = { bg: '#f8f8f7', ink: '#1a1a1a' };
const DARK: Palette = { bg: '#1a1a1a', ink: '#f0f0ee' };

/** The layout, in the Figma's units (a square of `LAYOUT`). */
const LAYOUT = 800;
const PAD = 24;
const COL_PAD = 8;
const TEXT = 8;
const LOGO_W = 25.446;
const LOGO_H = 16;
const LOGO_URL = '/assets/share/lightspark-logomark.svg';

/** The template's face: Suisse Intl with the single-story a and the slashed
 *  zero, registered as its own family so canvas text gets the features. */
const FONT_FAMILY = 'Suisse Intl Share';
const FONT_URL = '/fonts/SuisseIntlVF.woff2';

type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex([r, g, b]: RGB): string {
  return (
    '#' +
    [r, g, b]
      .map((v) =>
        Math.round(Math.max(0, Math.min(255, v)))
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}
function mix(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
function luminance([r, g, b]: RGB): number {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

// ── Assets ────────────────────────────────────────────────────────────────
let assets: { logo: string; font: boolean } | null = null;
let assetsPromise: Promise<void> | null = null;
const logoImages = new Map<string, HTMLImageElement>();

/** Load the logomark and the face once; `paintTemplate` needs both in hand. */
export function prepareTemplate(): Promise<void> {
  if (!assetsPromise) {
    assetsPromise = (async () => {
      const [logo, font] = await Promise.all([
        fetch(LOGO_URL)
          .then((r) => r.text())
          .catch(() => ''),
        registerFont(),
      ]);
      assets = { logo, font };
    })();
  }
  return assetsPromise;
}

async function registerFont(): Promise<boolean> {
  if (typeof document === 'undefined' || typeof FontFace === 'undefined' || !('fonts' in document)) return false;
  try {
    const face = new FontFace(FONT_FAMILY, `url(${FONT_URL}) format("woff2")`, {
      featureSettings: '"ss01" 1, "salt" 1, "zero" 1',
      weight: '100 900',
      style: 'normal',
    });
    document.fonts.add(face);
    await face.load();
    return true;
  } catch {
    return false;
  }
}

/** The logomark in an ink, as an image to draw (the SVG's fill swapped). */
function logoIn(ink: string): HTMLImageElement | null {
  if (!assets?.logo) return null;
  let img = logoImages.get(ink);
  if (img) return img;
  const svg = assets.logo.replace(/fill="#1A1A1A"/gi, `fill="${ink}"`);
  img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  logoImages.set(ink, img);
  return img;
}

/** Warm the logomark images for both inks (a data URL decodes async; the
 *  first paint after `prepareTemplate` would otherwise miss it). */
export async function warmTemplate(): Promise<void> {
  await prepareTemplate();
  await Promise.all(
    [LIGHT.ink, DARK.ink].map((ink) => {
      const img = logoIn(ink);
      return img && !img.complete ? img.decode().catch(() => undefined) : Promise.resolve();
    }),
  );
}

// ── Brand ─────────────────────────────────────────────────────────────────

/** The dominant color of an image: the mean of its pixels at thumbnail
 *  size, saturation lifted a touch (a mean tends gray). */
export function dominantColor(img: HTMLImageElement): string {
  const N = 24;
  const c = document.createElement('canvas');
  c.width = N;
  c.height = N;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, N, N);
  const d = ctx.getImageData(0, 0, N, N).data;
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3] / 255;
    if (a < 0.5) continue;
    r += d[i];
    g += d[i + 1];
    b += d[i + 2];
    n++;
  }
  if (!n) return '#808080';
  const mean: RGB = [r / n, g / n, b / n];
  const gray = (mean[0] + mean[1] + mean[2]) / 3;
  const lifted = mix([gray, gray, gray], mean, 1.35);
  return rgbToHex(lifted);
}

/** The Brand backdrop's surface for a card: the card's color (or its art's)
 *  pushed toward the dark or the light so the card's edge reads on it. */
export function brandSurface(base: string): string {
  const rgb = hexToRgb(base);
  const l = luminance(rgb);
  // The card sits on a deeper version of its own color, so it reads as the
  // lit object on it; a card that is already near black takes a lifted one.
  const shifted = l < 0.12 ? mix(rgb, [255, 255, 255], 0.22) : mix(rgb, [0, 0, 0], l > 0.6 ? 0.4 : 0.42);
  return rgbToHex(shifted);
}

/** The Brand surface for a design: from its art when it has one, else its color. */
export async function brandSurfaceFor(design: { backgroundUrl: string | null }, brandColor: string): Promise<string> {
  if (design.backgroundUrl) {
    const img = await loadImage(design.backgroundUrl);
    if (img) return brandSurface(dominantColor(img));
  }
  return brandSurface(brandColor);
}

/** A surface with the ink that reads on it. */
export function paletteOn(bg: string): Palette {
  return { bg, ink: luminance(hexToRgb(bg)) > 0.5 ? LIGHT.ink : DARK.ink };
}

export function paletteFor(backdrop: BackdropId, surfaces: Surfaces): Palette {
  switch (backdrop) {
    case 'light':
      return LIGHT;
    case 'dark':
      return DARK;
    case 'brand':
      return paletteOn(surfaces.brand);
    case 'custom':
      return paletteOn(surfaces.custom ?? surfaces.brand);
    default: {
      const never: never = backdrop;
      return never;
    }
  }
}

/** The card's tone mapping exposure over a surface: as on the stage, brighter
 *  over a light one. */
export function exposureFor(palette: Palette): number {
  return luminance(hexToRgb(palette.bg)) > 0.5 ? EXPOSURE_LIGHT : EXPOSURE_DARK;
}

// ── Template ──────────────────────────────────────────────────────────────

/** The layout square's side and origin in a frame. */
export function layoutIn(w: number, h: number): { side: number; x: number; y: number; k: number } {
  const side = Math.min(w, h);
  return { side, x: (w - side) / 2, y: (h - side) / 2, k: side / LAYOUT };
}

/**
 * Draw the template across `ctx` for a frame `w` × `h`: the surface, the
 * rules, and the type, with `cardRgb` as the tuple bottom left.
 */
export function paintTemplate(ctx: CanvasRenderingContext2D, w: number, h: number, palette: Palette, cardRgb: RGB) {
  const { side, x: ox, y: oy, k } = layoutIn(w, h);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, w, h);

  const pad = PAD * k;
  const inner = side - 2 * pad;
  const left = ox + pad;
  const right = ox + side - pad;
  const top = oy + pad;
  const bottom = oy + side - pad;

  // The rules: the left column's left edge and the right column's right edge.
  const rule = Math.max(1, Math.round(k));
  ctx.fillStyle = palette.ink;
  ctx.fillRect(Math.round(left - rule / 2), Math.round(top), rule, Math.round(inner));
  ctx.fillRect(Math.round(right - rule / 2), Math.round(top), rule, Math.round(inner));

  // The logomark, top left inside the column's padding.
  const logo = logoIn(palette.ink);
  if (logo && logo.complete && logo.naturalWidth > 0) {
    ctx.drawImage(logo, left + COL_PAD * k, top, LOGO_W * k, LOGO_H * k);
  }

  // The type: 8 units, the cap height trimmed to the padding edges (Figma's
  // text-box-trim), which the alphabetic baseline approximates.
  const size = TEXT * k;
  ctx.fillStyle = palette.ink;
  ctx.font = `400 ${size}px "${FONT_FAMILY}", "Suisse Intl", system-ui, sans-serif`;
  ctx.textBaseline = 'alphabetic';
  const capRise = size * 0.72;
  const textLeft = left + COL_PAD * k;
  const textRight = right - COL_PAD * k;

  ctx.textAlign = 'left';
  ctx.fillText(`(${cardRgb.map((v) => Math.round(v)).join(', ')})`, textLeft, bottom);

  ctx.textAlign = 'right';
  ctx.fillText('Lightspark', textRight, top + capRise);
  ctx.fillText('Cards Playground', textRight, top + capRise + size);
  ctx.fillText('docs.lightspark.com', textRight, bottom);
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

export interface ComposeOptions {
  palette: Palette;
  cardColor: string;
}

/** The template, then the card over it, onto `target` (made if absent). */
export function compose(
  frame: ExportFrame,
  opts: ComposeOptions,
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
  paintTemplate(ctx, frame.width, frame.height, opts.palette, hexToRgb(opts.cardColor));
  ctx.drawImage(card, 0, 0);
  return target;
}

/** Encode a canvas. WebP where the browser can (smaller, and X and iMessage
 *  take it), else PNG; a PNG over the crawlers' 5 MB is re-encoded as JPEG. */
export async function encodeCanvas(canvas: HTMLCanvasElement): Promise<Blob> {
  const toBlob = (type: string, quality?: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  const webp = await toBlob('image/webp', 0.92);
  if (webp && webp.type === 'image/webp') return webp;
  const png = webp ?? (await toBlob('image/png'));
  if (!png) throw new Error('encode-failed');
  if (png.size <= 4.5 * 1024 * 1024) return png;
  const jpeg = await toBlob('image/jpeg', 0.92);
  return jpeg ?? png;
}
