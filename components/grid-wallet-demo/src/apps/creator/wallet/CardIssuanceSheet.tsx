'use client';

import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconCrossMedium';
import { BottomSheet } from '@/apps/shared/BottomSheet';
import { PHONE_SHELL_GLASS } from '@/components/liquid-glass';
import type { CardView } from '@/apps/shared/wallet';
import { SheetIconButton } from '../blocks/SheetIconButton';
import { CREATOR_STACKED_SHEET_DURATION } from '../config';
import { CreatingCaption, IntroContent, ReadyContent } from './CardIssuanceContent';
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
  return (
    <BottomSheet
      open={open}
      onDismiss={onClose}
      duration={CREATOR_STACKED_SHEET_DURATION}
      // Flat solid sheet, matching the money sheets (no frost; 24px top corners,
      // shell smoothing so the bottom corners nest in the screen squircle).
      glass={{
        radius: 24,
        cornerSmoothing: PHONE_SHELL_GLASS.cornerSmoothing,
        tint: 'var(--wallet-bg)',
        edge: 'var(--sheet-flat-edge)',
        edgeGlint: false,
        edgeWidth: 0.5,
        shadow: '0 15px 37.5px rgba(0, 0, 0, 0.18)',
      }}
    >
      <div className={styles.flow}>
        <div className={styles.toolbar}>
          <SheetIconButton aria-label="Close" size={40} type="button" ghost onClick={onClose}>
            <IconCrossMedium size={24} />
          </SheetIconButton>
        </div>

        {/* Copy + CTA anchored at the bottom; the floating card (foreground layer)
            sits centered in the open space above. */}
        <div className={styles.content}>
          {cardView === 'intro' && <IntroContent onCreate={onCreate} />}
          {cardView === 'creating' && <CreatingCaption onSurface />}
          {cardView === 'ready' && <ReadyContent onContinue={onContinue} />}
        </div>
      </div>
    </BottomSheet>
  );
}
