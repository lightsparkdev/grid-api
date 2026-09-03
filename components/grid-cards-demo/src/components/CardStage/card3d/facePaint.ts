/**
 * Paints the card's two faces (the albedo maps) from the design and the
 * cardholder data. Layout follows the Figma card spec (1536-wide artboard):
 * the front from the in-app virtual card (name top-left, last 4 bottom-left,
 * lockup bottom-right) plus the physical front's chip zone; the back from
 * visa-card-back-spec-v1-premium (133:273).
 */

import { CARD_H, CARD_W, fig } from '@/apps/card/cardMetrics';
import { CARD_CVV, CARD_EXP, CARDHOLDER, PAN_GROUPS } from '@/apps/shared/card/cardholder';
import { brandStops } from '@/apps/shared/brand/brandPalette';
import type { CardDesign } from '@/data/design';

export const TEX_W = 2048;
export const TEX_H = Math.round((TEX_W * CARD_H) / CARD_W);
/** Card px → texels. */
export const K = TEX_W / CARD_W;
/** Figma spec px → texels. */
export const F = (px: number) => fig(px) * K;

const FONT = '"Suisse Intl"';
const INK = 'rgba(255, 255, 255, 0.55)';

/* ── Spec geometry shared with the surface maps ───────────────────────────── */

export const CHIP = { x: F(152), y: F(324), w: F(236), r: F(236) * (19.5 / 151) };
/** Z card chip geometry (viewBox 151 × 101), scaled to the zone width. */
export const CHIP_SCALE = CHIP.w / 151;
export const CHIP_H = 101 * CHIP_SCALE;
export const CHIP_CONTACTS = {
  xs: [8.5, 83.5332],
  ys: [8.5, 37.8633, 67.2266],
  w: 58.0332,
  h: 24.3633,
  r: 12.1816,
};
const LOCKUP_W = F(339);
const LOCKUP_H = F(211.067);
export const LOCKUP = { w: LOCKUP_W, h: LOCKUP_H, x: TEX_W - F(54) - LOCKUP_W, y: TEX_H - F(54) - LOCKUP_H };
export const STRIPE = { y: F(72), h: F(228) };

/* ── Assets ───────────────────────────────────────────────────────────────── */

export interface FaceAssets {
  lockup: HTMLImageElement;
  contactless: HTMLImageElement;
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
      typeof document !== 'undefined' && 'fonts' in document
        ? Promise.all([
            document.fonts.load(`500 ${F(57)}px ${FONT}`),
            document.fonts.load(`400 ${F(57)}px ${FONT}`),
          ]).catch(() => undefined)
        : Promise.resolve(undefined),
    ]).then(([lockup, contactless]) => {
      if (!lockup || !contactless) throw new Error('card face assets missing');
      return { lockup, contactless };
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

/** Draw `img` scaled into `w × h`, filled with `color` (alpha from the image). */
export function drawTinted(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) {
  const c = makeCanvas(Math.ceil(w), Math.ceil(h));
  const t = c.getContext('2d')!;
  t.drawImage(img, 0, 0, w, h);
  t.globalCompositeOperation = 'source-in';
  t.fillStyle = color;
  t.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(c, x, y);
}

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
  const s = CHIP_SCALE;
  ctx.beginPath();
  for (const cx of CHIP_CONTACTS.xs) {
    for (const cy of CHIP_CONTACTS.ys) {
      ctx.roundRect(CHIP.x + cx * s, CHIP.y + cy * s, CHIP_CONTACTS.w * s, CHIP_CONTACTS.h * s, CHIP_CONTACTS.r * s);
    }
  }
}

/* ── Base ─────────────────────────────────────────────────────────────────── */

/** The brand color with a light sweep top-left and depth bottom-right (the
 *  same stops brandVars() gave the DOM face). `deepFirst` for the back. */
function paintBase(ctx: CanvasRenderingContext2D, design: CardDesign, deepFirst: boolean) {
  const { color, light, deep } = brandStops(design.color, design.colorEnd);
  ctx.fillStyle = deepFirst ? deep : color;
  ctx.fillRect(0, 0, TEX_W, TEX_H);
  const radial = (cx: number, cy: number, r: number, from: string, toStop: number) => {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, from);
    g.addColorStop(toStop, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, TEX_W, TEX_H);
  };
  if (deepFirst) {
    radial(TEX_W, 0, TEX_W * 1.2, color, 0.55);
  } else {
    radial(0, 0, TEX_W * 1.2, light, 0.55);
    radial(TEX_W, TEX_H, TEX_W * 1.1, deep, 0.6);
  }
  if (design.finish === 'metal') {
    // Alloy: a metal's albedo is its reflectance, so pull the saturation down
    // and lift it toward silver or the reflections go black.
    ctx.globalCompositeOperation = 'saturation';
    ctx.fillStyle = 'rgba(128,128,128,0.45)';
    ctx.fillRect(0, 0, TEX_W, TEX_H);
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(190,196,206,0.32)';
    ctx.fillRect(0, 0, TEX_W, TEX_H);
    ctx.globalCompositeOperation = 'source-over';
  }
}

/** Frozen: desaturate and haze. Closed: grey out and darken. */
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

function paintLockup(ctx: CanvasRenderingContext2D, assets: FaceAssets) {
  // Silver foil reflectance; the material makes it metal and iridescent.
  drawTinted(ctx, assets.lockup, LOCKUP.x, LOCKUP.y, LOCKUP.w, LOCKUP.h, '#e4e4e8');
}

function paintChip(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(CHIP.x, CHIP.y, CHIP.x + CHIP.w, CHIP.y + CHIP_H);
  g.addColorStop(0, '#d9b872');
  g.addColorStop(0.5, '#f0dca4');
  g.addColorStop(1, '#c9a35a');
  ctx.fillStyle = g;
  chipPlatePath(ctx);
  ctx.fill();
  ctx.lineWidth = 1.1 * K;
  ctx.strokeStyle = 'rgba(80, 55, 15, 0.7)';
  chipContactsPath(ctx);
  ctx.stroke();
  ctx.lineWidth = 0.8 * K;
  ctx.strokeStyle = 'rgba(60, 40, 10, 0.55)';
  chipPlatePath(ctx);
  ctx.stroke();
}

/* ── Faces ────────────────────────────────────────────────────────────────── */

export interface FrontState {
  design: CardDesign;
  logo: HTMLImageElement | null;
  /** How far the last 4 has faded in (0 before ACTIVE, 1 once it has). */
  lastFour: number;
  frozen: boolean;
  closed: boolean;
}

export function paintFront(ctx: CanvasRenderingContext2D, s: FrontState, assets: FaceAssets) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  paintBase(ctx, s.design, false);

  // Program name at (56, 54), 57 px medium, white.
  const name = s.design.programName.trim() || 'Your brand';
  ctx.fillStyle = '#ffffff';
  ctx.font = `500 ${F(57)}px ${FONT}`;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.fillText(name, F(56), F(54) + F(41));

  // Logo top-right (max 398 × 116 spec px), contained.
  if (s.logo) {
    const maxW = F(398);
    const maxH = F(116);
    const r = Math.min(maxW / s.logo.width, maxH / s.logo.height);
    const w = s.logo.width * r;
    const h = s.logo.height * r;
    ctx.drawImage(s.logo, TEX_W - F(56) - w, F(54) + (F(57) - h) / 2, w, h);
  }

  paintChip(ctx);

  // Last 4 at x 56, baseline 915 (bottom edge of the cap-trimmed line). It
  // fades in when the card goes ACTIVE.
  if (s.lastFour > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, s.lastFour);
    ctx.fillStyle = INK;
    ctx.font = `400 ${F(57)}px ${FONT}`;
    ctx.fillText(`•••• ${PAN_GROUPS[PAN_GROUPS.length - 1]}`, F(56), F(915));
    ctx.restore();
  }

  paintLockup(ctx, assets);
  paintState(ctx, s.frozen, s.closed);
}

export interface BackState {
  design: CardDesign;
  /** PAN groups revealed so far (0..4); 5 = expiry and CVV too. */
  shown: number;
  frozen: boolean;
  closed: boolean;
}

export function paintBack(ctx: CanvasRenderingContext2D, s: BackState, assets: FaceAssets) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  paintBase(ctx, s.design, true);

  // Mag stripe.
  ctx.fillStyle = '#242426';
  ctx.fillRect(0, STRIPE.y, TEX_W, STRIPE.h);

  // Contactless indicator: right-aligned at 54, 90 tall.
  const ch = F(90);
  const cw = ch * (67.3435 / 90);
  drawTinted(ctx, assets.contactless, TEX_W - F(54) - cw, F(470), cw, ch, '#ffffff');

  // Account block at (56, 476): name, PAN, EXP / CVV, on 41 px lines 32 apart.
  const x = F(56);
  const line = F(41);
  const gap = F(32);
  let y = F(476) + line;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.font = `400 ${F(57)}px ${FONT}`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(CARDHOLDER, x, y);

  y += line + gap;
  ctx.fillStyle = INK;
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

  // Fine print at (56, 876), 22 px.
  ctx.font = `400 ${F(22)}px ${FONT}`;
  ctx.fillText('1-855-516-0103   lightspark.com/help', x, F(876) + F(16));
  ctx.fillText('Issued by Lead Bank', x, F(876) + F(16) + F(26));

  paintLockup(ctx, assets);
  paintState(ctx, s.frozen, s.closed);
}

/** Masking bullets spaced like the digits they stand in for. */
function dots(ctx: CanvasRenderingContext2D, n: number, x: number, baseline: number, width: number) {
  const step = width / n;
  const r = F(57) * 0.09;
  ctx.beginPath();
  for (let i = 0; i < n; i++) ctx.arc(x + step * (i + 0.5), baseline - F(57) * 0.26, r, 0, Math.PI * 2);
  ctx.fill();
}
