'use client';

import { useEffect, useState } from 'react';
import NumberFlow, { NumberFlowGroup } from '@number-flow/react';
import styles from './BalanceHero.module.scss';

interface BalanceHeroProps {
  /** Formatted USD, e.g. "$5,000.00". */
  balance: string;
}

function parseAmount(value: string): { dollars: number; cents: number } {
  const clean = value.replace(/[^0-9.]/g, '');
  const [whole = '0', frac = ''] = clean.split('.');
  return {
    dollars: Number.parseInt(whole, 10) || 0,
    cents: Number.parseInt(frac.padEnd(2, '0').slice(0, 2), 10) || 0,
  };
}

/**
 * Figma 90:13445 — total balance hero. On mount the amount ticks up from 0 to the
 * real balance (and animates any later balance change) via NumberFlow. The integer
 * and cents are split into a synced group so the cents keep the dimmer treatment.
 */
export function BalanceHero({ balance }: BalanceHeroProps) {
  const target = parseAmount(balance);
  const [shown, setShown] = useState({ dollars: 0, cents: 0 });

  // Start at 0 on mount, then settle to the real value so it ticks up.
  useEffect(() => {
    setShown({ dollars: target.dollars, cents: target.cents });
  }, [target.dollars, target.cents]);

  return (
    <section className={styles.hero} aria-label={`Total balance ${balance}`}>
      <p className={styles.label}>Total balance</p>
      <p className={styles.amount}>
        <NumberFlowGroup>
          <NumberFlow
            className={styles.whole}
            value={shown.dollars}
            prefix="$"
            format={{ useGrouping: true, maximumFractionDigits: 0 }}
            aria-hidden
          />
          <NumberFlow
            className={styles.decimals}
            value={shown.cents}
            prefix="."
            format={{ minimumIntegerDigits: 2, useGrouping: false }}
            aria-hidden
          />
        </NumberFlowGroup>
      </p>
    </section>
  );
}
