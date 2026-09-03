'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';
import NumericText from '@/components/NumericText';
import { useBrand } from '@/apps/shared/brand/BrandContext';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { CardMaterial } from './CardMaterial';
import { VisaFoil } from './VisaFoil';
import styles from './CardBack.module.scss';

/** The details the processor's embed would render (`POST /cards/{id}/reveal`). */
export const PAN_GROUPS = ['4242', '7715', '3306', '8972'];
export const CARD_EXP = '06/30';
export const CARD_CVV = '317';
export const CARDHOLDER = 'Alex Rivera';
const ROLL_STEP_MS = 140;

/** Masking bullets, sized down so they sit like digits. */
function Dots({ n }: { n: number }) {
  return <span className={styles.dots}>{'•'.repeat(n)}</span>;
}

interface CardBackProps {
  /** Details are revealed — the PAN rolls in group by group, then expiry and CVV. */
  revealed: boolean;
}

/**
 * The back of the card, laid out from the Figma card spec (visa-card-back-spec
 * premium, 133:273): mag stripe, contactless indicator, the account block
 * (name, PAN, expiry and CVV), fine print, and the foil lockup. All account
 * data lives here; the front carries only the brand, the chip, and the last 4.
 * PAN, expiry, and CVV stay masked until `revealed`.
 */
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
  const last = PAN_GROUPS.length - 1;

  return (
    <div ref={clip.ref} style={clip.style} className={styles.back} aria-hidden>
      <CardMaterial finish={design.finish} side="back" />
      <span className={styles.stripe}>
        <span className={styles.stripeSheen} />
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.contactless} src="/assets/card/contactless.svg" alt="" draggable={false} />
      <div className={styles.account}>
        <span className={styles.name}>{CARDHOLDER}</span>
        <span className={clsx(styles.ink, styles.pan)}>
          {PAN_GROUPS.map((g, i) => (
            <span key={g} className={styles.panGroup}>
              {i < shown || i === last ? (
                <NumericText
                  value={Number(g)}
                  format={{ minimumIntegerDigits: 4, useGrouping: false }}
                  style={{ padding: 0 }}
                />
              ) : (
                <Dots n={4} />
              )}
            </span>
          ))}
        </span>
        <span className={clsx(styles.ink, styles.cols)}>
          <span>
            EXP{' '}
            {tail ? (
              CARD_EXP
            ) : (
              <>
                <Dots n={2} />/<Dots n={2} />
              </>
            )}
          </span>
          <span>CVV {tail ? CARD_CVV : <Dots n={3} />}</span>
        </span>
      </div>
      <div className={clsx(styles.ink, styles.finePrint)}>
        <span>1-855-516-0103&nbsp;&nbsp;&nbsp;lightspark.com/help</span>
        <span>Issued by Lead Bank</span>
      </div>
      <VisaFoil />
    </div>
  );
}
