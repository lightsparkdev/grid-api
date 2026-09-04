import * as THREE from 'three';
import { CARD_H, CARD_W } from '@/apps/card/cardMetrics';

/**
 * A material change is three passes in one direction, the way a card is
 * made. The new stock is laid down as a blank (polished steel, or white PVC)
 * across the whole card; then the print's base (the color, gradient, or art)
 * over it; then the graphics (the brand, the back's text, the effects). Each
 * pass is laid grain by grain: the face is cut into cells about a pixel
 * across, each with its own moment inside a zone behind a bowed front that
 * sweeps left to right, so a layer arrives as a fine dither that fills in
 * rather than as a line. On the first pass the grains are particles: each
 * comes in from above and lands on its cell at the moment the cell turns,
 * and the old face's grain lifts off from the same spot, so what the eye
 * sees laying the stock down is the particles landing and the old surface
 * coming apart, the way the project tracker's rows do.
 */

/** One pass, ms. */
export const WIPE_MS = 300;
/** Between passes, ms. */
export const WIPE_HOLD = 30;
/** The front bows: its middle leads its ends by this many card px. */
const WIPE_ARC = 10;
/** The zone behind the front in which a cell turns, as a fraction of the
 *  sweep: a cell with grain `n` turns when the front is `n · WIPE_GRAIN`
 *  past it. */
export const WIPE_GRAIN = 0.12;
/** Antialiasing at a cell's turn, in sweep units (under a texel's worth). */
const WIPE_SOFT = 0.002;

/** The sweep coordinate `d` runs 0..1 across the card, left to right, less
 *  the bow. */
const SWEEP_SPAN = CARD_W;

/** Where a point of the face (card px, centered, y up) sits on the sweep. */
export function sweepOf(x: number, y: number, dir: number): number {
  const yn = y / CARD_H;
  return (dir * x + CARD_W / 2 - WIPE_ARC * (1 - 4 * yn * yn)) / SWEEP_SPAN;
}

/* ── Grain ────────────────────────────────────────────────────────────────── */

/** Cells across and down the face (about 1.15 card px each). */
export const GRAIN_W = 320;
export const GRAIN_H = 200;

/** A cell of the face: its center (card px, centered) and its moment within
 *  the grain zone. */
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

/** The face's cells, each with a random moment. Nearest-filtered so a cell
 *  turns whole. */
export function grain(): Grain {
  if (grainCache) return grainCache;
  const cells: Cell[] = [];
  const bytes = new Uint8Array(GRAIN_W * GRAIN_H * 4);
  for (let j = 0; j < GRAIN_H; j++) {
    for (let i = 0; i < GRAIN_W; i++) {
      const k = j * GRAIN_W + i;
      const n = Math.round(Math.random() * 255);
      bytes[k * 4] = n;
      bytes[k * 4 + 3] = 255;
      cells.push({ x: ((i + 0.5) / GRAIN_W - 0.5) * CARD_W, y: ((j + 0.5) / GRAIN_H - 0.5) * CARD_H, n: n / 255 });
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
  /** The blank's roughness relative to its surface's: under 1 for a mirror. */
  uBareRoughScale: { value: number };
  /** 1 when the blank is steel: it takes the room, the mirror roughness, and
   *  the brush. A PVC blank is lit like the rest of the card. */
  uBareSteel: { value: number };
  /** The base: the print's ground, and the print surface without its effects. */
  uBaseMap: { value: THREE.Texture | null };
  uBaseOrm: { value: THREE.Texture | null };
  uBaseNormal: { value: THREE.Texture | null };
  /** The chip is set after the print: while `uChipHide` is 1 the face shows
   *  the base under the chip's mask (the front's; the back's is empty) and a
   *  separate mesh carries the chip down onto the card. */
  uChipMask: { value: THREE.Texture | null };
  uChipHide: { value: number };
}

/** A front's travel: from just before the bowed middle's left edge to past
 *  the far corner and the whole grain zone. */
export const FRONT_START = -WIPE_ARC / SWEEP_SPAN - WIPE_SOFT * 2;
export const FRONT_REST = 1 + WIPE_GRAIN + WIPE_SOFT * 2;

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
    uBareEnvIntensity: shared?.uBareEnvIntensity ?? { value: 1 },
    uBareRoughScale: shared?.uBareRoughScale ?? { value: 0.35 },
    uBareSteel: shared?.uBareSteel ?? { value: 0 },
    uBaseMap: { value: null },
    uBaseOrm: { value: null },
    uBaseNormal: { value: null },
    uChipMask: { value: null },
    uChipHide: shared?.uChipHide ?? { value: 0 },
  };
}

/** When a front turns a cell: the moment on the sweep its dot starts. */
export function turnOf(cell: Cell, dir: number): number {
  return sweepOf(cell.x, cell.y, dir) + WIPE_GRAIN * cell.n;
}

/** Whether a front at `at` has turned a cell, 1 once it has (over a short
 *  ramp, for things that fade with a cell rather than flip). */
export function passed(at: number, cell: Cell, dir: number): number {
  return Math.min(1, Math.max(0, (at - turnOf(cell, dir)) / 0.02));
}

const f = (n: number) => n.toFixed(6);

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
uniform float uBareRoughScale;
uniform float uBareSteel;
uniform sampler2D uChipMask;
uniform float uChipHide;
`;

/** How brushed the blank is (three's `anisotropy` on the face materials; the
 *  shader zeroes it off the blank), and the brush's direction. Very light: a
 *  streak the eye reads as a sheet, not a texture. */
export const BLANK_ANISOTROPY = 0.08;
export const BLANK_ANISOTROPY_ROTATION = 0;

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
	#ifdef USE_ANISOTROPY
		vec3 getBareAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			vec3 bentNormal = cross( bitangent, viewDir );
			bentNormal = normalize( cross( bentNormal, bitangent ) );
			bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
			return getBareRadiance( viewDir, bentNormal, roughness );
		}
	#endif
#endif
`;

/** Where the texel is blank, its light comes from the blank's room. */
const BARE_ENV_MIX = /* glsl */ `
#include <lights_fragment_maps>
#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
	float swapRoom = swapBare * uBareSteel;
	if ( swapRoom > 0.0 ) {
		iblIrradiance = mix( iblIrradiance, getBareIrradiance( geometryNormal ), swapRoom );
		#ifdef USE_ANISOTROPY
			vec3 bareRadiance = getBareAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 bareRadiance = getBareRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		radiance = mix( radiance, bareRadiance, swapRoom );
		#ifdef USE_CLEARCOAT
			clearcoatRadiance = mix( clearcoatRadiance, getBareRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness ), swapRoom );
		#endif
	}
#endif
`;

/** The layer at this texel. Its cell turns at its moment, a front's passing
 *  plus its grain: to the blank at the first front, the base at the second,
 *  the print at the third. Cells are about a pixel, so a pass arrives as a
 *  fine dither. */
const SWEEP = /* glsl */ `
vec2 swapSize = vec2(${f(CARD_W)}, ${f(CARD_H)});
vec2 swapCellUv = (floor((vBody.xy / swapSize + 0.5) * vec2(${f(GRAIN_W)}, ${f(GRAIN_H)})) + 0.5) / vec2(${f(GRAIN_W)}, ${f(GRAIN_H)});
vec2 swapCellPos = (swapCellUv - 0.5) * swapSize;
float swapYn = swapCellPos.y / ${f(CARD_H)};
float swapD = (uDir * swapCellPos.x + ${f(CARD_W / 2)} - ${f(WIPE_ARC)} * (1.0 - 4.0 * swapYn * swapYn)) / ${f(SWEEP_SPAN)};
float swapTurn = swapD + ${f(WIPE_GRAIN)} * texture2D(uGrain, swapCellUv).r;
float swapL1 = smoothstep(swapTurn - ${f(WIPE_SOFT)}, swapTurn, uFront);
float swapL2 = smoothstep(swapTurn - ${f(WIPE_SOFT)}, swapTurn, uBase);
float swapL3 = smoothstep(swapTurn - ${f(WIPE_SOFT)}, swapTurn, uPrint);
float swapBare = swapL1 * (1.0 - swapL2);
float swapBase = swapL2 * (1.0 - swapL3);
float swapPrint = 1.0 - swapBare - swapBase;
#ifdef USE_MAP
	// The chip's texels show the base until the chip has been set.
	float swapChip = uChipHide * texture2D(uChipMask, vMapUv).r * swapPrint;
	swapPrint -= swapChip;
	swapBase += swapChip;
#endif
`;

const MAP = /* glsl */ `
#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D(map, vMapUv) * swapPrint + texture2D(uBareMap, vMapUv) * swapBare + texture2D(uBaseMap, vMapUv) * swapBase;
	diffuseColor *= sampledDiffuseColor;
#endif
`;

/** The blank's roughness is its surface's, scaled: a polished blank is a
 *  mirror, more so than the finished polished card. */
const ROUGHNESS = /* glsl */ `
float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D(roughnessMap, vRoughnessMapUv) * swapPrint + texture2D(uBareOrm, vRoughnessMapUv) * mix(1.0, uBareRoughScale, uBareSteel) * swapBare + texture2D(uBaseOrm, vRoughnessMapUv) * swapBase;
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

/** The normal chunk with its sample mixed among the layers. Includes are
 *  expanded after `onBeforeCompile`, so the chunk is expanded here to edit
 *  the line. */
const NORMAL_LINE = 'vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;';
const NORMAL_MIXED =
  'vec3 mapN = (texture2D(normalMap, vNormalMapUv) * swapPrint + texture2D(uBareNormal, vNormalMapUv) * swapBare + texture2D(uBaseNormal, vNormalMapUv) * swapBase).xyz * 2.0 - 1.0;';
const NORMAL_CHUNK = (() => {
  const chunk = THREE.ShaderChunk.normal_fragment_maps;
  if (!chunk.includes(NORMAL_LINE)) throw new Error('materialSwap: three\'s normal_fragment_maps chunk has changed');
  return chunk.replace(NORMAL_LINE, NORMAL_MIXED);
})();

/** The blank is brushed, very lightly: three's anisotropy, scaled by the
 *  layer so the print has none. */
const ANISO_LINE = 'vec2 anisotropyV = anisotropyVector;';
const ANISO_MIXED = 'vec2 anisotropyV = anisotropyVector * swapBare * uBareSteel;';
const PHYSICAL_CHUNK = (() => {
  const chunk = THREE.ShaderChunk.lights_physical_fragment;
  if (!chunk.includes(ANISO_LINE)) throw new Error('materialSwap: three\'s lights_physical_fragment chunk has changed');
  return chunk.replace(ANISO_LINE, ANISO_MIXED);
})();

export function patchFaceMaterial(m: THREE.MeshPhysicalMaterial, u: SwapUniforms) {
  // On the material so three compiles its anisotropy path; the shader keeps
  // it to the blank.
  m.anisotropy = BLANK_ANISOTROPY;
  m.anisotropyRotation = BLANK_ANISOTROPY_ROTATION;
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
      .replace('#include <normal_fragment_maps>', NORMAL_CHUNK)
      .replace('#include <lights_physical_fragment>', PHYSICAL_CHUNK)
      .replace('#include <lights_fragment_maps>', BARE_ENV_MIX);
  };
  m.customProgramCacheKey = () => 'swap-face';
}
