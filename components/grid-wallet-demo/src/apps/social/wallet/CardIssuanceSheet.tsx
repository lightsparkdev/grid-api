'use client';

import { lazy, Suspense, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BottomSheet } from '@/apps/shared/BottomSheet';
import { PHONE_SHELL_GLASS } from '@/components/liquid-glass';
import { motionTransition } from '@/lib/easing';
import type { CardView } from '@/apps/shared/wallet';
import { IconCrossMedium as IconCrossZ } from '../icons';
import { IntroContent, ReadyContent, CreatingCaption } from './CardIssuanceContent';
import { useCard3DSupport } from './card3d/useCard3DSupport';
import { CanvasErrorBoundary } from './card3d/CanvasErrorBoundary';
import styles from './CardIssuanceSheet.module.scss';

// Code-split the 3D card (three.js) — only fetched when the issuance flow opens.
const ZCardCanvas = lazy(() => import('./card3d/ZCardCanvas'));

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
  issued,
  cardNumber = '•••• 8972',
  onClose,
  onCreate,
  onContinue,
}: {
  open: boolean;
  cardView: CardView;
  issued: boolean;
  cardNumber?: string;
  onClose: () => void;
  onCreate: () => void;
  onContinue: () => void;
}) {
  const support = useCard3DSupport();
  // Fade the 3D graphic in only once its maps are generated (no placeholder, no
  // untextured flash); gated on `open` so the fade plays each time the sheet opens.
  const [graphicReady, setGraphicReady] = useState(false);
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

        {/* The 3D metal Z card — fills the top, dissolves into the bg below via
            the content's gradient fade. Flat fallback during load / when WebGL is
            unavailable; reduced-motion renders the card static. */}
        <div className={styles.graphic} aria-hidden>
          {support?.webgl && (
            <CanvasErrorBoundary fallback={null}>
              <Suspense fallback={null}>
                <motion.div
                  style={{ width: '100%', height: '100%' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: open && graphicReady ? 1 : 0 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                >
                  <ZCardCanvas
                    cardView={cardView}
                    issued={issued}
                    cardNumber={cardNumber}
                    reducedMotion={support.reducedMotion}
                    onReady={() => setGraphicReady(true)}
                  />
                </motion.div>
              </Suspense>
            </CanvasErrorBoundary>
          )}
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
