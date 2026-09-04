import * as THREE from 'three';
import { CARD_H, CARD_W } from '@/apps/card/cardMetrics';
import { STOCKS, type CardMaterial } from '@/data/design';
import { CARD_R, faceZOf } from './cardGeometry';
import { noiseAt, SWAP_TIMING, type SwapNoise } from './materialSwap';

/**
 * The body in transit. Two instanced meshes, one per material: steel flakes
 * and PVC pellets, lit by the studio like the card is (a physical material,
 * no glow, no blending). On a change one set leaves as the old body
 * dissolves, spot by spot, and the other arrives and becomes the new one.
 * Each particle is timed off the body's noise so it lifts off, or lands,
 * the instant its texel goes, or comes: the swarm and the surface are one
 * event. Everything lives in the card's own frame so it tilts and scales
 * with the card.
 *
 * Steel: flakes come from all around, accelerate into place like filings to
 * a magnet, stop dead, and are the surface. Pulled off, they leave fast and
 * slow down. PVC: pellets fall in from above, tumbling, onto a level that
 * rises; melted off, they drop away.
 */

/** Particles per face, per set. */
const PER_FACE = 3200;
const COUNT = PER_FACE * 2;

interface Look {
  geometry: THREE.BufferGeometry;
  material: THREE.MeshPhysicalMaterial;
}

function flakeLook(): Look {
  return {
    geometry: new THREE.BoxGeometry(3.6, 2.7, 0.5),
    material: new THREE.MeshPhysicalMaterial({ color: STOCKS[2].face, metalness: 1, roughness: 0.32 }),
  };
}

function pelletLook(): Look {
  return {
    geometry: new THREE.IcosahedronGeometry(1.8, 0),
    material: new THREE.MeshPhysicalMaterial({ color: STOCKS[0].face, metalness: 0, roughness: 0.55 }),
  };
}

type Role = 'leave' | 'arrive';

/** One set's plan for the swap in flight. */
interface Plan {
  role: Role;
  material: CardMaterial;
  /** Where the particle is part of the body. */
  home: Float32Array;
  /** Where it comes from, or goes. */
  far: Float32Array;
  /** Start of its motion (spawn, or release), ms into the swap. */
  t0: Float32Array;
  /** Land (arrive) or gone (leave), ms into the swap. */
  t1: Float32Array;
  size: Float32Array;
  /** Start rotation, or tumble seed. */
  rot: Float32Array;
  /** Flakes lie at this yaw once landed. */
  yaw: Float32Array;
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const easeInQuad = (p: number) => p * p;
const easeInCubic = (p: number) => p * p * p;
const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);
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

function plan(role: Role, material: CardMaterial, noise: SwapNoise, offset: number): Plan {
  const home = new Float32Array(COUNT * 3);
  const far = new Float32Array(COUNT * 3);
  const t0 = new Float32Array(COUNT);
  const t1 = new Float32Array(COUNT);
  const size = new Float32Array(COUNT);
  const rot = new Float32Array(COUNT * 3);
  const yaw = new Float32Array(COUNT);
  const T = SWAP_TIMING[material];
  const z = faceZOf(material);
  const metal = material === 'metal';
  for (let i = 0; i < COUNT; i++) {
    const side = i < PER_FACE ? 1 : -1;
    const [x, y] = facePoint();
    home[i * 3] = x;
    home[i * 3 + 1] = y;
    home[i * 3 + 2] = side * (z + (metal ? 0.25 : 1.2));
    const u = x / CARD_W + 0.5;
    const v = y / CARD_H + 0.5;
    if (role === 'arrive') {
      // Lands when its texel solidifies (uSolid climbs 0 → 1 over `assemble`).
      const land = offset + noiseAt(noise.g, u, v) * T.assemble;
      t0[i] = land - T.flight;
      t1[i] = land;
      if (metal) {
        far[i * 3] = x + rnd(-1, 1) * CARD_W * 0.35;
        far[i * 3 + 1] = y + rnd(-1, 1) * CARD_H * 0.35;
        far[i * 3 + 2] = side * rnd(70, 260);
      } else {
        far[i * 3] = x + rnd(-30, 30);
        far[i * 3 + 1] = y + rnd(150, 330);
        far[i * 3 + 2] = side * rnd(15, 80);
      }
    } else {
      // Lifts off when its texel dissolves (uSolid falls 1 → 0 over `dissolve`).
      const release = offset + (1 - noiseAt(noise.r, u, v)) * T.dissolve;
      t0[i] = release;
      t1[i] = release + T.flight;
      if (metal) {
        far[i * 3] = x + rnd(-1, 1) * CARD_W * 0.25;
        far[i * 3 + 1] = y + rnd(-0.1, 0.4) * CARD_H;
        far[i * 3 + 2] = side * rnd(60, 220);
      } else {
        far[i * 3] = x + rnd(-30, 30);
        far[i * 3 + 1] = y - rnd(150, 330);
        far[i * 3 + 2] = side * rnd(15, 80);
      }
    }
    size[i] = rnd(0.75, 1.25);
    rot[i * 3] = rnd(-1, 1) * (metal ? 1.4 : Math.PI);
    rot[i * 3 + 1] = rnd(-1, 1) * (metal ? 1.4 : Math.PI);
    rot[i * 3 + 2] = rnd(-1, 1) * (metal ? 1.4 : Math.PI);
    yaw[i] = rnd(-0.35, 0.35);
  }
  return { role, material, home, far, t0, t1, size, rot, yaw };
}

export interface SwapPlan {
  from: CardMaterial;
  to: CardMaterial;
  noiseFrom: SwapNoise;
  noiseTo: SwapNoise;
  /** Color of the PVC body the pellets are made of. */
  pelletColor: string;
}

export class MaterialSwarm {
  readonly flakes: THREE.InstancedMesh;
  readonly pellets: THREE.InstancedMesh;
  private plans: Array<{ mesh: THREE.InstancedMesh; plan: Plan }> = [];
  private readonly m = new THREE.Matrix4();
  private readonly p = new THREE.Vector3();
  private readonly q = new THREE.Quaternion();
  private readonly e = new THREE.Euler();
  private readonly s = new THREE.Vector3();
  private readonly hidden = new THREE.Matrix4().makeScale(0, 0, 0);
  private readonly looks: Look[];

  constructor() {
    const f = flakeLook();
    const p = pelletLook();
    this.looks = [f, p];
    this.flakes = new THREE.InstancedMesh(f.geometry, f.material, COUNT);
    this.pellets = new THREE.InstancedMesh(p.geometry, p.material, COUNT);
    for (const mesh of [this.flakes, this.pellets]) {
      mesh.frustumCulled = false;
      mesh.visible = false;
      for (let i = 0; i < COUNT; i++) mesh.setMatrixAt(i, this.hidden);
      mesh.instanceMatrix.needsUpdate = true;
    }
  }

  get active() {
    return this.plans.length > 0;
  }

  /** Lay out both sets for a change; the arriving set's clock starts at the
   *  end of the dissolve. */
  begin(sp: SwapPlan) {
    const meshOf = (m: CardMaterial) => (m === 'metal' ? this.flakes : this.pellets);
    (this.pellets.material as THREE.MeshPhysicalMaterial).color.set(sp.pelletColor);
    const dissolve = SWAP_TIMING[sp.from].dissolve;
    this.plans = [
      { mesh: meshOf(sp.from), plan: plan('leave', sp.from, sp.noiseFrom, 0) },
      { mesh: meshOf(sp.to), plan: plan('arrive', sp.to, sp.noiseTo, dissolve) },
    ];
    this.flakes.visible = true;
    this.pellets.visible = true;
  }

  /** Pose every particle for `t` ms into the swap. */
  update(t: number) {
    for (const { mesh, plan } of this.plans) this.pose(mesh, plan, t);
  }

  private pose(mesh: THREE.InstancedMesh, pl: Plan, t: number) {
    const { home, far, t0, t1, size, rot, yaw } = pl;
    const metal = pl.material === 'metal';
    const T = SWAP_TIMING[pl.material];
    const { m, p, q, e, s } = this;
    for (let i = 0; i < COUNT; i++) {
      const a = t0[i];
      const b = t1[i];
      let scale = 0;
      let rx = 0;
      let ry = 0;
      let rz = yaw[i];
      if (pl.role === 'arrive') {
        if (t >= a && t < b + T.fade) {
          if (t < b) {
            const u = (t - a) / (b - a);
            // Magnet, or gravity: it accelerates and stops on contact.
            const k = metal ? easeInCubic(u) : easeInQuad(u);
            p.set(
              far[i * 3] + (home[i * 3] - far[i * 3]) * k,
              far[i * 3 + 1] + (home[i * 3 + 1] - far[i * 3 + 1]) * k,
              far[i * 3 + 2] + (home[i * 3 + 2] - far[i * 3 + 2]) * k,
            );
            scale = size[i];
            if (metal) {
              rx = rot[i * 3] * (1 - k);
              ry = rot[i * 3 + 1] * (1 - k);
              rz = yaw[i] + rot[i * 3 + 2] * (1 - k);
            } else {
              rx = rot[i * 3] + t * 0.012;
              ry = rot[i * 3 + 1] + t * 0.009;
              rz = rot[i * 3 + 2];
            }
          } else {
            // Landed: it becomes the surface.
            p.set(home[i * 3], home[i * 3 + 1], home[i * 3 + 2]);
            const u = (t - b) / T.fade;
            scale = size[i] * (metal ? 1 - u * u : 1 - u);
            if (!metal) {
              rx = rot[i * 3] + b * 0.012;
              ry = rot[i * 3 + 1] + b * 0.009;
              rz = rot[i * 3 + 2];
            }
          }
        }
      } else if (t >= a && t < b) {
        const u = (t - a) / (b - a);
        // Pulled off: fast, then slowing. Melted off: it drops.
        const k = metal ? easeOutCubic(u) : easeInQuad(u);
        p.set(
          home[i * 3] + (far[i * 3] - home[i * 3]) * k,
          home[i * 3 + 1] + (far[i * 3 + 1] - home[i * 3 + 1]) * k,
          home[i * 3 + 2] + (far[i * 3 + 2] - home[i * 3 + 2]) * k,
        );
        scale = size[i] * (1 - smoothstep(0.35, 1, u));
        if (metal) {
          rx = rot[i * 3] * k;
          ry = rot[i * 3 + 1] * k;
          rz = yaw[i] + rot[i * 3 + 2] * k;
        } else {
          rx = rot[i * 3] + (t - a) * 0.012;
          ry = rot[i * 3 + 1] + (t - a) * 0.009;
          rz = rot[i * 3 + 2];
        }
      }
      if (scale <= 0.001) {
        mesh.setMatrixAt(i, this.hidden);
        continue;
      }
      e.set(rx, ry, rz);
      q.setFromEuler(e);
      s.setScalar(scale);
      m.compose(p, q, s);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  /** The swap is over: nothing in transit. */
  end() {
    this.plans = [];
    for (const mesh of [this.flakes, this.pellets]) {
      for (let i = 0; i < COUNT; i++) mesh.setMatrixAt(i, this.hidden);
      mesh.instanceMatrix.needsUpdate = true;
      mesh.visible = false;
    }
  }

  dispose() {
    this.end();
    for (const l of this.looks) {
      l.geometry.dispose();
      l.material.dispose();
    }
    this.flakes.dispose();
    this.pellets.dispose();
  }
}
