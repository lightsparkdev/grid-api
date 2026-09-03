'use client';

import { IconArrowRotateCounterClockwise } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowRotateCounterClockwise';
import { PlaygroundIntro } from '@/components/PlaygroundIntro/PlaygroundIntro';
import { SectionDivider } from '@/components/SectionDivider/SectionDivider';
import { DesignPicker } from '@/components/DesignPicker/DesignPicker';
import { PresetPicker } from '@/components/PresetPicker/PresetPicker';
import { FlowPicker } from '@/components/FlowPicker/FlowPicker';
import { initialDesign, type CardDesign } from '@/data/design';
import type { PresetId } from '@/data/presets';
import type { ActionId, WalletState } from '@/data/actions';
import styles from './ConfigurePanel.module.scss';

interface ConfigurePanelProps {
  design: CardDesign;
  onDesignChange: (patch: Partial<CardDesign>) => void;
  preset: PresetId;
  onPresetSelect: (id: PresetId) => void;
  wallet: WalletState;
  running: boolean;
  onAction: (id: ActionId) => void;
  onReset: () => void;
}

/** Anything changed from the starting design. */
function isDirty(design: CardDesign): boolean {
  return (Object.keys(initialDesign) as Array<keyof CardDesign>).some((k) => design[k] !== initialDesign[k]);
}

export function ConfigurePanel({
  design,
  onDesignChange,
  preset,
  onPresetSelect,
  wallet,
  running,
  onAction,
  onReset,
}: ConfigurePanelProps) {
  return (
    <aside className={styles.panel}>
      <div className={styles.body}>
        <div className={styles.content}>
          <PlaygroundIntro />

          <section className={styles.section}>
            <SectionDivider
              label="Design your card"
              action={
                isDirty(design) ? (
                  <button type="button" className={styles.resetBtn} onClick={() => onDesignChange(initialDesign)}>
                    <IconArrowRotateCounterClockwise size={12} aria-hidden />
                    Reset
                  </button>
                ) : null
              }
            />
            {/* The platform tiles are the Design section's first group. */}
            <div className={styles.designGroups}>
              <PresetPicker selected={preset} onSelect={onPresetSelect} />
              <DesignPicker design={design} onChange={onDesignChange} />
            </div>
          </section>

          <section className={styles.section}>
            <SectionDivider
              label="Explore flows"
              action={
                wallet.hasCard ? (
                  <button
                    type="button"
                    className={styles.resetBtn}
                    onClick={onReset}
                    disabled={running}
                  >
                    <IconArrowRotateCounterClockwise size={12} aria-hidden />
                    Reset
                  </button>
                ) : null
              }
            />
            <FlowPicker wallet={wallet} running={running} onAction={onAction} />
          </section>
        </div>
      </div>
    </aside>
  );
}
