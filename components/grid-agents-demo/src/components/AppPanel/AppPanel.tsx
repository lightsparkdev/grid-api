'use client';

import { AgentApp, type AgentAppProps } from '@/apps/agents/AgentApp';
import { DEFAULT_OVERLAY_GLASS } from '@/apps/shared/glass';
import { DotGridCanvas } from '@/components/DotGridCanvas/DotGridCanvas';
import { DemoPhone } from '@/components/DemoPhone/DemoPhone';
import { PHONE_SHELL_GLASS } from '@/components/liquid-glass';
import { useThemeMode } from '@/hooks/useThemeMode';
import styles from './AppPanel.module.scss';

export interface AppPanelProps extends Omit<AgentAppProps, 'dark'> {
  /** Remounts the agent's app so its thread starts over. */
  chatKey: number;
}

/** The stage: the person's phone on the dot grid, running the connected agent's app. */
export function AppPanel({ chatKey, connector, run, onEvent, onSettled }: AppPanelProps) {
  const dark = useThemeMode() === 'dark';
  return (
    <section className={styles.panel}>
      <div className={styles.body}>
        <div className={styles.phoneStage}>
          <DotGridCanvas glassConfig={PHONE_SHELL_GLASS}>
            <DemoPhone glassConfig={PHONE_SHELL_GLASS} overlayGlass={DEFAULT_OVERLAY_GLASS} glassDemoBg externalGlass>
              <AgentApp
                key={`${connector}-${chatKey}`}
                connector={connector}
                run={run}
                onEvent={onEvent}
                onSettled={onSettled}
                dark={dark}
              />
            </DemoPhone>
          </DotGridCanvas>
        </div>
      </div>
    </section>
  );
}
