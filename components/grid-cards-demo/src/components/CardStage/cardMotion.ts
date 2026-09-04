/**
 * The card's pose on the stage: cursor tilt, drag-to-spin with inertia, the
 * reveal flip, the idle bob, and the decline shake. Pure state and math,
 * stepped once per frame by the stage. Angles are degrees in three.js terms:
 * positive rotation.y turns the right edge away, positive rotation.x turns
 * the top edge toward the viewer.
 *
 * Two locked axes: drag right spins about the screen's vertical, drag down
 * flops about its horizontal; both run free and settle on a face. A flop
 * would show the other face upside down, so once the card is past edge-on
 * (pitch between 90° and 270°) it also rolls 180° about its own normal: the
 * slab is symmetric, so nothing moves, but the faces turn right side up, and
 * Rx(180)·Rz(180) = Ry(180), a flopped card is a spun card. In that state the
 * spin axis points down the screen, so the sideways drag is negated to keep
 * following the cursor.
 */

/** Cursor tilt, degrees at the card's edge. */
export const TILT_DEG = 9;
/** Drag: degrees of spin per pixel of pointer travel. */
const DRAG_DEG_PER_PX = 0.55;
/** Spring that settles the spin onto a face (per second, per degree). */
const SPIN_K = 120;
const SPIN_C = 18;
/** Cursor tilt smoothing rate (1/s). */
const TILT_RATE = 14;
/** Letting the tilt go when the card is asked to hold still: slower than
 *  following the pointer, so it settles rather than snaps. */
const TILT_RELEASE_RATE = 5;
/** The idle bob fades out over this when the card is asked to hold still. */
const BOB_FALL_TAU = 0.3;
/** How far a fling is projected when picking the face to settle on (s), and
 *  the fastest release the spring is asked to catch (deg/s). */
const FLING_LOOKAHEAD = 0.28;
const MAX_FLING = 1600;
const BOB_PERIOD = 5.2;
const BOB_AMPLITUDE = 7;
/** The bob eases in from rest over about this long (s) when the card is let
 *  go, so it never snaps to the phase its clock happens to be at. */
const BOB_RISE_TAU = 0.6;
const SHAKE_S = 0.5;

export interface Pose {
  rotX: number;
  rotY: number;
  /** Roll about the card's normal, degrees: 180 when flopped, else 0. */
  rotZ: number;
  /** How much of the front faces the viewer, -1..1. */
  facing: number;
  /** Bob and shake offsets, card px. */
  dx: number;
  dy: number;
}

/** Past edge-on over the long edge: the far side of the flop. */
function flopped(pitch: number): boolean {
  return Math.cos((pitch * Math.PI) / 180) < 0;
}

export class CardMotion {
  // Cursor tilt: target from the pointer, current eased toward it.
  private tiltTX = 0;
  private tiltTY = 0;
  private tiltX = 0;
  private tiltY = 0;
  // Free rotation: the spin (y) and pitch (x) with velocities.
  private spinY = 0;
  private spinVY = 0;
  private pitch = 0;
  private pitchV = 0;
  private dragging = false;
  private lastDragT = 0;
  private dragVY = 0;
  private dragVX = 0;
  /** After a drag the card may rest on either face. */
  private restAny = false;
  /** Where the spin and pitch settle; re-picked on release and when the wants change. */
  private targetY = 0;
  private targetX = 0;
  private lastWantBack = false;
  private lastHold = false;
  private time = 0;
  /** Bob envelope, 0..1: 0 while held, rising toward 1 once floating. */
  private bobEnv = 0;
  private shakeAt = -1;

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
    this.dragVY = 0;
    this.dragVX = 0;
  }

  /** Pointer travel since the last event, in stage px. */
  drag(dxPx: number, dyPx: number, now: number) {
    if (!this.dragging) return;
    const dt = Math.max(0.001, (now - this.lastDragT) / 1000);
    this.lastDragT = now;
    // Flopped, the spin axis points down the screen: negate so the card
    // still follows the cursor.
    const dyDeg = dxPx * DRAG_DEG_PER_PX * (flopped(this.pitch) ? -1 : 1);
    const dxDeg = dyPx * DRAG_DEG_PER_PX;
    this.spinY += dyDeg;
    this.pitch += dxDeg;
    // Smoothed release velocities.
    this.dragVY = this.dragVY * 0.6 + (dyDeg / dt) * 0.4;
    this.dragVX = this.dragVX * 0.6 + (dxDeg / dt) * 0.4;
  }

  endDrag() {
    if (!this.dragging) return;
    this.dragging = false;
    this.spinVY = Math.max(-MAX_FLING, Math.min(MAX_FLING, this.dragVY));
    this.pitchV = Math.max(-MAX_FLING, Math.min(MAX_FLING, this.dragVX));
    this.restAny = true;
    // Settle on whichever face each fling is headed for.
    this.targetX = nearestWithParity(this.pitch + this.pitchV * FLING_LOOKAHEAD, 0, 180);
    this.targetY = this.pickTargetY(this.spinY + this.spinVY * FLING_LOOKAHEAD, this.lastWantBack, this.lastHold);
  }

  /** The spin to settle on, given where the pitch is settling: the reveal
   *  wants the back showing; a free card after a drag takes whichever face is
   *  nearer; otherwise the front. Which face shows depends on both axes. */
  private pickTargetY(from: number, wantBack: boolean, hold: boolean): number {
    if (this.restAny && !hold && !wantBack) return nearestWithParity(from, 0, 180);
    const pitchParity = Math.abs(Math.round(this.targetX / 180)) % 2;
    const backParity = wantBack ? 1 : 0;
    return nearestWithParity(from, ((pitchParity + backParity) % 2) as 0 | 1);
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
   * `hold` (the phone is up) parks it front-up and still; `freeze` (text
   * being typed on a face) parks it still on whichever face is showing.
   */
  step(dt: number, opts: { wantBack: boolean; hold: boolean; freeze?: boolean; reduceMotion: boolean }): Pose {
    this.time += dt;
    const still = opts.hold || !!opts.freeze;
    if (still) this.clearTilt();
    const k = 1 - Math.exp(-dt * (still ? TILT_RELEASE_RATE : TILT_RATE));
    this.tiltX += (this.tiltTX - this.tiltX) * k;
    this.tiltY += (this.tiltTY - this.tiltY) * k;

    if (opts.wantBack !== this.lastWantBack || opts.hold !== this.lastHold) {
      if (opts.hold || opts.wantBack) this.restAny = false;
      this.lastWantBack = opts.wantBack;
      this.lastHold = opts.hold;
      if (!this.dragging) {
        this.targetX = nearestWithParity(this.pitch, 0, 180);
        this.targetY = this.pickTargetY(this.spinY, opts.wantBack, opts.hold);
      }
    }

    if (!this.dragging) {
      this.spinVY += (SPIN_K * (this.targetY - this.spinY) - SPIN_C * this.spinVY) * dt;
      this.spinY += this.spinVY * dt;
      this.pitchV += (SPIN_K * (this.targetX - this.pitch) - SPIN_C * this.pitchV) * dt;
      this.pitch += this.pitchV * dt;
    }

    const floating = !still && !opts.reduceMotion;
    this.bobEnv += ((floating ? 1 : 0) - this.bobEnv) * (1 - Math.exp(-dt / (floating ? BOB_RISE_TAU : BOB_FALL_TAU)));
    const dy = this.bobEnv * BOB_AMPLITUDE * Math.sin((this.time / BOB_PERIOD) * Math.PI * 2);
    let dx = 0;
    if (this.shakeAt >= 0) {
      const u = (this.time - this.shakeAt) / SHAKE_S;
      if (u < 1) dx = 12 * Math.sin(u * Math.PI * 3) * (1 - u);
      else this.shakeAt = -1;
    }

    const flop = flopped(this.pitch);
    const rotX = this.tiltX + this.pitch;
    const rotY = (flop ? -this.tiltY : this.tiltY) + this.spinY;
    const facing = Math.cos((rotY * Math.PI) / 180) * Math.cos((rotX * Math.PI) / 180);
    return { rotX, rotY, rotZ: flop ? 180 : 0, facing, dx, dy };
  }
}

/** Nearest angle to `a` that is `parity` × 180 modulo `period` (360 = a fixed
 *  face, 180 = either face). */
function nearestWithParity(a: number, parity: 0 | 1, period = 360): number {
  const offset = parity * 180;
  return Math.round((a - offset) / period) * period + offset;
}
