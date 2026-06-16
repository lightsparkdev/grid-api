'use client';

import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useThemeMode } from '@/hooks/useThemeMode';
import { easeOutQuick, motionTransition } from '@/lib/easing';
import styles from './TapToPayStatus.module.scss';

export type TapPhase = 'hold' | 'auth' | 'done';

// The check draws left-to-right once the Done ring appears (the glyph/label swap
// itself is instant — no crossfade).
const DRAW = motionTransition(easeOutQuick, 0.5, { delay: 0.1 });

/** Looping iOS "Hold Near Reader" contactless clip (theme-matched). The square is
 *  clipped away to the ring in CSS (see .video). */
function HoldNearReaderVideo() {
  const theme = useThemeMode();
  const ref = useRef<HTMLVideoElement>(null);
  const src =
    theme === 'dark'
      ? '/assets/hold-near-reader-dark.mp4'
      : '/assets/hold-near-reader-light.mp4';
  // autoPlay covers most browsers; nudge play() in case it's blocked on mount.
  useEffect(() => {
    ref.current?.play().catch(() => {});
  }, [src]);
  return (
    <video
      ref={ref}
      key={src}
      className={styles.video}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      aria-hidden
    />
  );
}

/** refs/xcassets/DoneCheck.svg — ring + check; the check draws on `animate`. */
function DoneCheckGlyph({ animate }: { animate: boolean }) {
  return (
    <svg className={styles.checkGlyph} viewBox="0 0 64 64" fill="none" aria-hidden>
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

  return (
    <div className={styles.root}>
      <div className={styles.glyph}>
        {done ? <DoneCheckGlyph animate={!reduceMotion} /> : <HoldNearReaderVideo />}
      </div>
      <p className={styles.label}>{done ? 'Done' : 'Hold Near Reader'}</p>
    </div>
  );
}
