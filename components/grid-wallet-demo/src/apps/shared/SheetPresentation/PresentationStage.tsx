'use client';

import clsx from 'clsx';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useState, type ReactNode } from 'react';
import { easeOutSnappy, motionTransition } from '@/lib/easing';
import { useSheetPresented } from './SheetPresentationContext';
import styles from './PresentationStage.module.scss';

// Must match the slide duration of the sheets that scale this stage so the card
// recedes in lockstep with the rising sheet. Creator's wallet sheets pass
// duration={0.5} to BottomSheet, so the stage uses 0.5 too.
const STAGE_TRANSITION = motionTransition(easeOutSnappy, 0.5);
const STAGE_SCALE = 0.92;
// Drop so the receded card's top sits just under the status bar with a small dark
// gap (iOS look). Pairs with AddMoneySheet's .flow top (STAGE_Y + 10) for a 10px peek.
const STAGE_Y = 62;

/**
 * The presenting "card" surface. Wraps a screen's content; when a sheet is
 * presented it scales back and drops behind the sheet, rounding its corners over
 * a dark backdrop. Identity (no transform) when nothing is presented, so the
 * resting screen is pixel-unchanged. `className` carries skin visuals (bg + the
 * status-bar padding).
 *
 * Perf: only the `transform` animates (GPU-composited). The corner rounding is a
 * STATIC class toggle (no border-radius transition — that would re-rasterize the
 * full-screen layer every frame). It rounds for the whole presented stretch and
 * only drops back to square once the close animation finishes (corners are then
 * at the screen edge, hidden by AppShell's clip), so the look is unchanged.
 */
export function PresentationStage({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
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
        className={clsx(styles.stage, rounded && styles.stageRounded, className)}
        initial={false}
        animate={active ? { scale: STAGE_SCALE, y: STAGE_Y } : { scale: 1, y: 0 }}
        transition={STAGE_TRANSITION}
        onAnimationComplete={() => {
          if (!active) setRounded(false);
        }}
      >
        {children}
      </motion.div>
    </>
  );
}
