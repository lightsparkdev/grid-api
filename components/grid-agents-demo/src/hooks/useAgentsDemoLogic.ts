'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatRun } from '@/apps/agents/useAgentChat';
import type { Entry } from '@/components/ApiPanel/types';
import { actionLabel, initialCompleted, initialWallet, type ActionId, type CompletedFlows, type WalletState } from '@/data/actions';
import { createAgentSession, type AgentSession } from '@/data/agentApiCalls';
import type { AgentEvent } from '@/data/agentEvents';
import { agentNameFor } from '@/data/agentScripts';
import type { ConnectorId } from '@/data/connectors';
import type { ApiCall } from '@/data/flow';
import { scriptedBrain } from '@/lib/chatBrain';

/** The calls one event makes land one after another, not in a block. */
const CALL_STAGGER_MS = 650;

let groupSeq = 0;
function newGroupId() {
  groupSeq += 1;
  return `g${Date.now().toString(36)}${groupSeq}`;
}

/**
 * The Agent Accounts playground brain: which agent is connected, the flow
 * playing in its chat, the agent's session with Grid (ids, policy, the action
 * waiting for approval), and the API log. Each flow's calls come from its
 * conversation's events, so the panel shows them at the beat the chat reaches.
 */
export function useAgentsDemoLogic() {
  const [connector, setConnector] = useState<ConnectorId>('muse');
  const [activeFlow, setActiveFlow] = useState<ActionId | null>(null);
  const [wallet, setWallet] = useState<WalletState>(initialWallet);
  const [completed, setCompleted] = useState<CompletedFlows>(initialCompleted);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [run, setRun] = useState<ChatRun | undefined>(undefined);
  /** Remounts the chat so its thread starts over from the agent's history. */
  const [chatKey, setChatKey] = useState(0);

  const sessionRef = useRef<AgentSession>(createAgentSession(agentNameFor('muse')));
  const walletRef = useRef(wallet);
  walletRef.current = wallet;
  // The group the running flow's calls land in, under its label.
  const groupRef = useRef<{ id: string; label: string } | null>(null);
  // What the running flow will spend once Grid carries it out, and the deposit it's waiting on.
  const pendingSpend = useRef(0);
  const pendingDeposit = useRef(0);

  // Delayed pushes; cleared on reset so a late call can't land in a wiped panel.
  const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current.clear();
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  // Pushes stay in order across events: each waits for the one before it.
  const nextAt = useRef(0);
  const pushCalls = useCallback((calls: ApiCall[]) => {
    const group = groupRef.current;
    if (!group || !calls.length) return;
    calls.forEach((call) => {
      const now = Date.now();
      const at = Math.max(now, nextAt.current + CALL_STAGGER_MS);
      nextAt.current = at;
      const land = () => {
        const createdAt = Date.now();
        setEntries((prev) => [
          ...prev,
          {
            ...call,
            key: `${createdAt}-${Math.random().toString(36).slice(2, 8)}`,
            createdAt,
            groupId: group.id,
            groupLabel: group.label,
          },
        ]);
      };
      if (at <= now) {
        land();
        return;
      }
      const t = setTimeout(() => {
        timers.current.delete(t);
        land();
      }, at - now);
      timers.current.add(t);
    });
  }, []);

  const spend = useCallback(() => {
    const cents = pendingSpend.current;
    pendingSpend.current = 0;
    if (cents) setWallet((w) => ({ ...w, balanceCents: Math.max(0, w.balanceCents - cents) }));
  }, []);

  const onEvent = useCallback(
    (event: AgentEvent) => {
      const session = sessionRef.current;
      switch (event.type) {
        case 'connect':
          setWallet((w) => ({ ...w, connected: true }));
          break;
        case 'fund.deposit':
          pendingDeposit.current = event.amount;
          break;
        case 'fund.received': {
          const cents = pendingDeposit.current;
          pendingDeposit.current = 0;
          setWallet((w) => ({ ...w, balanceCents: w.balanceCents + cents }));
          break;
        }
        case 'pay.quote':
          pendingSpend.current = event.payee.usd;
          break;
        case 'agent.quote':
          pendingSpend.current = event.to.amount;
          break;
        case 'pay.execute':
        case 'agent.execute':
          if (!session.needsApproval(pendingSpend.current)) spend();
          break;
        case 'buy.request':
          pendingSpend.current = event.purchase.amount;
          break;
        case 'buy.checkout':
        case 'action.approve':
          spend();
          break;
        case 'limits.update':
          break;
        default: {
          const exhaustive: never = event;
          return exhaustive;
        }
      }
      pushCalls(session.callsFor(event));
    },
    [pushCalls, spend],
  );

  const handleAction = useCallback(
    (id: ActionId) => {
      if (activeFlow) return;
      // Every flow but Connect needs an installed agent: install it silently
      // (state only, no calls logged), so the playground isn't a linear track.
      const w = id !== 'connect' && !walletRef.current.connected ? { ...walletRef.current, connected: true } : walletRef.current;
      if (w !== walletRef.current) setWallet(w);
      const session = sessionRef.current;
      groupRef.current = { id: newGroupId(), label: actionLabel(id) };
      nextAt.current = 0;
      const ctx = {
        connector,
        flow: id,
        wallet: w,
        limits: session.limits,
        needsApproval: session.needsApproval,
      };
      setActiveFlow(id);
      setRun({ nonce: Date.now(), steps: () => scriptedBrain(ctx) });
    },
    [activeFlow, connector],
  );

  const onSettled = useCallback(() => {
    setActiveFlow((id) => {
      if (id) setCompleted((c) => (c[id] ? c : { ...c, [id]: true }));
      return null;
    });
  }, []);

  /** Back to a clean slate for an agent: a new session, its thread from the top, no calls. */
  const restart = useCallback(
    (id: ConnectorId, keepLog: boolean) => {
      clearTimers();
      sessionRef.current = createAgentSession(agentNameFor(id));
      groupRef.current = null;
      pendingSpend.current = 0;
      pendingDeposit.current = 0;
      nextAt.current = 0;
      setActiveFlow(null);
      setRun(undefined);
      setCompleted(initialCompleted);
      setWallet((w) => (keepLog ? { ...w, connected: false } : initialWallet));
      if (!keepLog) setEntries([]);
      setChatKey((k) => k + 1);
    },
    [clearTimers],
  );

  /** Another agent app: a new agent to connect, on the same customer's wallet. The log stays. */
  const selectConnector = useCallback(
    (id: ConnectorId) => {
      if (activeFlow || id === connector) return;
      setConnector(id);
      restart(id, true);
    },
    [activeFlow, connector, restart],
  );

  const reset = useCallback(() => restart(connector, false), [connector, restart]);

  return {
    connector,
    selectConnector,
    activeFlow,
    running: activeFlow !== null,
    wallet,
    completed,
    entries,
    run,
    chatKey,
    handleAction,
    onEvent,
    onSettled,
    reset,
  };
}
