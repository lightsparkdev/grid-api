'use client';

import clsx from 'clsx';
import {
  IconHomeRoundDoor,
  IconBanknote1,
  IconWallet1,
  IconEmail2,
  IconBarsThree,
  type OndemandIcon,
} from '../icons';
import styles from './OndemandTabBar.module.scss';

/** Decorative bottom tab bar (Figma 2636:17926) — five labeled tabs, Wallet
 *  active. 24px sharp glyphs (radius-0, stroke-2) + 11px labels. */
const TABS: { Icon: OndemandIcon; label: string; active?: boolean }[] = [
  { Icon: IconHomeRoundDoor, label: 'Home' },
  { Icon: IconBanknote1, label: 'Earnings' },
  { Icon: IconWallet1, label: 'Wallet', active: true },
  { Icon: IconEmail2, label: 'Inbox' },
  { Icon: IconBarsThree, label: 'Menu' },
];

export function OndemandTabBar() {
  return (
    <nav className={styles.bar} aria-label="Navigation">
      {TABS.map(({ Icon, label, active }) => (
        <button
          key={label}
          type="button"
          className={clsx(styles.item, active && styles.itemActive)}
          aria-label={label}
          aria-current={active ? 'page' : undefined}
        >
          <Icon size={24} />
          <span className={styles.label}>{label}</span>
        </button>
      ))}
    </nav>
  );
}
