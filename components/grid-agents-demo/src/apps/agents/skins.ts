import type { ComponentType } from 'react';
import type { ConnectorId } from '@/data/connectors';
import { ClaudeChat } from './claude/ClaudeChat';
import { DOTS_READS_FOR, DotChat } from './dot/DotChat';
import { GrokChat } from './grok/GrokChat';
import { INSTINCT_READS_FOR, InstinctChat } from './instinct/InstinctChat';
import { MuseChat } from './muse/MuseChat';
import type { AgentChatProps } from './types';
import { YourAppChat } from './yourapp/YourAppChat';

/* Each connector's face. Skins only render: the conversation, its flows and
   their Grid calls live in the brain above them (brain/useAgentBrain), so a
   skin never holds flow logic, and switching apps keeps everything. */

export interface AgentSkin {
  id: ConnectorId;
  Chat: ComponentType<AgentChatProps>;
  /** How long the agent takes to read your message before it reacts or types (ms; the apps answer at once). */
  readsFor?: number;
}

export const SKINS: Record<ConnectorId, AgentSkin> = {
  muse: { id: 'muse', Chat: MuseChat },
  grok: { id: 'grok', Chat: GrokChat },
  dot: { id: 'dot', Chat: DotChat, readsFor: DOTS_READS_FOR },
  instinct: { id: 'instinct', Chat: InstinctChat, readsFor: INSTINCT_READS_FOR },
  claude: { id: 'claude', Chat: ClaudeChat },
  yourapp: { id: 'yourapp', Chat: YourAppChat },
};
