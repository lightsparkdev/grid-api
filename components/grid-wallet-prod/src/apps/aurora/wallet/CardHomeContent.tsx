'use client';

import { IconNfc1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconNfc1';
import type { WalletListItemData } from './WalletListItem';
import { WalletListSection } from './WalletListSection';
import styles from './CardHomeContent.module.scss';

interface CardHomeContentProps {
  /** Card-home transactions; the empty state shows when there are none. */
  transactions?: WalletListItemData[];
  /** Start the tap-to-pay flow. */
  onTapToPay?: () => void;
}

/** Figma 2143:40926 — card-home body: transactions list + Tap to pay. */
export function CardHomeContent({ transactions, onTapToPay }: CardHomeContentProps) {
  return (
    <>
      <div className={styles.walletBtnWrap}>
        <button type="button" className={styles.walletBtn} onClick={onTapToPay}>
          <span className={styles.walletLabel}>Tap to pay</span>
          <IconNfc1 className={styles.walletIcon} size={20} aria-hidden />
        </button>
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
        concentricBottom
        grow
      />
    </>
  );
}
