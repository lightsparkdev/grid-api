'use client';

import { IconGrowth, IconHeart } from '../icons';
import { formatUsdCents } from '@/apps/shared/wallet-flows';
import styles from './WiggleInsightCards.module.scss';

interface WiggleInsightCardsProps {
  /** Today's accrual (cents) for the live Yield caption ("+$X today"). */
  earningsTodayCents: number;
  /** Yield rate shown on the card. */
  apyPercent: number;
}

/** Wiggle home metrics (Figma 2375:10216): Yield (live "+$X today") + Followers,
 *  each an icon-circle + big value over a caption, in their own squircle card. */
export function WiggleInsightCards({ earningsTodayCents, apyPercent }: WiggleInsightCardsProps) {
  const earned = formatUsdCents(earningsTodayCents);
  return (
    <div className={styles.cards}>
      <div className={styles.card}>
        <span className={styles.iconCircle} style={{ background: '#00c16e' }}>
          <IconGrowth size={20} />
        </span>
        <div className={styles.metric}>
          <span className={styles.value}>{apyPercent}%</span>
          <span className={styles.unit}>APY</span>
        </div>
        <p className={styles.caption}>
          <span className={styles.captionAmount}>+{earned}</span>{' '}
          <span className={styles.captionMuted}>today</span>
        </p>
      </div>

      <div className={styles.card}>
        <span className={styles.iconCircle} style={{ background: '#ff5fa2' }}>
          <IconHeart size={20} />
        </span>
        <div className={styles.metric}>
          <span className={styles.value}>1345</span>
        </div>
        <p className={styles.caption}>
          <span className={styles.captionAmount}>+56</span> followers from last stream
        </p>
      </div>
    </div>
  );
}
