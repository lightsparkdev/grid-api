import clsx from 'clsx';
import { BatteryIcon, SignalIcon, WifiIcon } from './StatusBarIcons';
import { StatusBarTime } from './StatusBarTime';
import styles from './PhoneStatusBar.module.scss';

interface PhoneStatusBarProps {
  tone?: 'default' | 'light';
}

/** iOS status bar — Figma phone-gga (2143:19945). */
export function PhoneStatusBar({ tone = 'default' }: PhoneStatusBarProps) {
  return (
    <div className={clsx(styles.statusBar, tone === 'light' && styles.statusBarLight)}>
      <div className={styles.timeSlot}>
        <StatusBarTime />
      </div>
      <div className={styles.levelsSlot}>
        <SignalIcon className={styles.signalIcon} />
        <WifiIcon className={styles.wifiIcon} />
        <BatteryIcon className={styles.batteryIcon} />
      </div>
    </div>
  );
}
