'use client';

import type { CardControls, WalletListItemData } from '@/apps/shared/card';
import { WalletListSection } from './WalletListSection';

interface CardHomeContentProps {
  /** Card transactions; the empty state shows when there are none. */
  transactions?: WalletListItemData[];
  card: CardControls;
}

/** Below the card on the phone: the transactions list. The cardholder doesn't
 *  act from here — flows run from the playground. */
export function CardHomeContent({ transactions, card }: CardHomeContentProps) {
  return (
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
  );
}
