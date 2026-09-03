'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FUNDING_SOURCE_CENTS } from '@/data/actions';
import type { ToastData } from '@/apps/shared/Toast';
import {
  useCardControls,
  type DeclineReason,
  type UseCardControlsOptions,
} from './useCardControls';
import type { SpendLimits } from './useCardControls';
import type { TapPhase, WalletEntry, WalletListItemData } from './types';
import { TAP_MERCHANTS, parseCents } from './merchants';
import { formatUsdCents } from './format';

/** POST /cards → PROCESSING; the ACTIVE webhook lands after this. */
const ISSUE_MS = 2700;
const TAP_HOLD_MS = 1200; // Hold Near Reader dwell before Face ID kicks in.
const TAP_DONE_MS = 1500; // Done-check dwell before resolving back to the hub.
const TAP_DECLINED_MS = 1900; // Declined dwell (reads the reason) before resolving.
// Insert the transaction AFTER the hub has re-entered (content settles ~0.7s)
// so the new row visibly grows in and pushes the list down.
const TAP_INSERT_DELAY_MS = 900;
/** A flow switch closes what's open first, then opens the target. */
const ENTRY_HOME_SETTLE_MS = 350;
/** The phone slides in for a flow; the flow starts once it has landed. */
const PHONE_IN_MS = 750;
/** Dwell on the revealed details before the sheet closes. */
const REVEAL_HOLD_MS = 4200;
/** "Cardholder" taps Add to Apple Wallet this long after the sheet opens. */
const WALLET_CONFIRM_MS = 1200;
/** Dwell on the transaction sheet before the refund runs. */
const REFUND_START_MS = 1100;
/** Dwell after a refund before the sheet closes. */
const REFUND_HOLD_MS = 2200;
/** Simple state changes (freeze, limits, close) settle after the notification. */
const NOTICE_SETTLE_MS = 1400;
/** Push notification hold. */
const NOTICE_MS = 3600;
/** The Limits flow applies these caps (platform-side PATCH). */
export const PRESET_LIMITS: SpendLimits = { perTransactionCents: 7_500, perDayCents: 25_000 };

/** A push notification on the cardholder's phone. */
export interface CardNotice {
  id: number;
  title: string;
  body: string;
}

/** Inputs the headless card machine needs. The view layer owns presentation
 *  (entrance stagger, theme, motion) and passes these through. */
export interface UseCardHomeOptions {
  /** Jump command from the sidebar — provision + open a flow out of order. */
  entry?: WalletEntry;
  /** Issue tapped — log POST /cards (the ACTIVE webhook follows). */
  onCardIssued?: () => void;
  /** A tap-to-pay charge landed on the phone. `rowId` identifies the
   *  transaction row so later settle/refund events can reference it. */
  onTapToPay?: (cents: number, merchant: string, rowId: string) => void;
  /** A tap-to-pay authorization was declined (frozen card / over a cap). */
  onTapDeclined?: (reason: DeclineReason, cents: number, merchant: string) => void;
  /** Card-control events (freeze, close, limits, reveal, wallet, settle, refund). */
  card?: UseCardControlsOptions;
  /** The current flow has played out on the phone; the stage can dismiss it. */
  onSettled?: () => void;
}

/**
 * The card hub state machine — issuance, tap-to-pay, the funding-source
 * balance, and the sidebar-jump (`entry`) handling. Composes `useCardControls`
 * for the freeze / limits / reveal / wallet / close lifecycle. Headless: returns
 * state + derived values + handlers; the face renders them.
 */
export function useCardHome(options: UseCardHomeOptions = {}) {
  const { entry, onCardIssued, onTapToPay, onTapDeclined, card: cardOptions, onSettled } = options;

  const card = useCardControls(cardOptions);
  // Delayed flow steps read the LATEST controls, not the render they were
  // scheduled in (the controls' callbacks close over state like `rows`).
  const cardRef = useRef(card);
  cardRef.current = card;

  // Issuance: `issuing` while POST /cards is PROCESSING, `issued` once ACTIVE.
  // A fast-forwarded mount starts issued.
  const [issued, setIssued] = useState(Boolean(entry?.provision?.issued));
  const [issuing, setIssuing] = useState(false);
  const [tapPhase, setTapPhase] = useState<TapPhase>('idle');
  // Reveal needs Face ID first; the view shows the overlay while this is set.
  const [revealPending, setRevealPending] = useState(false);
  // Funding source balance: opening balance less card spend this session.
  const [deltaCents, setDeltaCents] = useState(0);
  const availableCents = FUNDING_SOURCE_CENTS + deltaCents;

  // Card transactions are the control brain's rows, labelled by lifecycle.
  const transactions: WalletListItemData[] = useMemo(
    () =>
      card.rows.map((r) => ({
        ...r,
        detail: r.status === 'AUTHORIZED' ? 'Pending' : r.status === 'REFUNDED' ? 'Refunded' : r.detail,
      })),
    [card.rows],
  );

  // Glass toast (overlay layer): the tap-to-pay balance guard.
  const [toast, setToast] = useState<ToastData | null>(null);
  const showToast = (text: string) => setToast({ id: Date.now(), text });

  const isTap = tapPhase !== 'idle';
  const isDeclined = tapPhase === 'declined';

  // Push notification on the phone (freeze, limits, close, refund).
  const [notice, setNotice] = useState<CardNotice | null>(null);
  const noticeTimer = useRef(0);
  const notify = (title: string, body: string) => {
    setNotice({ id: Date.now(), title, body });
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), NOTICE_MS);
  };
  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  // Flow timers (auto-run beats). Cleared when a new entry arrives or on unmount.
  const flowTimers = useRef<Set<number>>(new Set());
  const later = (fn: () => void, ms: number) => {
    const t = window.setTimeout(() => {
      flowTimers.current.delete(t);
      fn();
    }, ms);
    flowTimers.current.add(t);
    return t;
  };
  const clearFlowTimers = () => {
    flowTimers.current.forEach((t) => window.clearTimeout(t));
    flowTimers.current.clear();
  };
  useEffect(() => () => clearFlowTimers(), []);
  const settle = (ms = 0) => later(() => onSettled?.(), ms);

  /** Issue (or re-issue — flows are replayable) the card. */
  const issueTimer = useRef(0);
  const issueCard = () => {
    if (issuing) return;
    setIssued(false);
    setIssuing(true);
    onCardIssued?.();
    window.clearTimeout(issueTimer.current);
    issueTimer.current = window.setTimeout(() => {
      setIssued(true);
      setIssuing(false);
      settle(1100);
    }, ISSUE_MS);
  };
  useEffect(() => () => window.clearTimeout(issueTimer.current), []);

  // Tap-to-pay: Hold Near Reader dwells, then Face ID runs.
  useEffect(() => {
    if (tapPhase !== 'hold') return;
    const t = window.setTimeout(() => setTapPhase('auth'), TAP_HOLD_MS);
    return () => window.clearTimeout(t);
  }, [tapPhase]);

  // Tap-to-pay: once the Done check lands, resolve back to the hub, THEN drop
  // the transaction in once the screen has settled — so the new row pushes the
  // list down instead of already being there. The insert timer lives in a ref:
  // the effect re-runs on the idle flip, and a cleanup there would kill it.
  const insertTimer = useRef(0);
  useEffect(() => {
    if (tapPhase !== 'done') return;
    const t = window.setTimeout(() => {
      const tx = pendingTapTx.current; // the merchant picked at tap start
      const rowId = `tap-${Date.now()}`;
      setTapPhase('idle');
      setDeltaCents((c) => c - parseCents(tx.amount));
      onTapToPay?.(parseCents(tx.amount), tx.title, rowId);
      window.clearTimeout(insertTimer.current);
      insertTimer.current = window.setTimeout(() => {
        card.recordAuthorization({
          ...tx,
          id: rowId,
          timestamp: Date.now(),
          cents: parseCents(tx.amount),
        });
        settle(NOTICE_SETTLE_MS);
      }, TAP_INSERT_DELAY_MS);
    }, TAP_DONE_MS);
    return () => window.clearTimeout(t);
  }, [tapPhase]);
  useEffect(() => () => window.clearTimeout(insertTimer.current), []);

  // Declined: hold the reason on screen, then resolve back to the hub with no
  // charge and no row. The decline itself is logged when the phase flips.
  useEffect(() => {
    if (tapPhase !== 'declined') return;
    const t = window.setTimeout(() => {
      setTapPhase('idle');
      card.setLastDecline(null);
      settle(600);
    }, TAP_DECLINED_MS);
    return () => window.clearTimeout(t);
  }, [tapPhase]);

  /** Face ID passed during tap-to-pay: the terminal approves or declines. */
  const finishTapAuth = () => {
    const tx = pendingTapTx.current;
    const reason = card.declineReasonFor(parseCents(tx.amount));
    if (reason) {
      card.setLastDecline(reason);
      setTapPhase('declined');
      onTapDeclined?.(reason, parseCents(tx.amount), tx.title);
      return;
    }
    setTapPhase('done');
  };

  /** Reveal details: Face ID first, then the details sheet. */
  const startReveal = () => {
    if (card.closed) return;
    setRevealPending(true);
  };
  const finishRevealAuth = () => {
    setRevealPending(false);
    card.reveal();
    later(() => {
      cardRef.current.closeSheet();
      settle(500);
    }, REVEAL_HOLD_MS);
  };

  // The merchant is picked when the tap STARTS — the balance guard, the charge,
  // and the inserted row all see the same one. Shuffled-deck draw: every
  // merchant appears once (random order) before any repeats; the reshuffle
  // keeps the previous deck's last card off the top so back-to-back can't
  // happen across deck boundaries. A blocked tap puts the card back.
  const merchantDeck = useRef<typeof TAP_MERCHANTS>([]);
  const pendingTapTx = useRef(TAP_MERCHANTS[0]);
  const startTapToPay = () => {
    if (merchantDeck.current.length === 0) {
      const deck = [...TAP_MERCHANTS];
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      if (deck[0] === pendingTapTx.current) deck.push(deck.shift()!);
      merchantDeck.current = deck;
    }
    const merchant = merchantDeck.current[0];
    // Not enough for THIS merchant — the flow doesn't start, a toast says why.
    if (availableCents < parseCents(merchant.amount)) {
      showToast('Not enough balance');
      settle(NOTICE_SETTLE_MS);
      return;
    }
    merchantDeck.current.shift();
    pendingTapTx.current = merchant;
    setTapPhase('hold');
  };

  // Apply a sidebar jump command exactly once (nonce-guarded so re-renders and
  // StrictMode's double-invoke don't replay it). The phone slides in for the
  // flow; once it has landed, the flow plays out on its own — the cardholder's
  // taps (Face ID, Add to Apple Wallet) are scripted — and reports `onSettled`
  // so the stage can dismiss the phone again.
  const lastEntryNonce = useRef(0);
  useEffect(() => {
    if (!entry || entry.nonce === lastEntryNonce.current) return;
    lastEntryNonce.current = entry.nonce;
    clearFlowTimers();

    if (entry.provision?.issued) setIssued(true);

    const run = () => {
      switch (entry.open) {
        case 'card':
          issueCard();
          break;
        case 'tap':
          startTapToPay();
          break;
        case 'reveal':
          if (card.closed) {
            notify('Card closed', 'Details are no longer available for this card.');
            settle(NOTICE_SETTLE_MS);
            break;
          }
          startReveal();
          break;
        case 'wallet':
          if (card.closed || card.inWallet) {
            notify(
              card.closed ? 'Card closed' : 'Already in Apple Wallet',
              card.closed ? 'A closed card can’t be added to Apple Wallet.' : 'This card is already on your iPhone.',
            );
            settle(NOTICE_SETTLE_MS);
            break;
          }
          card.startAddToWallet();
          // The cardholder taps Add to Apple Wallet; the controls run the pass.
          later(() => cardRef.current.confirmAddToWallet(), WALLET_CONFIRM_MS);
          // sheet (1200) + adding (1600) + done (1400)
          settle(WALLET_CONFIRM_MS + 1600 + 1400 + 500);
          break;
        case 'freeze': {
          if (card.closed) {
            notify('Card closed', 'A closed card can’t be frozen or unfrozen.');
            settle(NOTICE_SETTLE_MS);
            break;
          }
          const next = !card.frozen;
          card.setFrozen(next);
          notify(
            next ? 'Card frozen' : 'Card unfrozen',
            next ? 'Purchases will be declined until you unfreeze it.' : 'Your card is active again.',
          );
          settle(NOTICE_SETTLE_MS);
          break;
        }
        case 'limits': {
          card.saveLimits(PRESET_LIMITS);
          notify(
            'Spending limits updated',
            `${formatUsdCents(PRESET_LIMITS.perTransactionCents ?? 0)} per purchase · ${formatUsdCents(PRESET_LIMITS.perDayCents ?? 0)} per day`,
          );
          settle(NOTICE_SETTLE_MS);
          break;
        }
        case 'refund': {
          // Nothing to refund yet: provision a settled purchase (state only,
          // like the other fast-forwards) so the flow has something to act on.
          let target = card.rows.find((r) => r.status !== 'REFUNDED');
          if (!target) {
            const seed = TAP_MERCHANTS[0];
            target = {
              ...seed,
              id: `seed-${Date.now()}`,
              timestamp: Date.now(),
              cents: parseCents(seed.amount),
              status: 'SETTLED',
            };
            card.seedSettledRow(target);
          }
          const row = target;
          card.openTransaction(row.id);
          later(() => {
            cardRef.current.refundRow(row.id);
            notify(`Refund from ${row.title}`, `+${row.amount} back on your card`);
          }, REFUND_START_MS);
          later(() => {
            cardRef.current.closeSheet();
            settle(500);
          }, REFUND_START_MS + REFUND_HOLD_MS);
          break;
        }
        case 'close':
          if (card.closed) {
            // The API answers 409 CARD_ALREADY_CLOSED; the phone just says so.
            card.closeCard();
            notify('Card already closed', 'This card was closed earlier.');
          } else {
            card.closeCard();
            notify('Card closed', 'This card can no longer be used. You can issue a new one.');
          }
          settle(NOTICE_SETTLE_MS);
          break;
        case undefined:
          settle(0);
          break;
      }
    };

    // Clear whatever the previous flow left up, then run once the phone lands.
    const busy = card.sheet !== 'none' || revealPending || tapPhase !== 'idle';
    setTapPhase('idle');
    card.closeSheet();
    setRevealPending(false);
    setNotice(null);
    later(run, busy ? PHONE_IN_MS + ENTRY_HOME_SETTLE_MS : PHONE_IN_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry]);

  return {
    // Card / tap state
    issued,
    issuing,
    issueCard,
    tapPhase,
    setTapPhase,
    transactions,
    availableCents,
    // Toast + push notification
    toast,
    setToast,
    showToast,
    notice,
    // Card controls (freeze / close / limits / reveal / wallet / transactions)
    card,
    revealPending,
    startReveal,
    finishRevealAuth,
    finishTapAuth,
    // Derived view flags
    isTap,
    isDeclined,
    // Handlers
    startTapToPay,
  };
}

/** The card brain's full surface — hosted above the face (CardHost) and handed
 *  to it as a prop. */
export type CardHome = ReturnType<typeof useCardHome>;
