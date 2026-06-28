'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import clsx from 'clsx';
import styles from './CardSparkles.module.scss';

// 4-point concave star (sparkle), 24x24 box.
const SPARK_PATH =
  'M12 0 C12 6.6 6.6 12 0 12 C6.6 12 12 17.4 12 24 C12 17.4 17.4 12 24 12 C17.4 12 12 6.6 12 0 Z';

const rand = (a: number, b: number) => a + Math.random() * (b - a);

// Each sparkle owns a distinct corner region (a spread triangle around the card),
// so the three are always spread out and never bunch on one side — they only
// wander/twinkle WITHIN their region.
interface Region {
  t0: number;
  t1: number;
  l0: number;
  l1: number;
}
const REGIONS: Region[] = [
  { t0: -8, t1: 24, l0: -8, l1: 22 }, // top-left
  { t0: -8, t1: 24, l0: 64, l1: 86 }, // top-right
  { t0: 62, t1: 86, l0: 30, l1: 64 }, // bottom-center
];

interface SparkState {
  top: number; // % within the card box (kept close to the card)
  left: number;
  size: number; // px, 8–40
  cax: number; // chroma split direction (x), %
  cay: number; // chroma split direction (y), %
  spin: boolean; // rotate once, or not at all
  spinDur: number;
  dir: 1 | -1;
  floatAmp: number;
  floatDur: number;
  rise: number; // px it translates up as it appears
}

function randomSpark(region: Region): SparkState {
  const ang = rand(0, Math.PI * 2); // random chroma direction each time
  const caDist = rand(5, 10);
  return {
    top: rand(region.t0, region.t1),
    left: rand(region.l0, region.l1),
    size: Math.round(rand(8, 40)),
    cax: +(Math.cos(ang) * caDist).toFixed(1),
    cay: +(Math.sin(ang) * caDist).toFixed(1),
    spin: Math.random() < 0.55, // ~half rotate, the rest stay put
    spinDur: 0.15,
    dir: Math.random() < 0.5 ? 1 : -1,
    floatAmp: rand(8, 18),
    floatDur: rand(2.2, 3.6),
    rise: rand(4, 8),
  };
}

/** A single sparkle that twinkles in, floats/spins, twinkles out, then reappears
 *  somewhere new with a fresh chroma split. */
function Sparkle({ region, startDelay }: { region: Region; startDelay: number }) {
  const reduce = useReducedMotion();
  const [s, setS] = useState<SparkState | null>(null);
  const [gen, setGen] = useState(0);

  // Randomize on mount only (avoids SSR hydration mismatch); then re-roll on a
  // loose interval so it pops in/out at different spots WITHIN its corner region.
  useEffect(() => {
    let alive = true;
    let timer: number | undefined;
    const roll = () => {
      if (!alive) return;
      setS(randomSpark(region));
      setGen((g) => g + 1);
      if (!reduce) timer = window.setTimeout(roll, rand(2.4, 4.4) * 1000);
    };
    const init = window.setTimeout(roll, startDelay * 1000);
    return () => {
      alive = false;
      window.clearTimeout(init);
      if (timer) window.clearTimeout(timer);
    };
  }, [reduce, region, startDelay]);

  if (!s) return null;
  const style = {
    top: `${s.top}%`,
    left: `${s.left}%`,
    width: s.size,
    height: s.size,
    '--cax': `${s.cax}%`,
    '--cay': `${s.cay}%`,
  } as CSSProperties;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={gen}
        className={styles.sparkle}
        style={style}
        // Entrance: twinkle in (opacity + scale) while translating up a few px.
        initial={{ opacity: 0, scale: 0.2, y: s.rise }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.2 }}
        transition={
          reduce
            ? { duration: 0.3 }
            : {
                opacity: { duration: 0.5 },
                scale: { duration: 0.5, ease: 'backOut' },
                y: { duration: 0.55, ease: 'easeOut' },
              }
        }
      >
        {/* Inner wrapper carries the continuous float + the single rotation, so the
            entrance rise (outer y) and the hover float (inner y) don't collide. */}
        <motion.div
          className={styles.sparkInner}
          initial={{ y: 0, rotate: 0 }}
          animate={reduce ? {} : { y: [0, -s.floatAmp, 0], rotate: s.spin ? s.dir * 90 : 0 }}
          transition={
            reduce
              ? undefined
              : {
                  y: { duration: s.floatDur, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' },
                  // A single rotation (no repeat) — never a continuous spin.
                  rotate: { duration: s.spinDur, ease: 'easeOut' },
                }
          }
        >
          {/* Warm-yellow core + red/cyan copies split along a random per-spark
              direction (--cax/--cay), screen-blended → varied chroma aberration. */}
          <svg className={clsx(styles.spark, styles.sparkBase)} viewBox="0 0 24 24">
            <path d={SPARK_PATH} fill="currentColor" />
          </svg>
          <svg className={clsx(styles.spark, styles.sparkR)} viewBox="0 0 24 24">
            <path d={SPARK_PATH} fill="currentColor" />
          </svg>
          <svg className={clsx(styles.spark, styles.sparkC)} viewBox="0 0 24 24">
            <path d={SPARK_PATH} fill="currentColor" />
          </svg>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/** Warm sparkles that twinkle in and out around the issuance card. */
export function CardSparkles() {
  return (
    <div className={styles.layer} aria-hidden>
      {REGIONS.map((region, i) => (
        <Sparkle key={i} region={region} startDelay={i * 0.45} />
      ))}
    </div>
  );
}
