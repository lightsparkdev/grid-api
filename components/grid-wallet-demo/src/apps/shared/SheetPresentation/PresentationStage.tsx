'use client';

import clsx from 'clsx';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useState, type ReactNode } from 'react';
import { easeOutSnappy, motionTransition } from '@/lib/easing';
import { useSheetPresented } from './SheetPresentationContext';
import styles from './PresentationStage.module.scss';

// Neutral iOS-ish defaults. Each skin tunes via props; the duration default
// matches BottomSheet's default slide so a screen using stock sheets stays in
// sync for free (only retune both together when a skin slows its sheets).
const DEFAULT_SCALE = 0.92;
const DEFAULT_OFFSET = 64;
const DEFAULT_DURATION = 0.35;
const DEFAULT_RADIUS = 16;

interface PresentationStageProps {
  className?: string;
  children: ReactNode;
  /** Scale of the receded card while a sheet is presented (default 0.92). */
  scale?: number;
  /** Downward translate (px) of the receded card — its top drops this far so the
   *  sheet peeks above it. Coordinate with the sheet's top for the peek you want
   *  (peek = sheetTop − offset). Default 64. */
  offset?: number;
  /** Scale/translate duration (s). MUST equal the slide duration of the sheets
   *  that scale this stage so the two move in lockstep. Default 0.35, matching
   *  BottomSheet's default `duration`. */
  duration?: number;
  /** Corner radius (px) of the receded card (default 16). */
  radius?: number;
}

/**
 * The presenting "card" surface. Wraps a screen's content; when a sheet is
 * presented it scales back and drops behind the sheet, rounding its corners over
 * a dark backdrop. Identity (no transform) when nothing is presented, so the
 * resting screen is pixel-unchanged. `className` carries skin visuals (bg + the
 * status-bar padding); the motion is tuned per-skin via the props above.
 *
 * Perf: only the `transform` animates (GPU-composited). The corner rounding is a
 * STATIC inline toggle (no border-radius transition — that would re-rasterize the
 * full-screen layer every frame). It rounds for the whole presented stretch and
 * only drops back to square once the close animation finishes (corners are then
 * at the screen edge, hidden by AppShell's clip), so the look is unchanged.
 */
export function PresentationStage({
  className,
  children,
  scale = DEFAULT_SCALE,
  offset = DEFAULT_OFFSET,
  duration = DEFAULT_DURATION,
  radius = DEFAULT_RADIUS,
}: PresentationStageProps) {
  const presented = useSheetPresented();
  const reduceMotion = useReducedMotion();
  const active = presented && !reduceMotion;

  const [rounded, setRounded] = useState(false);
  useEffect(() => {
    if (active) setRounded(true);
  }, [active]);

  return (
    <>
      <div className={styles.backdrop} aria-hidden />
      <motion.div
        className={clsx(styles.stage, className)}
        initial={false}
        animate={active ? { scale, y: offset } : { scale: 1, y: 0 }}
        transition={motionTransition(easeOutSnappy, duration)}
        // Static (un-transitioned) radius toggle so only the transform animates;
        // see the .stage comment. Held through the close, dropped on complete.
        style={{ borderRadius: rounded ? radius : 0 }}
        onAnimationComplete={() => {
          if (!active) setRounded(false);
        }}
      >
        {children}
      </motion.div>
    </>
  );
}
