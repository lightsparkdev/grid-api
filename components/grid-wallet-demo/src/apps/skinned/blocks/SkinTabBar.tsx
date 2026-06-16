'use client';

import clsx from 'clsx';
import type { SkinTabBarConfig, SkinTabBarItem } from '../types';
import styles from './SkinTabBar.module.scss';

/** Decorative bottom tab bar for a skin's home (Figma 2375:10216). Items split
 *  around the center FAB. Only the `active` item is highlighted — the rest are
 *  presentational for v1 (no routing). */
export function SkinTabBar({ items, fab }: SkinTabBarConfig) {
  const mid = Math.ceil(items.length / 2);
  const left = fab ? items.slice(0, mid) : items;
  const right = fab ? items.slice(mid) : [];

  const renderItem = (item: SkinTabBarItem) => (
    <button
      key={item.label}
      type="button"
      className={clsx(styles.item, item.active && styles.itemActive)}
      aria-label={item.label}
      aria-current={item.active ? 'page' : undefined}
    >
      <item.Icon size={24} />
      <span className={styles.label}>{item.label}</span>
    </button>
  );

  return (
    <nav className={styles.bar} aria-label="Navigation">
      <div className={styles.group}>{left.map(renderItem)}</div>
      {fab ? (
        <button type="button" className={styles.fab} aria-label={fab.ariaLabel}>
          <fab.Icon size={28} />
        </button>
      ) : null}
      {fab ? <div className={styles.group}>{right.map(renderItem)}</div> : null}
    </nav>
  );
}
