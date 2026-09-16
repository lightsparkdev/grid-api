'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Orientation } from '@/data/design';
import { canvasTexture } from './canvasTexture';
import { holoStudioTexture, STUDIO_LIGHTS } from './CardEnv';
import { paintDoveMaps } from './dovePaint';
import { layerFrame } from './faceFrame';
import { doveBox, type FaceAssets } from './facePaint';

/**
 * The dove hologram: the security element the Visa standards require on the
 * back when the mark is printed rather than foil. Built like `FoilMark`: its
 * own plane a hair proud of the back, a metallic material with its own room
 * to reflect, alpha from the dove's outline (the silhouetted dove is die-cut
 * to its shape), relief from a normal map, and a roughness map that makes
 * the body frosted silver and the feather ribs and outer edge mirror foil,
 * which is where the color lives on the real one. Over that, a
 * shader patch adds the rainbow the way a hologram makes one: the surface is
 * a diffraction grating, and for a light at L seen from V the grating
 * equation, sin θ_out − sin θ_in = mλ / p along the grating's direction,
 * picks the wavelength that reaches the eye for each order m. The grating
 * map gives each region its own direction and pitch, so at one angle the
 * regions show different colors (the layered look), and a turn of the card
 * sweeps each through the spectrum, about three times across 60° with orders
 * 1 to 3. The lights are the studio's key and fill, fixed in the world and
 * off the camera's axis, which is why a card held still under a ceiling light
 * shows color head-on: the silver base with a hint of color at rest, the
 * rainbow when it moves. Thin-film iridescence was the other route; at the
 * thickness that would cycle the hue a few times it washes to white, and a
 * hologram is not a film.
 */
const HOLO = {
  envMapIntensity: 0.7,
  normalScale: 1.4,
  /** The rainbow's strength over the silver. */
  gain: 1.4,
  /** How much the diffracted light takes from the mirror's: what goes into
   *  the spectrum is not in the specular, and the colors stay saturated
   *  over a bright base. */
  take: 0.6,
  /** Each order's share; a real grating's higher orders are dimmer. */
  orders: [1.0, 0.55, 0.32],
  /** The studio's lights, drawn in toward the camera's axis by this factor
   *  for the grating only: at their true angles the head-on card was already
   *  a full rainbow; here head-on sits just past the violet end (silver with
   *  a hint), and the first ten degrees of a turn bring the color in. */
  lightSpread: 0.45,
};

/** The dove's plane on the mesh: center (card px), size, and roll, for the
 *  card as held. */
export function doveFrame(assets: FaceAssets, orientation: Orientation) {
  return layerFrame(orientation, 'back', doveBox(assets.dove, orientation));
}

interface HoloUniforms {
  uCamObj: { value: THREE.Vector3 };
  uLight0: { value: THREE.Vector3 };
  uLight1: { value: THREE.Vector3 };
  uLightI: { value: THREE.Vector2 };
  uGrating: { value: THREE.Texture | null };
  uHoloGain: { value: number };
}

const PARS = /* glsl */ `
#include <common>
varying vec3 vObjPos;
uniform vec3 uCamObj;
uniform vec3 uLight0;
uniform vec3 uLight1;
uniform vec2 uLightI;
uniform sampler2D uGrating;
uniform float uHoloGain;

// Wavelength (nm) to linear RGB: Zucconi's six-bump fit to the CIE curves,
// windowed to zero outside the visible band.
vec3 holoBump(vec3 x, vec3 yoffset) {
	vec3 y = 1.0 - x * x;
	return max(y - yoffset, 0.0);
}
vec3 holoSpectrum(float nm) {
	float x = clamp((nm - 400.0) / 300.0, 0.0, 1.0);
	const vec3 c1 = vec3(3.54585104, 2.93225262, 2.41593945);
	const vec3 x1 = vec3(0.69549072, 0.49228336, 0.27699880);
	const vec3 y1 = vec3(0.02312639, 0.15225084, 0.52607955);
	const vec3 c2 = vec3(3.90307140, 3.21182957, 3.96587128);
	const vec3 x2 = vec3(0.11748627, 0.86755042, 0.66077860);
	const vec3 y2 = vec3(0.84897130, 0.88445281, 0.73949448);
	vec3 rgb = holoBump(c1 * (x - x1), y1) + holoBump(c2 * (x - x2), y2);
	float win = smoothstep(380.0, 430.0, nm) * (1.0 - smoothstep(660.0, 720.0, nm));
	return rgb * win;
}
// One light's diffraction toward V off a grating with direction g and pitch
// p (nm), the surface normal perturbed to N. Both V and L point away from
// the surface; V + L projected onto the surface, along g, is
// sin θ_out − sin θ_in.
vec3 holoLight(vec3 V, vec3 L, vec3 N, vec2 g, float p) {
	if (L.z <= 0.0) return vec3(0.0);
	vec3 h = V + L;
	vec3 hp = h - N * dot(h, N);
	float u = abs(dot(hp.xy, g));
	vec3 c = vec3(0.0);
	c += holoSpectrum(u * p) * ${HOLO.orders[0].toFixed(3)};
	c += holoSpectrum(u * p * 0.5) * ${HOLO.orders[1].toFixed(3)};
	c += holoSpectrum(u * p / 3.0) * ${HOLO.orders[2].toFixed(3)};
	return c;
}
`;

const HOLO_FRAG = /* glsl */ `
{
	vec3 holoV = normalize(uCamObj - vObjPos);
	vec3 holoN = texture2D(normalMap, vNormalMapUv).xyz * 2.0 - 1.0;
	holoN.xy *= normalScale;
	holoN = normalize(holoN);
	vec4 holoG = texture2D(uGrating, vNormalMapUv);
	float holoAng = holoG.r * PI - PI * 0.5;
	vec2 holoDir = vec2(cos(holoAng), sin(holoAng));
	float holoPitch = 800.0 + holoG.g * 1200.0;
	vec3 holo = holoLight(holoV, uLight0, holoN, holoDir, holoPitch) * uLightI.x
		+ holoLight(holoV, uLight1, holoN, holoDir, holoPitch) * uLightI.y;
	holo *= uHoloGain * holoG.b;
	float holoAmt = min(1.0, max(holo.r, max(holo.g, holo.b)));
	outgoingLight = outgoingLight * (1.0 - ${HOLO.take.toFixed(3)} * holoAmt) + holo;
}
#include <opaque_fragment>
`;

function patchHoloMaterial(m: THREE.MeshPhysicalMaterial, u: HoloUniforms) {
  m.dithering = true;
  m.onBeforeCompile = (shader) => {
    for (const k of Object.keys(u) as Array<keyof HoloUniforms>) shader.uniforms[k] = u[k];
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vObjPos;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvObjPos = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', PARS)
      .replace('#include <opaque_fragment>', HOLO_FRAG);
  };
  m.customProgramCacheKey = () => 'holo-dove';
}

const WORLD_LIGHTS = STUDIO_LIGHTS.map((l) =>
  new THREE.Vector3(l.dir[0] * HOLO.lightSpread, l.dir[1] * HOLO.lightSpread, l.dir[2]).normalize(),
);
/** The fill's share of the key's, from the studio's intensities. */
const LIGHT_I = new THREE.Vector2(1, STUDIO_LIGHTS[1].intensity / STUDIO_LIGHTS[0].intensity);

export function HoloDove({
  assets,
  backZ,
  orientation,
  visible,
  materialRef,
}: {
  assets: FaceAssets;
  backZ: number;
  /** The plane moves and turns with the composed back. */
  orientation: Orientation;
  visible: boolean;
  /** A material change prints the hologram with the graphics. */
  materialRef: React.MutableRefObject<THREE.MeshPhysicalMaterial | null>;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const uniforms = useMemo<HoloUniforms>(
    () => ({
      uCamObj: { value: new THREE.Vector3(0, 0, 1) },
      uLight0: { value: new THREE.Vector3(0, 0, 1) },
      uLight1: { value: new THREE.Vector3(0, 0, 1) },
      uLightI: { value: LIGHT_I },
      uGrating: { value: null },
      uHoloGain: { value: HOLO.gain },
    }),
    [],
  );
  const material = useMemo(() => {
    // Roughness comes from the map (dull body, mirror foil).
    const m = new THREE.MeshPhysicalMaterial({
      metalness: 1,
      roughness: 1,
      transparent: true,
    });
    const maps = paintDoveMaps(assets);
    m.map = canvasTexture(maps.albedo, true);
    m.alphaMap = canvasTexture(maps.mask);
    m.roughnessMap = canvasTexture(maps.orm);
    m.normalMap = canvasTexture(maps.normal);
    m.normalScale.set(HOLO.normalScale, HOLO.normalScale);
    m.envMap = holoStudioTexture();
    m.envMapIntensity = HOLO.envMapIntensity;
    m.depthWrite = false;
    uniforms.uGrating.value = canvasTexture(maps.grating);
    patchHoloMaterial(m, uniforms);
    return m;
  }, [assets, uniforms]);
  useEffect(() => {
    materialRef.current = material;
    return () => {
      if (materialRef.current === material) materialRef.current = null;
    };
  }, [material, materialRef]);
  useEffect(
    () => () => {
      material.map?.dispose();
      material.alphaMap?.dispose();
      material.roughnessMap?.dispose();
      material.normalMap?.dispose();
      material.envMap?.dispose();
      uniforms.uGrating.value?.dispose();
      material.dispose();
    },
    [material, uniforms],
  );

  // The camera and the lights in the layer's own frame, each frame: the
  // grating math runs in the plane's tangent space, which for a plane is its
  // object space.
  const inv = useMemo(() => new THREE.Matrix4(), []);
  useFrame(({ camera }) => {
    const me = mesh.current;
    if (!me || !visible) return;
    inv.copy(me.matrixWorld).invert();
    uniforms.uCamObj.value.copy(camera.position).applyMatrix4(inv);
    uniforms.uLight0.value.copy(WORLD_LIGHTS[0]).transformDirection(inv);
    uniforms.uLight1.value.copy(WORLD_LIGHTS[1]).transformDirection(inv);
  });

  const frame = doveFrame(assets, orientation);
  return (
    <mesh
      ref={mesh}
      position={[frame.x, frame.y, backZ - 0.08]}
      rotation={[0, Math.PI, frame.rotZ]}
      material={material}
      visible={visible}
    >
      <planeGeometry args={[frame.w, frame.h]} />
    </mesh>
  );
}
