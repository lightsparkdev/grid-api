'use client';

import { GlassSymbolButton, GlassWindowButtonGroup, headerGlassBrightness } from '@/apps/shared/glass';
import { SfSymbol } from '@/apps/shared/icons';
import { useThemeMode } from '@/hooks/useThemeMode';
import styles from './WalletCardDetailHeader.module.scss';

interface WalletCardDetailHeaderProps {
  onClose: () => void;
}

/** Figma 2143:40972 — close + card actions while debit card detail is open. */
export function WalletCardDetailHeader({ onClose }: WalletCardDetailHeaderProps) {
  const theme = useThemeMode();
  const brightness = headerGlassBrightness(theme);

  return (
    <div className={styles.root}>
      <GlassSymbolButton
        aria-label="Close"
        size={40}
        type="button"
        glass={{ brightness }}
        onClick={onClose}
      >
        <SfSymbol name="xmark" size={14} />
      </GlassSymbolButton>

      <GlassWindowButtonGroup
        symbols={[
          { name: 'creditcard.and.numbers', size: 24 },
          { name: 'ellipsis', size: 20 },
        ]}
        glass={{ brightness }}
      />
    </div>
  );
}
