'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useMemo, useRef } from 'react';
import type { ConnectorId } from '@/data/connectors';
import type { Turn } from '@/lib/llm/tools';
import { easeOutQuick, motionTransition } from '@/lib/easing';
import { useAgentBrain, type StepReply } from './brain/useAgentBrain';
import type { StoredMessage } from './conversation';
import { OpenSheetsContext, type OpenSheets } from './openSheets';
import { SKINS } from './skins';
import type { ChatView } from './types';
import { renderThread, voiceFor } from './voices';
import styles from './AgentHost.module.scss';

// The Global Accounts playground's skin swap (SignInFlow.tsx), unchanged.
const SKIN_FADE = motionTransition(easeOutQuick, 0.3);
const SKIN_ENTER = { opacity: 1, filter: 'blur(0px)', transitionEnd: { filter: 'none' as const } };
const SKIN_HIDDEN = { opacity: 0, filter: 'blur(8px)' };
// The exiting layer must never eat taps meant for the incoming skin.
const SKIN_EXIT = { ...SKIN_HIDDEN, pointerEvents: 'none' as const };

type BrainOptions = Parameters<typeof useAgentBrain>[0];

export interface AgentHostProps extends Omit<BrainOptions, 'reply' | 'describe' | 'readsFor' | 'typesFor'> {
  connector: ConnectorId;
  dark: boolean;
  /** The model's next step for the conversation so far. */
  reply: (turns: Turn[]) => Promise<StepReply>;
}

/**
 * The phone's app: one conversation, drawn by whichever app is connected.
 * The brain lives here, above the skins, and stays mounted across switches,
 * so a flow halfway through carries on in the next app's look and voice.
 */
export function AgentHost({ connector, dark, reply, ...options }: AgentHostProps) {
  const voice = useMemo(() => voiceFor(connector), [connector]);
  const voiceRef = useRef(voice);
  voiceRef.current = voice;
  // What a scripted run said, in this app's words, for the model to read back.
  const describe = useCallback(
    (list: StoredMessage[]) =>
      renderThread(list, voiceRef.current)
        .flatMap((m) => (m.kind === 'them' && !m.typing && m.text ? [m.text] : []))
        .join(' ')
        .slice(0, 600),
    [],
  );
  const brain = useAgentBrain({ ...options, reply, describe, readsFor: SKINS[connector].readsFor, typesFor: SKINS[connector].typesFor });
  const messages = useMemo(() => renderThread(brain.messages, voice), [brain.messages, voice]);
  const chat: ChatView = { ...brain, messages };
  const { Chat } = SKINS[connector];
  const sheets = useRef<OpenSheets>({ balance: false, ask: null, plaid: null });
  const kept = useMemo(() => ({ sheets, wallet: voice.wallet }), [voice]);
  // The first app is just there; later ones fade in. Not AnimatePresence's `initial={false}`: that also stops every
  // row inside the first app from ever playing its entrance.
  const first = useRef(connector);
  const switched = useRef(false);
  if (connector !== first.current) switched.current = true;
  return (
    <OpenSheetsContext.Provider value={kept}>
      <AnimatePresence>
        <motion.div
          key={connector}
          className={styles.skinLayer}
          initial={switched.current ? SKIN_HIDDEN : false}
          animate={{ ...SKIN_ENTER, transition: SKIN_FADE }}
          exit={{ ...SKIN_EXIT, transition: SKIN_FADE }}
        >
          <Chat chat={chat} dark={dark} />
        </motion.div>
      </AnimatePresence>
    </OpenSheetsContext.Provider>
  );
}
