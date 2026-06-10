'use client';

import { GlassSymbolButton, GlassWindowButtonGroup } from '@/apps/shared/glass';
import { SfSymbol } from '@/apps/shared/icons';
import styles from './WalletCardDetailHeader.module.scss';

interface WalletCardDetailHeaderProps {
  onClose: () => void;
}

/** Figma 2143:40972 — close + card actions while debit card detail is open. */
export function WalletCardDetailHeader({ onClose }: WalletCardDetailHeaderProps) {
  return (
    <div className={styles.root}>
      <GlassSymbolButton
        aria-label="Close"
        size={40}
        type="button"
        glass={{ brightness: 1 }}
        onClick={onClose}
      >
        <SfSymbol name="xmark" size={14} />
      </GlassSymbolButton>

      <GlassWindowButtonGroup symbols={['creditcard.and.numbers', 'ellipsis']} />
    </div>
  );
}
