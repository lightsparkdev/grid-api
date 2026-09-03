'use client';

import { CARD_H, CARD_W, fig } from './cardMetrics';
import styles from './VisaFoil.module.scss';

/** Figma card spec: vbmdebit lockup 339 × 211.067, 54 px from the right and bottom edges. */
export const FOIL_W = fig(339);
export const FOIL_H = fig(211.067);
export const FOIL_INSET = fig(54);
const FOIL_X = CARD_W - FOIL_INSET - FOIL_W;
const FOIL_Y = CARD_H - FOIL_INSET - FOIL_H;

/**
 * The Visa DEBIT lockup as holographic metallic foil. The lockup is a mask; under
 * it sits a card-sized canvas (so the stage's highlight lands on the foil where
 * it lands on the face) with silver that mirrors the environment, a diffraction
 * rainbow whose phase follows the half vector, and the key's tight highlight.
 */
export function VisaFoil() {
  return (
    <span
      className={styles.foil}
      style={{ width: FOIL_W, height: FOIL_H, right: FOIL_INSET, bottom: FOIL_INSET }}
      aria-hidden
    >
      <span className={styles.canvas} style={{ left: -FOIL_X, top: -FOIL_Y, width: CARD_W, height: CARD_H }}>
        <span className={styles.silver} />
        <span className={styles.rainbow} />
        <span className={styles.interference} />
        <span className={styles.spec} />
      </span>
    </span>
  );
}
