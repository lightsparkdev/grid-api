'use client';

import clsx from 'clsx';
import { ACTIONS, type ActionId } from '@/data/actions';
import { FLOW_ICONS, FLOW_ICON_COLORS } from '@/data/flowIcons';
import { pressable } from '@/lib/sounds';
import styles from './FlowPicker.module.scss';

interface FlowPickerProps {
  /** The flow in the composer or playing: its tile stays lit. */
  activeFlow: ActionId | null;
  onAction: (id: ActionId) => void;
}

/** Explore flows: two columns, read across. A tile puts its flow's line in the
 *  composer; picking another mid-flow starts over there, as in the other
 *  playgrounds. One that needs an installed agent installs it first. */
export function FlowPicker({ activeFlow, onAction }: FlowPickerProps) {
  return (
    <div className={styles.group} data-active-flow={activeFlow ?? undefined}>
      {ACTIONS.map((action) => {
        const Icon = FLOW_ICONS[action.id];
        return (
          <button
            key={action.id}
            type="button"
            className={clsx(styles.option, styles.optionEnabled)}
            title={action.desc}
            {...pressable({ onClick: () => onAction(action.id) })}
          >
            <span className={styles.optionIcon} style={{ color: FLOW_ICON_COLORS[action.id] }}>
              <Icon size={24} />
            </span>
            <span className={styles.optionLabel}>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
