'use client';

import { GlassSymbolButton, GlassWindowButtonGroup, headerGlassBrightness } from '@/apps/shared/glass';
import { SfSymbol } from '@/apps/shared/icons';
import { useThemeMode } from '@/hooks/useThemeMode';
import styles from './WalletCardDetailHeader.module.scss';

interface WalletCardDetailHeaderProps {
  onClose: () => void;
  /** Card-actions pill (card numbers / more). Hidden during issuance — the card
   *  doesn't exist yet, so only the close button shows. */
  showActions?: boolean;
  /** Static CSS background (tone-matched to the issuance aurora corner) for the
   *  close button's lens to refract while it sits over the full-screen aurora.
   *  Omit when the button is over the flat sheet surface. */
  closeBackdrop?: string;
}

/** Figma 2143:40972 — close + card actions while debit card detail is open. */
export function WalletCardDetailHeader({
  onClose,
  showActions = true,
  closeBackdrop,
}: WalletCardDetailHeaderProps) {
  const theme = useThemeMode();
  const brightness = headerGlassBrightness(theme);

  return (
    <div className={styles.root}>
      <GlassSymbolButton
        aria-label="Close"
        size={40}
        type="button"
        className={closeBackdrop ? styles.closeOnAurora : undefined}
        glass={{ brightness }}
        backdrop={closeBackdrop}
        onClick={onClose}
      >
        <SfSymbol name="xmark" size={14} />
      </GlassSymbolButton>

      {showActions ? (
        <GlassWindowButtonGroup
          symbols={[
            { name: 'creditcard.and.numbers', size: 24 },
            { name: 'ellipsis', size: 20 },
          ]}
          glass={{ brightness }}
        />
      ) : null}
    </div>
  );
}
