'use client';

import clsx from 'clsx';
import { ACTIONS, type ActionId } from '@/data/actions';
import { FLOW_ICONS } from '@/data/flowIcons';
import { pressable } from '@/lib/sounds';
import styles from './FlowPicker.module.scss';

interface FlowPickerProps {
  /** The flow playing now: its tile stays lit while the others wait. */
  activeFlow: ActionId | null;
  onAction: (id: ActionId) => void;
}

/** Explore flows: two columns, read across, in the Figma's order. Every flow
 *  is always reachable; one that needs an installed agent installs it first. */
export function FlowPicker({ activeFlow, onAction }: FlowPickerProps) {
  const running = activeFlow !== null;
  return (
    <div className={styles.group}>
      {ACTIONS.map((action) => {
        const Icon = FLOW_ICONS[action.id];
        const enabled = !running;
        return (
          <button
            key={action.id}
            type="button"
            className={clsx(styles.option, enabled && styles.optionEnabled)}
            data-active={activeFlow === action.id || undefined}
            disabled={!enabled}
            title={action.desc}
            {...pressable({ onClick: () => enabled && onAction(action.id), disabled: !enabled })}
          >
            <span className={styles.optionIcon}>
              <Icon size={24} />
            </span>
            <span className={styles.optionLabel}>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
