'use client';

import clsx from 'clsx';
import { GlassOver } from '@/components/liquid-glass';
import type { GlassConfig } from '@/components/liquid-glass';
import { SfSymbol, type SfSymbolName } from '@/apps/shared/icons';
import { useOverlayGlass } from './OverlayGlassContext';
import styles from './GlassWindowButtonGroup.module.scss';

const SHEET_SURFACE_BACKDROP = 'var(--glass-symbol-backdrop)';

interface GlassWindowButtonGroupProps {
  /** SF Symbol names to show left-to-right inside the capsule. */
  symbols: SfSymbolName[];
  /** Symbol size in px — Figma Window/Button Group XL uses 15pt semibold. */
  iconSize?: number;
  /** Per-instance glass tuning — merged over the overlay symbol preset. */
  glass?: Partial<GlassConfig>;
  className?: string;
}

/** Figma Window/Button Group — glass capsule with one or more SF Symbol glyphs. */
export function GlassWindowButtonGroup({
  symbols,
  iconSize = 15,
  glass,
  className,
}: GlassWindowButtonGroupProps) {
  const overlayGlass = useOverlayGlass();

  return (
    <div className={clsx(styles.root, className)}>
      <GlassOver
        className={styles.glass}
        backdrop={SHEET_SURFACE_BACKDROP}
        // Spread the preset first so these overrides win — SYMBOL_GLASS sets radius: 22.
        {...overlayGlass.symbol}
        radius={1000}
        brightness={1}
        {...glass}
      >
        <div className={styles.inner} aria-hidden>
          {symbols.map((name) => (
            <span className={styles.iconSlot} key={name}>
              <SfSymbol name={name} size={iconSize} />
            </span>
          ))}
        </div>
      </GlassOver>
    </div>
  );
}
