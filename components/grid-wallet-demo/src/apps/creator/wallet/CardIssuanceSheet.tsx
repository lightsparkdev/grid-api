'use client';

import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconCrossMedium';
import { BottomSheet } from '@/apps/shared/BottomSheet';
import { PHONE_SHELL_GLASS } from '@/components/liquid-glass';
import type { CardView } from '@/apps/shared/wallet';
import { SheetIconButton } from '../blocks/SheetIconButton';
import { CREATOR_STACKED_SHEET_DURATION } from '../config';
import { IntroContent, ReadyContent } from './CardIssuanceContent';
import { SpeedRays } from './SpeedLines';
import styles from './CardIssuanceSheet.module.scss';

interface CardIssuanceSheetProps {
  open: boolean;
  /** Drives which copy shows (intro/creating/ready). Only meaningful while open. */
  cardView: CardView;
  onClose: () => void;
  onCreate: () => void;
  onContinue: () => void;
}

/** Glitch card-issuance as a tall stacked sheet (Figma 2528:21062). The card
 *  itself is a sibling foreground element in CreatorWalletScreen (so it can morph
 *  on into card-home); this sheet owns the chrome — X, the reserved card slot, and
 *  the reused intro/creating/ready copy + CTA. */
export function CardIssuanceSheet({
  open,
  cardView,
  onClose,
  onCreate,
  onContinue,
}: CardIssuanceSheetProps) {
  // Once the card is created the burst warps out to a clean white screen; keep it
  // white through the Continue → card-home handoff.
  const onWhite = cardView === 'ready' || cardView === 'home';
  return (
    <BottomSheet
      open={open}
      onDismiss={onClose}
      duration={CREATOR_STACKED_SHEET_DURATION}
      // Solid brand-purple sheet (Figma "Stream Manager" onboarding look) — the
      // floating card hovers over it. 24px top corners; shell smoothing so the
      // bottom corners nest in the screen squircle.
      glass={{
        radius: 24,
        cornerSmoothing: PHONE_SHELL_GLASS.cornerSmoothing,
        tint: 'var(--app-tint)',
        edge: 'transparent',
        edgeGlint: false,
        edgeWidth: 0.5,
        shadow: '0 15px 37.5px rgba(0, 0, 0, 0.18)',
      }}
    >
      <div className={clsx(styles.flow, onWhite ? styles.flowReady : styles.flowBurst)}>
        {/* Brand light→dark gradient backdrop. */}
        <div className={styles.bg} aria-hidden />
        {/* White screen fades in as the card finishes (created state). */}
        <AnimatePresence>
          {onWhite && (
            <motion.div
              key="ready-bg"
              className={styles.readyBg}
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </AnimatePresence>
        {/* Procedural chroma-aberrated radial speed lines: a randomized SVG ray
            field (varied length / width / spacing / intensity / blur) drawn three
            times — tinted R/G/B and radially offset, screen-blended (the
            aberration) — with a slow rotate + breathe "hum". On created, it warps
            out: scales up + blurs + fades, like flying past into the white. */}
        <motion.div
          className={clsx(
            styles.speedLines,
            // Alpha-mask the rays behind the bottom copy (intro) so the real
            // gradient shows through.
            cardView === 'intro' && styles.speedLinesMasked,
          )}
          aria-hidden
          initial={false}
          // Burst lives in the intro only — it fades out the moment the card starts
          // creating (and stays gone through the white ready screen).
          animate={{ opacity: cardView === 'intro' ? 0.5 : 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.burstRotate}>
            <div className={styles.burstBreathe}>
              <SpeedRays />
            </div>
          </div>
        </motion.div>

        <div className={styles.toolbar}>
          <SheetIconButton aria-label="Close" size={40} type="button" ghost onClick={onClose}>
            <IconCrossMedium size={24} />
          </SheetIconButton>
        </div>

        {/* Copy + CTA anchored at the bottom; the floating card (foreground layer)
            sits centered in the open space above. The "Creating…" caption rides
            the foreground layer too (just under the card), not this content.
            Each block carries its own gradient mask (sized to its height) and
            fades out on Create — so the mask leaves with the copy while the card
            centers + creates, then returns with the ready copy. */}
        <div className={styles.content}>
          <AnimatePresence>
            {cardView === 'intro' && (
              <motion.div
                key="intro"
                className={styles.contentBlock}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                // Hold a 300ms beat before the copy clears (matches the card's
                // delayed move-to-centre on Create).
                exit={{ opacity: 0, transition: { duration: 0.25, delay: 0.3 } }}
                transition={{ duration: 0.25 }}
              >
                <IntroContent onCreate={onCreate} />
              </motion.div>
            )}
            {cardView === 'ready' && (
              <motion.div
                key="ready"
                className={styles.contentBlock}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <ReadyContent onContinue={onContinue} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </BottomSheet>
  );
}
