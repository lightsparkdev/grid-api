/* The model behind the composer, whatever provider runs it. It plans with tools; the phone carries them out and
   sends back what happened (see lib/llm/tools and apps/agents/tools). */

import type { ToolCall, Turn } from './tools';

export interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
}

export interface StepRequest {
  /** The instructions that never change (cached), then where things stand this turn. */
  system: { fixed: string; now: string };
  turns: Turn[];
}

export interface Usage {
  input: number;
  cacheRead: number;
  cacheWrite: number;
  output: number;
}

export interface StepAnswer {
  calls: ToolCall[];
  usage: Usage;
}

export interface ModelAdapter {
  step(req: StepRequest): Promise<StepAnswer>;
}

/** What /api/agent sends the page: the next tool calls, or why it fell back to a scripted line. */
export interface AgentResponse {
  calls?: ToolCall[];
  fallback?: string;
}
