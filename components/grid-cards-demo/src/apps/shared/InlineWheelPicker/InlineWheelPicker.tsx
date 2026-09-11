'use client';

import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'motion/react';
import { easeOutSnappy, motionTransition } from '@/lib/easing';
import styles from './InlineWheelPicker.module.scss';

/** Row pitch and the window's height (Apple Cash's Auto Reload picker: five
 *  and a half rows, the chosen one centered in a highlight). */
export const WHEEL_ITEM_H = 38;
export const WHEEL_H = 208;
/** The drum's radius: rows sit on a cylinder seen from the side, so a row
 *  `d` steps from the center is at angle d·(pitch / R), placed at R·sin and
 *  squashed to cos. UIPickerView's drum is about this deep for its window. */
const WHEEL_R = 118;
/** Pointer travel under this is a tap, not a drag. */
const TAP_SLOP = 4;
/** A fling carries this far past the release (rows per row/s). */
const FLING_LOOKAHEAD = 0.12;
/** The wheel snaps this long after the last wheel event. */
const WHEEL_SETTLE_MS = 110;
/** Open and close as one motion with the row above. */
const OPEN = motionTransition(easeOutSnappy, 0.4);
/** The drum settles onto a row. */
const SNAP = { type: 'spring' as const, stiffness: 380, damping: 34, mass: 0.8 };

export interface WheelOption<T> {
  value: T;
  label: string;
}

interface InlineWheelPickerProps<T> {
  options: WheelOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Expanded under its row; collapsed to nothing otherwise. */
  open: boolean;
  'aria-label': string;
}

/**
 * iOS's inline wheel picker, as a row's disclosure: a drum of options with
 * the chosen one centered in a rounded highlight, its neighbors smaller and
 * fainter as they recede. Drag or scroll to turn it, tap a row to pick it.
 * The whole thing grows open under its row and closes again, so a group of
 * rows reflows as one motion when another row opens.
 */
export function InlineWheelPicker<T>({ options, value, onChange, open, 'aria-label': ariaLabel }: InlineWheelPickerProps<T>) {
  const reduceMotion = useReducedMotion();
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  // Where the drum is, in rows (fractional while turning).
  const pos = useMotionValue(index);
  const drag = useRef<{ id: number; y0: number; pos0: number; moved: boolean; lastY: number; lastT: number; v: number } | null>(null);
  const wheelTimer = useRef(0);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const clampIndex = (i: number) => Math.max(0, Math.min(optionsRef.current.length - 1, i));

  /** Turn to a row and report it. */
  const settleTo = (i: number) => {
    const to = clampIndex(Math.round(i));
    animate(pos, to, reduceMotion ? { duration: 0 } : SNAP);
    const next = optionsRef.current[to];
    if (next && next.value !== value) onChangeRef.current(next.value);
  };

  // The value changed from outside (a scripted pick, a reset): turn to it.
  useEffect(() => {
    if (drag.current) return;
    if (Math.abs(pos.get() - index) > 0.001) animate(pos, index, reduceMotion ? { duration: 0 } : SNAP);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => () => window.clearTimeout(wheelTimer.current), []);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pos.stop();
    drag.current = { id: e.pointerId, y0: e.clientY, pos0: pos.get(), moved: false, lastY: e.clientY, lastT: e.timeStamp, v: 0 };
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    const dy = e.clientY - d.y0;
    if (Math.abs(dy) > TAP_SLOP) d.moved = true;
    if (!d.moved) return;
    const dt = Math.max(1, e.timeStamp - d.lastT);
    // Rows per second, smoothed; dragging down turns the drum up.
    d.v = d.v * 0.6 + (-(e.clientY - d.lastY) / WHEEL_ITEM_H / dt) * 1000 * 0.4;
    d.lastY = e.clientY;
    d.lastT = e.timeStamp;
    pos.set(clampIndex(d.pos0 - dy / WHEEL_ITEM_H));
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    drag.current = null;
    if (d.moved) {
      settleTo(pos.get() + d.v * FLING_LOOKAHEAD);
      return;
    }
    // A tap: the row under the pointer.
    const rect = e.currentTarget.getBoundingClientRect();
    const rowOffset = (e.clientY - rect.top - WHEEL_H / 2) / WHEEL_ITEM_H;
    settleTo(pos.get() + rowOffset);
  };
  const onWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    pos.stop();
    pos.set(clampIndex(pos.get() + e.deltaY / WHEEL_ITEM_H));
    window.clearTimeout(wheelTimer.current);
    wheelTimer.current = window.setTimeout(() => settleTo(pos.get()), WHEEL_SETTLE_MS);
  };

  return (
    <motion.div
      className={styles.disclosure}
      initial={false}
      animate={{ height: open ? WHEEL_H : 0, opacity: open ? 1 : 0 }}
      transition={reduceMotion ? { duration: 0 } : OPEN}
      aria-hidden={!open}
    >
      <div
        className={styles.wheel}
        role="listbox"
        aria-label={ariaLabel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <span className={styles.highlight} aria-hidden />
        {options.map((o, i) => (
          <WheelRow key={String(o.value)} index={i} pos={pos} label={o.label} selected={i === index} />
        ))}
      </div>
    </motion.div>
  );
}

/** One row of the drum, placed off the drum's position each frame: on the
 *  cylinder, so it rises by the sine of its angle and squashes to the cosine
 *  (a flat projection, the way UIPickerView draws it), and grays as it turns
 *  away. Past a quarter turn it is on the far side, and hidden. */
function WheelRow({ index, pos, label, selected }: { index: number; pos: MotionValue<number>; label: string; selected: boolean }) {
  const angle = useTransform(pos, (p) => ((index - p) * WHEEL_ITEM_H) / WHEEL_R);
  const y = useTransform(angle, (a) => WHEEL_R * Math.sin(Math.max(-Math.PI / 2, Math.min(Math.PI / 2, a))));
  const scaleY = useTransform(angle, (a) => Math.max(0, Math.cos(a)));
  const opacity = useTransform(angle, (a) => (Math.abs(a) >= Math.PI / 2 ? 0 : 1));
  const color = useTransform(angle, (a) =>
    Math.abs(a) < 0.12 ? 'var(--ios-label-primary)' : 'var(--ios-label-tertiary)',
  );
  return (
    <motion.span
      className={styles.row}
      role="option"
      aria-selected={selected}
      style={{ y, scaleY, opacity, color }}
    >
      {label}
    </motion.span>
  );
}
