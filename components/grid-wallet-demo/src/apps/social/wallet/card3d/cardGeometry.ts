import * as THREE from 'three';

// Credit-card proportions (ISO 7810 ID-1 ≈ 1.586:1). Units are arbitrary scene
// units; the camera frames them.
export const CARD_W = 3.4;
export const CARD_H = CARD_W / 1.586; // ≈ 2.143
export const CARD_D = 0.05; // thin metal slab
export const CARD_R = 0.16; // face corner radius

/** A centered rounded-rectangle Shape in the XY plane. */
function roundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

/**
 * Extruded rounded-rectangle card with a small edge bevel, centered on the
 * origin and facing +Z. Front-face UVs are remapped to a clean 0..1 across the
 * card rectangle (ExtrudeGeometry's native UVs are world-space), so the material
 * maps line up with the card face. Back/edge UVs are left as-is (the back reads
 * as plain metal).
 */
export function createCardGeometry(): THREE.ExtrudeGeometry {
  const shape = roundedRectShape(CARD_W, CARD_H, CARD_R);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: CARD_D,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 3,
    curveSegments: 24,
  });
  geometry.center();

  // Remap UVs to 0..1 across the card rect so face textures map cleanly.
  const pos = geometry.attributes.position as THREE.BufferAttribute;
  const uv = geometry.attributes.uv as THREE.BufferAttribute;
  const halfW = CARD_W / 2;
  const halfH = CARD_H / 2;
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const py = pos.getY(i);
    uv.setXY(i, (px + halfW) / CARD_W, (py + halfH) / CARD_H);
  }
  uv.needsUpdate = true;
  geometry.computeVertexNormals();

  // ExtrudeGeometry is non-indexed, so `computeTangents()` can't run. The face is
  // planar with axis-aligned UVs, so a uniform horizontal tangent (+X) is the
  // correct, stable TBN for the front face — exactly the frame the brushed-Z
  // anisotropy (horizontal sheen) and the normal map need. Edges/back read as
  // plain metal, so their approximate frame is invisible.
  const tangents = new Float32Array(pos.count * 4);
  for (let i = 0; i < pos.count; i++) {
    tangents[i * 4] = 1;
    tangents[i * 4 + 1] = 0;
    tangents[i * 4 + 2] = 0;
    tangents[i * 4 + 3] = 1;
  }
  geometry.setAttribute('tangent', new THREE.BufferAttribute(tangents, 4));
  return geometry;
}
