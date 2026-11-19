'use client';

import { AgentHost } from '@/apps/agents/AgentHost';
import { DEFAULT_OVERLAY_GLASS } from '@/apps/shared/glass';
import { DotGridCanvas } from '@/components/DotGridCanvas/DotGridCanvas';
import { DemoPhone } from '@/components/DemoPhone/DemoPhone';
import { PHONE_SHELL_GLASS } from '@/components/liquid-glass';
import type { ConnectorId } from '@/data/connectors';
import { MODES, type Mode } from '@/data/mode';
import { useThemeMode } from '@/hooks/useThemeMode';
import type { AccountState } from '@/hooks/useAgentsDemoLogic';
import styles from './AppPanel.module.scss';

export interface AppPanelProps {
  connector: ConnectorId;
  mode: Mode;
  /** The accounts opened so far: each keeps its phone, so switching back finds it where it was. */
  opened: Mode[];
  accounts: Record<Mode, AccountState>;
  /** The agent takes them to their other account, with what they asked for there. */
  onSwitchAccount: (to: Mode, carry?: string) => void;
  carried: Partial<Record<Mode, { nonce: number; text: string }>>;
}

/**
 * The stage: the person's phone on the dot grid, running the connected agent's app. Each account has its own
 * conversation; the one not showing stays mounted (once opened) so switching back finds it where it was.
 */
export function AppPanel({ connector, mode, opened, accounts, onSwitchAccount, carried }: AppPanelProps) {
  const dark = useThemeMode() === 'dark';
  return (
    <section className={styles.panel}>
      <div className={styles.body}>
        <div className={styles.phoneStage}>
          <DotGridCanvas glassConfig={PHONE_SHELL_GLASS}>
            <DemoPhone glassConfig={PHONE_SHELL_GLASS} overlayGlass={DEFAULT_OVERLAY_GLASS} glassDemoBg externalGlass>
              {MODES.filter((m) => opened.includes(m)).map((m) => {
                const a = accounts[m];
                return (
                  <div
                    key={m}
                    className={styles.account}
                    data-hidden={m !== mode || undefined}
                    ref={(el) => {
                      if (el) el.inert = m !== mode;
                    }}
                  >
                    <AgentHost
                      key={a.chatKey}
                      connector={connector}
                      mode={m}
                      wallet={a.account.business ? `${a.account.business.company} balance` : undefined}
                      dark={dark}
                      entry={a.entry}
                      context={a.context}
                      onEvent={a.onEvent}
                      onActiveFlow={a.setActiveFlow}
                      onRun={a.onRun}
                      onCompleted={a.onCompleted}
                      onDeclined={a.onDeclined}
                      reply={a.reply}
                      onSwitchAccount={onSwitchAccount}
                      carried={carried[m]}
                    />
                  </div>
                );
              })}
            </DemoPhone>
          </DotGridCanvas>
        </div>
      </div>
    </section>
  );
}
