'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useMemo, useRef } from 'react';
import type { ConnectorId } from '@/data/connectors';
import type { ChatTurn } from '@/lib/llm/types';
import { easeOutQuick, motionTransition } from '@/lib/easing';
import { useAgentBrain, type FreeTextReply } from './brain/useAgentBrain';
import type { Message } from './conversation';
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

export interface AgentHostProps extends Omit<BrainOptions, 'reply' | 'readsFor'> {
  connector: ConnectorId;
  dark: boolean;
  /** Answers free text, given the thread so far as this app says it. */
  reply: (text: string, history: ChatTurn[]) => Promise<FreeTextReply>;
}

const HISTORY_TURNS = 12;

/** The last few things said, as the model reads them. */
function turnsOf(messages: Message[]): ChatTurn[] {
  return messages
    .flatMap((m): ChatTurn[] => {
      if (m.kind === 'me') return [{ role: 'user', text: m.meant ?? m.text }];
      if (m.kind === 'them' && !m.typing && m.text) return [{ role: 'assistant', text: m.text }];
      return [];
    })
    .slice(-HISTORY_TURNS);
}

/**
 * The phone's app: one conversation, drawn by whichever app is connected.
 * The brain lives here, above the skins, and stays mounted across switches,
 * so a flow halfway through carries on in the next app's look and voice.
 */
export function AgentHost({ connector, dark, reply, ...options }: AgentHostProps) {
  const rendered = useRef<Message[]>([]);
  // The model gets the person's message once, as the turn: if the thread has
  // already rendered it, it's dropped from the history.
  const replyWithHistory = useCallback(
    (text: string) => {
      const turns = turnsOf(rendered.current);
      const last = turns[turns.length - 1];
      return reply(text, last?.role === 'user' && last.text === text ? turns.slice(0, -1) : turns);
    },
    [reply],
  );
  const brain = useAgentBrain({ ...options, reply: replyWithHistory, readsFor: SKINS[connector].readsFor });
  const voice = useMemo(() => voiceFor(connector), [connector]);
  const messages = useMemo(() => renderThread(brain.messages, voice), [brain.messages, voice]);
  rendered.current = messages;
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
