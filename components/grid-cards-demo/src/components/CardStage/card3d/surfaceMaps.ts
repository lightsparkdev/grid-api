/**
 * The card's material maps, per finish and per face. These describe the
 * surface, not the print: how rough and how metallic each region is (one
 * texture: roughness in G, metalness in B), the relief (normal map from a
 * height field), and where the holographic foil is and how thick its film is
 * (iridescence mask and thickness). Baked once per variant and cached; the
 * design's colors never touch them.
 */

import type { CardFinish } from '@/data/design';
import {
  chipContactsPath,
  chipPlatePath,
  drawTinted,
  K,
  LOCKUP,
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

export interface FoilMaps {
  /** R = iridescence strength (the lockup shape). */
  mask: HTMLCanvasElement;
  /** G = film thickness across the lockup, so the hue varies across it. */
  thickness: HTMLCanvasElement;
}

/** Field values per finish: roughness, metalness, relief grain. */
const FIELD: Record<CardFinish, { rough: number; metal: number }> = {
  matte: { rough: 0.62, metal: 0 },
  metal: { rough: 0.36, metal: 0.92 },
  glass: { rough: 0.5, metal: 0 },
};

const orm = (rough: number, metal: number) => `rgb(0, ${Math.round(rough * 255)}, ${Math.round(metal * 255)})`;

function texelSpace(c: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = c.getContext('2d')!;
  ctx.setTransform(S, 0, 0, S, 0, 0);
  return ctx;
}

/* ── Roughness / metalness ────────────────────────────────────────────────── */

function bakeOrm(finish: CardFinish, side: 'front' | 'back', assets: FaceAssets): HTMLCanvasElement {
  const c = makeCanvas(MAP_W, MAP_H);
  const ctx = texelSpace(c);
  const f = FIELD[finish];
  ctx.fillStyle = orm(f.rough, f.metal);
  ctx.fillRect(0, 0, TEX_W, TEX_H);
  if (side === 'back') {
    ctx.fillStyle = orm(0.78, 0);
    ctx.fillRect(0, STRIPE.y, TEX_W, STRIPE.h);
  } else {
    // Gold plating: polished metal; the grooves are rougher.
    ctx.fillStyle = orm(0.22, 1);
    chipPlatePath(ctx);
    ctx.fill();
    ctx.strokeStyle = orm(0.6, 1);
    ctx.lineWidth = 1.1 * K;
    chipContactsPath(ctx);
    ctx.stroke();
  }
  // Foil: a mirror.
  drawTinted(ctx, assets.lockup, LOCKUP.x, LOCKUP.y, LOCKUP.w, LOCKUP.h, orm(0.08, 1));
  return c;
}

/* ── Relief ───────────────────────────────────────────────────────────────── */

function bakeHeight(finish: CardFinish, side: 'front' | 'back', assets: FaceAssets): HTMLCanvasElement {
  const c = makeCanvas(MAP_W, MAP_H);
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, MAP_W, MAP_H);

  // Surface grain, in map pixels.
  if (finish !== 'glass') {
    const img = ctx.getImageData(0, 0, MAP_W, MAP_H);
    const d = img.data;
    if (finish === 'metal') {
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
      // Matte PVC: fine isotropic grain.
      for (let i = 0; i < d.length; i += 4) {
        const v = 128 + (Math.random() - 0.5) * 8;
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
  // The foil is stamped flat: no grain under the lockup.
  ctx.setTransform(S, 0, 0, S, 0, 0);
  drawTinted(ctx, assets.lockup, LOCKUP.x, LOCKUP.y, LOCKUP.w, LOCKUP.h, '#808080');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
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

/* ── Foil ─────────────────────────────────────────────────────────────────── */

function bakeFoil(assets: FaceAssets): FoilMaps {
  // Full texel resolution: the mask's letter edges would speckle at map size.
  const mask = makeCanvas(TEX_W, TEX_H);
  let ctx = mask.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, TEX_W, TEX_H);
  drawTinted(ctx, assets.lockup, LOCKUP.x, LOCKUP.y, LOCKUP.w, LOCKUP.h, '#fff');

  // Film thickness runs diagonally across the lockup so the whole spectrum is
  // on it at once and slides as the card turns.
  const thickness = makeCanvas(MAP_W, MAP_H);
  ctx = texelSpace(thickness);
  const g = ctx.createLinearGradient(LOCKUP.x, LOCKUP.y + LOCKUP.h, LOCKUP.x + LOCKUP.w, LOCKUP.y);
  g.addColorStop(0, '#000000');
  g.addColorStop(1, '#ffffff');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, TEX_W, TEX_H);
  return { mask, thickness };
}

/* ── Cache ────────────────────────────────────────────────────────────────── */

const surfaceCache = new Map<string, SurfaceMaps>();
let foilCache: FoilMaps | null = null;

export function getSurfaceMaps(finish: CardFinish, side: 'front' | 'back', assets: FaceAssets): SurfaceMaps {
  const key = `${finish}|${side}`;
  let maps = surfaceCache.get(key);
  if (!maps) {
    maps = {
      orm: bakeOrm(finish, side, assets),
      normal: heightToNormal(bakeHeight(finish, side, assets), finish === 'metal' ? 2.2 : 1.6),
    };
    surfaceCache.set(key, maps);
  }
  return maps;
}

export function getFoilMaps(assets: FaceAssets): FoilMaps {
  if (!foilCache) foilCache = bakeFoil(assets);
  return foilCache;
}
