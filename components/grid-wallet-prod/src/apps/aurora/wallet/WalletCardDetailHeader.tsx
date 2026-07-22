'use client';

import { GlassSymbolButton, GlassWindowButtonGroup, headerGlassBrightness } from '@/apps/shared/glass';
import { AuroraLensButton } from '@/apps/aurora/aurora-fx';
import { SfSymbol } from '@/apps/shared/icons';
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
  // The live aurora lens already shows the refracted field, so it needs only a
  // hint of the white lift the flat SVG glass uses — full brightness washes it
  // out on the light surface. (Dark stays 0.)
  const lensBrightness = brightness * 0.2;

  return (
    <div className={styles.root}>
      {closeOnAurora ? (
        <AuroraLensButton
          aria-label="Close"
          size={40}
          type="button"
          className={styles.closeOnAurora}
          brightness={lensBrightness}
          onClick={onClose}
        >
          <SfSymbol name="xmark" size={14} />
        </AuroraLensButton>
      ) : (
        <GlassSymbolButton
          aria-label="Close"
          size={40}
          type="button"
          glass={{ brightness }}
          onClick={onClose}
        >
          <SfSymbol name="xmark" size={14} />
        </GlassSymbolButton>
      )}

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
