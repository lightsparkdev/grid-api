'use client';

import { forwardRef } from 'react';
import clsx from 'clsx';
import { StatusBarTime } from './StatusBarTime';
import type { StatusBarTone } from './useAdaptiveStatusBarTone';
import styles from './PhoneStatusBar.module.scss';

interface PhoneStatusBarProps {
  tone?: StatusBarTone;
}

/** Cellular bar heights, shortest first (Figma 265:13016:2705). */
const BARS = [6.333, 8.67, 11, 13.667];

/** iOS 27 status bar (Figma website-q4-2026 265:53338, Status Bar - iPhone 18 Pro). */
export const PhoneStatusBar = forwardRef<HTMLElement, PhoneStatusBarProps>(function PhoneStatusBar(
  { tone = 'default' },
  ref,
) {
  return (
    <header
      ref={ref}
      className={clsx(styles.statusBar, tone === 'light' && styles.statusBarLight)}
      data-status-bar
      aria-hidden
    >
      <div className={styles.timeSlot}>
        <StatusBarTime />
      </div>
      <div className={styles.levelsSlot}>
        <span className={styles.cellular}>
          {BARS.map((h) => (
            <span key={h} className={styles.bar} style={{ height: h }} />
          ))}
        </span>
        <span className={styles.wifi} />
        <span className={styles.battery} />
      </div>
    </header>
  );
});
