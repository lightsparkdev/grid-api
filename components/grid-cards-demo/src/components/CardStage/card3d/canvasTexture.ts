import * as THREE from 'three';

/** A painted canvas (or a bitmap of one, from the bake worker) as a texture,
 *  mipmapped and filtered for a face seen at every size; `srgb` for color
 *  maps (albedo), raw for data maps. */
export function canvasTexture(c: HTMLCanvasElement | ImageBitmap, srgb = false): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c as HTMLCanvasElement);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}
