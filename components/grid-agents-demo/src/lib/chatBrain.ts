import type { BrainStep } from '@/apps/agents/conversation';
import type { ActionId, WalletState } from '@/data/actions';
import type { Limits } from '@/data/agentEvents';
import type { ConnectorId } from '@/data/connectors';
import { scriptFor } from '@/data/agentScripts';

/** What a flow's conversation knows when it starts. */
export interface BrainContext {
  connector: ConnectorId;
  flow: ActionId;
  wallet: WalletState;
  /** The agent's policy now, so the story matches what Grid will do. */
  limits: Limits;
  needsApproval: (usdCents: number) => boolean;
  /** What the visitor typed, once the chat takes free input. */
  userText?: string;
}

/**
 * Where a flow's conversation comes from. It yields the chat's steps, and the
 * Grid events the chat makes happen, in order; the chat plays them and the
 * API panel shows the events as calls. Today it plays scripts. A model-backed
 * brain (behind `/api/agent`) streams the same steps.
 */
export type ChatBrain = (ctx: BrainContext) => AsyncIterable<BrainStep>;

export const scriptedBrain: ChatBrain = (ctx) => {
  const steps = scriptFor(ctx);
  return {
    [Symbol.asyncIterator]() {
      let i = 0;
      return {
        next: async () => (i < steps.length ? { value: steps[i++], done: false } : { value: undefined, done: true }),
      };
    },
  };
};
