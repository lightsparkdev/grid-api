'use client';

import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { IconBubbleAnnotation3 } from '../icons';
import { BRAND } from '../config';
import styles from './ChatsCard.module.scss';

/** Card geometry — everything scales off the width (the SuperCard system). */
const BASE_W = 322.6;
const BASE_H = 203.4;
const BASE_RADIUS = 10.946;

/**
 * The ChatsApp debit card — brand-green gradient face: the bubble logo +
 * white wordmark top-left, EMV chip on the left, ···· 8972 bottom-left,
 * Debit + Visa bottom-right. Pure CSS — scales cleanly via `width`.
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
        {/* Soft brand sheen — a lighter sweep so the green reads dimensional. */}
        <span className={styles.sheen} aria-hidden />
        <span className={styles.wordmark} style={{ padding: `${18 * s}px ${20 * s}px` }}>
          <IconBubbleAnnotation3 className={styles.logo} size={20 * s} />
          {BRAND}
        </span>
        {/* EMV chip — real-card proportions (~14% of the width, left third). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.chip}
          style={{ width: 45 * s, height: 30 * s, left: 24 * s, top: 87 * s }}
          src="/assets/messaging/card-chip.svg"
          alt=""
          draggable={false}
        />
        <div className={styles.bottomRow} style={{ padding: `0 ${20 * s}px ${16 * s}px` }}>
          <span className={styles.number} data-hidden={!showNumber || undefined}>
            {/* Real bullets (U+2022), not middots — the card-mask voice. */}
            &bull;&bull;&bull;&bull;&nbsp;&nbsp;8972
          </span>
          <span className={styles.brandCol}>
            <span className={styles.debit}>Debit</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.visa}
              style={{ width: 50 * s, height: 16.2 * s }}
              src="/assets/messaging/visa-logo.svg"
              alt="Visa"
              draggable={false}
            />
          </span>
        </div>
      </div>
    </div>
  );
}
