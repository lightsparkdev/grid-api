import * as THREE from 'three';
import { CARD_H, CARD_W } from '@/apps/card/cardMetrics';
import type { CardMaterial } from '@/data/design';
import { CARD_R, faceZOf } from './cardGeometry';
import { sweepOf } from './materialSwap';

/**
 * A dusting of the new stock along the wipe's front: small particles, lit by
 * the studio like the card is, that hang just ahead of the edge and settle
 * onto the face as it passes over them. In the card's frame, so they tilt and
 * scale with it. Steel particles are metal; PVC ones are matte.
 */

const PER_FACE = 900;
const COUNT = PER_FACE * 2;
/** How far ahead of the front (sweep units) a particle appears, and how far
 *  behind it it is gone. */
const LEAD = 0.05;
const TRAIL = 0.06;
/** How high off the face it starts, card px. */
const LIFT = 9;

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** A point on the face, inside the squircle (the corner rounds rejected). */
function facePoint(): [number, number] {
  for (;;) {
    const x = rnd(-CARD_W / 2, CARD_W / 2);
    const y = rnd(-CARD_H / 2, CARD_H / 2);
    const cx = CARD_W / 2 - CARD_R;
    const cy = CARD_H / 2 - CARD_R;
    const ax = Math.abs(x);
    const ay = Math.abs(y);
    if (ax > cx && ay > cy && Math.hypot(ax - cx, ay - cy) > CARD_R) continue;
    return [x, y];
  }
}

export class MaterialSwarm {
  readonly mesh: THREE.InstancedMesh;
  private readonly material: THREE.MeshPhysicalMaterial;
  private readonly home = new Float32Array(COUNT * 3);
  /** Each particle's place on the sweep. */
  private readonly d = new Float32Array(COUNT);
  private readonly size = new Float32Array(COUNT);
  private readonly drift = new Float32Array(COUNT * 2);
  private readonly m = new THREE.Matrix4();
  private readonly p = new THREE.Vector3();
  private readonly s = new THREE.Vector3();
  private readonly hidden = new THREE.Matrix4().makeScale(0, 0, 0);
  private running = false;

  constructor() {
    this.material = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.5 });
    this.mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), this.material, COUNT);
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
    this.material.roughness = metal ? 0.35 : 0.55;
    const z = faceZOf(material);
    for (let i = 0; i < COUNT; i++) {
      const side = i < PER_FACE ? 1 : -1;
      const [x, y] = facePoint();
      this.home[i * 3] = x;
      this.home[i * 3 + 1] = y;
      this.home[i * 3 + 2] = side * z;
      this.d[i] = sweepOf(x, y, dir);
      this.size[i] = rnd(0.5, 1.1);
      this.drift[i * 2] = rnd(-4, 4);
      this.drift[i * 2 + 1] = rnd(-4, 4);
    }
    this.running = true;
    this.mesh.visible = true;
  }

  /** Pose the particles for the front at `front` on the sweep. */
  update(front: number) {
    if (!this.running) return;
    const { home, d, size, drift, m, p, s, mesh } = this;
    for (let i = 0; i < COUNT; i++) {
      // u runs 0 as the particle appears ahead of the front to 1 as the
      // front leaves it behind; it is on the face at the front itself.
      const u = (front - (d[i] - LEAD)) / (LEAD + TRAIL);
      if (u <= 0 || u >= 1) {
        mesh.setMatrixAt(i, this.hidden);
        continue;
      }
      const atFront = LEAD / (LEAD + TRAIL);
      const settle = Math.min(1, u / atFront);
      const lift = LIFT * (1 - settle) * (1 - settle);
      const side = Math.sign(home[i * 3 + 2]);
      p.set(
        home[i * 3] + drift[i * 2] * (1 - settle),
        home[i * 3 + 1] + drift[i * 2 + 1] * (1 - settle),
        home[i * 3 + 2] + side * (lift + 0.6),
      );
      const scale = size[i] * smoothstep(0, 0.25, u) * (1 - smoothstep(atFront, 1, u));
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
