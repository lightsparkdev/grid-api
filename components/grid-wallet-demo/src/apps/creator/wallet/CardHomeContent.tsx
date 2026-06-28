'use client';

import { motion } from 'motion/react';
import { IconNfc1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconNfc1';
import { ContentAreaButton } from '@/apps/shared/ContentAreaButton';
import { useStaggerReveal } from '@/apps/shared/useStaggerReveal';
import type { WalletListItemData } from './WalletListItem';
import { WalletListSection } from './WalletListSection';
import styles from './CardHomeContent.module.scss';

interface CardHomeContentProps {
  /** Card-home transactions; the empty state shows when there are none. */
  transactions?: WalletListItemData[];
  /** Start the tap-to-pay flow. */
  onTapToPay?: () => void;
}

/** Figma 2143:40926 — card-view body: Tap to pay + Transactions list. The card rides
 *  up with the sheet; the CTA and list stagger in a beat behind it. */
export function CardHomeContent({ transactions, onTapToPay }: CardHomeContentProps) {
  // Start AFTER the sheet/card finish sliding up (~0.5s) so the CTA -> list cascade
  // reads as a distinct stagger instead of being masked by the slide.
  const reveal = useStaggerReveal({ baseDelay: 0.5, stagger: 0.1 });
  return (
    <>
      <motion.div {...reveal(0)} className={styles.walletBtnWrap}>
        <ContentAreaButton
          type="button"
          variant="secondary"
          className={styles.tapBtn}
          icon={<IconNfc1 className={styles.walletIcon} size={20} aria-hidden />}
          onClick={onTapToPay}
        >
          Tap to pay
        </ContentAreaButton>
      </motion.div>
      {/* Transactions label — the Glitch home tab-header look, one static tab. */}
      <motion.div {...reveal(1)} className={styles.tabHeader}>
        <span className={styles.tab}>Transactions</span>
      </motion.div>
      <motion.div {...reveal(2)} className={styles.listReveal}>
        <WalletListSection
          title="Transactions"
          hideTitle
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
      </motion.div>
    </>
  );
}
