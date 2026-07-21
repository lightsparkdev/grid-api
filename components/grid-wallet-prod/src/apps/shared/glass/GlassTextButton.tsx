'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import { GlassOver } from '@/components/liquid-glass';
import {
  TEXT_GLASS_BACKDROP,
  TEXT_GLASS_PRIMARY_BACKDROP,
} from './presets';
import { useOverlayGlass } from './OverlayGlassContext';
import styles from './GlassTextButton.module.scss';

interface GlassTextButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
}

/** Figma Button - Liquid Glass - Text — pill glass CTA. */
export function GlassTextButton({
  children,
  className,
  variant = 'secondary',
  type = 'button',
  ...rest
}: GlassTextButtonProps) {
  const isPrimary = variant === 'primary';
  const overlayGlass = useOverlayGlass();

  return (
    <button type={type} className={clsx(styles.root, className)} {...rest}>
      <GlassOver
        className={styles.glass}
        backdrop={isPrimary ? TEXT_GLASS_PRIMARY_BACKDROP : TEXT_GLASS_BACKDROP}
        {...overlayGlass.text}
      >
        <span
          className={clsx(
            styles.label,
            isPrimary ? styles.labelPrimary : styles.labelSecondary,
          )}
        >
          {children}
        </span>
      </GlassOver>
    </button>
  );
}
