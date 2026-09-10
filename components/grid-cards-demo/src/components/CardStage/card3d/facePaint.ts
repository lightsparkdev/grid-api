/**
 * Paints the card's two faces (the albedo maps) from the design and the
 * cardholder data. Layout follows the Figma card spec (1536-wide artboard):
 * the front carries only the brand and the chip (the physical front spec,
 * "chip only"); the back follows the Thales print sample (1:116) and carries
 * the name, number, expiry, code, and the Visa mark. With the mark printed on
 * the front instead (`visaMark: 'front'`), the back carries the dove
 * hologram where the mark was.
 *
 * Everything composed is drawn in the spec px of the face as it is held
 * (`faceSize`), through the frame in `faceFrame.ts`, so a portrait card is
 * the same painters on a tall face. The chip and the mag stripe are physical
 * and paint in the blank's texels whatever the orientation.
 */

import { faceSize } from '@/apps/card/cardMetrics';
import { CARD_CVV, CARD_EXP, PAN_GROUPS } from '@/apps/shared/card/cardholder';
import {
  brandDefaultLayout,
  isBare,
  luminance,
  materialOf,
  stockOf,
  type BrandLayout,
  type CardDesign,
  type CardGradient,
  type CardStock,
  type Orientation,
} from '@/data/design';
import { CARD_FONT_FAMILY, loadCardFont } from './cardFont';
import { F, K, specSpace, TEX_H, TEX_PER_SPEC, TEX_W, texelBounds, texelSpace, type Side, type SpecRect } from './faceFrame';

export { F, K, TEX_H, TEX_PER_SPEC, TEX_W, type SpecRect };

const FONT = `"${CARD_FONT_FAMILY}"`;

/* ── Spec geometry shared with the surface maps ───────────────────────────── */

/**
 * The contact module. This is a dual-interface card (contactless indicator on
 * the back), and dual-interface modules are the small 6-contact kind, 11 ×
 * 8.3 mm (Infineon S-MFC8.6 / coil-on-module S-COM8.4); the big 13 × 11.8 mm
 * 8-contact module is the contact-only kind. ISO/IEC 7816-2 fixes only the
 * contact positions: left column 10.25–12.25 mm from the left edge, right
 * column 17.87–19.87, so the module is centered at x 15.06 mm; rows C1–C3 put
 * its center at about y 22.8 mm. At 17.94 px/mm on the spec artboard that is
 * a 197 × 149 module at (172, 334). Physical: in the blank's frame, texels.
 */
const CHIP_W = F(197);
export const CHIP_H = F(149);
export const CHIP = {
  x: F(172),
  y: F(334),
  w: CHIP_W,
  r: CHIP_W * (19.5 / 151),
};
/** The chip's box in the blank's spec px, for the composed layouts to keep
 *  clear of (`chipBox` gives it in the composed face). */
export const CHIP_SPEC = { x: 172, y: 334, w: 197, h: 149 };
/** Z card chip geometry (viewBox 151 × 101), fitted to the module: a little
 *  taller than drawn, as 6-contact pads are. */
export const CHIP_SCALE = CHIP.w / 151;
export const CHIP_SCALE_Y = CHIP_H / 101;
export const CHIP_CONTACTS = {
  xs: [8.5, 83.5332],
  ys: [8.5, 37.8633, 67.2266],
  w: 58.0332,
  h: 24.3633,
  r: 12.1816,
};
/** The Visa lockup's box: 339 × 211.067 spec px, 54 from the right and
 *  bottom on either face (`lockupBox`). `LOCKUP` is its size in texels, for
 *  the foil layer's own canvases. */
export const LOCKUP_SPEC = { w: 339, h: 211.067, inset: 54 };
export const LOCKUP = { w: F(LOCKUP_SPEC.w), h: F(LOCKUP_SPEC.h) };
export function lockupBox(o: Orientation): SpecRect {
  const face = faceSize(o);
  return {
    w: LOCKUP_SPEC.w,
    h: LOCKUP_SPEC.h,
    x: face.w - LOCKUP_SPEC.inset - LOCKUP_SPEC.w,
    y: face.h - LOCKUP_SPEC.inset - LOCKUP_SPEC.h,
  };
}
/** The mag stripe bleeds from the top edge to 300 (72 of bleed plus the 228
 *  stripe). Physical: the blank's top edge, texels; on a portrait back it
 *  runs down the left edge (`STRIPE_SPEC` in from that edge). */
export const STRIPE = { y: 0, h: F(300) };
export const STRIPE_SPEC = 300;

/** Spec px per mm (1536 px across an 85.6 mm card). */
export const SPEC_PER_MM = 1536 / 85.6;

/** The fine print's last baseline ("Issued by Lead Bank"): its type set in
 *  from the bottom edge by the same 56 it is set in from the left, its
 *  descenders 15% of the em. Spec px of the composed face. */
export function finePrintBaseline(o: Orientation): number {
  return faceSize(o).h - 56 - backLayout(o).finePrintPx * 0.15;
}

/**
 * The chip's box in the composed face's spec px: where the blank puts it,
 * seen the way the card is held. Upright, it is at the top, right of center,
 * its contacts running down.
 */
export function chipBox(o: Orientation): SpecRect {
  const c = CHIP_SPEC;
  if (o === 'landscape') return { x: c.x, y: c.y, w: c.w, h: c.h };
  const face = faceSize(o);
  return { x: face.w - (c.y + c.h), y: c.x, w: c.h, h: c.w };
}

/**
 * The back's composition per orientation, in spec px: where the account
 * block starts, how the PAN wraps, where the CVV goes, the contactless
 * indicator, and the fine print's lines. Landscape is the Thales sample:
 * the block at (56, 476) under the stripe, four PAN groups on one line, the
 * CVV after the expiry. Upright, the stripe takes the left 300, so the
 * column starts 56 in from it; the four groups need 596 and the column has
 * 551, so the PAN wraps to two lines of two and the CVV is right-aligned to
 * the column; the fine print takes three lines, a step smaller, to clear the
 * lockup beside it.
 */
export interface BackLayout {
  x: number;
  y: number;
  panPerRow: number;
  /** The CVV's right edge, or null to follow the expiry with a gap. */
  cvvRight: number | null;
  contactless: { right: number; y: number };
  finePrint: string[];
  /** The fine print's type size and leading, spec px. */
  finePrintPx: number;
  finePrintLead: number;
}
export function backLayout(o: Orientation): BackLayout {
  const face = faceSize(o);
  if (o === 'landscape') {
    return {
      x: 56,
      y: 476,
      panPerRow: 4,
      cvvRight: null,
      contactless: { right: face.w - 54, y: 470 },
      finePrint: ['1-855-516-0103   lightspark.com/help', 'Issued by Lead Bank'],
      finePrintPx: 22,
      finePrintLead: 26,
    };
  }
  return {
    x: STRIPE_SPEC + 56,
    y: 640,
    panPerRow: 2,
    cvvRight: face.w - 56,
    contactless: { right: face.w - 54, y: 54 },
    finePrint: ['1-855-516-0103', 'lightspark.com/help', 'Issued by Lead Bank'],
    finePrintPx: 20,
    finePrintLead: 24,
  };
}

/**
 * The dove hologram's box, in the composed face's spec px: the silhouetted
 * dove is die-cut to its own outline (no window), 9.5 mm tall as on a real
 * card, right-aligned to the back's 54 inset with its bottom on the fine
 * print's baseline, where the foil mark sits (it stands in for the PVBM,
 * which carries its own anti-counterfeit features). Clear of the stripe, the
 * contactless indicator, and the account block. The width follows the
 * artwork's aspect.
 */
export const DOVE_MM = 9.5;
export const DOVE_H = DOVE_MM * SPEC_PER_MM;
/** The artwork's box has a little air under the tail; drop it this far (spec
 *  px) so the tail itself sits on the baseline. */
const DOVE_DROP = 8;
/** The dove's size in spec px, from the artwork's aspect. */
export function doveSize(dove: HTMLImageElement): { w: number; h: number } {
  return { w: DOVE_H * ((dove.naturalWidth || 3) / (dove.naturalHeight || 4)), h: DOVE_H };
}
export function doveBox(dove: HTMLImageElement, o: Orientation): SpecRect {
  const { w, h } = doveSize(dove);
  const face = faceSize(o);
  return { x: face.w - LOCKUP_SPEC.inset - w, y: finePrintBaseline(o) - h + DOVE_DROP, w, h };
}

/* ── Assets ───────────────────────────────────────────────────────────────── */

export interface FaceAssets {
  lockup: HTMLImageElement;
  /** The silo dove silhouette, for the hologram layer. */
  dove: HTMLImageElement;
  contactless: HTMLImageElement;
  /** The Z card's beadblast grain, as tileable normal and roughness patches
   *  (pure noise has no spatial correlation, so the tiling is invisible). */
  grainNormal: HTMLImageElement;
  grainRough: HTMLImageElement;
}

export function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

let assetsPromise: Promise<FaceAssets> | null = null;
export function loadFaceAssets(): Promise<FaceAssets> {
  if (!assetsPromise) {
    assetsPromise = Promise.all([
      loadImage('/assets/card/visa-debit-lockup.svg'),
      loadImage('/assets/card/visa-dove.svg'),
      loadImage('/assets/card/contactless.svg'),
      loadImage('/assets/card/grain-normal.png'),
      loadImage('/assets/card/grain-rough.png'),
      loadCardFont().catch(() => undefined),
    ]).then(([lockup, dove, contactless, grainNormal, grainRough]) => {
      if (!lockup || !dove || !contactless || !grainNormal || !grainRough) throw new Error('card face assets missing');
      return { lockup, dove, contactless, grainNormal, grainRough };
    });
  }
  return assetsPromise;
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

export function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

/** The uniform scale of `ctx`'s current transform: how many device px one
 *  of its units is, so an intermediate canvas can be built at full
 *  resolution whatever frame the caller draws in. */
function ctmScale(ctx: CanvasRenderingContext2D): number {
  const m = ctx.getTransform();
  return Math.hypot(m.a, m.b) || 1;
}

/** Draw `img` scaled into `w × h`, filled with `color` (alpha from the image).
 *  `band` limits the draw to a vertical slice of the image, as fractions of
 *  its height, so one artwork can carry two materials. Units are the
 *  context's; the tinted copy is rendered at the context's resolution. */
export function drawTinted(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string | ((t: CanvasRenderingContext2D, w: number, h: number) => string | CanvasGradient),
  band: [number, number] = [0, 1],
) {
  const s = ctmScale(ctx);
  const cw = Math.ceil(w * s);
  const chh = Math.ceil(h * s);
  const c = makeCanvas(cw, chh);
  const t = c.getContext('2d')!;
  t.drawImage(img, 0, 0, w * s, h * s);
  t.globalCompositeOperation = 'source-in';
  t.fillStyle = typeof color === 'function' ? color(t, cw, chh) : color;
  t.fillRect(0, 0, cw, chh);
  const y0 = Math.round(h * s * band[0]);
  const y1 = Math.round(h * s * band[1]);
  ctx.drawImage(c, 0, y0, cw, y1 - y0, x, y + y0 / s, cw / s, (y1 - y0) / s);
}

/** The lockup artwork is DEBIT (top) over VISA (bottom); the split between them. */
export const LOCKUP_SPLIT = 0.36;

/** Draw `img`'s alpha grown outward by `radius` (in the context's units),
 *  filled with `color`: the union of the shape shifted around a circle. */
export function drawDilated(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  radius: number,
  band: [number, number] = [0, 1],
) {
  const steps = 16;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    drawTinted(ctx, img, x + Math.cos(a) * radius, y + Math.sin(a) * radius, w, h, color, band);
  }
  drawTinted(ctx, img, x, y, w, h, color, band);
}

/** The foil's carrier: a clear layer around the mark, this far outside it
 *  (0.65 mm, spec px), where the stamp laid the film. */
export const FOIL_CARRIER = 0.65 * SPEC_PER_MM;

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Chip plate path in texels (caller fills or strokes). */
export function chipPlatePath(ctx: CanvasRenderingContext2D) {
  roundRectPath(ctx, CHIP.x, CHIP.y, CHIP.w, CHIP_H, CHIP.r);
}

/** The module is glued into a milled pocket a hair larger than its plate;
 *  the gap shows as a hairline all the way round. About 0.15 mm. */
export const CHIP_GAP = F(0.15 * 17.94);

/** The pocket's outline in texels: the plate grown by the gap. */
export function chipPocketPath(ctx: CanvasRenderingContext2D) {
  roundRectPath(ctx, CHIP.x - CHIP_GAP, CHIP.y - CHIP_GAP, CHIP.w + CHIP_GAP * 2, CHIP_H + CHIP_GAP * 2, CHIP.r + CHIP_GAP);
}

/** The 2 × 3 contact outlines in texels (one path). */
export function chipContactsPath(ctx: CanvasRenderingContext2D) {
  const sx = CHIP_SCALE;
  const sy = CHIP_SCALE_Y;
  ctx.beginPath();
  for (const cx of CHIP_CONTACTS.xs) {
    for (const cy of CHIP_CONTACTS.ys) {
      ctx.roundRect(
        CHIP.x + cx * sx,
        CHIP.y + cy * sy,
        CHIP_CONTACTS.w * sx,
        CHIP_CONTACTS.h * sy,
        CHIP_CONTACTS.r * sx,
      );
    }
  }
}

/* ── Base ─────────────────────────────────────────────────────────────────── */

/** Draw `img` covering the whole composed face (object-fit: cover, centered);
 *  the context is in the face's spec px. */
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, face: { w: number; h: number }) {
  // An SVG with no intrinsic size reports 0 (or a 300 x 150 default); it is
  // vector, so let it take the face's own proportions and fill it.
  const iw = img.naturalWidth || face.w;
  const ih = img.naturalHeight || face.h;
  const r = Math.max(face.w / iw, face.h / ih);
  const w = iw * r;
  const h = ih * r;
  ctx.drawImage(img, (face.w - w) / 2, (face.h - h) / 2, w, h);
}

/**
 * The face's ground. With no print, the bare stock shows: PVC in its own
 * color, or the steel. A printed face is the solid color, or the uploaded art
 * on the front. The studio does all the shading. Leaves the context in
 * texels.
 */
function paintBase(ctx: CanvasRenderingContext2D, design: CardDesign, side: Side, art: HTMLImageElement | null) {
  const o = design.orientation;
  const face = faceSize(o);
  texelSpace(ctx);
  if (art && side === 'front') {
    specSpace(ctx, o, side);
    drawCover(ctx, art, face);
    texelSpace(ctx);
    return;
  }
  if (isBare(design)) {
    ctx.fillStyle = stockOf(design).face;
    ctx.fillRect(0, 0, TEX_W, TEX_H);
    return;
  }
  // A solid print; the studio does the shading.
  ctx.fillStyle = design.color!;
  ctx.fillRect(0, 0, TEX_W, TEX_H);
  if (design.gradient) {
    specSpace(ctx, o, side);
    ctx.fillStyle = gradientPaint(ctx, design.gradient, face, side);
    ctx.fillRect(0, 0, face.w, face.h);
    texelSpace(ctx);
  }
}

/**
 * The gradient print as a canvas gradient in the composed face's spec px.
 * The back is seen from behind, so its x is flipped here and the gradient
 * reads the same way round from either side, as a card printed with one
 * artwork on both faces does.
 */
function gradientPaint(
  ctx: CanvasRenderingContext2D,
  g: CardGradient,
  face: { w: number; h: number },
  side: Side,
): CanvasGradient {
  const px = (p: { x: number; y: number }) => ({ x: side === 'front' ? p.x : face.w - p.x, y: p.y });
  const a = px(g.from);
  const b = px(g.to);
  const grad =
    g.type === 'radial'
      ? ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, Math.max(1, Math.hypot(b.x - a.x, b.y - a.y)))
      : ctx.createLinearGradient(a.x, a.y, b.x, b.y);
  for (const s of [...g.stops].sort((p, q) => p.at - q.at)) grad.addColorStop(Math.min(1, Math.max(0, s.at)), s.color);
  return grad;
}

/** `a` toward `b` by `t`, both #rrggbb. */
export function mixHex(a: string, b: string, t: number): string {
  const ch = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  const c = [0, 1, 2].map((i) => Math.round(ch(a, i) + (ch(b, i) - ch(a, i)) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** The color of the face's ground: the print, or the bare stock. */
function faceColorOf(design: CardDesign): string {
  return isBare(design) ? stockOf(design).face : design.color!;
}

/** The mag stripe is the face's own color, deepened a fifth toward black. */
function stripeFor(design: CardDesign): string {
  return mixHex(faceColorOf(design), '#000000', 0.2);
}

/** Ink that reads on the face: near-black on a light print or light stock,
 *  white otherwise. Art is treated as dark. */
export function inkFor(design: CardDesign, art: HTMLImageElement | null): string {
  if (art) return '#ffffff';
  if (isBare(design)) return stockOf(design).ink === 'dark' ? '#26262b' : '#ffffff';
  return luminance(design.color!) > 0.6 ? '#26262b' : '#ffffff';
}

/** Whole-face washes, in texels. */
function paintState(ctx: CanvasRenderingContext2D, frozen: boolean, closed: boolean) {
  texelSpace(ctx);
  if (closed) {
    ctx.globalCompositeOperation = 'saturation';
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, TEX_W, TEX_H);
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, TEX_W, TEX_H);
    ctx.globalCompositeOperation = 'source-over';
  } else if (frozen) {
    ctx.globalCompositeOperation = 'saturation';
    ctx.fillStyle = 'rgba(128,128,128,0.7)';
    ctx.fillRect(0, 0, TEX_W, TEX_H);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(235,245,255,0.42)';
    ctx.fillRect(0, 0, TEX_W, TEX_H);
  }
}

/* ── Foil + chip albedo ───────────────────────────────────────────────────── */

/** The Premium Visa Brand Mark in silver foil, with the DEBIT product
 *  identifier printed in silver ink above it (Visa Physical Card Brand
 *  Standards, January 2026: "silver foil PVBM, printed silver product
 *  identifier"). The surface maps make the mark a mirror and the identifier
 *  flat. */
/** Silver foil vanishes on bare metal and fights a light face. The standards
 *  (Visa Physical Card Brand Standards, January 2026) allow a black foil
 *  PVBM with a black printed identifier, which is what light and metal cards
 *  use: the foil reads by its gloss and bevel rather than its brightness. */
export function foilIsBlack(design: CardDesign): boolean {
  return (isBare(design) && materialOf(design) === 'metal') || inkFor(design, null) !== '#ffffff';
}

/** The foil's own tone, silver or black lacquer. */
export function foilTone(black: boolean): string {
  return black ? '#26262a' : '#f4f4f6';
}

/** The lockup on the back, in the composed face's spec px. */
function paintLockup(ctx: CanvasRenderingContext2D, assets: FaceAssets, black: boolean, o: Orientation) {
  const L = lockupBox(o);
  specSpace(ctx, o, 'back');
  // The identifier prints as a translucent white on a dark or saturated
  // face (a flat gray there reads as dirt), black with the black foil.
  const identifier = black ? 'rgba(42, 42, 46, 1)' : 'rgba(255, 255, 255, 0.85)';
  drawTinted(ctx, assets.lockup, L.x, L.y, L.w, L.h, identifier, [0, LOCKUP_SPLIT]);
  // The mark itself is the foil layer (`FoilMark`), which sits over this; the
  // clear carrier film around it is in the surface maps only (glossy, a hair
  // proud), not in the print. Under the foil, paint its tone so its
  // anti-aliased edge blends.
  drawTinted(ctx, assets.lockup, L.x, L.y, L.w, L.h, black ? '#1c1c20' : '#d8d8dc', [LOCKUP_SPLIT, 1]);
  texelSpace(ctx);
}

/** The Visa mark's shape alone (the foil band of the lockup), white on
 *  transparent at texel size, for the foil layer's alpha. The layer's plane
 *  turns with the card, so this is the same either way up. */
export function paintLockupMask(assets: FaceAssets): HTMLCanvasElement {
  const c = makeCanvas(Math.ceil(LOCKUP.w), Math.ceil(LOCKUP.h));
  const ctx = c.getContext('2d')!;
  drawTinted(ctx, assets.lockup, 0, 0, LOCKUP.w, LOCKUP.h, '#ffffff', [LOCKUP_SPLIT, 1]);
  return c;
}

/**
 * The Visa Brand Mark and DEBIT printed flat on the front, in the face's ink
 * (the standards allow the VBM in white or black in any corner, front or
 * back), in the corner the foil mark takes on the back. No foil and no
 * carrier film: this is ink on the print. Never chip-aligned, so the PVBM
 * rule for that configuration does not arise on either face.
 */
function paintFrontLockup(ctx: CanvasRenderingContext2D, assets: FaceAssets, ink: string, o: Orientation) {
  const L = lockupBox(o);
  specSpace(ctx, o, 'front');
  drawTinted(ctx, assets.lockup, L.x, L.y, L.w, L.h, ink);
  texelSpace(ctx);
}

/** The front lockup's shape, white on transparent at face size, for the
 *  surface bake: on bare steel the ink is a flat print, not metal. */
export function paintFrontLockupMask(assets: FaceAssets, o: Orientation): HTMLCanvasElement {
  const c = makeCanvas(TEX_W, TEX_H);
  const ctx = c.getContext('2d')!;
  paintFrontLockup(ctx, assets, '#ffffff', o);
  return c;
}

/** Under the hologram layer (`HoloDove`), the dove's outline in its silver,
 *  so the layer's anti-aliased edge blends into the face. */
function paintDoveGround(ctx: CanvasRenderingContext2D, assets: FaceAssets, o: Orientation) {
  const b = doveBox(assets.dove, o);
  specSpace(ctx, o, 'back');
  drawTinted(ctx, assets.dove, b.x, b.y, b.w, b.h, '#c9c9ce');
  texelSpace(ctx);
}

/** The foil's reflectance: silver or black lacquer, even; its room does the
 *  shading. */
export function paintFoilAlbedo(black: boolean): HTMLCanvasElement {
  const w = Math.ceil(LOCKUP.w);
  const h = Math.ceil(LOCKUP.h);
  const c = makeCanvas(w, h);
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = foilTone(black);
  ctx.fillRect(0, 0, w, h);
  return c;
}

/**
 * The foil's relief, as a tangent-space normal map at texel size: a bevel
 * about 0.15 mm wide where the stamped letters step down to the card, and a
 * faint low-frequency waviness across their faces (the film never lies
 * perfectly flat), which is what bends a reflection and makes it read as
 * foil rather than chrome.
 */
export function paintFoilNormal(assets: FaceAssets): HTMLCanvasElement {
  const w = Math.ceil(LOCKUP.w);
  const h = Math.ceil(LOCKUP.h);
  const bevel = F(0.15 * 17.94);
  // Height: the mark, edges softened over the bevel's width.
  const height = makeCanvas(w, h);
  const hc = height.getContext('2d')!;
  hc.fillStyle = '#000000';
  hc.fillRect(0, 0, w, h);
  hc.filter = `blur(${bevel / 2}px)`;
  drawTinted(hc, assets.lockup, 0, 0, LOCKUP.w, LOCKUP.h, '#ffffff', [LOCKUP_SPLIT, 1]);
  hc.filter = 'none';
  // Waviness: a few broad, shallow bumps.
  hc.globalCompositeOperation = 'lighter';
  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 9; i++) {
    const cx = rand() * w;
    const cy = h * LOCKUP_SPLIT + rand() * h * (1 - LOCKUP_SPLIT);
    const r = (0.12 + rand() * 0.14) * w;
    const g = hc.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, 'rgba(255,255,255,0.08)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    hc.fillStyle = g;
    hc.fillRect(0, 0, w, h);
  }
  hc.globalCompositeOperation = 'source-over';

  // Sobel to a normal; canvas y runs down while v runs up.
  const src = hc.getImageData(0, 0, w, h).data;
  const out = new ImageData(w, h);
  const at = (x: number, y: number) => {
    const cx = x < 0 ? 0 : x >= w ? w - 1 : x;
    const cy = y < 0 ? 0 : y >= h ? h - 1 : y;
    return src[(cy * w + cx) * 4] / 255;
  };
  const strength = 2.2;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (at(x - 1, y) - at(x + 1, y)) * strength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      const len = Math.hypot(dx, dy, 1);
      const i = (y * w + x) * 4;
      out.data[i] = ((dx / len) * 0.5 + 0.5) * 255;
      out.data[i + 1] = ((dy / len) * 0.5 + 0.5) * 255;
      out.data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      out.data[i + 3] = 255;
    }
  }
  const c = makeCanvas(w, h);
  c.getContext('2d')!.putImageData(out, 0, 0);
  return c;
}

/** Silver (nickel-plated) contact module set in its pocket; the material
 *  makes the plate metal. `face` is the card color the pocket is cut into.
 *  Physical: the blank's texels. */
function paintChip(ctx: CanvasRenderingContext2D, face: string) {
  texelSpace(ctx);
  // The gap looks down into the pocket: the card's core in shadow, darkest
  // under the lit (upper left) side of the plate, a little lighter where the
  // far wall catches light.
  const pocket = ctx.createLinearGradient(CHIP.x, CHIP.y, CHIP.x + CHIP.w, CHIP.y + CHIP_H);
  pocket.addColorStop(0, mixHex(face, '#000000', 0.5));
  pocket.addColorStop(1, mixHex(face, '#000000', 0.28));
  ctx.fillStyle = pocket;
  chipPocketPath(ctx);
  ctx.fill();
  const g = ctx.createLinearGradient(CHIP.x, CHIP.y, CHIP.x + CHIP.w, CHIP.y + CHIP_H);
  g.addColorStop(0, '#d9dade');
  g.addColorStop(0.5, '#f4f5f8');
  g.addColorStop(1, '#cbcdd3');
  ctx.fillStyle = g;
  chipPlatePath(ctx);
  ctx.fill();
  // The contact separations are hairline grooves in the plating, a shade
  // darker, not outlines; the plate's edge is left to its relief.
  ctx.lineWidth = 0.8 * K;
  ctx.strokeStyle = 'rgba(70, 74, 82, 0.4)';
  chipContactsPath(ctx);
  ctx.stroke();
}

/* ── Faces ────────────────────────────────────────────────────────────────── */

/** The body before its print: the bare stock (PVC or steel), nothing on it
 *  and nothing set into it yet (the chip's pocket is milled after the
 *  print). A material change's first layer. */
export function paintBare(ctx: CanvasRenderingContext2D, stock: CardStock) {
  texelSpace(ctx);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = stock.face;
  ctx.fillRect(0, 0, TEX_W, TEX_H);
}

/** The print's base: its ground (color, gradient, or art) laid on the body,
 *  before the graphics. The second layer. */
export function paintBaseFront(ctx: CanvasRenderingContext2D, design: CardDesign, art: HTMLImageElement | null) {
  texelSpace(ctx);
  ctx.globalCompositeOperation = 'source-over';
  paintBase(ctx, design, 'front', art);
}

export function paintBaseBack(ctx: CanvasRenderingContext2D, design: CardDesign) {
  texelSpace(ctx);
  ctx.globalCompositeOperation = 'source-over';
  paintBase(ctx, design, 'back', null);
}

/* ── Brand ─────────────────────────────────────────────────────────────────── */

/** With no layout of its own, a wide logo is held to this (spec px), as the
 *  print sample has it; upright, a little less, so it clears the lockup
 *  beside it on the bottom row. */
const BRAND_DEFAULT_MAX_W: Record<Orientation, number> = { landscape: 410, portrait: 370 };
/** A wordmark is set at this share of its box, so its caps sit inside it. */
const BRAND_TEXT_EM = 0.8;
/** Suisse's cap height, as a share of the em. */
export const BRAND_CAP = 0.72;
export const BRAND_TEXT_WEIGHT = 430;

function wordmarkOf(design: CardDesign): string {
  return design.programName.trim() || 'Your brand';
}

let measureCtx: CanvasRenderingContext2D | null = null;
/** The wordmark's tracking, in em (the print sample sets -4%). */
export const BRAND_TRACKING = -0.04;

/** The wordmark's width at `px` (spec px), measured at that size. */
function measureWordmark(text: string, px: number): number {
  measureCtx ??= makeCanvas(1, 1).getContext('2d')!;
  measureCtx.font = `${BRAND_TEXT_WEIGHT} ${px}px ${FONT}`;
  measureCtx.letterSpacing = `${px * BRAND_TRACKING}px`;
  // The spacing after the last glyph is not part of the visible width.
  return measureCtx.measureText(text).width - px * BRAND_TRACKING;
}

/**
 * The layout the brand is drawn with: the design's own, or the orientation's
 * default placement, where a wide logo is held to its width by lowering its
 * height. This is the layout a drag starts from.
 */
export function resolveBrandLayout(design: CardDesign, logo: HTMLImageElement | null): BrandLayout {
  if (design.brandLayout) return design.brandLayout;
  const d = brandDefaultLayout(design.orientation);
  if (!logo) return d;
  const h = Math.min(d.h, (BRAND_DEFAULT_MAX_W[design.orientation] * logo.height) / logo.width);
  return h === d.h ? d : { ...d, h };
}

/**
 * The brand's box in the composed face's spec px: the logo fitted to the
 * layout's height, or the wordmark's em box with its caps centered. The
 * stage hit-tests this; the painters draw into it.
 */
export function brandBox(design: CardDesign, logo: HTMLImageElement | null): SpecRect {
  const l = resolveBrandLayout(design, logo);
  let w: number;
  let h: number;
  if (logo) {
    h = l.h;
    w = (logo.width / logo.height) * h;
  } else {
    h = l.h * BRAND_TEXT_EM;
    w = measureWordmark(wordmarkOf(design), h);
  }
  const x = l.anchor === 'left' ? l.x : l.anchor === 'center' ? l.x - w / 2 : l.x - w;
  return { x, y: l.y - h / 2, w, h };
}

/**
 * The texels the brand can touch: its box turned by its rotation, with room
 * for a wordmark's descenders and a relief's blur, clamped to the face. The
 * surface bakes work inside this so a drag can rebake every frame.
 */
export function brandRegion(design: CardDesign, logo: HTMLImageElement | null): { x: number; y: number; w: number; h: number } {
  const l = resolveBrandLayout(design, logo);
  const b = brandBox(design, logo);
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  const c = Math.abs(Math.cos((l.rotation * Math.PI) / 180));
  const s = Math.abs(Math.sin((l.rotation * Math.PI) / 180));
  // Descenders reach below the em box; the relief blurs 6 texels each way.
  const pad = (logo ? 0 : b.h * 0.3) + 24 / TEX_PER_SPEC;
  const hw = (b.w * c + b.h * s) / 2 + pad;
  const hh = (b.w * s + b.h * c) / 2 + pad;
  return texelBounds(design.orientation, 'front', { x: cx - hw, y: cy - hh, w: hw * 2, h: hh * 2 });
}

/** Draw the brand (the logo as uploaded, or the wordmark in `ink`) into its
 *  box at the layout's opacity, in the composed face's spec px. */
function drawBrand(ctx: CanvasRenderingContext2D, design: CardDesign, logo: HTMLImageElement | null, ink: string) {
  const l = resolveBrandLayout(design, logo);
  const b = brandBox(design, logo);
  ctx.save();
  specSpace(ctx, design.orientation, 'front');
  ctx.globalAlpha = l.opacity;
  if (l.rotation) {
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;
    ctx.translate(cx, cy);
    ctx.rotate((l.rotation * Math.PI) / 180);
    ctx.translate(-cx, -cy);
  }
  if (logo) {
    ctx.drawImage(logo, b.x, b.y, b.w, b.h);
  } else {
    const em = b.h;
    ctx.fillStyle = ink;
    ctx.font = `${BRAND_TEXT_WEIGHT} ${em}px ${FONT}`;
    ctx.letterSpacing = `${em * BRAND_TRACKING}px`;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    // The caps centered in the em box: baseline half a cap below its middle.
    ctx.fillText(wordmarkOf(design), b.x, b.y + b.h / 2 + (em * BRAND_CAP) / 2);
  }
  ctx.restore();
  texelSpace(ctx);
}

/**
 * The brand's shape in white on a transparent canvas: the logo's alpha, or the
 * program name as a wordmark, at the layout's opacity. Both the albedo (for
 * foil and etch) and the surface maps (for every treatment but ink) are cut
 * from this.
 */
export function paintBrandMask(design: CardDesign, logo: HTMLImageElement | null): HTMLCanvasElement {
  const c = makeCanvas(TEX_W, TEX_H);
  const ctx = c.getContext('2d')!;
  drawBrand(ctx, design, logo, '#fff');
  if (logo) {
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, TEX_W, TEX_H);
  }
  return c;
}

/** The art's alpha as a mask (cover-fit on the composed face), for spot
 *  gloss over art. */
export function paintArtMask(art: HTMLImageElement, o: Orientation): HTMLCanvasElement {
  const c = makeCanvas(TEX_W, TEX_H);
  const ctx = c.getContext('2d')!;
  specSpace(ctx, o, 'front');
  drawCover(ctx, art, faceSize(o));
  texelSpace(ctx);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, TEX_W, TEX_H);
  return c;
}

/** Silver foil reflectance for a hot-stamped logo, with the bright-to-dark
 *  run a foil shows at one angle. */
function foilGradient(ctx: CanvasRenderingContext2D): CanvasGradient {
  const g = ctx.createLinearGradient(0, 0, TEX_W, TEX_H);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.55, '#f2f2f5');
  g.addColorStop(1, '#d9d9de');
  return g;
}

/** The floor of an etched mark. On metal it is the steel itself, through any
 *  laminate; on plastic the pressed print, a shade off the color (lighter on
 *  a dark print, darker on a light one) so a blind mark reads head-on. */
function etchFloor(design: CardDesign): string {
  // The Z card's polished basin reflectance.
  if (materialOf(design) === 'metal') return '#f0efee';
  const base = design.color ?? stockOf(design).face;
  const c = (i: number) => parseInt(base.slice(1 + i * 2, 3 + i * 2), 16);
  const lum = (0.2126 * c(0) + 0.7152 * c(1) + 0.0722 * c(2)) / 255;
  const toward = lum < 0.5 ? 255 : 0;
  const t = 0.22;
  const mix = [0, 1, 2].map((i) => Math.round(c(i) + (toward - c(i)) * t));
  return `#${mix.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export interface FrontState {
  design: CardDesign;
  logo: HTMLImageElement | null;
  /** Uploaded card art, if any. */
  art: HTMLImageElement | null;
  frozen: boolean;
  closed: boolean;
}

export function paintFront(ctx: CanvasRenderingContext2D, s: FrontState, assets: FaceAssets) {
  texelSpace(ctx);
  ctx.globalCompositeOperation = 'source-over';
  paintBase(ctx, s.design, 'front', s.art);
  const ink = inkFor(s.design, s.art);

  // Brand: the logo as uploaded, or the wordmark in ink; a foil treatment
  // replaces either with the foil's reflectance in the same shape.
  const t = s.design.logoTreatment;
  if (t === 'etch') {
    const mask = paintBrandMask(s.design, s.logo);
    const m = mask.getContext('2d')!;
    m.globalCompositeOperation = 'source-in';
    m.fillStyle = etchFloor(s.design);
    m.fillRect(0, 0, TEX_W, TEX_H);
    ctx.drawImage(mask, 0, 0);
  } else if (t === 'foil') {
    const mask = paintBrandMask(s.design, s.logo);
    const m = mask.getContext('2d')!;
    m.globalCompositeOperation = 'source-in';
    m.fillStyle = foilGradient(m);
    m.fillRect(0, 0, TEX_W, TEX_H);
    ctx.drawImage(mask, 0, 0);
  } else {
    drawBrand(ctx, s.design, s.logo, ink);
  }

  paintChip(ctx, faceColorOf(s.design));
  // The front carries nothing personal: the number, name, and codes are all
  // on the back, as the Figma physical front spec ("chip only") has it.
  if (s.design.visaMark === 'front') paintFrontLockup(ctx, assets, ink, s.design.orientation);

  paintState(ctx, s.frozen, s.closed);
}

/** The account block's type and leading, spec px. */
const BACK_EM = 57;
const BACK_LINE = 41;
const BACK_GAP = 32;

/** Where the cardholder's name sits on the back, in the composed face's spec
 *  px: its em box on the account block's first line, at least as wide as the
 *  specimen text. */
export function backNameBox(design: CardDesign): SpecRect {
  measureCtx ??= makeCanvas(1, 1).getContext('2d')!;
  measureCtx.letterSpacing = '0px';
  measureCtx.font = `400 ${BACK_EM}px ${FONT}`;
  const text = design.cardholderName.trim() || 'Cardholder name';
  const w = Math.max(measureCtx.measureText(text).width, measureCtx.measureText('Cardholder name').width);
  const L = backLayout(design.orientation);
  // Baseline at the block's top + 41; the face's ascent is 85% of the em.
  return { x: L.x, y: L.y + BACK_LINE - BACK_EM * 0.85, w, h: BACK_EM };
}

export interface BackState {
  design: CardDesign;
  /** How far the personalization has printed (0 before ACTIVE, 1 once it has). */
  personalized: number;
  /** PAN groups revealed so far (0..4); 5 = expiry and CVV too. */
  shown: number;
  frozen: boolean;
  closed: boolean;
}

export function paintBack(ctx: CanvasRenderingContext2D, s: BackState, assets: FaceAssets) {
  const o = s.design.orientation;
  const L = backLayout(o);
  texelSpace(ctx);
  ctx.globalCompositeOperation = 'source-over';
  paintBase(ctx, s.design, 'back', null);
  const ink = inkFor(s.design, null);

  // Mag stripe, bleeding to the top edge (Thales sample 1:116). Physical: on
  // an upright card it runs down the left edge of the back.
  ctx.fillStyle = stripeFor(s.design);
  ctx.fillRect(0, STRIPE.y, TEX_W, STRIPE.h);

  specSpace(ctx, o, 'back');

  // Contactless indicator: right-aligned at 54, 90 tall.
  const ch = 90;
  const cw = ch * (67.3435 / 90);
  drawTinted(ctx, assets.contactless, L.contactless.right - cw, L.contactless.y, cw, ch, ink);

  // Account block: name, PAN, EXP / CVV, on 41 px lines 32 apart.
  // (`backNameBox` describes the name line's box for the stage.)
  // The name is the cardholder's as designed; the account data prints when the
  // card goes ACTIVE and stays masked until Reveal.
  const x = L.x;
  const line = BACK_LINE;
  const gap = BACK_GAP;
  let y = L.y + line;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.letterSpacing = '0px';
  ctx.font = `400 ${BACK_EM}px ${FONT}`;
  ctx.fillStyle = ink;
  // Until the visitor types a name the line reads as a specimen's does.
  const name = s.design.cardholderName.trim();
  ctx.save();
  if (!name) ctx.globalAlpha = 0.55;
  ctx.fillText(name || 'Cardholder name', x, y);
  ctx.restore();

  if (s.personalized > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, s.personalized);
    const groupW = ctx.measureText('0000').width;
    const groupGap = BACK_EM * 0.28;
    const last = PAN_GROUPS.length - 1;
    PAN_GROUPS.forEach((g, i) => {
      if (i % L.panPerRow === 0) y += line + gap;
      const gx = x + (i % L.panPerRow) * (groupW + groupGap);
      if (i < s.shown || i === last) ctx.fillText(g, gx, y);
      else dots(ctx, 4, gx, y, groupW);
    });

    y += line + gap;
    const tail = s.shown > PAN_GROUPS.length;
    ctx.fillText('EXP ', x, y);
    let cx = x + ctx.measureText('EXP ').width;
    if (tail) ctx.fillText(CARD_EXP, cx, y);
    else {
      const dw = ctx.measureText('00').width;
      dots(ctx, 2, cx, y, dw);
      ctx.fillText('/', cx + dw, y);
      dots(ctx, 2, cx + dw + ctx.measureText('/').width, y, dw);
    }
    // The CVV follows the expiry with a gap, or, in the narrow column of an
    // upright back, sits right-aligned to the column.
    cx =
      L.cvvRight === null
        ? x + ctx.measureText('EXP 11/27').width + 64
        : L.cvvRight - ctx.measureText('CVV ').width - ctx.measureText('000').width;
    ctx.fillText('CVV ', cx, y);
    cx += ctx.measureText('CVV ').width;
    if (tail) ctx.fillText(CARD_CVV, cx, y);
    else dots(ctx, 3, cx, y, ctx.measureText('000').width);
    ctx.restore();
  }

  // Fine print (22 px on 26 px lines flat), the last line on `finePrintBaseline`.
  ctx.font = `400 ${L.finePrintPx}px ${FONT}`;
  const fineLast = finePrintBaseline(o);
  L.finePrint.forEach((text, i) => {
    ctx.fillText(text, x, fineLast - L.finePrintLead * (L.finePrint.length - 1 - i));
  });
  texelSpace(ctx);

  // The foil mark, or, with the mark printed on the front, the hologram
  // window the standards require in its place.
  if (s.design.visaMark === 'back') paintLockup(ctx, assets, foilIsBlack(s.design), o);
  else paintDoveGround(ctx, assets, o);
  paintState(ctx, s.frozen, s.closed);
}

/** Masking dots in place of digits, in the composed face's spec px. */
function dots(ctx: CanvasRenderingContext2D, n: number, x: number, baseline: number, width: number) {
  const step = width / n;
  const r = BACK_EM * 0.09;
  ctx.beginPath();
  for (let i = 0; i < n; i++) ctx.arc(x + step * (i + 0.5), baseline - BACK_EM * 0.26, r, 0, Math.PI * 2);
  ctx.fill();
}
