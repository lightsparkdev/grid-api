import * as THREE from 'three';
import { CARD_H, CARD_W } from '@/apps/card/cardMetrics';
import type { CardMaterial } from '@/data/design';
import { CARD_R, faceZOf } from './cardGeometry';
import { grain, GRAIN_H, GRAIN_W, turnOf } from './materialSwap';

/**
 * The stock is laid down as particles: one per cell of the face. Each comes
 * in from above (toward the camera) and a little behind, and lands where its
 * cell's dot grows from at the moment the cell turns to the new stock, so the
 * landing is the change: what the eye sees laying the blank down left to
 * right is the particles arriving. Landed, it rests on the new surface a
 * moment and fades into it. Small, lit by the studio like the card is (a
 * physical material, no glow or blending); polished for steel, matte for
 * PVC. In the card's frame, so they tilt and scale with it.
 */

const PER_FACE = GRAIN_W * GRAIN_H;
const COUNT = PER_FACE * 2;
/** How far ahead of its landing (sweep units) a particle appears. */
const LEAD = 0.07;
/** How long it rests on the face after landing, and then fades. */
const REST = 0.05;
const FADE = 0.05;
/** How high off the face it starts, card px. */
const LIFT = 12;

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

export class MaterialSwarm {
  readonly mesh: THREE.InstancedMesh;
  private readonly material: THREE.MeshPhysicalMaterial;
  private readonly home = new Float32Array(COUNT * 3);
  /** Where on the sweep the front is when the particle's cell turns. */
  private readonly land = new Float32Array(COUNT);
  private readonly size = new Float32Array(COUNT);
  private readonly from = new Float32Array(COUNT * 2);
  private readonly m = new THREE.Matrix4();
  private readonly p = new THREE.Vector3();
  private readonly s = new THREE.Vector3();
  private readonly hidden = new THREE.Matrix4().makeScale(0, 0, 0);
  private running = false;

  constructor() {
    this.material = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.5 });
    this.mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), this.material, COUNT);
    this.mesh.frustumCulled = false;
    this.mesh.visible = false;
    this.hide();
  }

  get active() {
    return this.running;
  }

  /** Scatter the particles for a change to `material`, in the stock's color. */
  begin(material: CardMaterial, color: string, dir: number) {
    const metal = material === 'metal';
    this.material.color.set(color);
    this.material.metalness = metal ? 1 : 0;
    this.material.roughness = metal ? 0.2 : 0.55;
    const z = faceZOf(material);
    const { cells } = grain();
    for (let i = 0; i < COUNT; i++) {
      const side = i < PER_FACE ? 1 : -1;
      const cell = cells[i % PER_FACE];
      this.home[i * 3] = cell.x;
      this.home[i * 3 + 1] = cell.y;
      this.home[i * 3 + 2] = side * z;
      // A cell in a corner round has no face to land on: its particle never shows.
      this.land[i] = onFace(cell.x, cell.y) ? turnOf(cell, dir) : Infinity;
      this.size[i] = rnd(0.7, 1.3);
      // Where it comes in from: behind along the sweep, a little sideways.
      this.from[i * 2] = -dir * rnd(8, 22);
      this.from[i * 2 + 1] = rnd(-6, 6);
    }
    this.running = true;
    this.mesh.visible = true;
  }

  /** Pose the particles for the front at `front` on the sweep. */
  update(front: number) {
    if (!this.running) return;
    const { home, land, size, from, m, p, s, mesh } = this;
    const span = LEAD + REST + FADE;
    const atLand = LEAD / span;
    const atFade = (LEAD + REST) / span;
    for (let i = 0; i < COUNT; i++) {
      // u runs 0 as the particle appears to 1 as it has faded in; it lands
      // at atLand, when its cell turns.
      const u = (front - (land[i] - LEAD)) / span;
      if (u <= 0 || u >= 1) {
        mesh.setMatrixAt(i, this.hidden);
        continue;
      }
      // Coming down: slowing as it nears the face.
      const settle = Math.min(1, u / atLand);
      const ease = 1 - (1 - settle) * (1 - settle);
      const lift = LIFT * (1 - ease);
      const side = Math.sign(home[i * 3 + 2]);
      p.set(
        home[i * 3] + from[i * 2] * (1 - ease),
        home[i * 3 + 1] + from[i * 2 + 1] * (1 - ease),
        home[i * 3 + 2] + side * (lift + 0.6),
      );
      const scale = size[i] * smoothstep(0, 0.15, u) * (1 - smoothstep(atFade, 1, u));
      if (scale <= 0.01) {
        mesh.setMatrixAt(i, this.hidden);
        continue;
      }
      s.setScalar(scale);
      m.compose(p, IDENTITY_Q, s);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  end() {
    if (!this.running) return;
    this.running = false;
    this.hide();
    this.mesh.visible = false;
  }

  private hide() {
    for (let i = 0; i < COUNT; i++) this.mesh.setMatrixAt(i, this.hidden);
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  dispose() {
    this.end();
    this.hide();
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.mesh.dispose();
  }
}

const IDENTITY_Q = new THREE.Quaternion();
