'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import {
  cardCalls,
  clearingCalls,
  closeRejectedCall,
  declineCalls,
  limitsCalls,
  newSpendRef,
  refundCalls,
  revealCalls,
  stateChangeCalls,
  tapCalls,
  walletBrandingCalls,
  type CardSpendLimits,
  type SpendRef,
} from '@/data/cardApiCalls';
import { initialDesign, type CardDesign } from '@/data/design';
import type { Entry } from '@/components/ApiPanel/types';
import type { UseWalletHomeOptions, WalletEntry } from '@/apps/shared/wallet';

// Every flow fast-forwards a funded account so spend works from a cold start.
const FAST_FORWARD_FUND_CENTS = 500_000;
// Matches CREATING_MS in apps/shared/wallet/useWalletHome: the activation
// webhook arrives as the card flips from "creating" to "ready" on the phone.
const CARD_ACTIVE_DELAY_MS = 2700;
// A state-change webhook lands a beat after its PATCH so the rows arrive 1-by-1.
const WEBHOOK_DELAY_MS = 650;
// Wallet flows that don't need a card to exist first. Every other flow
// (spend, reveal, freeze, …) fast-forwards an issued card.
const WALLET_ONLY_ACTIONS: ReadonlySet<ActionId> = new Set<ActionId>([
  'add',
  'send',
  'receive',
  'withdraw',
]);

const GROUP_LABEL: Record<ActionId, string> = {
  add: 'Add money',
  send: 'Send payment',
  receive: 'Receive payment',
  withdraw: 'Withdraw',
  card: 'Issue a card',
  tap: 'Spend',
  reveal: 'Reveal details',
  wallet: 'Add to wallet',
  freeze: 'Freeze',
  limits: 'Limits',
  refund: 'Refund',
  close: 'Close',
};

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
  // The latest design, readable from callbacks without re-binding them.
  const designRef = useRef(design);
  designRef.current = design;

  const [wallet, setWallet] = useState<WalletState>(initialWallet);
  const [completed, setCompleted] = useState<CompletedFlows>(initialCompleted);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [walletEntry, setWalletEntry] = useState<WalletEntry | undefined>(undefined);
  // Remounts the phone app on reset so the wallet brain starts clean.
  const [session, setSession] = useState(0);
  // The card's current caps, mirrored so later PATCH responses show them.
  const limitsRef = useRef<CardSpendLimits>({});
  // Each purchase keeps one CardTransaction id across auth → clearing → return,
  // and the group it logged under so the clearing lands in the same group.
  const spendRefs = useRef(new Map<string, { ref: SpendRef; gid: string }>());

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

  /** A request now, its webhook a beat later, in one group. */
  const pushWithWebhook = useCallback(
    (calls: ApiCall[], label: string, delayMs = WEBHOOK_DELAY_MS) => {
      const gid = newGroupId();
      const [first, ...rest] = calls;
      pushCalls([first], label, gid);
      if (rest.length) pushLater(rest, label, gid, delayMs);
      return gid;
    },
    [pushCalls, pushLater],
  );

  const markDone = useCallback((id: keyof CompletedFlows) => {
    setCompleted((c) => (c[id] ? c : { ...c, [id]: true }));
  }, []);

  const onCardIssued = useCallback(() => {
    // POST /cards lands now (card is PROCESSING); CARD.STATE_CHANGE lands when
    // the on-phone issuance animation finishes and the card is ACTIVE.
    pushWithWebhook(cardCalls(limitsRef.current), GROUP_LABEL.card, CARD_ACTIVE_DELAY_MS);
    setWallet((w) => ({ ...w, hasCard: true }));
    markDone('card');
  }, [pushWithWebhook, markDone]);

  const onTapToPay = useCallback<NonNullable<UseWalletHomeOptions['onTapToPay']>>(
    (cents, merchant, rowId) => {
      const ref = newSpendRef(merchant, cents);
      const gid = pushWithWebhook(tapCalls(ref), GROUP_LABEL.tap);
      spendRefs.current.set(rowId, { ref, gid });
      setWallet((w) => ({
        ...w,
        cardActivated: true,
        balanceCents: Math.max(0, w.balanceCents - cents),
      }));
      markDone('tap');
    },
    [pushWithWebhook, markDone],
  );

  const onTapDeclined = useCallback<NonNullable<UseWalletHomeOptions['onTapDeclined']>>(
    (reason, cents, merchant) => {
      pushCalls(declineCalls(reason, merchant, cents), GROUP_LABEL.tap);
      // A decline proves the control that caused it.
      if (reason === 'CARD_PAUSED') markDone('freeze');
      if (reason === 'OVER_PER_TXN_LIMIT' || reason === 'OVER_DAILY_LIMIT') markDone('limits');
    },
    [pushCalls, markDone],
  );

  const cardOptions = useMemo<NonNullable<UseWalletHomeOptions['card']>>(
    () => ({
      onStateChange: (state) => {
        const label = state === 'CLOSED' ? GROUP_LABEL.close : GROUP_LABEL.freeze;
        pushWithWebhook(stateChangeCalls(state, limitsRef.current), label);
        markDone(state === 'CLOSED' ? 'close' : 'freeze');
      },
      onCloseRejected: () => pushCalls([closeRejectedCall()], GROUP_LABEL.close),
      onLimitsChange: (limits) => {
        limitsRef.current = {
          maxSpendPerTransaction: limits.perTransactionCents,
          maxSpendPerDay: limits.perDayCents,
        };
        pushCalls(limitsCalls(limitsRef.current), GROUP_LABEL.limits);
        markDone('limits');
      },
      onReveal: () => {
        pushCalls(revealCalls(), GROUP_LABEL.reveal);
        markDone('reveal');
      },
      onAddToWallet: () => {
        const d = designRef.current;
        pushCalls(walletBrandingCalls(d.programName, d.logoUrl), GROUP_LABEL.wallet);
        markDone('wallet');
      },
      onSettle: (row) => {
        const known = spendRefs.current.get(row.id);
        const ref = known?.ref ?? newSpendRef(row.title, row.cents);
        // The clearing joins the purchase's own group so auth → settle reads as
        // one lifecycle; the webhook lands a beat after the simulate.
        const gid = known?.gid ?? newGroupId();
        const [simulate, webhook] = clearingCalls(ref);
        pushCalls([simulate], GROUP_LABEL.tap, gid);
        pushLater([webhook], GROUP_LABEL.tap, gid, WEBHOOK_DELAY_MS);
        if (!known) spendRefs.current.set(row.id, { ref, gid });
      },
      onRefund: (row) => {
        const known = spendRefs.current.get(row.id);
        const ref = known?.ref ?? newSpendRef(row.title, row.cents);
        if (!known) spendRefs.current.set(row.id, { ref, gid: newGroupId() });
        pushWithWebhook(refundCalls(ref), GROUP_LABEL.refund);
        setWallet((w) => ({ ...w, balanceCents: w.balanceCents + row.cents }));
        markDone('refund');
      },
    }),
    [pushCalls, pushLater, pushWithWebhook, markDone],
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
    spendRefs.current.clear();
    limitsRef.current = {};
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
    onTapDeclined,
    cardOptions,
  };
}
