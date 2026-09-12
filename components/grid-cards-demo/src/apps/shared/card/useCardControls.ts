'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ActivityKind, MerchantCategory, WalletListItemData } from './types';

/** Mirrors the API's `CardState` for an issued card (PENDING_KYC / PROCESSING
 *  are the issuance animation's job). */
export type CardLifecycle = 'ACTIVE' | 'FROZEN' | 'CLOSED';

/** Why an authorization bounced. Mirrors the decline strings the sandbox
 *  documents (`CARD_PAUSED`, `INSUFFICIENT_FUNDS`) plus the spend caps. */
export type DeclineReason = 'CARD_PAUSED' | 'CARD_CLOSED' | 'OVER_PER_TXN_LIMIT' | 'OVER_DAILY_LIMIT';

export interface SpendLimits {
  /** `maxSpendPerTransaction`, cents. Null = no card-specific cap. */
  perTransactionCents: number | null;
  /** `maxSpendPerDay`, cents, UTC calendar day. Null = no card-specific cap. */
  perDayCents: number | null;
}

/** Which of the card hub's bottom sheets is up. `freeze` confirms a freeze or
 *  unfreeze from the lock; `walletAgain` says the card is already in Apple
 *  Wallet. */
export type CardSheet = 'none' | 'freeze' | 'transaction' | 'close' | 'walletAgain';

/** The page pushed over the card home; the card stays in its slot above.
 *  `numbers` is Wallet's Card Numbers page (the reveal; the card turns to its
 *  back), `limits` is Spending Limits. */
export type CardPage = 'home' | 'numbers' | 'limits';

/** The Spending limits row whose wheel is open (one at a time). */
export type LimitsRow = 'perTransaction' | 'perDay';

/** Add to Apple Wallet, as Apple's full-screen add-card flow: `intro` is "Add
 *  Card to Apple Pay" waiting on Continue; `contacting` and `setup` are the
 *  two "Adding Card" waits; `added` shows the check, then Apple's flow goes
 *  and the app says so with a toast. */
export type WalletAddPhase = 'idle' | 'intro' | 'contacting' | 'setup' | 'added';

export type TransactionStatus = 'AUTHORIZED' | 'SETTLED' | 'REFUNDED';

/** A card event for the Activity list (issued, frozen, closed…). */
export interface ActivityEvent {
  id: string;
  kind: ActivityKind;
  timestamp: number;
  /** A second line, e.g. the caps a limits change set. */
  detail?: string;
}

/** A card transaction row plus its lifecycle. The skin renders `status`
 *  however it likes (Pending / Settled / Refunded chips). A purchase's
 *  category is a merchant's; the card's events have their own rows. */
export interface CardTransactionRow extends Omit<WalletListItemData, 'category'> {
  category?: MerchantCategory;
  status: TransactionStatus;
  cents: number;
}

export interface UseCardControlsOptions {
  /** ACTIVE ⇄ FROZEN, → CLOSED — log the PATCH + webhook. */
  onStateChange?: (state: CardLifecycle) => void;
  /** A second close on an already-closed card — log the 409. */
  onCloseRejected?: () => void;
  /** Limits saved — log the PATCH. */
  onLimitsChange?: (limits: SpendLimits) => void;
  /** PAN reveal requested (after Face ID) — log POST /cards/{id}/reveal. */
  onReveal?: () => void;
  /** Apple Wallet add completed — log the tokenization branding config. */
  onAddToWallet?: () => void;
  /** A transaction settled (clearing) — log simulate/clearing + webhook. */
  onSettle?: (row: CardTransactionRow) => void;
  /** A merchant refund landed — log simulate/return + webhook. */
  onRefund?: (row: CardTransactionRow) => void;
}

/** Apple's add-card waits: "Contacting the Card Issuer…", then "Setting up
 *  Card for Apple Pay…", then the check holds before the app's own screen. */
const WALLET_CONTACTING_MS = 1500;
const WALLET_SETUP_MS = 1500;
const WALLET_ADDED_MS = 1100;
/** Authorizations clear a few seconds after they land (the sandbox clearing). */
const SETTLE_MS = 4500;
const REFUND_MS = 900;
/** A sheet's dismiss, a page's pop, or Apple's cover sliding away, plus a
 *  beat: an event from behind one of them shows in Activity after this. */
const EVENT_SETTLE_MS = 550;
/** The lock on the card has come up, turned, dropped in, and settled (see
 *  AnimatedLock, after the mark's own entrance): the locked event, and the
 *  notification, wait for it. */
export const LOCK_SEQUENCE_MS = 1250;

function startOfUtcDay(t: number) {
  const d = new Date(t);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/**
 * Card controls the hub exposes once a card exists: lifecycle (freeze / close),
 * spend caps, the PAN reveal, the Apple Wallet add, and the transaction
 * lifecycle (authorized → settled → refunded). Headless; composed into
 * useWalletHome so every skin's face renders the same state.
 */
export function useCardControls(options: UseCardControlsOptions = {}) {
  const {
    onStateChange,
    onCloseRejected,
    onLimitsChange,
    onReveal,
    onAddToWallet,
    onSettle,
    onRefund,
  } = options;

  const [lifecycle, setLifecycle] = useState<CardLifecycle>('ACTIVE');
  const [limits, setLimitsState] = useState<SpendLimits>({
    perTransactionCents: null,
    perDayCents: null,
  });
  const [sheet, setSheet] = useState<CardSheet>('none');
  const [page, setPage] = useState<CardPage>('home');
  // The Spending Limits page's working copy, here so the scripted cardholder
  // (the Limits flow) can pick the steps the same way a tap on the page does.
  const [limitsDraft, setLimitsDraft] = useState<SpendLimits>(limits);
  const [limitsRow, setLimitsRow] = useState<LimitsRow | null>(null);
  const [revealedAt, setRevealedAt] = useState<number | null>(null);
  const [walletPhase, setWalletPhase] = useState<WalletAddPhase>('idle');
  const [inWallet, setInWallet] = useState(false);
  const [rows, setRows] = useState<CardTransactionRow[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  // Card events, shown in Activity with the purchases.
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const recordEvent = useCallback((kind: ActivityKind, detail?: string) => {
    setEvents((prev) => [{ id: `ev-${kind}-${Date.now()}`, kind, timestamp: Date.now(), detail }, ...prev]);
  }, []);
  /** Last decline, for the card's bounce + the status label. Cleared on idle. */
  const [lastDecline, setLastDecline] = useState<DeclineReason | null>(null);

  const timers = useRef<Set<number>>(new Set());
  const later = useCallback((fn: () => void, ms: number) => {
    const t = window.setTimeout(() => {
      timers.current.delete(t);
      fn();
    }, ms);
    timers.current.add(t);
  }, []);
  useEffect(() => {
    const set = timers.current;
    return () => set.forEach((t) => window.clearTimeout(t));
  }, []);
  /** An event whose surface is on its way out (a sheet, a page, Apple's
   *  cover) lands in Activity once that surface has gone, so the row slides
   *  in on its own instead of already sitting there when the home reappears. */
  const recordEventSettled = useCallback(
    (kind: ActivityKind, detail?: string, afterMs = EVENT_SETTLE_MS) => later(() => recordEvent(kind, detail), afterMs),
    [later, recordEvent],
  );

  const frozen = lifecycle === 'FROZEN';
  const closed = lifecycle === 'CLOSED';

  const spentTodayCents = rows
    .filter((r) => r.status !== 'REFUNDED' && startOfUtcDay(r.timestamp) === startOfUtcDay(Date.now()))
    .reduce((sum, r) => sum + r.cents, 0);
  // Refunds don't restore daily capacity (the API's rule), so count them too.
  const dailyUsedCents = rows
    .filter((r) => startOfUtcDay(r.timestamp) === startOfUtcDay(Date.now()))
    .reduce((sum, r) => sum + r.cents, 0);

  /** Would an authorization for `cents` go through? */
  const declineReasonFor = useCallback(
    (cents: number): DeclineReason | null => {
      if (closed) return 'CARD_CLOSED';
      if (frozen) return 'CARD_PAUSED';
      if (limits.perTransactionCents !== null && cents > limits.perTransactionCents) {
        return 'OVER_PER_TXN_LIMIT';
      }
      if (limits.perDayCents !== null && dailyUsedCents + cents > limits.perDayCents) {
        return 'OVER_DAILY_LIMIT';
      }
      return null;
    },
    [closed, frozen, limits, dailyUsedCents],
  );

  const setFrozen = useCallback(
    (next: boolean) => {
      if (closed) return;
      const state: CardLifecycle = next ? 'FROZEN' : 'ACTIVE';
      setLifecycle(state);
      // Locking: the row lands once the lock on the card has finished locking.
      if (next) recordEventSettled('frozen', undefined, LOCK_SEQUENCE_MS);
      else recordEventSettled('unfrozen');
      onStateChange?.(state);
    },
    [closed, onStateChange, recordEventSettled],
  );

  const closeCard = useCallback(() => {
    if (closed) {
      onCloseRejected?.();
      return;
    }
    setLifecycle('CLOSED');
    setSheet('none');
    setPage('home');
    setRevealedAt(null);
    recordEventSettled('closed');
    onStateChange?.('CLOSED');
  }, [closed, onStateChange, onCloseRejected, recordEventSettled]);

  /** A new card is being issued (flows are replayable): it starts ACTIVE, out
   *  of the wallet, unrevealed. State only; POST /cards is the caller's log.
   *  The transactions stay: they are the cardholder's, not the card's. */
  const reissue = useCallback(() => {
    setLifecycle('ACTIVE');
    setInWallet(false);
    setWalletPhase('idle');
    setRevealedAt(null);
    setLastDecline(null);
    setSheet('none');
    setPage('home');
  }, []);


  const saveLimits = useCallback(
    (next: SpendLimits) => {
      setLimitsState(next);
      const cap = (c: number | null, per: string) => (c === null ? null : `$${c / 100} ${per}`);
      const parts = [cap(next.perTransactionCents, 'per purchase'), cap(next.perDayCents, 'per day')].filter(Boolean);
      recordEventSettled('limits', parts.length ? parts.join(' · ') : 'No caps');
      onLimitsChange?.(next);
    },
    [onLimitsChange, recordEventSettled],
  );

  /** The Spending Limits page, its draft seeded from the card's caps. */
  const openLimits = useCallback(() => {
    setLimitsDraft(limits);
    setLimitsRow(null);
    setPage('limits');
  }, [limits]);

  /** Called once Face ID passes; the Card Numbers page shows the details, with
   *  the card turned to its back behind it, until the page is popped. */
  const reveal = useCallback(() => {
    setRevealedAt(Date.now());
    setPage('numbers');
    onReveal?.();
  }, [onReveal]);
  /** Back from the pushed page; the numbers are hidden again. */
  const popPage = useCallback(() => {
    setPage('home');
    setRevealedAt(null);
  }, []);

  /** Apple's add-card flow comes up. Already added: the sheet says so instead. */
  const startAddToWallet = useCallback(() => {
    if (closed) return;
    if (inWallet) {
      setSheet('walletAgain');
      return;
    }
    setWalletPhase('intro');
  }, [closed, inWallet]);
  /** Continue on Apple's sheet: the issuer is contacted, the card set up, the
   *  check lands, then the app's own screen takes over. Only from `intro`, so
   *  the scripted tap and a real one can't both run it. */
  const walletPhaseRef = useRef(walletPhase);
  walletPhaseRef.current = walletPhase;
  // Apple's waits, so an X mid-way can cancel them.
  const walletTimers = useRef<Set<number>>(new Set());
  const clearWalletTimers = useCallback(() => {
    walletTimers.current.forEach((t) => window.clearTimeout(t));
    walletTimers.current.clear();
  }, []);
  useEffect(() => clearWalletTimers, [clearWalletTimers]);
  const confirmAddToWallet = useCallback(() => {
    if (walletPhaseRef.current !== 'intro') return;
    setWalletPhase('contacting');
    const at = (fn: () => void, ms: number) => {
      const t = window.setTimeout(() => {
        walletTimers.current.delete(t);
        fn();
      }, ms);
      walletTimers.current.add(t);
    };
    at(() => setWalletPhase('setup'), WALLET_CONTACTING_MS);
    at(() => setWalletPhase('added'), WALLET_CONTACTING_MS + WALLET_SETUP_MS);
    at(() => {
      setWalletPhase('idle');
      setInWallet(true);
      recordEventSettled('wallet');
      onAddToWallet?.();
    }, WALLET_CONTACTING_MS + WALLET_SETUP_MS + WALLET_ADDED_MS);
  }, [onAddToWallet, recordEventSettled]);
  /** X on Apple's flow: back to the card home, nothing added. */
  const finishAddToWallet = useCallback(() => {
    clearWalletTimers();
    setWalletPhase('idle');
  }, [clearWalletTimers]);

  /** Back to a fresh card, everything gone: the playground's Reset. In
   *  place, so the phone and the card animate through it rather than
   *  remounting. */
  const resetAll = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current.clear();
    clearWalletTimers();
    reissue();
    setLimitsState({ perTransactionCents: null, perDayCents: null });
    setLimitsDraft({ perTransactionCents: null, perDayCents: null });
    setLimitsRow(null);
    setRows([]);
    setSelectedRowId(null);
    setEvents([]);
  }, [clearWalletTimers, reissue]);

  /** Record an approved authorization; it settles on its own a few seconds later. */
  const recordAuthorization = useCallback(
    (row: Omit<CardTransactionRow, 'status'>) => {
      const authorized: CardTransactionRow = { ...row, status: 'AUTHORIZED' };
      setRows((prev) => [authorized, ...prev]);
      later(() => {
        setRows((prev) =>
          prev.map((r) => (r.id === row.id && r.status === 'AUTHORIZED' ? { ...r, status: 'SETTLED' } : r)),
        );
        onSettle?.({ ...authorized, status: 'SETTLED' });
      }, SETTLE_MS);
    },
    [later, onSettle],
  );

  /** Fast-forward helper: a settled purchase that exists without having been
   *  tapped (state only, no callbacks), so Refund has something to act on. */
  const seedSettledRow = useCallback((row: Omit<CardTransactionRow, 'status'>, status: TransactionStatus = 'SETTLED') => {
    setRows((prev) => [{ ...row, status }, ...prev]);
  }, []);

  // The rows at call time, for delayed callers and for the id checks below.
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  /** A purchase row opens its sheet; a card event row has nothing to open. */
  const openTransaction = useCallback((id: string) => {
    if (!rowsRef.current.some((r) => r.id === id)) return;
    setSelectedRowId(id);
    setSheet('transaction');
  }, []);

  /** Merchant returns the purchase `id`; the row flips to REFUNDED after a beat.
   *  Only a settled purchase can be returned (a pending one has nothing to
   *  return against). Reads the row at fire time (functional update) so
   *  delayed callers can't act on a stale list. */
  const refundRow = useCallback(
    (id: string) => {
      later(() => {
        const row = rowsRef.current.find((r) => r.id === id);
        if (!row || row.status !== 'SETTLED') return;
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'REFUNDED' } : r)));
        onRefund?.({ ...row, status: 'REFUNDED' });
      }, REFUND_MS);
    },
    [later, onRefund],
  );
  const refundSelected = useCallback(() => {
    if (selectedRowId) refundRow(selectedRowId);
  }, [selectedRowId, refundRow]);

  const closeSheet = useCallback(() => setSheet('none'), []);
  /** Everything a flow may have left up comes down: sheet, page, Apple's flow. */
  const resetSurfaces = useCallback(() => {
    setSheet('none');
    setPage('home');
    setRevealedAt(null);
    clearWalletTimers();
    setWalletPhase('idle');
  }, [clearWalletTimers]);
  const surfaceUp = sheet !== 'none' || page !== 'home' || walletPhase !== 'idle';

  return {
    lifecycle,
    frozen,
    closed,
    limits,
    limitsDraft,
    setLimitsDraft,
    limitsRow,
    setLimitsRow,
    openLimits,
    spentTodayCents,
    dailyUsedCents,
    sheet,
    setSheet,
    closeSheet,
    page,
    popPage,
    /** Dev posing: the Card Numbers page, without the reveal call. */
    openNumbers: () => setPage('numbers'),
    resetSurfaces,
    surfaceUp,
    revealed: revealedAt !== null,
    /** Dev posing: the details as revealed, without the reveal call. */
    markRevealed: () => setRevealedAt(Date.now()),
    walletPhase,
    /** Dev posing: Apple's add-card flow at a given phase. */
    setWalletPhase,
    inWallet,
    rows,
    events,
    recordEvent,
    selectedRow: rows.find((r) => r.id === selectedRowId) ?? null,
    lastDecline,
    setLastDecline,
    declineReasonFor,
    setFrozen,
    closeCard,
    reissue,
    resetAll,
    saveLimits,
    reveal,
    startAddToWallet,
    confirmAddToWallet,
    finishAddToWallet,
    recordAuthorization,
    seedSettledRow,
    openTransaction,
    refundRow,
    refundSelected,
  };
}

export type CardControls = ReturnType<typeof useCardControls>;
