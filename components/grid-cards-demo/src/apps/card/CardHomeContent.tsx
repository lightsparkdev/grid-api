'use client';

import { IconBank } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconBank';
import type { CardControls, WalletListItemData } from '@/apps/shared/card';
import { formatUsdCents } from '@/apps/shared/card';
import { WalletListSection } from './WalletListSection';
import styles from './CardHomeContent.module.scss';

interface CardHomeContentProps {
  /** Card transactions; the empty state shows when there are none. */
  transactions?: WalletListItemData[];
  card: CardControls;
  /** Balance of the card's first funding source, cents. */
  availableCents: number;
}

/** Below the card on the phone: the funding line and the transactions list.
 *  The cardholder doesn't act from here — flows run from the playground. */
export function CardHomeContent({ transactions, card, availableCents }: CardHomeContentProps) {
  return (
    <>
      {/* The one line of wallet left: the card's first funding source. */}
      <div className={styles.funding}>
        <span className={styles.fundingIcon} aria-hidden>
          <IconBank size={14} />
        </span>
        <span className={styles.fundingLabel}>Spend from</span>
        <span className={styles.fundingSource}>Checking •••• 2502</span>
        <span className={styles.fundingDot} aria-hidden>·</span>
        <span className={styles.fundingBalance}>{formatUsdCents(availableCents)}</span>
      </div>

      <WalletListSection
        title="Transactions"
        emptyTitle="Nothing here, yet"
        emptySub={
          <>
            Transactions using your debit
            <br />
            card will show up here
          </>
        }
        items={transactions}
        onItemClick={card.openTransaction}
        concentricBottom
        grow
      />
    </>
  );
}
