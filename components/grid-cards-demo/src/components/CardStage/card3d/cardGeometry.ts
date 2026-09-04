import * as THREE from 'three';
import { CARD_H, CARD_W } from '@/apps/card/cardMetrics';
import { squirclePath } from '@/components/liquid-glass';
import type { CardMaterial } from '@/data/design';

/** Scene units are card pixels (370 × 232); ISO ID-1 is 85.6 mm wide. */
export const PX_PER_MM = CARD_W / 85.6;
/** Thickness by construction: a laminated PVC card is 0.76 mm; a metal card
 *  (steel or alloy sheet with laminated skins) runs about 0.95 mm. */
export const CARD_DEPTH_MM: Record<CardMaterial, number> = { plastic: 0.76, metal: 0.95 };
/** Corner: the phone's debit-card squircle (13 px Figma × 1.2, smoothing 0.12). */
export const CARD_R = 13 * 1.2;
const CORNER_SMOOTHING = 0.12;
const BEVEL = 0.3;
/** Where a face's plane sits (|z|) for a material: half the depth plus the bevel. */
export const faceZOf = (material: CardMaterial) => (CARD_DEPTH_MM[material] * PX_PER_MM) / 2 + BEVEL;

/** Material slots on the extruded card. */
export const MAT_BACK = 0;
export const MAT_FRONT = 1;
export const MAT_EDGE = 2;

/** The squircle outline as a centered Shape, from the same path the DOM used. */
function squircleShape(): THREE.Shape {
  const d = squirclePath(CARD_W, CARD_H, CARD_R, CORNER_SMOOTHING);
  const nums = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
  const shape = new THREE.Shape();
  for (let i = 0; i < nums.length; i += 2) {
    // The SVG path runs y-down; the scene is y-up.
    const x = nums[i] - CARD_W / 2;
    const y = CARD_H / 2 - nums[i + 1];
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

/**
 * Edge UVs run through the thickness: v = 0 at the back face, 1 at the front,
 * so a strip texture lays the card's layers (skin, core, skin) across the edge.
 * u is unused (the strip is one texel wide). Runs before centering, so z spans
 * -bevel .. depth + bevel.
 */
function edgeUvGenerator(depth: number): THREE.UVGenerator {
  const span = depth + BEVEL * 2;
  const v = (z: number) => (z + BEVEL) / span;
  return {
    generateTopUV: (_g, verts, a, b, c) =>
      [a, b, c].map((i) => new THREE.Vector2(verts[i * 3], verts[i * 3 + 1])),
    generateSideWallUV: (_g, verts, a, b, c, d) =>
      [a, b, c, d].map((i) => new THREE.Vector2(0.5, v(verts[i * 3 + 2]))),
  };
}

/**
 * The card: a squircle extruded to its material's thickness with a small edge
 * bevel, centered on the origin, front toward +Z. Three material groups: the
 * back cap, the front cap, and the edge. Cap UVs are remapped to 0..1 across
 * the face; the back cap mirrors u so its texture reads correctly when the
 * card is turned around.
 */
export function createCardGeometry(material: CardMaterial): THREE.ExtrudeGeometry {
  const depth = CARD_DEPTH_MM[material] * PX_PER_MM;
  const geometry = new THREE.ExtrudeGeometry(squircleShape(), {
    depth,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 2,
    curveSegments: 1,
    UVGenerator: edgeUvGenerator(depth),
  });
  geometry.center();

  const pos = geometry.attributes.position as THREE.BufferAttribute;
  const uv = geometry.attributes.uv as THREE.BufferAttribute;
  const caps = geometry.groups[0];
  const sides = geometry.groups[1];
  const capsEnd = caps.start + caps.count;

  // Split the caps by which way they face; ExtrudeGeometry lays out one cap's
  // triangles, then the other's.
  let frontStart = -1;
  let backStart = -1;
  for (let i = caps.start; i < capsEnd; i += 3) {
    const front = pos.getZ(i) > 0;
    if (front && frontStart < 0) frontStart = i;
    if (!front && backStart < 0) backStart = i;
  }
  geometry.clearGroups();
  const capLen = caps.count / 2;
  geometry.addGroup(backStart, capLen, MAT_BACK);
  geometry.addGroup(frontStart, capLen, MAT_FRONT);
  geometry.addGroup(sides.start, sides.count, MAT_EDGE);

  // Cap UVs: 0..1 across the face, the back mirrored in u.
  for (let i = caps.start; i < capsEnd; i++) {
    const u = (pos.getX(i) + CARD_W / 2) / CARD_W;
    const vv = (pos.getY(i) + CARD_H / 2) / CARD_H;
    uv.setXY(i, pos.getZ(i) < 0 ? 1 - u : u, vv);
  }
  uv.needsUpdate = true;
  geometry.computeVertexNormals();

  // Planar caps with axis-aligned UVs: a constant tangent is the exact frame
  // for the normal maps (+X on the front, -X on the mirrored back).
  const tangents = new Float32Array(pos.count * 4);
  for (let i = 0; i < pos.count; i++) {
    const back = i >= caps.start && i < capsEnd && pos.getZ(i) < 0;
    tangents[i * 4] = back ? -1 : 1;
    tangents[i * 4 + 3] = 1;
  }
  geometry.setAttribute('tangent', new THREE.BufferAttribute(tangents, 4));
  return geometry;
}
