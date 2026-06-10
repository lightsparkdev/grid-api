'use client';

import { IconNfc1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconNfc1';
import { WalletListSection } from './WalletListSection';
import styles from './CardHomeContent.module.scss';

/** Figma 2143:40926 — card-home body: transactions list + Add to Apple Wallet. */
export function CardHomeContent() {
  return (
    <>
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
      />
      <div className={styles.walletBtnWrap}>
        <button type="button" className={styles.walletBtn}>
          <IconNfc1 className={styles.walletIcon} size={20} aria-hidden />
          <span className={styles.walletLabel}>Tap to pay</span>
        </button>
      </div>
    </>
  );
}
