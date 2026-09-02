'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Persona, ApiCall } from '@/data/flow';
import {
  ACTIONS,
  initialCompleted,
  initialWallet,
  phoneFromState,
  type ActionId,
  type CompletedFlows,
  type WalletState,
} from '@/data/actions';
import { USE_CASES, type UseCaseId } from '@/data/configure';
import { cardCalls, tapCalls } from '@/data/cardApiCalls';
import { initialDesign, type CardDesign } from '@/data/design';
import type { Entry } from '@/components/ApiPanel/types';
import type { WalletEntry } from '@/apps/shared/wallet';

// Every flow fast-forwards a funded account so spend works from a cold start.
const FAST_FORWARD_FUND_CENTS = 500_000;
// Matches CREATING_MS in apps/shared/wallet/useWalletHome: the activation
// webhook arrives as the card flips from "creating" to "ready" on the phone.
const CARD_ACTIVE_DELAY_MS = 2700;
// Wallet flows that don't need a card to exist first. Every other flow
// (spend, reveal, freeze, …) fast-forwards an issued card.
const WALLET_ONLY_ACTIONS: ReadonlySet<ActionId> = new Set<ActionId>([
  'add',
  'send',
  'receive',
  'withdraw',
]);

let groupSeq = 0;
function newGroupId() {
  groupSeq += 1;
  return `g${Date.now().toString(36)}${groupSeq}`;
}

/**
 * The Cards playground brain: config (skin + card design), the wallet mirror
 * the phone renders from, the API-call log, and the flow jumps. There is no
 * sign-in — the cardholder is a Customer the platform already onboarded, so
 * the phone boots straight into the app.
 */
export function useCardsDemoLogic() {
  const [persona, setPersona] = useState<Persona>('custom');
  const [useCase, setUseCaseState] = useState<UseCaseId>('custom');
  const setUseCase = useCallback((id: UseCaseId) => {
    setUseCaseState(id);
    const next = USE_CASES.find((u) => u.id === id)?.persona;
    if (next) setPersona(next);
  }, []);

  const [design, setDesign] = useState<CardDesign>(initialDesign);
  const updateDesign = useCallback((patch: Partial<CardDesign>) => {
    setDesign((d) => ({ ...d, ...patch }));
  }, []);

  const [wallet, setWallet] = useState<WalletState>(initialWallet);
  const [completed, setCompleted] = useState<CompletedFlows>(initialCompleted);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [walletEntry, setWalletEntry] = useState<WalletEntry | undefined>(undefined);
  // Remounts the phone app on reset so the wallet brain starts clean.
  const [session, setSession] = useState(0);

  // Pending delayed pushes (webhooks that land after an on-phone animation);
  // cleared on reset so a late push can't re-add a row to a wiped panel.
  const pendingTimers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  useEffect(() => {
    const timers = pendingTimers.current;
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  const pushCalls = useCallback((calls: ApiCall[], groupLabel: string, groupId?: string) => {
    if (!calls?.length) return;
    const gid = groupId ?? newGroupId();
    const baseTime = Date.now();
    setEntries((prev) => [
      ...prev,
      ...calls.map((c, i) => ({
        ...c,
        key: `${baseTime}-${i}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: baseTime + i,
        groupId: gid,
        groupLabel,
      })),
    ]);
  }, []);

  const pushLater = useCallback(
    (calls: ApiCall[], groupLabel: string, groupId: string, delayMs: number) => {
      const timer = setTimeout(() => {
        pendingTimers.current.delete(timer);
        pushCalls(calls, groupLabel, groupId);
      }, delayMs);
      pendingTimers.current.add(timer);
    },
    [pushCalls],
  );

  const onCardIssued = useCallback(() => {
    // POST /cards lands now (card is PROCESSING); CARD.STATE_CHANGE lands when
    // the on-phone issuance animation finishes and the card is ACTIVE.
    const gid = newGroupId();
    const [createCall, ...activationCalls] = cardCalls();
    pushCalls([createCall], 'Issue a card', gid);
    pushLater(activationCalls, 'Issue a card', gid, CARD_ACTIVE_DELAY_MS);
    setWallet((w) => ({ ...w, hasCard: true }));
    setCompleted((c) => ({ ...c, card: true }));
  }, [pushCalls, pushLater]);

  const onTapToPay = useCallback(
    (cents: number, merchant: string) => {
      pushCalls(tapCalls(merchant, cents), 'Spend');
      setWallet((w) => ({
        ...w,
        cardActivated: true,
        balanceCents: Math.max(0, w.balanceCents - cents),
      }));
      setCompleted((c) => ({ ...c, tap: true }));
    },
    [pushCalls],
  );

  const handleAction = useCallback(
    (id: ActionId) => {
      if (!ACTIONS.find((a) => a.id === id)?.available(wallet)) return;
      // Fast-forward: silently satisfy whatever this flow needs (funds, a card)
      // so it works from any starting point. STATE only — no API calls are
      // logged for the provisioning and it earns no checkmark. Each flow logs
      // only its own calls when the user actually runs it.
      let next = wallet;
      const provision: { issued?: boolean; fundCents?: number } = {};
      if (next.balanceCents <= 0) {
        next = { ...next, balanceCents: FAST_FORWARD_FUND_CENTS };
        provision.fundCents = FAST_FORWARD_FUND_CENTS;
      }
      const needsCard = id !== 'card' && !WALLET_ONLY_ACTIONS.has(id);
      if (needsCard && !next.hasCard) {
        next = { ...next, hasCard: true };
        provision.issued = true;
      }
      if (next !== wallet) setWallet(next);
      setWalletEntry({
        nonce: Date.now(),
        provision:
          provision.issued || provision.fundCents !== undefined ? provision : undefined,
        open: id,
      });
    },
    [wallet],
  );

  const reset = useCallback(() => {
    pendingTimers.current.forEach((t) => clearTimeout(t));
    pendingTimers.current.clear();
    setWallet(initialWallet);
    setCompleted(initialCompleted);
    setEntries([]);
    setWalletEntry(undefined);
    setSession((s) => s + 1);
  }, []);

  return {
    persona,
    useCase,
    setUseCase,
    design,
    updateDesign,
    wallet,
    completed,
    entries,
    walletEntry,
    session,
    phone: phoneFromState(wallet),
    handleAction,
    reset,
    onCardIssued,
    onTapToPay,
  };
}
