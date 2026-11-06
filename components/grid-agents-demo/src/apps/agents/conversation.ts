import type { AgentEvent } from '@/data/agentEvents';
import type { ConnectorId } from '@/data/connectors';

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
  /** What it is, for the apps that draw a line glyph ahead of the label (Dots). */
  glyph?: ChipGlyph;
}

export type ChipGlyph = 'card' | 'bank' | 'coin' | 'bolt' | 'check';

/** A row of an approval card: what, where, who, paid with. */
export interface AskRow {
  text: string;
  sub?: string;
  /** A glyph the skin knows how to draw, or an image path. */
  icon?: 'product' | 'truck' | 'envelope' | 'meta' | 'wallet' | 'lock' | 'gauge' | 'checkmark' | 'card';
  image?: string;
}

/** A form the person fills in and submits as their approval (Grok's consent and limits). */
export interface AgentForm {
  title: string;
  sub: string;
  sheetTitle: string;
  fields: { label: string; value: string }[];
  toggle?: string;
  submitted: string;
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
  /** Omitted when there's nothing to decline (the person asked for it): the card shows only the way forward. */
  deny?: string;
  denied?: string;
  /** The merchant whose terms the person accepts by allowing (Muse's footnote). */
  legal?: string;
  form?: AgentForm;
  /** A card going into the vault: what the scan finds. */
  card?: { brand: string; last4: string; expires: string; name: string };
  /** A bank to link for top-ups: the skin opens the bank flow (vault/BankLink), which picks the country and account. */
  bank?: true;
  /** With `bank`: someone else's bank, to pay them. The flow opens on their account, filled in for their country. */
  recipient?: { name: string; first: string; country: string };
  /** The ask as a text, for an app you answer by texting back (Instinct): what it proposes and how to say yes. */
  text?: string;
}

/** The app's own balance: the website card's anatomy, plus what each app shows natively. */
export interface AgentBalance {
  /** What the app calls it: "Bot balance", "Dots balance". */
  wallet: string;
  amount: string;
  note: string;
  /** Spent today against the daily limit, 0..1, for the apps that draw a track. */
  spent: { today: string; limit: string; ratio: number };
  stats: { label: string; value: string }[];
  activity: { title: string; detail: string; amount: string; incoming: boolean }[];
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
  /** The app's balance card (Balance, and the account a connect sets up). */
  balance?: AgentBalance;
}

/** A product the agent found: a card in a carousel, an image Instinct sends, a line in a list. */
export interface Product {
  title: string;
  merchant: string;
  domain: string;
  price: string;
  rating?: string;
  image: string;
  /** The one the agent goes with. */
  pick?: boolean;
}

/** Another agent yours worked with: what it thought, step by step, and what they said to each other. */
export interface SubAgent {
  name: string;
  initial: string;
  working: string;
  done: string;
  steps: { title: string; detail: string }[];
  messages: { from: 'us' | 'them'; text: string }[];
}

/** A small centered line about the agent itself: a routine it set up, a saved setting. */
export interface AgentMeta {
  text: string;
  icon: 'routine' | 'check';
}

/** open → the visitor taps; pressing/authing → Face ID; done or denied; expired when a new flow replaced it. */
export type AskState = 'open' | 'pressing' | 'authing' | 'done' | 'denied' | 'expired';

export type Message =
  | { id: number; kind: 'me'; text: string; react?: string; meant?: string }
  | { id: number; kind: 'them'; text: string; sender?: string; bullets?: string[]; typing: boolean }
  | { id: number; kind: 'ask'; ask: AgentAsk; state: AskState }
  | { id: number; kind: 'card'; card: AgentNote; sender?: string }
  | { id: number; kind: 'chips'; chips: Chip[]; picked: number | null; expired?: boolean }
  | { id: number; kind: 'work'; key: string; status: string }
  | { id: number; kind: 'products'; products: Product[] }
  | { id: number; kind: 'subagent'; agent: SubAgent; done: boolean }
  | { id: number; kind: 'meta'; meta: AgentMeta }
  | { id: number; kind: 'divider'; text: string }
  | { id: number; kind: 'tag'; text: string }
  | { id: number; kind: 'stamp'; text: string };

/* ── Stored: what the brain keeps ────────────────────────────────────── */

/** Something said, by key (rendered in the current app's voice) or verbatim (the model's replies, written in every app's voice). */
export type Said = { key: string; params?: Params } | { text: string; voices?: Partial<Record<ConnectorId, string>> };

export type StoredMessage =
  | { id: number; kind: 'me'; text: string; react?: string; meant?: string }
  | { id: number; kind: 'them'; said: Said; sender?: string; typing: boolean }
  | { id: number; kind: 'ask'; key: string; params?: Params; state: AskState }
  | { id: number; kind: 'card'; key: string; params?: Params }
  | { id: number; kind: 'chips'; chips: Chip[]; picked: number | null; expired?: boolean }
  | { id: number; kind: 'work'; key: string; params?: Params }
  | { id: number; kind: 'products'; key: string }
  | { id: number; kind: 'subagent'; key: string; params?: Params; done: boolean }
  | { id: number; kind: 'meta'; key: string; params?: Params }
  | { id: number; kind: 'divider'; text: string }
  | { id: number; kind: 'stamp'; text: string };

/* ── Flows: what a conversation does ─────────────────────────────────── */

/**
 * One beat of a flow. Most play on their own; an ask or chips wait for the
 * visitor. `when` builds its beats when it's reached, so they read the
 * account as it is then. `work` shows what the agent is doing for `ms`, and
 * stays up until the next thing it says or shows.
 */
export type Beat =
  | { say: string; params?: Params; sender?: string }
  | { card: string; params?: Params }
  | { work: string; ms: number; params?: Params }
  | { products: string }
  | { subagent: string; ms: number; params?: Params }
  | { react: string }
  | { meta: string; params?: Params }
  | { divider: string }
  | { ask: string; params?: Params; faceId?: boolean; allow: Beat[]; deny: Beat[] }
  | { chips: Chip[]; reply?: boolean; then: (picked: number) => Beat[] }
  | { emit: AgentEvent }
  | { pause: number }
  | { when: () => Beat[] };
