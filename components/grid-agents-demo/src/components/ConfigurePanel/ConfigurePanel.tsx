'use client';

import { IconArrowRotateCounterClockwise } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowRotateCounterClockwise';
import { PlaygroundIntro } from '@/components/PlaygroundIntro/PlaygroundIntro';
import { SectionDivider } from '@/components/SectionDivider/SectionDivider';
import { ConnectorPicker } from '@/components/ConnectorPicker/ConnectorPicker';
import { FlowPicker } from '@/components/FlowPicker/FlowPicker';
import { FLOW_GROUPS, type ActionId } from '@/data/actions';
import type { ConnectorId } from '@/data/connectors';
import { pressable } from '@/lib/sounds';
import styles from './ConfigurePanel.module.scss';

interface ConfigurePanelProps {
  connector: ConnectorId;
  onConnectorSelect: (id: ConnectorId) => void;
  activeFlow: ActionId | null;
  /** Something has happened that Reset would undo. */
  dirty: boolean;
  onAction: (id: ActionId) => void;
  onReset: () => void;
}

export function ConfigurePanel({
  connector,
  onConnectorSelect,
  activeFlow,
  dirty,
  onAction,
  onReset,
}: ConfigurePanelProps) {
  return (
    <aside className={styles.panel}>
      <div className={styles.body}>
        <div className={styles.content}>
          <PlaygroundIntro />

          <section className={styles.section}>
            <SectionDivider label="Select agent" />
            <ConnectorPicker selected={connector} onSelect={onConnectorSelect} />
          </section>

          {FLOW_GROUPS.map((group, i) => (
            <section key={group.label} className={styles.section}>
              <SectionDivider
                label={group.label}
                action={
                  i === 0 && dirty ? (
                    <button type="button" className={styles.resetBtn} {...pressable({ onClick: onReset })}>
                      <IconArrowRotateCounterClockwise size={12} aria-hidden />
                      Reset
                    </button>
                  ) : null
                }
              />
              <FlowPicker flows={group.flows} activeFlow={activeFlow} onAction={onAction} />
            </section>
          ))}
        </div>
      </div>
    </aside>
  );
}
