'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { popularFlows } from '@/data/popular-flows';
import { IconChevronDownSmall } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronDownSmall';
import styles from './PopularFlows.module.scss';
import clsx from 'clsx';

interface PopularFlowsProps {
  onSelect: (sendCode: string, receiveCode: string) => void;
}

export function PopularFlows({ onSelect }: PopularFlowsProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.divider}
        onClick={() => setExpanded(!expanded)}
        type="button"
      >
        <span className={styles.line} />
        <span className={styles.content}>
          <span className={styles.text}>Or explore popular flows</span>
          <span className={clsx(styles.chevron, expanded && styles.chevronUp)}>
            <IconChevronDownSmall size={20} />
          </span>
        </span>
        <span className={styles.line} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className={styles.list}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
            {popularFlows.map((flow, i) => (
              <motion.button
                key={flow.label}
                className={styles.flowItem}
                onClick={() => onSelect(flow.sendCode, flow.receiveCode)}
                type="button"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06, duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {flow.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
