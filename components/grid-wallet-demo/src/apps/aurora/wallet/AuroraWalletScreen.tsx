'use client';

import { GlassSymbolButton } from '@/apps/shared/glass';
import { SfSymbol } from '@/apps/shared/icons';
import { BalanceHero } from './BalanceHero';
import { WalletSheet } from './WalletSheet';
import styles from './AuroraWalletScreen.module.scss';

interface AuroraWalletScreenProps {
  /** Formatted balance from demo state, e.g. "$0.00". */
  balance?: string;
}

/** Aurora wallet home — built piece-by-piece from Figma (Bitcoin 2026). */
export function AuroraWalletScreen({ balance = '$0.00' }: AuroraWalletScreenProps) {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>Wallet</h1>
        <GlassSymbolButton aria-label="Settings" size={40} type="button">
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
        </WalletSheet>
      </div>
    </div>
  );
}
