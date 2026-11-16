'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MutableRefObject } from 'react';
import type { FlowEntry, StepReply } from '@/apps/agents/brain/useAgentBrain';
import { flowSpend, needsSetup, type FlowContext } from '@/apps/agents/flows';
import { resetLinkedBank } from '@/apps/agents/linkedBank';
import { resetRecipients, savedRecipients } from '@/apps/agents/recipients';
import { voiceFor } from '@/apps/agents/voices';
import type { Entry } from '@/components/ApiPanel/types';
import { actionLabel, NO_RUNS, type ActionId } from '@/data/actions';
import { createAgentSession, FAST_FORWARD_FUND_CENTS, type AccountSnapshot, type AgentSession, type CallStep } from '@/data/agentApiCalls';
import type { AgentEvent } from '@/data/agentEvents';
import type { ConnectorId } from '@/data/connectors';
import { MODES, modeFor, setActiveMode, type Mode } from '@/data/mode';
import { accessHeaders } from '@/lib/access';
import { appFor } from '@/lib/forApp';
import type { PromptState } from '@/lib/llm/prompt';
import type { Turn } from '@/lib/llm/tools';
import type { AgentResponse } from '@/lib/llm/types';
import { visitorHeaders } from '@/lib/visitor';

/** Apps whose checkout has a Pay with row to switch the payment; the rest have the agent ask first. */
const CHECKOUT_PICKER = new Set<ConnectorId>(['muse', 'dot']);

/** Tiles that answer with the account as it is: a shortcut that added money only to show or withdraw it would be fake. */
const AS_IT_STANDS = new Set<ActionId>(['balance', 'history', 'cashout', 'invoices']);

/** The calls one step makes land one after another, not in a block. */
const CALL_STAGGER_MS = 650;

/**
 * Fast-forward, as the Global Accounts playground does: whatever a flow needs
 * (an installed agent, money to spend) is set up silently, so any tile works
 * from any starting point. State only; nothing is logged for it. A business
 * account is never set up silently: naming the company and approving its account
 * is the point of the flow that does it.
 */
function prepare(session: AgentSession, id: ActionId, variant: number, mode: Mode): NonNullable<FlowEntry['setup']> {
  const a = session.snapshot();
  // A card-only account passed on a balance once: the flow asks for one, as it does when typed, rather than
  // turning it on behind their back. Checking the balance or history, or withdrawing, answers as it stands.
  if ((a.connected && !a.balanceOn && needsSetup(id, a)) || AS_IT_STANDS.has(id)) return { connected: false, funded: 0 };
  if (mode === 'business' && !a.connected) return { connected: false, funded: 0 };
  const connected = needsSetup(id, a);
  if (connected) session.assumeConnected();
  const need = flowSpend(id, undefined, variant, session.snapshot());
  const have = session.snapshot().balanceCents;
  // A purchase goes on the card without a balance, or when the saved card covers a short one: nothing to top up.
  const onCard = id === 'buy' && (session.snapshot().cardVaulted || !session.snapshot().balanceOn);
  const funded = need && have < need && !onCard ? Math.max(FAST_FORWARD_FUND_CENTS, Math.ceil((need - have) / 10_000) * 10_000) : 0;
  if (funded) session.assumeFunded(funded);
  return { connected, funded };
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

const newSession = (mode: Mode, connectorRef: MutableRefObject<ConnectorId>) =>
  createAgentSession(() => voiceFor(connectorRef.current).name, mode === 'business' ? { business: true } : undefined);

/**
 * One account's state: the agent's session with Grid (ids, policy, balance, the held action), the API log, and the
 * tiles' jumps. The personal and business accounts each have one, so switching between them keeps both. The
 * conversation itself lives in that account's phone brain (apps/agents/brain), which calls back here at every Grid beat.
 */
function useAccount(mode: Mode, connectorRef: MutableRefObject<ConnectorId>) {
  const sessionRef = useRef<AgentSession | null>(null);
  sessionRef.current ??= newSession(mode, connectorRef);
  const session = () => sessionRef.current!;
  const [account, setAccount] = useState<AccountSnapshot>(() => session().snapshot());
  const [entries, setEntries] = useState<Entry[]>([]);
  const [entry, setEntry] = useState<FlowEntry | undefined>(undefined);
  const [activeFlow, setActiveFlow] = useState<ActionId | null>(null);
  /** Completed runs per flow: a tile with more than one line offers the next one. */
  const [runs, setRuns] = useState(NO_RUNS);
  /** Remounts this account's conversation on Reset only. */
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
      pushSteps(sessionRef.current!.stepsFor(event));
      setAccount(sessionRef.current!.snapshot());
    },
    [pushSteps],
  );

  const context = useCallback(
    (): Omit<FlowContext, 'variant'> => ({
      mode,
      account: () => sessionRef.current!.snapshot(),
      needsApproval: (usd) => sessionRef.current!.needsApproval(usd),
      picksInCheckout: CHECKOUT_PICKER.has(connectorRef.current),
    }),
    [mode, connectorRef],
  );

  const onRun = useCallback((flow: ActionId) => {
    groupRef.current = { id: newGroupId(), label: actionLabel(flow) };
    nextAt.current = 0;
  }, []);

  const onCompleted = useCallback((flow: ActionId) => {
    setRuns((r) => ({ ...r, [flow]: r[flow] + 1 }));
  }, []);

  /** Free text goes to the model (/api/agent), a step at a time. Off, limited or failing, the agent points at the flows. */
  const reply = useCallback(
    async (turns: Turn[]): Promise<StepReply> => {
      const a = sessionRef.current!.snapshot();
      const money = (cents: number) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
      const state: PromptState = {
        mode,
        connected: a.connected,
        balanceOn: a.balanceOn,
        balance: money(a.balanceCents),
        approvalAbove: money(a.limits.approvalAbove),
        perTx: money(a.limits.perTransaction),
        daily: money(a.limits.daily),
        cardSaved: a.cardVaulted,
        bankLinked: a.bankLinked,
        recipients: savedRecipients().map((r) => ({ name: r.name, country: r.bank.country.code })),
        ...(a.business && {
          // Until they've named it, the model doesn't know the company: the default isn't theirs.
          ...(a.business.named && { company: a.business.company, owner: a.business.owner }),
          team: a.business.team.map((m) => `${m.name} (${m.role}${m.hasAgent ? ', has an agent' : ''}${m.hasCard ? ', has a card' : ''})`),
          budget: a.business.budget ? money(a.business.budget) : undefined,
          invoices: a.business.invoices.map((i) => `${i.number} ${i.client} ${money(i.amount)} ${i.status === 'PAID' ? 'paid' : `open, due ${i.due}`}`),
        }),
      };
      try {
        const res = await fetch('/api/agent', {
          method: 'POST',
          headers: { 'content-type': 'application/json', ...accessHeaders(), ...visitorHeaders() },
          body: JSON.stringify({ connector: connectorRef.current, turns, state }),
        });
        const data = (await res.json()) as AgentResponse;
        if (data.calls?.length) return { calls: data.calls };
        return { fallback: data.fallback === 'visitor' || data.fallback === 'daily' ? 'limited' : 'fallback' };
      } catch {
        return { fallback: 'fallback' };
      }
    },
    [mode, connectorRef],
  );

  /** A tile: set up what the flow needs (silently), then put its line in the composer. */
  const handleAction = useCallback(
    (id: ActionId) => {
      const s = sessionRef.current!;
      const setup = prepare(s, id, runs[id], mode);
      setAccount(s.snapshot());
      setEntry({ nonce: Date.now(), flow: id, variant: runs[id], setup });
    },
    [runs, mode],
  );

  const reset = useCallback(() => {
    clearTimers();
    resetRecipients(mode);
    resetLinkedBank(mode);
    sessionRef.current = newSession(mode, connectorRef);
    groupRef.current = null;
    nextAt.current = 0;
    setAccount(sessionRef.current.snapshot());
    setEntries([]);
    setEntry(undefined);
    setActiveFlow(null);
    setRuns(NO_RUNS());
    setChatKey((k) => k + 1);
  }, [clearTimers, mode, connectorRef]);

  return {
    mode,
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

export type AccountState = ReturnType<typeof useAccount>;

/**
 * The Agent Accounts playground's page state: which app is showing, which account (personal or business), and each
 * account's own state. Switching apps only changes the face; switching accounts shows the other account as it was.
 */
export function useAgentsDemoLogic() {
  const [connector, setConnector] = useState<ConnectorId>('muse');
  const connectorRef = useRef(connector);
  connectorRef.current = connector;
  const [mode, setMode] = useState<Mode>('personal');
  /** The accounts shown so far, each keeping its phone; one a link skipped past was never opened. */
  const [opened, setOpened] = useState<Mode[]>(['personal']);
  // A link made for one app (`?for=`) or account (`?mode=`) opens on it, before the first paint.
  useLayoutEffect(() => {
    const app = appFor(window.location.search);
    if (app) setConnector(app);
    const linked = modeFor(window.location.search);
    if (linked) {
      setMode(linked);
      setOpened([linked]);
    }
  }, []);
  // The other account's phone is built once the page is idle, so the first switch to it is as quick as the rest:
  // building it on the click holds the page up for a moment, and the flows can't animate through that.
  useEffect(() => {
    const ready = () => setOpened((all) => (all.length === MODES.length ? all : [...all, ...MODES.filter((m) => !all.includes(m))]));
    const idle = window.requestIdleCallback?.(ready, { timeout: 4000 }) ?? window.setTimeout(ready, 2500);
    return () => (window.cancelIdleCallback ? window.cancelIdleCallback(idle) : window.clearTimeout(idle));
  }, []);
  // The stores a flow reads (saved recipients, the linked bank) are the shown account's.
  useLayoutEffect(() => setActiveMode(mode), [mode]);

  const personal = useAccount('personal', connectorRef);
  const business = useAccount('business', connectorRef);
  const accounts: Record<Mode, AccountState> = { personal, business };

  /** Another agent app on the same account: only the face changes. */
  const selectConnector = useCallback((id: ConnectorId) => setConnector(id), []);
  /** The visitor has switched accounts at least once (a link opening on one doesn't count). */
  const [switched, setSwitched] = useState(false);
  const selectMode = useCallback((next: Mode) => {
    setActiveMode(next);
    setMode(next);
    setSwitched(true);
    setOpened((all) => (all.includes(next) ? all : [...all, next]));
  }, []);

  return { connector, selectConnector, mode, selectMode, switched, opened, accounts, active: accounts[mode] };
}
