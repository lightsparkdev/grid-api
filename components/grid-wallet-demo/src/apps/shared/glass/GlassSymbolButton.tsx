'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import { GlassOver } from '@/components/liquid-glass';
import type { GlassConfig } from '@/components/liquid-glass';
import { useOverlayGlass } from './OverlayGlassContext';
import styles from './GlassSymbolButton.module.scss';

/** The button sits on the frosted sheet, so it refracts a neutral surface token
 *  (themed) rather than the blue auth-hero gradient — see globals.scss. */
const SHEET_SURFACE_BACKDROP = 'var(--glass-symbol-backdrop)';

interface GlassSymbolButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Button diameter in px — Figma wallet header uses 40, passkey close uses 44. */
  size?: 40 | 44;
  /** Per-instance glass tuning — merged over the overlay symbol preset. */
  glass?: Partial<GlassConfig>;
  /** CSS background the lens refracts — overrides the neutral sheet surface. A
   *  static, pre-toned gradient is cheap on Safari (rasterized once); prefer it
   *  over a live `backdropNode` for surfaces over a near-uniform background
   *  (e.g. the small close button over the issuance aurora corner). */
  backdrop?: string;
  /** A positioned copy of the live UI behind the button to refract (overrides the
   *  neutral backdrop) — e.g. the aurora during card issuance. Must be aligned to
   *  the button's screen position by the caller. Takes precedence over `backdrop`;
   *  expensive on Safari (live SVG displacement), so prefer a static `backdrop`. */
  backdropNode?: ReactNode;
  /** Accessible name — required when children are decorative. */
  'aria-label': string;
}

/** Figma Button - Liquid Glass - Symbol — round glass icon control. */
export function GlassSymbolButton({
  children,
  className,
  glass,
  size = 44,
  type = 'button',
  backdrop = SHEET_SURFACE_BACKDROP,
  backdropNode,
  ...rest
}: GlassSymbolButtonProps) {
  const overlayGlass = useOverlayGlass();

  return (
    <button
      type={type}
      className={clsx(styles.root, size === 40 && styles.size40, className)}
      {...rest}
    >
      <GlassOver
        className={styles.glass}
        backdrop={backdrop}
        backdropNode={backdropNode}
        {...overlayGlass.symbol}
        {...glass}
      >
        <span className={styles.glyph}>{children}</span>
      </GlassOver>
    </button>
  );
}
