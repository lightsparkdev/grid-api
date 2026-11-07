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
const PROPER = /^(Visa|Muse|Dots|Bot|Grok|Duet|Claude|Instinct|Plaid|Chase|Hotel|PIX|SPEI|ACH|SEPA|UPI|USDC|Bitcoin|[A-Z]{2,})/;

/** A neutral line in a lowercase voice (Dots, Instinct): each sentence opens lowercase, and so does "I". */
export function casual(text: string): string {
  return text
    .replace(/(^|[.!?]\s+)([A-Z][\w’']*)/g, (m, pre: string, word: string) => (PROPER.test(word) ? m : pre + word[0].toLowerCase() + word.slice(1)))
    .replace(/\bI(?=[’'\s,.!?]|$)/g, 'i');
}

/** An app's voice: its own lines where it has them, the neutral ones otherwise. */
export function voiceFor(connector: ConnectorId): Voice {
  const v = VOICES[connector];
  const withName = (p?: Params) => ({ agent: v.name, wallet: v.wallet, ...p });
  return {
    id: connector,
    name: v.name,
    wallet: v.wallet.charAt(0).toUpperCase() + v.wallet.slice(1),
    line: (key, params) => {
      const own = v.lines?.[key as LineKey];
      if (own) return own(withName(params));
      const text = (LINES[key as LineKey] ?? (() => key))(withName(params));
      return v.casual ? casual(text) : text;
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
  return messages.map((m): Message => {
    switch (m.kind) {
      case 'me':
      case 'stamp':
      case 'divider':
        return m;
      case 'them':
        return {
          id: m.id,
          kind: 'them',
          text: 'text' in m.said ? (m.said.voices?.[voice.id] ?? m.said.text) : voice.line(m.said.key, m.said.params),
          sender: m.sender,
          typing: m.typing,
        };
      case 'ask':
        return { id: m.id, kind: 'ask', ask: voice.ask(m.key, m.params), state: m.state };
      case 'card':
        return { id: m.id, kind: 'card', card: voice.note(m.key, m.params) };
      case 'chips':
        return m;
      case 'work':
        return { id: m.id, kind: 'work', key: m.key, status: voice.status(m.key, m.params) };
      case 'products':
        return { id: m.id, kind: 'products', products: voice.products(m.key, m.params), query: typeof m.params?.query === 'string' ? m.params.query : undefined };
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
