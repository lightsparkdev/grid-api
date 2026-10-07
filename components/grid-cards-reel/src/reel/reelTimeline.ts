/* The reel's motion, as a pure function of time: no React, no three, so the
   same file drives the plate here and could drive a Remotion composition
   (`reel.frame(frame / fps)`) unchanged.

   The card opens floating on black as the "Your brand" placeholder, dips,
   pops up, and tumbles (two turns about Y, one about X, the bottom-left
   corner tipping toward the viewer first) while the designs cycle, slow at
   first and then fast, every brand once, before it lands on the placeholder
   again and settles back into its float. */

export type SwapOn = 'both' | 'front';
export type OrientationMix = 'grouped' | 'interleaved';
export type ReelOrientation = 'landscape' | 'portrait';

export interface ReelConfig {
  fps: number;
  /** The plate is square, this many px a side. */
  size: number;
  /** The landscape card's width as a fraction of the plate's. Leaves room
   *  above for the pop. */
  cardFrac: number;
  /** Tone mapping exposure (the playground's recording stage uses 1.25). */
  exposure: number;
  blur: {
    /** Renders averaged per frame, at least and at most. 1 and 1 = no motion blur. */
    minSamples: number;
    maxSamples: number;
    /** The most the card may turn between two samples, degrees: a fast
     *  frame takes more samples so the blur is a smear, not copies. */
    stepDeg: number;
    /** The shutter as a share of the frame (0.5 is a 180 degree shutter). */
    shutter: number;
  };
  open: {
    /** Seconds on the floating placeholder before the dip. */
    hold: number;
    /** The float's bob, a share of the card's height, and its rate. */
    bob: number;
    bobHz: number;
  };
  dip: {
    dur: number;
    /** How far down, a share of the card's height. */
    depth: number;
    /** The wind-up before the tumble: the bottom-left corner tips away, degrees. */
    windup: number;
  };
  pop: {
    dur: number;
    /** How high it flies, a share of the card's height. */
    height: number;
    /** How far toward the camera at the top, a share of the camera's distance. */
    toward: number;
  };
  tumble: {
    turnsY: number;
    turnsX: number;
    /** Seconds of tumble before the cycle starts, and after it ends. */
    lead: number;
    tail: number;
    /** The landing's wobble, degrees, and how quickly it dies. */
    wobble: number;
  };
  cycle: {
    /** Swaps per second at the start, at the peak, and as it lands. */
    startPerSecond: number;
    peakPerSecond: number;
    endPerSecond: number;
    /** Shares of the cycle spent ramping up, and slowing into the landing. */
    rampShare: number;
    slowShare: number;
    swapOn: SwapOn;
  };
  orientation: {
    mix: OrientationMix;
    /** Where the portrait run starts, a share of the way through the brands. */
    at: number;
    /** Seconds for the quarter turn into portrait and back. */
    rollDur: number;
  };
  settle: {
    /** Seconds from the landing to the float. */
    dur: number;
    /** How far the card sinks as it lands, a share of the card's height. */
    sink: number;
    /** Seconds on the placeholder at the end. */
    hold: number;
  };
}

export const REEL: ReelConfig = {
  fps: 60,
  size: 2160,
  cardFrac: 0.55,
  exposure: 1.25,
  blur: { minSamples: 4, maxSamples: 64, stepDeg: 0.35, shutter: 0.5 },
  open: { hold: 0.7, bob: 0.012, bobHz: 0.45 },
  dip: { dur: 0.32, depth: 0.09, windup: 9 },
  pop: { dur: 0.55, height: 0.2, toward: 0.08 },
  tumble: { turnsY: 2, turnsX: 1, lead: 0.12, tail: 0.38, wobble: 5 },
  cycle: {
    startPerSecond: 3,
    peakPerSecond: 24,
    endPerSecond: 7,
    rampShare: 0.4,
    slowShare: 0.18,
    swapOn: 'both',
  },
  orientation: { mix: 'grouped', at: 0.45, rollDur: 0.24 },
  settle: { dur: 0.9, sink: 0.035, hold: 1.0 },
};

/** The card's quarter turn when held upright. Matches `ORIENT_ROLL` in the
 *  playground's cardMotion.ts. */
const PORTRAIT_ROLL = -90;

export interface ReelFrame {
  /** Degrees, the stage's sense: rotX pitches the top edge toward the
   *  viewer, rotY turns the right edge away, rotZ rolls (the upright
   *  card's quarter turn included). Euler order XYZ. */
  rotX: number;
  rotY: number;
  rotZ: number;
  /** Up, a share of the landscape card's height. */
  y: number;
  /** Toward the camera, a share of the camera's distance. */
  z: number;
  /** Into `Reel.sequence`. */
  index: number;
}

export interface ReelEntry {
  id: string;
  orientation: ReelOrientation;
}

export interface Reel<E extends ReelEntry> {
  config: ReelConfig;
  /** What shows, in order: the placeholder, every brand once, the placeholder. */
  sequence: E[];
  /** Seconds at which `sequence[k]` comes on (k ≥ 1). */
  swapTimes: number[];
  duration: number;
  frames: number;
  frame: (t: number) => ReelFrame;
}

/* ── Easing ───────────────────────────────────────────────────────────────── */

const clamp01 = (u: number) => Math.min(1, Math.max(0, u));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

/** CSS cubic-bezier(x1, y1, x2, y2), solved for x by Newton then bisection. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (u: number) => number {
  const bx = (t: number) => 3 * x1 * t * (1 - t) ** 2 + 3 * x2 * t * t * (1 - t) + t ** 3;
  const by = (t: number) => 3 * y1 * t * (1 - t) ** 2 + 3 * y2 * t * t * (1 - t) + t ** 3;
  const dx = (t: number) => 3 * x1 * (1 - t) ** 2 + 6 * (x2 - x1) * t * (1 - t) + 3 * (1 - x2) * t * t;
  return (u: number) => {
    if (u <= 0) return 0;
    if (u >= 1) return 1;
    let t = u;
    for (let i = 0; i < 6; i++) {
      const d = dx(t);
      if (Math.abs(d) < 1e-6) break;
      t -= (bx(t) - u) / d;
    }
    if (t < 0 || t > 1 || Math.abs(bx(t) - u) > 1e-5) {
      let lo = 0;
      let hi = 1;
      t = u;
      for (let i = 0; i < 30; i++) {
        if (bx(t) < u) lo = t;
        else hi = t;
        t = (lo + hi) / 2;
      }
    }
    return by(t);
  };
}

const easeInOutSine = (u: number) => -(Math.cos(Math.PI * clamp01(u)) - 1) / 2;
const smooth = (u: number) => {
  const x = clamp01(u);
  return x * x * (3 - 2 * x);
};
/** The pop: quick off the floor, slowing into the top. */
const easePop = cubicBezier(0.2, 0.85, 0.3, 1);
/** The tumble: a hand flicks it, it flies, it is caught. */
const easeTumble = cubicBezier(0.5, 0, 0.22, 1);
/** Coming down from the top to the landing. */
const easeDescend = cubicBezier(0.45, 0, 0.55, 1);

/** A damped wobble that starts at 0, for `tau` seconds after it was struck. */
function wobble(tau: number, amp: number, hz: number, decay: number): number {
  if (tau <= 0) return 0;
  return amp * Math.exp(-decay * tau) * Math.sin(2 * Math.PI * hz * tau);
}

/* ── The cycle's schedule ─────────────────────────────────────────────────── */

/** The swap rate at share `u` of the cycle, per second. */
function rateAt(c: ReelConfig['cycle'], u: number): number {
  if (u < c.rampShare) return lerp(c.startPerSecond, c.peakPerSecond, easeInOutSine(u / c.rampShare));
  if (u > 1 - c.slowShare) return lerp(c.peakPerSecond, c.endPerSecond, easeInOutSine((u - (1 - c.slowShare)) / c.slowShare));
  return c.peakPerSecond;
}

/** The mean of the rate profile over the cycle, per second. */
function meanRate(c: ReelConfig['cycle']): number {
  const n = 4000;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += rateAt(c, (i + 0.5) / n);
  return sum / n;
}

/** Brands in show order. Grouped, the portrait cards sit together as one run
 *  (one quarter turn in, one out); interleaved, they stay where they were. */
function order<E extends ReelEntry>(brands: E[], o: ReelConfig['orientation']): E[] {
  if (o.mix === 'interleaved') return brands;
  const flat = brands.filter((b) => b.orientation === 'landscape');
  const tall = brands.filter((b) => b.orientation === 'portrait');
  const at = Math.round(flat.length * o.at);
  return [...flat.slice(0, at), ...tall, ...flat.slice(at)];
}

/* ── The reel ─────────────────────────────────────────────────────────────── */

export function buildReel<E extends ReelEntry>(placeholder: E, brands: E[], config: ReelConfig = REEL): Reel<E> {
  const c = config;
  const sequence = [placeholder, ...order(brands, c.orientation), placeholder];
  const swaps = sequence.length - 1;

  // The beats: the dip after the hold, the pop after the dip, the cycle a
  // lead into the tumble, the landing a tail after the cycle.
  const tDip = c.open.hold;
  const tPop = tDip + c.dip.dur;
  const tCycle = tPop + c.tumble.lead;
  const cycleDur = swaps / meanRate(c.cycle);
  const tCycleEnd = tCycle + cycleDur;
  const tLand = tCycleEnd + c.tumble.tail;
  const duration = tLand + c.settle.dur + c.settle.hold;
  const frames = Math.round(duration * c.fps);

  const spin = (t: number) => easeTumble(clamp01((t - tPop) / (tLand - tPop)));
  const facesFront = (t: number) => {
    const a = spin(t);
    const rx = (-360 * c.tumble.turnsX * a * Math.PI) / 180;
    const ry = (360 * c.tumble.turnsY * a * Math.PI) / 180;
    return Math.cos(rx) * Math.cos(ry) > 0;
  };

  // How many swaps have happened by each instant of the cycle: the rate
  // integrated, counted only while the front faces the camera when swaps
  // are front-only (scaled up so the count still finishes on time).
  const steps = Math.max(2000, Math.ceil(cycleDur * 2000));
  const dt = cycleDur / steps;
  const counted = (t: number) => c.cycle.swapOn === 'both' || facesFront(t);
  let total = 0;
  for (let i = 0; i < steps; i++) {
    const t = tCycle + (i + 0.5) * dt;
    if (counted(t)) total += rateAt(c.cycle, (i + 0.5) / steps) * dt;
  }
  const gain = total > 0 ? swaps / total : 1;
  const swapTimes: number[] = [0];
  let acc = 0;
  for (let i = 0; i < steps && swapTimes.length <= swaps; i++) {
    const t = tCycle + (i + 0.5) * dt;
    if (counted(t)) acc += rateAt(c.cycle, (i + 0.5) / steps) * dt * gain;
    while (swapTimes.length <= swaps && acc >= swapTimes.length - 1e-9) swapTimes.push(t);
  }
  while (swapTimes.length <= swaps) swapTimes.push(tCycleEnd);

  const indexAt = (t: number) => {
    let k = 0;
    while (k < swaps && swapTimes[k + 1] <= t) k++;
    return k;
  };

  // The quarter turn: grouped, eased in around the first portrait swap and
  // out around the swap that leaves the run, each centered on its swap so
  // the art changes on the frame the card is halfway round.
  const firstTall = sequence.findIndex((e) => e.orientation === 'portrait');
  const lastTall = sequence.length - 1 - [...sequence].reverse().findIndex((e) => e.orientation === 'portrait');
  const roll = (t: number, k: number): number => {
    if (firstTall < 0) return 0;
    if (c.orientation.mix === 'interleaved') return sequence[k].orientation === 'portrait' ? PORTRAIT_ROLL : 0;
    const half = c.orientation.rollDur / 2;
    const into = smooth((t - (swapTimes[firstTall] - half)) / c.orientation.rollDur);
    const out = smooth((t - (swapTimes[lastTall + 1] - half)) / c.orientation.rollDur);
    return PORTRAIT_ROLL * (into - out);
  };

  const frame = (t: number): ReelFrame => {
    const k = indexAt(t);
    const a = spin(t);

    // The wind-up: in over the dip, let go over the first of the tumble.
    const windIn = easeInOutSine((t - tDip) / c.dip.dur);
    const windOut = easeInOutSine((t - tPop) / (c.pop.dur * 0.8));
    const wind = c.dip.windup * (windIn - windOut);
    const landWobble = wobble(t - tLand, c.tumble.wobble, 1.6, 4.5);
    const rotX = wind - 360 * c.tumble.turnsX * a + landWobble * 0.6;
    const rotY = -wind + 360 * c.tumble.turnsY * a - landWobble;

    // Height: the float's bob, the dip, the pop to the top, held aloft
    // through the cycle, down to the landing, a sink, and the float again.
    const bob = c.open.bob * Math.sin(2 * Math.PI * c.open.bobHz * t);
    const aloft = Math.max(0, Math.min(1, (t - tPop) / c.pop.dur));
    let y: number;
    let z: number;
    if (t < tDip) {
      y = bob;
      z = 0;
    } else if (t < tPop) {
      const u = easeInOutSine((t - tDip) / c.dip.dur);
      y = lerp(bob, -c.dip.depth, u);
      z = 0;
    } else if (t < tLand) {
      const up = easePop(aloft);
      const descend = easeDescend(clamp01((t - (tLand - (tLand - tPop) * 0.42)) / ((tLand - tPop) * 0.42)));
      y = lerp(-c.dip.depth, c.pop.height, up) * (1 - descend);
      z = c.pop.toward * up * (1 - descend);
    } else {
      const tau = t - tLand;
      const sink = -c.settle.sink * Math.exp(-5 * tau) * Math.sin(Math.PI * Math.min(1, tau / (c.settle.dur * 0.5)));
      const float = c.open.bob * Math.sin(2 * Math.PI * c.open.bobHz * t) * smooth(tau / c.settle.dur);
      y = sink + float;
      z = 0;
    }

    return { rotX, rotY, rotZ: roll(t, k), y, z, index: k };
  };

  return { config: c, sequence, swapTimes, duration, frames, frame };
}
