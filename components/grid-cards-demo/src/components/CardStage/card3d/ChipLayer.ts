import * as THREE from 'three';
import { CARD_H, CARD_W } from '@/apps/card/cardMetrics';
import { CHIP, CHIP_GAP, CHIP_H, chipPocketPath, makeCanvas, TEX_H, TEX_W } from './facePaint';

/**
 * The chip module, set into the card last, by a machine. Through a material
 * change the face shows the base under the chip's pocket (`uChipMask`,
 * `uChipHide`), and this plane, which samples the face's own maps over the
 * pocket's rectangle, is the module in the placement head: it comes straight
 * down onto the card at a steady rate, seats, and the press gives the card a
 * small push that springs back. At the end the plane hides and the face's
 * chip is there in its place, the same texels under the same light.
 */

/** The descent, ms, and how high off the face it starts, card px: a punch. */
export const CHIP_DROP_MS = 150;
const CHIP_LIFT = 40;
/** The press: how long the card takes to give and spring back, ms. */
export const CHIP_PRESS_MS = 320;
/** The module comes in out of focus (mip levels) and faint over the first
 *  part of the drop, so it doesn't pop into being. */
const BLUR = 4.5;
const FADE_IN = 0.45;

/** A blurred sample: a mip bias for the width, and a ring of taps a level
 *  down to smooth the trilinear steps. */
const BLUR_FN = /* glsl */ `
uniform float uChipBlur;
vec4 chipBlur( sampler2D t, vec2 uv ) {
	if ( uChipBlur <= 0.01 ) return texture2D( t, uv );
	float r = exp2( uChipBlur ) * ${(1 / TEX_W).toFixed(8)} * 0.6;
	vec4 c = texture2D( t, uv, uChipBlur ) * 2.0;
	c += texture2D( t, uv + vec2( r, 0.0 ), uChipBlur - 1.0 );
	c += texture2D( t, uv - vec2( r, 0.0 ), uChipBlur - 1.0 );
	c += texture2D( t, uv + vec2( 0.0, r ), uChipBlur - 1.0 );
	c += texture2D( t, uv - vec2( 0.0, r ), uChipBlur - 1.0 );
	c += texture2D( t, uv + vec2( r, r ) * 0.7, uChipBlur - 1.0 );
	c += texture2D( t, uv + vec2( -r, r ) * 0.7, uChipBlur - 1.0 );
	c += texture2D( t, uv + vec2( r, -r ) * 0.7, uChipBlur - 1.0 );
	c += texture2D( t, uv + vec2( -r, -r ) * 0.7, uChipBlur - 1.0 );
	return c / 10.0;
}
`;

/** The pocket's rectangle in texels, with a margin for the blurred edge. */
const MARGIN = 64;
const RECT = {
  x: CHIP.x - CHIP_GAP - MARGIN,
  y: CHIP.y - CHIP_GAP - MARGIN,
  w: CHIP.w + (CHIP_GAP + MARGIN) * 2,
  h: CHIP_H + (CHIP_GAP + MARGIN) * 2,
};

/** The pocket, white on black, in the face's texel space: the face's chip
 *  mask and the plane's alpha. */
export function paintChipMask(): HTMLCanvasElement {
  const c = makeCanvas(TEX_W, TEX_H);
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, TEX_W, TEX_H);
  ctx.fillStyle = '#fff';
  chipPocketPath(ctx);
  ctx.fill();
  return c;
}

export class ChipLayer {
  readonly mesh: THREE.Mesh;
  readonly material: THREE.MeshPhysicalMaterial;
  private readonly blur = { value: 0 };
  /** Where the seated chip sits in the card's frame. */
  readonly center: { x: number; y: number };

  constructor(map: THREE.Texture, mask: THREE.Texture) {
    const k = CARD_W / TEX_W;
    const geometry = new THREE.PlaneGeometry(RECT.w * k, RECT.h * k);
    // UVs onto the pocket's rectangle of the face's maps (canvas y runs down,
    // v up).
    const uv = geometry.attributes.uv as THREE.BufferAttribute;
    const u0 = RECT.x / TEX_W;
    const u1 = (RECT.x + RECT.w) / TEX_W;
    const v0 = 1 - (RECT.y + RECT.h) / TEX_H;
    const v1 = 1 - RECT.y / TEX_H;
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(i, uv.getX(i) > 0.5 ? u1 : u0, uv.getY(i) > 0.5 ? v1 : v0);
    }
    uv.needsUpdate = true;
    this.center = {
      x: ((RECT.x + RECT.w / 2) / TEX_W - 0.5) * CARD_W,
      y: (0.5 - (RECT.y + RECT.h / 2) / TEX_H) * CARD_H,
    };

    this.material = new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      metalness: 1,
      roughness: 1,
      transparent: true,
      depthWrite: false,
      opacity: 0,
    });
    this.material.map = map;
    this.material.alphaMap = mask;
    const blur = this.blur;
    const normalLine = 'vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;';
    this.material.onBeforeCompile = (shader) => {
      shader.uniforms.uChipBlur = blur;
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\n' + BLUR_FN)
        .replace(
          '#include <map_fragment>',
          `#ifdef USE_MAP
	diffuseColor *= chipBlur( map, vMapUv );
#endif`,
        )
        .replace(
          '#include <alphamap_fragment>',
          `#ifdef USE_ALPHAMAP
	diffuseColor.a *= chipBlur( alphaMap, vAlphaMapUv ).g;
#endif`,
        )
        .replace(
          '#include <roughnessmap_fragment>',
          `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	roughnessFactor *= chipBlur( roughnessMap, vRoughnessMapUv ).g;
#endif`,
        )
        .replace(
          '#include <metalnessmap_fragment>',
          `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	metalnessFactor *= chipBlur( metalnessMap, vMetalnessMapUv ).b;
#endif`,
        )
        .replace(
          '#include <normal_fragment_maps>',
          THREE.ShaderChunk.normal_fragment_maps.replace(
            normalLine,
            'vec3 mapN = chipBlur( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;',
          ),
        );
    };
    this.material.customProgramCacheKey = () => 'chip-layer';

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.visible = false;
    this.mesh.renderOrder = 1;
  }

  /** Keep the plane's surface the face's: its roughness, metalness, and
   *  relief maps as they stand (they change with the design). */
  sync(face: THREE.MeshPhysicalMaterial) {
    const m = this.material;
    if (m.roughnessMap !== face.roughnessMap || m.normalMap !== face.normalMap) {
      m.roughnessMap = face.roughnessMap;
      m.metalnessMap = face.metalnessMap;
      m.normalMap = face.normalMap;
      m.needsUpdate = true;
    }
    m.normalScale.copy(face.normalScale);
    m.clearcoat = face.clearcoat;
    m.clearcoatRoughness = face.clearcoatRoughness;
  }

  /** Pose the module `ms` into its placement onto the face at `faceZ`.
   *  Returns the press on the card, 0..1: a sharp hit as the module seats,
   *  then a damped spring back. */
  pose(ms: number, faceZ: number): number {
    if (ms <= 0) {
      this.mesh.visible = false;
      return 0;
    }
    this.mesh.visible = true;
    const drop = Math.min(1, ms / CHIP_DROP_MS);
    // Straight down at a steady rate: a machine, not a fall.
    this.mesh.position.set(this.center.x, this.center.y, faceZ + 0.15 + CHIP_LIFT * (1 - drop));
    // Into focus and up to full over the first part of the way down.
    const arrive = Math.min(1, drop / FADE_IN);
    this.material.opacity = arrive;
    this.blur.value = BLUR * (1 - arrive) * (1 - arrive);
    if (drop < 1) return 0;
    const p = Math.min(1, (ms - CHIP_DROP_MS) / CHIP_PRESS_MS);
    // Peaks at 1 about 9% in (its maximum is 0.6234 before scaling).
    return ((1 - Math.exp(-p * 22)) * Math.exp(-p * 3.6)) / 0.6234;
  }

  /** Placement takes this long, ms, from the head starting down. */
  static get duration() {
    return CHIP_DROP_MS + CHIP_PRESS_MS;
  }

  hide() {
    this.mesh.visible = false;
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
