'use client';

import { ContentAreaButton } from '@/apps/shared/ContentAreaButton';
import { SfSymbol } from '@/apps/shared/icons';
import styles from './WalletActions.module.scss';

interface WalletActionsProps {
  onAdd?: () => void;
  onWithdraw?: () => void;
  onSend?: () => void;
}

/** Figma 90:13450 — Add / Withdraw / transfer content-area buttons. */
export function WalletActions({ onAdd, onWithdraw, onSend }: WalletActionsProps) {
  return (
    <div className={styles.row}>
      <ContentAreaButton className={styles.button} type="button" variant="bordered" onClick={onAdd}>
        Add
      </ContentAreaButton>
      <ContentAreaButton className={styles.button} type="button" variant="bordered" onClick={onWithdraw}>
        Withdraw
      </ContentAreaButton>
      <ContentAreaButton
        className={styles.button}
        type="button"
        variant="bordered"
        aria-label="Send or receive"
        icon={<SfSymbol name="arrow.up.arrow.down" size={24} />}
        onClick={onSend}
      />
    </div>
  );
}
