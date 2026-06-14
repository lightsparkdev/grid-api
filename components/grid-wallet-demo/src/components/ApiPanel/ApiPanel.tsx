'use client';

import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import { IconCode } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCode';
import { PanelHeader } from '@/components/PanelHeader/PanelHeader';
import { easeOutSnappy, motionTransition } from '@/lib/easing';
import { ApiCallList } from './ApiCallList';
import { ApiPanelEmpty } from './ApiPanelEmpty';
import type { Entry } from './types';
import styles from './ApiPanel.module.scss';

interface ApiPanelProps {
  entries: Entry[];
}

// Graceful skeleton ⇄ live-calls swap — blur-fade so the first call doesn't pop.
const SWAP_IN = motionTransition(easeOutSnappy, 0.35);
const SWAP_OUT = motionTransition(easeOutSnappy, 0.2);
const SWAP_HIDDEN = { opacity: 0, filter: 'blur(8px)' };
const SWAP_REST = { opacity: 1, filter: 'blur(0px)' };

export function ApiPanel({ entries }: ApiPanelProps) {
  const isEmpty = entries.length === 0;

  return (
    <section className={styles.panel}>
      <PanelHeader
        className={styles.headerStacked}
        icon={<IconCode size={20} />}
        title="API calls"
      />
      <div className={clsx(styles.body, isEmpty && styles.bodyEmpty)}>
        <AnimatePresence mode="wait" initial={false}>
          {isEmpty ? (
            <motion.div
              key="empty"
              className={styles.swapLayer}
              animate={SWAP_REST}
              exit={{ ...SWAP_HIDDEN, transition: SWAP_OUT }}
              transition={SWAP_IN}
            >
              <ApiPanelEmpty />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              className={styles.swapLayer}
              initial={SWAP_HIDDEN}
              animate={SWAP_REST}
              transition={SWAP_IN}
            >
              <ApiCallList entries={entries} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
