'use client';

import clsx from 'clsx';
import { Flag } from '@/apps/shared/Flag';
import { useNow } from '@/hooks/useNow';
import { relativeTime } from '@/lib/relativeTime';
import type { WalletListItemData } from '@/apps/shared/wallet';
import { IconArrowInbox } from '../icons';
import styles from './SocialActivityList.module.scss';

/** Z activity list — flat rows directly on the page (X Money style). Renders the
 *  shared `homeActivity`; empty until the first Deposit/Send/Request lands. */
export function SocialActivityList({ items }: { items: WalletListItemData[] }) {
  const now = useNow();

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>No activity yet</p>
        <p className={styles.emptySub}>Your deposits, sends, and requests show up here.</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {items.map((item) => (
        <Row key={item.id} item={item} time={relativeTime(item.timestamp, now)} />
      ))}
    </div>
  );
}

function Row({ item, time }: { item: WalletListItemData; time: string }) {
  const positive = item.amount.includes('+');
  return (
    <div className={styles.row}>
      <span
        className={clsx(styles.graphic, (item.tileCircle || item.avatar) && styles.graphicCircle)}
        aria-hidden
      >
        {item.avatar ? (
          <>
            <span className={styles.avatarInitials}>{item.avatar.initials}</span>
            <span className={styles.avatarFlag}>
              <Flag code={item.avatar.code} size={16} />
            </span>
          </>
        ) : item.image ? (
          <img
            className={clsx(styles.graphicImage, item.imageSquare && styles.graphicImageSquare)}
            src={item.image}
            alt=""
            draggable={false}
          />
        ) : (
          <IconArrowInbox size={22} />
        )}
      </span>
      <div className={styles.labels}>
        <p className={styles.title}>{item.title}</p>
        <p className={styles.sub}>
          {item.detail} &middot; {time}
        </p>
      </div>
      <p className={clsx(styles.amount, positive && styles.amountPositive)}>{item.amount}</p>
    </div>
  );
}
