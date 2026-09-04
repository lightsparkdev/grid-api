import * as THREE from 'three';
import { CARD_H, CARD_W } from '@/apps/card/cardMetrics';

/**
 * A material change is three passes in one direction, the way a card is
 * made. The new stock is laid down as a blank (polished steel, or white PVC)
 * across the whole card; then the print's base (the color, gradient, or art)
 * over it; then the graphics (the brand, the back's text, the effects). Each
 * pass is laid grain by grain: the face is cut into ~3 px cells, each with
 * its own moment inside a zone behind a bowed front that sweeps left to
 * right, so a layer arrives as a speckle that fills in rather than as a
 * line. On the first pass the grains are particles: each comes in from above
 * and lands on its cell at the moment the cell turns, so what the eye sees
 * laying the stock down is the particles landing.
 */

/** One pass, ms. */
export const WIPE_MS = 520;
/** Between passes, ms. */
export const WIPE_HOLD = 50;
/** The front bows: its middle leads its ends by this many card px. */
const WIPE_ARC = 10;
/** The zone behind the front in which a cell turns, as a fraction of the
 *  sweep: a cell with grain `n` turns when the front is `n · WIPE_GRAIN`
 *  past it. */
export const WIPE_GRAIN = 0.12;
/** A cell turns as a dot growing from a point in it, over this much further
 *  travel of the front. */
export const WIPE_SPREAD = 0.035;
/** The dot's center sits off the cell's center by up to this, in cells, and
 *  the dot grows to this radius, past the cell, so neighbors' dots overlap
 *  into blobs rather than squaring off to a grid. Once the front is well past
 *  a cell's moment the cell is covered outright, whatever the dots did. */
export const DOT_JITTER = 0.35;
const DOT_R = 1.05;
/** Antialiasing on a dot's rim, in cell units. */
const DOT_AA = 0.12;
const WIPE_SOFT = 0.004;

/** The sweep coordinate `d` runs 0..1 across the card, left to right, less
 *  the bow. */
const SWEEP_SPAN = CARD_W;

/** Where a point of the face (card px, centered, y up) sits on the sweep. */
export function sweepOf(x: number, y: number, dir: number): number {
  const yn = y / CARD_H;
  return (dir * x + CARD_W / 2 - WIPE_ARC * (1 - 4 * yn * yn)) / SWEEP_SPAN;
}

/* ── Grain ────────────────────────────────────────────────────────────────── */

/** Cells across and down the face (about 2.9 card px each). */
export const GRAIN_W = 128;
export const GRAIN_H = 80;

/** A cell of the face: where its dot grows from (card px, centered) and its
 *  moment within the grain zone. */
export interface Cell {
  x: number;
  y: number;
  n: number;
}

export interface Grain {
  texture: THREE.DataTexture;
  /** Row-major from the bottom left. */
  cells: Cell[];
}

let grainCache: Grain | null = null;

/** The face's cells, each with a random moment (R) and a random offset for
 *  its dot's center (G, B). Nearest-filtered so a cell reads whole. */
export function grain(): Grain {
  if (grainCache) return grainCache;
  const cells: Cell[] = [];
  const bytes = new Uint8Array(GRAIN_W * GRAIN_H * 4);
  const q = (v: number) => Math.round(v * 255);
  for (let j = 0; j < GRAIN_H; j++) {
    for (let i = 0; i < GRAIN_W; i++) {
      const k = j * GRAIN_W + i;
      const n = q(Math.random());
      const jx = q(Math.random());
      const jy = q(Math.random());
      bytes[k * 4] = n;
      bytes[k * 4 + 1] = jx;
      bytes[k * 4 + 2] = jy;
      bytes[k * 4 + 3] = 255;
      // The same arithmetic as the shader's, off the same 8-bit values.
      const cx = i + 0.5 + (jx / 255 - 0.5) * DOT_JITTER * 2;
      const cy = j + 0.5 + (jy / 255 - 0.5) * DOT_JITTER * 2;
      cells.push({ x: (cx / GRAIN_W - 0.5) * CARD_W, y: (cy / GRAIN_H - 0.5) * CARD_H, n: n / 255 });
    }
  }
  const texture = new THREE.DataTexture(bytes, GRAIN_W, GRAIN_H, THREE.RGBAFormat, THREE.UnsignedByteType);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  grainCache = { texture, cells };
  return grainCache;
}

/** The cell under a point of the face (card px, centered). */
export function cellAt(g: Grain, x: number, y: number): Cell {
  const i = Math.min(GRAIN_W - 1, Math.max(0, Math.floor((x / CARD_W + 0.5) * GRAIN_W)));
  const j = Math.min(GRAIN_H - 1, Math.max(0, Math.floor((y / CARD_H + 0.5) * GRAIN_H)));
  return g.cells[j * GRAIN_W + i];
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
  uGrain: { value: THREE.Texture };
  /** The blank: the stock with the chip set in, and the room it reflects (a
   *  PMREM, the same layout as the scene's): polished steel in the card's
   *  shapeless studio is flat gray, so like the foil it gets a room with
   *  lights in it (`blankStudioTexture`). */
  uBareMap: { value: THREE.Texture | null };
  uBareOrm: { value: THREE.Texture | null };
  uBareNormal: { value: THREE.Texture | null };
  uBareEnv: { value: THREE.Texture | null };
  uBareEnvIntensity: { value: number };
  /** The base: the print's ground, and the print surface without its effects. */
  uBaseMap: { value: THREE.Texture | null };
  uBaseOrm: { value: THREE.Texture | null };
  uBaseNormal: { value: THREE.Texture | null };
}

/** A front's travel: from just before the bowed middle's left edge to past
 *  the far corner and the whole grain zone. */
export const FRONT_START = -WIPE_ARC / SWEEP_SPAN - WIPE_SOFT * 2;
export const FRONT_REST = 1 + WIPE_GRAIN + WIPE_SPREAD + WIPE_SOFT * 2;

/** One set per face; the fronts are shared so both faces sweep together. */
export function createSwapUniforms(shared?: SwapUniforms): SwapUniforms {
  return {
    uFront: shared?.uFront ?? { value: FRONT_REST },
    uBase: shared?.uBase ?? { value: FRONT_REST },
    uPrint: shared?.uPrint ?? { value: FRONT_REST },
    uDir: shared?.uDir ?? { value: 1 },
    uGrain: shared?.uGrain ?? { value: grain().texture },
    uBareMap: { value: null },
    uBareOrm: { value: null },
    uBareNormal: { value: null },
    uBareEnv: shared?.uBareEnv ?? { value: null },
    uBareEnvIntensity: shared?.uBareEnvIntensity ?? { value: 0.85 },
    uBaseMap: { value: null },
    uBaseOrm: { value: null },
    uBaseNormal: { value: null },
  };
}

/** When a front turns a cell: the moment on the sweep its dot starts. */
export function turnOf(cell: Cell, dir: number): number {
  return sweepOf(cell.x, cell.y, dir) + WIPE_GRAIN * cell.n;
}

/** How far a front at `at` has turned a cell: 0 before its moment, 1 once
 *  its dot has spread. */
export function passed(at: number, cell: Cell, dir: number): number {
  return Math.min(1, Math.max(0, (at - turnOf(cell, dir)) / WIPE_SPREAD));
}

const f = (n: number) => n.toFixed(6);

/** How far a front at `at` has grown a dot whose cell turns at `turn`. */
const DOT_FN = /* glsl */ `
float swapDot(float at, float turn, float dist) {
	float r = ${f(DOT_R)} * clamp((at - turn) / ${f(WIPE_SPREAD)}, 0.0, 1.0);
	return (1.0 - smoothstep(r - ${f(DOT_AA)}, r + ${f(DOT_AA)}, dist)) * step(0.001, r);
}
`;

const PARS = /* glsl */ `
#include <common>
varying vec3 vBody;
uniform float uFront;
uniform float uBase;
uniform float uPrint;
uniform float uDir;
uniform sampler2D uGrain;
uniform sampler2D uBareMap;
uniform sampler2D uBareOrm;
uniform sampler2D uBareNormal;
uniform sampler2D uBaseMap;
uniform sampler2D uBaseOrm;
uniform sampler2D uBaseNormal;
uniform sampler2D uBareEnv;
uniform float uBareEnvIntensity;
${DOT_FN}
`;

/** The blank's room, sampled the way three samples the scene's (a PMREM in
 *  the cube-UV layout), declared after three's own IBL functions. */
const BARE_ENV_FNS = /* glsl */ `
#include <envmap_physical_pars_fragment>
#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
	vec3 getBareIrradiance( const in vec3 normal ) {
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		return PI * textureCubeUV( uBareEnv, worldNormal, 1.0 ).rgb * uBareEnvIntensity;
	}
	vec3 getBareRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		vec3 reflectVec = reflect( - viewDir, normal );
		reflectVec = normalize( mix( reflectVec, normal, roughness * roughness ) );
		reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
		return textureCubeUV( uBareEnv, reflectVec, roughness ).rgb * uBareEnvIntensity;
	}
#endif
`;

/** Where the texel is blank, its light comes from the blank's room. */
const BARE_ENV_MIX = /* glsl */ `
#include <lights_fragment_maps>
#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
	if ( swapBare > 0.0 ) {
		iblIrradiance = mix( iblIrradiance, getBareIrradiance( geometryNormal ), swapBare );
		radiance = mix( radiance, getBareRadiance( geometryViewDir, geometryNormal, material.roughness ), swapBare );
		#ifdef USE_CLEARCOAT
			clearcoatRadiance = mix( clearcoatRadiance, getBareRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness ), swapBare );
		#endif
	}
#endif
`;

/** The layer at this texel. Every cell turns at its moment, a front's
 *  passing plus its grain, as a dot growing from a point in it past its
 *  edges; the texel is covered by the furthest-grown dot among its cell's
 *  and its neighbors', and outright once its own cell's moment is well past.
 *  Blank at the first front, base at the second, print at the third. */
const SWEEP = /* glsl */ `
vec2 swapGrid = vec2(${f(GRAIN_W)}, ${f(GRAIN_H)});
vec2 swapSize = vec2(${f(CARD_W)}, ${f(CARD_H)});
vec2 swapCell = (vBody.xy / swapSize + 0.5) * swapGrid;
vec2 swapHome = floor(swapCell);
float swapL1 = 0.0;
float swapL2 = 0.0;
float swapL3 = 0.0;
for (int sj = -1; sj <= 1; sj++) {
	for (int si = -1; si <= 1; si++) {
		vec2 cid = swapHome + vec2(float(si), float(sj));
		vec3 g = texture2D(uGrain, (cid + 0.5) / swapGrid).rgb;
		vec2 center = cid + 0.5 + (g.gb - 0.5) * ${f(DOT_JITTER * 2)};
		vec2 cpos = (center / swapGrid - 0.5) * swapSize;
		float cyn = cpos.y / ${f(CARD_H)};
		float cd = (uDir * cpos.x + ${f(CARD_W / 2)} - ${f(WIPE_ARC)} * (1.0 - 4.0 * cyn * cyn)) / ${f(SWEEP_SPAN)};
		float turn = cd + ${f(WIPE_GRAIN)} * g.r;
		float dist = length(swapCell - center);
		swapL1 = max(swapL1, swapDot(uFront, turn, dist));
		swapL2 = max(swapL2, swapDot(uBase, turn, dist));
		swapL3 = max(swapL3, swapDot(uPrint, turn, dist));
		if (si == 0 && sj == 0) {
			float done = ${f(WIPE_SPREAD * 2)};
			swapL1 = max(swapL1, step(turn + done, uFront));
			swapL2 = max(swapL2, step(turn + done, uBase));
			swapL3 = max(swapL3, step(turn + done, uPrint));
		}
	}
}
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
      .replace('#include <envmap_physical_pars_fragment>', BARE_ENV_FNS)
      .replace('#include <map_fragment>', SWEEP + MAP)
      .replace('#include <roughnessmap_fragment>', ROUGHNESS)
      .replace('#include <metalnessmap_fragment>', METALNESS)
      .replace(NORMAL_LINE, NORMAL_MIXED)
      .replace('#include <lights_fragment_maps>', BARE_ENV_MIX);
  };
  m.customProgramCacheKey = () => 'swap-face';
}
