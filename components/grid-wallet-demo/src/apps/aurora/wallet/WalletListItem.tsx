'use client';

import type { ComponentType } from 'react';
import styles from './WalletListItem.module.scss';

/** central-icons component shape (accepts `size`, spreads the rest onto the svg). */
type ListIcon = ComponentType<{ size?: number; className?: string }>;

export interface WalletListItemData {
  id: string;
  Icon: ListIcon;
  title: string;
  /** Merchant detail line, e.g. "Tap to Pay". */
  detail: string;
  /** Relative time, e.g. "Just now". */
  time: string;
  /** Formatted amount, e.g. "$7.32". */
  amount: string;
}

export type WalletListItemProps = Omit<WalletListItemData, 'id'>;

/**
 * Figma 2143:41027 — one activity/transaction row: a 56px tertiary-fill graphic
 * (24px glyph), a title + two secondary lines, and a right-aligned amount.
 * Reusable across the wallet flows.
 */
export function WalletListItem({ Icon, title, detail, time, amount }: WalletListItemProps) {
  return (
    <div className={styles.row}>
      <span className={styles.graphic} aria-hidden>
        <Icon size={24} />
      </span>
      <div className={styles.content}>
        <div className={styles.container}>
          <div className={styles.labels}>
            <p className={styles.title}>{title}</p>
            <p className={styles.sub}>{detail}</p>
            <p className={styles.sub}>{time}</p>
          </div>
          <p className={styles.amount}>{amount}</p>
        </div>
      </div>
    </div>
  );
}
