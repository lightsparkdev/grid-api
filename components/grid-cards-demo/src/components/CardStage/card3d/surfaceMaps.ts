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
  chipPocketPath,
  drawDilated,
  drawTinted,
  FOIL_CARRIER,
  K,
  LOCKUP,
  LOCKUP_SPLIT,
  makeCanvas,
  STRIPE,
  mixHex,
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
    // The pocket's gap is bare core plastic, dull; the plate is polished
    // silver plating, its grooves rougher.
    ctx.fillStyle = orm(0.7, 0);
    chipPocketPath(ctx);
    ctx.fill();
    ctx.fillStyle = orm(0.22, 1);
    chipPlatePath(ctx);
    ctx.fill();
    ctx.strokeStyle = orm(0.5, 1);
    ctx.lineWidth = 0.8 * K;
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
    // The chip sits in a milled pocket a hair larger than its plate: the
    // face steps down into the gap, then the plate rises out of it, smooth on
    // top, with grooves cut between the contacts. The two steps give the gap
    // its shadowed near lip and lit far wall as the card turns.
    ctx.setTransform(S, 0, 0, S, 0, 0);
    ctx.fillStyle = '#666666';
    chipPocketPath(ctx);
    ctx.fill();
    ctx.fillStyle = '#8c8c8c';
    chipPlatePath(ctx);
    ctx.fill();
    ctx.strokeStyle = '#6a6a6a';
    ctx.lineWidth = 0.8 * K;
    ctx.lineJoin = 'round';
    chipContactsPath(ctx);
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
  const o = out.data;
  const k = strength / 255;
  for (let y = 0; y < h; y++) {
    const up = (y > 0 ? y - 1 : 0) * w;
    const down = (y < h - 1 ? y + 1 : h - 1) * w;
    const row = y * w;
    for (let x = 0; x < w; x++) {
      const left = x > 0 ? x - 1 : 0;
      const right = x < w - 1 ? x + 1 : w - 1;
      const dx = (src[(row + left) * 4] - src[(row + right) * 4]) * k;
      const dy = (src[(down + x) * 4] - src[(up + x) * 4]) * k;
      const inv = 1 / Math.sqrt(dx * dx + dy * dy + 1);
      const i = (row + x) * 4;
      o[i] = (dx * inv * 0.5 + 0.5) * 255;
      o[i + 1] = (dy * inv * 0.5 + 0.5) * 255;
      o[i + 2] = (inv * 0.5 + 0.5) * 255;
      o[i + 3] = 255;
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
 * Relief for an etched brand: the mask cut into the face, laid over the
 * front's normal map wherever the height departs from flat (the same
 * composition as the beadblast's structure). The cut is the Z card's deboss
 * (grid-wallet-demo `cardTextures`): a fifth of the height range, its edge
 * blurred over 6 texels, which reads as a shallow, soft basin rather than a
 * chamfer. The Z card Sobels it at 2.5 under a normal scale of 1.6; ours is
 * 0.6, so the strength carries the difference. Built at texel size, not map size: the
 * wordmark's strokes are only a few texels wide, and a bevel wider than a
 * stroke smooths the whole mark away. The per-texel work is confined to
 * `region` (the texels the brand can touch), so a drag can rebake per frame.
 */
export function decorateNormal(
  base: HTMLCanvasElement,
  brandMask: HTMLCanvasElement,
  region: { x: number; y: number; w: number; h: number } = { x: 0, y: 0, w: TEX_W, h: TEX_H },
): HTMLCanvasElement {
  const c = makeCanvas(TEX_W, TEX_H);
  const ctx = c.getContext('2d')!;
  ctx.drawImage(base, 0, 0, TEX_W, TEX_H);
  const { x: rx, y: ry, w: rw, h: rh } = region;
  if (rw <= 0 || rh <= 0) return c;
  // Height in texels: flat mid-gray, the mark's floor a step down, the edge
  // softened over the bevel.
  const height = makeCanvas(rw, rh);
  const hc = height.getContext('2d')!;
  hc.fillStyle = '#808080';
  hc.fillRect(0, 0, rw, rh);
  hc.filter = 'blur(6px)';
  const m = makeCanvas(rw, rh);
  const mc = m.getContext('2d')!;
  const sx = brandMask.width / TEX_W;
  const sy = brandMask.height / TEX_H;
  mc.drawImage(brandMask, rx * sx, ry * sy, rw * sx, rh * sy, 0, 0, rw, rh);
  mc.globalCompositeOperation = 'source-in';
  mc.fillStyle = '#4d4d4d';
  mc.fillRect(0, 0, rw, rh);
  hc.drawImage(m, 0, 0);
  hc.filter = 'none';
  const structure = heightToNormal(height, 2.5 * (1.6 / 0.6));
  const sctx = structure.getContext('2d')!;
  const n = sctx.getImageData(0, 0, rw, rh);
  const hd = hc.getImageData(0, 0, rw, rh).data;
  for (let i = 0; i < n.data.length; i += 4) {
    n.data[i + 3] = Math.abs(hd[i] - 128) > 1 ? 255 : 0;
  }
  sctx.putImageData(n, 0, 0);
  ctx.drawImage(structure, rx, ry);
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
