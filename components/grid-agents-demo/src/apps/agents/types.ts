import type { AgentChat } from './useAgentChat';

/** What every agent app gets: the running conversation, and the theme to draw it in. */
export interface AgentChatProps {
  chat: AgentChat;
  dark: boolean;
}
