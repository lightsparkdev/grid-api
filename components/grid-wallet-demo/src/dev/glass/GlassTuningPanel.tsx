'use client';

import type { GlassConfig } from '@/components/liquid-glass';
import {
  GLASS_MAP_SIZES,
  GLASS_SHAPE_CTRLS,
  GLASS_TUNING_GROUPS,
  type GlassCtrl,
} from './glassTuning';
import styles from './GlassTuningPanel.module.scss';

interface GlassTuningPanelProps {
  cfg: GlassConfig;
  onChange: (cfg: GlassConfig) => void;
  showOutline: boolean;
  onShowOutlineChange: (value: boolean) => void;
}

function fmt(ctrl: GlassCtrl, value: number) {
  return ctrl.step < 1 ? value.toFixed(2) : String(Math.round(value));
}

function Slider({
  ctrl,
  value,
  onChange,
}: {
  ctrl: GlassCtrl;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className={styles.control}>
      <div className={styles.controlHead}>
        <span className={styles.controlLabel}>{ctrl.label}</span>
        <span className={styles.controlVal}>{fmt(ctrl, value)}</span>
      </div>
      <input
        className={styles.range}
        type="range"
        min={ctrl.min}
        max={ctrl.max}
        step={ctrl.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

/** Sliders ported from liquid-glass/GlassPlayground — dev-only shell tuning. */
export function GlassTuningPanel({
  cfg,
  onChange,
  showOutline,
  onShowOutlineChange,
}: GlassTuningPanelProps) {
  const set = (key: keyof GlassConfig, value: number) =>
    onChange({ ...cfg, [key]: value });

  return (
    <div className={styles.wrap}>
      <p className={styles.title}>Glass shell</p>

      <div className={styles.group}>
        <span className={styles.groupTitle}>Shape</span>
        {GLASS_SHAPE_CTRLS.map((ctrl) => (
          <Slider
            key={ctrl.key}
            ctrl={ctrl}
            value={cfg[ctrl.key] as number}
            onChange={(v) => set(ctrl.key, v)}
          />
        ))}
      </div>

      {GLASS_TUNING_GROUPS.map((group) => (
        <div className={styles.group} key={group.title}>
          <span className={styles.groupTitle}>{group.title}</span>
          {group.ctrls.map((ctrl) => (
            <Slider
              key={ctrl.key}
              ctrl={ctrl}
              value={cfg[ctrl.key] as number}
              onChange={(v) => set(ctrl.key, v)}
            />
          ))}
        </div>
      ))}

      <div className={styles.group}>
        <span className={styles.groupTitle}>Rendering</span>
        <div className={styles.selectRow}>
          <span>Map size</span>
          <select
            className={styles.select}
            value={cfg.mapSize}
            onChange={(e) => set('mapSize', Number(e.target.value))}
          >
            {GLASS_MAP_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}×{s}
              </option>
            ))}
          </select>
        </div>
        <label className={styles.checkRow}>
          <input
            type="checkbox"
            checked={showOutline}
            onChange={(e) => onShowOutlineChange(e.target.checked)}
          />
          Show lens outline
        </label>
      </div>
    </div>
  );
}
