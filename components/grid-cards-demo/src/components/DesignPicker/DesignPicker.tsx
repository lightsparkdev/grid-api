'use client';

import clsx from 'clsx';
import { useEffect, useRef, type ChangeEvent, type CSSProperties } from 'react';
import { IconCrossSmall } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossSmall';
import { IconPlusSmall } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPlusSmall';
import { IconArrowUpSquare } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowUpSquare';
import { DESIGN_SWATCHES, FINISHES, MATERIALS, type CardDesign } from '@/data/design';
import styles from './DesignPicker.module.scss';

interface DesignPickerProps {
  design: CardDesign;
  onChange: (patch: Partial<CardDesign>) => void;
}

const MAX_NAME = 18;

function swatchStyle(color: string, colorEnd?: string) {
  return {
    background: colorEnd
      ? `linear-gradient(135deg, ${color} 0%, ${colorEnd} 100%)`
      : color,
  };
}

/** One image upload: a preview with Remove once picked, an Upload button until then. */
function UploadRow({
  url,
  accept,
  label,
  previewStyle,
  onPick,
}: {
  url: string | null;
  accept: string;
  label: string;
  previewStyle?: CSSProperties;
  onPick: (url: string | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const objectUrl = useRef<string | null>(null);

  // Revoke the previous upload's object URL when it's replaced or on unmount.
  useEffect(() => {
    return () => {
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    };
  }, []);

  const onPicked = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    const next = URL.createObjectURL(file);
    objectUrl.current = next;
    onPick(next);
    e.target.value = '';
  };

  const clear = () => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = null;
    onPick(null);
  };

  return (
    <div className={styles.logoRow}>
      {url ? (
        <>
          <span className={styles.logoPreview} style={previewStyle}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" />
          </span>
          <button type="button" className={styles.logoClear} onClick={clear}>
            <IconCrossSmall size={16} aria-hidden />
            Remove
          </button>
        </>
      ) : (
        <button type="button" className={styles.logoUpload} onClick={() => fileRef.current?.click()}>
          <IconArrowUpSquare size={16} aria-hidden />
          {label}
        </button>
      )}
      <input ref={fileRef} type="file" accept={accept} className={styles.fileInput} onChange={onPicked} tabIndex={-1} />
    </div>
  );
}

export function DesignPicker({ design, onChange }: DesignPickerProps) {
  // Bare metal ("Natural") is only a choice for a metal card.
  const swatches = DESIGN_SWATCHES.filter((s) => !s.materials || s.materials.includes(design.material));
  const activeSwatch = swatches.find(
    (s) => s.color === design.color && (s.colorEnd ?? s.color) === (design.colorEnd ?? design.color),
  );

  return (
    <div className={styles.group}>
      <div className={styles.row}>
        <span className={styles.rowLabel}>Name</span>
        <input
          type="text"
          className={styles.nameInput}
          value={design.programName}
          maxLength={MAX_NAME}
          placeholder="Your brand"
          aria-label="Program name"
          onChange={(e) => onChange({ programName: e.target.value })}
        />
      </div>

      <div className={styles.row}>
        <span className={styles.rowLabel}>Material</span>
        <div className={styles.segments} role="radiogroup" aria-label="Card material">
          {MATERIALS.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={design.material === m.id}
              className={clsx(styles.segment, design.material === m.id && styles.segmentActive)}
              onClick={() => onChange({ material: m.id })}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.row}>
        <span className={styles.rowLabel}>Color</span>
        <div className={styles.swatches} role="radiogroup" aria-label="Card color">
          {swatches.map((s) => (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={activeSwatch?.id === s.id}
              aria-label={s.label}
              title={s.label}
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
              aria-label="Custom color"
              onChange={(e) => onChange({ color: e.target.value, colorEnd: undefined })}
            />
            {activeSwatch ? <IconPlusSmall size={16} aria-hidden /> : null}
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
              className={clsx(styles.segment, design.finish === f.id && styles.segmentActive)}
              onClick={() => onChange({ finish: f.id })}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.row}>
        <span className={styles.rowLabel}>Logo</span>
        <UploadRow
          url={design.logoUrl}
          accept="image/svg+xml,image/png,image/webp"
          label="Upload SVG or PNG"
          previewStyle={swatchStyle(design.color, design.colorEnd)}
          onPick={(url) => onChange({ logoUrl: url })}
        />
      </div>

      <div className={styles.row}>
        <span className={styles.rowLabel}>Art</span>
        <UploadRow
          url={design.backgroundUrl}
          accept="image/png,image/jpeg,image/webp"
          label="Upload card art"
          onPick={(url) => onChange({ backgroundUrl: url })}
        />
      </div>
    </div>
  );
}
