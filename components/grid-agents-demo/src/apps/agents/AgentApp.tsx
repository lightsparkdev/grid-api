'use client';

import type { ComponentType } from 'react';
import type { AgentEvent } from '@/data/agentEvents';
import { historyFor } from '@/data/agentScripts';
import type { ConnectorId } from '@/data/connectors';
import { ClaudeChat } from './claude/ClaudeChat';
import { DotChat } from './dot/DotChat';
import { GrokChat } from './grok/GrokChat';
import { InstinctChat } from './instinct/InstinctChat';
import { MuseChat } from './muse/MuseChat';
import type { AgentChatProps } from './types';
import { useAgentChat, type ChatRun } from './useAgentChat';
import { YourAppChat } from './yourapp/YourAppChat';

/** Each connector's app, from the Figma file (website-q4-2026, Agent apps). */
const APPS: Record<ConnectorId, ComponentType<AgentChatProps>> = {
  muse: MuseChat,
  grok: GrokChat,
  dot: DotChat,
  instinct: InstinctChat,
  claude: ClaudeChat,
  yourapp: YourAppChat,
};

export interface AgentAppProps {
  connector: ConnectorId;
  run?: ChatRun;
  onEvent?: (event: AgentEvent) => void;
  onSettled?: () => void;
  dark: boolean;
}

/** The connected agent's app on the phone, playing the flows the visitor picks. */
export function AgentApp({ connector, run, onEvent, onSettled, dark }: AgentAppProps) {
  const chat = useAgentChat({ history: historyFor(connector), run, onEvent, onSettled });
  const App = APPS[connector];
  return <App chat={chat} dark={dark} />;
}
