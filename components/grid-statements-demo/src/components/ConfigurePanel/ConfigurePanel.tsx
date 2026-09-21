'use client';

import {
  ColorSwatches,
  ShimmerField,
  SwatchRow,
  UploadRow,
} from '@/components/DesignControls/DesignControls';
import { ChoiceGrid } from '@/components/ChoiceGrid/ChoiceGrid';
import { IconUserKey } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconUserKey';
import { IconBank } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconBank';
import { PlaygroundIntro } from '@/components/PlaygroundIntro/PlaygroundIntro';
import { SectionDivider } from '@/components/SectionDivider/SectionDivider';
import { Tooltip } from '@/components/Tooltip/Tooltip';
import { pressable } from '@/lib/sounds';
import { brandContrast } from '@/statement/brand';
import {
  PRESETS,
  colorSwatchesForPreset,
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
  presetId: PresetId;
  uploadError: string;
  variant: StatementVariant;
  onBrandChange: (companyName: string) => void;
  onBrandColorChange: (key: keyof StatementBrandColors, value: HexColor) => void;
  onClearLogo: () => void;
  onPresetSelect: (preset: StatementPreset) => void;
  onUpload: (file: File | undefined) => void;
  onVariantChange: (variant: StatementVariant) => void;
}

export function ConfigurePanel({
  brand,
  presetId,
  uploadError,
  variant,
  onBrandChange,
  onBrandColorChange,
  onClearLogo,
  onPresetSelect,
  onUpload,
  onVariantChange,
}: ConfigurePanelProps) {
  const contrast = brandContrast(brand.colors);
  const preset = PRESETS.find((candidate) => candidate.id === presetId) ?? PRESETS[0];
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
            <SectionDivider label="Configure statement" />
            <ChoiceGrid<StatementVariant>
              label="Account type"
              value={variant}
              options={[
                { id: 'consumer', label: 'Consumer', Icon: IconUserKey },
                { id: 'commercial', label: 'Commercial', Icon: IconBank },
              ]}
              onChange={onVariantChange}
            />
          </section>

          <section className={styles.section}>
            <SectionDivider label="Customize the statement" />
            <div className={styles.group}>
              <div className={styles.row}>
                <span className={styles.rowLabel}>Preset</span>
                <SwatchRow label="Platform preset" active={presetId}>
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
                    colors={colorSwatchesForPreset(preset, color.key)}
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
    <Tooltip text={`${pair === 'primary' ? 'Primary' : 'Secondary'} text and background need at least 4.5:1 contrast.`}>
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
