import * as THREE from 'three';
import { CARD_H, CARD_W } from '@/apps/card/cardMetrics';
import type { CardMaterial } from '@/data/design';
import { CARD_R, faceZOf } from './cardGeometry';
import { FRONT_REST, grain, GRAIN_H, GRAIN_W, turnOf } from './materialSwap';

/**
 * The particles of a material change, one per cell of the face, two sets.
 *
 * The stock's: each falls in from above the card and a little off the face,
 * slowing as it comes down, and lands where its cell's dot grows from at the
 * moment the cell turns to the new stock, so the landing is the change: what
 * the eye sees laying the blank down left to right is the particles arriving.
 * Landed, it rests on the new surface a moment and fades into it.
 *
 * The old face's: at that same moment its cell's dust lifts off, in the color
 * the face had there, and floats up and away, thinning as it goes, the way a
 * body comes apart in Infinity War.
 *
 * Small, lit by the studio like the card is (physical materials, no glow or
 * blending); the stock polished for steel, matte for PVC. In the card's frame,
 * so they tilt and scale with it.
 */

const PER_FACE = GRAIN_W * GRAIN_H;
const COUNT = PER_FACE * 2;
/** How far ahead of its landing (sweep units) a stock particle appears. */
const LEAD = 0.07;
/** How long it rests on the face after landing, and then fades. */
const REST = 0.05;
const FADE = 0.05;
/** Where it falls from: this high off the face, and this far up the card. */
const LIFT = 12;
const DROP = 26;
/** How long (sweep units) the dust is in the air, and how far it travels. */
const DUST_SPAN = 0.22;
const DUST_RISE = 70;
const DUST_LIFT = 26;

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Whether a point of the face is inside the squircle (not a corner round). */
function onFace(x: number, y: number): boolean {
  const cx = CARD_W / 2 - CARD_R;
  const cy = CARD_H / 2 - CARD_R;
  const ax = Math.abs(x);
  const ay = Math.abs(y);
  return !(ax > cx && ay > cy && Math.hypot(ax - cx, ay - cy) > CARD_R) && ax <= CARD_W / 2 && ay <= CARD_H / 2;
}

/** The old face's color under a cell, for the dust: the face canvases
 *  shrunk to the cell grid and read back. The back's texture is mirrored
 *  in u; canvas y runs down. */
function faceColors(front: HTMLCanvasElement, back: HTMLCanvasElement): Uint8ClampedArray[] {
  return [front, back].map((canvas, side) => {
    const small = document.createElement('canvas');
    small.width = GRAIN_W;
    small.height = GRAIN_H;
    const ctx = small.getContext('2d')!;
    if (side === 1) {
      ctx.translate(GRAIN_W, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(canvas, 0, 0, GRAIN_W, GRAIN_H);
    return ctx.getImageData(0, 0, GRAIN_W, GRAIN_H).data;
  });
}

export class MaterialSwarm {
  /** The new stock, landing. */
  readonly stock: THREE.InstancedMesh;
  /** The old face, leaving. */
  readonly dust: THREE.InstancedMesh;
  private readonly stockMaterial: THREE.MeshPhysicalMaterial;
  private readonly dustMaterial: THREE.MeshPhysicalMaterial;
  private readonly home = new Float32Array(COUNT * 3);
  /** Where on the sweep the front is when the particle's cell turns. */
  private readonly turn = new Float32Array(COUNT);
  private readonly size = new Float32Array(COUNT);
  private readonly from = new Float32Array(COUNT * 2);
  private readonly wind = new Float32Array(COUNT * 3);
  private readonly m = new THREE.Matrix4();
  private readonly p = new THREE.Vector3();
  private readonly s = new THREE.Vector3();
  private readonly c = new THREE.Color();
  private readonly hidden = new THREE.Matrix4().makeScale(0, 0, 0);
  private running = false;

  constructor() {
    const geometry = new THREE.IcosahedronGeometry(1, 0);
    this.stockMaterial = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.5 });
    this.dustMaterial = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.65 });
    this.stock = new THREE.InstancedMesh(geometry, this.stockMaterial, COUNT);
    this.dust = new THREE.InstancedMesh(geometry, this.dustMaterial, COUNT);
    // Instance colors on the dust, so each grain is the color it came from.
    this.dust.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(COUNT * 3), 3);
    for (const mesh of [this.stock, this.dust]) {
      mesh.frustumCulled = false;
      mesh.visible = false;
    }
    this.hide();
  }

  get active() {
    return this.running;
  }

  /** Whether everything has landed and every grain of dust is gone, for a
   *  front at `front` (which may run on past the pass). */
  finished(front: number) {
    return front > FRONT_REST + DUST_SPAN;
  }

  /** Lay out both sets for a change to `material`: the stock in its color,
   *  the dust in the colors of the faces as painted. */
  begin(material: CardMaterial, color: string, dir: number, faces: [HTMLCanvasElement, HTMLCanvasElement]) {
    const metal = material === 'metal';
    this.stockMaterial.color.set(color);
    this.stockMaterial.metalness = metal ? 1 : 0;
    this.stockMaterial.roughness = metal ? 0.2 : 0.55;
    const z = faceZOf(material);
    const { cells } = grain();
    const colors = faceColors(faces[0], faces[1]);
    const dustColor = this.dust.instanceColor!;
    for (let i = 0; i < COUNT; i++) {
      const side = i < PER_FACE ? 1 : -1;
      const k = i % PER_FACE;
      const cell = cells[k];
      this.home[i * 3] = cell.x;
      this.home[i * 3 + 1] = cell.y;
      this.home[i * 3 + 2] = side * z;
      // A cell in a corner round has no face: its particles never show.
      this.turn[i] = onFace(cell.x, cell.y) ? turnOf(cell, dir) : Infinity;
      this.size[i] = rnd(0.7, 1.3);
      // The stock falls in from above the card, a little behind the front.
      this.from[i * 2] = -dir * rnd(4, 14);
      this.from[i * 2 + 1] = rnd(DROP * 0.6, DROP * 1.4);
      // The dust drifts up and on with the front, and off the face.
      this.wind[i * 3] = dir * rnd(10, 45);
      this.wind[i * 3 + 1] = rnd(DUST_RISE * 0.6, DUST_RISE * 1.4);
      this.wind[i * 3 + 2] = side * rnd(DUST_LIFT * 0.5, DUST_LIFT * 1.5);
      // The canvas row for this cell: cells count up from the bottom, the
      // canvas from the top.
      const row = GRAIN_H - 1 - Math.floor(k / GRAIN_W);
      const o = (row * GRAIN_W + (k % GRAIN_W)) * 4;
      const px = colors[side === 1 ? 0 : 1];
      this.c.setRGB(px[o] / 255, px[o + 1] / 255, px[o + 2] / 255, THREE.SRGBColorSpace);
      dustColor.setXYZ(i, this.c.r, this.c.g, this.c.b);
    }
    dustColor.needsUpdate = true;
    this.running = true;
    this.stock.visible = true;
    this.dust.visible = true;
  }

  /** Pose the particles for the front at `front` on the sweep. */
  update(front: number) {
    if (!this.running) return;
    const { home, turn, size, from, wind, m, p, s } = this;
    const span = LEAD + REST + FADE;
    const atLand = LEAD / span;
    const atFade = (LEAD + REST) / span;
    let stockShown = false;
    let dustShown = false;
    for (let i = 0; i < COUNT; i++) {
      const side = Math.sign(home[i * 3 + 2]);
      const hx = home[i * 3];
      const hy = home[i * 3 + 1];
      const hz = home[i * 3 + 2];

      // The stock: u runs 0 as it appears to 1 as it has faded in; it lands
      // at atLand, when its cell turns.
      const u = (front - (turn[i] - LEAD)) / span;
      if (u > 0 && u < 1) {
        const settle = Math.min(1, u / atLand);
        const ease = 1 - (1 - settle) * (1 - settle);
        p.set(
          hx + from[i * 2] * (1 - ease),
          hy + from[i * 2 + 1] * (1 - ease),
          hz + side * (LIFT * (1 - ease) + 0.6),
        );
        const scale = size[i] * smoothstep(0, 0.15, u) * (1 - smoothstep(atFade, 1, u));
        if (scale > 0.01) {
          s.setScalar(scale);
          m.compose(p, IDENTITY_Q, s);
          this.stock.setMatrixAt(i, m);
          stockShown = true;
        } else this.stock.setMatrixAt(i, this.hidden);
      } else this.stock.setMatrixAt(i, this.hidden);

      // The dust: off at the turn, gone DUST_SPAN later.
      const v = (front - turn[i]) / DUST_SPAN;
      if (v > 0 && v < 1) {
        // Rises with a little lift at first, then coasts; a slow sway.
        const rise = 1 - (1 - v) * (1 - v);
        const sway = Math.sin(v * 9 + hx * 0.3) * 3 * v;
        p.set(hx + wind[i * 3] * rise + sway, hy + wind[i * 3 + 1] * rise, hz + wind[i * 3 + 2] * rise + side * 0.6);
        const scale = size[i] * 0.9 * (1 - smoothstep(0.35, 1, v));
        if (scale > 0.01) {
          s.setScalar(scale);
          m.compose(p, IDENTITY_Q, s);
          this.dust.setMatrixAt(i, m);
          dustShown = true;
        } else this.dust.setMatrixAt(i, this.hidden);
      } else this.dust.setMatrixAt(i, this.hidden);
    }
    this.stock.instanceMatrix.needsUpdate = true;
    this.dust.instanceMatrix.needsUpdate = true;
    this.stock.visible = stockShown;
    this.dust.visible = dustShown;
  }

  end() {
    if (!this.running) return;
    this.running = false;
    this.hide();
  }

  private hide() {
    for (const mesh of [this.stock, this.dust]) {
      for (let i = 0; i < COUNT; i++) mesh.setMatrixAt(i, this.hidden);
      mesh.instanceMatrix.needsUpdate = true;
      mesh.visible = false;
    }
  }

  dispose() {
    this.end();
    this.hide();
    this.stock.geometry.dispose();
    this.stockMaterial.dispose();
    this.dustMaterial.dispose();
    this.stock.dispose();
    this.dust.dispose();
  }
}

const IDENTITY_Q = new THREE.Quaternion();
