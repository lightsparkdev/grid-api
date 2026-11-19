import type { ConnectorId } from '@/data/connectors';
import type { AgentAsk, AgentMeta, AgentNote, Message, Params, Product, StoredMessage, SubAgent } from '../conversation';
import {
  ASKS,
  LINES,
  METAS,
  NOTES,
  PRODUCTS,
  STATUS,
  SUBAGENTS,
  type AskKey,
  type LineKey,
  type MetaKey,
  type NoteKey,
  type ProductsKey,
  type StatusKey,
  type SubAgentKey,
} from './base';
import { VOICES } from './apps';

export interface Voice {
  id: ConnectorId;
  name: string;
  /** Its money's name as a title ("Muse balance"), as the balance card heads it. */
  wallet: string;
  line(key: string, params?: Params): string;
  ask(key: string, params?: Params): AgentAsk;
  note(key: string, params?: Params): AgentNote;
  status(key: string, params?: Params): string;
  products(key: string, params?: Params): Product[];
  meta(key: string, params?: Params): AgentMeta;
  subagent(key: string, params?: Params): SubAgent;
}

/** Names that keep their capital at the start of a sentence in a lowercase voice. */
const PROPER =
  /^(Visa|Muse|Dots|Bot|Grok|Duet|Claude|Instinct|Plaid|Chase|Hotel|PIX|SPEI|ACH|SEPA|UPI|USDC|Bitcoin|Lightning|Spark|Base|Solana|Ethereum|Polygon|Arbitrum|Tron|Duolingo|Netflix|Spotify|[A-Z]{2,})/;

/** The people and businesses a line names, kept as written in a lowercase voice: "maya is on the team" reads wrong. */
const NAMED = ['company', 'owner', 'client', 'name', 'first', 'people', 'payer', 'vendor', 'merchant', 'hotel', 'to', 'bank', 'list'];
const namesIn = (p?: Params) => NAMED.flatMap((k) => String(p?.[k] ?? '').split(/[\s,]+/)).filter((w) => /^[A-ZÀ-ÖØ-Þ]/.test(w) && !/^(The|A|An)$/.test(w));

/** A neutral line in a lowercase voice (Dots, Instinct): each sentence opens lowercase, and so does "I". */
export function casual(text: string, keep: string[] = []): string {
  return text
    .replace(/(^|[.!?]\s+)([A-ZÀ-ÖØ-Þ][A-Za-zÀ-ÖØ-öø-ÿĀ-ž\d’'-]*)/g, (m, pre: string, word: string) =>
      PROPER.test(word) || keep.includes(word.replace(/[’']s$/, '')) ? m : pre + word[0].toLowerCase() + word.slice(1),
    )
    .replace(/\bI(?=[’'\s,.!?]|$)/g, 'i');
}

/** Lines said as one bubble; Instinct's unpunctuated texts get a period between them. */
export const joinLines = (lines: string[]) => lines.reduce((all, line) => (!all ? line : /[.!?:]$/.test(all) ? `${all} ${line}` : `${all}. ${line}`), '');

/** An app's voice: its own lines where it has them, the neutral ones otherwise. On a business account its money is the
 *  business's (`wallet`: "Acme Studio balance"), not the app's. */
export function voiceFor(connector: ConnectorId, opts: { wallet?: string } = {}): Voice {
  const v = VOICES[connector];
  const wallet = opts.wallet ?? v.wallet;
  const withName = (p?: Params) => ({ agent: v.name, wallet, ...p });
  return {
    id: connector,
    name: v.name,
    wallet: wallet.charAt(0).toUpperCase() + wallet.slice(1),
    line: (key, params) => {
      const own = v.lines?.[key as LineKey];
      if (own) return own(withName(params));
      const text = (LINES[key as LineKey] ?? (() => key))(withName(params));
      return v.casual ? casual(text, namesIn(params)) : text;
    },
    ask: (key, params) => (v.asks?.[key as AskKey] ?? ASKS[key as AskKey])(withName(params)),
    note: (key, params) => (v.notes?.[key as NoteKey] ?? NOTES[key as NoteKey])(withName(params)),
    status: (key, params) => (v.status?.[key as StatusKey] ?? STATUS[key as StatusKey] ?? (() => key))(withName(params)),
    products: (key, params) => PRODUCTS[key as ProductsKey]?.(params) ?? [],
    subagent: (key, params) => {
      const sub: (p?: Params) => SubAgent = SUBAGENTS[key as SubAgentKey];
      return sub(withName(params));
    },
    meta: (key, params) => {
      const meta: (p?: Params) => AgentMeta = METAS[key as MetaKey];
      return meta(withName(params));
    },
  };
}

/** The stored thread, as this app says it. */
export function renderThread(messages: StoredMessage[], voice: Voice): Message[] {
  // Only Duet labels a run; elsewhere the label isn't in the thread at all, so it can't sit between neighbors.
  const shown = voice.id === 'claude' ? messages : messages.filter((m) => m.kind !== 'eyebrow');
  return shown.map((m): Message => {
    switch (m.kind) {
      case 'me':
      case 'stamp':
      case 'divider':
      case 'eyebrow':
        return m;
      case 'them':
        return {
          id: m.id,
          kind: 'them',
          text:
            'text' in m.said
              ? (m.said.voices?.[voice.id] ?? m.said.text)
              : 'parts' in m.said
                ? joinLines(m.said.parts.map((part) => voice.line(part.key, part.params)))
                : voice.line(m.said.key, m.said.params),
          sender: m.sender,
          typing: m.typing,
          replyTo: m.replyTo,
        };
      case 'ask':
        return { id: m.id, kind: 'ask', ask: voice.ask(m.key, m.params), state: m.state, led: m.led, auto: m.auto };
      case 'card':
        return { id: m.id, kind: 'card', card: voice.note(m.key, m.params) };
      case 'chips':
        return m;
      case 'work':
        return { id: m.id, kind: 'work', key: m.key, status: voice.status(m.key, m.params) };
      case 'products': {
        const shelves = [m.params, ...(m.also ?? [])].map((p) => voice.products(m.key, p));
        const query = [m.params, ...(m.also ?? [])].find((p, i) => shelves[i].length > 1)?.query ?? m.params?.query;
        if (shelves.length === 1) return { id: m.id, kind: 'products', products: shelves[0], query: typeof query === 'string' ? query : undefined };
        return {
          id: m.id,
          kind: 'products',
          // Side by side, a pick is marked only among options to choose from: something they named is just itself.
          products: shelves.flatMap((s) => (s.length === 1 ? s.map((p) => ({ ...p, pick: false })) : s)),
          query: typeof query === 'string' ? query : undefined,
          shelves,
        };
      }
      case 'meta':
        return { id: m.id, kind: 'meta', meta: voice.meta(m.key, m.params) };
      case 'subagent':
        return { id: m.id, kind: 'subagent', agent: voice.subagent(m.key, m.params), done: m.done };
      default: {
        const exhaustive: never = m;
        return exhaustive;
      }
    }
  });
}
