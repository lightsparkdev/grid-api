'use client';

import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';
import { flowIconForLabel } from '@/data/flowIcons';
import { easeOutSnappy, motionTransition } from '@/lib/easing';
import styles from './SectionDivider.module.scss';

interface SectionDividerProps {
  label: string;
  /** When true, show the Explore flows icon for this action label. */
  showFlowIcon?: boolean;
  /** Optional control pinned to the right; the rule fills the space as it leaves. */
  action?: ReactNode;
}

const ACTION_TRANSITION = motionTransition(easeOutSnappy, 0.4);

/** Label + horizontal rule — matches Flow Builder funding-model divider pattern.
 *  An optional right-aligned action collapses/expands its width (snappy ease) so
 *  the rule grows/shrinks in tandem — no sequential "fade then grow". */
export function SectionDivider({ label, showFlowIcon = false, action }: SectionDividerProps) {
  const flow = showFlowIcon ? flowIconForLabel(label) : null;

  return (
    <div className={styles.divider}>
      <div className={styles.leading}>
        {flow ? (
          <span className={styles.icon} aria-hidden>
            <flow.Icon size={16} />
          </span>
        ) : null}
        <span className={styles.label}>{label}</span>
      </div>
      <div className={styles.line} />
      <AnimatePresence initial={false}>
        {action ? (
          <motion.div
            className={styles.action}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={ACTION_TRANSITION}
          >
            <div className={styles.actionInner}>{action}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
