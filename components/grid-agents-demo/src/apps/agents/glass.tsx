import { useCallback, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { IconCapture } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCapture';
import { FrostPanel } from '@/components/liquid-glass';
import { smoothShapeClip, smoothShapePath } from '@/lib/squircle/path';
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
/** iOS continuous corners, the chat bubbles' smoothing (styles/_corners.scss): a capsule's ends ease off its long edges. */
const SMOOTHING = 0.6;

const isDisc = (w: number, h: number, r: number) => Math.abs(w - h) < 0.5 && r >= h / 2 - 0.5;
const outline = (w: number, h: number, r: number) => smoothShapePath(w, h, [r, r, r, r], isDisc(w, h, r) ? 0 : SMOOTHING, true);

/** Clips an element to the glass's continuous corners at `radius`, following its size: a tab bar's selected pill. */
export function useContinuousCorners<T extends HTMLElement>(radius: number) {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => {
      const cs = getComputedStyle(el);
      const w = parseFloat(cs.width);
      const h = parseFloat(cs.height);
      if (w > 0 && h > 0) el.style.clipPath = smoothShapeClip(w, h, [radius, radius, radius, radius], isDisc(w, h, radius) ? 0 : SMOOTHING, true);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [radius]);
  return ref;
}

/**
 * Light rim (IMG_1951/1952 at 3x): a crisp ring, grey on the caps and darker on the sides. One band, as two
 * sub-pixel bands antialias into a smear twice as wide.
 */
const LIGHT_RING = 0.5;
/** A white glow inside the caps that follows the curve: an inset band (depth) softened (blur), solid ~2.5pt in and gone by ~10pt... */
const LIGHT_GLOW = { depth: 5, blur: 2.8 };
/** ...fading around the ends: (offset down the glass, opacity), mirrored for the bottom. */
const LIGHT_GLOW_CAPS = [
  [0, 1],
  [0.2, 0.8],
  [0.4, 0],
] as const;
/**
 * Below the top glow the glass lightens again, darkest ~10-13pt down and ~5 levels lighter by ~25pt, so the
 * bottom glow lands on a near-white base and barely shows: (pt from the top, white opacity).
 */
const LIGHT_LIFT = [
  [13, 0],
  [19, 0.4],
  [25, 0.62],
] as const;
/** A thin white line just inside the ring, reaching ~75° round a capsule's ends before it fades. */
const LIGHT_LINE = { depth: 1.2, opacity: 1 };
const LIGHT_LINE_CAPS = [
  [0, 1],
  [0.25, 1],
  [0.42, 0],
] as const;
/** Blue glass's glow (IMG_1859's Done): a bright line just inside the ring, dropping fast into a long faint tail. */
const BLUE_GLOW = [
  [0, 1],
  [1, 1],
  [1.33, 0.66],
  [1.67, 0.34],
  [2, 0.18],
  [3, 0.14],
  [5, 0.07],
  [7, 0],
] as const;
/** Dark rim (IMG_1949/1950 at 3x): ~29% white on the outer device pixel, falling to ~6% over the next two... */
const DARK_BANDS = [
  [0.33, 0.14],
  [0.67, 0.08],
  [1, 0.09],
] as const;
/** ...then a feathered glow fading out ~7pt in (depth, white opacity). */
const FEATHER = [
  [0, 0.06],
  [1.33, 0.05],
  [2.33, 0.035],
  [3.33, 0.022],
  [4.67, 0.013],
  [5.67, 0.006],
  [7, 0],
] as const;
/** The dark bands light the caps only: (offset down the glass, opacity), mirrored. */
const BAND_CAPS = [
  [0, 1],
  [0.3, 0],
] as const;
type Stops = readonly (readonly [number, number])[];

/**
 * The rim, traced on the glass's own outline so it follows the continuous corners: each band is a stroke of that
 * outline clipped to its inside (an exact inset band), lit on the caps and faded to nothing on the sides.
 */
function GlassRim({ radius, tone }: { radius: number; tone?: 'blue' }) {
  const id = useId().replace(/:/g, '');
  const ref = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState<[number, number] | null>(null);
  useLayoutEffect(() => {
    const host = ref.current?.parentElement;
    if (!host) return;
    const measure = () => {
      const cs = getComputedStyle(host);
      const w = parseFloat(cs.width);
      const h = parseFloat(cs.height);
      setSize((s) => (s && s[0] === w && s[1] === h ? s : [w, h]));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    return () => ro.disconnect();
  }, []);
  if (!size || size[0] <= 0 || size[1] <= 0) return <svg ref={ref} className={styles.rim} aria-hidden />;
  const [w, h] = size;
  const d = outline(w, h, radius);
  const caps = (key: string, color: string, stops: Stops) => (
    <linearGradient id={`${id}${key}`} x1={0} y1={0} x2={0} y2={1}>
      {[...stops, ...[...stops].reverse().map(([at, o]) => [1 - at, o] as const)].map(([at, o], i) => (
        <stop key={i} offset={at} style={{ stopColor: color }} stopOpacity={o} />
      ))}
    </linearGradient>
  );
  const vertical = (key: string, color: string, top: Stops, bottom: Stops) => (
    <linearGradient id={`${id}${key}`} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={0} y2={h}>
      {[...top.map(([px, o]) => [px / h, o]), ...[...bottom].reverse().map(([px, o]) => [1 - px / h, o])].map(([at, o], i) => (
        <stop key={i} offset={Math.min(1, Math.max(0, at))} style={{ stopColor: color }} stopOpacity={o} />
      ))}
    </linearGradient>
  );
  const band = (key: string, depth: number, opacity: number) => (
    <path key={`${key}${depth}`} d={d} fill="none" stroke={`url(#${id}${key})`} strokeWidth={depth * 2} strokeOpacity={opacity} />
  );
  return (
    <svg ref={ref} className={styles.rim} width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <defs>
        <clipPath id={`${id}in`}>
          <path d={d} />
        </clipPath>
        <filter id={`${id}soft`} filterUnits="userSpaceOnUse" x={-10} y={-10} width={w + 20} height={h + 20}>
          <feGaussianBlur stdDeviation={LIGHT_GLOW.blur} />
        </filter>
        <linearGradient id={`${id}ring`} x1={0} y1={0} x2={0} y2={1}>
          <stop offset={0} style={{ stopColor: 'var(--glass-rim-cap)' }} />
          <stop offset={0.38} style={{ stopColor: 'var(--glass-rim-side)' }} />
          <stop offset={0.62} style={{ stopColor: 'var(--glass-rim-side)' }} />
          <stop offset={1} style={{ stopColor: 'var(--glass-rim-cap)' }} />
        </linearGradient>
        {caps('band', '#fff', BAND_CAPS)}
        {caps('glow', 'var(--glass-rim-inset)', LIGHT_GLOW_CAPS)}
        {caps('line', 'var(--glass-rim-inset)', LIGHT_LINE_CAPS)}
        {vertical('blueGlow', 'var(--glass-rim-inset)', BLUE_GLOW, BLUE_GLOW)}
        <linearGradient id={`${id}lift`} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={0} y2={h}>
          {LIGHT_LIFT.map(([pt, o]) => (
            <stop key={pt} offset={Math.min(1, pt / h)} style={{ stopColor: 'var(--glass-rim-inset)' }} stopOpacity={o} />
          ))}
        </linearGradient>
        {vertical('feather', '#fff', FEATHER, FEATHER)}
      </defs>
      <g clipPath={`url(#${id}in)`} className={styles.rimLight}>
        {tone === 'blue' ? (
          <path d={d} fill={`url(#${id}blueGlow)`} />
        ) : (
          <>
            <path d={d} fill={`url(#${id}lift)`} />
            <path d={d} fill="none" stroke={`url(#${id}glow)`} strokeWidth={LIGHT_GLOW.depth * 2} filter={`url(#${id}soft)`} />
            <path d={d} fill="none" stroke={`url(#${id}line)`} strokeWidth={LIGHT_LINE.depth * 2} strokeOpacity={LIGHT_LINE.opacity} />
          </>
        )}
        <path d={d} fill="none" stroke={`url(#${id}ring)`} strokeWidth={LIGHT_RING * 2} />
      </g>
      <g clipPath={`url(#${id}in)`} className={styles.rimDark}>
        <path d={d} fill={`url(#${id}feather)`} />
        {DARK_BANDS.map(([depth, o]) => band('band', depth, o))}
      </g>
    </svg>
  );
}

/** Glass of any size: title pills, composers, tab bars. Continuous corners; a disc stays a circle. */
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
  // A disc keeps the frost's round clip (border-radius), which never drops its blur.
  const shape = useCallback((w: number, h: number) => (isDisc(w, h, radius) ? null : outline(w, h, radius)), [radius]);
  return (
    <FrostPanel
      radius={radius}
      shape={shape}
      tint={tint}
      tintBlur={BLUR}
      edge="none"
      className={`${styles.pill} ${tone === 'blue' ? styles.blue : ''} ${className ?? ''}`}
      style={{ borderRadius: radius, ...(absolute && { position: 'absolute' }), ...style }}
    >
      <GlassRim radius={radius} tone={tone} />
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
