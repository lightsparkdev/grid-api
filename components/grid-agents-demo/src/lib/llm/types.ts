/* The model behind the composer, whatever provider runs it. It never touches
   the phone: it answers in a fixed shape, and the brain decides what that
   does (see apps/agents/brain). */

export interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
}

/** What the model must answer with. `flow` is one of the playground's flows, or none. */
export interface ModelAnswer {
  reply: string;
  flow: string;
  variant?: string;
}

export interface ModelRequest {
  system: string;
  turns: ChatTurn[];
  /** The flows the model may start, for its schema. */
  flows: string[];
  variants: string[];
}

export interface ModelAdapter {
  answer(req: ModelRequest): Promise<ModelAnswer>;
}
