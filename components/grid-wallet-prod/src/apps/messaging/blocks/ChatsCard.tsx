'use client';

import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import styles from './ChatsCard.module.scss';

/** Card geometry — everything scales off the width (the SuperCard system).
 *  Figma 2650:11281. */
const BASE_W = 322.6;
const BASE_H = 203.4;
const BASE_RADIUS = 10.946;
/** Watermark bubble: 222px box, bleeding off the left edge, optically centered
 *  (2px above true center) — straight from the Figma. */
const MARK_SIZE = 222;
const MARK_LEFT = -5;
const MARK_TOP = BASE_H / 2 - 2 - MARK_SIZE / 2;

/**
 * The ChatsApp debit card (Figma 2650:11281) — solid brand green, an oversized
 * translucent bubble-logo watermark bleeding off the left edge, ···· 8972
 * top-right, DEBIT + Visa bottom-right. No chip, no gradient. Pure CSS —
 * scales cleanly via `width`.
 *
 * `showNumber` — the ···· 8972 only exists once the card is actually created
 * (hidden during issuance; fades in on the reveal).
 */
export function ChatsCard({
  width = 322,
  showNumber = true,
}: {
  width?: number;
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
        {/* Brand watermark (the Figma-exported asset — baked white @ 20%),
            clipped by the card's squircle on the left. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.watermark}
          style={{
            left: MARK_LEFT * s,
            top: MARK_TOP * s,
            width: MARK_SIZE * s,
            height: MARK_SIZE * s,
          }}
          src="/assets/messaging/card-watermark.svg"
          alt=""
          draggable={false}
        />
        <span
          className={styles.number}
          style={{ top: 13.7 * s, right: 14.6 * s }}
          data-hidden={!showNumber || undefined}
        >
          {/* Real bullets (U+2022), not middots — the card-mask voice. */}
          &bull;&bull;&bull;&bull;&nbsp;&nbsp;8972
        </span>
        <span
          className={styles.brandCol}
          style={{ right: 14.6 * s, bottom: 15.5 * s, gap: 3.6 * s }}
        >
          <span className={styles.debit}>DEBIT</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.visa}
            style={{ width: 56.4 * s, height: 18.2 * s }}
            src="/assets/messaging/visa-logo.svg"
            alt="Visa"
            draggable={false}
          />
        </span>
      </div>
    </div>
  );
}
