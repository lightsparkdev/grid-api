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
  type CardDesign,
} from '@/data/design';
import { PRESETS, type PresetId } from '@/data/presets';
import { Tooltip } from '@/components/Tooltip/Tooltip';
import styles from './DesignPicker.module.scss';

interface DesignPickerProps {
  design: CardDesign;
  onChange: (patch: Partial<CardDesign>) => void;
  /** The preset the design currently is; null when it is the visitor's own. */
  preset: PresetId | null;
  onPresetSelect: (id: PresetId) => void;
}

const MAX_NAME = 18;
const MAX_CARDHOLDER = 24;

function swatchStyle(color: string) {
  return { background: color };
}

/** A row of text choices divided by hairlines (Material, Finish, treatments). */
function Choices<T extends string>({
  label,
  value,
  options,
  onChange,
  dense = false,
  disabled,
}: {
  label: string;
  value: T;
  options: ReadonlyArray<{ id: T; label: string }>;
  onChange: (id: T) => void;
  /** Tighter padding for rows with four options. */
  dense?: boolean;
  /** Options that would do nothing right now, with the reason (a title). */
  disabled?: Partial<Record<T, string>>;
}) {
  return (
    <div className={clsx(styles.segments, dense && styles.segmentsDense)} role="radiogroup" aria-label={label}>
      {options.map((o) => {
        const why = disabled?.[o.id];
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={value === o.id}
            className={clsx(styles.segment, value === o.id && styles.segmentActive)}
            disabled={!!why}
            title={why}
            onClick={() => onChange(o.id)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * A finish as a small sample of itself, the way the Color row shows colors:
 * ink is flat, spot gloss has a shine, foil is silver with a bright run, and
 * an etch is pressed in. Each names itself in a tooltip on hover.
 */
const FINISH_SAMPLE: Record<string, string> = {
  print: styles.sampleInk,
  spotGloss: styles.sampleGloss,
  foil: styles.sampleFoil,
  etch: styles.sampleEtch,
};

function FinishSwatches<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: T;
  options: ReadonlyArray<{ id: T; label: string }>;
  onChange: (id: T) => void;
  disabled?: Partial<Record<T, string>>;
}) {
  return (
    <div className={styles.swatches} role="radiogroup" aria-label={label}>
      {options.map((o) => {
        const why = disabled?.[o.id];
        return (
          <Tooltip key={o.id} text={why ?? o.label}>
            {(tip) => (
              <button
                type="button"
                role="radio"
                aria-checked={value === o.id}
                aria-label={o.label}
                disabled={!!why}
                className={clsx(styles.swatch, FINISH_SAMPLE[o.id], value === o.id && styles.swatchActive)}
                onClick={() => onChange(o.id)}
                {...tip}
              />
            )}
          </Tooltip>
        );
      })}
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
 * The Design section, in the order a card is made. Card: a preset to start
 * from, then material, finish, and the print (a color, or none, or art; the
 * core under a print is chosen to match it, not offered). Brand: the name and
 * logo, and how the mark is applied once there is one. Name: the cardholder's.
 */
export function DesignPicker({ design, onChange, preset, onPresetSelect }: DesignPickerProps) {
  const stock = stockOf(design);
  const activeSwatch = design.color ? DESIGN_SWATCHES.find((s) => s.color === design.color) : undefined;
  const custom = design.color !== null && !activeSwatch;
  const brand = brandColorOf(design);
  const hasBrand = design.logoUrl !== null || design.programName.trim() !== '';
  // Spot gloss is a clear varnish that reads against a matte coat; on a gloss
  // card it is invisible.
  const glossy = design.finish === 'gloss';
  const noSpotGloss = glossy ? ({ spotGloss: 'Spot gloss needs a matte card' } as const) : undefined;

  return (
    <div className={styles.groups}>
      <div className={styles.group}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Preset</span>
          <div className={styles.swatches} role="radiogroup" aria-label="Preset">
            {PRESETS.map((p) => (
              <Tooltip key={p.id} text={p.design.programName}>
                {(tip) => (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={preset === p.id}
                    aria-label={p.design.programName}
                    className={clsx(styles.swatch, styles.swatchIcon, preset === p.id && styles.swatchActive)}
                    onClick={() => onPresetSelect(p.id)}
                    {...tip}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.iconSrc} alt="" draggable={false} />
                  </button>
                )}
              </Tooltip>
            ))}
          </div>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Material</span>
          <Choices
            label="Card material"
            value={design.material}
            options={MATERIALS}
            onChange={(material) => onChange({ material })}
          />
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Finish</span>
          <Choices
            label="Card finish"
            value={design.finish}
            options={FINISHES}
            onChange={(finish) => onChange({ finish })}
          />
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Color</span>
          <div className={styles.swatches} role="radiogroup" aria-label="Card color">
            <Tooltip text={`None (bare ${stock.label.toLowerCase()})`}>
              {(tip) => (
                <button
                  type="button"
                  role="radio"
                  aria-checked={design.color === null}
                  aria-label="None"
                  className={clsx(styles.swatch, styles.swatchNone, design.color === null && styles.swatchActive)}
                  onClick={() => onChange({ color: null })}
                  {...tip}
                />
              )}
            </Tooltip>
            {DESIGN_SWATCHES.map((s) => (
              <Tooltip key={s.id} text={s.label}>
                {(tip) => (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={activeSwatch?.id === s.id}
                    aria-label={s.label}
                    className={clsx(styles.swatch, activeSwatch?.id === s.id && styles.swatchActive)}
                    style={swatchStyle(s.color)}
                    onClick={() => onChange({ color: s.color })}
                    {...tip}
                  />
                )}
              </Tooltip>
            ))}
            <label
              className={clsx(styles.swatch, styles.swatchCustom, custom && styles.swatchActive)}
              style={custom ? swatchStyle(design.color!) : undefined}
            >
              <input
                type="color"
                className={styles.colorInput}
                value={design.color ?? brand}
                aria-label="Custom color"
                onChange={(e) => onChange({ color: e.target.value })}
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
            <span className={styles.rowLabel}>Art finish</span>
            <FinishSwatches
              label="Art finish"
              value={design.artTreatment}
              options={ART_TREATMENTS}
              onChange={(artTreatment) => onChange({ artTreatment })}
              disabled={noSpotGloss}
            />
          </div>
        )}
      </div>

      <div className={styles.group}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Brand</span>
          <input
            type="text"
            className={styles.nameInput}
            value={design.programName}
            maxLength={MAX_NAME}
            placeholder="Your brand"
            aria-label="Brand name"
            onChange={(e) => onChange({ programName: e.target.value })}
          />
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Logo</span>
          <UploadRow
            url={design.logoUrl}
            accept="image/svg+xml,image/png,image/webp"
            label="Upload SVG or PNG"
            previewStyle={swatchStyle(brand)}
            onPick={(url) => onChange({ logoUrl: url })}
          />
        </div>
        {hasBrand && (
          <div className={styles.row}>
            <span className={styles.rowLabel}>Finish</span>
            <FinishSwatches
              label="Brand finish"
              value={design.logoTreatment}
              options={LOGO_TREATMENTS}
              onChange={(logoTreatment) => onChange({ logoTreatment })}
              disabled={noSpotGloss}
            />
          </div>
        )}
      </div>

      <div className={styles.group}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Name</span>
          <input
            type="text"
            className={styles.nameInput}
            value={design.cardholderName}
            maxLength={MAX_CARDHOLDER}
            placeholder="Your name"
            aria-label="Cardholder name"
            onChange={(e) => onChange({ cardholderName: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
