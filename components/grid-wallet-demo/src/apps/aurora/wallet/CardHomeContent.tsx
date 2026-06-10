'use client';

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
          <img
            className={styles.walletIcon}
            src="/assets/icon-apple-wallet.png"
            alt=""
            aria-hidden
            draggable={false}
          />
          <span className={styles.walletLabel}>Add to Apple Wallet</span>
        </button>
      </div>
    </>
  );
}
