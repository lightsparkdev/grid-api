'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useMemo } from 'react';
import type { ConnectorId } from '@/data/connectors';
import { easeOutQuick, motionTransition } from '@/lib/easing';
import { useAgentBrain } from './brain/useAgentBrain';
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

export interface AgentHostProps extends BrainOptions {
  connector: ConnectorId;
  dark: boolean;
}

/**
 * The phone's app: one conversation, drawn by whichever app is connected.
 * The brain lives here, above the skins, and stays mounted across switches,
 * so a flow halfway through carries on in the next app's look and voice.
 */
export function AgentHost({ connector, dark, ...options }: AgentHostProps) {
  const brain = useAgentBrain(options);
  const voice = useMemo(() => voiceFor(connector), [connector]);
  const messages = useMemo(() => renderThread(brain.messages, voice), [brain.messages, voice]);
  const chat: ChatView = { ...brain, messages };
  const { Chat } = SKINS[connector];
  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={connector}
        className={styles.skinLayer}
        initial={SKIN_HIDDEN}
        animate={{ ...SKIN_ENTER, transition: SKIN_FADE }}
        exit={{ ...SKIN_EXIT, transition: SKIN_FADE }}
      >
        <Chat chat={chat} dark={dark} />
      </motion.div>
    </AnimatePresence>
  );
}
