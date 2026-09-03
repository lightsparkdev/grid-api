'use client';

import { DotGridCanvas } from '@/components/DotGridCanvas/DotGridCanvas';
import type { PhoneProps } from '@/components/Phone';
import { CardStage } from '@/components/CardStage/CardStage';
import { DemoPhone } from '@/components/DemoPhone/DemoPhone';
import { PHONE_SHELL_GLASS } from '@/components/liquid-glass';
import { DEFAULT_OVERLAY_GLASS } from '@/apps/shared/glass';
import type { Stage, StageCardState } from '@/hooks/useCardsDemoLogic';
import styles from './AppPanel.module.scss';

interface AppPanelProps extends PhoneProps {
  stage: Stage;
  cardState: StageCardState;
  /** Issue tapped on the bare-card stage. */
  onIssue: () => void;
}

/** The stage: the bare card while designing, the phone once a card is issued. */
export function AppPanel({ stage, cardState, onIssue, ...phone }: AppPanelProps) {
  return (
    <section className={styles.panel}>
      <div className={styles.body}>
        <div className={styles.phoneStage}>
          <DotGridCanvas glassConfig={PHONE_SHELL_GLASS} phoneVisible={stage === 'phone'}>
            <DemoPhone
              {...phone}
              glassConfig={PHONE_SHELL_GLASS}
              overlayGlass={DEFAULT_OVERLAY_GLASS}
              glassDemoBg
              externalGlass
            />
            <CardStage design={phone.design} cardState={cardState} onIssue={onIssue} />
          </DotGridCanvas>
        </div>
      </div>
    </section>
  );
}
