'use client';

import { IconSettingsSliderHor } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconSettingsSliderHor';
import { IconRotate360Left } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconRotate360Left';
import { PanelHeader } from '@/components/PanelHeader/PanelHeader';
import { PlaygroundIntro } from '@/components/PlaygroundIntro/PlaygroundIntro';
import { SectionDivider } from '@/components/SectionDivider/SectionDivider';
import { UseCasePicker } from '@/components/UseCasePicker/UseCasePicker';
import { AuthMethodPicker } from '@/components/AuthMethodPicker/AuthMethodPicker';
import { FlowPicker } from '@/components/FlowPicker/FlowPicker';
import type { AuthMethod } from '@/data/flow';
import type { UseCaseId } from '@/data/configure';
import type { ActionId, WalletState } from '@/data/actions';
import styles from './ConfigurePanel.module.scss';

export interface ConfigurePanelProps {
  useCase: UseCaseId;
  setUseCase: (id: UseCaseId) => void;
  methods: AuthMethod[];
  onToggleMethod: (m: AuthMethod) => void;
  wallet: WalletState;
  running: boolean;
  onAction: (id: ActionId) => void;
  onReset: () => void;
}

export function ConfigurePanel({
  useCase,
  setUseCase,
  methods,
  onToggleMethod,
  wallet,
  running,
  onAction,
  onReset,
}: ConfigurePanelProps) {
  // Only the fintech (Aurora) app is built today, so selecting a use case just
  // highlights it — the phone stays on Aurora. A "coming soon" treatment for the
  // others can hook in here later.
  return (
    <aside className={styles.panel}>
      <PanelHeader icon={<IconSettingsSliderHor size={20} />} title="Configure" />
      <div className={styles.body}>
        <div className={styles.content}>
          <PlaygroundIntro />

          <section className={styles.section}>
            <SectionDivider label="Select use case" />
            <UseCasePicker selected={useCase} onSelect={setUseCase} />
          </section>

          <section className={styles.section}>
            <SectionDivider label="Select authentication" />
            <AuthMethodPicker
              methods={methods}
              onToggle={onToggleMethod}
              disabled={running}
            />
          </section>

          <section className={styles.section}>
            <SectionDivider label="Explore flows" />
            <FlowPicker wallet={wallet} running={running} onAction={onAction} />
          </section>

          {wallet.created && (
            <button
              type="button"
              className={styles.resetBtn}
              onClick={onReset}
              disabled={running}
            >
              <IconRotate360Left size={14} />
              Start over
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
