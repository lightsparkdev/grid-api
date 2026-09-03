/**
 * The card's material maps, per surface (material and finish) and per face.
 * These describe the surface, not the print: how rough and how metallic each
 * region is (one texture: roughness in G, metalness in B) and the relief
 * (normal map from a height field). Baked once per variant and cached; the
 * design's colors never touch them.
 */

import { isBareMetal, type CardDesign, type CardFinish, type CardMaterial } from '@/data/design';
import {
  chipContactsPath,
  chipPlatePath,
  drawTinted,
  K,
  LOCKUP,
  LOCKUP_SPLIT,
  makeCanvas,
  STRIPE,
  TEX_H,
  TEX_W,
  type FaceAssets,
} from './facePaint';

export const MAP_W = 1024;
export const MAP_H = Math.round((MAP_W * TEX_H) / TEX_W);
const S = MAP_W / TEX_W;

export interface SurfaceMaps {
  /** G = roughness, B = metalness. */
  orm: HTMLCanvasElement;
  normal: HTMLCanvasElement;
}

/** What the face is made of, with its finish. A printed face (PVC card, or a
 *  metal card's printed laminate) is `print`; a metal card with no print is
 *  `bare`. Material itself only changes the edge and thickness. */
export type Surface = `${'print' | 'bare'}-${CardFinish}`;
export const surfaceOf = (design: Pick<CardDesign, 'material' | 'color' | 'finish'>): Surface =>
  `${isBareMetal(design) ? 'bare' : 'print'}-${design.finish}`;

/** Field roughness and metalness per surface: soft-touch and laminated print,
 *  brushed and polished metal. */
const FIELD: Record<Surface, { rough: number; metal: number }> = {
  'print-matte': { rough: 0.62, metal: 0 },
  'print-gloss': { rough: 0.45, metal: 0 },
  'bare-matte': { rough: 0.32, metal: 0.85 },
  'bare-gloss': { rough: 0.12, metal: 0.9 },
};

const orm = (rough: number, metal: number) => `rgb(0, ${Math.round(rough * 255)}, ${Math.round(metal * 255)})`;

/** A context on `c` that takes texel (2048-wide) coordinates whatever its size. */
function texelSpace(c: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = c.getContext('2d')!;
  const k = c.width / TEX_W;
  ctx.setTransform(k, 0, 0, k, 0, 0);
  return ctx;
}

/* ── Roughness / metalness ────────────────────────────────────────────────── */

/** Full texel resolution: the foil's edges must land exactly where the albedo
 *  paints them, or a half-texel of "metal" leaks around each letter. */
function bakeOrm(surface: Surface, side: 'front' | 'back', assets: FaceAssets): HTMLCanvasElement {
  const c = makeCanvas(TEX_W, TEX_H);
  const ctx = texelSpace(c);
  const f = FIELD[surface];
  ctx.fillStyle = orm(f.rough, f.metal);
  ctx.fillRect(0, 0, TEX_W, TEX_H);
  if (side === 'back') {
    ctx.fillStyle = orm(0.78, 0);
    ctx.fillRect(0, STRIPE.y, TEX_W, STRIPE.h);
  } else {
    // Silver plating: polished metal; the grooves are rougher.
    ctx.fillStyle = orm(0.22, 1);
    chipPlatePath(ctx);
    ctx.fill();
    ctx.strokeStyle = orm(0.6, 1);
    ctx.lineWidth = 1.1 * K;
    chipContactsPath(ctx);
    ctx.stroke();
    return c;
  }
  // Back: the product identifier is printed silver ink (flat, a little
  // metallic); the Visa mark is stamped silver foil (metal with a soft,
  // brushed sheen rather than a mirror).
  drawTinted(ctx, assets.lockup, LOCKUP.x, LOCKUP.y, LOCKUP.w, LOCKUP.h, orm(0.5, 0.55), [0, LOCKUP_SPLIT]);
  drawTinted(ctx, assets.lockup, LOCKUP.x, LOCKUP.y, LOCKUP.w, LOCKUP.h, orm(0.3, 1), [LOCKUP_SPLIT, 1]);
  return c;
}

/* ── Relief ───────────────────────────────────────────────────────────────── */

function bakeHeight(surface: Surface, side: 'front' | 'back', assets: FaceAssets): HTMLCanvasElement {
  const c = makeCanvas(MAP_W, MAP_H);
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, MAP_W, MAP_H);

  // Surface grain, in map pixels. Polished metal is smooth.
  if (surface !== 'bare-gloss') {
    const img = ctx.getImageData(0, 0, MAP_W, MAP_H);
    const d = img.data;
    if (surface === 'bare-matte') {
      // Brushed: each row carries its own streak, with a little per-pixel break.
      for (let y = 0; y < MAP_H; y++) {
        const row = (Math.random() - 0.5) * 14;
        for (let x = 0; x < MAP_W; x++) {
          const i = (y * MAP_W + x) * 4;
          const v = 128 + row + (Math.random() - 0.5) * 5;
          d[i] = d[i + 1] = d[i + 2] = v;
        }
      }
    } else {
      // Print: fine isotropic grain, finer under a gloss laminate.
      const amp = surface === 'print-gloss' ? 5 : 8;
      for (let i = 0; i < d.length; i += 4) {
        const v = 128 + (Math.random() - 0.5) * amp;
        d[i] = d[i + 1] = d[i + 2] = v;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  if (side === 'front') {
    // The chip is a plate set flush in a milled pocket: a soft step around it,
    // smooth on top, with grooves cut between the contacts.
    ctx.setTransform(S, 0, 0, S, 0, 0);
    ctx.save();
    ctx.filter = `blur(${1.2 * K * S}px)`;
    ctx.fillStyle = '#8c8c8c';
    chipPlatePath(ctx);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#8c8c8c';
    chipPlatePath(ctx);
    ctx.fill();
    ctx.strokeStyle = '#5a5a5a';
    ctx.lineWidth = 1.1 * K;
    ctx.lineJoin = 'round';
    chipContactsPath(ctx);
    ctx.stroke();
    ctx.strokeStyle = '#606060';
    ctx.lineWidth = 0.8 * K;
    chipPlatePath(ctx);
    ctx.stroke();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  } else {
    // The mag stripe is laminated a hair above the face.
    ctx.fillStyle = '#848484';
    ctx.fillRect(0, STRIPE.y * S, MAP_W, STRIPE.h * S);
  }
  if (side === 'back') {
    // The foil is hot-stamped: it sits a hair proud of the face, with a fine
    // diagonal brush in the metal that gives it a directional sheen instead
    // of a flat mirror.
    const foil = makeCanvas(MAP_W, MAP_H);
    const fctx = foil.getContext('2d')!;
    fctx.fillStyle = '#8a8a8a';
    fctx.fillRect(0, 0, MAP_W, MAP_H);
    fctx.save();
    fctx.translate(MAP_W / 2, MAP_H / 2);
    fctx.rotate(-Math.PI / 4);
    for (let y = -MAP_W; y < MAP_W; y += 2) {
      fctx.fillStyle = `rgb(${138 + Math.round((Math.random() - 0.5) * 10)} 0 0)`;
      fctx.fillRect(-MAP_W, y, MAP_W * 2, 1);
    }
    fctx.restore();
    // Keep the foil only inside the lockup: mask by the artwork.
    fctx.globalCompositeOperation = 'destination-in';
    fctx.setTransform(S, 0, 0, S, 0, 0);
    drawTinted(fctx, assets.lockup, LOCKUP.x, LOCKUP.y, LOCKUP.w, LOCKUP.h, '#fff');
    fctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(foil, 0, 0);
  }
  return c;
}

/** Sobel height → tangent-space normal. Canvas y runs down while v runs up, so
 *  the vertical gradient is flipped. */
function heightToNormal(height: HTMLCanvasElement, strength: number): HTMLCanvasElement {
  const w = height.width;
  const h = height.height;
  const src = height.getContext('2d')!.getImageData(0, 0, w, h).data;
  const out = new ImageData(w, h);
  const at = (x: number, y: number) => {
    const cx = x < 0 ? 0 : x >= w ? w - 1 : x;
    const cy = y < 0 ? 0 : y >= h ? h - 1 : y;
    return src[(cy * w + cx) * 4] / 255;
  };
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

/* ── Edge ─────────────────────────────────────────────────────────────────── */

/** Strip height in texels; the edge is only a few px tall on screen. */
const EDGE_H = 256;

export interface EdgeMaps {
  albedo: HTMLCanvasElement;
  /** G = roughness, B = metalness. */
  orm: HTMLCanvasElement;
}

/**
 * The card's layers seen edge-on, front at the top of the strip (v = 1) and
 * back at the bottom. A PVC card is a white core between two printed skins
 * under clear overlay; a metal card is an alloy sheet between two thin dark
 * laminated skins (the back one carries the stripe and antenna). Skins are a
 * little thicker than life so they still read at a few px tall.
 */
export function bakeEdge(material: CardMaterial, skinColor: string): EdgeMaps {
  const albedo = makeCanvas(2, EDGE_H);
  const ormStrip = makeCanvas(2, EDGE_H);
  const a = albedo.getContext('2d')!;
  const o = ormStrip.getContext('2d')!;
  type Layer = { frac: number; color: string; rough: number; metal: number };
  const layers: Layer[] =
    material === 'metal'
      ? [
          { frac: 0.09, color: '#1a1a1e', rough: 0.55, metal: 0 },
          { frac: 0.82, color: '#cfcfd3', rough: 0.35, metal: 1 },
          { frac: 0.09, color: '#1a1a1e', rough: 0.55, metal: 0 },
        ]
      : [
          { frac: 0.05, color: '#f4f4f6', rough: 0.4, metal: 0 },
          { frac: 0.1, color: skinColor, rough: 0.5, metal: 0 },
          { frac: 0.7, color: '#ececef', rough: 0.55, metal: 0 },
          { frac: 0.1, color: skinColor, rough: 0.5, metal: 0 },
          { frac: 0.05, color: '#f4f4f6', rough: 0.4, metal: 0 },
        ];
  let y = 0;
  for (const l of layers) {
    const h = Math.round(l.frac * EDGE_H);
    a.fillStyle = l.color;
    a.fillRect(0, y, 2, h);
    o.fillStyle = orm(l.rough, l.metal);
    o.fillRect(0, y, 2, h);
    y += h;
  }
  return { albedo, orm: ormStrip };
}

/* ── Cache ────────────────────────────────────────────────────────────────── */

const surfaceCache = new Map<string, SurfaceMaps>();

export function getSurfaceMaps(surface: Surface, side: 'front' | 'back', assets: FaceAssets): SurfaceMaps {
  const key = `${surface}|${side}`;
  let maps = surfaceCache.get(key);
  if (!maps) {
    maps = {
      orm: bakeOrm(surface, side, assets),
      normal: heightToNormal(bakeHeight(surface, side, assets), surface === 'bare-matte' ? 2.2 : 1.6),
    };
    surfaceCache.set(key, maps);
  }
  return maps;
}
