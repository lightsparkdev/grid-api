/**
 * The card's material maps, per surface (material and finish) and per face.
 * These describe the surface, not the print: how rough and how metallic each
 * region is (one texture: roughness in G, metalness in B) and the relief
 * (normal map from a height field). Baked once per variant and cached; the
 * design's colors never touch them.
 */

import { isBare, materialOf, type CardDesign, type CardFinish, type CardMaterial } from '@/data/design';
import {
  chipContactsPath,
  chipPlatePath,
  drawDilated,
  drawTinted,
  FOIL_CARRIER,
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
 *  metal card's printed laminate) is `print`, and so is bare PVC stock; bare
 *  alloy is `bare`. Material itself only changes the edge and thickness. */
export type Surface = `${'print' | 'bare'}-${CardFinish}`;
export const surfaceOf = (design: Pick<CardDesign, 'material' | 'color' | 'finish'>): Surface =>
  `${isBare(design) && materialOf(design) === 'metal' ? 'bare' : 'print'}-${design.finish}`;

/** Field roughness and metalness per surface: soft-touch and laminated print,
  *  beadblast and polished metal. */
const FIELD: Record<Surface, { rough: number; metal: number }> = {
  'print-matte': { rough: 0.62, metal: 0 },
  'print-gloss': { rough: 0.45, metal: 0 },
  'bare-matte': { rough: 0.7, metal: 1 },
  'bare-gloss': { rough: 0.12, metal: 1 },
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
  if (surface === 'bare-matte') beadblastRoughness(ctx, assets);
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
  // metallic). The Visa mark is hot-stamped foil: a clear carrier film laid
  // slightly outside the mark's geometry (glossy, not metal), and the metal
  // inside it. The foil is satin rather than a mirror: a mirror seen head-on
  // shows the graphite of the empty room behind the camera, while a satin
  // lobe gathers the studio lights and reads as lit silver from any angle.
  drawTinted(ctx, assets.lockup, LOCKUP.x, LOCKUP.y, LOCKUP.w, LOCKUP.h, orm(0.5, 0.55), [0, LOCKUP_SPLIT]);
  drawDilated(ctx, assets.lockup, LOCKUP.x, LOCKUP.y, LOCKUP.w, LOCKUP.h, orm(0.08, 0), FOIL_CARRIER, [LOCKUP_SPLIT, 1]);
  drawTinted(ctx, assets.lockup, LOCKUP.x, LOCKUP.y, LOCKUP.w, LOCKUP.h, orm(0.3, 1), [LOCKUP_SPLIT, 1]);
  return c;
}

/* ── Relief ───────────────────────────────────────────────────────────────── */

function bakeHeight(surface: Surface, side: 'front' | 'back', assets: FaceAssets): HTMLCanvasElement {
  const c = makeCanvas(MAP_W, MAP_H);
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, MAP_W, MAP_H);

  // Print grain, in map pixels: fine isotropic grain, finer under a gloss
  // laminate. Bare metal gets none here: polished is smooth, and beadblast
  // comes from the grain tiles when the normal is composed.
  if (surface === 'print-matte' || surface === 'print-gloss') {
    const img = ctx.getImageData(0, 0, MAP_W, MAP_H);
    const d = img.data;
    const amp = surface === 'print-gloss' ? 5 : 8;
    for (let i = 0; i < d.length; i += 4) {
      const v = 128 + (Math.random() - 0.5) * amp;
      d[i] = d[i + 1] = d[i + 2] = v;
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
    // Hot-stamped foil is a film laid on the face: the clear carrier sits a
    // hair proud, following the mark's geometry about a millimeter out, and
    // the metal on top of that. Both steps catch light at their edges. The
    // foil itself is flat (a mirror), so no grain under the lockup.
    ctx.setTransform(S, 0, 0, S, 0, 0);
    drawDilated(ctx, assets.lockup, LOCKUP.x, LOCKUP.y, LOCKUP.w, LOCKUP.h, '#8a8a8a', FOIL_CARRIER, [LOCKUP_SPLIT, 1]);
    drawTinted(ctx, assets.lockup, LOCKUP.x, LOCKUP.y, LOCKUP.w, LOCKUP.h, '#929292', [LOCKUP_SPLIT, 1]);
    drawTinted(ctx, assets.lockup, LOCKUP.x, LOCKUP.y, LOCKUP.w, LOCKUP.h, '#808080', [0, LOCKUP_SPLIT]);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
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

/* ── Beadblast (the Z card's metal) ───────────────────────────────────────── */

/**
 * The bare matte metal is the Z card's beadblast: its grain tiles (height
 * ±13 per texel, ±9 per 5-texel cluster, Sobel'd; roughness 0.70 ± 0.08)
 * pattern-filled at the Z card's texel density, with this card's structure
 * (chip plate, stripe, foil) laid over it wherever the height field departs
 * from flat, since a stamped or laminated part has no grain.
 */
function beadblastNormal(structureHeight: HTMLCanvasElement, assets: FaceAssets): HTMLCanvasElement {
  const c = makeCanvas(TEX_W, TEX_H);
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = ctx.createPattern(assets.grainNormal, 'repeat')!;
  ctx.fillRect(0, 0, TEX_W, TEX_H);
  const structure = heightToNormal(structureHeight, 2.2);
  const w = structure.width;
  const h = structure.height;
  const sctx = structure.getContext('2d')!;
  const n = sctx.getImageData(0, 0, w, h);
  const height = structureHeight.getContext('2d')!.getImageData(0, 0, w, h).data;
  for (let i = 0; i < n.data.length; i += 4) {
    n.data[i + 3] = Math.abs(height[i] - 128) > 1 ? 255 : 0;
  }
  sctx.putImageData(n, 0, 0);
  ctx.drawImage(structure, 0, 0, TEX_W, TEX_H);
  return c;
}

/** Roughness grain from the tile into the G channel, metalness 1 in B. */
function beadblastRoughness(ctx: CanvasRenderingContext2D, assets: FaceAssets) {
  const grain = makeCanvas(TEX_W, TEX_H);
  const g = grain.getContext('2d')!;
  g.fillStyle = g.createPattern(assets.grainRough, 'repeat')!;
  g.fillRect(0, 0, TEX_W, TEX_H);
  const img = g.getImageData(0, 0, TEX_W, TEX_H);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = 0;
    d[i + 2] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

/* ── Edge ─────────────────────────────────────────────────────────────────── */

/** `a` toward `b` by `t`, both #rrggbb. */
function mixHex(a: string, b: string, t: number): string {
  const ch = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  const c = [0, 1, 2].map((i) => Math.round(ch(a, i) + (ch(b, i) - ch(a, i)) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

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
export function bakeEdge(material: CardMaterial, coreColor: string, skinColor: string): EdgeMaps {
  const albedo = makeCanvas(2, EDGE_H);
  const ormStrip = makeCanvas(2, EDGE_H);
  const a = albedo.getContext('2d')!;
  const o = ormStrip.getContext('2d')!;
  type Layer = { frac: number; color: string; rough: number; metal: number };
  const overlay = mixHex(skinColor, '#ffffff', 0.18);
  const layers: Layer[] =
    material === 'metal'
      ? [
          { frac: 0.09, color: '#1a1a1e', rough: 0.55, metal: 0 },
          { frac: 0.82, color: coreColor, rough: 0.35, metal: 1 },
          { frac: 0.09, color: '#1a1a1e', rough: 0.55, metal: 0 },
        ]
      : [
          // The clear overlay shows the print through it, a shade lighter and
          // glossier; painted white it read as a keyline around a dark card.
          { frac: 0.05, color: overlay, rough: 0.3, metal: 0 },
          { frac: 0.1, color: skinColor, rough: 0.5, metal: 0 },
          { frac: 0.7, color: coreColor, rough: 0.55, metal: 0 },
          { frac: 0.1, color: skinColor, rough: 0.5, metal: 0 },
          { frac: 0.05, color: overlay, rough: 0.3, metal: 0 },
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

/* ── Decoration ───────────────────────────────────────────────────────────── */

/**
 * Spot gloss and foil change the surface where the brand (and the art) sit,
 * so they are laid over the cached front map per design: a copy of the base
 * roughness/metalness with the masks stamped in. Spot gloss is a clear
 * high-gloss varnish; foil is hot-stamped mirror metal.
 */
export function decorateOrm(
  base: HTMLCanvasElement,
  brandMask: HTMLCanvasElement | null,
  brandTreatment: 'spotGloss' | 'foil' | 'etch' | null,
  artMask: HTMLCanvasElement | null,
  /** Whether the card is metal: an etched mark reaches the steel there. */
  metal = false,
): HTMLCanvasElement {
  const c = makeCanvas(base.width, base.height);
  const ctx = c.getContext('2d')!;
  ctx.drawImage(base, 0, 0);
  const stamp = (mask: HTMLCanvasElement, fill: string) => {
    const m = makeCanvas(mask.width, mask.height);
    const mc = m.getContext('2d')!;
    mc.drawImage(mask, 0, 0);
    mc.globalCompositeOperation = 'source-in';
    mc.fillStyle = fill;
    mc.fillRect(0, 0, m.width, m.height);
    ctx.drawImage(m, 0, 0, c.width, c.height);
  };
  if (artMask) stamp(artMask, orm(0.06, 0));
  if (brandMask && brandTreatment) {
    const fill =
      brandTreatment === 'spotGloss'
        ? orm(0.06, 0)
        : brandTreatment === 'etch'
          ? // The cut's floor: on metal it is the steel, through any laminate,
            // polished (the Z card's basin); on plastic a pressed, smoother print.
            metal
            ? orm(0.2, 1)
            : orm(0.22, 0)
          : orm(0.05, 1);
    stamp(brandMask, fill);
  }
  return c;
}

/**
 * Relief for an etched brand: the mask cut into the face, with a bevel about
 * 0.12 mm wide, laid over the front's normal map wherever the height departs
 * from flat (the same composition as the beadblast's structure). Built at
 * texel size, not map size: the wordmark's strokes are only a few texels
 * wide, and a bevel wider than a stroke smooths the whole mark away.
 */
export function decorateNormal(base: HTMLCanvasElement, brandMask: HTMLCanvasElement): HTMLCanvasElement {
  const c = makeCanvas(TEX_W, TEX_H);
  const ctx = c.getContext('2d')!;
  ctx.drawImage(base, 0, 0, TEX_W, TEX_H);
  // Height in texels: flat mid-gray, the mark's floor black, the edge
  // softened over the bevel.
  const height = makeCanvas(TEX_W, TEX_H);
  const hc = height.getContext('2d')!;
  hc.fillStyle = '#808080';
  hc.fillRect(0, 0, TEX_W, TEX_H);
  const bevel = 0.12 * 17.94 * K;
  hc.filter = `blur(${bevel / 2}px)`;
  const m = makeCanvas(brandMask.width, brandMask.height);
  const mc = m.getContext('2d')!;
  mc.drawImage(brandMask, 0, 0);
  mc.globalCompositeOperation = 'source-in';
  mc.fillStyle = '#000000';
  mc.fillRect(0, 0, m.width, m.height);
  hc.drawImage(m, 0, 0, TEX_W, TEX_H);
  hc.filter = 'none';
  // Half a unit of height over the bevel's width, to a slope near 45°.
  const structure = heightToNormal(height, bevel * 0.9);
  const sctx = structure.getContext('2d')!;
  const n = sctx.getImageData(0, 0, TEX_W, TEX_H);
  const hd = hc.getImageData(0, 0, TEX_W, TEX_H).data;
  for (let i = 0; i < n.data.length; i += 4) {
    n.data[i + 3] = Math.abs(hd[i] - 128) > 1 ? 255 : 0;
  }
  sctx.putImageData(n, 0, 0);
  ctx.drawImage(structure, 0, 0);
  return c;
}

/* ── Cache ────────────────────────────────────────────────────────────────── */

const surfaceCache = new Map<string, SurfaceMaps>();

export function getSurfaceMaps(surface: Surface, side: 'front' | 'back', assets: FaceAssets): SurfaceMaps {
  const key = `${surface}|${side}`;
  let maps = surfaceCache.get(key);
  if (!maps) {
    const height = bakeHeight(surface, side, assets);
    maps = {
      orm: bakeOrm(surface, side, assets),
      normal: surface === 'bare-matte' ? beadblastNormal(height, assets) : heightToNormal(height, 1.6),
    };
    surfaceCache.set(key, maps);
  }
  return maps;
}
