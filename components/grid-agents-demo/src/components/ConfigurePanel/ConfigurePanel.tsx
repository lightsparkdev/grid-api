'use client';

import { IconArrowRotateCounterClockwise } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowRotateCounterClockwise';
import { PlaygroundIntro } from '@/components/PlaygroundIntro/PlaygroundIntro';
import { SectionDivider } from '@/components/SectionDivider/SectionDivider';
import { ConnectorPicker } from '@/components/ConnectorPicker/ConnectorPicker';
import { FlowPicker } from '@/components/FlowPicker/FlowPicker';
import { ModeSwitch } from '@/components/ModeSwitch/ModeSwitch';
import { FLOW_GROUPS, type ActionId } from '@/data/actions';
import type { ConnectorId } from '@/data/connectors';
import type { Mode } from '@/data/mode';
import { pressable } from '@/lib/sounds';
import styles from './ConfigurePanel.module.scss';

interface ConfigurePanelProps {
  connector: ConnectorId;
  onConnectorSelect: (id: ConnectorId) => void;
  mode: Mode;
  onModeSelect: (mode: Mode) => void;
  activeFlow: ActionId | null;
  /** Something has happened that Reset would undo. */
  dirty: boolean;
  onAction: (id: ActionId) => void;
  onReset: () => void;
}

export function ConfigurePanel({ connector, onConnectorSelect, mode, onModeSelect, activeFlow, dirty, onAction, onReset }: ConfigurePanelProps) {
  const reset = dirty ? (
    <button type="button" className={styles.resetBtn} {...pressable({ onClick: onReset })}>
      <IconArrowRotateCounterClockwise size={12} aria-hidden />
      Reset
    </button>
  ) : null;
  return (
    <aside className={styles.panel}>
      <div className={styles.body}>
        <div className={styles.content}>
          <PlaygroundIntro />

          <section className={styles.section}>
            <SectionDivider label="Select agent" />
            <ConnectorPicker selected={connector} onSelect={onConnectorSelect} />
          </section>

          <section className={styles.section}>
            <SectionDivider label="Select use case" />
            <ModeSwitch mode={mode} onSelect={onModeSelect} />
          </section>

          <div className={styles.flows}>
            <SectionDivider label={mode === 'business' ? 'Explore business flows' : 'Explore personal flows'} action={reset} morph />
            {FLOW_GROUPS[mode].map((group, i, groups) => {
              const first = groups.slice(0, i).reduce((n, g) => n + g.flows.length, 0);
              return (
                <section key={group.label} className={styles.section}>
                  <FlowPicker flows={group.flows} columns={group.columns} activeFlow={activeFlow} onAction={onAction} firstTile={first} />
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
