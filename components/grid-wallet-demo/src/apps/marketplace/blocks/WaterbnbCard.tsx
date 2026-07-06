'use client';

import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import styles from './WaterbnbCard.module.scss';

/** Figma card geometry (2631:12225) — everything scales off the width. */
const BASE_W = 322.6;
const BASE_H = 203.4;
const BASE_RADIUS = 10.946;

/**
 * The Waterbnb debit card (Figma 2631:12225): brand-pink face, the house mark
 * as a big screen-blend watermark, ···· 8972 bottom-left, DEBIT over the VISA
 * wordmark bottom-right. Pure CSS/img — scales cleanly via `width`.
 *
 * `art` swaps the pink face for an illustrated design (the Airbnb gift-card
 * look): the artwork fills the card and the house mark sits on top as a
 * smaller solid-white badge, kept vector so it stays crisp at any size.
 *
 * `showNumber` — the ···· 8972 only exists once the card is actually created
 * (hidden during issuance; fades in on the reveal).
 */
export function WaterbnbCard({
  width = 322,
  art,
  showNumber = true,
}: {
  width?: number;
  art?: string | null;
  showNumber?: boolean;
}) {
  const s = width / BASE_W;
  const clip = useSquircleClip<HTMLDivElement>({ figmaRadii: BASE_RADIUS * s });
  return (
    <div
      className={styles.shell}
      style={{ width, height: BASE_H * s, borderRadius: BASE_RADIUS * s }}
    >
      <div
        ref={clip.ref}
        className={styles.card}
        style={{ ...clip.style, fontSize: 12 * s /* type scales with the card */ }}
      >
        {art ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.art} src={art} alt="" draggable={false} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.houseBadge}
              style={{ width: 72 * s, height: 72 * s }}
              src="/assets/marketplace/card-house-solid.svg"
              alt=""
              draggable={false}
            />
          </>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={styles.house}
            style={{ width: 128 * s, height: 128 * s }}
            src="/assets/marketplace/card-house-solid.svg"
            alt=""
            draggable={false}
          />
        )}
        {/* EMV chip — real-card proportions (~14% of the width, left third). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.chip}
          style={{ width: 45 * s, height: 30 * s, left: 28 * s, top: 87 * s }}
          src="/assets/marketplace/card-chip.svg"
          alt=""
          draggable={false}
        />
        {/* Symmetric inset: the right and bottom gaps match (14.6 at base). */}
        <div className={styles.bottomRow} style={{ padding: `0 ${14.6 * s}px ${14.6 * s}px` }}>
          {/* Middle dots (U+00B7) — Circular's real bullet is huge. */}
          <span className={styles.number} data-hidden={!showNumber || undefined}>
            &middot; &middot; &middot; &middot;&nbsp;&nbsp;8972
          </span>
          <span className={styles.brandCol}>
            <span className={styles.debit}>DEBIT</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.visa}
              style={{ width: 56.4 * s, height: 18.2 * s }}
              src="/assets/marketplace/visa-logo.svg"
              alt="Visa"
              draggable={false}
            />
          </span>
        </div>
      </div>
    </div>
  );
}
