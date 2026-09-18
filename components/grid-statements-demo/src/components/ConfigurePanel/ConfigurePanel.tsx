'use client';

import {
  ColorSwatches,
  SampleSwatches,
  ShimmerField,
  SwatchRow,
  UploadRow,
} from '@/components/DesignControls/DesignControls';
import { PlaygroundIntro } from '@/components/PlaygroundIntro/PlaygroundIntro';
import { SectionDivider } from '@/components/SectionDivider/SectionDivider';
import { Tooltip } from '@/components/Tooltip/Tooltip';
import { pressable } from '@/lib/sounds';
import { BRAND_COLOR_SWATCHES, brandContrast } from '@/statement/brand';
import { PERIODS } from '@/statement/fixtures';
import {
  PRESETS,
  presetIconSrc,
  type PresetId,
  type StatementPreset,
} from '@/statement/presets';
import type {
  HexColor,
  StatementBrand,
  StatementBrandColors,
  StatementVariant,
} from '@/statement/types';
import styles from './ConfigurePanel.module.scss';

interface ConfigurePanelProps {
  brand: StatementBrand;
  periodId: string;
  presetId: PresetId | null;
  uploadError: string;
  variant: StatementVariant;
  onBrandChange: (companyName: string) => void;
  onBrandColorChange: (key: keyof StatementBrandColors, value: HexColor) => void;
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
  onBrandColorChange,
  onClearLogo,
  onPeriodChange,
  onPresetSelect,
  onUpload,
  onVariantChange,
}: ConfigurePanelProps) {
  const contrast = brandContrast(brand.colors);
  const colorRows: ReadonlyArray<{
    key: keyof StatementBrandColors;
    label: string;
    passes: boolean;
  }> = [
    {
      key: 'primaryBackground',
      label: 'Primary background',
      passes: contrast.primaryPasses,
    },
    {
      key: 'primaryText',
      label: 'Primary text',
      passes: contrast.primaryPasses,
    },
    {
      key: 'secondaryBackground',
      label: 'Secondary background',
      passes: contrast.secondaryPasses,
    },
    {
      key: 'secondaryText',
      label: 'Secondary text',
      passes: contrast.secondaryPasses,
    },
  ];

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
                <SwatchRow label="Cards presets" active={presetId}>
                  {PRESETS.map((preset) => (
                    <Tooltip key={preset.id} text={preset.description}>
                      {(tip) => (
                        <button
                          type="button"
                          role="radio"
                          aria-checked={presetId === preset.id}
                          aria-label={`${preset.description} (${preset.companyName})`}
                          tabIndex={presetId === preset.id ? 0 : -1}
                          className={styles.presetSwatch}
                          {...tip}
                          {...pressable(
                            { onClick: () => onPresetSelect(preset) },
                            true,
                          )}
                        >
                          <img src={presetIconSrc(preset)} alt="" draggable={false} />
                        </button>
                      )}
                    </Tooltip>
                  ))}
                </SwatchRow>
              </div>
              <div className={styles.row}>
                <span className={styles.rowLabel}>Company name</span>
                <ShimmerField
                  value={brand.companyName}
                  maxLength={40}
                  placeholder="Your company"
                  label="Company name"
                  onChange={onBrandChange}
                />
              </div>
              <div className={styles.row}>
                <span className={styles.rowLabel}>Logo</span>
                <UploadRow
                  url={brand.logo.kind === 'image' ? brand.logo.src : null}
                  accept="image/svg+xml,image/png,image/webp"
                  label="Upload logo"
                  hint="Transparent SVG, PNG, or WebP under 2 MB"
                  onPick={onUpload}
                  onClear={onClearLogo}
                />
              </div>
              {colorRows.map((color) => (
                <div className={styles.row} key={color.key}>
                  <span className={styles.rowLabel}>{color.label}</span>
                  <ColorSwatches
                    label={color.label}
                    value={brand.colors[color.key]}
                    colors={BRAND_COLOR_SWATCHES}
                    onChange={(value) => onBrandColorChange(color.key, value)}
                  />
                  <ContrastWarning
                    visible={!color.passes}
                    pair={color.key.startsWith('primary') ? 'primary' : 'secondary'}
                  />
                </div>
              ))}
            </div>
            {uploadError ? <p className={styles.error}>{uploadError}</p> : null}
          </section>

          <section className={styles.section}>
            <SectionDivider label="Set statement details" />
            <div className={styles.group}>
              <div className={styles.row}>
                <span className={styles.rowLabel}>Account</span>
                <SampleSwatches
                  label="Account type"
                  value={variant}
                  options={[
                    { id: 'consumer', label: 'Consumer' },
                    { id: 'commercial', label: 'Commercial' },
                  ]}
                  onChange={onVariantChange}
                />
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

function ContrastWarning({
  visible,
  pair,
}: {
  visible: boolean;
  pair: 'primary' | 'secondary';
}) {
  if (!visible) return null;
  return (
    <Tooltip text={`${pair === 'primary' ? 'Primary' : 'Secondary'} text needs at least 4.5:1 contrast.`}>
      {(tip) => (
        <span
          className={styles.contrastWarning}
          role="img"
          aria-label={`${pair} color contrast warning`}
          {...tip}
        >
          !
        </span>
      )}
    </Tooltip>
  );
}
