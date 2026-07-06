'use client';

import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import styles from './SuperCard.module.scss';

/** Card geometry — everything scales off the width. */
const BASE_W = 322.6;
const BASE_H = 203.4;
const BASE_RADIUS = 10.946;

/**
 * The Super debit card — first pass, deliberately spare: a matte black face,
 * the white Super wordmark top-left, ···· 8972 bottom-left. Nothing else
 * (placeholder art direction; the face will be designed later). Pure CSS —
 * scales cleanly via `width`.
 *
 * `showNumber` — the ···· 8972 only exists once the card is actually created
 * (hidden during issuance; fades in on the reveal).
 */
export function SuperCard({
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
        <span className={styles.wordmark} style={{ padding: `${18 * s}px ${20 * s}px` }}>
          Super
        </span>
        <div className={styles.bottomRow} style={{ padding: `0 ${20 * s}px ${16 * s}px` }}>
          <span className={styles.number} data-hidden={!showNumber || undefined}>
            &middot; &middot; &middot; &middot;&nbsp;&nbsp;8972
          </span>
        </div>
      </div>
    </div>
  );
}
