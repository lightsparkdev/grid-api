'use client';

import { ContentAreaButton } from '@/apps/shared/ContentAreaButton';
import { SfSymbol } from '@/apps/shared/icons';
import styles from './CardHomeActions.module.scss';

interface CardHomeActionsProps {
  onTapToPay: () => void;
  onAddToWallet: () => void;
  /** The card is on this iPhone already; the button still answers (a sheet says so). */
  inWallet: boolean;
  disabled?: boolean;
}

/** Under the card: what the cardholder does with it. The same two flows the
 *  playground's tiles run (Figma 90:13450's row, with the card's actions). */
export function CardHomeActions({ onTapToPay, onAddToWallet, inWallet, disabled }: CardHomeActionsProps) {
  return (
    <div className={styles.row}>
      <ContentAreaButton
        className={styles.button}
        type="button"
        variant="bordered"
        icon={<SfSymbol name="wave.3.right" size={20} />}
        onClick={onTapToPay}
        disabled={disabled}
      >
        Tap to Pay
      </ContentAreaButton>
      <ContentAreaButton
        className={styles.button}
        type="button"
        variant="bordered"
        icon={<SfSymbol name="wallet.pass.fill" size={20} />}
        onClick={onAddToWallet}
        disabled={disabled}
      >
        {inWallet ? 'In Wallet' : 'Add to Wallet'}
      </ContentAreaButton>
    </div>
  );
}
