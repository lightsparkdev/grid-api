/**
 * The dove hologram's maps, at the layer's own resolution (the dove is 9.5
 * mm tall; the face's 2048 texels give it 227, too few for grating lines).
 * The silhouetted dove is die-cut to its outline, so the artwork's alpha is
 * the layer's alpha, and its tones say what each part is: the body is a
 * frosted silver that barely colors, the feather ribs and the outer edge are
 * the diffraction foil that throws the rainbow (the artwork's bright fills,
 * plus a band inside the outline). Five canvases: alpha, albedo, a
 * roughness map (dull body, mirror ribs), a normal map with the relief (the
 * film's edge, the ribs a step up, grating lines across the foil), and the
 * grating map the shader reads: per texel the direction the grating's lines
 * run across, their pitch, and how much foil is there.
 */

import { DOVE_MM, doveBox, makeCanvas, type FaceAssets } from './facePaint';
import { heightToNormal } from './surfaceMaps';

export const DOVE_TEX_H = 1024;
/** Layer texels per mm. */
const PX_PER_MM = DOVE_TEX_H / DOVE_MM;

export interface DoveMaps {
  w: number;
  h: number;
  mask: HTMLCanvasElement;
  albedo: HTMLCanvasElement;
  /** G = roughness, B = metalness. */
  orm: HTMLCanvasElement;
  normal: HTMLCanvasElement;
  /** R = grating direction, G = pitch, B = foil (rainbow) weight. */
  grating: HTMLCanvasElement;
}

/** The artwork's bright fills (the ribs and outer feathers) are foil. */
const RIB_LUM = [0.8, 0.9];
/** So is a band this deep inside the outline. */
const EDGE_MM = 0.45;

const PITCH_MIN = 800;
const PITCH_RANGE = 1200;
/** Foil pitch: which angle each color arrives at. Body pitch for its faint color. */
const PITCH_FOIL = 1350;
const PITCH_BODY = 1650;
/** How much rainbow the frosted body gives, next to the foil's 1. */
const BODY_FOIL = 0.12;

function blurred(src: HTMLCanvasElement, radius: number): Uint8ClampedArray {
  const c = makeCanvas(src.width, src.height);
  const ctx = c.getContext('2d')!;
  ctx.filter = `blur(${radius}px)`;
  ctx.drawImage(src, 0, 0);
  return ctx.getImageData(0, 0, c.width, c.height).data;
}

export function paintDoveMaps(assets: FaceAssets): DoveMaps {
  const box = doveBox(assets.dove);
  const h = DOVE_TEX_H;
  const w = Math.round((h * box.w) / box.h);
  const n = w * h;

  // The artwork at layer size: alpha is the outline, luminance the tone.
  const art = makeCanvas(w, h);
  art.getContext('2d')!.drawImage(assets.dove, 0, 0, w, h);
  const px = art.getContext('2d')!.getImageData(0, 0, w, h).data;

  // Alpha, hard, and blurred for the edge band.
  const mask = makeCanvas(w, h);
  const mc = mask.getContext('2d')!;
  mc.drawImage(art, 0, 0);
  mc.globalCompositeOperation = 'source-in';
  mc.fillStyle = '#ffffff';
  mc.fillRect(0, 0, w, h);
  const soft = blurred(mask, EDGE_MM * PX_PER_MM);

  // Per texel: inside, and how much foil.
  const inside = new Uint8Array(n);
  const foil = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const a = px[i * 4 + 3] / 255;
    if (a < 0.5) continue;
    inside[i] = 1;
    const lum = (0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255;
    const rib = Math.min(1, Math.max(0, (lum - RIB_LUM[0]) / (RIB_LUM[1] - RIB_LUM[0])));
    const edge = 1 - Math.min(1, Math.max(0, (soft[i * 4 + 3] / 255 - 0.55) / 0.35));
    foil[i] = Math.max(rib, edge);
  }

  // Grating: the feathers radiate from the body, so the grating's direction
  // turns with the angle about the body's center; each feather takes its
  // color at its own angle, and a turn of the card sweeps the fan.
  const cx = w * 0.5;
  const cy = h * 0.5;
  const linePitch = 0.16 * PX_PER_MM;
  const grating = new ImageData(w, h);
  const lines = new Float32Array(n);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      let ang = Math.atan2(y - cy, x - cx);
      // Fold to [-π/2, π/2): a grating has no sign.
      if (ang < -Math.PI / 2) ang += Math.PI;
      if (ang >= Math.PI / 2) ang -= Math.PI;
      const f = foil[i];
      const pitch = PITCH_BODY + (PITCH_FOIL - PITCH_BODY) * f;
      grating.data[i * 4] = Math.round(((ang + Math.PI / 2) / Math.PI) * 255);
      grating.data[i * 4 + 1] = Math.round(((pitch - PITCH_MIN) / PITCH_RANGE) * 255);
      grating.data[i * 4 + 2] = Math.round((BODY_FOIL + (1 - BODY_FOIL) * f) * 255);
      grating.data[i * 4 + 3] = 255;
      const s = x * Math.cos(ang) + y * Math.sin(ang);
      lines[i] = Math.sin((s / linePitch) * Math.PI * 2) * f;
    }
  }
  const gratingC = makeCanvas(w, h);
  gratingC.getContext('2d')!.putImageData(grating, 0, 0);

  // Albedo: frosted silver body, brighter foil. Roughness: dull body,
  // mirror foil; metal throughout.
  const albedo = new ImageData(w, h);
  const orm = new ImageData(w, h);
  for (let i = 0; i < n; i++) {
    const f = foil[i];
    const tone = Math.round(196 + (232 - 196) * f);
    albedo.data[i * 4] = tone;
    albedo.data[i * 4 + 1] = tone;
    albedo.data[i * 4 + 2] = tone + 4;
    albedo.data[i * 4 + 3] = 255;
    orm.data[i * 4] = 0;
    orm.data[i * 4 + 1] = Math.round((0.42 + (0.08 - 0.42) * f) * 255);
    orm.data[i * 4 + 2] = 255;
    orm.data[i * 4 + 3] = 255;
  }
  const albedoC = makeCanvas(w, h);
  albedoC.getContext('2d')!.putImageData(albedo, 0, 0);
  const ormC = makeCanvas(w, h);
  ormC.getContext('2d')!.putImageData(orm, 0, 0);

  // Relief: the film steps down at its outline over about 0.1 mm; the ribs
  // are embossed a step up with a short bevel; the foil carries the grating
  // lines as a ripple of a few levels.
  const height = makeCanvas(w, h);
  const hc = height.getContext('2d')!;
  hc.fillStyle = '#707070';
  hc.fillRect(0, 0, w, h);
  const film = makeCanvas(w, h);
  const fc = film.getContext('2d')!;
  fc.drawImage(mask, 0, 0);
  fc.globalCompositeOperation = 'source-in';
  fc.fillStyle = '#808080';
  fc.fillRect(0, 0, w, h);
  hc.filter = `blur(${0.05 * PX_PER_MM}px)`;
  hc.drawImage(film, 0, 0);
  hc.filter = 'none';
  const hd = hc.getImageData(0, 0, w, h);
  const ribs = new ImageData(w, h);
  for (let i = 0; i < n; i++) {
    const lum = (0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255;
    const rib = inside[i] ? Math.min(1, Math.max(0, (lum - RIB_LUM[0]) / (RIB_LUM[1] - RIB_LUM[0]))) : 0;
    ribs.data[i * 4] = ribs.data[i * 4 + 1] = ribs.data[i * 4 + 2] = 255;
    ribs.data[i * 4 + 3] = Math.round(rib * 255);
  }
  const ribC = makeCanvas(w, h);
  ribC.getContext('2d')!.putImageData(ribs, 0, 0);
  const ribSoft = blurred(ribC, 0.04 * PX_PER_MM);
  for (let i = 0; i < n; i++) {
    const v = Math.max(0, Math.min(255, hd.data[i * 4] + (ribSoft[i * 4 + 3] / 255) * 16 + lines[i] * 5));
    hd.data[i * 4] = hd.data[i * 4 + 1] = hd.data[i * 4 + 2] = v;
  }
  hc.putImageData(hd, 0, 0);

  return { w, h, mask, albedo: albedoC, orm: ormC, normal: heightToNormal(height, 3.2), grating: gratingC };
}
