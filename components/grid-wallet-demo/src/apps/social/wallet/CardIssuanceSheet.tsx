'use client';

import { AnimatePresence, motion } from 'motion/react';
import { BottomSheet } from '@/apps/shared/BottomSheet';
import { PHONE_SHELL_GLASS } from '@/components/liquid-glass';
import { motionTransition } from '@/lib/easing';
import type { CardView } from '@/apps/shared/wallet';
import { IconCrossMedium as IconCrossZ } from '../icons';
import { IntroContent, ReadyContent, CreatingCaption } from './CardIssuanceContent';
import styles from './CardIssuanceSheet.module.scss';

// Slower slide to match the Z money flows' full-screen presentation.
const SHEET_DURATION = 0.5;
// Step swap — the leaver blur-fades out; the arriver's own stagger reveal plays in.
const STEP_EXIT = {
  exit: { opacity: 0, filter: 'blur(8px)' },
  transition: motionTransition(undefined, 0.28),
};

/**
 * Z card issuance — a flat, full-screen sheet (intro → creating → ready). A
 * placeholder graphic sits at the top (the animated card mark lands here later)
 * and dissolves into the base bg via the gradient mask; the copy + CTA are
 * anchored at the bottom. `creating` auto-advances to `ready` (shared brain).
 */
export function CardIssuanceSheet({
  open,
  cardView,
  onClose,
  onCreate,
  onContinue,
}: {
  open: boolean;
  cardView: CardView;
  onClose: () => void;
  onCreate: () => void;
  onContinue: () => void;
}) {
  return (
    <BottomSheet
      open={open}
      onDismiss={onClose}
      duration={SHEET_DURATION}
      glass={{
        radius: 0,
        cornerSmoothing: PHONE_SHELL_GLASS.cornerSmoothing,
        tint: 'var(--app-bg)',
        edge: 'var(--sheet-flat-edge)',
        edgeGlint: false,
        edgeWidth: 0.5,
        shadow: '0 15px 37.5px rgba(0, 0, 0, 0.18)',
      }}
    >
      <div className={styles.issuance}>
        <header className={styles.nav}>
          <button
            type="button"
            className={styles.navBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <IconCrossZ size={24} />
          </button>
        </header>

        {/* Placeholder graphic — the animated card mark lands here later. */}
        <div className={styles.graphic} aria-hidden>
          <div className={styles.placeholder} />
        </div>

        {/* Copy + CTA, anchored at the bottom on a solid bg; the ::before fade
            dissolves the graphic above into the base bg. */}
        <div className={styles.content}>
          <AnimatePresence mode="wait" initial={false}>
            {cardView === 'intro' && (
              <motion.div key="intro" {...STEP_EXIT}>
                <IntroContent onCreate={onCreate} />
              </motion.div>
            )}
            {cardView === 'creating' && (
              <motion.div key="creating" {...STEP_EXIT}>
                <CreatingCaption />
              </motion.div>
            )}
            {cardView === 'ready' && (
              <motion.div key="ready" {...STEP_EXIT}>
                <ReadyContent onContinue={onContinue} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </BottomSheet>
  );
}
