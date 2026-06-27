'use client';

import clsx from 'clsx';
import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import { easeOutSnappy, motionTransition } from '@/lib/easing';
import { useSheetPresented } from './SheetPresentationContext';
import styles from './PresentationStage.module.scss';

// Matches the BottomSheet slide (0.4s snappy) so the card recedes in lockstep
// with the rising sheet.
const STAGE_TRANSITION = motionTransition(easeOutSnappy, 0.4);
const STAGE_SCALE = 0.92;
// Drop so the receded card's top sits just under the status bar with a small dark
// gap (iOS look).
const STAGE_Y = 64;

/**
 * The presenting "card" surface. Wraps a screen's content; when a sheet is
 * presented it scales back and drops behind the sheet, rounding its corners over
 * a dark backdrop. Identity (no transform) when nothing is presented, so the
 * resting screen is pixel-unchanged. `className` carries skin visuals (bg + the
 * status-bar padding).
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
  return (
    <>
      <div className={styles.backdrop} aria-hidden />
      <motion.div
        className={clsx(styles.stage, presented && styles.stagePresented, className)}
        initial={false}
        animate={
          reduceMotion
            ? { scale: 1, y: 0 }
            : { scale: presented ? STAGE_SCALE : 1, y: presented ? STAGE_Y : 0 }
        }
        transition={STAGE_TRANSITION}
      >
        {children}
      </motion.div>
    </>
  );
}
