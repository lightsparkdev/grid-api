'use client';

import clsx from 'clsx';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import { useLayoutEffect, useRef, useState } from 'react';
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
const TILE_STEP_S = 0.035;

/** Switching accounts, each slot keeps its place: the old tile blurs out as the new one rises in, in its turn
 *  (`custom`: its place among every tile in the panel). A flow both accounts share in the same slot stays put. */
const TILE_SWAP: Variants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(6px)' },
  rest: (i: number) => ({ opacity: 1, y: 0, filter: 'blur(0px)', transition: motionTransition(easeOutSnappy, 0.42, { delay: i * TILE_STEP_S }) }),
  out: { opacity: 0, filter: 'blur(6px)', transition: motionTransition(easeOutSnappy, 0.14) },
};

/** The card follows its rows: growing or shrinking when the other account has more or fewer. */
const CARD_RESIZE = motionTransition(easeOutSnappy, 0.48);

/** A section of flows: two columns, read across. A tile sends its flow's line;
 *  picking another mid-flow starts over there, as in the other playgrounds.
 *  One that needs an installed agent installs it first. */
export function FlowPicker({ flows, columns = 2, activeFlow, onAction, firstTile = 0 }: FlowPickerProps) {
  const actions = flows.map((id) => ACTIONS.find((a) => a.id === id)!);
  const playing = activeFlow && flows.includes(activeFlow) ? activeFlow : undefined;
  const grid = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();
  useLayoutEffect(() => {
    const el = grid.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setHeight(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const lastRow = Math.floor((actions.length - 1) / columns);
  return (
    <motion.div className={styles.group} data-active-flow={playing} initial={false} animate={{ height: height ?? 'auto' }} transition={CARD_RESIZE}>
      <div ref={grid} className={styles.grid} data-columns={columns}>
        <AnimatePresence initial={false}>
          {actions.map((action, k) => {
            const Icon = FLOW_ICONS[action.id];
            return (
              <motion.div
                key={k}
                className={styles.slot}
                data-right={columns === 2 && k % 2 === 0 ? '' : undefined}
                data-bottom={Math.floor(k / columns) < lastRow ? '' : undefined}
                variants={TILE_SWAP}
                initial="hidden"
                animate="rest"
                exit="out"
                custom={firstTile + k}
              >
                <AnimatePresence initial={false}>
                  <motion.button
                    key={action.id}
                    type="button"
                    className={clsx(styles.option, styles.optionEnabled)}
                    title={action.desc}
                    variants={TILE_SWAP}
                    initial="hidden"
                    animate="rest"
                    exit="out"
                    custom={firstTile + k}
                    {...pressable({ onClick: () => onAction(action.id) })}
                  >
                    <span className={styles.optionIcon} style={{ color: FLOW_ICON_COLORS[action.id] }}>
                      <Icon size={24} />
                    </span>
                    <span className={styles.optionLabel}>{action.label}</span>
                  </motion.button>
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
