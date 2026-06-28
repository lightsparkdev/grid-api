'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import clsx from 'clsx';
import styles from './CardSparkles.module.scss';

// 4-point concave star (sparkle), 24x24 box.
const SPARK_PATH =
  'M12 0 C12 6.6 6.6 12 0 12 C6.6 12 12 17.4 12 24 C12 17.4 17.4 12 24 12 C17.4 12 12 6.6 12 0 Z';

const rand = (a: number, b: number) => a + Math.random() * (b - a);

// Size bands picked at random per spawn so the stream stays balanced: a big, a
// small, the rest mid-range (no clusters of tiny ones).
const BIG_BAND: [number, number] = [30, 40];
const SMALL_BAND: [number, number] = [14, 19];
const MID_BANDS: [number, number][] = [
  [18, 30],
  [20, 34],
  [16, 26],
];
const BIG_MIN = 28; // size ≥ this counts as "big"
const SMALL_MAX = 20; // size ≤ this counts as "small"

/** Keep the stream balanced: if no big is on screen, spawn big; else if no small,
 *  spawn small; otherwise a random mid — so there's never a run of small ones
 *  without a bigger one for contrast. */
function nextBand(active: SparkState[]): [number, number] {
  if (!active.some((s) => s.size >= BIG_MIN)) return BIG_BAND;
  if (!active.some((s) => s.size <= SMALL_MAX)) return SMALL_BAND;
  return MID_BANDS[Math.floor(Math.random() * MID_BANDS.length)];
}

// New sparkle emitted every SPAWN_MIN–SPAWN_MAX seconds (steady jittered rate) —
// a true continuous stream; lifetime ÷ rate ≈ how many are on screen at once.
const SPAWN_MIN = 0.5;
const SPAWN_MAX = 0.9;

// Iso projection so spawns match the actual tilted card (a diamond), not the flat
// rectangular layer. Mirrors the card transform: rotateZ(45) then rotateX(54.736),
// orthographic. CARD_W/H is the card's pre-transform size; LAYER_TOP is how far the
// sparkle layer extends above the card (see .layer in the SCSS).
const D2R = Math.PI / 180;
const ISO_RX = 54.736;
const ISO_RZ = 45;
const CARD_W = 360;
const CARD_H = 232;
const LAYER_TOP = 210; // px the layer extends ABOVE the card (see .layer SCSS)
const LAYER_SIDE = 60; // px the layer extends to each SIDE (see .layer SCSS)
const LAYER_W = CARD_W + LAYER_SIDE * 2;
const LAYER_H = CARD_H + LAYER_TOP;

/** Project a point on the card face (u,v in [-1,1] = fraction of half-extent) to a
 *  { left%, top% } in the flat sparkle layer. The layer is wider/taller than the
 *  card so corner spawns + the rise stay inside it (the mask clips to the box). */
function projectIso(u: number, v: number): { left: number; top: number } {
  const lx = u * (CARD_W / 2);
  const ly = v * (CARD_H / 2);
  const cz = Math.cos(ISO_RZ * D2R);
  const sz = Math.sin(ISO_RZ * D2R);
  const cx = Math.cos(ISO_RX * D2R);
  const xs = lx * cz - ly * sz; // rotateZ
  const ys = (lx * sz + ly * cz) * cx; // rotateZ then rotateX (orthographic)
  return {
    left: ((LAYER_SIDE + CARD_W / 2 + xs) / LAYER_W) * 100,
    top: ((LAYER_H - CARD_H / 2 + ys) / LAYER_H) * 100,
  };
}

/** A point near the card's edges (so sparkles hug the card rim, not the centre). */
function edgeUV(): { u: number; v: number } {
  const along = rand(-0.92, 0.92);
  const edge = rand(0.62, 1);
  switch (Math.floor(rand(0, 4))) {
    case 0:
      return { u: along, v: -edge }; // top
    case 1:
      return { u: along, v: edge }; // bottom
    case 2:
      return { u: -edge, v: along }; // left
    default:
      return { u: edge, v: along }; // right
  }
}

/** Pick one of the four card corners (optionally not `exclude`). */
function pickCorner(exclude?: { cu: number; cv: number }): { cu: number; cv: number } {
  const corners = [
    { cu: -1, cv: -1 },
    { cu: 1, cv: -1 },
    { cu: 1, cv: 1 },
    { cu: -1, cv: 1 },
  ].filter((c) => !exclude || c.cu !== exclude.cu || c.cv !== exclude.cv);
  return corners[Math.floor(Math.random() * corners.length)];
}

/** A point hugging a given corner (tight, with a little jitter — never near the
 *  middle). */
function nearCorner(c: { cu: number; cv: number }): { u: number; v: number } {
  return { u: c.cu * rand(0.84, 1.04), v: c.cv * rand(0.84, 1.04) };
}

interface SparkState {
  left: number; // % across the card (spawn x)
  startTop: number; // % down the card (spawn y)
  size: number; // px, 8–36
  rise: number; // px it flies up
  drift: number; // px horizontal drift
  dur: number; // s, lifetime
  cax: number; // chroma split (x), %
  cay: number; // chroma split (y), %
  dir: 1 | -1;
  spin: boolean; // some rotate continuously as they rise, some don't
  spinDeg: number; // total rotation over the rise (spinners)
  tilt: number; // subtle rock (deg) synced with the wobble
  delay: number; // start delay (s) — staggers a twinkle wave
}

type SparkMode = 'rise' | 'twinkle';

function makeSpark(uv: { u: number; v: number }, band: [number, number], mode: SparkMode): SparkState {
  const ang = rand(0, Math.PI * 2);
  const caDist = rand(5, 10);
  const drift = rand(-18, 18);
  const { left, top } = projectIso(uv.u, uv.v);
  // Rise (rise mode only) until it lands in the mask's fully-transparent band
  // (~top 8–18%), so it finishes fading via the mask before it's removed.
  const endTop = rand(8, 18);
  const rise = ((top - endTop) / 100) * LAYER_H;
  return {
    left,
    startTop: top,
    size: Math.round(rand(band[0], band[1])),
    rise,
    drift, // wobble amplitude (signed)
    dur: mode === 'twinkle' ? rand(1.1, 1.9) : rand(2.2, 4.6),
    cax: +(Math.cos(ang) * caDist).toFixed(1),
    cay: +(Math.sin(ang) * caDist).toFixed(1),
    dir: Math.random() < 0.5 ? 1 : -1,
    spin: Math.random() < 0.6, // ~60% rotate as they rise, the rest just drift up
    spinDeg: rand(80, 220),
    // Lean into the sway direction; subtle.
    tilt: (drift >= 0 ? 1 : -1) * rand(8, 14),
    delay: 0,
  };
}

/** Edge-placed sparkle (rise mode's continuous stream). */
function randomSpark(band: [number, number], mode: SparkMode): SparkState {
  return makeSpark(edgeUV(), band, mode);
}

const SparkSvgs = (
  <>
    {/* Warm-yellow core + red/cyan copies split along a random direction
        (--cax/--cay), screen-blended → varied chroma aberration. */}
    <svg className={clsx(styles.spark, styles.sparkBase)} viewBox="0 0 24 24">
      <path d={SPARK_PATH} fill="currentColor" />
    </svg>
    <svg className={clsx(styles.spark, styles.sparkR)} viewBox="0 0 24 24">
      <path d={SPARK_PATH} fill="currentColor" />
    </svg>
    <svg className={clsx(styles.spark, styles.sparkC)} viewBox="0 0 24 24">
      <path d={SPARK_PATH} fill="currentColor" />
    </svg>
  </>
);

/** One sparkle particle. rise: flies up from the card into the mask's fade band.
 *  twinkle: stays put and just fades/scales in and out (created screen). */
function Particle({ s, mode, onDone }: { s: SparkState; mode: SparkMode; onDone: () => void }) {
  const style = {
    left: `${s.left}%`,
    top: `${s.startTop}%`,
    width: s.size,
    height: s.size,
    '--cax': `${s.cax}%`,
    '--cay': `${s.cay}%`,
  } as CSSProperties;

  if (mode === 'twinkle') {
    return (
      <motion.div
        className={styles.sparkle}
        style={style}
        // Pure twinkle in place — no rise; explicit fade/scale in and out.
        initial={{ opacity: 0, scale: 0.2, rotate: 0 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.2, 1, 1, 0.5], rotate: s.spin ? s.dir * 60 : 0 }}
        transition={{
          opacity: { duration: s.dur, times: [0, 0.24, 0.66, 1], delay: s.delay },
          scale: { duration: s.dur, times: [0, 0.24, 0.66, 1], ease: 'backOut', delay: s.delay },
          rotate: { duration: s.dur, ease: 'easeOut', delay: s.delay },
        }}
        onAnimationComplete={onDone}
      >
        {SparkSvgs}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={styles.sparkle}
      style={style}
      initial={{ opacity: 0, scale: 0.3, x: 0, y: 0, rotate: 0 }}
      animate={{
        opacity: 1,
        scale: 1,
        x: [0, s.drift, -s.drift * 0.7, s.drift * 0.35],
        y: -s.rise,
        // Spinners rotate steadily across the WHOLE rise; non-spinners just rock.
        rotate: s.spin ? s.dir * s.spinDeg : [0, s.tilt * 0.5, -s.tilt * 0.4, s.tilt * 0.2],
      }}
      transition={{
        opacity: { duration: 0.4 },
        scale: { duration: 0.4, ease: 'backOut' },
        x: { duration: s.dur, times: [0, 0.32, 0.66, 1], ease: 'easeInOut' },
        y: { duration: s.dur, ease: 'linear' }, // steady rise into the fade band
        rotate: s.spin
          ? { duration: s.dur, ease: 'linear' }
          : { duration: s.dur, times: [0, 0.4, 0.7, 1], ease: 'easeOut' },
      }}
      onAnimationComplete={onDone}
    >
      {SparkSvgs}
    </motion.div>
  );
}

interface ActiveSpark {
  id: number;
  s: SparkState;
}

/** Warm sparkles continuously flying up from the issuance card — a steady-rate
 *  emitter (each particle is fire-and-forget), so it never bunches into waves. */
export function CardSparkles({
  mode = 'rise',
  emit = true,
  startDelay = 0,
}: {
  mode?: SparkMode;
  emit?: boolean;
  /** Hold this many seconds before the first sparkle — lets the stream trail the
   *  card's reveal instead of popping in with it. */
  startDelay?: number;
}) {
  const reduce = useReducedMotion();
  const [particles, setParticles] = useState<ActiveSpark[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    if (reduce) {
      // A few static sparkles (a big, a small, a mid), no stream.
      setParticles([
        { id: idRef.current++, s: randomSpark(BIG_BAND, mode) },
        { id: idRef.current++, s: randomSpark(SMALL_BAND, mode) },
        { id: idRef.current++, s: randomSpark(MID_BANDS[0], mode) },
      ]);
      return;
    }
    // Stopped emitting (e.g. on Create): keep the existing sparkles so they finish
    // and fade out on their own — don't spawn new ones.
    if (!emit) return;
    let alive = true;
    let timer: number;

    if (mode === 'twinkle') {
      // Created screen: a rhythm of PAIRS — "twinkle-twinkle … (rest) … twinkle-
      // twinkle …". Two sparkles close together at random corners, then a gap.
      let timer2: number | undefined;
      const one = () =>
        setParticles((p) => [
          ...p,
          { id: idRef.current++, s: makeSpark(nearCorner(pickCorner()), nextBand(p.map((x) => x.s)), mode) },
        ]);
      const burst = () => {
        if (!alive) return;
        one();
        timer2 = window.setTimeout(() => alive && one(), rand(0.18, 0.34) * 1000);
        timer = window.setTimeout(burst, rand(1.5, 2.6) * 1000);
      };
      timer = window.setTimeout(burst, startDelay * 1000);
      return () => {
        alive = false;
        window.clearTimeout(timer);
        if (timer2) window.clearTimeout(timer2);
      };
    }

    const spawn = () => {
      if (!alive) return;
      setParticles((p) => [
        ...p,
        { id: idRef.current++, s: randomSpark(nextBand(p.map((x) => x.s)), mode) },
      ]);
      timer = window.setTimeout(spawn, rand(SPAWN_MIN, SPAWN_MAX) * 1000);
    };
    timer = window.setTimeout(spawn, startDelay * 1000);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [reduce, mode, emit, startDelay]);

  const remove = (id: number) => setParticles((p) => p.filter((x) => x.id !== id));

  return (
    <div className={clsx(styles.layer, mode === 'twinkle' && styles.layerTwinkle)} aria-hidden>
      {reduce
        ? particles.map((p) => (
            <motion.div
              key={p.id}
              className={styles.sparkle}
              style={{
                left: `${p.s.left}%`,
                top: `${p.s.startTop}%`,
                width: p.s.size,
                height: p.s.size,
                ['--cax' as string]: `${p.s.cax}%`,
                ['--cay' as string]: `${p.s.cay}%`,
              }}
            >
              {SparkSvgs}
            </motion.div>
          ))
        : particles.map((p) => (
            <Particle key={p.id} s={p.s} mode={mode} onDone={() => remove(p.id)} />
          ))}
    </div>
  );
}
