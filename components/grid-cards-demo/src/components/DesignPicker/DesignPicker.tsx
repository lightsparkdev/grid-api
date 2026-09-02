'use client';

import clsx from 'clsx';
import { useEffect, useRef, type ChangeEvent } from 'react';
import { IconCrossSmall } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossSmall';
import { IconArrowUpSquare } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowUpSquare';
import { DESIGN_SWATCHES, FINISHES, type CardDesign, type CardFinish } from '@/data/design';
import styles from './DesignPicker.module.scss';

interface DesignPickerProps {
  design: CardDesign;
  onChange: (patch: Partial<CardDesign>) => void;
  /** The active skin has its own art direction — show the controls muted and
   *  inert so the section still reads as "this is where design lives". */
  locked?: boolean;
}

const MAX_NAME = 18;

function swatchStyle(color: string, colorEnd?: string) {
  return {
    background: colorEnd
      ? `linear-gradient(135deg, ${color} 0%, ${colorEnd} 100%)`
      : color,
  };
}

export function DesignPicker({ design, onChange, locked = false }: DesignPickerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const objectUrl = useRef<string | null>(null);

  // Revoke the previous upload's object URL when it's replaced or on unmount.
  useEffect(() => {
    return () => {
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    };
  }, []);

  const onLogoPicked = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    const url = URL.createObjectURL(file);
    objectUrl.current = url;
    onChange({ logoUrl: url });
    e.target.value = '';
  };

  const clearLogo = () => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = null;
    onChange({ logoUrl: null });
  };

  const activeSwatch = DESIGN_SWATCHES.find(
    (s) => s.color === design.color && (s.colorEnd ?? s.color) === (design.colorEnd ?? design.color),
  );

  return (
    <div className={clsx(styles.group, locked && styles.locked)} aria-disabled={locked || undefined}>
      <div className={styles.row}>
        <span className={styles.rowLabel}>Name</span>
        <input
          type="text"
          className={styles.nameInput}
          value={design.programName}
          maxLength={MAX_NAME}
          disabled={locked}
          placeholder="Your brand"
          aria-label="Program name"
          onChange={(e) => onChange({ programName: e.target.value })}
        />
      </div>

      <div className={styles.row}>
        <span className={styles.rowLabel}>Color</span>
        <div className={styles.swatches} role="radiogroup" aria-label="Card color">
          {DESIGN_SWATCHES.map((s) => (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={activeSwatch?.id === s.id}
              aria-label={s.label}
              title={s.label}
              disabled={locked}
              className={clsx(styles.swatch, activeSwatch?.id === s.id && styles.swatchActive)}
              style={swatchStyle(s.color, s.colorEnd)}
              onClick={() => onChange({ color: s.color, colorEnd: s.colorEnd })}
            />
          ))}
          <label
            className={clsx(styles.swatch, styles.swatchCustom, !activeSwatch && styles.swatchActive)}
            title="Custom color"
            style={!activeSwatch ? swatchStyle(design.color, design.colorEnd) : undefined}
          >
            <input
              type="color"
              className={styles.colorInput}
              value={design.color}
              disabled={locked}
              aria-label="Custom color"
              onChange={(e) => onChange({ color: e.target.value, colorEnd: undefined })}
            />
            {activeSwatch ? <span aria-hidden>+</span> : null}
          </label>
        </div>
      </div>

      <div className={styles.row}>
        <span className={styles.rowLabel}>Finish</span>
        <div className={styles.segments} role="radiogroup" aria-label="Card finish">
          {FINISHES.map((f) => (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={design.finish === f.id}
              disabled={locked}
              className={clsx(styles.segment, design.finish === f.id && styles.segmentActive)}
              onClick={() => onChange({ finish: f.id as CardFinish })}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.row}>
        <span className={styles.rowLabel}>Logo</span>
        <div className={styles.logoRow}>
          {design.logoUrl ? (
            <>
              <span className={styles.logoPreview} style={swatchStyle(design.color, design.colorEnd)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={design.logoUrl} alt="" />
              </span>
              <button type="button" className={styles.logoClear} disabled={locked} onClick={clearLogo}>
                <IconCrossSmall size={14} />
                Remove
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles.logoUpload}
              disabled={locked}
              onClick={() => fileRef.current?.click()}
            >
              <IconArrowUpSquare size={16} />
              Upload SVG or PNG
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/svg+xml,image/png,image/webp"
            className={styles.fileInput}
            onChange={onLogoPicked}
            tabIndex={-1}
          />
        </div>
      </div>
    </div>
  );
}
