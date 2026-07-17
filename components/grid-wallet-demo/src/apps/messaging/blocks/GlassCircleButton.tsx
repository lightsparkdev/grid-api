'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import { GlassOver } from '@/components/liquid-glass';
import { useOverlayGlass, headerGlassBrightness } from '@/apps/shared/glass';
import { useThemeMode } from '@/hooks/useThemeMode';
import styles from './GlassCircleButton.module.scss';

interface GlassCircleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Diameter in px — the home header pair is 40, the action grid is 56. */
  size: number;
  /** Brand-green glass (the header's new-chat plus) — white glyph. */
  green?: boolean;
  /** Decorative no-op: normal at rest, but no hover/press feedback (the
   *  group-hover dim is the parent's job — the money sheet's no-op-source
   *  pattern). */
  noop?: boolean;
  /** Accessible name — required, the glyphs are decorative. */
  'aria-label': string;
}

/** ChatsApp round glass button at arbitrary sizes (the shared GlassSymbolButton
 *  is pinned to 40/44) — refractive lens over the themed neutral surface, or
 *  the brand-green gradient for the primary chip. */
export function GlassCircleButton({
  children,
  className,
  size,
  green = false,
  noop = false,
  type = 'button',
  ...rest
}: GlassCircleButtonProps) {
  const overlayGlass = useOverlayGlass();
  const theme = useThemeMode();

  return (
    <button
      type={type}
      className={clsx(styles.root, green && styles.green, className)}
      style={{ width: size, height: size }}
      data-noop={noop || undefined}
      aria-disabled={noop || undefined}
      {...rest}
    >
      <GlassOver
        className={styles.glass}
        backdrop={green ? 'var(--msg-cta-glass)' : 'var(--glass-symbol-backdrop)'}
        {...overlayGlass.symbol}
        // radius = half the diameter so the glass detects a TRUE CIRCLE and
        // lenses radially (the symbol preset's 22 is under half of 56, which
        // rendered a flat rounded square). Brightness follows the Aurora
        // header treatment: full soft-light in light, none in dark.
        radius={size / 2}
        cornerSmoothing={0}
        brightness={green ? 0.05 : headerGlassBrightness(theme)}
      >
        <span className={styles.glyph} style={{ height: size }}>
          {children}
        </span>
      </GlassOver>
    </button>
  );
}
