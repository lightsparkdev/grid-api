'use client';

import { useCallback, useEffect, useState } from 'react';
import { IconChevronBottom } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronBottom';
import type { GlassConfig } from '@/components/liquid-glass';
import { STORAGE_DEV_PANEL_EXPANDED, type PhoneUiVariant } from '@/dev/appDev';
import { PHONE_PREVIEW_FIXTURES } from '@/dev/phonePreview/fixtures';
import { GlassTuningPanel } from '@/dev/glass/GlassTuningPanel';
import type { BezelRefState } from '@/dev/glass/glassTuning';
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
  bezelRef?: BezelRefState;
  onBezelRefChange?: (next: BezelRefState) => void;
}

const GROUP_ORDER = ['Mode', 'Screens', 'Auth', 'Wallet', 'Flows', 'Overlays'];

function readExpanded(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(STORAGE_DEV_PANEL_EXPANDED);
    if (!raw) return false;
    return JSON.parse(raw) as boolean;
  } catch {
    return false;
  }
}

function writeExpanded(value: boolean) {
  try {
    localStorage.setItem(STORAGE_DEV_PANEL_EXPANDED, JSON.stringify(value));
  } catch {
    // ignore quota / private mode
  }
}

export function AppDevControls({
  fixtureId,
  onFixtureChange,
  uiVariant,
  onUiVariantChange,
  glassConfig,
  onGlassConfigChange,
  showGlassOutline = false,
  onShowGlassOutlineChange,
  bezelRef,
  onBezelRefChange,
}: AppDevControlsProps) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(readExpanded());
  }, []);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev;
      writeExpanded(next);
      return next;
    });
  }, []);

  const groups = GROUP_ORDER.map((group) => ({
    group,
    items: PHONE_PREVIEW_FIXTURES.filter((f) => f.group === group),
  })).filter((g) => g.items.length > 0);

  const showGlassTuning =
    uiVariant === 'swag' && glassConfig && onGlassConfigChange && onShowGlassOutlineChange;

  return (
    <div
      className={`${styles.panel} ${expanded && showGlassTuning ? styles.panelWide : ''} ${
        expanded ? styles.panelExpanded : styles.panelCollapsed
      }`}
    >
      <div className={styles.header}>
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
        <button
          type="button"
          className={styles.expandBtn}
          onClick={toggleExpanded}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse dev controls' : 'Expand dev controls'}
        >
          <span className={`${styles.expandChev} ${expanded ? styles.expandChevOpen : ''}`}>
            <IconChevronBottom size={14} />
          </span>
        </button>
      </div>

      {expanded ? (
        <div className={styles.body}>
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
              bezelRef={bezelRef}
              onBezelRefChange={onBezelRefChange}
            />
          ) : null}

          <p className={styles.hint}>Dev only — delete src/dev/ when styling ships.</p>
        </div>
      ) : null}
    </div>
  );
}
