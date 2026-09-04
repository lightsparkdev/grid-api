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
  /** Rotation about the panel's center, radians; 0 is level. */
  tilt?: number;
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
        let dx = dl * Math.cos(lat);
        let dy = lat - p.lat;
        if (p.tilt) {
          const c = Math.cos(p.tilt);
          const s = Math.sin(p.tilt);
          const rx = dx * c + dy * s;
          dy = -dx * s + dy * c;
          dx = rx;
        }
        const ex = 1 - Math.min(1, Math.max(0, (Math.abs(dx) - p.w) / soft));
        const ey = 1 - Math.min(1, Math.max(0, (Math.abs(dy) - p.h) / soft));
        const k = ex * ey * p.intensity;
        R += k * p.color[0];
        G += k * p.color[1];
        B += k * p.color[2];
      }
      const o = (j * w + i) * 4;
      // A panel with a negative intensity is a dark patch; the room stays
      // non-negative.
      data[o] = Math.max(0, R);
      data[o + 1] = Math.max(0, G);
      data[o + 2] = Math.max(0, B);
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
 * The room a steel blank reflects during a material change. The blank is
 * satin, not mirror, so what the face shows is light and shade, not shapes:
 * a few soft lights of unequal brightness at unequal angles, and a few large
 * dark patches (negative panels: the floor, a machine, the ceiling between
 * fixtures) between and below them. On satin they land as pools and shade
 * that drift across the face as the card tilts. (A mirror needed shapes
 * sized to the few degrees a card reflects, and every shape read as either
 * a band or a flat fill.) Sized as the studio is, since a PMREM standing in
 * for the scene's must share its layout.
 */
/** The lights lie across the room at this angle, so their pools cross the
 *  card on a diagonal rather than along its long edge. */
const BLANK_TILT = -0.42;

const BLANK_PANELS: Panel[] = [
  // Lights: a big one above and left, a lesser one right and a little below
  // head-on, a small bright one high right.
  { lon: Math.PI * 0.58, lat: 0.24, w: 0.34, h: 0.1, intensity: 1.3, color: [1, 0.99, 0.97], tilt: BLANK_TILT },
  { lon: Math.PI * 0.4, lat: -0.06, w: 0.26, h: 0.07, intensity: 0.8, color: [1, 1, 1], tilt: BLANK_TILT },
  { lon: Math.PI * 0.32, lat: 0.4, w: 0.12, h: 0.08, intensity: 1.5, color: [1, 1, 1], tilt: BLANK_TILT },
  // Dark: the floor's edge below, a dark mass low left, a gap in the ceiling.
  { lon: Math.PI * 0.5, lat: -0.34, w: 0.7, h: 0.14, intensity: -0.26, color: [1, 1, 1], tilt: BLANK_TILT * 0.5 },
  { lon: Math.PI * 0.68, lat: -0.1, w: 0.18, h: 0.12, intensity: -0.2, color: [1, 1, 1], tilt: BLANK_TILT },
  { lon: Math.PI * 0.5, lat: 0.62, w: 0.3, h: 0.08, intensity: -0.16, color: [1, 1, 1] },
  // The ceiling proper, and something either side for a card turned.
  { lon: Math.PI * 0.5, lat: 1.1, w: 0.7, h: 0.18, intensity: 1.0, color: [1, 1, 1] },
  { lon: Math.PI * 0.82, lat: 0.1, w: 0.1, h: 0.35, intensity: 0.7, color: [1, 1, 1] },
  { lon: Math.PI * 0.18, lat: 0.1, w: 0.1, h: 0.35, intensity: 0.7, color: [1, 1, 1] },
];

/** The room by elevation: mid-light, a little darker toward the floor. */
function blankBase(y: number): number {
  const lat = Math.asin(Math.max(-1, Math.min(1, y)));
  if (lat < -0.6) return 0.28;
  if (lat < -0.2) return 0.28 + (0.42 - 0.28) * ((lat + 0.6) / 0.4);
  return 0.42 + (0.52 - 0.42) * Math.min(1, (lat + 0.2) / 1.4);
}

export function blankStudioTexture(): THREE.DataTexture {
  // Wide edges: on satin nothing should have a line in it.
  return panelStudio(BLANK_PANELS, blankBase, ENV_W, ENV_H, 0.14);
}

export function CardEnv() {
  const map = useMemo(() => studioTexture(), []);
  useEffect(() => () => map.dispose(), [map]);
  return <Environment map={map} background={false} />;
}
