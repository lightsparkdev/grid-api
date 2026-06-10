'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { easeOutQuick, motionTransition } from '@/lib/easing';
import styles from './TapToPayStatus.module.scss';

export type TapPhase = 'hold' | 'auth' | 'done';

const SWAP = motionTransition(easeOutQuick, 0.3);
// The check draws left-to-right after the ring has faded in.
const DRAW = motionTransition(easeOutQuick, 0.5, { delay: 0.15 });

/** refs/xcassets/HoldNearReader.svg — phone-near-reader glyph. */
function HoldNearReaderGlyph() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
      <path
        d="M19.5004 47.5L38.7885 59.6948C29.5876 61.3514 23.4861 61.2469 20.484 59.3813C17.482 57.5156 17.6419 53.7195 19.5004 47.5Z"
        fill="#0A7AFF"
        fillOpacity="0.1"
      />
      <path
        d="M32 0C49.6731 0 64 14.3269 64 32C64 49.6731 49.6731 64 32 64C14.3269 64 0 49.6731 0 32C0 14.3269 14.3269 0 32 0ZM21.7227 26.9951C20.5383 26.9952 19.4903 27.3181 19.4902 28.9668V57.501C23.2648 59.3562 27.5102 60.4004 32 60.4004C36.5279 60.4004 40.807 59.338 44.6055 57.4531V28.9668C44.6054 27.3738 43.5574 26.9952 42.373 26.9951H39.2812C39.2812 27.9238 38.816 28.3555 37.8857 28.2891H26.1504C25.5302 28.3334 25.065 27.9016 24.7549 26.9951H21.7227ZM32 3.59961C16.3151 3.59961 3.59961 16.3151 3.59961 32C3.59961 42.3856 9.17567 51.4674 17.4961 56.4199L17.9199 29.6455C17.9822 27.1452 19.3804 25.6847 22.1143 25.6846H41.7256C42.989 25.6846 43.9673 26.1623 44.6602 26.6963C45.4664 27.3178 45.8864 28.3008 45.9199 29.6455L46.3447 56.5137C54.7531 51.5826 60.4004 42.4517 60.4004 32C60.4004 16.3151 47.6849 3.59961 32 3.59961Z"
        fill="#007AFF"
      />
    </svg>
  );
}

/** refs/xcassets/DoneCheck.svg — ring + check; the check draws on `animate`. */
function DoneCheckGlyph({ animate }: { animate: boolean }) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
      <path
        d="M32 0C49.6731 0 64 14.3269 64 32C64 49.6731 49.6731 64 32 64C14.3269 64 0 49.6731 0 32C0 14.3269 14.3269 0 32 0ZM32 3.59961C16.3151 3.59961 3.59961 16.3151 3.59961 32C3.59961 47.6849 16.3151 60.4004 32 60.4004C47.6849 60.4004 60.4004 47.6849 60.4004 32C60.4004 16.3151 47.6849 3.59961 32 3.59961Z"
        fill="#007AFF"
      />
      <motion.path
        d="M19.3086 33.9836L28.7654 45.3261L44.6934 20.6758"
        stroke="#007AFF"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animate ? { pathLength: 0 } : false}
        animate={{ pathLength: 1 }}
        transition={DRAW}
      />
    </svg>
  );
}

/** Figma 2143:41178 / 2143:41197 — the tap-to-pay reader status (glyph + label). */
export function TapToPayStatus({ phase }: { phase: TapPhase }) {
  const reduceMotion = useReducedMotion();
  const done = phase === 'done';
  const key = done ? 'done' : 'hold';

  return (
    <div className={styles.root}>
      <div className={styles.glyph}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={key}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
            transition={SWAP}
          >
            {done ? <DoneCheckGlyph animate={!reduceMotion} /> : <HoldNearReaderGlyph />}
          </motion.div>
        </AnimatePresence>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={key}
          className={styles.label}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={SWAP}
        >
          {done ? 'Done' : 'Hold Near Reader'}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
