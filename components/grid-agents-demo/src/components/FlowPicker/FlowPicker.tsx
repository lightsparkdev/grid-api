'use client';

import clsx from 'clsx';
import { ACTIONS, type ActionId } from '@/data/actions';
import { FLOW_ICONS, FLOW_ICON_COLORS } from '@/data/flowIcons';
import { pressable } from '@/lib/sounds';
import styles from './FlowPicker.module.scss';

interface FlowPickerProps {
  /** This section's flows, in grid order. */
  flows: ActionId[];
  /** Two columns read across (the default), or one: a list. */
  columns?: 1 | 2;
  /** The flow playing, marked (unstyled) on its section for the flow sweep. */
  activeFlow: ActionId | null;
  onAction: (id: ActionId) => void;
}

/** A section of flows: two columns, read across. A tile sends its flow's line;
 *  picking another mid-flow starts over there, as in the other playgrounds.
 *  One that needs an installed agent installs it first. */
export function FlowPicker({ flows, columns = 2, activeFlow, onAction }: FlowPickerProps) {
  const actions = flows.map((id) => ACTIONS.find((a) => a.id === id)!);
  const playing = activeFlow && flows.includes(activeFlow) ? activeFlow : undefined;
  return (
    <div className={styles.group} data-columns={columns} data-active-flow={playing}>
      {actions.map((action) => {
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
