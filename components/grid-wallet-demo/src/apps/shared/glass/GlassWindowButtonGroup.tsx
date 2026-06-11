'use client';

import type { ReactNode } from 'react';
import clsx from 'clsx';
import { GlassOver } from '@/components/liquid-glass';
import type { GlassConfig } from '@/components/liquid-glass';
import { SfSymbol, type SfSymbolName } from '@/apps/shared/icons';
import { useOverlayGlass } from './OverlayGlassContext';
import styles from './GlassWindowButtonGroup.module.scss';

const SHEET_SURFACE_BACKDROP = 'var(--glass-symbol-backdrop)';

export type GlassWindowButtonGroupSymbol =
  | SfSymbolName
  | { name: SfSymbolName; size?: number; label?: string };

interface GlassWindowButtonGroupProps {
  /** SF Symbol entries left-to-right inside the capsule. */
  symbols: GlassWindowButtonGroupSymbol[];
  /** Default symbol size in px when an entry omits `size`. */
  iconSize?: number;
  /** Per-instance glass tuning — merged over the overlay symbol preset. */
  glass?: Partial<GlassConfig>;
  /** Positioned copy of the live UI behind the capsule to refract (overrides the
   *  neutral backdrop) — same contract as GlassSymbolButton's backdropNode. */
  backdropNode?: ReactNode;
  className?: string;
}

const DEFAULT_SYMBOL_LABELS: Partial<Record<SfSymbolName, string>> = {
  'creditcard.and.numbers': 'Card details',
  ellipsis: 'More options',
};

function normalizeSymbol(entry: GlassWindowButtonGroupSymbol, defaultSize: number) {
  if (typeof entry === 'string') {
    return {
      name: entry,
      size: defaultSize,
      label: DEFAULT_SYMBOL_LABELS[entry] ?? entry,
    };
  }
  return {
    name: entry.name,
    size: entry.size ?? defaultSize,
    label: entry.label ?? DEFAULT_SYMBOL_LABELS[entry.name] ?? entry.name,
  };
}

/** Figma Window/Button Group — glass capsule with one or more SF Symbol glyphs. */
export function GlassWindowButtonGroup({
  symbols,
  iconSize = 24,
  glass,
  backdropNode,
  className,
}: GlassWindowButtonGroupProps) {
  const overlayGlass = useOverlayGlass();

  return (
    <div className={clsx(styles.root, className)}>
      <GlassOver
        className={styles.glass}
        backdrop={SHEET_SURFACE_BACKDROP}
        backdropNode={backdropNode}
        // Spread the preset first so these overrides win — SYMBOL_GLASS sets radius: 22.
        {...overlayGlass.symbol}
        radius={1000}
        {...glass}
      >
        <div className={styles.inner}>
          {symbols.map((entry) => {
            const { name, size, label } = normalizeSymbol(entry, iconSize);
            return (
              <button
                key={name}
                type="button"
                className={styles.iconButton}
                aria-label={label}
              >
                <SfSymbol name={name} size={size} />
              </button>
            );
          })}
        </div>
      </GlassOver>
    </div>
  );
}
