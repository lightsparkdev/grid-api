import * as THREE from 'three';
import { CARD_H, CARD_W } from '@/apps/card/cardMetrics';
import type { CardMaterial } from '@/data/design';
import { CARD_R, faceZOf } from './cardGeometry';
import { sweepOf } from './materialSwap';

/**
 * The wipe's front is made of the new stock's particles: small, dense, lit
 * by the studio like the card is. Each comes in ahead of the edge, lands on
 * the face just behind it, rests there on the new stock, and fades into it.
 * In the card's frame, so they tilt and scale with it. Steel particles are
 * polished metal; PVC ones are matte.
 */

const PER_FACE = 7000;
const COUNT = PER_FACE * 2;
/** How far ahead of the front (sweep units) a particle appears, and how far
 *  behind it it is gone. */
const LEAD = 0.07;
const TRAIL = 0.14;
/** Where in that span it lands: a little behind the front. */
const LAND = LEAD / (LEAD + TRAIL) + 0.08;
/** It rests on the face until here, then fades. */
const REST_UNTIL = 0.7;
/** How high off the face it starts, card px. */
const LIFT = 10;

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
    for (let i = 0; i < COUNT; i++) {
      const side = i < PER_FACE ? 1 : -1;
      const [x, y] = facePoint();
      this.home[i * 3] = x;
      this.home[i * 3 + 1] = y;
      this.home[i * 3 + 2] = side * z;
      this.d[i] = sweepOf(x, y, dir);
      this.size[i] = rnd(0.55, 1.2);
      // Where it comes in from: ahead along the sweep, and a little sideways.
      this.drift[i * 2] = -dir * rnd(6, 18);
      this.drift[i * 2 + 1] = rnd(-5, 5);
    }
    this.running = true;
    this.mesh.visible = true;
  }

  /** Pose the particles for the front at `front` on the sweep. */
  update(front: number) {
    if (!this.running) return;
    const { home, d, size, drift, m, p, s, mesh } = this;
    for (let i = 0; i < COUNT; i++) {
      // u runs 0 as the particle appears ahead of the front to 1 as it is
      // gone behind it; it lands at LAND, once the front has passed.
      const u = (front - (d[i] - LEAD)) / (LEAD + TRAIL);
      if (u <= 0 || u >= 1) {
        mesh.setMatrixAt(i, this.hidden);
        continue;
      }
      // Carried in with the front, slowing as it comes down onto the face.
      const settle = Math.min(1, u / LAND);
      const ease = 1 - (1 - settle) * (1 - settle);
      const lift = LIFT * (1 - ease);
      const side = Math.sign(home[i * 3 + 2]);
      p.set(
        home[i * 3] + drift[i * 2] * (1 - ease),
        home[i * 3 + 1] + drift[i * 2 + 1] * (1 - ease),
        home[i * 3 + 2] + side * (lift + 0.6),
      );
      const scale = size[i] * smoothstep(0, 0.2, u) * (1 - smoothstep(REST_UNTIL, 1, u));
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
