'use client';

import { useEffect, useState } from 'react';
import { programNameOf, useBrand } from '@/apps/shared/brand/BrandContext';
import { CARD_CVV, CARD_EXP, PAN_GROUPS, type CardControls } from '@/apps/shared/card';
import { SfSymbol } from '@/apps/shared/icons';
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
 * as a grouped list the cardholder can read and copy.
 */
export function CardNumbersContent({ card }: { card: CardControls }) {
  const name = programNameOf(useBrand());
  return (
    <div className={styles.root}>
      <h2 className={styles.section}>Virtual Card Number</h2>
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
          <span className={styles.value}>
            <SfSymbol name="clock.arrow.trianglehead.counterclockwise.rotate.90" size={17} />
            {CARD_CVV}
          </span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Network</span>
          <span className={styles.value}>Visa</span>
        </div>
      </div>
      <p className={styles.footnote}>
        The card processor renders these numbers. {name} never sees or stores them. They hide again after 60 seconds.
      </p>
      <p className={styles.footnote}>
        To keep your transactions secure, your security code changes when you view your virtual card number.
      </p>
    </div>
  );
}
