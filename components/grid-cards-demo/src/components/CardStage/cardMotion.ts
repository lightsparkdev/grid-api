/**
 * The card's pose on the stage: cursor tilt, drag-to-turn with inertia, the
 * reveal flip, the idle bob, and the decline shake. Pure state and math,
 * stepped once per frame by the stage.
 *
 * The pose is a quaternion, and a drag is a trackball: pointer travel turns
 * the card about the *screen* axes from whatever pose it is in, so the card
 * always follows the cursor. (With Euler angles the inner axis turns with the
 * outer one, so a flopped card spun the wrong way.) On release the card
 * settles, by a spring on the rotation error, onto the nearest right-side-up
 * face: front or back. A flop over the long edge therefore tumbles through
 * and comes back readable; the back is reached by turning over the short
 * edge, as a card is.
 */
import { Quaternion, Vector3 } from 'three';

/** Cursor tilt, degrees at the card's edge. */
export const TILT_DEG = 9;
/** Drag: degrees of turn per pixel of pointer travel. */
const DRAG_DEG_PER_PX = 0.55;
/** Spring that settles the turn onto a face (per second, per degree). */
const SPIN_K = 120;
const SPIN_C = 18;
/** Cursor tilt smoothing rate (1/s). */
const TILT_RATE = 14;
/** How far a fling is projected when picking the face to settle on (s), and
 *  the fastest release the spring is asked to catch (deg/s). */
const FLING_LOOKAHEAD = 0.28;
const MAX_FLING = 1600;
const BOB_PERIOD = 5.2;
const BOB_AMPLITUDE = 7;
const SHAKE_S = 0.5;

const X = new Vector3(1, 0, 0);
const Y = new Vector3(0, 1, 0);
const Z = new Vector3(0, 0, 1);
const FRONT = new Quaternion();
const BACK = new Quaternion().setFromAxisAngle(Y, Math.PI);

export interface Pose {
  /** Orientation, world frame, with the cursor tilt applied. */
  quat: Quaternion;
  /** How much of the front faces the viewer, -1..1 (the front normal's z). */
  facing: number;
  /** Bob and shake offsets, card px. */
  dx: number;
  dy: number;
}

export class CardMotion {
  // Cursor tilt: target from the pointer, current eased toward it (degrees).
  private tiltTX = 0;
  private tiltTY = 0;
  private tiltX = 0;
  private tiltY = 0;
  // Free rotation: the pose and its angular velocity (world axis × deg/s).
  private q = new Quaternion();
  private w = new Vector3();
  private dragging = false;
  private lastDragT = 0;
  private dragW = new Vector3();
  /** After a drag the card may rest on either face. */
  private restAny = false;
  /** Where the turn settles; re-picked on release and when the wants change. */
  private target = FRONT.clone();
  private lastWantBack = false;
  private lastHold = false;
  private time = 0;
  private shakeAt = -1;

  // Scratch.
  private readonly out = new Quaternion();
  private readonly dq = new Quaternion();
  private readonly n = new Vector3();

  /** Pointer over the card, -0.5..0.5 in each axis. */
  setTilt(px: number, py: number) {
    if (this.dragging) return;
    this.tiltTY = px * TILT_DEG * 2;
    this.tiltTX = py * TILT_DEG * 2;
  }

  clearTilt() {
    this.tiltTX = 0;
    this.tiltTY = 0;
  }

  beginDrag(now: number) {
    this.dragging = true;
    this.clearTilt();
    this.lastDragT = now;
    this.dragW.set(0, 0, 0);
  }

  /** Pointer travel since the last event, in stage px. */
  drag(dxPx: number, dyPx: number, now: number) {
    if (!this.dragging) return;
    const dt = Math.max(0.001, (now - this.lastDragT) / 1000);
    this.lastDragT = now;
    // Drag right turns the card about the screen's vertical; drag down about
    // its horizontal. Screen axes, so the card follows the cursor whatever
    // way it is facing.
    const turnY = dxPx * DRAG_DEG_PER_PX;
    const turnX = dyPx * DRAG_DEG_PER_PX;
    this.turn(Y, turnY);
    this.turn(X, turnX);
    // Smoothed release velocity.
    this.dragW.multiplyScalar(0.6).addScaledVector(Y, (turnY / dt) * 0.4).addScaledVector(X, (turnX / dt) * 0.4);
  }

  endDrag() {
    if (!this.dragging) return;
    this.dragging = false;
    this.w.copy(this.dragW);
    const speed = this.w.length();
    if (speed > MAX_FLING) this.w.multiplyScalar(MAX_FLING / speed);
    this.restAny = true;
    // Settle on whichever face the fling is headed for.
    const ahead = this.out.copy(this.q);
    rotate(ahead, this.n.copy(this.w).multiplyScalar(FLING_LOOKAHEAD), this.dq);
    this.target = this.pickTarget(ahead, this.lastWantBack, this.lastHold);
  }

  /** Turn the pose about a world axis by `deg`. */
  private turn(axis: Vector3, deg: number) {
    this.dq.setFromAxisAngle(axis, (deg * Math.PI) / 180);
    this.q.premultiply(this.dq).normalize();
  }

  /** The face to settle on: the reveal wants the back; a free card after a
   *  drag takes whichever is nearer; otherwise the front. Both right-side-up. */
  private pickTarget(from: Quaternion, wantBack: boolean, hold: boolean): Quaternion {
    if (wantBack) return BACK;
    if (this.restAny && !hold) return from.angleTo(BACK) < from.angleTo(FRONT) ? BACK : FRONT;
    return FRONT;
  }

  get isDragging() {
    return this.dragging;
  }

  /** A purchase bounced: shake now. */
  shake() {
    this.shakeAt = this.time;
  }

  /**
   * Advance one frame. `wantBack` (the reveal) turns the card to its back;
   * `hold` (the phone is up) parks it front-up and still.
   */
  step(dt: number, opts: { wantBack: boolean; hold: boolean; reduceMotion: boolean }): Pose {
    this.time += dt;
    if (opts.hold) this.clearTilt();
    const k = 1 - Math.exp(-dt * TILT_RATE);
    this.tiltX += (this.tiltTX - this.tiltX) * k;
    this.tiltY += (this.tiltTY - this.tiltY) * k;

    if (opts.wantBack !== this.lastWantBack || opts.hold !== this.lastHold) {
      if (opts.hold || opts.wantBack) this.restAny = false;
      this.lastWantBack = opts.wantBack;
      this.lastHold = opts.hold;
      if (!this.dragging) this.target = this.pickTarget(this.q, opts.wantBack, opts.hold);
    }

    if (!this.dragging) {
      // Spring on the rotation error (world axis × degrees), the same law as
      // a scalar spring per axis.
      const err = errorVector(this.target, this.q, this.dq, this.n);
      this.w.addScaledVector(err, SPIN_K * dt).addScaledVector(this.w, -SPIN_C * dt);
      rotate(this.q, this.n.copy(this.w).multiplyScalar(dt), this.dq);
    }

    const floating = !opts.hold && !opts.reduceMotion;
    const dy = floating ? BOB_AMPLITUDE * Math.sin((this.time / BOB_PERIOD) * Math.PI * 2) : 0;
    let dx = 0;
    if (this.shakeAt >= 0) {
      const u = (this.time - this.shakeAt) / SHAKE_S;
      if (u < 1) dx = 12 * Math.sin(u * Math.PI * 3) * (1 - u);
      else this.shakeAt = -1;
    }

    // The tilt rides on top, about the screen axes too.
    const out = this.out.copy(this.q);
    this.dq.setFromAxisAngle(Y, (this.tiltY * Math.PI) / 180);
    out.premultiply(this.dq);
    this.dq.setFromAxisAngle(X, (this.tiltX * Math.PI) / 180);
    out.premultiply(this.dq);
    const facing = this.n.copy(Z).applyQuaternion(out).z;
    return { quat: out, facing, dx, dy };
  }
}

/** Rotate `q` (in place) by the world-frame rotation vector `v` (axis × degrees). */
function rotate(q: Quaternion, v: Vector3, scratch: Quaternion) {
  const deg = v.length();
  if (deg < 1e-9) return;
  scratch.setFromAxisAngle(v.divideScalar(deg), (deg * Math.PI) / 180);
  q.premultiply(scratch).normalize();
}

/** The shortest world-frame rotation taking `q` to `target`, as axis × degrees. */
function errorVector(target: Quaternion, q: Quaternion, scratch: Quaternion, out: Vector3): Vector3 {
  // e = target · q⁻¹, on the near side of the double cover.
  scratch.copy(q).invert().premultiply(target);
  if (scratch.w < 0) scratch.set(-scratch.x, -scratch.y, -scratch.z, -scratch.w);
  const half = Math.acos(Math.min(1, scratch.w));
  const s = Math.sin(half);
  if (s < 1e-6) return out.set(0, 0, 0);
  const deg = (2 * half * 180) / Math.PI;
  return out.set(scratch.x, scratch.y, scratch.z).multiplyScalar(deg / s);
}
