'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { CardControls, WalletListItemData } from '@/apps/shared/card';
import { easeOutQuick, motionTransition } from '@/lib/easing';
import { CardHomeActions } from './CardHomeActions';
import { WalletListSection } from './WalletListSection';
import styles from './CardHomeContent.module.scss';

/** The home's blocks come in one after another: the actions, then Activity. */
const BLOCK_HIDDEN = { opacity: 0, y: 12, filter: 'blur(8px)' };
const BLOCK_VISIBLE = { opacity: 1, y: 0, filter: 'blur(0px)' };
const BLOCK_STAGGER_S = 0.08;
const blockIn = (i: number) => motionTransition(easeOutQuick, 0.45, { delay: 0.2 + i * BLOCK_STAGGER_S });

interface CardHomeContentProps {
  /** Purchases and card events, newest first; the empty state shows when there are none. */
  activity?: WalletListItemData[];
  card: CardControls;
  onTapToPay: () => void;
  onAddToWallet: () => void;
}

/** Below the card on the phone: the card's actions and its Activity. */
export function CardHomeContent({ activity, card, onTapToPay, onAddToWallet }: CardHomeContentProps) {
  const reduceMotion = useReducedMotion();
  const block = (i: number) =>
    reduceMotion
      ? {}
      : { initial: BLOCK_HIDDEN, animate: { ...BLOCK_VISIBLE, transition: blockIn(i) } };
  return (
    <>
      <motion.div {...block(0)} data-above-card="below">
        <CardHomeActions
          onTapToPay={onTapToPay}
          onAddToWallet={onAddToWallet}
          inWallet={card.inWallet}
          disabled={card.closed}
        />
      </motion.div>
      <motion.div {...block(1)} className={styles.activity}>
        <WalletListSection
          title="Activity"
          emptyTitle="Nothing here, yet"
          emptySub={
            <>
              Purchases and changes to your
              <br />
              card will show up here
            </>
          }
          items={activity}
          onItemClick={card.openTransaction}
          concentricBottom
          grow
        />
      </motion.div>
    </>
  );
}
