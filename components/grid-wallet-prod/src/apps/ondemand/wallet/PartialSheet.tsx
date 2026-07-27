'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { easeOutSnappy, motionTransition } from '@/lib/easing';
import { ONDEMAND_SHEET_DURATION } from '../config';
import styles from './PartialSheet.module.scss';

const SHEET_TRANSITION = motionTransition(easeOutSnappy, ONDEMAND_SHEET_DURATION);

interface PartialSheetProps {
  open: boolean;
  onDismiss: () => void;
  /** Centered header title — Uber's sheet grammar (IMG_0678): title bar with a
      hairline below it, no close button (the scrim dismisses). */
  title: string;
  children: ReactNode;
}

/**
 * Partial-height bottom sheet, Uber-style (IMG_0678): flat card rising from
 * the bottom edge over a dim scrim, SQUARE top corners, a centered title bar
 * with a bottom hairline, no X. NO iOS stack recede: this app presents with
 * plain slide-ups and pushes only.
 */
export function PartialSheet({ open, onDismiss, title, children }: PartialSheetProps) {
  const reduceMotion = useReducedMotion();

  return (
    <>
      <motion.div
        className={styles.scrim}
        aria-hidden
        initial={false}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: ONDEMAND_SHEET_DURATION, ease: 'easeOut' }}
        style={{ pointerEvents: open ? 'auto' : 'none' }}
        onClick={onDismiss}
      />
      <motion.div
        className={styles.layer}
        initial={false}
        // visibility:hidden once parked — aria-hidden alone leaves the closed
        // sheet's buttons TABBABLE, and focusing one scrolls the phone screen.
        animate={
          open
            ? { y: 0, visibility: 'visible' }
            : { y: '110%', transitionEnd: { visibility: 'hidden' } }
        }
        transition={reduceMotion ? { duration: 0 } : SHEET_TRANSITION}
        style={{ pointerEvents: open ? 'auto' : 'none' }}
        aria-hidden={!open}
      >
        <div className={styles.sheet}>
          <h2 className={styles.header}>{title}</h2>
          {children}
        </div>
      </motion.div>
    </>
  );
}
