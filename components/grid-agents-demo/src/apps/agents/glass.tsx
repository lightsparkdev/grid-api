import type { CSSProperties, ReactNode } from 'react';
import { FrostPanel, type FrostSpecular } from '@/components/liquid-glass';
import styles from './glass.module.scss';

/**
 * The chat chrome's glass sits over the live thread, which scrolls and animates
 * under it, so it frosts what passes behind (GPU `backdrop-filter`) and bakes the
 * buttons' specular rim on top. A displacement lens can only bend a static copy.
 */
const SPECULAR: FrostSpecular = { rotation: 45, glowStrength: 0.08, edgeStrength: 0.9, edgeWidth: 1.5 };
const TINT = 'var(--chat-glass-tint)';
const BLUR = 6;

/** Glass of any size: title pills, composers, tab bars. Truly round ends. */
export function GlassPill({
  radius,
  absolute,
  className,
  style,
  children,
}: {
  radius: number;
  /** Floats over the screen (the panel otherwise sets itself `position: relative`). */
  absolute?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <FrostPanel
      radius={radius}
      tint={TINT}
      tintBlur={BLUR}
      edge="none"
      specular={SPECULAR}
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
