import * as THREE from 'three';
import { CARD_H, CARD_W } from '@/apps/card/cardMetrics';

/**
 * A material change is a wipe: a front slanted 30° sweeps the face left to
 * right. Behind it runs a band of the bare new stock (steel, or PVC), the
 * body under the print, and behind the band the print closes over it again.
 * The face and its maps are mixed in the shader along the front; small
 * particles of the new stock settle onto the face at the edge.
 */

/** The sweep, ms. */
export const WIPE_MS = 800;
/** The bare band's width, as a fraction of the sweep. */
export const WIPE_BAND = 0.3;
/** The front's tilt from vertical, degrees (top leads). */
const WIPE_ANGLE = 30;
/** Antialiasing on the front, as a fraction of the sweep. */
const WIPE_SOFT = 0.012;

const TAN = Math.tan((WIPE_ANGLE * Math.PI) / 180);
/** The sweep coordinate `d` runs 0..1 across the card along the tilted axis:
 *  d = (x + y·tan) over the card's extent in that direction, from the left. */
const SWEEP_SPAN = CARD_W + CARD_H * TAN;

/** Where a point of the face (card px, centered, y up) sits on the sweep. */
export function sweepOf(x: number, y: number, dir: number): number {
  return (dir * x + CARD_W / 2 + (y + CARD_H / 2) * TAN) / SWEEP_SPAN;
}

export interface SwapUniforms {
  /** The front's position on the sweep. Rests past 1 + band (nothing showing). */
  uFront: { value: number };
  /** 1 sweeps along local +x; -1 the other way, so the wipe runs left to
   *  right on screen when the back is showing. */
  uDir: { value: number };
  /** 1 when the new print is itself bare stock (a None color), so the band
   *  doesn't close: what is behind it is what is in it. */
  uNewIsBare: { value: number };
  uBareMap: { value: THREE.Texture | null };
  uBareOrm: { value: THREE.Texture | null };
  uBareNormal: { value: THREE.Texture | null };
}

export const FRONT_REST = 1 + WIPE_BAND + WIPE_SOFT * 2;

/** One set per face; the front is shared so both faces sweep together. */
export function createSwapUniforms(shared?: SwapUniforms): SwapUniforms {
  return {
    uFront: shared?.uFront ?? { value: FRONT_REST },
    uDir: shared?.uDir ?? { value: 1 },
    uNewIsBare: shared?.uNewIsBare ?? { value: 0 },
    uBareMap: { value: null },
    uBareOrm: { value: null },
    uBareNormal: { value: null },
  };
}

const f = (n: number) => n.toFixed(6);

const PARS = /* glsl */ `
#include <common>
varying vec3 vBody;
uniform float uFront;
uniform float uDir;
uniform float uNewIsBare;
uniform sampler2D uBareMap;
uniform sampler2D uBareOrm;
uniform sampler2D uBareNormal;
`;

/** How much of the bare body shows at this texel: the band behind the front,
 *  and behind the band what the new print is. */
const SWEEP = /* glsl */ `
float swapD = (uDir * vBody.x + ${f(CARD_W / 2)} + (vBody.y + ${f(CARD_H / 2)}) * ${f(TAN)}) / ${f(SWEEP_SPAN)};
float swapLead = 1.0 - smoothstep(uFront - ${f(WIPE_SOFT)}, uFront, swapD);
float swapTrail = 1.0 - smoothstep(uFront - ${f(WIPE_BAND)} - ${f(WIPE_SOFT)}, uFront - ${f(WIPE_BAND)}, swapD);
float swapBare = swapLead * mix(1.0, uNewIsBare, swapTrail);
`;

const MAP = /* glsl */ `
#ifdef USE_MAP
	vec4 sampledDiffuseColor = mix(texture2D(map, vMapUv), texture2D(uBareMap, vMapUv), swapBare);
	diffuseColor *= sampledDiffuseColor;
#endif
`;

const ROUGHNESS = /* glsl */ `
float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = mix(texture2D(roughnessMap, vRoughnessMapUv), texture2D(uBareOrm, vRoughnessMapUv), swapBare);
	roughnessFactor *= texelRoughness.g;
#endif
`;

const METALNESS = /* glsl */ `
float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = mix(texture2D(metalnessMap, vMetalnessMapUv), texture2D(uBareOrm, vMetalnessMapUv), swapBare);
	metalnessFactor *= texelMetalness.b;
#endif
`;

const NORMAL_LINE = 'vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;';
const NORMAL_MIXED =
  'vec3 mapN = mix(texture2D(normalMap, vNormalMapUv), texture2D(uBareNormal, vNormalMapUv), swapBare).xyz * 2.0 - 1.0;';

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
