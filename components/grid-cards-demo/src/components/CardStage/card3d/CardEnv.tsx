'use client';

import { useEffect, useMemo } from 'react';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';

/**
 * The studio the card sits in, as one HDR equirectangular map: a vertical
 * gradient (bright cool ceiling, graphite floor) with two soft lights painted
 * into it, a key above-left-front and a broad fill behind the camera. Painting
 * the lights into the map (rather than placing panel meshes) keeps every edge
 * in the environment smooth; a panel's hard edge reflects as a hard line
 * across a flat card. Float pixels so the lights can exceed white.
 */

const ENV_W = 1024;
const ENV_H = 512;

interface Light {
  /** Direction the light sits in, world space (the card faces +Z, camera at +Z). */
  dir: [number, number, number];
  /** Angular radius, radians, of the soft disc. */
  radius: number;
  /** Radiance at the center (1 = white). */
  intensity: number;
  color: [number, number, number];
}

const LIGHTS: Light[] = [
  // Key: above and a little left, in front. The sheen line on the face.
  { dir: [-0.35, 0.65, 0.7], radius: 0.28, intensity: 2.8, color: [1, 0.995, 0.98] },
  // Fill: behind the camera and off to the upper right, so a head-on face
  // shows it as a soft band across one side rather than a wash over all of it.
  { dir: [0.45, 0.32, 1], radius: 0.34, intensity: 2.0, color: [1, 1, 1] },
];

/** Sphere gradient by elevation: floor graphite → ceiling light gray. The room
 *  itself stays under white so gloss and metal read their color between the
 *  lights instead of mirroring a white wall everywhere. */
function base(y: number): [number, number, number] {
  const t = (y + 1) / 2;
  const stops: Array<[number, [number, number, number]]> = [
    [0, [0.16, 0.158, 0.155]],
    [0.4, [0.36, 0.358, 0.355]],
    [0.68, [0.6, 0.598, 0.592]],
    [1, [0.72, 0.72, 0.715]],
  ];
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const [t0, c0] = stops[i - 1];
      const [t1, c1] = stops[i];
      const k = (t - t0) / (t1 - t0);
      return [c0[0] + (c1[0] - c0[0]) * k, c0[1] + (c1[1] - c0[1]) * k, c0[2] + (c1[2] - c0[2]) * k];
    }
  }
  return stops[stops.length - 1][1];
}

function studioTexture(): THREE.DataTexture {
  const data = new Float32Array(ENV_W * ENV_H * 4);
  const lights = LIGHTS.map((l) => {
    const n = Math.hypot(...l.dir);
    return { ...l, dir: l.dir.map((c) => c / n) as [number, number, number] };
  });
  for (let j = 0; j < ENV_H; j++) {
    // v runs bottom (-π/2) to top (+π/2); a DataTexture's row 0 is v = 0.
    const v = (j + 0.5) / ENV_H;
    const lat = (v - 0.5) * Math.PI;
    for (let i = 0; i < ENV_W; i++) {
      // three's equirect: u = atan2(z, x) / 2π + 0.5.
      const u = (i + 0.5) / ENV_W;
      const lon = (u - 0.5) * Math.PI * 2;
      const x = Math.cos(lat) * Math.cos(lon);
      const z = Math.cos(lat) * Math.sin(lon);
      const y = Math.sin(lat);
      const [r, g, b] = base(y);
      let R = r;
      let G = g;
      let B = b;
      for (const l of lights) {
        const cos = x * l.dir[0] + y * l.dir[1] + z * l.dir[2];
        const ang = Math.acos(Math.max(-1, Math.min(1, cos)));
        // Soft disc: full inside half the radius, smooth falloff to the rim.
        const k = 1 - Math.min(1, Math.max(0, (ang - l.radius * 0.45) / (l.radius * 0.55)));
        const w = k * k * (3 - 2 * k) * l.intensity;
        R += w * l.color[0];
        G += w * l.color[1];
        B += w * l.color[2];
      }
      const o = (j * ENV_W + i) * 4;
      data[o] = R;
      data[o + 1] = G;
      data[o + 2] = B;
      data[o + 3] = 1;
    }
  }
  const t = new THREE.DataTexture(data, ENV_W, ENV_H, THREE.RGBAFormat, THREE.FloatType);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.LinearSRGBColorSpace;
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearFilter;
  t.generateMipmaps = false;
  t.needsUpdate = true;
  return t;
}

export function CardEnv() {
  const map = useMemo(() => studioTexture(), []);
  useEffect(() => () => map.dispose(), [map]);
  return <Environment map={map} background={false} />;
}
