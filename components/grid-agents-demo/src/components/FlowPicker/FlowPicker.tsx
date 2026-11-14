'use client';

import clsx from 'clsx';
import { motion, type Variants } from 'motion/react';
import { ACTIONS, type ActionId } from '@/data/actions';
import { FLOW_ICONS, FLOW_ICON_COLORS } from '@/data/flowIcons';
import { easeOutSnappy, motionTransition } from '@/lib/easing';
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
  /** Where this section's first tile falls among every tile in the panel, for its turn arriving. */
  firstTile?: number;
}

/** How far apart the tiles of a new set land, one after another down the whole panel. */
export const TILE_STEP_S = 0.035;

/** A tile arriving with a new set (switching accounts): the API panel's rise, its blur clearing as it lands, in its
 *  turn (`custom`: its place among every tile in the panel). Only plays under a parent that animates the `hidden` →
 *  `rest` labels; otherwise the tiles just sit. */
const TILE_RISE: Variants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(6px)' },
  rest: (i: number) => ({ opacity: 1, y: 0, filter: 'blur(0px)', transition: motionTransition(easeOutSnappy, 0.42, { delay: i * TILE_STEP_S }) }),
};

/** A section of flows: two columns, read across. A tile sends its flow's line;
 *  picking another mid-flow starts over there, as in the other playgrounds.
 *  One that needs an installed agent installs it first. */
export function FlowPicker({ flows, columns = 2, activeFlow, onAction, firstTile = 0 }: FlowPickerProps) {
  const actions = flows.map((id) => ACTIONS.find((a) => a.id === id)!);
  const playing = activeFlow && flows.includes(activeFlow) ? activeFlow : undefined;
  return (
    <div className={styles.group} data-columns={columns} data-active-flow={playing}>
      {actions.map((action, k) => {
        const Icon = FLOW_ICONS[action.id];
        return (
          <motion.button
            key={action.id}
            type="button"
            className={clsx(styles.option, styles.optionEnabled)}
            title={action.desc}
            variants={TILE_RISE}
            custom={firstTile + k}
            {...pressable({ onClick: () => onAction(action.id) })}
          >
            <span className={styles.optionIcon} style={{ color: FLOW_ICON_COLORS[action.id] }}>
              <Icon size={24} />
            </span>
            <span className={styles.optionLabel}>{action.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
