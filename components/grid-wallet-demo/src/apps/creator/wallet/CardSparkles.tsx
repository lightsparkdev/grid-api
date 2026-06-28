'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import clsx from 'clsx';
import styles from './CardSparkles.module.scss';

// 4-point concave star (sparkle), 24x24 box.
const SPARK_PATH =
  'M12 0 C12 6.6 6.6 12 0 12 C6.6 12 12 17.4 12 24 C12 17.4 17.4 12 24 12 C17.4 12 12 6.6 12 0 Z';

const rand = (a: number, b: number) => a + Math.random() * (b - a);

// Each sparkle keeps a size band so the set stays balanced: always a big and a
// small one, the rest mid-range (no clusters of tiny ones).
const SIZE_BANDS: [number, number][] = [
  [28, 38], // always a big one
  [8, 14], // always a small one
  [14, 30],
  [14, 30],
  [12, 26],
  [18, 34],
];

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
  tilt: number; // subtle rock (deg) synced with the wobble
}

function randomSpark(band: [number, number]): SparkState {
  const ang = rand(0, Math.PI * 2);
  const caDist = rand(5, 10);
  const drift = rand(-18, 18);
  // Spawn along the iso card's edges (projected), so they hug the actual card.
  const uv = edgeUV();
  const { left, top } = projectIso(uv.u, uv.v);
  // Rise until it lands in the mask's fully-transparent band (~top 8–18%), so it
  // ALWAYS finishes fading via the mask before it respawns (no early pop).
  const endTop = rand(8, 18);
  const rise = ((top - endTop) / 100) * LAYER_H;
  return {
    left,
    startTop: top,
    size: Math.round(rand(band[0], band[1])),
    rise,
    drift, // wobble amplitude (signed)
    dur: rand(2.4, 4.2),
    cax: +(Math.cos(ang) * caDist).toFixed(1),
    cay: +(Math.sin(ang) * caDist).toFixed(1),
    dir: Math.random() < 0.5 ? 1 : -1,
    // Lean into the sway direction; subtle.
    tilt: (drift >= 0 ? 1 : -1) * rand(8, 14),
  };
}

/** A sparkle that flies up from the card, fading + scaling, then respawns lower
 *  with fresh randomness — a continuous upward stream. */
function Sparkle({ band, startDelay }: { band: [number, number]; startDelay: number }) {
  const reduce = useReducedMotion();
  const [s, setS] = useState<SparkState | null>(null);
  const [gen, setGen] = useState(0);

  // Randomize on mount only (avoids SSR hydration mismatch).
  useEffect(() => {
    const t = window.setTimeout(() => {
      setS(randomSpark(band));
      setGen((g) => g + 1);
    }, startDelay * 1000);
    return () => window.clearTimeout(t);
  }, [band, startDelay]);

  if (!s) return null;
  const style = {
    left: `${s.left}%`,
    top: `${s.startTop}%`,
    width: s.size,
    height: s.size,
    '--cax': `${s.cax}%`,
    '--cay': `${s.cay}%`,
  } as CSSProperties;

  const sparkSvgs = (
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

  if (reduce) {
    return (
      <motion.div className={styles.sparkle} style={style} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {sparkSvgs}
      </motion.div>
    );
  }

  return (
    <motion.div
      key={gen}
      className={styles.sparkle}
      style={style}
      // Fade IN + scale in at spawn; the layer's alpha mask handles the fade-OUT,
      // so every sparkle dissolves at the same height above the card.
      initial={{ opacity: 0, scale: 0.3, x: 0, y: 0, rotate: 0 }}
      // Gentle side-to-side wobble (x keyframes) while it rises (y); the rotation
      // does a quick turn at spawn then a subtle rock synced with the wobble.
      animate={{
        opacity: 1,
        scale: 1,
        x: [0, s.drift, -s.drift * 0.7, s.drift * 0.35],
        y: -s.rise,
        rotate: [0, s.dir * 90, s.dir * 90 + s.tilt, s.dir * 90 - s.tilt * 0.7, s.dir * 90 + s.tilt * 0.35],
      }}
      transition={{
        opacity: { duration: 0.4 },
        scale: { duration: 0.4, ease: 'backOut' },
        x: { duration: s.dur, times: [0, 0.32, 0.66, 1], ease: 'easeInOut' },
        y: { duration: s.dur, ease: 'linear' }, // steady rise into the fade band
        // Quick turn (first 6%), then a subtle rock in sync with the x wobble.
        rotate: { duration: s.dur, times: [0, 0.06, 0.32, 0.66, 1], ease: 'easeOut' },
      }}
      // Respawn (new spot + params) once it has risen into the masked-out zone.
      onAnimationComplete={() => {
        setS(randomSpark(band));
        setGen((g) => g + 1);
      }}
    >
      {sparkSvgs}
    </motion.div>
  );
}

/** Warm sparkles continuously flying up from the issuance card. */
export function CardSparkles() {
  return (
    <div className={styles.layer} aria-hidden>
      {SIZE_BANDS.map((band, i) => (
        <Sparkle key={i} band={band} startDelay={i * 0.5} />
      ))}
    </div>
  );
}
