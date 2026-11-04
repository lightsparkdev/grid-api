import type { AgentEvent } from '@/data/agentEvents';

/** A quick-reply chip the agent offers. */
export interface Chip {
  label: string;
  /** Circle flag code (circle-flags), or an icon path. */
  flag?: string;
  icon?: string;
}

/** A row of an approval card: what, where, who, paid with. */
export interface AskRow {
  text: string;
  sub?: string;
  /** A glyph the skin knows how to draw, or an image path. */
  icon?: 'product' | 'truck' | 'envelope' | 'meta' | 'wallet' | 'lock' | 'gauge' | 'checkmark' | 'card';
  image?: string;
}

/**
 * What the agent needs the person to approve. One shape for every skin: Muse
 * draws it as Meta Pay's order sheet, Grok as a payout row, Claude as a spend
 * card, and the rest as a plain approval card.
 */
export interface AgentAsk {
  title: string;
  /** The merchant's initial (or a short mark) in the card's corner. */
  badge?: string;
  /** A single counterparty: a person, a bank, an agent. */
  who?: { name: string; flag?: string; icon?: string; detail: string };
  /** The headline amount. */
  amount?: string;
  rows?: AskRow[];
  total?: string;
  /** What pays: a balance, a card, a rail. */
  method?: string;
  expires?: string;
  allow?: string;
  allowed?: string;
  deny?: string;
  /** The merchant whose terms the person accepts by allowing (Meta Pay's footnote). */
  legal?: string;
}

/** An info card in the thread: a receipt, an address, a limits summary. */
export interface AgentNote {
  title: string;
  lines: string[];
  /** A settled receipt draws a check. */
  done?: boolean;
  /** A value to show in mono, such as an address. */
  code?: string;
}

/**
 * One beat of an agent conversation. `me` is typed on the keyboard unless
 * `quick` (a chip's reply lands as a message).
 */
export type Step =
  | { me: string; quick?: boolean }
  | { them: string; sender?: string; bullets?: string[] }
  /** `faceId`: the approval clears Face ID in the island before it lands. */
  | { ask: AgentAsk; faceId?: boolean }
  | { card: AgentNote; sender?: string; moment?: boolean }
  | { chips: Chip[]; pick: number }
  | { tag: string }
  | { stamp: string }
  | { pause: number };

/** A step, or a Grid call the conversation makes happen at that point. */
export type BrainStep = Step | { emit: AgentEvent };

export type Episode = Step[];

export type AskState = 'open' | 'pressing' | 'authing' | 'done';

export type Message =
  | { id: number; kind: 'me'; text: string }
  | { id: number; kind: 'them'; text: string; sender?: string; bullets?: string[]; typing: boolean }
  | { id: number; kind: 'ask'; ask: AgentAsk; state: AskState }
  | { id: number; kind: 'card'; card: AgentNote; sender?: string }
  | { id: number; kind: 'chips'; chips: Chip[]; picked: number | null }
  | { id: number; kind: 'tag'; text: string }
  | { id: number; kind: 'stamp'; text: string };
