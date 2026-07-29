'use client';

import type { ReactNode } from 'react';
import clsx from 'clsx';
import styles from './SheetHeader.module.scss';

interface SheetHeaderIcon {
  icon: ReactNode;
  onClick?: () => void;
  ariaLabel: string;
}

/** Z sheet header — full-bleed row with an icon button on the left, the title
 *  centered, an optional icon button on the right, and a hairline bottom border.
 *  The X Money sheet pattern (Boost Post). The centered title stays centered even
 *  when the right slot is empty (both side slots reserve equal width). */
export function SheetHeader({
  title,
  left,
  right,
  className,
}: {
  title: string;
  left?: SheetHeaderIcon;
  right?: SheetHeaderIcon;
  className?: string;
}) {
  return (
    <header className={clsx(styles.header, className)}>
      <div className={styles.side}>
        {left && (
          <button
            type="button"
            className={styles.iconBtn}
            onClick={left.onClick}
            aria-label={left.ariaLabel}
          >
            {left.icon}
          </button>
        )}
      </div>
      <h2 className={styles.title}>{title}</h2>
      <div className={clsx(styles.side, styles.sideRight)}>
        {right && (
          <button
            type="button"
            className={styles.iconBtn}
            onClick={right.onClick}
            aria-label={right.ariaLabel}
          >
            {right.icon}
          </button>
        )}
      </div>
    </header>
  );
}
