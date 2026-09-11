'use client';

import type { CardControls, WalletListItemData } from '@/apps/shared/card';
import { CardHomeActions } from './CardHomeActions';
import { WalletListSection } from './WalletListSection';

interface CardHomeContentProps {
  /** Card transactions; the empty state shows when there are none. */
  transactions?: WalletListItemData[];
  card: CardControls;
  onTapToPay: () => void;
  onAddToWallet: () => void;
}

/** Below the card on the phone: the card's actions and the transactions list. */
export function CardHomeContent({ transactions, card, onTapToPay, onAddToWallet }: CardHomeContentProps) {
  return (
    <>
      <CardHomeActions
        onTapToPay={onTapToPay}
        onAddToWallet={onAddToWallet}
        inWallet={card.inWallet}
        disabled={card.closed}
      />
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
