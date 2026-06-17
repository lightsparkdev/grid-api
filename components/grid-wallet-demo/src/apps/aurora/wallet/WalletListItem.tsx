'use client';

import type { ComponentType } from 'react';
import clsx from 'clsx';
import { Flag } from './Flag';
import styles from './WalletListItem.module.scss';

/** central-icons component shape (accepts `size`, spreads the rest onto the
 *  svg). `size` includes string to match CentralIconBaseProps exactly — a
 *  narrower number-only signature rejects the icon components' propTypes. */
type ListIcon = ComponentType<{ size?: number | string; className?: string }>;

/** Contact-style avatar for a person counterparty — first+last initial in the
 *  circular tile with the country flag badged in the corner. */
export interface WalletItemAvatar {
  initials: string;
  code: string;
}

export interface WalletListItemData {
  id: string;
  /** Glyph graphic (central-icons). */
  Icon?: ListIcon;
  /** Image graphic (e.g. a country flag) — wins over Icon when both are set. */
  image?: string;
  /** The image is a self-contained brand tile with its own corner radius (e.g. a
   *  crypto network logo) — skip the circular flag clip. */
  imageSquare?: boolean;
  /** Round the 56px tile (crypto payments — coin-style) instead of the square. */
  tileCircle?: boolean;
  /** Person counterparty — render the initials avatar (wins over icon/image). */
  avatar?: WalletItemAvatar;
  title: string;
  /** Merchant detail line, e.g. "Tap to Pay". */
  detail: string;
  /** Epoch ms — rendered as a live relative label ("Just now", "2m ago"…). */
  timestamp: number;
  /** Formatted amount, e.g. "$7.32". */
  amount: string;
}

export interface WalletListItemProps extends Omit<WalletListItemData, 'id' | 'timestamp'> {
  /** Pre-formatted relative time label, e.g. "Just now". */
  time: string;
}

/**
 * Figma 2143:41027 — one activity/transaction row: a 56px tertiary-fill graphic
 * (24px glyph), a title + two secondary lines, and a right-aligned amount.
 * Reusable across the wallet flows.
 */
export function WalletListItem({
  Icon,
  image,
  imageSquare,
  tileCircle,
  avatar,
  title,
  detail,
  time,
  amount,
}: WalletListItemProps) {
  return (
    <div className={styles.row}>
      <span
        className={clsx(styles.graphic, (tileCircle || avatar) && styles.graphicCircle)}
        aria-hidden
      >
        {avatar ? (
          <>
            <span className={styles.avatarInitials}>{avatar.initials}</span>
            <span className={styles.avatarFlag}>
              <Flag code={avatar.code} size={16} />
            </span>
          </>
        ) : image ? (
          <img
            className={clsx(styles.graphicImage, imageSquare && styles.graphicImageSquare)}
            src={image}
            alt=""
            draggable={false}
          />
        ) : (
          Icon && <Icon size={24} />
        )}
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
