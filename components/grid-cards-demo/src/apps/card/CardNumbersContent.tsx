'use client';

import { useEffect, useState } from 'react';
import { CARD_CVV, CARD_EXP, PAN_GROUPS, type CardControls } from '@/apps/shared/card';
import NumericText from '@/components/NumericText';
import styles from './CardNumbersContent.module.scss';

/** PAN groups roll in at this pace, matching the card's back on the stage. */
const ROLL_STEP_MS = 140;

/** Digits roll in one group at a time (SwiftUI numericText), like the PAN
 *  arriving from the processor's iframe. */
function RollingPan({ armed }: { armed: boolean }) {
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
      if (i >= PAN_GROUPS.length) window.clearInterval(id);
    }, ROLL_STEP_MS);
    return () => window.clearInterval(id);
  }, [armed]);
  return (
    <span className={styles.pan} aria-label={PAN_GROUPS.join(' ')}>
      {PAN_GROUPS.map((g, i) => (
        <span key={g} className={styles.panGroup}>
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
          <RollingPan armed={card.revealed} />
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Expiration</span>
          <span className={styles.value}>{CARD_EXP}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Security Code</span>
          <span className={styles.value}>{CARD_CVV}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Network</span>
          <span className={styles.value}>Visa</span>
        </div>
      </div>
    </div>
  );
}
