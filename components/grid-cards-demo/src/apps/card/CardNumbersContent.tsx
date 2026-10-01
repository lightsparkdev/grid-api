'use client';

import { useEffect, useState } from 'react';
import type { CardControls } from '@/apps/shared/card';
import NumericText from '@/components/NumericText';
import styles from './CardNumbersContent.module.scss';

/** PAN groups roll in at this pace, matching the card's back on the stage. */
const ROLL_STEP_MS = 140;

/** Digits roll in one group at a time (SwiftUI numericText), like the PAN
 *  arriving from the processor's iframe. */
function RollingPan({ armed, groups }: { armed: boolean; groups: string[] }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!armed) {
      setShown(0);
      return;
    }
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= groups.length) window.clearInterval(id);
    }, ROLL_STEP_MS);
    return () => window.clearInterval(id);
  }, [armed, groups]);
  return (
    <span className={styles.pan} aria-label={groups.join(' ')}>
      {groups.map((g, i) => (
        <span key={i} className={styles.panGroup}>
          <NumericText value={i < shown ? Number(g) : 0} format={{ minimumIntegerDigits: 4, useGrouping: false }} />
        </span>
      ))}
    </span>
  );
}

/**
 * Wallet's Card Numbers page, pushed over the card home after Face ID. The
 * card stays in its slot above, turned to its back; this repeats the numbers
 * as a grouped list. They stay until the page is popped.
 */
export function CardNumbersContent({ card }: { card: CardControls }) {
  return (
    <div className={styles.root}>
      <div className={styles.group}>
        <div className={styles.row}>
          <span className={styles.label}>Card Number</span>
          <RollingPan armed={card.revealed} groups={card.credentials.groups} />
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Expiration</span>
          <span className={styles.value}>{card.credentials.exp}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Security Code</span>
          <span className={styles.value}>{card.credentials.cvv}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Network</span>
          <span className={styles.value}>Visa</span>
        </div>
      </div>
    </div>
  );
}
