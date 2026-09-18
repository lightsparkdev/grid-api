'use client';

import {
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { IconAddImage } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconAddImage';
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossMedium';
import { IconPlusSmall } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPlusSmall';
import { Tooltip } from '@/components/Tooltip/Tooltip';
import { pressable } from '@/lib/sounds';
import type { HexColor } from '@/statement/types';
import styles from './DesignControls.module.scss';

const RING_OUT = 3;

export function SwatchRow({
  label,
  active,
  children,
}: {
  label: string;
  active: string | null;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const w = useMotionValue(20);
  const h = useMotionValue(20);
  const spring = { stiffness: 620, damping: 40, mass: 0.9 };
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);
  const press = useMotionValue(0);
  const lean = useSpring(press, { stiffness: 520, damping: 32 });
  const reach = useTransform([x, sx, lean], ([target, current, offset]) => {
    const distance = (target as number) - (current as number);
    return (
      Math.sign(distance) * Math.min(6, Math.abs(distance) * 0.12) +
      (offset as number)
    );
  });
  const left = useTransform(
    [sx, reach],
    ([current, offset]) =>
      (current as number) -
      RING_OUT -
      Math.max(0, -(offset as number)),
  );
  const top = useTransform(sy, (current) => current - RING_OUT);
  const width = useTransform(
    [w, reach],
    ([base, offset]) =>
      (base as number) + RING_OUT * 2 + Math.abs(offset as number),
  );
  const height = useTransform(h, (base) => base + RING_OUT * 2);
  const [placed, setPlaced] = useState(false);

  useLayoutEffect(() => {
    const row = ref.current;
    if (!row) return;
    const place = (jump: boolean) => {
      const element = row.querySelector<HTMLElement>(
        '[aria-checked="true"], [data-active="true"]',
      );
      if (!element) return;
      const rowRect = row.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const nextX =
        elementRect.left +
        elementRect.width / 2 -
        rowRect.left -
        element.offsetWidth / 2;
      const nextY =
        elementRect.top +
        elementRect.height / 2 -
        rowRect.top -
        element.offsetHeight / 2;
      x.set(nextX);
      y.set(nextY);
      w.set(element.offsetWidth);
      h.set(element.offsetHeight);
      if (jump) {
        sx.jump(nextX);
        sy.jump(nextY);
      }
    };
    place(!placed);
    if (!placed) setPlaced(true);
    const follow = () => place(false);
    const observer = new ResizeObserver(follow);
    observer.observe(row);
    Array.from(row.children).forEach((element) => observer.observe(element));
    document.fonts?.ready.then(follow);
    window.addEventListener('resize', follow);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', follow);
    };
  }, [active, h, placed, sx, sy, w, x, y]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      return;
    }
    const options = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        '[role="radio"]:not(:disabled)',
      ),
    );
    const current = options.findIndex(
      (option) => option.getAttribute('aria-checked') === 'true',
    );
    if (current < 0) return;
    event.preventDefault();
    const direction =
      event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
    const next = options[(current + direction + options.length) % options.length];
    next.focus();
    next.click();
  };

  return (
    <div
      ref={ref}
      className={styles.swatches}
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
    >
      {children}
      {placed && active !== null ? (
        <motion.span
          className={styles.ring}
          style={{ left, top, width, height }}
          aria-hidden
        />
      ) : null}
    </div>
  );
}

export function SampleSwatches<Value extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: Value;
  options: ReadonlyArray<{ id: Value; label: string }>;
  onChange: (value: Value) => void;
}) {
  return (
    <SwatchRow label={label} active={value}>
      {options.map((option) => (
        <Tooltip key={option.id} text={option.label}>
          {(tip) => (
            <button
              type="button"
              role="radio"
              aria-checked={value === option.id}
              aria-label={option.label}
              tabIndex={value === option.id ? 0 : -1}
              className={clsx(styles.swatch, styles[`sample-${option.id}`])}
              {...tip}
              {...pressable(
                { onClick: () => onChange(option.id) },
                true,
              )}
            />
          )}
        </Tooltip>
      ))}
    </SwatchRow>
  );
}

export function ShimmerField({
  value,
  maxLength,
  placeholder,
  label,
  onChange,
}: {
  value: string;
  maxLength: number;
  placeholder: string;
  label: string;
  onChange: (value: string) => void;
}) {
  return (
    <span className={styles.shimmerField}>
      <input
        type="text"
        className={styles.nameInput}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
      />
      {!value ? (
        <span className={styles.shimmerGhost} aria-hidden>
          {placeholder}
        </span>
      ) : null}
    </span>
  );
}

export function ColorPicker({
  value,
  label,
  onChange,
}: {
  value: HexColor;
  label: string;
  onChange: (value: HexColor) => void;
}) {
  return (
    <Tooltip text={`Choose ${label.toLowerCase()}`}>
      {(tip) => (
        <label
          className={clsx(styles.swatch, styles.colorPicker)}
          style={{ background: value }}
          {...tip}
        >
          <input
            type="color"
            value={value}
            aria-label={label}
            onChange={(event) => onChange(event.target.value as HexColor)}
          />
          <IconPlusSmall size={14} aria-hidden />
        </label>
      )}
    </Tooltip>
  );
}

export function ColorSwatches({
  label,
  value,
  colors,
  onChange,
}: {
  label: string;
  value: HexColor;
  colors: readonly HexColor[];
  onChange: (value: HexColor) => void;
}) {
  const stock = colors.includes(value);
  return (
    <SwatchRow label={label} active={stock ? value : 'custom'}>
      {colors.map((color) => (
        <Tooltip key={color} text={color.toUpperCase()}>
          {(tip) => (
            <button
              type="button"
              role="radio"
              aria-checked={value === color}
              aria-label={`${label} ${color}`}
              tabIndex={value === color ? 0 : -1}
              className={styles.swatch}
              style={{ background: color }}
              {...tip}
              {...pressable({ onClick: () => onChange(color) }, true)}
            />
          )}
        </Tooltip>
      ))}
      <ColorPicker value={value} label={label} onChange={onChange} />
    </SwatchRow>
  );
}

export function UploadRow({
  url,
  accept,
  label,
  hint,
  onPick,
  onClear,
}: {
  url: string | null;
  accept: string;
  label: string;
  hint: string;
  onPick: (file: File | undefined) => void;
  onClear: () => void;
}) {
  const uploadButton = useRef<HTMLButtonElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const onPicked = (event: ChangeEvent<HTMLInputElement>) => {
    onPick(event.target.files?.[0]);
    event.target.value = '';
  };

  return (
    <Tooltip text={hint}>
      {(tip) => (
        <div
          className={clsx(styles.uploadRow, !url && styles.uploadRowPick)}
          onClick={url ? undefined : () => fileInput.current?.click()}
          onMouseEnter={
            url
              ? undefined
              : (event) =>
                  tip.onMouseEnter({
                    ...event,
                    currentTarget: uploadButton.current ?? event.currentTarget,
                  })
          }
          onMouseLeave={url ? undefined : tip.onMouseLeave}
        >
          <div className={styles.logoRow}>
            <AnimatePresence mode="popLayout" initial={false}>
              {url ? (
                <motion.div
                  key="picked"
                  className={styles.logoPicked}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                >
                  <span className={styles.logoPreview}>
                    <img src={url} alt="" />
                  </span>
                  <Tooltip text="Remove">
                    {(removeTip) => (
                      <button
                        type="button"
                        className={styles.logoClear}
                        aria-label="Remove logo"
                        {...removeTip}
                        {...pressable({ onClick: onClear })}
                      >
                        <IconCrossMedium size={16} aria-hidden />
                      </button>
                    )}
                  </Tooltip>
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  className={styles.logoPicked}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                >
                  <button
                    ref={uploadButton}
                    type="button"
                    className={styles.logoUpload}
                  >
                    <IconAddImage size={16} aria-hidden />
                    {label}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <input
              ref={fileInput}
              type="file"
              accept={accept}
              className={styles.fileInput}
              onChange={onPicked}
              tabIndex={-1}
            />
          </div>
        </div>
      )}
    </Tooltip>
  );
}

