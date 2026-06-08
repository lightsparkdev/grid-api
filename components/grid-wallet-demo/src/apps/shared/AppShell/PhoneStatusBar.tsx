'use client';

import { forwardRef } from 'react';
import clsx from 'clsx';
import { BatteryIcon, SignalIcon, WifiIcon } from './StatusBarIcons';
import { StatusBarTime } from './StatusBarTime';
import type { StatusBarTone } from './useAdaptiveStatusBarTone';
import styles from './PhoneStatusBar.module.scss';

interface PhoneStatusBarProps {
  tone?: StatusBarTone;
}

/** iOS status bar — Figma phone-gga (2143:19945). */
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
        <SignalIcon className={styles.signalIcon} />
        <WifiIcon className={styles.wifiIcon} />
        <BatteryIcon className={styles.batteryIcon} />
      </div>
    </header>
  );
});
