'use client';

import { GlassWindowButtonGroup, headerGlassBrightness } from '@/apps/shared/glass';
import { SfSymbol } from '@/apps/shared/icons';
import { SheetIconButton } from '../blocks/SheetIconButton';
import { useThemeMode } from '@/hooks/useThemeMode';
import styles from './WalletCardDetailHeader.module.scss';

interface WalletCardDetailHeaderProps {
  onClose: () => void;
  /** Card-actions pill (card numbers / more). Hidden during issuance — the card
   *  doesn't exist yet, so only the close button shows. */
  showActions?: boolean;
  /** The button sits over the full-screen issuance aurora — use the live WebGL
   *  aurora lens (refracts the real drifting field) and the white glyph. Off when
   *  it's over the flat wallet/card-home surface (plain SVG glass). */
  closeOnAurora?: boolean;
}

/** Figma 2143:40972 — close + card actions while debit card detail is open. */
export function WalletCardDetailHeader({
  onClose,
  showActions = true,
  closeOnAurora = false,
}: WalletCardDetailHeaderProps) {
  const theme = useThemeMode();
  const brightness = headerGlassBrightness(theme);

  return (
    <div className={styles.root}>
      <SheetIconButton
        aria-label="Close"
        size={40}
        type="button"
        onClick={onClose}
      >
        <SfSymbol name="xmark" size={14} />
      </SheetIconButton>

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
