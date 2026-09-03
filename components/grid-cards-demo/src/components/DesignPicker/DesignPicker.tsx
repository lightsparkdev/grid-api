'use client';

import clsx from 'clsx';
import { useEffect, useRef, type ChangeEvent, type CSSProperties } from 'react';
import { IconCrossSmall } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossSmall';
import { IconPlusSmall } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPlusSmall';
import { IconArrowUpSquare } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowUpSquare';
import {
  ART_TREATMENTS,
  brandColorOf,
  DESIGN_SWATCHES,
  FINISHES,
  LOGO_TREATMENTS,
  MATERIALS,
  stockOf,
  stocksFor,
  type CardDesign,
} from '@/data/design';
import styles from './DesignPicker.module.scss';

interface DesignPickerProps {
  design: CardDesign;
  onChange: (patch: Partial<CardDesign>) => void;
}

const MAX_NAME = 18;
const MAX_CARDHOLDER = 24;

function swatchStyle(color: string, colorEnd?: string) {
  return {
    background: colorEnd
      ? `linear-gradient(135deg, ${color} 0%, ${colorEnd} 100%)`
      : color,
  };
}

/** A row of text choices divided by hairlines (Material, Finish, treatments). */
function Choices<T extends string>({
  label,
  value,
  options,
  onChange,
  dense = false,
}: {
  label: string;
  value: T;
  options: ReadonlyArray<{ id: T; label: string }>;
  onChange: (id: T) => void;
  /** Tighter padding for rows with four options. */
  dense?: boolean;
}) {
  return (
    <div className={clsx(styles.segments, dense && styles.segmentsDense)} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          className={clsx(styles.segment, value === o.id && styles.segmentActive)}
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
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

/**
 * The Design section, in the order a card is made: the card itself (material,
 * stock, finish), what is printed on it (color or none, art, logo, and their
 * decoration), and the details that go on it (program, cardholder).
 */
export function DesignPicker({ design, onChange }: DesignPickerProps) {
  const stocks = stocksFor(design.material);
  const stock = stockOf(design);
  const activeSwatch = design.color
    ? DESIGN_SWATCHES.find(
        (s) => s.color === design.color && (s.colorEnd ?? s.color) === (design.colorEnd ?? design.color),
      )
    : undefined;
  const custom = design.color !== null && !activeSwatch;
  const brand = brandColorOf(design);

  return (
    <div className={styles.groups}>
      <div className={styles.group}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Material</span>
          <Choices label="Card material" value={design.material} options={MATERIALS} onChange={(material) => onChange({ material })} />
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Stock</span>
          <div className={styles.swatches} role="radiogroup" aria-label="Card stock">
            {stocks.map((s) => (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={stock.id === s.id}
                aria-label={s.label}
                title={s.label}
                className={clsx(styles.swatch, stock.id === s.id && styles.swatchActive)}
                style={swatchStyle(s.face, s.metal ? s.core : undefined)}
                onClick={() => onChange({ stock: s.id })}
              />
            ))}
          </div>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Finish</span>
          <Choices label="Card finish" value={design.finish} options={FINISHES} onChange={(finish) => onChange({ finish })} />
        </div>
      </div>

      <div className={styles.group}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Color</span>
          <div className={styles.swatches} role="radiogroup" aria-label="Print color">
            <button
              type="button"
              role="radio"
              aria-checked={design.color === null}
              aria-label="None"
              title={`None (bare ${stock.label.toLowerCase()} ${design.material})`}
              className={clsx(styles.swatch, styles.swatchNone, design.color === null && styles.swatchActive)}
              style={swatchStyle(stock.face)}
              onClick={() => onChange({ color: null, colorEnd: undefined })}
            />
            {DESIGN_SWATCHES.map((s) => (
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
              className={clsx(styles.swatch, styles.swatchCustom, custom && styles.swatchActive)}
              title="Custom color"
              style={custom ? swatchStyle(design.color!, design.colorEnd) : undefined}
            >
              <input
                type="color"
                className={styles.colorInput}
                value={design.color ?? brand.color}
                aria-label="Custom color"
                onChange={(e) => onChange({ color: e.target.value, colorEnd: undefined })}
              />
              {!custom ? <IconPlusSmall size={16} aria-hidden /> : null}
            </label>
          </div>
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
        {design.backgroundUrl && (
          <div className={styles.row}>
            <span className={styles.rowLabel}>Art effect</span>
            <Choices
              label="Art effect"
              value={design.artTreatment}
              options={ART_TREATMENTS}
              onChange={(artTreatment) => onChange({ artTreatment })}
            />
          </div>
        )}
        <div className={styles.row}>
          <span className={styles.rowLabel}>Logo</span>
          <UploadRow
            url={design.logoUrl}
            accept="image/svg+xml,image/png,image/webp"
            label="Upload SVG or PNG"
            previewStyle={swatchStyle(brand.color, brand.colorEnd)}
            onPick={(url) => onChange({ logoUrl: url })}
          />
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Effect</span>
          <Choices
            label="Logo effect"
            value={design.logoTreatment}
            options={LOGO_TREATMENTS}
            onChange={(logoTreatment) => onChange({ logoTreatment })}
            dense
          />
        </div>
      </div>

      <div className={styles.group}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Program</span>
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
          <span className={styles.rowLabel}>Cardholder</span>
          <input
            type="text"
            className={styles.nameInput}
            value={design.cardholderName}
            maxLength={MAX_CARDHOLDER}
            placeholder="Cardholder name"
            aria-label="Cardholder name"
            onChange={(e) => onChange({ cardholderName: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
