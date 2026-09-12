'use client';

import clsx from 'clsx';
import { TextMorph } from 'torph/react';
import { ACTIONS, type ActionId, type WalletState } from '@/data/actions';
import { FLOW_ICONS, UNLOCK_ICON } from '@/data/flowIcons';
import { cubicBezierCss, easeOutSwift } from '@/lib/easing';
import styles from './FlowPicker.module.scss';

/** Lock ⇄ Unlock: the shared letters glide, the rest morph. */
const LABEL_MORPH_MS = 280;

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
  freeze: 'Lock',
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
        // Lock toggles: a locked card's tile offers the way back, with the open lock.
        const unlocking = action.id === 'freeze' && wallet.frozen;
        const Icon = unlocking ? UNLOCK_ICON : FLOW_ICONS[action.id];
        const enabled = action.available(wallet) && !running;
        const label = unlocking ? 'Unlock' : GRID_LABELS[action.id];

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
            <TextMorph
              as="span"
              className={styles.optionLabel}
              duration={LABEL_MORPH_MS}
              ease={cubicBezierCss(easeOutSwift)}
            >
              {label}
            </TextMorph>
          </button>
        );
      })}
    </div>
  );
}
