'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FUNDING_SOURCE_CENTS } from '@/data/actions';
import type { ToastData } from '@/apps/shared/Toast';
import {
  useCardControls,
  type DeclineReason,
  type UseCardControlsOptions,
} from './useCardControls';
import type { TapPhase, WalletEntry, WalletListItemData } from './types';
import { TAP_MERCHANTS, parseCents } from './merchants';

/** POST /cards → PROCESSING; the ACTIVE webhook lands after this. */
const ISSUE_MS = 2700;
const TAP_HOLD_MS = 1200; // Hold Near Reader dwell before Face ID kicks in.
const TAP_DONE_MS = 1500; // Done-check dwell before resolving back to the hub.
const TAP_DECLINED_MS = 1900; // Declined dwell (reads the reason) before resolving.
// Insert the transaction AFTER the hub has re-entered (content settles ~0.7s)
// so the new row visibly grows in and pushes the list down.
const TAP_INSERT_DELAY_MS = 900;
/** A flow switch closes what's open first, then opens the target — long enough
 *  that the hub reads as the in-between beat. */
const ENTRY_HOME_SETTLE_MS = 350;
/** A cold jump lands on the hub, lets the entrance reveal play, THEN opens the
 *  flow — so it reads "hub → sheet". */
const COLD_ENTRY_SETTLE_MS = 700;

/** Inputs the headless card machine needs. The view layer owns presentation
 *  (entrance stagger, theme, motion) and passes these through. */
export interface UseCardHomeOptions {
  /** Whether the entrance reveal is playing — gates the cold-jump beat. */
  entrance?: boolean;
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
}

/**
 * The card hub state machine — issuance, tap-to-pay, the funding-source
 * balance, and the sidebar-jump (`entry`) handling. Composes `useCardControls`
 * for the freeze / limits / reveal / wallet / close lifecycle. Headless: returns
 * state + derived values + handlers; the face renders them.
 */
export function useCardHome(options: UseCardHomeOptions = {}) {
  const { entrance = false, entry, onCardIssued, onTapToPay, onTapDeclined, card: cardOptions } = options;

  const card = useCardControls(cardOptions);

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
      return;
    }
    merchantDeck.current.shift();
    pendingTapTx.current = merchant;
    setTapPhase('hold');
  };

  // Apply a sidebar jump command exactly once (nonce-guarded so re-renders and
  // StrictMode's double-invoke don't replay it). Provision any instant setup
  // first, then open the target — works whether the hub just mounted (cold
  // jump) or is already up (warm jump).
  const lastEntryNonce = useRef(0);
  // True only for the very first commit. A jump that arrives on mount is cold —
  // it should let the hub land first.
  const coldMountRef = useRef(true);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      coldMountRef.current = false;
    });
    return () => cancelAnimationFrame(id);
  }, []);
  // The cold-open timer lives in a ref (not an effect cleanup) so StrictMode's
  // dev double-invoke can't clear it before it fires — see the cold branch below.
  const coldOpenTimer = useRef(0);
  useEffect(() => {
    if (!entry || entry.nonce === lastEntryNonce.current) return;
    lastEntryNonce.current = entry.nonce;

    // Re-clicking the flow you're already in is a no-op. ("Issue a card" only
    // counts as "here" mid-issuance, so it can still replay from the hub.)
    if (entry.open === 'card' && issuing) return;

    // A newly applied jump cancels a pending cold-open from a prior rapid tap.
    window.clearTimeout(coldOpenTimer.current);

    if (entry.provision?.issued) setIssued(true);

    const openTarget = () => {
      switch (entry.open) {
        case 'card':
          issueCard();
          break;
        case 'tap':
          // Land on the hub; the user taps "Tap to pay".
          break;
        case 'reveal':
          startReveal();
          break;
        case 'wallet':
          card.startAddToWallet();
          break;
        case 'freeze':
          card.setFrozen(!card.frozen);
          break;
        case 'limits':
          card.setSheet('limits');
          break;
        case 'refund': {
          // Nothing to refund yet: provision a settled purchase (state only,
          // like the other fast-forwards) so the flow has something to act on.
          let target = card.rows[0];
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
          card.openTransaction(target.id);
          break;
        }
        case 'close':
          card.setSheet('close');
          break;
        case undefined:
          break;
      }
    };

    // Cold jump: the hub is mounting now. Let its entrance reveal land FIRST,
    // then open the flow — so it reads "hub → sheet", not the sheet riding in
    // on the entrance. (No entrance to wait for — e.g. reduced motion — opens
    // right away.)
    if (coldMountRef.current) {
      if (!entrance) {
        openTarget();
        return;
      }
      // No effect cleanup on purpose: StrictMode runs effect cleanups between
      // its two dev mount passes and the nonce guard makes the second pass a
      // no-op — a cleanup here would clear the timer with nothing to reschedule
      // it. A stray fire after a real unmount just no-ops on the gone tree; a
      // new jump clears it (above).
      coldOpenTimer.current = window.setTimeout(openTarget, COLD_ENTRY_SETTLE_MS);
      return;
    }

    // Already on a clean hub — open the target right away, no detour.
    const busy = card.sheet !== 'none' || revealPending || tapPhase !== 'idle';
    if (!busy) {
      openTarget();
      return;
    }

    // Otherwise clear what's up FIRST, let the hub land, THEN open the target —
    // so a flow switch reads as "hub → sheet", never the next flow rising over
    // the previous one's leftovers.
    setTapPhase('idle');
    card.closeSheet();
    setRevealPending(false);
    const t = window.setTimeout(openTarget, ENTRY_HOME_SETTLE_MS);
    return () => window.clearTimeout(t);
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
    // Toast
    toast,
    setToast,
    showToast,
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
