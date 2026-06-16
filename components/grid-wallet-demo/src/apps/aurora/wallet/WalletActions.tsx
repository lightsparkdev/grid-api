'use client';

import { ContentAreaButton } from '@/apps/shared/ContentAreaButton';
import { SfSymbol } from '@/apps/shared/icons';
import type { SkinHomeAction } from '@/apps/skinned/types';
import styles from './WalletActions.module.scss';

interface WalletActionsProps {
  onAdd?: () => void;
  onWithdraw?: () => void;
  onSend?: () => void;
  /** Skin override — ordered buttons mapped onto the add/withdraw/send handlers.
   *  Omit → Aurora's default Add / Withdraw / Send row. */
  actions?: SkinHomeAction[];
}

/** Figma 90:13450 — Add / Withdraw / transfer content-area buttons. */
export function WalletActions({ onAdd, onWithdraw, onSend, actions }: WalletActionsProps) {
  if (actions && actions.length > 0) {
    const handlerFor = (id: SkinHomeAction['id']) =>
      id === 'add' ? onAdd : id === 'withdraw' ? onWithdraw : onSend;
    return (
      <div className={styles.row}>
        {actions.map(({ id, label, Icon, ariaLabel }) => (
          <ContentAreaButton
            key={id}
            className={styles.button}
            type="button"
            variant="bordered"
            aria-label={ariaLabel ?? label}
            icon={<Icon size={24} />}
            onClick={handlerFor(id)}
          >
            {label}
          </ContentAreaButton>
        ))}
      </div>
    );
  }

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
