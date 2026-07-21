'use client';

import clsx from 'clsx';
import {
  IconBookmark,
  IconCalendar2,
  IconLayoutAlignTop,
  IconBubbleWide,
  IconWallet2Bold,
  type MarketplaceIcon,
} from '../icons';
import styles from './MarketplaceTabBar.module.scss';

/** Decorative bottom tab bar (Figma 2610:11833) — five labeled tabs, Wallet
 *  active. Inactive icons are the skin's 1.5px-stroke set; the active wallet
 *  glyph bumps to the 2px-stroke variant per the design spec. */
const TABS: { Icon: MarketplaceIcon; label: string; active?: boolean }[] = [
  { Icon: IconBookmark, label: 'Today' },
  { Icon: IconCalendar2, label: 'Calendar' },
  { Icon: IconLayoutAlignTop, label: 'Listings' },
  { Icon: IconBubbleWide, label: 'Messages' },
  { Icon: IconWallet2Bold, label: 'Wallet', active: true },
];

export function MarketplaceTabBar() {
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
          <Icon size={28} />
          <span className={styles.label}>{label}</span>
        </button>
      ))}
    </nav>
  );
}
