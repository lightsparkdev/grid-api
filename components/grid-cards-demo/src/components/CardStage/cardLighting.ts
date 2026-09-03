/**
 * The card's lighting, solved rather than drawn.
 *
 * One studio: a soft key light fixed in world space in front of and above-left
 * of the card, plus a vertical environment (bright ceiling, dark floor). The
 * card is a flat slab whose pose (tilt from the cursor, spin from a drag or the
 * reveal flip) changes every frame. Each frame this solves, per face, where the
 * key's mirror highlight lands on the face, how bright the face is (N·L), what
 * part of the environment it reflects, how much the reflection strengthens at
 * grazing angles (Fresnel), and which way the light rakes across the surface.
 * The results are written as CSS custom properties on the face container;
 * every material layer (specular lobe, brushed grain sparkle, environment
 * reflection, chip bevels, holographic phase, ground shadow) reads them. The
 * face stays DOM, so the same node renders identically inside the phone.
 *
 * Coordinates are CSS: x right, y down, z toward the viewer, in card pixels at
 * the card's intrinsic size (370 × 232), origin at the card center.
 */

import { CARD_H, CARD_W } from '@/apps/card/cardMetrics';

/** Studio key light position in world card-pixels, relative to the card center. */
export const KEY_LIGHT = { x: -110, y: -170, z: 720 };
/** How far the environment reflection slides per unit of reflected direction. */
const ENV_TRAVEL = 120;
/** Rainbow phase travel (px of gradient) per unit of half-vector tilt. */
const HOLO_TRAVEL = { x: 760, y: 420 };

export interface Pose {
  /** Degrees, applied as CSS `rotateX(rx) rotateY(ry)` (rotateX outermost). */
  rotateX: number;
  rotateY: number;
}

export type Face = 'front' | 'back';

export interface FaceLight {
  /** The face is turned toward the viewer (N·E > 0). */
  visible: boolean;
  /** Mirror highlight of the key on this face, px from the face's top-left. */
  specX: number;
  specY: number;
  /** Highlight radius scale (1 at the rest pose). */
  specR: number;
  /** Highlight intensity 0..1 (light falloff × Fresnel × visibility). */
  specA: number;
  /** Lambert term 0..1 for the face. */
  diffuse: number;
  /** Environment sample position for `background-position`, in percent. */
  envX: number;
  envY: number;
  /** Schlick Fresnel weight 0..1 (before F0). */
  fresnel: number;
  /** Holographic phase, px offset of the rainbow gradient. */
  holo: number;
  /** Direction toward the light across the face: CSS gradient angle (deg)... */
  lightAngle: number;
  /** ...and as a unit vector in face px coords (y down). */
  lx: number;
  ly: number;
}

type V3 = [number, number, number];

const DEG = Math.PI / 180;

/** CSS rotateX(a): x fixed; positive tips the top edge away from the viewer. */
function rotX(v: V3, a: number): V3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c];
}

/** CSS rotateY(b): y fixed; positive tips the right edge away from the viewer. */
function rotY(v: V3, b: number): V3 {
  const c = Math.cos(b);
  const s = Math.sin(b);
  return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
}

function norm(v: V3): V3 {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

/**
 * Solve the light for one face of a card in `pose`.
 *
 * The transform is world = Rx(rx) · Ry(ry) · local, so local = Ry(-ry) · Rx(-rx)
 * · world. The back face is the same slab seen from behind, and its content is
 * mirrored in x (it is rendered under `rotateY(180deg)`), so its frame is
 * (-x, y, -z) of the front's.
 */
export function solveFaceLight(pose: Pose, face: Face): FaceLight {
  const rx = pose.rotateX * DEG;
  const ry = pose.rotateY * DEG;
  const toLocal = (w: V3): V3 => rotY(rotX(w, -rx), -ry);
  const toWorld = (l: V3): V3 => rotX(rotY(l, ry), rx);

  const eyeW: V3 = [0, 0, 1];
  let eye = toLocal(eyeW);
  let light = toLocal([KEY_LIGHT.x, KEY_LIGHT.y, KEY_LIGHT.z]);
  let sx = 1;
  if (face === 'back') {
    eye = [-eye[0], eye[1], -eye[2]];
    light = [-light[0], light[1], -light[2]];
    sx = -1;
  }

  const [ex, ey, ez] = eye;
  const visible = ez > 0.02;
  // The key's mirror image on the plane z = 0: the point P where the direction
  // to the light equals the eye direction reflected about the normal,
  // (-ex, -ey, ez). Solving P = L - R · (Lz / ez).
  const t = light[2] / Math.max(ez, 0.02);
  const px = light[0] + ex * t;
  const py = light[1] + ey * t;

  // Lambert with the light direction from the face center.
  const ldir = norm(light);
  const diffuse = Math.max(0, ldir[2]);

  // Schlick: the face turned toward grazing reflects more of everything.
  const cosNE = Math.max(0, ez);
  const fresnel = Math.pow(1 - cosNE, 5);

  // Highlight size follows the light's distance from the plane; the intensity
  // is the light's cosine falloff plus the Fresnel lift.
  const specR = Math.max(0.4, light[2] / KEY_LIGHT.z);
  const specA = visible ? Math.min(1, 0.55 + 0.45 * diffuse + 0.6 * fresnel) : 0;

  // Environment: the reflected view direction in world space picks the sample.
  const nW = toWorld(face === 'back' ? [0, 0, -1] : [0, 0, 1]);
  const ndotE = nW[0] * eyeW[0] + nW[1] * eyeW[1] + nW[2] * eyeW[2];
  const rW: V3 = [2 * ndotE * nW[0] - eyeW[0], 2 * ndotE * nW[1] - eyeW[1], 2 * ndotE * nW[2] - eyeW[2]];
  const envX = 50 + sx * rW[0] * ENV_TRAVEL;
  const envY = 50 + rW[1] * ENV_TRAVEL;

  // Hologram: a diffraction grating shifts hue with the half vector's tilt.
  const h = norm([ldir[0] + ex, ldir[1] + ey, ldir[2] + ez]);
  const holo = h[0] * HOLO_TRAVEL.x + h[1] * HOLO_TRAVEL.y;

  // Raking direction across the face (toward the light), for bevels and bands.
  const lLen = Math.hypot(ldir[0], ldir[1]) || 1;
  const lx = ldir[0] / lLen;
  const ly = ldir[1] / lLen;
  const lightAngle = (Math.atan2(lx, -ly) * 180) / Math.PI;

  return {
    visible,
    specX: CARD_W / 2 + px,
    specY: CARD_H / 2 + py,
    specR,
    specA,
    diffuse,
    envX,
    envY,
    fresnel,
    holo,
    lightAngle,
    lx,
    ly,
  };
}

const f = (n: number, d = 2) => n.toFixed(d);

/** Write a solved face onto its container as CSS custom properties. */
export function applyFaceLight(el: HTMLElement, l: FaceLight) {
  const s = el.style;
  s.setProperty('--spec-x', `${f(l.specX, 1)}px`);
  s.setProperty('--spec-y', `${f(l.specY, 1)}px`);
  s.setProperty('--spec-r', f(l.specR, 3));
  s.setProperty('--spec-a', f(l.specA, 3));
  s.setProperty('--diffuse', f(l.diffuse, 3));
  s.setProperty('--env-x', `${f(l.envX, 2)}%`);
  s.setProperty('--env-y', `${f(l.envY, 2)}%`);
  s.setProperty('--fresnel', f(l.fresnel, 3));
  s.setProperty('--holo', `${f(l.holo, 1)}px`);
  s.setProperty('--light-angle', `${f(l.lightAngle, 1)}deg`);
  s.setProperty('--lx', f(l.lx, 3));
  s.setProperty('--ly', f(l.ly, 3));
}

/** Ground-shadow offset for the card shell: opposite the key, in px. */
export const SHADOW_OFFSET = {
  x: (-KEY_LIGHT.x / KEY_LIGHT.z) * 26,
  y: (-KEY_LIGHT.y / KEY_LIGHT.z) * 26,
};
