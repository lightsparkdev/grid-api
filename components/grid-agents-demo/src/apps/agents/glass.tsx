import type { CSSProperties, ReactNode } from 'react';
import { GlassOver } from '@/components/liquid-glass';
import { GlassSymbolButton, TEXT_GLASS } from '@/apps/shared/glass';
import styles from './glass.module.scss';

/** What the lens refracts: the same neutral surface the playground's glass symbol buttons sit on. */
const BACKDROP = 'var(--glass-symbol-backdrop)';

/**
 * Liquid glass of any size, the playground's own lens (the pill text button's
 * tuning): title pills, composers, tab bars, odd-sized discs. Truly round ends.
 */
export function GlassPill({
  radius,
  absolute,
  className,
  style,
  children,
}: {
  radius: number;
  /** Floats over the screen (the lens otherwise sets itself `position: relative`). */
  absolute?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <GlassOver
      {...TEXT_GLASS}
      radius={radius}
      backdrop={BACKDROP}
      className={`${styles.pill} ${className ?? ''}`}
      style={{ borderRadius: radius, ...(absolute && { position: 'absolute' }), ...style }}
    >
      {children}
    </GlassOver>
  );
}

/** A 44pt round glass control holding a Figma glyph, inked in the button's
 *  own label color so it follows the theme. */
export function GlassDisc({
  label,
  icon,
  width,
  height,
}: {
  label: string;
  icon: string;
  width: number;
  height: number;
}) {
  return (
    <GlassSymbolButton aria-label={label} tabIndex={-1}>
      <span
        style={{
          width,
          height,
          background: 'currentColor',
          maskImage: `url(${icon})`,
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          maskSize: 'contain',
        }}
      />
    </GlassSymbolButton>
  );
}
