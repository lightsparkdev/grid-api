import * as THREE from 'three';
import { CARD_H, CARD_W } from '@/apps/card/cardMetrics';

/**
 * A material change is three wipes in one direction, the way a card is made.
 * A bowed front sweeps the face left to right and leaves the new stock as a
 * blank (polished steel, or white PVC) across the whole card; a second front
 * lays the print's base (the color, gradient, or art) over it; a third prints
 * the graphics (the brand, the back's text, the effects). The face and its
 * maps are mixed in the shader between the fronts; the first front is made
 * of the stock's particles.
 */

/** One pass, ms. */
export const WIPE_MS = 480;
/** Between passes, ms. */
export const WIPE_HOLD = 50;
/** The front bows: its middle leads its ends by this many card px. */
const WIPE_ARC = 10;
/** Antialiasing on the front, as a fraction of the sweep. */
const WIPE_SOFT = 0.012;

/** The sweep coordinate `d` runs 0..1 across the card, left to right, less
 *  the bow. */
const SWEEP_SPAN = CARD_W;

/** Where a point of the face (card px, centered, y up) sits on the sweep. */
export function sweepOf(x: number, y: number, dir: number): number {
  const yn = y / CARD_H;
  return (dir * x + CARD_W / 2 - WIPE_ARC * (1 - 4 * yn * yn)) / SWEEP_SPAN;
}

export interface SwapUniforms {
  /** The fronts' positions on the sweep: the blank's, the base's, the
   *  graphics'. Behind each is its layer; all rest past 1. */
  uFront: { value: number };
  uBase: { value: number };
  uPrint: { value: number };
  /** 1 sweeps along local +x; -1 the other way, so the wipe runs left to
   *  right on screen when the back is showing. */
  uDir: { value: number };
  /** The blank: the stock with the chip set in. */
  uBareMap: { value: THREE.Texture | null };
  uBareOrm: { value: THREE.Texture | null };
  uBareNormal: { value: THREE.Texture | null };
  /** The base: the print's ground, and the print surface without its effects. */
  uBaseMap: { value: THREE.Texture | null };
  uBaseOrm: { value: THREE.Texture | null };
  uBaseNormal: { value: THREE.Texture | null };
}

/** A front's travel: from just before the bowed middle's left edge to past
 *  the far corner. */
export const FRONT_START = -WIPE_ARC / SWEEP_SPAN - WIPE_SOFT * 2;
export const FRONT_REST = 1 + WIPE_SOFT * 2;

/** One set per face; the fronts are shared so both faces sweep together. */
export function createSwapUniforms(shared?: SwapUniforms): SwapUniforms {
  return {
    uFront: shared?.uFront ?? { value: FRONT_REST },
    uBase: shared?.uBase ?? { value: FRONT_REST },
    uPrint: shared?.uPrint ?? { value: FRONT_REST },
    uDir: shared?.uDir ?? { value: 1 },
    uBareMap: { value: null },
    uBareOrm: { value: null },
    uBareNormal: { value: null },
    uBaseMap: { value: null },
    uBaseOrm: { value: null },
    uBaseNormal: { value: null },
  };
}

/** How much a front at `at` has passed a point `d`, 1 behind it. */
export function passed(at: number, d: number): number {
  const t = Math.min(1, Math.max(0, (d - (at - WIPE_SOFT)) / WIPE_SOFT));
  return 1 - t * t * (3 - 2 * t);
}

const f = (n: number) => n.toFixed(6);

const PARS = /* glsl */ `
#include <common>
varying vec3 vBody;
uniform float uFront;
uniform float uBase;
uniform float uPrint;
uniform float uDir;
uniform sampler2D uBareMap;
uniform sampler2D uBareOrm;
uniform sampler2D uBareNormal;
uniform sampler2D uBaseMap;
uniform sampler2D uBaseOrm;
uniform sampler2D uBaseNormal;
`;

/** The layer at this texel: the blank between the first and second fronts,
 *  the base between the second and third, the print elsewhere. */
const SWEEP = /* glsl */ `
float swapYn = vBody.y / ${f(CARD_H)};
float swapD = (uDir * vBody.x + ${f(CARD_W / 2)} - ${f(WIPE_ARC)} * (1.0 - 4.0 * swapYn * swapYn)) / ${f(SWEEP_SPAN)};
float swapL1 = 1.0 - smoothstep(uFront - ${f(WIPE_SOFT)}, uFront, swapD);
float swapL2 = 1.0 - smoothstep(uBase - ${f(WIPE_SOFT)}, uBase, swapD);
float swapL3 = 1.0 - smoothstep(uPrint - ${f(WIPE_SOFT)}, uPrint, swapD);
float swapBare = swapL1 * (1.0 - swapL2);
float swapBase = swapL2 * (1.0 - swapL3);
float swapPrint = 1.0 - swapBare - swapBase;
`;

const MAP = /* glsl */ `
#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D(map, vMapUv) * swapPrint + texture2D(uBareMap, vMapUv) * swapBare + texture2D(uBaseMap, vMapUv) * swapBase;
	diffuseColor *= sampledDiffuseColor;
#endif
`;

const ROUGHNESS = /* glsl */ `
float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D(roughnessMap, vRoughnessMapUv) * swapPrint + texture2D(uBareOrm, vRoughnessMapUv) * swapBare + texture2D(uBaseOrm, vRoughnessMapUv) * swapBase;
	roughnessFactor *= texelRoughness.g;
#endif
`;

const METALNESS = /* glsl */ `
float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D(metalnessMap, vMetalnessMapUv) * swapPrint + texture2D(uBareOrm, vMetalnessMapUv) * swapBare + texture2D(uBaseOrm, vMetalnessMapUv) * swapBase;
	metalnessFactor *= texelMetalness.b;
#endif
`;

const NORMAL_LINE = 'vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;';
const NORMAL_MIXED =
  'vec3 mapN = (texture2D(normalMap, vNormalMapUv) * swapPrint + texture2D(uBareNormal, vNormalMapUv) * swapBare + texture2D(uBaseNormal, vNormalMapUv) * swapBase).xyz * 2.0 - 1.0;';

export function patchFaceMaterial(m: THREE.MeshPhysicalMaterial, u: SwapUniforms) {
  m.onBeforeCompile = (shader) => {
    for (const k of Object.keys(u) as Array<keyof SwapUniforms>) shader.uniforms[k] = u[k];
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vBody;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvBody = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', PARS)
      .replace('#include <map_fragment>', SWEEP + MAP)
      .replace('#include <roughnessmap_fragment>', ROUGHNESS)
      .replace('#include <metalnessmap_fragment>', METALNESS)
      .replace(NORMAL_LINE, NORMAL_MIXED);
  };
  m.customProgramCacheKey = () => 'swap-face';
}
