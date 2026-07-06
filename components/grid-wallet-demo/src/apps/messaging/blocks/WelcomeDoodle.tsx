'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { easeOutSnappy, motionTransition } from '@/lib/easing';
import { IconBubbleAnnotation3 } from '../icons';
import styles from './WelcomeDoodle.module.scss';

/** One doodle element: its slot in the composition (percent of the stage,
 *  which keeps the original artwork's proportions) + its idle drift. Each
 *  layer is a standalone SVG asset, so swapping in Figma-exported vectors
 *  later is a 1:1 `src` change. */
interface DoodlePart {
  src: string;
  width: string;
  left: string;
  top: string;
  z: number;
  /** Idle drift: x/y travel (px), rotate (deg), scale delta, cycle (s). */
  x: number;
  y: number;
  rotate: number;
  scale: number;
  duration: number;
}

const ASSET = (name: string) => `/assets/messaging/doodle/${name}.svg`;

/* Geometry sampled from the original single-image composition; z-order
   matches its overlaps (bubbles behind, hardware in front). Durations all
   differ so the drift never reads as one synced loop. */
/* Two size families: the four small props (heart / coin / handset / padlock)
   share one width, the two chat bubbles share another. */
const SMALL_W = '20%';
const BUBBLE_W = '62%';

const PARTS: DoodlePart[] = [
  { src: 'bubble-cream', width: BUBBLE_W, left: '0%', top: '8%', z: 1, x: 2, y: 2.5, rotate: 0.7, scale: 0.015, duration: 6.4 },
  { src: 'bubble-mint', width: BUBBLE_W, left: '26%', top: '40%', z: 4, x: 2, y: 2, rotate: 0.5, scale: 0.012, duration: 7.2 },
  { src: 'globe', width: '46%', left: '52%', top: '1%', z: 2, x: 3, y: 3, rotate: -1.0, scale: 0.025, duration: 5.2 },
  { src: 'handset', width: SMALL_W, left: '8%', top: '2%', z: 3, x: 3.5, y: 3.5, rotate: 1.4, scale: 0.03, duration: 4.4 },
  { src: 'heart', width: SMALL_W, left: '0%', top: '44%', z: 3, x: 3, y: 2.5, rotate: -1.2, scale: 0.04, duration: 3.8 },
  { src: 'coin', width: SMALL_W, left: '16%', top: '72%', z: 5, x: 3, y: 3, rotate: 1.6, scale: 0.045, duration: 4.0 },
  { src: 'padlock', width: SMALL_W, left: '70%', top: '60%', z: 5, x: 3, y: 3, rotate: -1.1, scale: 0.035, duration: 4.8 },
];

/* The two-beat loop — a true MATCH CUT: the outgoing beat accelerates DOWN to
   half size and, at the instant it cuts away (mid-motion), the incoming beat
   appears AT that same half size already growing (AnimatePresence
   mode="wait" swaps exactly at the exit's end — the scales match across the
   cut, so it reads as one continuous motion changing subject). */
const SWAP_IN_S = 0.4;
const SWAP_OUT_S = 0.25;
/** The scale both beats share at the cut instant. */
const CUT_SCALE = 0.5;
const LOGO_HOLD_MS = 3000;
const PARTS_HOLD_MS = 5000;

/* Exit ACCELERATES into the cut (ease-in — still moving fast at the swap);
   the enter decelerates out of it. */
const EASE_IN: [number, number, number, number] = [0.55, 0.055, 0.675, 0.19];
const BEAT_ENTER = motionTransition(easeOutSnappy, SWAP_IN_S);
const BEAT_EXIT = motionTransition(EASE_IN, SWAP_OUT_S);
const BEAT_HIDDEN = { scale: CUT_SCALE };
const BEAT_SHOWN = { scale: 1 };

export function WelcomeDoodle({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const [beat, setBeat] = useState<'logo' | 'parts'>('logo');

  // Beat clock: hold time counts from the moment the beat is IN (the
  // previous exit + this enter included). Reduced motion pins the parts.
  useEffect(() => {
    if (reduceMotion) return;
    const ms =
      (beat === 'logo' ? LOGO_HOLD_MS : PARTS_HOLD_MS) +
      (SWAP_OUT_S + SWAP_IN_S) * 1000;
    const t = window.setTimeout(
      () => setBeat((b) => (b === 'logo' ? 'parts' : 'logo')),
      ms,
    );
    return () => window.clearTimeout(t);
  }, [beat, reduceMotion]);

  const showParts = reduceMotion || beat === 'parts';

  return (
    <div className={clsx(styles.stage, className)} aria-hidden>
      {/* mode="wait": the incoming beat mounts EXACTLY when the outgoing
          finishes its shrink — the instantaneous swap of the match cut. */}
      <AnimatePresence mode="wait">
        {!showParts && (
          <motion.div
            key="logo"
            className={styles.logoBeat}
            initial={BEAT_HIDDEN}
            animate={BEAT_SHOWN}
            exit={{ ...BEAT_HIDDEN, transition: BEAT_EXIT }}
            transition={BEAT_ENTER}
          >
            {/* The ambient breath rides an inner element (its own clock).
                The breath's y keyframes are offset +16px so the glyph sits
                slightly below stage center, matching the illustrations'
                visual weight. */}
            <motion.span
              className={styles.logoGlyph}
              animate={{ scale: [1, 1.03, 1, 0.98, 1], y: [16, 13, 16, 19, 16] }}
              transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <IconBubbleAnnotation3 size={80} />
            </motion.span>
          </motion.div>
        )}
        {showParts && (
          <motion.div
            key="parts"
            className={styles.partsBeat}
            initial={reduceMotion ? false : BEAT_HIDDEN}
            animate={BEAT_SHOWN}
            exit={{ ...BEAT_HIDDEN, transition: BEAT_EXIT }}
            transition={BEAT_ENTER}
          >
            {PARTS.map((p) => (
              <div
                key={p.src}
                className={styles.slot}
                style={{ width: p.width, left: p.left, top: p.top, zIndex: p.z }}
              >
                <motion.img
                  className={styles.part}
                  src={ASSET(p.src)}
                  alt=""
                  draggable={false}
                  animate={
                    reduceMotion
                      ? undefined
                      : {
                          // Full cycles THROUGH the rest pose — no seam per
                          // repeat; x runs reversed against y so the path
                          // traces a loose arc, not a diagonal shuttle.
                          x: [0, -p.x, 0, p.x, 0],
                          y: [0, p.y, 0, -p.y, 0],
                          rotate: [0, p.rotate, 0, -p.rotate, 0],
                          scale: [1, 1 + p.scale, 1, 1 - p.scale, 1],
                        }
                  }
                  transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
