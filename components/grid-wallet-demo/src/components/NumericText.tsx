import * as React from 'react';
import { AnimatePresence, motion, type Transition } from 'motion/react';

/**
 * NumericText — a faithful web port of SwiftUI's `.contentTransition(.numericText())`.
 *
 * Sourced from ~/Development/Projects/numeric-text (the playground reference
 * component), extended here with a GHOST FRACTION mode for the wallet's amount
 * entry: the integer part is driven by `value` (Intl-formatted), while the
 * decimals can be overridden with typed digits plus dim placeholder digits
 * (`fraction` + `ghostClassName`). Placeholder columns share the same slot keys
 * as their typed successors, so a ghost "inks in" via a pure color transition
 * (no remount) when it becomes real — and `.00` appearing on confirm slides in
 * with the standard numericText glyph entry.
 *
 * It imposes no font / size / color — it inherits everything from its parent,
 * and all of its motion is sized in `em`, so it scales with `font-size`.
 *
 *   <NumericText value={amount} format={{ style: 'currency', currency: 'USD' }} />
 *
 * Defaults are the actual constants recovered from the SwiftUICore binary:
 *   offset 0.59375em · blur 0.25em · scale 0.4 · stagger factor 0.15
 *
 * Unlike an odometer, numericText does NOT spin through intermediate digits:
 * each changed glyph slides/blurs/fades out while the new one slides in.
 */

export type Direction = 'up' | 'down' | 'auto';

export interface NumericTextConfig {
  /** Vertical slide distance in em (iOS default 0.59375). */
  offset: number;
  /** Blur radius in em (iOS default 0.25). */
  blur: number;
  /** Glyph scale at the far end of the transition (iOS default ~0.4). */
  scale: number;
  /** Per-glyph cascade delay in seconds (iOS quantized factor 0.15). */
  stagger: number;
  /** Stagger from least-significant digit first (right→left) or reverse. */
  staggerFromRight: boolean;
  /** Spring visual duration in seconds. */
  visualDuration: number;
  /** Spring bounce 0–1 (0 = no overshoot, the iOS "smooth" default). */
  bounce: number;
  /** Opacity fade duration in seconds (fades faster than it travels on iOS). */
  opacityDuration: number;
  /**
   * Roll direction. `up` = new enters from below, `down` = from above,
   * `auto` = derived from whether the value grew or shrank (like
   * `.numericText(value:)`).
   */
  direction: Direction;
}

export const iosDefaults: NumericTextConfig = {
  offset: 0.59375,
  blur: 0.25,
  scale: 0.4,
  stagger: 0.05,
  staggerFromRight: true,
  visualDuration: 0.5,
  bounce: 0.2,
  opacityDuration: 0.28,
  direction: 'auto',
};

/** Decimal override for amount entry: digits the user typed plus dim
 *  placeholders. `hasDot` controls the separator (typing "1500." shows the dot
 *  with both placeholder zeros still ghosted). */
export interface NumericTextFraction {
  hasDot: boolean;
  /** Digits after the separator the user actually typed. */
  typed: string;
  /** Placeholder digits rendered dim (ghostClassName), e.g. "00" → "0" → "". */
  ghost: string;
}

type Slot = {
  key: string;
  kind: 'digit' | 'sym';
  char: string;
  order: number;
  ghost?: boolean;
};

function parse(parts: Intl.NumberFormatPart[]): Slot[] {
  let totalInt = 0;
  for (const p of parts) if (p.type === 'integer') totalInt += p.value.length;

  const slots: Slot[] = [];
  let intIdx = 0;
  let fracIdx = 0;

  for (const p of parts) {
    switch (p.type) {
      case 'integer':
        for (const ch of p.value) {
          // Key LEFT-anchored (most-significant = stable index 0) so typing
          // 1 → 10 → 1000 keeps the leading "1" mounted and only appends digits
          // on the right. `order` stays the place value so the stagger reads
          // least-significant-first.
          slots.push({ key: `int:L${intIdx}`, kind: 'digit', char: ch, order: totalInt - 1 - intIdx });
          intIdx++;
        }
        break;
      case 'group':
        // Comma keyed left-anchored too, so when grouping shifts it ticks
        // out/in at its new place rather than sliding sideways.
        slots.push({ key: `group:L${intIdx}`, kind: 'sym', char: p.value, order: totalInt - intIdx });
        break;
      case 'decimal':
        slots.push({ key: 'decimal', kind: 'sym', char: p.value, order: -0.5 });
        break;
      case 'fraction':
        for (const ch of p.value) {
          fracIdx++;
          slots.push({ key: `frac:${fracIdx}`, kind: 'digit', char: ch, order: -fracIdx });
        }
        break;
      case 'minusSign':
      case 'plusSign':
        slots.push({ key: 'sign', kind: 'sym', char: p.value, order: totalInt + 1 });
        break;
      case 'currency':
        slots.push({ key: 'currency', kind: 'sym', char: p.value, order: totalInt + 2 });
        break;
      case 'percentSign':
        slots.push({ key: 'percent', kind: 'sym', char: p.value, order: -fracIdx - 1 });
        break;
      default:
        slots.push({ key: `${p.type}:${slots.length}`, kind: 'sym', char: p.value, order: 0 });
    }
  }
  return slots;
}

// The state a glyph holds while entering (from below) or exiting (above):
// shifted vertically by ±offset, shrunk, blurred and transparent.
const awayState = (dir: number, sign: number, c: NumericTextConfig) => ({
  y: `${dir * sign * c.offset}em`,
  opacity: 0,
  scale: c.scale,
  filter: `blur(${c.blur}em)`,
});

const restState = { y: '0em', opacity: 1, scale: 1, filter: 'blur(0em)' };

const glyphTransition = (c: NumericTextConfig, delay: number): Transition => ({
  default: { type: 'spring', visualDuration: c.visualDuration, bounce: c.bounce, delay },
  opacity: { duration: c.opacityDuration, ease: 'easeOut', delay },
  filter: { duration: c.opacityDuration, ease: 'easeOut', delay },
});

// Structural styles only — no font / color / size, all sized in em.
const rootStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'baseline',
  whiteSpace: 'nowrap',
  position: 'relative',
  // breathing room so the vertical slide + blur never clip against the box
  padding: '0.35em 0',
};
const colStyle: React.CSSProperties = {
  position: 'relative',
  display: 'inline-flex',
  justifyContent: 'center',
  // Ghost placeholders ink in/out via color — keep it animatable everywhere.
  transition: 'color 0.3s ease',
};
const sizerStyle: React.CSSProperties = { visibility: 'hidden' };
const glyphStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  willChange: 'transform, opacity, filter',
};

export interface NumericTextProps {
  value: number;
  locales?: Intl.LocalesArgument;
  format?: Intl.NumberFormatOptions;
  config?: Partial<NumericTextConfig>;
  /** Amount-entry decimals: typed digits + dim placeholders (see type docs).
   *  When set, `value`'s own fraction is ignored for display. */
  fraction?: NumericTextFraction;
  /** Class applied to ghost placeholder columns (color + anything else). */
  ghostClassName?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function NumericText({
  value,
  locales,
  format,
  config: configProp,
  fraction,
  ghostClassName,
  className,
  style,
}: NumericTextProps) {
  const config = React.useMemo(() => ({ ...iosDefaults, ...configProp }), [configProp]);

  const localesKey = JSON.stringify(locales ?? null);
  const formatKey = JSON.stringify(format ?? null);
  const hasFraction = fraction !== undefined;
  const formatter = React.useMemo(
    () =>
      new Intl.NumberFormat(
        locales,
        // Fraction override: Intl renders the integer part only; the decimals
        // are appended as manual slots below.
        hasFraction ? { ...format, minimumFractionDigits: 0, maximumFractionDigits: 0 } : format,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [localesKey, formatKey, hasFraction],
  );

  const slots = React.useMemo(() => {
    const displayValue = hasFraction ? Math.trunc(value) : value;
    const base = parse(formatter.formatToParts(displayValue));
    if (!fraction) return base;
    if (fraction.hasDot) base.push({ key: 'decimal', kind: 'sym', char: '.', order: -0.5 });
    let fracIdx = 0;
    for (const ch of fraction.typed) {
      fracIdx++;
      base.push({ key: `frac:${fracIdx}`, kind: 'digit', char: ch, order: -fracIdx });
    }
    for (const ch of fraction.ghost) {
      fracIdx++;
      base.push({ key: `frac:${fracIdx}`, kind: 'digit', char: ch, order: -fracIdx, ghost: true });
    }
    return base;
  }, [formatter, value, hasFraction, fraction]);

  const ariaLabel = React.useMemo(() => {
    if (!fraction) return formatter.format(value);
    const dec = fraction.hasDot ? `.${fraction.typed}${fraction.ghost}` : '';
    return `${formatter.format(Math.trunc(value))}${dec}`;
  }, [formatter, value, fraction]);

  // Trend (for `auto` direction): compare against the previous committed value.
  const prevValue = React.useRef(value);
  const trend = Math.sign(value - prevValue.current) || 1;
  React.useEffect(() => {
    prevValue.current = value;
  }, [value]);

  // Suppress the enter animation on the first paint; every later mount (a value
  // change or a newly added digit/comma) slides in.
  const hasMounted = React.useRef(false);
  React.useEffect(() => {
    hasMounted.current = true;
  }, []);

  // Per-column "generation": bumps whenever a column's glyph changes so each
  // appearance is a fresh key. Without it, rapidly toggling a digit (0→1→0)
  // lets the still-exiting glyph get reclaimed mid-flight and reverse direction.
  const genRef = React.useRef<Record<string, { char: string; gen: number }>>({});
  const genFor = (slotKey: string, char: string) => {
    const prev = genRef.current[slotKey];
    if (!prev) {
      genRef.current[slotKey] = { char, gen: 0 };
      return 0;
    }
    if (prev.char !== char) {
      prev.char = char;
      prev.gen++;
    }
    return prev.gen;
  };

  // +1 = new glyph enters from below (the increasing feel).
  const sign =
    config.direction === 'up' ? 1 : config.direction === 'down' ? -1 : trend >= 0 ? 1 : -1;

  const changedDigits = slots.filter((s) => s.kind === 'digit');
  const orderForStagger = (slot: Slot) => {
    const sorted = [...changedDigits].sort((a, b) =>
      config.staggerFromRight ? a.order - b.order : b.order - a.order,
    );
    return sorted.findIndex((s) => s.key === slot.key);
  };

  const enterInitial = hasMounted.current ? awayState(1, sign, config) : false;

  return (
    <span role="img" aria-label={ariaLabel} className={className} style={{ ...rootStyle, ...style }}>
      {/* Two presence layers:
          Outer column — keyed by POSITION, owns the horizontal `layout="position"`
          push (position-only so proportional digits never get width-scaled).
          Inner glyph — keyed by CHARACTER, owns the vertical slide. Each column
          has its own little AnimatePresence so direction stays deterministic. */}
      <AnimatePresence mode="popLayout" initial={false}>
        {slots.map((slot) => {
          const delay = slot.kind === 'digit' ? orderForStagger(slot) * config.stagger : 0;
          return (
            <motion.span
              key={slot.key}
              layout="position"
              aria-hidden
              className={slot.ghost ? ghostClassName : undefined}
              style={colStyle}
              // The column is what AnimatePresence removes, so its own `exit` is
              // what plays on delete (exit doesn't propagate into the nested one).
              exit={awayState(-1, sign, config)}
              transition={{
                // Horizontal reflow has NO stagger delay so columns track together.
                layout: { type: 'spring', visualDuration: config.visualDuration, bounce: config.bounce },
                default: {
                  type: 'spring',
                  visualDuration: config.visualDuration,
                  bounce: config.bounce,
                  delay,
                },
                opacity: { duration: config.opacityDuration, ease: 'easeOut', delay },
                filter: { duration: config.opacityDuration, ease: 'easeOut', delay },
              }}
            >
              {/* hidden sizer gives the column its width so the absolute glyphs overlap */}
              <span style={sizerStyle}>{slot.char}</span>
              <AnimatePresence>
                <motion.span
                  key={`${slot.char}-${genFor(slot.key, slot.char)}`}
                  style={glyphStyle}
                  initial={enterInitial}
                  animate={restState}
                  exit={awayState(-1, sign, config)}
                  transition={glyphTransition(config, delay)}
                >
                  {slot.char}
                </motion.span>
              </AnimatePresence>
            </motion.span>
          );
        })}
      </AnimatePresence>
    </span>
  );
}
