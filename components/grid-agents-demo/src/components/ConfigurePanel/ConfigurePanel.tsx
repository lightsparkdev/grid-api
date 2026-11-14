'use client';

import { IconArrowRotateCounterClockwise } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowRotateCounterClockwise';
import { useDialKit } from 'dialkit';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import { PlaygroundIntro } from '@/components/PlaygroundIntro/PlaygroundIntro';
import { SectionDivider } from '@/components/SectionDivider/SectionDivider';
import { ConnectorPicker } from '@/components/ConnectorPicker/ConnectorPicker';
import { FlowPicker, TILE_STEP_S } from '@/components/FlowPicker/FlowPicker';
import { ModeSwitch } from '@/components/ModeSwitch/ModeSwitch';
import { FLOW_GROUPS, type ActionId } from '@/data/actions';
import type { ConnectorId } from '@/data/connectors';
import type { Mode } from '@/data/mode';
import { easeOutSnappy, motionTransition } from '@/lib/easing';
import { pressable } from '@/lib/sounds';
import styles from './ConfigurePanel.module.scss';

/** The switch styles to compare, from the tuning panel (local builds only; production gets the default). */
const SWITCH_STYLES = [
  { value: 'tiles', label: 'Tiles under the agents' },
  { value: 'tabs-top', label: 'Designer tabs, above the agents' },
  { value: 'tabs-below', label: 'Designer tabs, under the agents' },
  { value: 'row', label: 'Row inside the agents' },
  { value: 'segmented', label: 'Segmented pill' },
  { value: 'flow-tabs', label: 'Tabs on the flows' },
  { value: 'explore', label: 'Explore flows, for personal or business' },
  { value: 'use-case', label: 'Select use case, then its flows' },
] as const;
type SwitchStyle = (typeof SWITCH_STYLES)[number]['value'];

/** Switching accounts: the old flows blur out at once, then the tiles rise one after another down the panel, each
 *  section's card fading in as its first tile arrives (`custom`: that tile's place). */
const FLOWS_IN: Variants = { hidden: {}, rest: {} };
const SECTION_IN: Variants = {
  hidden: { opacity: 0 },
  rest: (first: number) => ({ opacity: 1, transition: motionTransition(easeOutSnappy, 0.3, { delay: first * TILE_STEP_S }) }),
};
const FLOWS_OUT = { opacity: 0, filter: 'blur(6px)', transition: motionTransition(easeOutSnappy, 0.14) };

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
  const { style } = useDialKit(
    'Account switch',
    { style: { type: 'select', options: [...SWITCH_STYLES], default: 'use-case' } },
    { id: 'account-switch', persist: true },
  );
  const switchStyle = style as SwitchStyle;
  const modeSwitch = (variant: 'tiles' | 'tabs' | 'segmented', inset?: boolean) => (
    <ModeSwitch mode={mode} onSelect={onModeSelect} variant={variant} inset={inset} />
  );
  const flowTabs = switchStyle === 'flow-tabs';
  const explore = switchStyle === 'explore';
  const useCase = switchStyle === 'use-case';
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

          {switchStyle === 'tabs-top' && modeSwitch('tabs')}

          <section className={styles.section}>
            <SectionDivider label="Select agent" />
            <ConnectorPicker
              selected={connector}
              onSelect={onConnectorSelect}
              footer={switchStyle === 'row' ? <ModeSwitch mode={mode} onSelect={onModeSelect} variant="row" /> : undefined}
            />
            {switchStyle === 'tiles' && modeSwitch('tiles')}
            {switchStyle === 'tabs-below' && modeSwitch('tabs', true)}
          </section>

          {useCase && (
            <section className={styles.section}>
              <SectionDivider label="Select use case" />
              {modeSwitch('tiles')}
            </section>
          )}

          {switchStyle === 'segmented' && (
            <section className={styles.section}>
              <SectionDivider label="Select account" />
              {modeSwitch('segmented')}
            </section>
          )}

          <div className={styles.flows}>
            {flowTabs && <ModeSwitch mode={mode} onSelect={onModeSelect} variant="heading" action={reset} />}
            {explore && (
              <>
                <SectionDivider label="Explore flows" action={reset} />
                <ModeSwitch mode={mode} onSelect={onModeSelect} variant="tiles" forWhom />
              </>
            )}
            {useCase && <SectionDivider label={mode === 'business' ? 'Explore business flows' : 'Explore personal flows'} action={reset} morph />}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={mode} className={styles.flows} variants={FLOWS_IN} initial="hidden" animate="rest" exit={FLOWS_OUT}>
                {FLOW_GROUPS[mode].map((group, i, groups) => {
                  const first = groups.slice(0, i).reduce((n, g) => n + g.flows.length, 0);
                  return (
                    <motion.section key={group.label} className={styles.section} variants={SECTION_IN} custom={first}>
                      {!explore && !useCase && !(flowTabs && i === 0) && <SectionDivider label={group.label} action={i === 0 ? reset : null} />}
                      <FlowPicker flows={group.flows} columns={group.columns} activeFlow={activeFlow} onAction={onAction} firstTile={first} />
                    </motion.section>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </aside>
  );
}
