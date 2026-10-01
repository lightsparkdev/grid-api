/**
 * The frames the card's artwork moves between. The face textures are the
 * landscape blank's (2048 wide, one per face, the back's mirrored in u on the
 * mesh), whatever way the card is held. The artwork is composed in spec px
 * on the face as it is held (`faceSize`): 1536 wide in landscape, 1536 tall
 * in portrait, where the blank has been turned a quarter turn clockwise and
 * stood up (its left edge is the top). One set of painters draws in the
 * composed frame through a canvas transform that lands on the blank's
 * texels, so the two orientations share every line of layout code and can't
 * drift. The chip and the stripe are physical and stay in the blank's frame.
 *
 * The back is painted as seen from behind (x right), and its texture is
 * mirrored on the mesh, so its turn is the other way round from the front's.
 */

import { CARD_H, CARD_W, faceSize, fig, FIGMA_CARD_W, FIGMA_FACE_H } from '@/apps/card/cardMetrics';
import type { Orientation } from '@/data/design';

export const TEX_W = 2048;
export const TEX_H = Math.round((TEX_W * CARD_H) / CARD_W);
/** Card px → texels. */
export const K = TEX_W / CARD_W;
/** Blank spec px → texels. */
export const F = (px: number) => fig(px) * K;
/** Spec px → texels, as a factor. */
export const TEX_PER_SPEC = F(1);

export type Side = 'front' | 'back';

export interface Pt {
  x: number;
  y: number;
}

/** A box in spec px. */
export interface SpecRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A point of the composed face → the blank's spec px as seen from `side`
 *  (the back seen from behind, x running right). */
export function toBlank(o: Orientation, side: Side, p: Pt): Pt {
  if (o === 'landscape') return p;
  return side === 'front' ? { x: p.y, y: FIGMA_FACE_H - p.x } : { x: FIGMA_CARD_W - p.y, y: p.x };
}

/** The blank's spec px (seen from `side`) → the composed face. */
export function fromBlank(o: Orientation, side: Side, p: Pt): Pt {
  if (o === 'landscape') return p;
  return side === 'front' ? { x: FIGMA_FACE_H - p.y, y: p.x } : { x: p.y, y: FIGMA_CARD_W - p.x };
}

/** Set `ctx` so drawing in the composed face's spec px lands on the face's
 *  texels; `scale` for a canvas smaller than the texture (a map at 1024). */
export function specSpace(ctx: CanvasRenderingContext2D, o: Orientation, side: Side, scale = 1) {
  const k = TEX_PER_SPEC * scale;
  if (o === 'landscape') ctx.setTransform(k, 0, 0, k, 0, 0);
  else if (side === 'front') ctx.setTransform(0, -k, k, 0, 0, TEX_H * scale);
  else ctx.setTransform(0, k, -k, 0, TEX_W * scale, 0);
}

/** Back to texels (the blank's frame), for the physical features and the
 *  whole-face fills. */
export function texelSpace(ctx: CanvasRenderingContext2D, scale = 1) {
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

/** The texels a composed box covers, clamped to the texture. */
export function texelBounds(o: Orientation, side: Side, r: SpecRect): { x: number; y: number; w: number; h: number } {
  const corners = [
    { x: r.x, y: r.y },
    { x: r.x + r.w, y: r.y },
    { x: r.x, y: r.y + r.h },
    { x: r.x + r.w, y: r.y + r.h },
  ].map((p) => toBlank(o, side, p));
  const k = TEX_PER_SPEC;
  const x0 = Math.max(0, Math.floor(Math.min(...corners.map((p) => p.x)) * k));
  const y0 = Math.max(0, Math.floor(Math.min(...corners.map((p) => p.y)) * k));
  const x1 = Math.min(TEX_W, Math.ceil(Math.max(...corners.map((p) => p.x)) * k));
  const y1 = Math.min(TEX_H, Math.ceil(Math.max(...corners.map((p) => p.y)) * k));
  return { x: x0, y: y0, w: Math.max(0, x1 - x0), h: Math.max(0, y1 - y0) };
}

/** The blank's spec px (seen from `side`) → the mesh's frame, card px. The
 *  back's canvas x runs toward local -x. */
function blankToLocal(side: Side, p: Pt): Pt {
  const sign = side === 'front' ? 1 : -1;
  return { x: sign * (p.x / FIGMA_CARD_W - 0.5) * CARD_W, y: (0.5 - p.y / FIGMA_FACE_H) * CARD_H };
}

/** A point of the composed face in the mesh's frame, card px. */
export function specToLocal(o: Orientation, side: Side, p: Pt): Pt {
  return blankToLocal(side, toBlank(o, side, p));
}

/** A point of the mesh's frame (card px, on the face's plane) → the composed
 *  face's spec px: the stage's pick, for either face. */
export function localToSpec(o: Orientation, side: Side, local: Pt): Pt {
  const sign = side === 'front' ? 1 : -1;
  return fromBlank(o, side, {
    x: ((sign * local.x) / CARD_W + 0.5) * FIGMA_CARD_W,
    y: (0.5 - local.y / CARD_H) * FIGMA_FACE_H,
  });
}

/** Composed spec px → card px: the same scale along either axis. */
export const specToCard = (px: number) => fig(px);

/**
 * Where a layer plane painted for a composed box (the foil mark, the dove)
 * sits on the mesh: its center in the mesh's frame, its size in card px, and
 * the roll about the face's normal that turns the plane's own x along the
 * composed x. The back's planes also face -z (rotation.y = π), so their roll
 * is the front's negated.
 */
export function layerFrame(o: Orientation, side: Side, r: SpecRect): { x: number; y: number; w: number; h: number; rotZ: number } {
  const c = specToLocal(o, side, { x: r.x + r.w / 2, y: r.y + r.h / 2 });
  const roll = o === 'landscape' ? 0 : side === 'front' ? Math.PI / 2 : -Math.PI / 2;
  return { x: c.x, y: c.y, w: specToCard(r.w), h: specToCard(r.h), rotZ: roll };
}

export { faceSize };
