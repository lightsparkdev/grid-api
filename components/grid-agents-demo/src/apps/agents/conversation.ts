import type { AgentEvent } from '@/data/agentEvents';

/* Two shapes of the same conversation. The brain stores what was meant (a
   line's key and its values); each app's voice renders it into what that app
   would say. Switching apps re-renders the same thread in the new voice. */

/** Values a line, ask or note is written with. */
export type Params = Record<string, string | number>;

/* ── Rendered: what a skin draws ─────────────────────────────────────── */

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
  denied?: string;
  /** The merchant whose terms the person accepts by allowing (Meta Pay's footnote). */
  legal?: string;
}

/** An info card in the thread: a receipt, an address, a summary, a list. */
export interface AgentNote {
  title: string;
  lines: string[];
  /** A settled receipt draws a check. */
  done?: boolean;
  /** A value to show in mono, such as an address. */
  code?: string;
  /** A list of rows (History): title, detail, and a signed amount. */
  rows?: { title: string; detail: string; amount: string; incoming: boolean }[];
}

/** open → the visitor taps; pressing/authing → Face ID; done or denied; expired when a new flow replaced it. */
export type AskState = 'open' | 'pressing' | 'authing' | 'done' | 'denied' | 'expired';

export type Message =
  | { id: number; kind: 'me'; text: string }
  | { id: number; kind: 'them'; text: string; sender?: string; bullets?: string[]; typing: boolean }
  | { id: number; kind: 'ask'; ask: AgentAsk; state: AskState }
  | { id: number; kind: 'card'; card: AgentNote; sender?: string }
  | { id: number; kind: 'chips'; chips: Chip[]; picked: number | null; expired?: boolean }
  | { id: number; kind: 'tag'; text: string }
  | { id: number; kind: 'stamp'; text: string };

/* ── Stored: what the brain keeps ────────────────────────────────────── */

/** Something said, by key (rendered in the current app's voice) or verbatim (the model's replies). */
export type Said = { key: string; params?: Params } | { text: string };

export type StoredMessage =
  | { id: number; kind: 'me'; text: string }
  | { id: number; kind: 'them'; said: Said; sender?: string; typing: boolean }
  | { id: number; kind: 'ask'; key: string; params?: Params; state: AskState }
  | { id: number; kind: 'card'; key: string; params?: Params }
  | { id: number; kind: 'chips'; chips: Chip[]; picked: number | null; expired?: boolean }
  | { id: number; kind: 'stamp'; text: string };

/* ── Flows: what a conversation does ─────────────────────────────────── */

/**
 * One beat of a flow. Most play on their own; an ask or chips wait for the
 * visitor. `when` builds its beats when it's reached, so they read the
 * account as it is then.
 */
export type Beat =
  | { say: string; params?: Params; sender?: string }
  | { card: string; params?: Params }
  | { ask: string; params?: Params; faceId?: boolean; allow: Beat[]; deny: Beat[] }
  | { chips: Chip[]; reply?: boolean; then: (picked: number) => Beat[] }
  | { emit: AgentEvent }
  | { pause: number }
  | { when: () => Beat[] };
