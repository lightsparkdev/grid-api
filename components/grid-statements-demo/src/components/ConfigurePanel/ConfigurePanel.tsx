'use client';

import { useRef, type ChangeEvent } from 'react';
import { IconAddImage } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconAddImage';
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossMedium';
import { PlaygroundIntro } from '@/components/PlaygroundIntro/PlaygroundIntro';
import { SectionDivider } from '@/components/SectionDivider/SectionDivider';
import { Tooltip } from '@/components/Tooltip/Tooltip';
import { PERIODS } from '@/statement/fixtures';
import {
  PRESETS,
  presetIconSrc,
  type PresetId,
  type StatementPreset,
} from '@/statement/presets';
import type { StatementBrand, StatementVariant } from '@/statement/types';
import styles from './ConfigurePanel.module.scss';

interface ConfigurePanelProps {
  brand: StatementBrand;
  periodId: string;
  presetId: PresetId | null;
  uploadError: string;
  variant: StatementVariant;
  onBrandChange: (companyName: string) => void;
  onClearLogo: () => void;
  onPeriodChange: (periodId: string) => void;
  onPresetSelect: (preset: StatementPreset) => void;
  onUpload: (file: File | undefined) => void;
  onVariantChange: (variant: StatementVariant) => void;
}

export function ConfigurePanel({
  brand,
  periodId,
  presetId,
  uploadError,
  variant,
  onBrandChange,
  onClearLogo,
  onPeriodChange,
  onPresetSelect,
  onUpload,
  onVariantChange,
}: ConfigurePanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    onUpload(event.target.files?.[0]);
    event.target.value = '';
  };

  return (
    <aside className={styles.panel}>
      <div className={styles.body}>
        <div className={styles.content}>
          <PlaygroundIntro />

          <section className={styles.section}>
            <SectionDivider label="Customize the statement" />
            <div className={styles.group}>
              <div className={styles.row}>
                <span className={styles.rowLabel}>Preset</span>
                <div className={styles.swatches} role="radiogroup" aria-label="Cards presets">
                  {PRESETS.map((preset) => (
                    <Tooltip key={preset.id} text={preset.description}>
                      {(tip) => (
                        <button
                          type="button"
                          role="radio"
                          aria-checked={presetId === preset.id}
                          aria-label={`${preset.description} (${preset.companyName})`}
                          className={styles.swatch}
                          data-active={presetId === preset.id || undefined}
                          onClick={() => onPresetSelect(preset)}
                          {...tip}
                        >
                          <img src={presetIconSrc(preset)} alt="" draggable={false} />
                        </button>
                      )}
                    </Tooltip>
                  ))}
                </div>
              </div>
              <label className={styles.row}>
                <span className={styles.rowLabel}>Company name</span>
                <input
                  className={styles.input}
                  value={brand.companyName}
                  maxLength={40}
                  onChange={(event) => onBrandChange(event.target.value)}
                />
              </label>
              <div className={styles.row}>
                <span className={styles.rowLabel}>Logo</span>
                {brand.logo.kind === 'image' ? (
                  <div className={styles.logoPicked}>
                    <span className={styles.logoPreview}>
                      <img src={brand.logo.src} alt="" />
                    </span>
                    <Tooltip text="Remove">
                      {(tip) => (
                        <button
                          type="button"
                          className={styles.logoClear}
                          aria-label="Remove logo"
                          onClick={onClearLogo}
                          {...tip}
                        >
                          <IconCrossMedium size={16} aria-hidden />
                        </button>
                      )}
                    </Tooltip>
                  </div>
                ) : (
                  <Tooltip text="Transparent SVG, PNG, or WebP under 2 MB">
                    {(tip) => (
                      <button
                        type="button"
                        className={styles.upload}
                        onClick={() => fileRef.current?.click()}
                        {...tip}
                      >
                        <IconAddImage size={16} aria-hidden />
                        Upload logo
                      </button>
                    )}
                  </Tooltip>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/svg+xml,image/png,image/webp"
                  className={styles.fileInput}
                  onChange={onFileChange}
                />
              </div>
            </div>
            {uploadError ? <p className={styles.error}>{uploadError}</p> : null}
          </section>

          <section className={styles.section}>
            <SectionDivider label="Set statement details" />
            <div className={styles.group}>
              <div className={styles.row}>
                <span className={styles.rowLabel}>Account</span>
                <div className={styles.choices} role="radiogroup" aria-label="Account type">
                  {(['consumer', 'commercial'] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={variant === option}
                      data-active={variant === option || undefined}
                      onClick={() => onVariantChange(option)}
                    >
                      {option === 'consumer' ? 'Consumer' : 'Commercial'}
                    </button>
                  ))}
                </div>
              </div>
              <label className={styles.row}>
                <span className={styles.rowLabel}>Period</span>
                <select
                  className={styles.select}
                  value={periodId}
                  onChange={(event) => onPeriodChange(event.target.value)}
                >
                  {PERIODS.map((period) => (
                    <option key={period.id} value={period.id}>
                      {period.range}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>
        </div>
      </div>
    </aside>
  );
}
