import type { ReactNode } from 'react';
import { SfSymbol } from '@/apps/shared/icons';
import styles from './WalletInsightCards.module.scss';

const WEEKLY_BAR_COUNT = 14;

const DEFAULT_WEEKLY_BARS = Array.from({ length: WEEKLY_BAR_COUNT }, () => 0);

function fmtUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function splitBtcAmount(btc: number): { whole: string; decimals: string } {
  const [whole = '0', decimals = '0000'] = fmtBtcAmount(btc).split('.');
  return { whole, decimals: decimals.padEnd(4, '0').slice(0, 4) };
}

function fmtBtcAmount(btc: number): string {
  return btc.toLocaleString('en-US', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
}

function fmtPercent(value: number): string {
  return `${Math.abs(value).toFixed(2)}%`;
}

function normalizeBars(values: number[]): number[] {
  const bars = values.slice(0, WEEKLY_BAR_COUNT);
  while (bars.length < WEEKLY_BAR_COUNT) {
    bars.push(0);
  }
  return bars;
}

function MetricLine({ children }: { children: ReactNode }) {
  return (
    <p className={styles.metric}>
      <span className={styles.metricLine}>{children}</span>
    </p>
  );
}

export interface WalletInsightCardsProps {
  /** Weekly earned total in USD cents. */
  weeklyEarnedCents?: number;
  /** Bar fill ratios 0–1, one per day (defaults to all empty). */
  weeklyBars?: number[];
  /** BTC balance. */
  btcAmount?: number;
  /** BTC value in USD cents. */
  btcUsdCents?: number;
  /** BTC price change today, percent. */
  btcChangePercent?: number;
}

/** Figma 90:13639 — Weekly activity chart + Bitcoin balance cards. */
export function WalletInsightCards({
  weeklyEarnedCents = 0,
  weeklyBars = DEFAULT_WEEKLY_BARS,
  btcAmount = 0,
  btcUsdCents = 0,
  btcChangePercent = 0,
}: WalletInsightCardsProps) {
  const bars = normalizeBars(weeklyBars);
  const { whole, decimals } = splitBtcAmount(btcAmount);

  return (
    <div className={styles.row}>
      <article className={styles.cardWeekly} aria-label="Weekly activity">
        <p className={styles.cardTitle}>Weekly activity</p>
        <div className={styles.chart} role="img" aria-label="Weekly earnings bar chart">
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
        <MetricLine>
          <SfSymbol className={styles.metricIcon} name="arrow.up" size={13} />
          <span>{` ${fmtUsd(weeklyEarnedCents)} earned`}</span>
        </MetricLine>
      </article>

      <article className={styles.cardBitcoin} aria-label="Bitcoin balance">
        <p className={styles.cardTitle}>Bitcoin</p>
        <div className={styles.btcBlock}>
          <p className={styles.btcAmount}>
            <span className={styles.btcWhole}>{whole}</span>
            <span className={styles.btcWhole}>.</span>
            <span className={styles.btcWhole}>{decimals}</span>
            <span className={styles.btcSuffix}> BTC</span>
          </p>
          <p className={styles.btcUsd}>{fmtUsd(btcUsdCents)}</p>
        </div>
        <MetricLine>
          <SfSymbol className={styles.metricIcon} name="arrow.up" size={13} />
          <span>{` ${fmtPercent(btcChangePercent)} today`}</span>
        </MetricLine>
      </article>
    </div>
  );
}
