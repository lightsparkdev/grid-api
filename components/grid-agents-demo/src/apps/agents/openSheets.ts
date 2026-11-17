import { createContext, useContext, useMemo, useState, type MutableRefObject } from 'react';
import type { AgentAsk, Message } from './conversation';

/**
 * What's up over the chat, kept above the skins: switching apps opens it again in the next app's look. `ask` is
 * the request an app's own sheet is open for (a card or bank form, a checkout); `plaid`, the one Plaid is open for.
 */
export interface OpenSheets {
  balance: boolean;
  ask: number | null;
  plaid: number | null;
}

export const OpenSheetsContext = createContext<{ sheets: MutableRefObject<OpenSheets>; wallet: string } | null>(null);

/** Whether the balance is up (read once, as a skin mounts), its title in this app's voice, and a way to record it. */
export function useKeptBalance() {
  const kept = useContext(OpenSheetsContext);
  const [open] = useState(kept?.sheets.current.balance ?? false);
  const keep = useMemo(
    () => (up: boolean) => {
      if (kept) kept.sheets.current.balance = up;
    },
    [kept],
  );
  return { open, wallet: kept?.wallet ?? '', keep };
}

type Ask = Extract<Message, { kind: 'ask' }>;

/**
 * A sheet that answers a request, kept across a switch. `initial` is the request it should open on as the skin
 * mounts (still open, and one this sheet `owns`); `keep(id)` records it as it opens, `release(id)` as it closes.
 * Without `owns`, nothing is kept.
 */
export function useKeptAsk(slot: 'ask' | 'plaid', messages: Message[], owns?: (ask: AgentAsk) => boolean) {
  const kept = useContext(OpenSheetsContext);
  const [initial] = useState(() => {
    const id = kept?.sheets.current[slot];
    if (!owns || id == null) return null;
    const m = messages.find((x): x is Ask => x.kind === 'ask' && x.id === id && x.state === 'open');
    return m && owns(m.ask) ? { id: m.id, ask: m.ask } : null;
  });
  const keeps = !!owns;
  const record = useMemo(
    () => ({
      keep: (id: number) => {
        if (kept && keeps) kept.sheets.current[slot] = id;
      },
      release: (id: number | null | undefined) => {
        if (kept && id != null && kept.sheets.current[slot] === id) kept.sheets.current[slot] = null;
      },
    }),
    [kept, keeps, slot],
  );
  return { initial, ...record };
}
