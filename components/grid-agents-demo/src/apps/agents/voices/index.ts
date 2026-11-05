import type { ConnectorId } from '@/data/connectors';
import type { AgentAsk, AgentMeta, AgentNote, Message, Params, Product, StoredMessage } from '../conversation';
import {
  ASKS,
  LINES,
  METAS,
  NOTES,
  PRODUCTS,
  STATUS,
  type AskKey,
  type LineKey,
  type MetaKey,
  type NoteKey,
  type ProductsKey,
  type StatusKey,
} from './base';
import { VOICES } from './apps';

export interface Voice {
  name: string;
  line(key: string, params?: Params): string;
  ask(key: string, params?: Params): AgentAsk;
  note(key: string, params?: Params): AgentNote;
  status(key: string, params?: Params): string;
  products(key: string): Product[];
  meta(key: string, params?: Params): AgentMeta;
}

/** An app's voice: its own lines where it has them, the neutral ones otherwise. */
export function voiceFor(connector: ConnectorId): Voice {
  const v = VOICES[connector];
  const withName = (p?: Params) => ({ agent: v.name, wallet: v.wallet, ...p });
  return {
    name: v.name,
    line: (key, params) => (v.lines?.[key as LineKey] ?? LINES[key as LineKey] ?? (() => key))(withName(params)),
    ask: (key, params) => (v.asks?.[key as AskKey] ?? ASKS[key as AskKey])(withName(params)),
    note: (key, params) => (v.notes?.[key as NoteKey] ?? NOTES[key as NoteKey])(withName(params)),
    status: (key, params) => (v.status?.[key as StatusKey] ?? STATUS[key as StatusKey] ?? (() => key))(withName(params)),
    products: (key) => PRODUCTS[key as ProductsKey]?.() ?? [],
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
          text: 'text' in m.said ? m.said.text : voice.line(m.said.key, m.said.params),
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
        return { id: m.id, kind: 'products', products: voice.products(m.key) };
      case 'meta':
        return { id: m.id, kind: 'meta', meta: voice.meta(m.key, m.params) };
      default: {
        const exhaustive: never = m;
        return exhaustive;
      }
    }
  });
}
