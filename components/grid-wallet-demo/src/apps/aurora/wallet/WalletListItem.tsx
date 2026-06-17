'use client';

import clsx from 'clsx';
import { Flag } from '@/apps/shared/Flag';
import type { WalletListItemData, WalletItemAvatar } from '@/apps/shared/wallet';
import styles from './WalletListItem.module.scss';

// The row data shape is the shared brain's contract — re-export it so this skin's
// sibling faces still import it from here; only the rendering below is per-skin.
export type { WalletListItemData, WalletItemAvatar };

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
