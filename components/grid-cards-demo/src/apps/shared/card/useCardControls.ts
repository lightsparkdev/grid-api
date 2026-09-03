'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { WalletListItemData } from './types';

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

/** Which of the card hub's sheets is up. */
export type CardSheet = 'none' | 'details' | 'wallet' | 'limits' | 'transaction' | 'close';

/** Apple Wallet add flow. `sheet` is Apple's add-card sheet; `adding` is the
 *  spinner; `done` shows the card in the pass stack. */
export type WalletAddPhase = 'idle' | 'sheet' | 'adding' | 'done';

export type TransactionStatus = 'AUTHORIZED' | 'SETTLED' | 'REFUNDED';

/** A card transaction row plus its lifecycle. The skin renders `status`
 *  however it likes (Pending / Settled / Refunded chips). */
export interface CardTransactionRow extends WalletListItemData {
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

const REVEAL_TTL_MS = 60_000;
const WALLET_ADDING_MS = 1600;
const WALLET_DONE_MS = 1400;
/** Authorizations clear a few seconds after they land (the sandbox clearing). */
const SETTLE_MS = 4500;
const REFUND_MS = 900;

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
  const [revealedAt, setRevealedAt] = useState<number | null>(null);
  const [walletPhase, setWalletPhase] = useState<WalletAddPhase>('idle');
  const [inWallet, setInWallet] = useState(false);
  const [rows, setRows] = useState<CardTransactionRow[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
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
      onStateChange?.(state);
    },
    [closed, onStateChange],
  );

  const closeCard = useCallback(() => {
    if (closed) {
      onCloseRejected?.();
      return;
    }
    setLifecycle('CLOSED');
    setSheet('none');
    setRevealedAt(null);
    onStateChange?.('CLOSED');
  }, [closed, onStateChange, onCloseRejected]);

  const saveLimits = useCallback(
    (next: SpendLimits) => {
      setLimitsState(next);
      onLimitsChange?.(next);
    },
    [onLimitsChange],
  );

  /** Called once Face ID passes; the sheet shows the details for REVEAL_TTL. */
  const reveal = useCallback(() => {
    setRevealedAt(Date.now());
    setSheet('details');
    onReveal?.();
  }, [onReveal]);
  useEffect(() => {
    if (revealedAt === null) return;
    const t = window.setTimeout(() => setRevealedAt(null), REVEAL_TTL_MS);
    return () => window.clearTimeout(t);
  }, [revealedAt]);

  const startAddToWallet = useCallback(() => {
    if (closed || inWallet) return;
    setWalletPhase('sheet');
    setSheet('wallet');
  }, [closed, inWallet]);
  const confirmAddToWallet = useCallback(() => {
    setWalletPhase('adding');
    later(() => {
      setWalletPhase('done');
      setInWallet(true);
      onAddToWallet?.();
      later(() => {
        setSheet('none');
        setWalletPhase('idle');
      }, WALLET_DONE_MS);
    }, WALLET_ADDING_MS);
  }, [later, onAddToWallet]);

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
  const seedSettledRow = useCallback((row: Omit<CardTransactionRow, 'status'>) => {
    setRows((prev) => [{ ...row, status: 'SETTLED' }, ...prev]);
  }, []);

  const openTransaction = useCallback((id: string) => {
    setSelectedRowId(id);
    setSheet('transaction');
  }, []);

  /** Merchant returns the purchase `id`; the row flips to REFUNDED after a beat.
   *  Reads the row at fire time (functional update) so delayed callers can't
   *  act on a stale list. */
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const refundRow = useCallback(
    (id: string) => {
      later(() => {
        const row = rowsRef.current.find((r) => r.id === id);
        if (!row || row.status === 'REFUNDED') return;
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'REFUNDED' } : r)));
        onRefund?.({ ...row, status: 'REFUNDED' });
      }, REFUND_MS);
    },
    [later, onRefund],
  );
  const refundSelected = useCallback(() => {
    if (selectedRowId) refundRow(selectedRowId);
  }, [selectedRowId, refundRow]);

  const closeSheet = useCallback(() => {
    setSheet('none');
    if (walletPhase !== 'idle' && walletPhase !== 'done') setWalletPhase('idle');
  }, [walletPhase]);

  return {
    lifecycle,
    frozen,
    closed,
    limits,
    spentTodayCents,
    dailyUsedCents,
    sheet,
    setSheet,
    closeSheet,
    revealed: revealedAt !== null,
    walletPhase,
    inWallet,
    rows,
    selectedRow: rows.find((r) => r.id === selectedRowId) ?? null,
    lastDecline,
    setLastDecline,
    declineReasonFor,
    setFrozen,
    closeCard,
    saveLimits,
    reveal,
    startAddToWallet,
    confirmAddToWallet,
    recordAuthorization,
    seedSettledRow,
    openTransaction,
    refundRow,
    refundSelected,
  };
}

export type CardControls = ReturnType<typeof useCardControls>;
