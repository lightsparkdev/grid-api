/* The model behind the composer, whatever provider runs it. It never touches
   the phone: it answers in a fixed shape, and the brain decides what that
   does (see apps/agents/brain). */

import type { FlowParams } from '@/apps/agents/flows';
import type { ActionId } from '@/data/actions';
import type { ConnectorId } from '@/data/connectors';

export interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
}

/** What the model must answer with: the reply in every app's voice, a flow or none, and the details the flow needs. */
export interface ModelAnswer {
  replies: Record<ConnectorId, string>;
  flow: string;
  variant?: string;
  /** Replies to tap under a question. */
  suggestions?: string[];
  name?: string;
  country?: string;
  amount?: number;
  currency?: string;
  note?: string;
  method?: string;
  approve?: number;
  daily?: number;
  perTx?: number;
  merchant?: string;
  price?: number;
  query?: string;
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  /** More flows asked for in the same message, after this one, each with its own details. */
  then?: (Omit<ModelAnswer, 'replies' | 'suggestions' | 'then'> & { flow: string })[];
}

export interface ModelRequest {
  /** The instructions that never change (cached), then where things stand this turn. */
  system: { fixed: string; now: string };
  turns: ChatTurn[];
  /** The flows the model may start, for its schema. */
  flows: string[];
  variants: string[];
  connectors: ConnectorId[];
  /** Country codes a payment can go to. */
  countries: string[];
  methods: string[];
}

export interface ModelAdapter {
  answer(req: ModelRequest): Promise<ModelAnswer>;
}

/** What /api/agent sends the page: the reply and what it starts, or why it fell back to a scripted line. */
export interface AgentResponse {
  /** The reply in the app the person is in, and in every app's voice for when they switch. */
  reply?: string;
  replies?: Partial<Record<ConnectorId, string>>;
  flow?: ActionId;
  variant?: number;
  params?: FlowParams;
  /** Flows asked for in the same message, to run in order once this one finishes. */
  then?: { flow: ActionId; variant: number; params?: FlowParams }[];
  suggestions?: string[];
  fallback?: string;
}
