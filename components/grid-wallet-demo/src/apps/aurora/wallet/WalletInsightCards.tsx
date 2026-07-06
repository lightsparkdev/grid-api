'use client';

import type { ReactNode } from 'react';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import styles from './WalletInsightCards.module.scss';

const WEEKLY_BAR_COUNT = 14;

const DEFAULT_WEEKLY_BARS = Array.from({ length: WEEKLY_BAR_COUNT }, () => 0);

function fmtUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function fmtPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function normalizeBars(values: number[]): number[] {
  const bars = values.slice(0, WEEKLY_BAR_COUNT);
  while (bars.length < WEEKLY_BAR_COUNT) {
    bars.push(0);
  }
  return bars;
}

function MetricLine({ positive, children }: { positive?: boolean; children: ReactNode }) {
  return (
    <p className={styles.metric}>
      <span
        className={positive ? `${styles.metricLine} ${styles.metricPositive}` : styles.metricLine}
      >
        {children}
      </span>
    </p>
  );
}

export interface WalletInsightCardsProps {
  /** Bar fill ratios 0–1, one per recent card charge (defaults to all empty). */
  weeklyBars?: number[];
  /** Total card spend for the window, USD cents. */
  weeklySpentCents?: number;
  /** Yield earned today, USD cents (balance × APY ÷ 365). */
  earningsTodayCents?: number;
  /** A month of accrued yield (daily compounding) — the headline figure. */
  earningsMonthCents?: number;
  /** APY shown on the earnings card, percent (e.g. 5 → "5.00% APY"). */
  apyPercent?: number;
}

/** Figma 90:13639 — Weekly activity (card spend) + Earnings (yield on balance). */
export function WalletInsightCards({
  weeklyBars = DEFAULT_WEEKLY_BARS,
  weeklySpentCents = 0,
  earningsTodayCents = 0,
  earningsMonthCents = 0,
  apyPercent = 0,
}: WalletInsightCardsProps) {
  const bars = normalizeBars(weeklyBars);
  const weeklyClip = useSquircleClip<HTMLButtonElement>();
  const earningsClip = useSquircleClip<HTMLButtonElement>();

  return (
    <div className={styles.row}>
      <button
        type="button"
        ref={weeklyClip.ref}
        style={weeklyClip.style}
        className={styles.cardWeekly}
        aria-label="Weekly activity"
      >
        <p className={styles.cardTitle}>Weekly activity</p>
        <div className={styles.chart} role="img" aria-label="Weekly spend bar chart">
          {bars.map((fill, index) => {
            const ratio = Math.min(1, Math.max(0, fill));
            return (
              <div key={index} className={styles.bar}>
                <div className={styles.barBackground} aria-hidden />
                <div
                  className={styles.barActive}
                  style={{ height: `${ratio * 100}%`, opacity: ratio > 0 ? 1 : 0 }}
                  aria-hidden
                />
              </div>
            );
          })}
        </div>
        <MetricLine>{`${fmtUsd(weeklySpentCents)} spent`}</MetricLine>
      </button>

      <button
        type="button"
        ref={earningsClip.ref}
        style={earningsClip.style}
        className={styles.cardEarnings}
        aria-label="Earnings"
      >
        <p className={styles.cardTitle}>Earnings</p>
        <div className={styles.earningsBlock}>
          {/* Headline = the month's accrued yield; the chip below keeps today. */}
          <p className={styles.earningsAmount}>{fmtUsd(earningsMonthCents)}</p>
          <p className={styles.earningsApy}>{`${fmtPercent(apyPercent)} APY`}</p>
        </div>
        <MetricLine positive>
          {`+${fmtUsd(earningsTodayCents)}`}
          <span className={styles.metricMuted}>{'\u00A0today'}</span>
        </MetricLine>
      </button>
    </div>
  );
}
