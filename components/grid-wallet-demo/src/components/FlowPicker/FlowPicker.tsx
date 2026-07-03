'use client';

import clsx from 'clsx';
import { IconArrowRotateCounterClockwise } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowRotateCounterClockwise';
import { ACTIONS, type ActionId, type WalletState } from '@/data/actions';
import { FLOW_ICONS, FLOW_ICON_COLORS } from '@/data/flowIcons';
import styles from './FlowPicker.module.scss';

// 2-col grid (matches the auth picker): three flow pairs, then Reset alone in
// the last row's left cell — like Passkey in the auth grid. (Reset doubles as
// "sign in again", so there's no Sign in tile.)
const GRID_ORDER: ActionId[] = ['add', 'withdraw', 'send', 'receive', 'card', 'tap'];
const GRID_LABELS: Partial<Record<ActionId, string>> = {
  add: 'Deposit',
  withdraw: 'Withdraw',
  send: 'Send',
  receive: 'Receive',
  card: 'Issue card',
  tap: 'Tap to pay',
};

interface FlowPickerProps {
  wallet: WalletState;
  running: boolean;
  onAction: (id: ActionId) => void;
  /** Wipes the demo session — enabled once a wallet exists. */
  onReset: () => void;
}

export function FlowPicker({ wallet, running, onAction, onReset }: FlowPickerProps) {
  const actions = GRID_ORDER.map((id) => ACTIONS.find((a) => a.id === id)!);
  const resetEnabled = wallet.created && !running;
  return (
    <div className={styles.group}>
      {actions.map((action) => {
        const Icon = FLOW_ICONS[action.id];
        const enabled = action.available(wallet) && !running;

        return (
          <button
            key={action.id}
            type="button"
            className={clsx(styles.option, enabled && styles.optionEnabled)}
            onClick={() => enabled && onAction(action.id)}
            disabled={!enabled}
          >
            <span className={styles.optionIcon} style={{ color: FLOW_ICON_COLORS[action.id] }}>
              <Icon size={24} />
            </span>
            <span className={styles.optionLabel}>{GRID_LABELS[action.id]}</span>
          </button>
        );
      })}
      <button
        type="button"
        className={clsx(styles.option, resetEnabled && styles.optionEnabled)}
        onClick={() => resetEnabled && onReset()}
        disabled={!resetEnabled}
      >
        <span className={styles.optionIcon} style={{ color: '#8E8E93' }}>
          <IconArrowRotateCounterClockwise size={24} />
        </span>
        <span className={styles.optionLabel}>Reset</span>
      </button>
    </div>
  );
}
