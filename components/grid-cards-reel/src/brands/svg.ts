/* Building blocks for the card art and the marks: everything is authored as
   SVG in the face's spec px (1536 × 963 flat, 963 × 1536 upright), the
   space the playground's face painter places art and brand in. */

import { FIGMA_CARD_W, FIGMA_FACE_H } from '@/apps/card/cardMetrics';
import glyphData from './glyphs.json';

export type GlyphId = keyof typeof glyphData;
export type Face = 'landscape' | 'portrait';

export const FACE = {
  landscape: { w: FIGMA_CARD_W, h: Math.round(FIGMA_FACE_H) },
  portrait: { w: Math.round(FIGMA_FACE_H), h: FIGMA_CARD_W },
} as const;

/** Where the chip sits on each face (spec px): art should leave it legible. */
export const CHIP_AT = {
  landscape: { x: 172, y: 334, w: 197, h: 149 },
  portrait: { x: 480, y: 172, w: 149, h: 197 },
} as const;

/** `clip`: the glyph's geometry runs past its icon tile, which crops it. */
const glyphs = glyphData as Record<GlyphId, { parts: string[]; box: [number, number, number, number]; clip: boolean }>;

export function glyphBox(id: GlyphId) {
  const [x, y, w, h] = glyphs[id].box;
  return { x, y, w, h };
}

/** A glyph's parts, each filled (one fill for all, or one per part). */
export function glyphPaths(id: GlyphId, fill: string | string[]): string {
  const fills = Array.isArray(fill) ? fill : null;
  return glyphs[id].parts
    .map((p, i) => p.replace('<g ', `<g fill="${fills ? fills[i % fills.length] : fill}" `))
    .join('');
}

/** The glyph scaled to `h` tall with its box's top-left at (x, y), or
 *  centered there with `center`. Clipped to its icon tile, as in Figma. */
export function placeGlyph(
  id: GlyphId,
  o: { x: number; y: number; h: number; fill: string | string[]; center?: boolean; rotate?: number; opacity?: number },
): string {
  const b = glyphBox(id);
  const k = o.h / b.h;
  const w = b.w * k;
  const x = o.center ? o.x - w / 2 : o.x;
  const y = o.center ? o.y - o.h / 2 : o.y;
  const rot = o.rotate ? ` rotate(${o.rotate} ${b.x + b.w / 2} ${b.y + b.h / 2})` : '';
  const clip = `glyphclip-${id}`;
  return `<defs><clipPath id="${clip}"><rect width="400" height="400"/></clipPath></defs><g opacity="${o.opacity ?? 1}" transform="translate(${x} ${y}) scale(${k}) translate(${-b.x} ${-b.y})${rot}"><g clip-path="url(#${clip})">${glyphPaths(id, o.fill)}</g></g>`;
}

const encode = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

/** A mark for the brand slot: the glyph cropped to its box. The face
 *  painter sizes it by height and keeps this aspect. */
export function mark(id: GlyphId, fill: string | string[], extra = ''): string {
  const b = glyphBox(id);
  const s = 8;
  const paths = glyphPaths(id, fill);
  const body = glyphs[id].clip ? `<g clip-path="url(#t)">${paths}</g>` : paths;
  return encode(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(b.w * s)}" height="${Math.round(b.h * s)}" viewBox="${b.x} ${b.y} ${b.w} ${b.h}"><defs><clipPath id="t"><rect width="400" height="400"/></clipPath>${extra}</defs>${body}</svg>`,
  );
}

/** A whole face of art, as an SVG document in spec px. */
export function face(orientation: Face, body: string, defs = ''): string {
  const { w, h } = FACE[orientation];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${body}</svg>`;
}

/** Film grain over everything: a fine monochrome noise at `amount` alpha. */
export function grain(id: string, amount = 0.07, freq = 0.85): { defs: string; layer: (w: number, h: number) => string } {
  return {
    defs: `<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="7" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 ${amount * 2}"/></feComponentTransfer></filter>`,
    layer: (w, h) => `<rect width="${w}" height="${h}" filter="url(#${id})"/>`,
  };
}

/** A soft blob: a blurred ellipse, for gradient meshes. */
export function blob(cx: number, cy: number, rx: number, ry: number, fill: string, blurId: string, opacity = 1): string {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" opacity="${opacity}" filter="url(#${blurId})"/>`;
}

export const blur = (id: string, sd: number) =>
  `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${sd}"/></filter>`;

/** Seeded random, so the art is the same on every render. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const f1 = (n: number) => Math.round(n * 10) / 10;
