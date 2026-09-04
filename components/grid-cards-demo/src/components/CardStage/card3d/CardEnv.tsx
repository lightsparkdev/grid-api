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
  // Key: above and a little left, more in front than overhead, so a polished
  // region (an etched mark's floor, the chip) shows it from a head-on view.
  { dir: [-0.22, 0.3, 0.93], radius: 0.22, intensity: 3.1, color: [1, 0.995, 0.98] },
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

/**
 * The room the foil reflects. A mirror shows the shapes of what is around it,
 * and the card's studio is deliberately shapeless (soft discs on a gradient,
 * so a flat face shows no hard lines), which in a mirror reads as flat gray.
 * The foil layer has its own environment map, so it gets a room with things
 * in it: softbox panels and a window with edges, over a dark floor. Hard
 * edges are fine on letters a few millimeters tall; they are what make it
 * read as foil.
 */
interface Panel {
  /** Center longitude and latitude, radians (lon 0 = +X, π/2 = +Z, the camera). */
  lon: number;
  lat: number;
  /** Half extents, radians. */
  w: number;
  h: number;
  intensity: number;
  color: [number, number, number];
}

const FOIL_PANELS: Panel[] = [
  // Key softbox, above left in front.
  { lon: Math.PI * 0.62, lat: 0.62, w: 0.42, h: 0.26, intensity: 2.6, color: [1, 0.99, 0.97] },
  // Window behind the camera, a little up and right: the band across a
  // head-on mark.
  { lon: Math.PI * 0.44, lat: 0.2, w: 0.3, h: 0.36, intensity: 1.3, color: [0.97, 0.98, 1] },
  // Strip light low right, so the bottom of the letters catches something.
  { lon: Math.PI * 0.3, lat: -0.3, w: 0.5, h: 0.06, intensity: 2.0, color: [1, 1, 1] },
  // Panel right, for a card turned to the right.
  { lon: Math.PI * 0.12, lat: 0.35, w: 0.22, h: 0.3, intensity: 1.6, color: [1, 1, 1] },
  // Fill card far left, for a card turned to the left.
  { lon: Math.PI * 0.85, lat: 0.1, w: 0.18, h: 0.4, intensity: 1.4, color: [1, 1, 1] },
  // Tall strips either side of the window, so a card turned a little shows
  // a bright streak rather than the bare room.
  { lon: Math.PI * 0.68, lat: 0.0, w: 0.07, h: 0.5, intensity: 1.6, color: [1, 1, 1] },
  { lon: Math.PI * 0.26, lat: -0.05, w: 0.06, h: 0.45, intensity: 1.5, color: [1, 1, 1] },
  // Ceiling strips, for a card pitched up.
  { lon: Math.PI * 0.5, lat: 1.05, w: 1.2, h: 0.05, intensity: 1.8, color: [1, 1, 1] },
  { lon: Math.PI * 0.5, lat: 1.3, w: 1.6, h: 0.05, intensity: 1.8, color: [1, 1, 1] },
];

function foilBase(y: number): number {
  // A bright room: light floor to near-white ceiling, so between the panels
  // the foil reads as silver against a light face too, not as gray; the
  // panels stand out as brighter shapes.
  const t = (y + 1) / 2;
  return 0.4 + 0.5 * t;
}

/** A room of panels over a gray by elevation, as an equirect; `soft` is the
 *  width of a panel's edge in radians (hard for the foil's letters, wide for
 *  a sheet that mirrors the room as soft shapes). */
function panelStudio(panels: Panel[], base: (y: number) => number, w: number, h: number, soft = 0.02): THREE.DataTexture {
  const data = new Float32Array(w * h * 4);
  for (let j = 0; j < h; j++) {
    const lat = ((j + 0.5) / h - 0.5) * Math.PI;
    for (let i = 0; i < w; i++) {
      const lon = ((i + 0.5) / w - 0.5) * Math.PI * 2;
      const b = base(Math.sin(lat));
      let R = b;
      let G = b;
      let B = b;
      for (const p of panels) {
        // Wrap the longitude difference.
        let dl = lon - p.lon;
        dl = Math.atan2(Math.sin(dl), Math.cos(dl));
        const ex = 1 - Math.min(1, Math.max(0, (Math.abs(dl) * Math.cos(lat) - p.w) / soft));
        const ey = 1 - Math.min(1, Math.max(0, (Math.abs(lat - p.lat) - p.h) / soft));
        const k = ex * ey * p.intensity;
        R += k * p.color[0];
        G += k * p.color[1];
        B += k * p.color[2];
      }
      const o = (j * w + i) * 4;
      data[o] = R;
      data[o + 1] = G;
      data[o + 2] = B;
      data[o + 3] = 1;
    }
  }
  const t = new THREE.DataTexture(data, w, h, THREE.RGBAFormat, THREE.FloatType);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.LinearSRGBColorSpace;
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearFilter;
  t.generateMipmaps = false;
  t.needsUpdate = true;
  return t;
}

export function foilStudioTexture(): THREE.DataTexture {
  return panelStudio(FOIL_PANELS, foilBase, 512, 256);
}

/**
 * The room a bare steel blank reflects during a material change: a factory
 * floor under overhead lights, as a stack of mirror-polished sheets shows
 * it. A polished sheet the size of a card reflects only a few degrees of
 * the room, so what it needs is contrast at that scale with soft edges: a
 * dark floor, a horizon, a brighter ceiling, and wide soft lights overhead
 * and ahead, which slide across the face as broad gradients when the card
 * tilts. (The foil's room, built for letters a few millimeters tall, put
 * one bright window across the whole face; a bank of narrow strips read as
 * a texture.) Sized as the studio is, since a PMREM standing in for the
 * scene's must share its layout.
 */
const BLANK_PANELS: Panel[] = [
  // Ceiling lights in the head-on cone (a card a few degrees across reflects
  // about ±0.37 rad across and ±0.23 up): large rectangles, short enough to
  // show their ends on the face, as a stack of polished sheets shows the
  // lights over it. One at rest, one a tilt brings down, one for the
  // bottom of a tilt up.
  { lon: Math.PI * 0.5, lat: 0.02, w: 0.26, h: 0.022, intensity: 0.95, color: [1, 1, 1] },
  { lon: Math.PI * 0.5, lat: 0.17, w: 0.26, h: 0.022, intensity: 0.9, color: [1, 1, 1] },
  { lon: Math.PI * 0.5, lat: -0.13, w: 0.26, h: 0.022, intensity: 0.85, color: [1, 1, 1] },
  { lon: Math.PI * 0.5, lat: 0.32, w: 0.26, h: 0.022, intensity: 0.9, color: [1, 1, 1] },
  // Higher: the ceiling proper.
  { lon: Math.PI * 0.64, lat: 0.66, w: 0.32, h: 0.14, intensity: 1.4, color: [1, 0.99, 0.97] },
  { lon: Math.PI * 0.36, lat: 0.66, w: 0.32, h: 0.14, intensity: 1.2, color: [1, 1, 1] },
  { lon: Math.PI * 0.5, lat: 1.1, w: 0.7, h: 0.18, intensity: 1.5, color: [1, 1, 1] },
  // Something either side for a card turned.
  { lon: Math.PI * 0.8, lat: 0.1, w: 0.1, h: 0.35, intensity: 1.2, color: [1, 1, 1] },
  { lon: Math.PI * 0.2, lat: 0.1, w: 0.1, h: 0.35, intensity: 1.2, color: [1, 1, 1] },
];

/** The room by elevation: a dark floor, a horizon a little below the head-on
 *  line, a light wall and ceiling. Bright enough between the lights that the
 *  steel reads as light silver, as the sheets do, not gunmetal. */
function blankBase(y: number): number {
  const lat = Math.asin(Math.max(-1, Math.min(1, y)));
  if (lat < -0.4) return 0.05;
  if (lat < -0.1) return 0.05 + (0.24 - 0.05) * ((lat + 0.4) / 0.3);
  return 0.24 + (0.4 - 0.24) * Math.min(1, (lat + 0.1) / 1.2);
}

export function blankStudioTexture(): THREE.DataTexture {
  // Edges soft enough to read as blurred lights in a mirror, hard enough to
  // read as lights and not a haze, and for the brush's streaks to break them.
  return panelStudio(BLANK_PANELS, blankBase, ENV_W, ENV_H, 0.03);
}

export function CardEnv() {
  const map = useMemo(() => studioTexture(), []);
  useEffect(() => () => map.dispose(), [map]);
  return <Environment map={map} background={false} />;
}
