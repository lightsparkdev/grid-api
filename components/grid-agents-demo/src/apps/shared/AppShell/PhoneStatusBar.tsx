'use client';

import { forwardRef } from 'react';
import clsx from 'clsx';
import { StatusBarTime } from './StatusBarTime';
import type { StatusBarTone, StatusBarTones } from './useAdaptiveStatusBarTone';
import styles from './PhoneStatusBar.module.scss';

interface PhoneStatusBarProps {
  /** One tone for the whole bar, or one for each side (the time, and the levels), each read from what's behind it. */
  tone?: StatusBarTone | StatusBarTones;
}

/** Cellular bar heights, shortest first. */
const BARS = [6.333, 8.67, 11, 13.667];

/** iOS 27 status bar: the time and the signal levels. */
export const PhoneStatusBar = forwardRef<HTMLElement, PhoneStatusBarProps>(function PhoneStatusBar(
  { tone = 'default' },
  ref,
) {
  const sides = typeof tone === 'string' ? { time: tone, levels: tone } : tone;
  return (
    <header ref={ref} className={styles.statusBar} data-status-bar aria-hidden>
      <div className={clsx(styles.timeSlot, sides.time === 'light' && styles.light)}>
        <StatusBarTime />
      </div>
      <div className={clsx(styles.levelsSlot, sides.levels === 'light' && styles.light)}>
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
