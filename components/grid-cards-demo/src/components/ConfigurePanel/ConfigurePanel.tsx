'use client';

import { IconArrowRotateCounterClockwise } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowRotateCounterClockwise';
import { PlaygroundIntro } from '@/components/PlaygroundIntro/PlaygroundIntro';
import { SectionDivider } from '@/components/SectionDivider/SectionDivider';
import { DesignPicker } from '@/components/DesignPicker/DesignPicker';
import { FlowPicker } from '@/components/FlowPicker/FlowPicker';
import { initialDesignFor, sameDesign, type CardDesign } from '@/data/design';
import { useThemeMode } from '@/hooks/useThemeMode';
import type { PresetId } from '@/data/presets';
import type { ActionId, WalletState } from '@/data/actions';
import styles from './ConfigurePanel.module.scss';

interface ConfigurePanelProps {
  design: CardDesign;
  onDesignChange: (patch: Partial<CardDesign>) => void;
  preset: PresetId | null;
  onPresetSelect: (id: PresetId) => void;
  wallet: WalletState;
  running: boolean;
  onAction: (id: ActionId) => void;
  onReset: () => void;
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
  const theme = useThemeMode();
  return (
    <aside className={styles.panel}>
      <div className={styles.body}>
        <div className={styles.content}>
          <PlaygroundIntro />

          <section className={styles.section}>
            <SectionDivider
              label="Design your card"
              action={
                !sameDesign(design, initialDesignFor(theme)) ? (
                  <button type="button" className={styles.resetBtn} onClick={() => onDesignChange(initialDesignFor(theme))}>
                    <IconArrowRotateCounterClockwise size={12} aria-hidden />
                    Reset
                  </button>
                ) : null
              }
            />
            <DesignPicker design={design} onChange={onDesignChange} preset={preset} onPresetSelect={onPresetSelect} />
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
