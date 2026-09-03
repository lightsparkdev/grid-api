'use client';

import clsx from 'clsx';
import type { CardFinish } from '@/data/design';
import styles from './CardMaterial.module.scss';

interface CardMaterialProps {
  finish: CardFinish;
  /** The front carries the brand color; the back is its deeper tone. */
  side: 'front' | 'back';
  className?: string;
}

/**
 * The card's surface: base color plus the lit layers. Every layer reads the
 * lighting variables the stage solves per frame (`cardLighting.ts`): the
 * Lambert shade, the environment reflection, the key light's mirror highlight,
 * the grain that sparkles inside that highlight, and the rim the light rakes.
 * The finish only changes the material constants (how sharp the highlight is,
 * how much environment shows, how coarse the grain is); the light is the same.
 */
export function CardMaterial({ finish, side, className }: CardMaterialProps) {
  return (
    <span className={clsx(styles.material, styles[`finish-${finish}`], styles[side], className)} aria-hidden>
      <span className={styles.base} />
      <span className={styles.shade} />
      <span className={styles.brushed} />
      <span className={styles.env} />
      <span className={styles.spec} />
      <span className={styles.grain} />
      <span className={styles.rim} />
    </span>
  );
}
