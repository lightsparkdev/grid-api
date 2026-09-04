'use client';

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { IconEyedropper } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconEyedropper';
import {
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverRoot,
  PopoverTrigger,
} from '@lightsparkdev/origin/popover';
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

/* ── Picker ───────────────────────────────────────────────────────────────── */

interface ColorPickerProps {
  /** The current color, #rrggbb. */
  value: string;
  onChange: (hex: string) => void;
  /** The trigger; rendered as the popover's anchor. */
  children: ReactNode;
  triggerClassName?: string;
  triggerActive?: boolean;
  triggerLabel: string;
}

/**
 * A color picker in Origin's idiom: its popover, tokens, and input, with a
 * saturation/value field, a hue bar, a hex field, and an eyedropper where
 * the platform has one. Hue and saturation are kept locally so they survive
 * the value being dragged to black or white, where a hex can't hold them.
 */
export function ColorPicker({ value, onChange, children, triggerClassName, triggerActive, triggerLabel }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(value) ?? { h: 0, s: 0, v: 0 });
  const [hexText, setHexText] = useState(value);
  const lastEmitted = useRef(value);

  // Follow the value when something else set it (a swatch, a preset).
  useEffect(() => {
    if (value === lastEmitted.current) return;
    lastEmitted.current = value;
    const next = hexToHsv(value);
    if (next) setHsv(next);
    setHexText(value);
  }, [value]);

  const commit = (next: Hsv) => {
    setHsv(next);
    const hex = hsvToHex(next);
    setHexText(hex);
    if (hex !== lastEmitted.current) {
      lastEmitted.current = hex;
      onChange(hex);
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

  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={triggerClassName}
        data-active={triggerActive || undefined}
        aria-label={triggerLabel}
        style={triggerActive ? { background: value } : undefined}
      >
        {children}
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverPositioner side="top" align="end" sideOffset={8}>
          <PopoverPopup className={styles.popup} aria-label="Custom color">
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
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </PopoverRoot>
  );
}
