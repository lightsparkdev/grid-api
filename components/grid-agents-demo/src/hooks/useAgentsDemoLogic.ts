'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FlowEntry, FreeTextReply } from '@/apps/agents/brain/useAgentBrain';
import type { Chip } from '@/apps/agents/conversation';
import { flowSpend, NEEDS_CONNECTION, type FlowContext } from '@/apps/agents/flows';
import { resetRecipients, savedRecipients } from '@/apps/agents/recipients';
import { voiceFor } from '@/apps/agents/voices';
import type { Entry } from '@/components/ApiPanel/types';
import { actionLabel, type ActionId } from '@/data/actions';
import { createAgentSession, FAST_FORWARD_FUND_CENTS, type AccountSnapshot, type AgentSession, type CallStep } from '@/data/agentApiCalls';
import type { AgentEvent } from '@/data/agentEvents';
import { BANK_COUNTRIES } from '@/data/bankCountries';
import type { ConnectorId } from '@/data/connectors';
import type { PromptState } from '@/lib/llm/prompt';
import type { AgentResponse, ChatTurn } from '@/lib/llm/types';

/** The calls one step makes land one after another, not in a block. */
const CALL_STAGGER_MS = 650;

/**
 * Fast-forward, as the Global Accounts playground does: whatever a flow needs
 * (an installed agent, money to spend) is set up silently, so any tile works
 * from any starting point. State only; nothing is logged for it.
 */
function prepare(session: AgentSession, id: ActionId): NonNullable<FlowEntry['setup']> {
  const connected = NEEDS_CONNECTION[id] && !session.snapshot().connected;
  if (connected) session.assumeConnected();
  const need = flowSpend(id);
  const have = session.snapshot().balanceCents;
  const funded = need && have < need ? Math.max(FAST_FORWARD_FUND_CENTS, Math.ceil((need - have) / 10_000) * 10_000) : 0;
  if (funded) session.assumeFunded(funded);
  return { connected, funded };
}

/** A suggested reply as a chip: a country gets its flag. */
function suggestionChip(label: string): Chip {
  const country = BANK_COUNTRIES.find((c) => c.name.toLowerCase() === label.trim().toLowerCase());
  return country ? { label: country.name, flag: country.code } : { label };
}

let groupSeq = 0;
function newGroupId() {
  groupSeq += 1;
  return `g${Date.now().toString(36)}${groupSeq}`;
}
let entrySeq = 0;
function entryKey() {
  entrySeq += 1;
  return `e${Date.now().toString(36)}${entrySeq}`;
}

const NO_RUNS = (): Record<ActionId, number> => ({
  connect: 0,
  fund: 0,
  limits: 0,
  pay: 0,
  buy: 0,
  agent: 0,
  getpaid: 0,
  cashout: 0,
  balance: 0,
  history: 0,
});

/**
 * The Agent Accounts playground's page state: which app is showing, the
 * agent's session with Grid (ids, policy, balance, the held action), the API
 * log, and the tiles' jumps. The conversation itself lives in the phone's
 * brain (apps/agents/brain), which calls back here at every Grid beat.
 * Switching apps only changes the face: nothing here resets.
 */
export function useAgentsDemoLogic() {
  const [connector, setConnector] = useState<ConnectorId>('muse');
  const connectorRef = useRef(connector);
  connectorRef.current = connector;
  const sessionRef = useRef<AgentSession>(createAgentSession(() => voiceFor(connectorRef.current).name));
  const [account, setAccount] = useState<AccountSnapshot>(() => sessionRef.current.snapshot());
  const [entries, setEntries] = useState<Entry[]>([]);
  const [entry, setEntry] = useState<FlowEntry | undefined>(undefined);
  const [activeFlow, setActiveFlow] = useState<ActionId | null>(null);
  /** Completed runs per flow: a tile with more than one line offers the next one. */
  const [runs, setRuns] = useState(NO_RUNS);
  /** Remounts the phone's conversation on Reset only. */
  const [chatKey, setChatKey] = useState(0);
  const groupRef = useRef<{ id: string; label: string } | null>(null);

  // Delayed pushes; cleared on reset so a late call can't land in a wiped panel.
  const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current.clear();
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  // Pushes stay in order across events: each waits for the one before it.
  const nextAt = useRef(0);
  const later = useCallback((land: () => void) => {
    const now = Date.now();
    const at = Math.max(now, nextAt.current + CALL_STAGGER_MS);
    nextAt.current = at;
    if (at <= now) {
      land();
      return;
    }
    const t = setTimeout(() => {
      timers.current.delete(t);
      land();
    }, at - now);
    timers.current.add(t);
  }, []);

  /** A step's tool call, then its Grid calls nested under it, one by one. */
  const pushSteps = useCallback(
    (steps: CallStep[]) => {
      const group = groupRef.current ?? { id: newGroupId(), label: 'Chat' };
      groupRef.current = group;
      const base = { groupId: group.id, groupLabel: group.label };
      for (const step of steps) {
        const parent = step.tool ? entryKey() : undefined;
        if (step.tool) {
          const tool = step.tool;
          later(() =>
            setEntries((prev) => [
              ...prev,
              { ...base, key: parent!, createdAt: Date.now(), method: 'POST', path: tool.name, status: '', tool },
            ]),
          );
        }
        for (const call of step.calls) {
          later(() => setEntries((prev) => [...prev, { ...call, ...base, key: entryKey(), createdAt: Date.now(), parent }]));
        }
      }
    },
    [later],
  );

  const onEvent = useCallback(
    (event: AgentEvent) => {
      pushSteps(sessionRef.current.stepsFor(event));
      setAccount(sessionRef.current.snapshot());
    },
    [pushSteps],
  );

  const context = useCallback(
    (): Omit<FlowContext, 'variant'> => ({
      account: () => sessionRef.current.snapshot(),
      needsApproval: (usd) => sessionRef.current.needsApproval(usd),
    }),
    [],
  );

  const onRun = useCallback((flow: ActionId) => {
    groupRef.current = { id: newGroupId(), label: actionLabel(flow) };
    nextAt.current = 0;
  }, []);

  const onCompleted = useCallback((flow: ActionId) => {
    setRuns((r) => ({ ...r, [flow]: r[flow] + 1 }));
  }, []);

  /** Free text goes to the model (/api/agent). Off, limited or failing, the agent points at the flows. */
  const reply = useCallback(async (text: string, history: ChatTurn[]): Promise<FreeTextReply> => {
    const a = sessionRef.current.snapshot();
    const money = (cents: number) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    const state: PromptState = {
      connected: a.connected,
      balance: money(a.balanceCents),
      approvalAbove: money(a.limits.approvalAbove),
      perTx: money(a.limits.perTransaction),
      daily: money(a.limits.daily),
      cardSaved: a.cardVaulted,
      bankLinked: a.bankLinked,
      recipients: savedRecipients().map((r) => ({ name: r.name, country: r.bank.country.code })),
    };
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ connector: connectorRef.current, text, history, state }),
      });
      const data = (await res.json()) as AgentResponse;
      if (data.reply || data.flow) {
        return {
          said: { text: data.reply ?? '', voices: data.replies },
          flow: data.flow ? { id: data.flow, variant: data.variant ?? 0, params: data.params } : undefined,
          suggestions: data.suggestions?.map(suggestionChip),
        };
      }
      return { said: { key: data.fallback === 'visitor' || data.fallback === 'daily' ? 'limited' : 'fallback' } };
    } catch {
      return { said: { key: 'fallback' } };
    }
  }, []);

  /** A tile: set up what the flow needs (silently), then put its line in the composer. */
  const handleAction = useCallback(
    (id: ActionId) => {
      const session = sessionRef.current;
      const setup = prepare(session, id);
      setAccount(session.snapshot());
      setEntry({ nonce: Date.now(), flow: id, variant: runs[id], setup });
    },
    [runs],
  );

  /** Another agent app on the same account: only the face changes. */
  const selectConnector = useCallback((id: ConnectorId) => setConnector(id), []);

  const reset = useCallback(() => {
    clearTimers();
    resetRecipients();
    sessionRef.current = createAgentSession(() => voiceFor(connectorRef.current).name);
    groupRef.current = null;
    nextAt.current = 0;
    setAccount(sessionRef.current.snapshot());
    setEntries([]);
    setEntry(undefined);
    setActiveFlow(null);
    setRuns(NO_RUNS());
    setChatKey((k) => k + 1);
  }, [clearTimers]);

  return {
    connector,
    selectConnector,
    account,
    entries,
    entry,
    activeFlow,
    setActiveFlow,
    chatKey,
    handleAction,
    onEvent,
    onRun,
    onCompleted,
    context,
    reply,
    reset,
    dirty: entries.length > 0 || account.connected,
  };
}
