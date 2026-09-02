'use client';

import { IconArrowRotateCounterClockwise } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowRotateCounterClockwise';
import { PlaygroundIntro } from '@/components/PlaygroundIntro/PlaygroundIntro';
import { SectionDivider } from '@/components/SectionDivider/SectionDivider';
import { DesignPicker } from '@/components/DesignPicker/DesignPicker';
import { FlowPicker } from '@/components/FlowPicker/FlowPicker';
import type { CardDesign } from '@/data/design';
import type { ActionId, WalletState } from '@/data/actions';
import styles from './ConfigurePanel.module.scss';

interface ConfigurePanelProps {
  design: CardDesign;
  onDesignChange: (patch: Partial<CardDesign>) => void;
  wallet: WalletState;
  onAction: (id: ActionId) => void;
  onReset: () => void;
}

export function ConfigurePanel({
  design,
  onDesignChange,
  wallet,
  onAction,
  onReset,
}: ConfigurePanelProps) {
  return (
    <aside className={styles.panel}>
      <div className={styles.body}>
        <PlaygroundIntro />
        <div className={styles.content}>
          <div className={styles.section}>
            <SectionDivider label="Design your card" />
            <DesignPicker design={design} onChange={onDesignChange} />
          </div>

          <div className={styles.section}>
            <SectionDivider
              label="Explore flows"
              action={
                wallet.hasCard ? (
                  <button type="button" className={styles.resetBtn} onClick={onReset}>
                    <IconArrowRotateCounterClockwise size={12} />
                    Reset
                  </button>
                ) : null
              }
            />
            <FlowPicker wallet={wallet} onAction={onAction} />
          </div>
        </div>
      </div>
    </aside>
  );
}
