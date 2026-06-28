'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReceivePaymentInfo } from '@/data/apiCalls';
import type { ToastData } from '@/apps/shared/Toast';
import { formatUsdCents, truncateAddress } from './format';
import type {
  CardView,
  MoneySheetMode,
  ReceivedPayment,
  TapPhase,
  TransferActivity,
  WalletEntry,
  WalletListItemData,
  WalletTransferMode,
} from './types';
import {
  EARNINGS_APY_PERCENT,
  TAP_MERCHANTS,
  WEEKLY_BAR_COUNT,
  makeReceiveRow,
  makeTransferRow,
  parseCents,
  randomReceiveCents,
  toastUsd,
} from './activity';

const CREATING_MS = 2700;
const TAP_HOLD_MS = 1200; // Hold Near Reader dwell before Face ID kicks in.
const TAP_DONE_MS = 1500; // Done-check dwell before resolving back to card-home.
// Insert the transaction AFTER card-home has re-entered (content settles ~0.7s)
// so the new row visibly grows in and pushes the list down.
const TAP_INSERT_DELAY_MS = 900;
// Insert the Activity row a beat after the Add money / Withdraw sheet has
// dismissed, so the slide-down insert is visible on the settled wallet (same
// beat as tap-to-pay).
const SHEET_INSERT_DELAY_MS = 700;
// Receive: tapping Share/Copy lets the action register, then the sheet closes;
// the inbound payment "arrives" a beat after that (real receives are async, so
// the gap sells it — sharing your details doesn't instantly cause a payment).
const RECEIVE_DISMISS_MS = 480;
const RECEIVE_TOAST_MS = 2100;
/** A flow switch returns to home first (aurora out ≈ 0.3s) before opening the
 *  target sheet/view — long enough that home reads as the in-between beat. */
const ENTRY_HOME_SETTLE_MS = 350;
/** A cold jump straight off the auth screen lands on the wallet, lets the home
 *  entrance reveal play, THEN opens the flow — so it reads "home → sheet". */
const COLD_ENTRY_SETTLE_MS = 700;

/** Inputs the headless wallet machine needs. The view layer owns presentation
 *  (entrance stagger, theme, motion) and passes these through. */
export interface UseWalletHomeOptions {
  /** Formatted balance from demo state, e.g. "$0.00". */
  balance?: string;
  /** Whether the sign-in entrance reveal is playing — gates the cold-jump beat. */
  entrance?: boolean;
  /** Jump command from the sidebar — provision + open a flow out of order. */
  entry?: WalletEntry;
  /** Transfer confirmed (Face ID) — log execute + settle and move the balance. */
  onTransferExecute?: (mode: WalletTransferMode, cents: number) => void;
  /** A tap-to-pay charge landed on the phone. */
  onTapToPay?: (cents: number, merchant: string) => void;
  /** A payment was received (Receive flow) — log the inbound webhook + settle. */
  onReceivePayment?: (info: ReceivePaymentInfo) => void;
}

/**
 * The wallet home state machine — debit-card issuance, tap-to-pay, the
 * add/withdraw/send/receive sheets, balance + activity bookkeeping, and the
 * sidebar-jump (`entry`) handling. Headless: returns state + derived values +
 * handlers; every skin's view renders them however it likes.
 */
export function useWalletHome(options: UseWalletHomeOptions = {}) {
  const {
    balance = '$0.00',
    entrance = false,
    entry,
    onTransferExecute,
    onTapToPay,
    onReceivePayment,
  } = options;

  const [cardView, setCardView] = useState<CardView>('closed');
  const [issued, setIssued] = useState(false);
  const [tapPhase, setTapPhase] = useState<TapPhase>('idle');
  const [transactions, setTransactions] = useState<WalletListItemData[]>([]);

  // Add money / Withdraw flow: ONE mode-switched sheet + Face ID confirm +
  // local balance/activity bookkeeping (deltaCents = net adds − withdrawals).
  const [sheetMode, setSheetMode] = useState<MoneySheetMode>('add');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetConfirming, setSheetConfirming] = useState(false);
  const [deltaCents, setDeltaCents] = useState(0);
  // Real card spend this session — one entry per Tap to Pay; drives the Weekly
  // activity bars (which start empty and build left→right) + the spent total.
  const [spendBars, setSpendBars] = useState<number[]>([]);
  const [activity, setActivity] = useState<WalletListItemData[]>([]);
  const pendingCents = useRef(0);
  const pendingActivity = useRef<TransferActivity | null>(null);
  const availableCents = parseCents(balance) + deltaCents;
  // Earnings = yield on the live balance, shown as today's accrual. Weekly bars
  // map the most recent card charges (up to WEEKLY_BAR_COUNT), normalized to the
  // busiest charge so heights vary by amount.
  const earningsTodayCents = Math.round((availableCents * EARNINGS_APY_PERCENT) / 100 / 365);
  const visibleSpend = spendBars.slice(-WEEKLY_BAR_COUNT);
  const maxSpendCents = Math.max(1, ...visibleSpend);
  const weeklyBars = visibleSpend.map((cents) => cents / maxSpendCents);
  const weeklySpentCents = spendBars.reduce((sum, cents) => sum + cents, 0);

  const openSheet = (mode: MoneySheetMode) => {
    setSheetMode(mode);
    setSheetOpen(true);
  };

  // "Send or receive" chooser (Figma 109:28513). Send swaps it for the money
  // sheet in one beat: the mini sheet drops as the tall sheet rises.
  const [sendReceiveOpen, setSendReceiveOpen] = useState(false);
  const startSend = () => {
    setSendReceiveOpen(false);
    openSheet('send');
  };

  // Receive — opens the money sheet in 'receive' mode (the deposit list), the
  // same way Send does, reusing the full-size sheet + shared country picker.
  const startReceive = () => {
    setSendReceiveOpen(false);
    openSheet('receive');
  };

  // Glass toast (overlay layer): transfer confirmations + the tap-to-pay balance
  // guard. A fresh id restarts the hold when one is already up.
  const [toast, setToast] = useState<ToastData | null>(null);
  const showToast = (text: string) => setToast({ id: Date.now(), text });

  // Home Activity = money movements + card transactions, newest first. Derived
  // (not double-inserted) so each WalletListCard instance keeps its own
  // fresh-row bookkeeping — the grow-in insert still runs per list.
  const homeActivity = useMemo(
    () => [...activity, ...transactions].sort((a, b) => b.timestamp - a.timestamp),
    [activity, transactions],
  );

  const isOpen = cardView !== 'closed';
  const isIssuance = cardView === 'intro' || cardView === 'creating' || cardView === 'ready';
  const showFullAurora = cardView === 'intro' || cardView === 'creating';
  const cardCentered = isIssuance; // centered for intro/creating/ready; top for closed/home
  const isTap = tapPhase !== 'idle'; // tap-to-pay sub-flow over the card-home screen

  // Simulated card creation: auto-advance creating -> ready (and mark issued).
  useEffect(() => {
    if (cardView !== 'creating') return;
    const t = window.setTimeout(() => {
      setIssued(true);
      setCardView('ready');
    }, CREATING_MS);
    return () => window.clearTimeout(t);
  }, [cardView]);

  // Tap-to-pay: Hold Near Reader dwells, then Face ID runs.
  useEffect(() => {
    if (tapPhase !== 'hold') return;
    const t = window.setTimeout(() => setTapPhase('auth'), TAP_HOLD_MS);
    return () => window.clearTimeout(t);
  }, [tapPhase]);

  // Tap-to-pay: once the Done check lands, resolve back to card-home, THEN drop
  // the transaction in once the screen has settled — so the new row pushes the
  // list down instead of already being there. The insert timer lives in a ref:
  // the effect re-runs on the idle flip, and a cleanup there would kill it.
  const insertTimer = useRef(0);
  useEffect(() => {
    if (tapPhase !== 'done') return;
    const t = window.setTimeout(() => {
      const tx = pendingTapTx.current; // the merchant picked at tap start
      setTapPhase('idle');
      // The card charge comes out of the cash balance, landing with the row.
      setDeltaCents((c) => c - parseCents(tx.amount));
      setSpendBars((b) => [...b, parseCents(tx.amount)]);
      onTapToPay?.(parseCents(tx.amount), tx.title);
      window.clearTimeout(insertTimer.current);
      insertTimer.current = window.setTimeout(() => {
        setTransactions((prev) => [
          { ...tx, id: `tap-${Date.now()}`, timestamp: Date.now() },
          ...prev,
        ]);
      }, TAP_INSERT_DELAY_MS);
    }, TAP_DONE_MS);
    return () => window.clearTimeout(t);
  }, [tapPhase]);
  useEffect(() => () => window.clearTimeout(insertTimer.current), []);

  const openCard = () => setCardView(issued ? 'home' : 'intro');

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
  // first, then open the target — works whether the wallet just mounted (cold
  // jump from the auth screen) or is already up (warm jump).
  const lastEntryNonce = useRef(0);
  // True only for the very first commit. A jump that arrives on mount came
  // straight off the auth screen (cold) — it should let the home land first.
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

    // Re-clicking the flow you're already in is a no-op — don't reset to home
    // and replay it. ("Issue a card" only counts as "here" mid-issuance, so it
    // can still replay from the card home.)
    const alreadyHere =
      (entry.open === 'add' && sheetOpen && sheetMode === 'add') ||
      (entry.open === 'withdraw' && sheetOpen && sheetMode === 'withdraw') ||
      (entry.open === 'send' && sheetOpen && sheetMode === 'send') ||
      (entry.open === 'receive' && sheetOpen && sheetMode === 'receive') ||
      (entry.open === 'card' && isIssuance) ||
      (entry.open === 'tap' && cardView === 'home');
    if (alreadyHere) return;

    // A newly applied jump cancels a pending cold-open from a prior rapid tap.
    window.clearTimeout(coldOpenTimer.current);

    if (entry.provision?.issued) setIssued(true);
    if (typeof entry.provision?.fundCents === 'number') setDeltaCents(entry.provision.fundCents);

    const openTarget = () => {
      switch (entry.open) {
        case 'add':
          openSheet('add');
          break;
        case 'withdraw':
          openSheet('withdraw');
          break;
        case 'send':
          startSend();
          break;
        case 'receive':
          startReceive();
          break;
        case 'card':
          // Flows are replayable demos: "Issue a card" always runs the full
          // issuance animation again, even if a card already exists (no
          // "unissue" — replaying is the reset; it ends back on the card home).
          setCardView('intro');
          break;
        case 'tap':
          // Land on the debit-card screen; the user taps "Tap to pay".
          setCardView('home');
          break;
      }
    };

    // Cold jump off the auth screen: the wallet is mounting now. Let the home's
    // entrance reveal land FIRST, then open the flow — so it reads "home →
    // sheet", not the sheet riding in on the wallet's entrance. (No entrance to
    // wait for — e.g. reduced motion — opens right away.)
    if (coldMountRef.current) {
      if (!entrance) {
        openTarget();
        return;
      }
      // No effect cleanup on purpose: StrictMode runs effect cleanups between
      // its two dev mount passes and the nonce guard makes the second pass a
      // no-op — a cleanup here would clear the timer with nothing to reschedule
      // it (home shows, sheet never opens). A stray fire after a real unmount
      // just no-ops on the gone tree; a new jump clears it (above).
      coldOpenTimer.current = window.setTimeout(openTarget, COLD_ENTRY_SETTLE_MS);
      return;
    }

    // Already on a clean home screen — open the target right away, no detour.
    const awayFromHome =
      cardView !== 'closed' ||
      sheetOpen ||
      sheetConfirming ||
      sendReceiveOpen ||
      tapPhase !== 'idle';
    if (!awayFromHome) {
      openTarget();
      return;
    }

    // Issue-a-card from a non-clean state (e.g. mid tap-to-pay): the issuance sheet
    // covers the whole screen, so skip the "home first" detour. The detour sets
    // cardView to 'closed', which UNMOUNTS the floating card, then re-mounts it on
    // 'intro' — the card visibly slid in from the bottom after the sheet. Clear the
    // transient state and go straight to issuance so the card just morphs into it.
    if (entry.open === 'card') {
      setSheetOpen(false);
      setSheetConfirming(false);
      setSendReceiveOpen(false);
      setTapPhase('idle');
      setCardView('intro');
      return;
    }

    // Otherwise return to home FIRST, let it land, THEN open the target — so a
    // flow switch reads as "home → sheet", never the next flow rising over the
    // previous one's leftovers (e.g. the card-issuance aurora behind a sheet).
    setSheetOpen(false);
    setSheetConfirming(false);
    setSendReceiveOpen(false);
    setTapPhase('idle');
    setCardView('closed');
    const t = window.setTimeout(openTarget, ENTRY_HOME_SETTLE_MS);
    return () => window.clearTimeout(t);
  }, [entry]);

  // Add/Withdraw confirmed (Face ID done): dismiss the sheet, move the balance
  // (signed), and drop the Activity row in once the wallet has settled (visible
  // insert).
  const sheetInsertTimer = useRef(0);
  const finishTransfer = () => {
    const cents = pendingCents.current;
    const mode = sheetMode;
    const dest = pendingActivity.current;
    // Receive has no amount/confirm step, so it never reaches finishTransfer —
    // the guard also narrows `mode` to a transfer mode for the calls below.
    if (mode === 'receive') return;
    onTransferExecute?.(mode, cents);
    setSheetConfirming(false);
    setSheetOpen(false);
    setDeltaCents((c) => c + (mode === 'add' ? cents : -cents));
    const sentTo =
      dest?.kind === 'crypto'
        ? truncateAddress(dest.address)
        : dest?.kind === 'bank'
          ? dest.recipientName || dest.bankName
          : 'recipient';
    showToast(
      mode === 'add'
        ? `${toastUsd(cents)} added to balance`
        : mode === 'withdraw'
          ? `${toastUsd(cents)} withdrawn from balance`
          : `${toastUsd(cents)} sent to ${sentTo}`,
    );
    window.clearTimeout(sheetInsertTimer.current);
    sheetInsertTimer.current = window.setTimeout(() => {
      setActivity((prev) => [makeTransferRow(mode, cents, dest), ...prev]);
    }, SHEET_INSERT_DELAY_MS);
  };
  useEffect(() => () => window.clearTimeout(sheetInsertTimer.current), []);

  // Confirm tapped in a transfer sheet: stash the amount + destination for the
  // Activity row, then run Face ID (which calls finishTransfer on done).
  const confirmTransfer = (cents: number, activityDest: TransferActivity) => {
    pendingCents.current = cents;
    pendingActivity.current = activityDest;
    setSheetConfirming(true);
  };

  // Receive (Share/Copy in the deposit list): the demo "bullshit mode" payment.
  // Close the sheet a beat after the tap, then a moment later a payment "lands":
  // balance bumps, a toast drops, an Activity row inserts, and the inbound
  // webhook is logged. Amount is random (low hundreds); the payer is the sender
  // address (crypto) or a name + last initial from the country's pool (fiat).
  const receiveTimers = useRef<number[]>([]);
  const handleReceivePayment = (p: ReceivedPayment) => {
    // Same trigger in Add-from-crypto, but framed as a top-up (you funded your own
    // balance) rather than a payment from someone else.
    const asAdd = sheetMode === 'add';
    receiveTimers.current.push(
      window.setTimeout(() => setSheetOpen(false), RECEIVE_DISMISS_MS),
      window.setTimeout(() => {
        const cents = randomReceiveCents();
        const payer = p.via === 'crypto' ? truncateAddress(p.address) : p.payer;
        setDeltaCents((c) => c + cents);
        showToast(
          asAdd ? `${toastUsd(cents)} added to balance` : `Received ${toastUsd(cents)} from ${payer}`,
        );
        setActivity((prev) => [makeReceiveRow(p, cents, asAdd), ...prev]);
        onReceivePayment?.({
          amountCents: cents,
          viaCrypto: p.via === 'crypto',
          counterparty: p.via === 'crypto' ? p.address : p.payerFull,
          paymentRail: p.via === 'bank' ? p.rail : undefined,
          intent: asAdd ? 'add' : 'receive',
        });
      }, RECEIVE_TOAST_MS),
    );
  };
  useEffect(() => () => receiveTimers.current.forEach((t) => window.clearTimeout(t)), []);

  return {
    // Card / tap state
    cardView,
    setCardView,
    issued,
    tapPhase,
    setTapPhase,
    transactions,
    // Sheet state
    sheetMode,
    sheetOpen,
    setSheetOpen,
    sheetConfirming,
    sendReceiveOpen,
    setSendReceiveOpen,
    // Toast
    toast,
    setToast,
    showToast,
    // Derived money / activity
    availableCents,
    earningsTodayCents,
    weeklyBars,
    weeklySpentCents,
    homeActivity,
    apyPercent: EARNINGS_APY_PERCENT,
    // Derived view flags
    isOpen,
    isIssuance,
    showFullAurora,
    cardCentered,
    isTap,
    // Handlers
    openSheet,
    startSend,
    startReceive,
    openCard,
    startTapToPay,
    finishTransfer,
    confirmTransfer,
    handleReceivePayment,
  };
}
