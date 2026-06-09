'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import { GlassOver } from '@/components/liquid-glass';
import { AUTH_GLASS_BACKDROP } from './presets';
import { useOverlayGlass } from './OverlayGlassContext';
import styles from './GlassSymbolButton.module.scss';

interface GlassSymbolButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Accessible name — required when children are decorative. */
  'aria-label': string;
}

/** Figma Button - Liquid Glass - Symbol — round glass icon control. */
export function GlassSymbolButton({
  children,
  className,
  type = 'button',
  ...rest
}: GlassSymbolButtonProps) {
  const overlayGlass = useOverlayGlass();

  return (
    <button type={type} className={clsx(styles.root, className)} {...rest}>
      <GlassOver
        className={styles.glass}
        backdrop={AUTH_GLASS_BACKDROP}
        {...overlayGlass.symbol}
      >
        <span className={styles.glyph}>{children}</span>
      </GlassOver>
    </button>
  );
}
