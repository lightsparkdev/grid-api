'use client';

import { IconArrowRotateCounterClockwise } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowRotateCounterClockwise';
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
      <div className={styles.body}>
        <div className={styles.content}>
          <PlaygroundIntro />

          <section className={styles.section}>
            <SectionDivider label="Select platform" />
            <UseCasePicker selected={useCase} onSelect={setUseCase} />
          </section>

          <section className={styles.section}>
            <SectionDivider label="Configure auth" />
            {/* Never disabled: the auth screens render live from `methods`, and
                an in-flight sign-in has already committed its method — toggling
                mid-flow just updates the CTA list behind the overlay. */}
            <AuthMethodPicker methods={methods} onToggle={onToggleMethod} />
          </section>

          <section className={styles.section}>
            <SectionDivider
              label="Explore flows"
              action={
                wallet.created ? (
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
