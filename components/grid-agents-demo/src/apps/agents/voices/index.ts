import type { ConnectorId } from '@/data/connectors';
import type { AgentAsk, AgentNote, Message, Params, StoredMessage } from '../conversation';
import { ASKS, LINES, NOTES, type AskKey, type LineKey, type NoteKey } from './base';
import { VOICES } from './apps';

export interface Voice {
  name: string;
  line(key: string, params?: Params): string;
  ask(key: string, params?: Params): AgentAsk;
  note(key: string, params?: Params): AgentNote;
}

/** An app's voice: its own lines where it has them, the neutral ones otherwise. */
export function voiceFor(connector: ConnectorId): Voice {
  const v = VOICES[connector];
  const withName = (p?: Params) => ({ agent: v.name, ...p });
  return {
    name: v.name,
    line: (key, params) => (v.lines?.[key as LineKey] ?? LINES[key as LineKey] ?? (() => key))(withName(params)),
    ask: (key, params) => (v.asks?.[key as AskKey] ?? ASKS[key as AskKey])(withName(params)),
    note: (key, params) => (v.notes?.[key as NoteKey] ?? NOTES[key as NoteKey])(withName(params)),
  };
}

/** The stored thread, as this app says it. */
export function renderThread(messages: StoredMessage[], voice: Voice): Message[] {
  return messages.map((m): Message => {
    switch (m.kind) {
      case 'me':
      case 'stamp':
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
      default: {
        const exhaustive: never = m;
        return exhaustive;
      }
    }
  });
}
