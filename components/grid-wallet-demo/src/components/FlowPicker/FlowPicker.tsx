'use client';

import clsx from 'clsx';
import { IconArrowBoxRight } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowBoxRight';
import { IconPlusMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPlusMedium';
import { IconPaperPlaneTopRight } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPaperPlaneTopRight';
import { IconBank } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconBank';
import { IconCreditCardAdd } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCreditCardAdd';
import { IconNfc1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconNfc1';
import { IconCheckmark2Small } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckmark2Small';
import { ACTIONS, type ActionId, type WalletState } from '@/data/actions';
import styles from './FlowPicker.module.scss';

type IconCmp = typeof IconArrowBoxRight;

const FLOW_ICONS: Record<ActionId, IconCmp> = {
  create: IconArrowBoxRight,
  add: IconPlusMedium,
  send: IconPaperPlaneTopRight,
  withdraw: IconBank,
  card: IconCreditCardAdd,
  tap: IconNfc1,
};

/** Per-flow stroke colors from Figma node 2109:13080 (Origin tokens where exact). */
const FLOW_ICON_COLORS: Record<ActionId, string> = {
  create: 'var(--icon-success)', // #11A967
  add: '#11A98B',
  send: 'var(--color-sky-500)', // #00B3E0
  withdraw: '#009DE0',
  card: 'var(--color-blue-500)', // #0091FF
  tap: 'var(--icon-info)', // #0072DB
};

interface FlowPickerProps {
  wallet: WalletState;
  running: boolean;
  onAction: (id: ActionId) => void;
}

export function FlowPicker({ wallet, running, onAction }: FlowPickerProps) {
  return (
    <div className={styles.group}>
      {ACTIONS.map((action) => {
        const Icon = FLOW_ICONS[action.id];
        const enabled = action.available(wallet) && !running;
        const done = action.done?.(wallet) ?? false;

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
