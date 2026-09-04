'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import { motion } from 'motion/react';
import { motionTransition } from '@/lib/easing';
import { IconEyedropper } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconEyedropper';
import { IconArrowLeftRight } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowLeftRight';
import { IconArrowRotateClockwise } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowRotateClockwise';
import { IconMinusSmall } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconMinusSmall';
import { IconPlusSmall } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPlusSmall';
import {
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverRoot,
  PopoverTrigger,
} from '@lightsparkdev/origin/popover';
import { FIGMA_CARD_W, FIGMA_FACE_H } from '@/apps/card/cardMetrics';
import { gradientCss, type CardGradient, type GradientStop } from '@/data/design';
import { Tooltip } from '@/components/Tooltip/Tooltip';
import { setGradientEditing } from './gradientEditing';
import styles from './ColorPicker.module.scss';

/* ── Color math ───────────────────────────────────────────────────────────── */

interface Hsv {
  /** 0..360 */
  h: number;
  /** 0..1 */
  s: number;
  /** 0..1 */
  v: number;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let s = m[1];
  if (s.length === 3) s = s.replace(/./g, (c) => c + c);
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
}

function rgbToHsv(r: number, g: number, b: number): Hsv {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const d = max - min;
  let h = 0;
  if (d > 0) {
    if (max === R) h = 60 * (((G - B) / d) % 6);
    else if (max === G) h = 60 * ((B - R) / d + 2);
    else h = 60 * ((R - G) / d + 4);
  }
  if (h < 0) h += 360;
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

function hsvToRgb({ h, s, v }: Hsv): [number, number, number] {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  const k = Math.floor(h / 60) % 6;
  const [r, g, b] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ][k];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

export function hsvToHex(hsv: Hsv): string {
  return rgbToHex(...hsvToRgb(hsv));
}

function hexToHsv(hex: string): Hsv | null {
  const rgb = hexToRgb(hex);
  return rgb && rgbToHsv(...rgb);
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** The gradient's color at `at`, by its stops. */
function colorAt(stops: GradientStop[], at: number): string {
  const s = [...stops].sort((a, b) => a.at - b.at);
  if (at <= s[0].at) return s[0].color;
  if (at >= s[s.length - 1].at) return s[s.length - 1].color;
  for (let i = 1; i < s.length; i++) {
    if (at <= s[i].at) {
      const a = hexToRgb(s[i - 1].color)!;
      const b = hexToRgb(s[i].color)!;
      const t = (at - s[i - 1].at) / Math.max(1e-6, s[i].at - s[i - 1].at);
      return rgbToHex(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
    }
  }
  return s[s.length - 1].color;
}

/** A first gradient from a solid: the color, then a lighter or darker
 *  version of it, top to bottom, as Figma's default fill. */
function gradientFrom(color: string, type: CardGradient['type']): CardGradient {
  const hsv = hexToHsv(color) ?? { h: 0, s: 0, v: 0.5 };
  const second = hsvToHex({ ...hsv, v: clamp01(hsv.v < 0.5 ? hsv.v + 0.35 : hsv.v - 0.35) });
  return {
    type,
    stops: [
      { at: 0, color },
      { at: 1, color: second },
    ],
    from: { x: FIGMA_CARD_W / 2, y: 0 },
    to: { x: FIGMA_CARD_W / 2, y: FIGMA_FACE_H },
  };
}

/**
 * Solid / Linear / Radial, full bleed across the popup's top, in the code
 * block's Request / Response idiom: a rule under the row, and the active tab
 * an indicator that slides between them, walled by hairlines on either side
 * and open at the bottom into the content.
 */
function ModeTabs({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const group = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  useEffect(() => {
    const g = group.current;
    if (!g) return;
    const place = () => {
      const el = g.querySelector<HTMLElement>('[aria-selected="true"]');
      if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(g);
    return () => ro.disconnect();
  }, [mode]);
  return (
    <div ref={group} className={clsx(styles.modes, mode === 'solid' && styles.modesLeadingOn)} role="tablist" aria-label="Fill">
      <motion.span className={styles.modeIndicator} aria-hidden initial={false} animate={indicator} transition={motionTransition()} />
      {MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          role="tab"
          aria-selected={mode === m.id}
          className={clsx(styles.mode, mode === m.id && styles.modeOn)}
          onClick={() => onChange(m.id)}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

/**
 * A box whose height follows its content with a spring, so the popup's
 * growth (the stops appearing) is a motion, not a cut. Clips vertically
 * only, with 8px of slack for the thumbs that reach past the field.
 */
function AnimatedHeight({ className, children }: { className?: string; children: ReactNode }) {
  const inner = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | 'auto'>('auto');
  useEffect(() => {
    const el = inner.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <motion.div
      className={className}
      initial={false}
      animate={{ height }}
      transition={{ type: 'spring', stiffness: 520, damping: 42, mass: 0.8 }}
    >
      <div ref={inner} className={styles.bodyInner}>
        {children}
      </div>
    </motion.div>
  );
}

/* ── Picker ───────────────────────────────────────────────────────────────── */

type Mode = 'solid' | 'linear' | 'radial';
const MODES: Array<{ id: Mode; label: string }> = [
  { id: 'solid', label: 'Solid' },
  { id: 'linear', label: 'Linear' },
  { id: 'radial', label: 'Radial' },
];

interface ColorPickerProps {
  /** The current color, #rrggbb: the solid, or the gradient's first stop. */
  value: string;
  gradient: CardGradient | null;
  onChange: (color: string, gradient: CardGradient | null) => void;
  /** The trigger; rendered as the popover's anchor. */
  children: ReactNode;
  triggerClassName?: string;
  triggerActive?: boolean;
  triggerLabel: string;
  /** Tooltip over the trigger (hidden while the picker is open). */
  tooltip: string;
}

/**
 * A color picker in Origin's idiom: its popover, tokens, and input, with a
 * saturation/value field, a hue bar, a hex field, and an eyedropper where
 * the platform has one. Solid, or a gradient as Figma's fill: a bar of
 * stops to drag, add (click the bar) and remove, flip and turn, with the
 * field editing the selected stop; while the gradient tab is open the stage
 * shows the gradient's two handles on the card to position it. Hue and
 * saturation are kept locally so they survive the value being dragged to
 * black or white, where a hex can't hold them.
 */
export function ColorPicker({
  value,
  gradient,
  onChange,
  children,
  triggerClassName,
  triggerActive,
  triggerLabel,
  tooltip,
}: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [stop, setStop] = useState(0);
  const mode: Mode = gradient ? gradient.type : 'solid';
  const sel = gradient ? Math.min(stop, gradient.stops.length - 1) : 0;
  const edited = gradient ? gradient.stops[sel].color : value;

  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(edited) ?? { h: 0, s: 0, v: 0 });
  const [hexText, setHexText] = useState(edited);
  const lastEmitted = useRef(edited);

  // Follow the edited color when something else set it (a swatch, a preset,
  // another stop selected).
  useEffect(() => {
    if (edited === lastEmitted.current) return;
    lastEmitted.current = edited;
    const next = hexToHsv(edited);
    if (next) setHsv(next);
    setHexText(edited);
  }, [edited]);

  // The stage shows the handles while the gradient tab is open.
  useEffect(() => {
    setGradientEditing(open && gradient !== null);
  }, [open, gradient]);
  useEffect(() => () => setGradientEditing(false), []);

  const emit = (color: string, g: CardGradient | null) => onChange(g ? g.stops[0].color : color, g);
  const setGradient = (g: CardGradient) => emit(g.stops[0].color, g);

  const commit = (next: Hsv) => {
    setHsv(next);
    const hex = hsvToHex(next);
    setHexText(hex);
    if (hex === lastEmitted.current) return;
    lastEmitted.current = hex;
    if (gradient) {
      setGradient({ ...gradient, stops: gradient.stops.map((s, i) => (i === sel ? { ...s, color: hex } : s)) });
    } else {
      emit(hex, null);
    }
  };

  const setMode = (m: Mode) => {
    if (m === mode) return;
    if (m === 'solid') {
      emit(gradient!.stops[0].color, null);
      return;
    }
    if (gradient) setGradient({ ...gradient, type: m });
    else {
      setStop(0);
      setGradient(gradientFrom(value, m));
    }
  };

  // Drag on the field or the bar: capture the pointer so the drag can leave.
  const dragTo = (el: HTMLElement, e: PointerEvent, what: 'field' | 'hue') => {
    const r = el.getBoundingClientRect();
    const fx = clamp01((e.clientX - r.left) / r.width);
    if (what === 'hue') {
      commit({ ...hsv, h: fx * 360 });
    } else {
      const fy = clamp01((e.clientY - r.top) / r.height);
      commit({ ...hsv, s: fx, v: 1 - fy });
    }
  };
  const dragHandlers = (what: 'field' | 'hue') => ({
    onPointerDown: (e: PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.focus();
      dragTo(e.currentTarget, e, what);
    },
    onPointerMove: (e: PointerEvent<HTMLDivElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) dragTo(e.currentTarget, e, what);
    },
  });

  const onFieldKey = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 0.1 : 0.01;
    const d: Record<string, Partial<Hsv>> = {
      ArrowLeft: { s: clamp01(hsv.s - step) },
      ArrowRight: { s: clamp01(hsv.s + step) },
      ArrowUp: { v: clamp01(hsv.v + step) },
      ArrowDown: { v: clamp01(hsv.v - step) },
    };
    if (!d[e.key]) return;
    e.preventDefault();
    commit({ ...hsv, ...d[e.key] });
  };
  const onHueKey = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 1;
    const d: Record<string, number> = { ArrowLeft: -step, ArrowDown: -step, ArrowRight: step, ArrowUp: step };
    if (!d[e.key]) return;
    e.preventDefault();
    commit({ ...hsv, h: (hsv.h + d[e.key] + 360) % 360 });
  };

  const applyHex = () => {
    const next = hexToHsv(hexText);
    if (next) commit(next);
    else setHexText(hsvToHex(hsv));
  };

  // ── The stops bar ──────────────────────────────────────────────────────────
  const barDrag = useRef<{ id: number; index: number } | null>(null);
  const atFrom = (el: HTMLElement, clientX: number) => {
    const r = el.getBoundingClientRect();
    return clamp01((clientX - r.left) / r.width);
  };
  const onBarDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!gradient || e.button !== 0) return;
    e.preventDefault();
    const handle = (e.target as HTMLElement).closest<HTMLElement>('[data-stop]');
    let index: number;
    if (handle) {
      index = Number(handle.dataset.stop);
    } else {
      // Add a stop where the bar was pressed, in the gradient's own color there.
      const at = atFrom(e.currentTarget, e.clientX);
      index = gradient.stops.length;
      setGradient({ ...gradient, stops: [...gradient.stops, { at, color: colorAt(gradient.stops, at) }] });
    }
    setStop(index);
    barDrag.current = { id: e.pointerId, index };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onBarMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = barDrag.current;
    if (!d || !gradient || e.pointerId !== d.id) return;
    const at = atFrom(e.currentTarget, e.clientX);
    setGradient({ ...gradient, stops: gradient.stops.map((s, i) => (i === d.index ? { ...s, at } : s)) });
  };
  const onBarUp = () => {
    barDrag.current = null;
  };
  const removeStop = (index: number) => {
    if (!gradient || gradient.stops.length <= 2) return;
    setGradient({ ...gradient, stops: gradient.stops.filter((_, i) => i !== index) });
    setStop(Math.max(0, Math.min(index, gradient.stops.length - 2)));
  };
  const onBarKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!gradient) return;
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      removeStop(sel);
      return;
    }
    const step = e.shiftKey ? 0.1 : 0.01;
    const d = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
    if (!d) return;
    e.preventDefault();
    setGradient({ ...gradient, stops: gradient.stops.map((s, i) => (i === sel ? { ...s, at: clamp01(s.at + d) } : s)) });
  };
  const setStopAt = (index: number, pct: string) => {
    if (!gradient) return;
    const n = Number(pct);
    if (!Number.isFinite(n)) return;
    setGradient({ ...gradient, stops: gradient.stops.map((s, i) => (i === index ? { ...s, at: clamp01(n / 100) } : s)) });
  };
  const flip = () => {
    if (!gradient) return;
    setGradient({ ...gradient, stops: gradient.stops.map((s) => ({ ...s, at: 1 - s.at })) });
  };
  const turn = () => {
    if (!gradient) return;
    // A quarter turn about the line's midpoint.
    const c = { x: (gradient.from.x + gradient.to.x) / 2, y: (gradient.from.y + gradient.to.y) / 2 };
    const rot = (p: { x: number; y: number }) => ({ x: c.x - (p.y - c.y), y: c.y + (p.x - c.x) });
    setGradient({ ...gradient, from: rot(gradient.from), to: rot(gradient.to) });
  };
  const addStop = () => {
    if (!gradient) return;
    // Midway between the selected stop and its neighbor to the right (or left at the end).
    const sorted = [...gradient.stops].map((s, i) => ({ ...s, i })).sort((a, b) => a.at - b.at);
    const k = sorted.findIndex((s) => s.i === sel);
    const next = sorted[k + 1] ?? sorted[k - 1];
    const at = next ? (sorted[k].at + next.at) / 2 : clamp01(sorted[k].at + 0.25);
    setGradient({ ...gradient, stops: [...gradient.stops, { at, color: colorAt(gradient.stops, at) }] });
    setStop(gradient.stops.length);
  };

  const hueHex = hsvToHex({ h: hsv.h, s: 1, v: 1 });
  const current = hsvToHex(hsv);
  const canDrop = typeof window !== 'undefined' && 'EyeDropper' in window;
  const pickFromScreen = async () => {
    try {
      const Dropper = (window as unknown as { EyeDropper: new () => { open(): Promise<{ sRGBHex: string }> } }).EyeDropper;
      const { sRGBHex } = await new Dropper().open();
      const next = hexToHsv(sRGBHex);
      if (next) commit(next);
    } catch {
      // Cancelled.
    }
  };

  const triggerStyle: CSSProperties | undefined = triggerActive
    ? { background: gradient ? gradientCss(gradient, '135deg') : value }
    : undefined;
  const sortedStops = gradient ? gradient.stops.map((s, i) => ({ ...s, i })).sort((a, b) => a.at - b.at) : [];

  // With a gradient up, a press on the card (its handles, or the card under
  // a handle drag, which captures the pointer) is part of editing the
  // gradient, not a click away from the picker.
  const onOpenChange = (next: boolean, details: { reason: string; event: Event; cancel: () => void }) => {
    if (!next && gradient && details.reason === 'outside-press') {
      const t = details.event.target as Element | null;
      if (t?.closest?.('[data-grad], [data-card-hit]')) {
        details.cancel();
        return;
      }
    }
    setOpen(next);
  };

  return (
    <PopoverRoot open={open} onOpenChange={onOpenChange}>
      <Tooltip text={tooltip}>
        {(tip) => (
          <PopoverTrigger
            className={triggerClassName}
            data-active={triggerActive || undefined}
            aria-label={triggerLabel}
            style={triggerStyle}
            {...(open ? {} : tip)}
            onClick={tip.onMouseLeave}
          >
            {children}
          </PopoverTrigger>
        )}
      </Tooltip>
      <PopoverPortal>
        {/* Below the swatch, where there is room for the gradient's stops to
            grow downward from the anchored top edge; the rows it covers are
            not needed while a color is picked. */}
        <PopoverPositioner side="bottom" align="end" sideOffset={8}>
          <PopoverPopup className={styles.popup} aria-label="Custom color">
            <AnimatedHeight className={styles.body}>
              <ModeTabs mode={mode} onChange={setMode} />

              {gradient && (
                <div className={styles.gradientBlock}>
                  <div
                    className={styles.stopsBar}
                    style={{ background: gradientCss(gradient) }}
                    role="slider"
                    tabIndex={0}
                    aria-label="Gradient stops"
                    aria-valuenow={Math.round(gradient.stops[sel].at * 100)}
                    aria-valuetext={`Stop ${sel + 1} at ${Math.round(gradient.stops[sel].at * 100)}%`}
                    onPointerDown={onBarDown}
                    onPointerMove={onBarMove}
                    onPointerUp={onBarUp}
                    onPointerCancel={onBarUp}
                    onKeyDown={onBarKey}
                  >
                    {gradient.stops.map((s, i) => (
                      <span
                        key={i}
                        data-stop={i}
                        className={clsx(styles.stopHandle, i === sel && styles.stopHandleOn)}
                        style={{ left: `${s.at * 100}%`, background: s.color }}
                      />
                    ))}
                  </div>
                  <div className={styles.stopsHead}>
                    <span>Stops</span>
                    <span className={styles.stopsTools}>
                      <Tooltip text="Flip">
                        {(tip) => (
                          <button type="button" className={styles.tool} onClick={flip} aria-label="Flip gradient" {...tip}>
                            <IconArrowLeftRight size={16} aria-hidden />
                          </button>
                        )}
                      </Tooltip>
                      <Tooltip text="Turn 90°">
                        {(tip) => (
                          <button type="button" className={styles.tool} onClick={turn} aria-label="Turn gradient 90 degrees" {...tip}>
                            <IconArrowRotateClockwise size={16} aria-hidden />
                          </button>
                        )}
                      </Tooltip>
                      <Tooltip text="Add stop">
                        {(tip) => (
                          <button type="button" className={styles.tool} onClick={addStop} aria-label="Add stop" {...tip}>
                            <IconPlusSmall size={16} aria-hidden />
                          </button>
                        )}
                      </Tooltip>
                    </span>
                  </div>
                  <div className={styles.stops}>
                    {sortedStops.map((s) => (
                      <div
                        key={s.i}
                        className={clsx(styles.stopRow, s.i === sel && styles.stopRowOn)}
                        onPointerDown={() => setStop(s.i)}
                      >
                        <label className={styles.stopAt}>
                          <input
                            value={Math.round(s.at * 100)}
                            inputMode="numeric"
                            aria-label={`Stop ${s.i + 1} position`}
                            onFocus={() => setStop(s.i)}
                            onChange={(e) => setStopAt(s.i, e.target.value)}
                          />
                          <span aria-hidden>%</span>
                        </label>
                        <span className={styles.stopColor}>
                          <span className={styles.stopSwatch} style={{ background: s.color }} aria-hidden />
                          <span className={styles.stopHex}>{s.color.slice(1).toUpperCase()}</span>
                        </span>
                        <button
                          type="button"
                          className={styles.stopRemove}
                          disabled={gradient.stops.length <= 2}
                          aria-label={`Remove stop ${s.i + 1}`}
                          onClick={() => removeStop(s.i)}
                        >
                          <IconMinusSmall size={16} aria-hidden />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div
                className={styles.field}
                style={{ '--hue': hueHex } as CSSProperties}
                role="slider"
                tabIndex={0}
                aria-label="Saturation and brightness"
                aria-valuetext={`Saturation ${Math.round(hsv.s * 100)}%, brightness ${Math.round(hsv.v * 100)}%`}
                aria-valuenow={Math.round(hsv.v * 100)}
                onKeyDown={onFieldKey}
                {...dragHandlers('field')}
              >
                <span
                  className={styles.thumb}
                  style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: current }}
                />
              </div>
              <div
                className={styles.hue}
                role="slider"
                tabIndex={0}
                aria-label="Hue"
                aria-valuemin={0}
                aria-valuemax={360}
                aria-valuenow={Math.round(hsv.h)}
                onKeyDown={onHueKey}
                {...dragHandlers('hue')}
              >
                <span className={styles.thumb} style={{ left: `${(hsv.h / 360) * 100}%`, background: hueHex }} />
              </div>
              <div className={styles.row}>
                <span className={styles.preview} style={{ background: current }} aria-hidden />
                <input
                  className={styles.hex}
                  value={hexText}
                  spellCheck={false}
                  autoComplete="off"
                  aria-label="Hex color"
                  onChange={(e) => setHexText(e.target.value)}
                  onBlur={applyHex}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') applyHex();
                  }}
                />
                {canDrop && (
                  <button type="button" className={styles.tool} onClick={pickFromScreen} aria-label="Pick from screen">
                    <IconEyedropper size={16} aria-hidden />
                  </button>
                )}
              </div>
            </AnimatedHeight>
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </PopoverRoot>
  );
}
