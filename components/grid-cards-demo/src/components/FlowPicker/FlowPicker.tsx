'use client';

import clsx from 'clsx';
import { ACTIONS, type ActionId, type WalletState } from '@/data/actions';
import { FLOW_ICONS } from '@/data/flowIcons';
import styles from './FlowPicker.module.scss';

// 2-col grid (matches the auth picker): four card-flow pairs. There's no Sign
// in tile — every flow auto-runs sign-in, and the divider's Reset re-arms it.
const GRID_ORDER: ActionId[] = [
  'card',
  'reveal',
  'wallet',
  'tap',
  'freeze',
  'limits',
  'refund',
  'close',
];
const GRID_LABELS: Partial<Record<ActionId, string>> = {
  card: 'Issue card',
  reveal: 'Reveal',
  wallet: 'Add to wallet',
  tap: 'Spend',
  freeze: 'Freeze',
  limits: 'Limits',
  refund: 'Refund',
  close: 'Close',
};

interface FlowPickerProps {
  wallet: WalletState;
  running: boolean;
  onAction: (id: ActionId) => void;
}

export function FlowPicker({ wallet, running, onAction }: FlowPickerProps) {
  const actions = GRID_ORDER.map((id) => ACTIONS.find((a) => a.id === id)!);
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
            <span className={styles.optionIcon}>
              <Icon size={24} />
            </span>
            <span className={styles.optionLabel}>{GRID_LABELS[action.id]}</span>
          </button>
        );
      })}
    </div>
  );
}
