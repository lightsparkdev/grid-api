'use client';

import { fig } from './cardMetrics';
import styles from './Chip.module.scss';

/** ISO/IEC 7816-2 contact zone from the Figma front spec: (152, 324), 236 × 164. */
export const CHIP_LEFT = fig(152);
export const CHIP_TOP = fig(324);
export const CHIP_W = fig(236);

// The module's geometry is the Z card's chip (refs/social-platform/chip.svg,
// viewBox 151 × 101): a rounded body and a 2 × 3 grid of rounded contacts.
const VIEW_W = 151;
const VIEW_H = 101;
const CONTACT_X = [8.5, 83.5332];
const CONTACT_Y = [8.5, 37.8633, 67.2266];
const CONTACT_W = 58.0332;
const CONTACT_H = 24.3633;
const CONTACT_R = 12.1816;

function Grooves({ className }: { className: string }) {
  return (
    <g className={className}>
      {CONTACT_X.map((x) =>
        CONTACT_Y.map((y) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={CONTACT_W} height={CONTACT_H} rx={CONTACT_R} />
        )),
      )}
    </g>
  );
}

/**
 * The EMV contact module. Gold-plated contacts separated by milled grooves,
 * flush in the face. Lit by the stage's solve like the rest of the card: the
 * plating's bands follow the raking direction, the key's highlight crosses it
 * at the same spot it crosses the face, and each groove shows a dark near
 * wall and a lit far wall.
 */
export function Chip() {
  const h = (CHIP_W * VIEW_H) / VIEW_W;
  return (
    <span
      className={styles.chip}
      style={{
        left: CHIP_LEFT,
        top: CHIP_TOP,
        width: CHIP_W,
        height: h,
        ['--chip-x' as string]: `${CHIP_LEFT}px`,
        ['--chip-y' as string]: `${CHIP_TOP}px`,
      }}
      aria-hidden
    >
      <span className={styles.plate} />
      <span className={styles.env} />
      <span className={styles.spec} />
      <svg className={styles.grooves} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} fill="none">
        <Grooves className={styles.wallLit} />
        <Grooves className={styles.wallDark} />
        <Grooves className={styles.wallFloor} />
      </svg>
      <span className={styles.bevel} />
    </span>
  );
}
