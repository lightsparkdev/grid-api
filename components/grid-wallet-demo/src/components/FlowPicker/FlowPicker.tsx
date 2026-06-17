'use client';

import clsx from 'clsx';
import { IconCheckmark2Small } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckmark2Small';
import { ACTIONS, type ActionId, type CompletedFlows, type WalletState } from '@/data/actions';
import { FLOW_ICONS, FLOW_ICON_COLORS } from '@/data/flowIcons';
import styles from './FlowPicker.module.scss';

interface FlowPickerProps {
  wallet: WalletState;
  completed: CompletedFlows;
  running: boolean;
  onAction: (id: ActionId) => void;
}

export function FlowPicker({ wallet, completed, running, onAction }: FlowPickerProps) {
  return (
    <div className={styles.group}>
      {ACTIONS.map((action) => {
        const Icon = FLOW_ICONS[action.id];
        const enabled = action.available(wallet) && !running;
        const done = action.done?.(completed) ?? false;

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
            <span className={styles.optionLabel}>{action.label}</span>
            {done && (
              <span className={styles.optionCheck} aria-hidden>
                <IconCheckmark2Small size={24} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
