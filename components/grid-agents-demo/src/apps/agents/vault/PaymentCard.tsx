import type { CSSProperties } from 'react';
import styles from './PaymentCard.module.scss';

/*
 * A payment card at true proportions, from the cards playground's spec
 * (grid-cards-demo `facePaint.ts`, `cardMetrics.ts`): a 370 × 232 face with
 * ISO ID-1 corners (3.18 of 85.6 mm), the 6-contact chip module at its ISO
 * 7816-2 position (197 × 149 at 172, 334 on the 1536-wide spec face) with the
 * contact pads from the same geometry, and the Visa marks set 54 spec px in
 * from the right and bottom edges.
 */

export type CardDesign = 'navy' | 'white' | 'emerald' | 'black';
export type CardNetwork = 'visa' | 'visa-debit' | 'mastercard';

/** The chip's contact pads in its 151 × 101 viewBox. */
const CONTACTS = { xs: [8.5, 83.5332], ys: [8.5, 37.8633, 67.2266], w: 58.0332, h: 24.3633, r: 12.1816 };

function Chip() {
  return (
    <svg className={styles.chip} viewBox="0 0 151 101" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="chip-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#efd9a4" />
          <stop offset="0.5" stopColor="#c9a65e" />
          <stop offset="1" stopColor="#e6cd8f" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="151" height="101" rx="19.5" fill="url(#chip-gold)" />
      {CONTACTS.xs.flatMap((x) =>
        CONTACTS.ys.map((y) => (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width={CONTACTS.w}
            height={CONTACTS.h}
            rx={CONTACTS.r}
            fill="none"
            stroke="rgba(110, 82, 30, 0.55)"
            strokeWidth="2.5"
          />
        )),
      )}
    </svg>
  );
}

function Mastercard() {
  return (
    <svg className={styles.mastercard} viewBox="0 0 48 30" aria-hidden>
      <circle cx="15" cy="15" r="15" fill="#eb001b" />
      <circle cx="33" cy="15" r="15" fill="#f79e1b" />
      <path d="M24 3a15 15 0 0 1 0 24a15 15 0 0 1 0-24z" fill="#ff5f00" />
    </svg>
  );
}

export function PaymentCard({
  width,
  design = 'navy',
  network = 'visa',
  last4,
  chip = false,
  className,
  style,
}: {
  width: number;
  design?: CardDesign;
  network?: CardNetwork;
  last4?: string;
  /** The physical card shows its chip; card art in a wallet doesn't. */
  chip?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`${styles.card} ${className ?? ''}`}
      data-design={design}
      style={{ '--w': `${width}px`, ...style } as CSSProperties}
      aria-hidden
    >
      {design === 'white' && <span className={styles.arcs} />}
      {chip && <Chip />}
      {last4 && <span className={styles.number}>•••• {last4}</span>}
      {network === 'mastercard' ? (
        <Mastercard />
      ) : (
        <span className={network === 'visa-debit' ? styles.lockup : styles.visa} />
      )}
    </span>
  );
}
