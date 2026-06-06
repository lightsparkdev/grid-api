'use client';

import type { GlassConfig } from '@/components/liquid-glass';
import { PHONE_PREVIEW_FIXTURES } from '@/dev/phonePreview/fixtures';
import { GlassTuningPanel } from '@/dev/glass/GlassTuningPanel';
import type { PhoneUiVariant } from '@/dev/appDev';
import styles from './AppDevControls.module.scss';

interface AppDevControlsProps {
  fixtureId: string;
  onFixtureChange: (id: string) => void;
  uiVariant: PhoneUiVariant;
  onUiVariantChange: (variant: PhoneUiVariant) => void;
  glassConfig?: GlassConfig;
  onGlassConfigChange?: (cfg: GlassConfig) => void;
  showGlassOutline?: boolean;
  onShowGlassOutlineChange?: (value: boolean) => void;
}

const GROUP_ORDER = ['Mode', 'Screens', 'Auth', 'Wallet', 'Flows', 'Overlays'];

export function AppDevControls({
  fixtureId,
  onFixtureChange,
  uiVariant,
  onUiVariantChange,
  glassConfig,
  onGlassConfigChange,
  showGlassOutline = false,
  onShowGlassOutlineChange,
}: AppDevControlsProps) {
  const groups = GROUP_ORDER.map((group) => ({
    group,
    items: PHONE_PREVIEW_FIXTURES.filter((f) => f.group === group),
  })).filter((g) => g.items.length > 0);

  const showGlassTuning =
    uiVariant === 'swag' && glassConfig && onGlassConfigChange && onShowGlassOutlineChange;

  return (
    <div className={`${styles.panel} ${showGlassTuning ? styles.panelWide : ''}`}>
      <div className={styles.row}>
        <div className={styles.segmented} role="group" aria-label="Phone UI variant">
          {(['slop', 'swag'] as const).map((variant) => (
            <button
              key={variant}
              type="button"
              className={`${styles.segment} ${uiVariant === variant ? styles.segmentActive : ''}`}
              onClick={() => onUiVariantChange(variant)}
            >
              {variant}
            </button>
          ))}
        </div>
      </div>

      <select
        className={styles.select}
        value={fixtureId}
        onChange={(e) => onFixtureChange(e.target.value)}
        aria-label="Phone preview screen"
      >
        {groups.map(({ group, items }) => (
          <optgroup key={group} label={group}>
            {items.map((fixture) => (
              <option key={fixture.id} value={fixture.id}>
                {fixture.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      {showGlassTuning ? (
        <GlassTuningPanel
          cfg={glassConfig}
          onChange={onGlassConfigChange}
          showOutline={showGlassOutline}
          onShowOutlineChange={onShowGlassOutlineChange}
        />
      ) : null}

      <p className={styles.hint}>Dev only — delete src/dev/ when styling ships.</p>
    </div>
  );
}
