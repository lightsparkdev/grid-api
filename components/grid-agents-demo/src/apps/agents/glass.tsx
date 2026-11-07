import type { CSSProperties, ReactNode } from 'react';
import { IconCapture } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCapture';
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
export function NoopButton(props: { label: string; size?: number; className?: string; children: ReactNode }) {
  return <PressButton {...props} />;
}

/**
 * A sheet's action on glass: clear for the way out, tinted with the app's color for the way forward (iOS's
 * prominent glass). `size` is about how wide it lands, so it swells by the same few points as a disc.
 */
export function GlassButton({
  label,
  tint,
  ink,
  height = 50,
  size = 170,
  className,
  disabled,
  onClick,
  children,
}: {
  label: string;
  /** The glass's fill: the app's accent for a primary action; the sheet's own frost when omitted. */
  tint?: string;
  /** The label's color on that fill. */
  ink?: string;
  height?: number;
  size?: number;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <PressButton label={label} size={size} className={`${styles.cta} ${className ?? ''}`} disabled={disabled} onClick={onClick}>
      <GlassPill radius={height / 2} tint={tint} style={{ height }}>
        <span className={styles.ctaLabel} style={ink ? ({ '--cta-ink': ink } as CSSProperties) : undefined}>
          {children}
        </span>
      </GlassPill>
    </PressButton>
  );
}

/** A glass control that presses like the header ones and does something: a sheet's close, back or save. */
export function PressButton({
  label,
  size = 44,
  className,
  disabled,
  onClick,
  children,
}: {
  label: string;
  size?: number;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`${styles.noop} ${className ?? ''}`}
      style={{ '--noop-size': size } as CSSProperties}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/** A card form's hint that a photo of the card fills it in: Scan with the camera glyph, on glass. It goes nowhere. */
export function ScanButton({ className }: { className?: string }) {
  return (
    <NoopButton label="Scan card" size={100} className={`${styles.scan} ${className ?? ''}`}>
      <GlassPill radius={22} className={styles.scanGlass}>
        <span className={styles.scanInner}>
          <IconCapture size={20} />
          Scan
        </span>
      </GlassPill>
    </NoopButton>
  );
}

/** The same hint as a bare camera glyph at the end of the card number field. */
export function ScanGlyph() {
  return (
    <button type="button" aria-label="Scan card" className={styles.scanGlyph}>
      <IconCapture size={20} />
    </button>
  );
}
