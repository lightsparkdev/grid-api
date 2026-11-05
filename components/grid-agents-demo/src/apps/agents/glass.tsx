import type { CSSProperties, ReactNode } from 'react';
import { FrostPanel } from '@/components/liquid-glass';
import styles from './glass.module.scss';

/**
 * The chat chrome's glass sits over the live thread, which scrolls and animates
 * under it, so it frosts what passes behind (GPU `backdrop-filter`) and draws the
 * iOS 27 hairline rim on top. A displacement lens can only bend a static copy.
 */
const TINT = 'var(--chat-glass-tint)';
const BLUR = 3;

/** Glass of any size: title pills, composers, tab bars. Truly round ends. */
export function GlassPill({
  radius,
  absolute,
  tint = TINT,
  className,
  style,
  children,
}: {
  radius: number;
  /** The frost's fill; tinted glass (Grok's blue Done) passes its own. */
  tint?: string;
  /** Floats over the screen (the panel otherwise sets itself `position: relative`). */
  absolute?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <FrostPanel
      radius={radius}
      tint={tint}
      tintBlur={BLUR}
      edge="none"
      className={`${styles.pill} ${className ?? ''}`}
      style={{ borderRadius: radius, ...(absolute && { position: 'absolute' }), ...style }}
    >
      {children}
    </FrostPanel>
  );
}

/** A 44pt round glass control holding a Figma glyph, inked in the theme's label color. */
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
    <GlassPill radius={22} className={styles.disc}>
      <span role="img" aria-label={label} className={styles.discInner}>
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
      </span>
    </GlassPill>
  );
}
