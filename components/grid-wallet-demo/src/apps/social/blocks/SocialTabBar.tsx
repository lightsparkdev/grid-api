'use client';

import clsx from 'clsx';
import type { SkinTabBarConfig } from '../types';
import styles from './SocialTabBar.module.scss';

/** Decorative bottom tab bar (X style) — five evenly spaced, icon-only items.
 *  Only `active` is highlighted; the rest are presentational for v1 (no routing). */
export function SocialTabBar({ items }: SkinTabBarConfig) {
  return (
    <nav className={styles.bar} aria-label="Navigation">
      {items.map((item) => {
        const Icon = item.active && item.activeIcon ? item.activeIcon : item.Icon;
        return (
          <button
            key={item.label}
            type="button"
            className={clsx(styles.item, item.active && styles.itemActive)}
            aria-label={item.label}
            aria-current={item.active ? 'page' : undefined}
          >
            <Icon size={26} />
          </button>
        );
      })}
    </nav>
  );
}
