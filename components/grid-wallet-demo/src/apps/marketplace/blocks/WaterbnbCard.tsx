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
 */
export function WaterbnbCard({ width = 322 }: { width?: number }) {
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.house}
          style={{ width: 128 * s, height: 128 * s }}
          src="/assets/marketplace/card-house.svg"
          alt=""
          draggable={false}
        />
        {/* Symmetric inset: the right and bottom gaps match (14.6 at base). */}
        <div className={styles.bottomRow} style={{ padding: `0 ${14.6 * s}px ${14.6 * s}px` }}>
          <span className={styles.number}>&bull; &bull; &bull; &bull;&nbsp;&nbsp;8972</span>
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
