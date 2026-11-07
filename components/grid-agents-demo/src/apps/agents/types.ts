import type { AgentBrain } from './brain/useAgentBrain';
import type { Message } from './conversation';

/** The conversation as a skin sees it: the thread in its own voice, and what the visitor can do. */
export type ChatView = Omit<AgentBrain, 'messages'> & { messages: Message[] };

/** What every agent app gets: the running conversation, and the theme to draw it in. */
export interface AgentChatProps {
  chat: ChatView;
  dark: boolean;
}
