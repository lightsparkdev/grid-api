'use client';

import { IconArrowRotateCounterClockwise } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowRotateCounterClockwise';
import { IconShareOs } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconShareOs';
import { PlaygroundIntro } from '@/components/PlaygroundIntro/PlaygroundIntro';
import { SectionDivider } from '@/components/SectionDivider/SectionDivider';
import { DesignPicker } from '@/components/DesignPicker/DesignPicker';
import { FlowPicker } from '@/components/FlowPicker/FlowPicker';
import { initialDesignFor, sameDesign, type CardDesign } from '@/data/design';
import { useThemeMode } from '@/hooks/useThemeMode';
import type { PresetId } from '@/data/presets';
import type { ActionId, WalletState } from '@/data/actions';
import { pressable } from '@/lib/sounds';
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
  /** Opens the share sheet for the current design. */
  onShare?: () => void;
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
  onShare,
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
                <span className={styles.actions}>
                  {!sameDesign(design, initialDesignFor(theme)) && (
                    <button
                      type="button"
                      className={styles.resetBtn}
                      {...pressable({ onClick: () => onDesignChange(initialDesignFor(theme)) })}
                    >
                      <IconArrowRotateCounterClockwise size={12} aria-hidden />
                      Reset
                    </button>
                  )}
                  {onShare && (
                    <button type="button" className={styles.resetBtn} {...pressable({ onClick: onShare })}>
                      <IconShareOs size={12} aria-hidden />
                      Share
                    </button>
                  )}
                </span>
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
                    disabled={running}
                    {...pressable({ onClick: onReset, disabled: running })}
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
