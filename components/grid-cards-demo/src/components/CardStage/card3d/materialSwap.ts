import * as THREE from 'three';
import { CARD_H, CARD_W } from '@/apps/card/cardMetrics';
import type { CardMaterial } from '@/data/design';

/**
 * A material change rebuilds the body: the old one dissolves into its own
 * particles, the new one's particles swarm in and become the slab, then the
 * print laminates over it. The body's solidity is a noise threshold in the
 * face and edge shaders (a texel is there once `uSolid` passes its noise
 * value), and the same noise, read in JS, times each particle so it lands
 * the instant its spot solidifies. Steel snaps: fine noise, short flights,
 * hard stops. PVC pours: pellets fall in from above and the level rises,
 * blobby front, softer landing.
 */

/** Per-material timing, ms. The leaving material sets the dissolve, the
 *  arriving one the assembly and its particles' flight. */
export interface SwapTiming {
  dissolve: number;
  assemble: number;
  flight: number;
  /** A landed particle takes this long to become the surface. */
  fade: number;
}

export const SWAP_TIMING: Record<CardMaterial, SwapTiming> = {
  plastic: { dissolve: 380, assemble: 480, flight: 360, fade: 120 },
  metal: { dissolve: 260, assemble: 300, flight: 200, fade: 60 },
};
/** The print rolls on over the assembled body. */
export const LAMINATE_MS = 380;
/** Width of the laminate's soft front, as a fraction of the card's width. */
const LAMINATE_SOFT = 0.18;

/** Whole sequence for a change from `from` to `to`, ms. */
export function swapDuration(from: CardMaterial, to: CardMaterial): number {
  return SWAP_TIMING[from].dissolve + SWAP_TIMING[to].assemble + LAMINATE_MS;
}

/* ── Noise ────────────────────────────────────────────────────────────────── */

const NOISE_W = 256;
const NOISE_H = 160;

export interface SwapNoise {
  texture: THREE.DataTexture;
  /** Dissolve (R) and assemble (G) patterns, row-major from the bottom, 0..1. */
  r: Float32Array;
  g: Float32Array;
}

const hash = (x: number, y: number, seed: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return s - Math.floor(s);
};
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Smooth value noise over the map, lattice `cell` map px wide. */
function valueNoise(seed: number, cell: number): (i: number, j: number) => number {
  return (i, j) => {
    const x = i / cell;
    const y = j / cell;
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = smooth(x - x0);
    const fy = smooth(y - y0);
    const a = hash(x0, y0, seed);
    const b = hash(x0 + 1, y0, seed);
    const c = hash(x0, y0 + 1, seed);
    const d = hash(x0 + 1, y0 + 1, seed);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };
}

/** Fill `out` from `f`, rescaled to span 0..1 so the threshold sweep uses
 *  its whole window. */
function fill(out: Float32Array, f: (i: number, j: number) => number) {
  let min = Infinity;
  let max = -Infinity;
  for (let j = 0; j < NOISE_H; j++) {
    for (let i = 0; i < NOISE_W; i++) {
      const v = f(i, j);
      out[j * NOISE_W + i] = v;
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  const span = max - min || 1;
  for (let k = 0; k < out.length; k++) out[k] = (out[k] - min) / span;
}

function pattern(material: CardMaterial, seed: number): (i: number, j: number) => number {
  if (material === 'metal') {
    // Fine grain everywhere at once, with a coarser modulation so it isn't
    // static.
    const fine = valueNoise(seed, 6);
    const coarse = valueNoise(seed + 11, 24);
    return (i, j) => 0.6 * fine(i, j) + 0.4 * coarse(i, j);
  }
  // A level that rises (assembly) or drains (dissolve), with a blobby front.
  const blob = valueNoise(seed, 30);
  return (i, j) => 0.7 * (j / (NOISE_H - 1)) + 0.3 * blob(i, j);
}

const noiseCache = new Map<CardMaterial, SwapNoise>();

export function swapNoise(material: CardMaterial): SwapNoise {
  let n = noiseCache.get(material);
  if (n) return n;
  const r = new Float32Array(NOISE_W * NOISE_H);
  const g = new Float32Array(NOISE_W * NOISE_H);
  fill(r, pattern(material, material === 'metal' ? 3 : 5));
  fill(g, pattern(material, material === 'metal' ? 17 : 23));
  const data = new Uint8Array(NOISE_W * NOISE_H * 4);
  for (let k = 0; k < r.length; k++) {
    data[k * 4] = Math.round(r[k] * 255);
    data[k * 4 + 1] = Math.round(g[k] * 255);
    data[k * 4 + 3] = 255;
  }
  const texture = new THREE.DataTexture(data, NOISE_W, NOISE_H, THREE.RGBAFormat, THREE.UnsignedByteType);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  n = { texture, r, g };
  noiseCache.set(material, n);
  return n;
}

/** The noise at a point of the body, u and v in 0..1 from the bottom left. */
export function noiseAt(arr: Float32Array, u: number, v: number): number {
  const i = Math.min(NOISE_W - 1, Math.max(0, Math.round(u * (NOISE_W - 1))));
  const j = Math.min(NOISE_H - 1, Math.max(0, Math.round(v * (NOISE_H - 1))));
  return arr[j * NOISE_W + i];
}

/* ── Shader ───────────────────────────────────────────────────────────────── */

export interface SwapUniforms {
  /** 1 = the body is all there; a texel shows once this passes its noise. */
  uSolid: { value: number };
  uNoise: { value: THREE.Texture };
  /** Which noise channel: (1,0) dissolve, (0,1) assemble. */
  uNoiseSel: { value: THREE.Vector2 };
  /** 0 = bare body, 1 = printed; the front rolls across in local x. */
  uLaminate: { value: number };
  uBareMap: { value: THREE.Texture | null };
  uBareOrm: { value: THREE.Texture | null };
  uBareNormal: { value: THREE.Texture | null };
  uBodySize: { value: THREE.Vector2 };
}

export function createSwapUniforms(): SwapUniforms {
  return {
    uSolid: { value: 1 },
    uNoise: { value: swapNoise('plastic').texture },
    uNoiseSel: { value: new THREE.Vector2(1, 0) },
    uLaminate: { value: 1 },
    uBareMap: { value: null },
    uBareOrm: { value: null },
    uBareNormal: { value: null },
    uBodySize: { value: new THREE.Vector2(CARD_W, CARD_H) },
  };
}

const PARS = /* glsl */ `
#include <common>
varying vec3 vBody;
uniform float uSolid;
uniform sampler2D uNoise;
uniform vec2 uNoiseSel;
uniform float uLaminate;
uniform sampler2D uBareMap;
uniform sampler2D uBareOrm;
uniform sampler2D uBareNormal;
uniform vec2 uBodySize;
`;

/** The solidity test and the laminate front, in place of the albedo chunk
 *  (the first the fragment does, so nothing is lit that isn't there). */
const BODY = /* glsl */ `
vec2 swapUv = vBody.xy / uBodySize + 0.5;
float swapN = dot(texture2D(uNoise, swapUv).rg, uNoiseSel);
if (swapN > uSolid) discard;
float swapLam = clamp((uLaminate * (1.0 + ${LAMINATE_SOFT}) - swapUv.x) / ${LAMINATE_SOFT}, 0.0, 1.0);
`;

const FACE_MAP = /* glsl */ `
#ifdef USE_MAP
	vec4 sampledDiffuseColor = mix(texture2D(uBareMap, vMapUv), texture2D(map, vMapUv), swapLam);
	diffuseColor *= sampledDiffuseColor;
#endif
`;

const FACE_ROUGHNESS = /* glsl */ `
float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = mix(texture2D(uBareOrm, vRoughnessMapUv), texture2D(roughnessMap, vRoughnessMapUv), swapLam);
	roughnessFactor *= texelRoughness.g;
#endif
`;

const FACE_METALNESS = /* glsl */ `
float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = mix(texture2D(uBareOrm, vMetalnessMapUv), texture2D(metalnessMap, vMetalnessMapUv), swapLam);
	metalnessFactor *= texelMetalness.b;
#endif
`;

const NORMAL_LINE = 'vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;';
const FACE_NORMAL_LINE =
  'vec3 mapN = mix(texture2D(uBareNormal, vNormalMapUv), texture2D(normalMap, vNormalMapUv), swapLam).xyz * 2.0 - 1.0;';

function patchVertex(shader: THREE.WebGLProgramParametersWithUniforms) {
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nvarying vec3 vBody;')
    .replace('#include <begin_vertex>', '#include <begin_vertex>\nvBody = position;');
}

function bind(shader: THREE.WebGLProgramParametersWithUniforms, u: SwapUniforms) {
  for (const k of Object.keys(u) as Array<keyof SwapUniforms>) shader.uniforms[k] = u[k];
}

/** A face: dissolves with the body and carries the bare-to-print laminate. */
export function patchFaceMaterial(m: THREE.MeshPhysicalMaterial, u: SwapUniforms) {
  m.onBeforeCompile = (shader) => {
    bind(shader, u);
    patchVertex(shader);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', PARS)
      .replace('#include <map_fragment>', BODY + FACE_MAP)
      .replace('#include <roughnessmap_fragment>', FACE_ROUGHNESS)
      .replace('#include <metalnessmap_fragment>', FACE_METALNESS)
      .replace(NORMAL_LINE, FACE_NORMAL_LINE);
  };
  m.customProgramCacheKey = () => 'swap-face';
}

/** The edge: the construction itself, so it only dissolves. */
export function patchEdgeMaterial(m: THREE.MeshPhysicalMaterial, u: SwapUniforms) {
  m.onBeforeCompile = (shader) => {
    bind(shader, u);
    patchVertex(shader);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', PARS)
      .replace('#include <map_fragment>', BODY + '#include <map_fragment>');
  };
  m.customProgramCacheKey = () => 'swap-edge';
}
