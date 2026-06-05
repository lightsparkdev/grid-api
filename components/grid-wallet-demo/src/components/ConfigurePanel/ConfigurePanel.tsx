'use client';

import { IconSettingsSliderHor } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconSettingsSliderHor';
import { IconRotate360Left } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconRotate360Left';
import { PanelHeader } from '@/components/PanelHeader/PanelHeader';
import { PlaygroundIntro } from '@/components/PlaygroundIntro/PlaygroundIntro';
import { SectionDivider } from '@/components/SectionDivider/SectionDivider';
import { UseCasePicker } from '@/components/UseCasePicker/UseCasePicker';
import { AuthMethodPicker } from '@/components/AuthMethodPicker/AuthMethodPicker';
import { FlowPicker } from '@/components/FlowPicker/FlowPicker';
import type { AuthMethod, Persona } from '@/data/flow';
import { USE_CASES, type UseCaseId } from '@/data/configure';
import type { ActionId, WalletState } from '@/data/actions';
import styles from './ConfigurePanel.module.scss';

export interface ConfigurePanelProps {
  useCase: UseCaseId;
  setUseCase: (id: UseCaseId) => void;
  persona: Persona;
  setPersona: (p: Persona) => void;
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
  persona,
  setPersona,
  methods,
  onToggleMethod,
  wallet,
  running,
  onAction,
  onReset,
}: ConfigurePanelProps) {
  const onUseCaseSelect = (id: UseCaseId) => {
    setUseCase(id);
    const opt = USE_CASES.find((u) => u.id === id);
    if (opt?.persona) setPersona(opt.persona);
  };

  return (
    <aside className={styles.panel}>
      <PanelHeader icon={<IconSettingsSliderHor size={20} />} title="Configure" />
      <div className={styles.body}>
        <div className={styles.content}>
          <PlaygroundIntro />

          <section className={styles.section}>
            <SectionDivider label="Select use case" />
            <UseCasePicker selected={useCase} onSelect={onUseCaseSelect} />
          </section>

          <section className={styles.section}>
            <SectionDivider label="Select authentication" />
            <AuthMethodPicker
              methods={methods}
              onToggle={onToggleMethod}
              disabled={running || wallet.created}
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
