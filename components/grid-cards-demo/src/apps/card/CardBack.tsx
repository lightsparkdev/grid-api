'use client';

import { useEffect, useState } from 'react';
import NumericText from '@/components/NumericText';
import { programNameOf, useBrand } from '@/apps/shared/brand/BrandContext';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { CardMaterial } from './CardMaterial';
import styles from './CardBack.module.scss';

/** The details the processor's embed would render (`POST /cards/{id}/reveal`). */
export const PAN_GROUPS = ['4242', '7715', '3306', '8972'];
export const CARD_EXP = '06/30';
export const CARD_CVV = '317';
const ROLL_STEP_MS = 140;

interface CardBackProps {
  /** Details are revealed — the PAN rolls in group by group, then expiry and CVV. */
  revealed: boolean;
}

/** The back of the card: the reveal surface. Masked until `revealed`. */
export function CardBack({ revealed }: CardBackProps) {
  const design = useBrand();
  const clip = useSquircleClip<HTMLDivElement>({ radiusVar: '--corner-radius-debit-card-squircle' });
  // Groups shown so far: 0..4 for the PAN, 5 = expiry + CVV.
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!revealed) {
      setShown(0);
      return;
    }
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(i);
      if (i > PAN_GROUPS.length) window.clearInterval(id);
    }, ROLL_STEP_MS);
    return () => window.clearInterval(id);
  }, [revealed]);
  const tail = shown > PAN_GROUPS.length;

  return (
    <div ref={clip.ref} style={clip.style} className={styles.back} aria-hidden>
      <CardMaterial finish={design.finish} side="back" />
      <span className={styles.stripe} />
      <div className={styles.body}>
        <span className={styles.pan}>
          {PAN_GROUPS.map((g, i) => (
            <span key={g} className={styles.panGroup}>
              {i < shown ? (
                <NumericText value={Number(g)} format={{ minimumIntegerDigits: 4, useGrouping: false }} />
              ) : (
                '••••'
              )}
            </span>
          ))}
        </span>
        <div className={styles.row}>
          <span className={styles.field}>
            <span className={styles.label}>Expires</span>
            <span className={styles.value}>{tail ? CARD_EXP : '••/••'}</span>
          </span>
          <span className={styles.field}>
            <span className={styles.label}>CVV</span>
            <span className={styles.value}>{tail ? CARD_CVV : '•••'}</span>
          </span>
          <span className={styles.field}>
            <span className={styles.label}>Name</span>
            <span className={styles.value}>Alex Rivera</span>
          </span>
        </div>
      </div>
      <span className={styles.footer}>{programNameOf(design)} · Issued by Lead Bank, Member FDIC</span>
    </div>
  );
}
