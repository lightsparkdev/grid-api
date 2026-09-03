/**
 * Paints the card's two faces (the albedo maps) from the design and the
 * cardholder data. Layout follows the Figma card spec (1536-wide artboard):
 * the front carries only the brand and the chip (the physical front spec,
 * "chip only"); the back follows the Thales print sample (1:116) and carries
 * the name, number, expiry, code, and the Visa mark.
 */

import { CARD_H, CARD_W, fig } from '@/apps/card/cardMetrics';
import { CARD_CVV, CARD_EXP, PAN_GROUPS } from '@/apps/shared/card/cardholder';
import { isBare, materialOf, stockOf, type CardDesign } from '@/data/design';
import { CARD_FONT_FAMILY, loadCardFont } from './cardFont';

export const TEX_W = 2048;
export const TEX_H = Math.round((TEX_W * CARD_H) / CARD_W);
/** Card px → texels. */
export const K = TEX_W / CARD_W;
/** Figma spec px → texels. */
export const F = (px: number) => fig(px) * K;

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
 * a 197 × 149 module at (172, 334).
 */
const CHIP_W = F(197);
export const CHIP_H = F(149);
export const CHIP = {
  x: F(172),
  y: F(334),
  w: CHIP_W,
  r: CHIP_W * (19.5 / 151),
};
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
const LOCKUP_W = F(339);
const LOCKUP_H = F(211.067);
export const LOCKUP = {
  w: LOCKUP_W,
  h: LOCKUP_H,
  x: TEX_W - F(54) - LOCKUP_W,
  y: TEX_H - F(54) - LOCKUP_H,
};
/** The mag stripe bleeds from the top edge to 300 (72 of bleed plus the 228 stripe). */
export const STRIPE = { y: 0, h: F(300) };

/* ── Assets ───────────────────────────────────────────────────────────────── */

export interface FaceAssets {
  lockup: HTMLImageElement;
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
      loadImage('/assets/card/contactless.svg'),
      loadImage('/assets/card/grain-normal.png'),
      loadImage('/assets/card/grain-rough.png'),
      loadCardFont().catch(() => undefined),
    ]).then(([lockup, contactless, grainNormal, grainRough]) => {
      if (!lockup || !contactless || !grainNormal || !grainRough) throw new Error('card face assets missing');
      return { lockup, contactless, grainNormal, grainRough };
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

/** Draw `img` scaled into `w × h`, filled with `color` (alpha from the image).
 *  `band` limits the draw to a vertical slice of the image, as fractions of
 *  its height, so one artwork can carry two materials. */
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
  const c = makeCanvas(Math.ceil(w), Math.ceil(h));
  const t = c.getContext('2d')!;
  t.drawImage(img, 0, 0, w, h);
  t.globalCompositeOperation = 'source-in';
  t.fillStyle = typeof color === 'function' ? color(t, w, h) : color;
  t.fillRect(0, 0, c.width, c.height);
  const y0 = Math.round(h * band[0]);
  const y1 = Math.round(h * band[1]);
  ctx.drawImage(c, 0, y0, c.width, y1 - y0, x, y + y0, c.width, y1 - y0);
}

/** The lockup artwork is DEBIT (top) over VISA (bottom); the split between them. */
export const LOCKUP_SPLIT = 0.36;

/** Draw `img`'s alpha grown outward by `radius` (in the destination's units),
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
 *  (0.65 mm in spec px), where the stamp laid the film. */
export const FOIL_CARRIER = F(0.65 * 17.94);

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Chip plate path in texels (caller fills or strokes). */
export function chipPlatePath(ctx: CanvasRenderingContext2D) {
  roundRectPath(ctx, CHIP.x, CHIP.y, CHIP.w, CHIP_H, CHIP.r);
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

/** Draw `img` covering the whole face (object-fit: cover, centered). */
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
  const r = Math.max(TEX_W / img.width, TEX_H / img.height);
  const w = img.width * r;
  const h = img.height * r;
  ctx.drawImage(img, (TEX_W - w) / 2, (TEX_H - h) / 2, w, h);
}

/**
 * The face's ground. With no print, the bare stock shows: PVC in its own
 * color, or the steel. A printed face is the solid color, or the uploaded art
 * on the front. The studio does all the shading.
 */
function paintBase(ctx: CanvasRenderingContext2D, design: CardDesign, front: boolean, art: HTMLImageElement | null) {
  if (art && front) {
    drawCover(ctx, art);
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
}

/** Ink that reads on the face: white on print and on dark stock, near-black
 *  on light stock. Art is treated as dark. */
export function inkFor(design: CardDesign, art: HTMLImageElement | null): string {
  if (art) return '#ffffff';
  if (isBare(design) && stockOf(design).ink === 'dark') return '#26262b';
  return '#ffffff';
}

function paintState(ctx: CanvasRenderingContext2D, frozen: boolean, closed: boolean) {
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
/** Silver foil would vanish on bare metal or a light bare stock; the standards
 *  allow a black foil PVBM with a black printed identifier, which is what
 *  metal cards use. */
export function foilIsBlack(design: CardDesign): boolean {
  return (isBare(design) && materialOf(design) === 'metal') || inkFor(design, null) !== '#ffffff';
}

function paintLockup(ctx: CanvasRenderingContext2D, assets: FaceAssets, black: boolean) {
  const identifier = black ? '#2a2a2e' : '#cfd0d5';
  drawTinted(ctx, assets.lockup, LOCKUP.x, LOCKUP.y, LOCKUP.w, LOCKUP.h, identifier, [0, LOCKUP_SPLIT]);
  if (black) {
    drawTinted(ctx, assets.lockup, LOCKUP.x, LOCKUP.y, LOCKUP.w, LOCKUP.h, '#1c1c20', [LOCKUP_SPLIT, 1]);
    return;
  }
  // Silver foil: the mark itself is the foil layer (`FoilMark`), which sits
  // over this; the clear carrier film around it is in the surface maps only
  // (glossy, a hair proud), not in the print. Under the foil, paint its tone
  // so its anti-aliased edge blends.
  drawTinted(ctx, assets.lockup, LOCKUP.x, LOCKUP.y, LOCKUP.w, LOCKUP.h, '#d8d8dc', [LOCKUP_SPLIT, 1]);
}

/** The Visa mark's shape alone (the foil band of the lockup), white on
 *  transparent at texel size, for the foil layer's alpha. */
export function paintLockupMask(assets: FaceAssets): HTMLCanvasElement {
  const c = makeCanvas(Math.ceil(LOCKUP.w), Math.ceil(LOCKUP.h));
  const ctx = c.getContext('2d')!;
  drawTinted(ctx, assets.lockup, 0, 0, LOCKUP.w, LOCKUP.h, '#ffffff', [LOCKUP_SPLIT, 1]);
  return c;
}

/** The foil's reflectance: silver, even; its room does the shading. */
export function paintFoilAlbedo(): HTMLCanvasElement {
  const w = Math.ceil(LOCKUP.w);
  const h = Math.ceil(LOCKUP.h);
  const c = makeCanvas(w, h);
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#f4f4f6';
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
    g.addColorStop(0, 'rgba(255,255,255,0.05)');
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
  const strength = 3;
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

/** Silver (nickel-plated) contact module; the material makes it metal. */
function paintChip(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(CHIP.x, CHIP.y, CHIP.x + CHIP.w, CHIP.y + CHIP_H);
  g.addColorStop(0, '#c9cacf');
  g.addColorStop(0.5, '#e9eaee');
  g.addColorStop(1, '#b9bbc1');
  ctx.fillStyle = g;
  chipPlatePath(ctx);
  ctx.fill();
  ctx.lineWidth = 1.1 * K;
  ctx.strokeStyle = 'rgba(40, 42, 48, 0.7)';
  chipContactsPath(ctx);
  ctx.stroke();
  ctx.lineWidth = 0.8 * K;
  ctx.strokeStyle = 'rgba(30, 32, 38, 0.55)';
  chipPlatePath(ctx);
  ctx.stroke();
}

/* ── Faces ────────────────────────────────────────────────────────────────── */

/** Brand placement from the Thales print sample (Figma vgVxXUAcCwNUKjX1xdDIFl,
 *  1:97): on the chip's row, right-aligned to the chip's own inset (152), the
 *  logo 90 tall and up to 410 wide, centered on the chip's height. */
const BRAND_RIGHT = TEX_W - F(152);
const BRAND_CENTER_Y = CHIP.y + CHIP_H / 2;
const BRAND_LOGO_H = F(90);
const BRAND_LOGO_MAX_W = F(410);
const BRAND_TEXT_PX = F(72);
const BRAND_TEXT_WEIGHT = 430;

/** Where the logo lands, in texels. */
function logoRect(logo: HTMLImageElement) {
  const r = Math.min(BRAND_LOGO_MAX_W / logo.width, BRAND_LOGO_H / logo.height);
  const w = logo.width * r;
  const h = logo.height * r;
  return { x: BRAND_RIGHT - w, y: BRAND_CENTER_Y - h / 2, w, h };
}

/**
 * The brand's shape in white on a transparent canvas: the logo's alpha, or the
 * program name as a wordmark. Both the albedo (for foil) and the surface maps
 * (for spot gloss and foil) are cut from this.
 */
export function paintBrandMask(design: CardDesign, logo: HTMLImageElement | null): HTMLCanvasElement {
  const c = makeCanvas(TEX_W, TEX_H);
  const ctx = c.getContext('2d')!;
  if (logo) {
    const r = logoRect(logo);
    ctx.drawImage(logo, r.x, r.y, r.w, r.h);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, TEX_W, TEX_H);
  } else {
    ctx.fillStyle = '#fff';
    ctx.font = `${BRAND_TEXT_WEIGHT} ${BRAND_TEXT_PX}px ${FONT}`;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'right';
    // Center the cap height (about 0.7 em) on the chip's row.
    ctx.fillText(design.programName.trim() || 'Your brand', BRAND_RIGHT, BRAND_CENTER_Y + BRAND_TEXT_PX * 0.35);
  }
  return c;
}

/** The art's alpha as a mask (cover-fit), for spot gloss over art. */
export function paintArtMask(art: HTMLImageElement): HTMLCanvasElement {
  const c = makeCanvas(TEX_W, TEX_H);
  const ctx = c.getContext('2d')!;
  drawCover(ctx, art);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, TEX_W, TEX_H);
  return c;
}

/** Foil reflectance for a hot-stamped logo, silver or gold, with the
 *  bright-to-dark run a foil shows at one angle. */
function foilGradient(ctx: CanvasRenderingContext2D, kind: 'foilSilver' | 'foilGold'): CanvasGradient {
  const g = ctx.createLinearGradient(0, 0, TEX_W, TEX_H);
  if (kind === 'foilGold') {
    g.addColorStop(0, '#f6e3a8');
    g.addColorStop(0.55, '#d9b86a');
    g.addColorStop(1, '#a8823a');
  } else {
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.55, '#f2f2f5');
    g.addColorStop(1, '#d9d9de');
  }
  return g;
}

export interface FrontState {
  design: CardDesign;
  logo: HTMLImageElement | null;
  /** Uploaded card art, if any. */
  art: HTMLImageElement | null;
  frozen: boolean;
  closed: boolean;
}

export function paintFront(ctx: CanvasRenderingContext2D, s: FrontState) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  paintBase(ctx, s.design, false, s.art);
  const ink = inkFor(s.design, s.art);

  // Brand: the logo as uploaded, or the wordmark in ink; a foil treatment
  // replaces either with the foil's reflectance in the same shape.
  const t = s.design.logoTreatment;
  if (t === 'foilSilver' || t === 'foilGold') {
    const mask = paintBrandMask(s.design, s.logo);
    const m = mask.getContext('2d')!;
    m.globalCompositeOperation = 'source-in';
    m.fillStyle = foilGradient(m, t);
    m.fillRect(0, 0, TEX_W, TEX_H);
    ctx.drawImage(mask, 0, 0);
  } else if (s.logo) {
    const r = logoRect(s.logo);
    ctx.drawImage(s.logo, r.x, r.y, r.w, r.h);
  } else {
    ctx.fillStyle = ink;
    ctx.font = `${BRAND_TEXT_WEIGHT} ${BRAND_TEXT_PX}px ${FONT}`;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'right';
    ctx.fillText(s.design.programName.trim() || 'Your brand', BRAND_RIGHT, BRAND_CENTER_Y + BRAND_TEXT_PX * 0.35);
    ctx.textAlign = 'left';
  }

  paintChip(ctx);
  // The front carries nothing personal: the number, name, and codes are all
  // on the back, as the Figma physical front spec ("chip only") has it.

  paintState(ctx, s.frozen, s.closed);
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
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  paintBase(ctx, s.design, true, null);
  const ink = inkFor(s.design, null);

  // Mag stripe, bleeding to the top edge (Thales sample 1:116).
  ctx.fillStyle = '#242426';
  ctx.fillRect(0, STRIPE.y, TEX_W, STRIPE.h);

  // Contactless indicator: right-aligned at 54, 90 tall.
  const ch = F(90);
  const cw = ch * (67.3435 / 90);
  drawTinted(ctx, assets.contactless, TEX_W - F(54) - cw, F(470), cw, ch, ink);

  // Account block at (56, 476): name, PAN, EXP / CVV, on 41 px lines 32 apart.
  // The name is the cardholder's as designed; the account data prints when the
  // card goes ACTIVE and stays masked until Reveal.
  const x = F(56);
  const line = F(41);
  const gap = F(32);
  let y = F(476) + line;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.font = `400 ${F(57)}px ${FONT}`;
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
    y += line + gap;
    const groupW = ctx.measureText('0000').width;
    const groupGap = F(57) * 0.28;
    const last = PAN_GROUPS.length - 1;
    PAN_GROUPS.forEach((g, i) => {
      const gx = x + i * (groupW + groupGap);
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
    cx = x + ctx.measureText('EXP 11/27').width + F(64);
    ctx.fillText('CVV ', cx, y);
    cx += ctx.measureText('CVV ').width;
    if (tail) ctx.fillText(CARD_CVV, cx, y);
    else dots(ctx, 3, cx, y, ctx.measureText('000').width);
    ctx.restore();
  }

  // Fine print at (56, 876), 22 px.
  ctx.font = `400 ${F(22)}px ${FONT}`;
  ctx.fillText('1-855-516-0103   lightspark.com/help', x, F(876) + F(16));
  ctx.fillText('Issued by Lead Bank', x, F(876) + F(16) + F(26));

  paintLockup(ctx, assets, foilIsBlack(s.design));
  paintState(ctx, s.frozen, s.closed);
}

function dots(ctx: CanvasRenderingContext2D, n: number, x: number, baseline: number, width: number) {
  const step = width / n;
  const r = F(57) * 0.09;
  ctx.beginPath();
  for (let i = 0; i < n; i++) ctx.arc(x + step * (i + 0.5), baseline - F(57) * 0.26, r, 0, Math.PI * 2);
  ctx.fill();
}
