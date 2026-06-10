'use client';

import { GlassSymbolButton } from '@/apps/shared/glass';
import { SfSymbol } from '@/apps/shared/icons';
import { BalanceHero } from './BalanceHero';
import { WalletActions } from './WalletActions';
import { WalletActivitySection } from './WalletActivitySection';
import { WalletInsightCards, type WalletInsightCardsProps } from './WalletInsightCards';
import { WalletSheet } from './WalletSheet';
import styles from './AuroraWalletScreen.module.scss';

interface AuroraWalletScreenProps extends WalletInsightCardsProps {
  /** Formatted balance from demo state, e.g. "$0.00". */
  balance?: string;
  onAdd?: () => void;
  onWithdraw?: () => void;
  onSend?: () => void;
}

/** Aurora wallet home — built piece-by-piece from Figma (Bitcoin 2026). */
export function AuroraWalletScreen({
  balance = '$0.00',
  onAdd,
  onWithdraw,
  onSend,
  ...insights
}: AuroraWalletScreenProps) {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>Wallet</h1>
        <GlassSymbolButton
          aria-label="Settings"
          size={40}
          type="button"
          glass={{ brightness: 1 }}
        >
          <SfSymbol name="gearshape.fill" size={17} />
        </GlassSymbolButton>
      </header>

      <div className={styles.body}>
        <div className={styles.cardWrap}>
          {/* Debit card lands here — sheet slides down when it opens. */}
          <div className={styles.debitCardSlot} aria-hidden />
        </div>

        <WalletSheet>
          <BalanceHero balance={balance} />
          <WalletActions onAdd={onAdd} onWithdraw={onWithdraw} onSend={onSend} />
          <WalletInsightCards {...insights} />
          <WalletActivitySection onAdd={onAdd} />
        </WalletSheet>
      </div>
    </div>
  );
}
