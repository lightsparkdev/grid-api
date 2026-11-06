import type { CSSProperties, ReactNode } from 'react';
import { FrostPanel } from '@/components/liquid-glass';
import styles from './glass.module.scss';

/**
 * The chat chrome's glass sits over the live thread, which scrolls and animates
 * under it, so it frosts what passes behind (GPU `backdrop-filter`) and draws the
 * iOS 27 hairline rim on top. A displacement lens can only bend a static copy.
 */
const TINT = 'var(--chat-glass-tint)';
/** iOS's blue button glass, measured flat at its center in IMG_1859. */
const BLUE = '#3672eb';
const BLUR = 3;

/** Glass of any size: title pills, composers, tab bars. Truly round ends. */
export function GlassPill({
  radius,
  absolute,
  tone,
  tint = tone === 'blue' ? BLUE : TINT,
  className,
  style,
  children,
}: {
  radius: number;
  /** Blue glass: a sheet's primary button (Grok's Done). */
  tone?: 'blue';
  /** The frost's fill. */
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
      className={`${styles.pill} ${tone === 'blue' ? styles.blue : ''} ${className ?? ''}`}
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

/**
 * A header control that feels like the real one and goes nowhere, as the Global Accounts playground's
 * decorative buttons do: the glass swells 2pt a side on hover and 4pt on press, and brightens while held.
 * `size` is the control's width in pt, so wide pills swell by the same few points as discs.
 */
export function NoopButton({
  label,
  size = 44,
  className,
  children,
}: {
  label: string;
  size?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`${styles.noop} ${className ?? ''}`}
      style={{ '--noop-size': size } as CSSProperties}
    >
      {children}
    </button>
  );
}
