'use client';

import { flowIconForLabel } from '@/data/flowIcons';
import styles from './SectionDivider.module.scss';

interface SectionDividerProps {
  label: string;
  /** When true, show the Explore flows icon for this action label. */
  showFlowIcon?: boolean;
}

/** Label + horizontal rule — matches Flow Builder funding-model divider pattern. */
export function SectionDivider({ label, showFlowIcon = false }: SectionDividerProps) {
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
    </div>
  );
}
