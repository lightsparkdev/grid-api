'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useRegisterSheet } from '@/apps/shared/SheetPresentation';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { easeOutSnappy, motionTransition } from '@/lib/easing';
import { IconCrossMedium } from '../icons';
import { ONDEMAND_SHEET_DURATION } from '../config';
import styles from './PartialSheet.module.scss';

const SHEET_TRANSITION = motionTransition(easeOutSnappy, ONDEMAND_SHEET_DURATION);

/** Registers with the presentation stage so the nav stack scales down. */
function SheetPresenter({ on }: { on: boolean }) {
  useRegisterSheet(on);
  return null;
}

interface PartialSheetProps {
  open: boolean;
  onDismiss: () => void;
  /** iOS stack effect — scale the nav stack down behind the sheet (the
   *  pageSheet mechanic at partial height). Dim-only without it. */
  recede?: boolean;
  children: ReactNode;
}

/**
 * The Airbnb partial-height bottom sheet (IMG_0612/0626): a flat card rising
 * from the bottom edge with the app's standard 40px top squircle (the auth /
 * Add-bank sheet corners), a floating X — no header bar, no divider — and
 * content laid out by the caller (typically a centered title + subhead).
 */
export function PartialSheet({ open, onDismiss, recede = false, children }: PartialSheetProps) {
  const reduceMotion = useReducedMotion();
  const clip = useSquircleClip<HTMLDivElement>({ figmaRadii: [40, 40, 0, 0] });

  return (
    <>
      {recede && <SheetPresenter on={open} />}
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
        <div ref={clip.ref} style={clip.style} className={styles.sheet}>
          <button type="button" className={styles.closeBtn} aria-label="Close" onClick={onDismiss}>
            <IconCrossMedium size={24} />
          </button>
          {children}
        </div>
      </motion.div>
    </>
  );
}
