'use client';

import { useEffect, useState } from 'react';
import NumericText from '@/components/NumericText';
import styles from './BalanceHero.module.scss';

interface BalanceHeroProps {
  /** Formatted USD, e.g. "$5,000.00". */
  balance: string;
  /** Caption above the amount (default "Total balance"). */
  label?: string;
}

function parseAmount(value: string): { dollars: number; cents: number } {
  const clean = value.replace(/[^0-9.]/g, '');
  const [whole = '0', frac = ''] = clean.split('.');
  return {
    dollars: Number.parseInt(whole, 10) || 0,
    cents: Number.parseInt(frac.padEnd(2, '0').slice(0, 2), 10) || 0,
  };
}

/** Slim vertical pad (the iOS default inflates the line box; nothing clips here). */
const NUMERIC_PAD = { padding: '0.08em 0' };

/**
 * Figma 90:13445 — total balance hero. On mount the amount ticks up from 0 to
 * the real balance (and animates any later change) via NumericText — the
 * iOS-numericText port — split into whole + cents instances so the cents keep
 * the dimmer treatment.
 */
export function BalanceHero({ balance, label = 'Total balance' }: BalanceHeroProps) {
  const target = parseAmount(balance);
  const [shown, setShown] = useState({ dollars: 0, cents: 0 });

  // Start at 0 on mount, then settle to the real value so it ticks up.
  useEffect(() => {
    setShown({ dollars: target.dollars, cents: target.cents });
  }, [target.dollars, target.cents]);

  return (
    <section className={styles.hero} aria-label={`${label} ${balance}`}>
      <p className={styles.label}>{label}</p>
      <p className={styles.amount}>
        <NumericText
          className={styles.whole}
          value={shown.dollars}
          format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
          style={NUMERIC_PAD}
        />
        <span className={styles.decimals} aria-hidden>
          .
        </span>
        <NumericText
          className={styles.decimals}
          value={shown.cents}
          format={{ minimumIntegerDigits: 2, useGrouping: false }}
          style={NUMERIC_PAD}
        />
      </p>
    </section>
  );
}
