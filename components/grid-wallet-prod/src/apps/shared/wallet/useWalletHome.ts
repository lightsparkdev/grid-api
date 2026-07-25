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
// Success-screen skins (sheet stays up until Done): after the sheet slides
// away, tick the balance once home is settled, then grow the row in while the
// tick is still rolling.
const SETTLE_DELTA_DELAY_MS = 450;
const SETTLE_INSERT_DELAY_MS = 950;
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
  /**
   * Real transaction history from the host (`GET /transactions`), newest first.
   * Held as an INPUT, never copied into state: the host owns it, so a re-read
   * flows straight through, and rows added by this session's own flows still
   * merge on top by timestamp.
   */
  serverActivity?: WalletListItemData[];
  /** Whether the sign-in entrance reveal is playing — gates the cold-jump beat. */
  entrance?: boolean;
  /** Jump command from the sidebar — provision + open a flow out of order. */
  entry?: WalletEntry;
  /**
   * Keep the money sheet OPEN after a confirmed transfer (the skin shows its own
   * in-sheet success screen + Done button) instead of auto-closing + toasting.
   * Balance + activity still update; the toast is suppressed. Default false.
   */
  transferSuccessScreen?: boolean;
  /**
   * Transfer confirmed (Face ID) — log execute + settle and move the balance.
   * For Add money, the third arg is a settle channel: the host calls it back
   * on EVERY terminal outcome for THIS add — success (once the real balance
   * read lands, or exhausts its retry) or failure (non-200, thrown, or the
   * 403 production-keys branch) — so this add's own optimistic bump is
   * undone by exactly its own cents the instant its own flow concludes,
   * whichever way it goes. Amount-exact and proportional: no waiting on an
   * unrelated add's refresh, and no "wait for the in-flight counter to hit
   * 0" step. Ignored for withdraw/send.
   */
  onTransferExecute?: (
    mode: WalletTransferMode,
    cents: number,
    onAddSettled?: () => void,
    /** `simulated: true` = the sandbox stand-in, not a user-confirmed transfer.
     *  The host routes them differently (a real add pulls from the account the
     *  user linked; the stand-in runs the platform on-ramp). */
    opts?: { simulated?: boolean },
  ) => void;
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
    serverActivity,
    entrance = false,
    entry,
    transferSuccessScreen = false,
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
  // `balance` is the host's source of truth (the real book balance).
  // `deltaCents` is ONLY the optimistic bridge for Add money's real (async)
  // path: Face-ID-confirm bumps it instantly, well before the sandbox fund +
  // GET /customers/internal-accounts round-trip lands and moves `balance`
  // itself. Withdraw/Send/Tap/Receive do NOT use it when a host callback is
  // wired (see below) — the host moves `balance` SYNCHRONOUSLY in the same
  // commit as those, so bumping delta too would double-count for a frame.
  //
  // Adds no longer bump `deltaCents` at all (the money is announced by Grid's
  // arrival webhook, and `balance` re-read from the API), so nothing is in
  // flight to reconcile — this counter stays 0 and only the drift guard below
  // still reads it.
  const pendingAdds = useRef(0);
  // Now just a drift guard: under the per-add settle design above, this
  // should never actually fire (every increment has a matching settle call).
  // Kept as a backstop — if `pendingAdds` is back to 0 (no add believes
  // itself in flight) but `deltaCents` is somehow still nonzero when
  // `balance` moves, snap it rather than let a stray delta linger
  // silently. Deliberately does NOT touch `deltaCents` while `pendingAdds`
  // is nonzero — that's still-pending adds' own tracked contribution.
  useEffect(() => {
    if (pendingAdds.current === 0 && deltaCents !== 0) setDeltaCents(0);
  }, [balance]);
  // Earnings = yield on the live balance, shown as today's accrual. Weekly bars
  // map the most recent card charges (up to WEEKLY_BAR_COUNT), normalized to the
  // busiest charge so heights vary by amount.
  const earningsTodayCents = Math.round((availableCents * EARNINGS_APY_PERCENT) / 100 / 365);
  // A month of accruing yield with DAILY COMPOUNDING: balance × ((1+r)³⁰ − 1),
  // r = APY/365 — not today's (rounded) accrual × 30, which understates it.
  const dailyRate = EARNINGS_APY_PERCENT / 100 / 365;
  const earningsMonthCents = Math.round(availableCents * (Math.pow(1 + dailyRate, 30) - 1));
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

  // Home Activity = this session's money movements + card transactions + the
  // account's real history, newest first. Derived (not double-inserted) so each
  // WalletListCard instance keeps its own fresh-row bookkeeping — the grow-in
  // insert still runs per list. Server rows carry Grid transaction ids and this
  // session's carry local ones, so the id-keyed reveal can't collide.
  const homeActivity = useMemo(
    () =>
      [...activity, ...transactions, ...(serverActivity ?? [])].sort(
        (a, b) => b.timestamp - a.timestamp,
      ),
    [activity, transactions, serverActivity],
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
      // Self-track only when no host callback is wired — a wired host moves
      // `balance` synchronously via `onTapToPay` below, in this same commit.
      if (!onTapToPay) setDeltaCents((c) => c - parseCents(tx.amount));
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
    // Relative to the CURRENT base balance, not absolute — so the visible
    // total lands on exactly `fundCents` whether `balance` is still "$0.00"
    // (no real session) or already a real signed-in balance.
    if (typeof entry.provision?.fundCents === 'number') {
      setDeltaCents(entry.provision.fundCents - parseCents(balance));
    }

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
  const finishTransfer = (
    { closeSheet = true, simulated = false }: { closeSheet?: boolean; simulated?: boolean } = {},
  ) => {
    const cents = pendingCents.current;
    const mode = sheetMode;
    const dest = pendingActivity.current;
    // Receive has no amount/confirm step, so it never reaches finishTransfer —
    // the guard also narrows `mode` to a transfer mode for the calls below.
    if (mode === 'receive') return;
    // No settle channel any more: an add makes NO optimistic bump (the webhook
    // announces the arrival and the host re-reads the balance), so there is
    // nothing for the host to undo. Passing one that subtracts `cents` would
    // drop the displayed balance by the amount being added.
    onTransferExecute?.(mode, cents, undefined, { simulated });
    setSheetConfirming(false);
    // A skin with its own success screen keeps the sheet up (Done closes it) and
    // owns the confirmation — hold the balance move + Activity insert until the
    // sheet is dismissed so both play out on the visible home (balance ticks,
    // row grows in) instead of settling silently behind the success screen.
    // MUST FIX BEFORE ANY SKIN SETS `transferSuccessScreen`: `settleAdd` above
    // is registered NOW (immediately, same as the non-success-screen path),
    // but the matching `pendingAdds`/`deltaCents` INCREMENT for this path
    // doesn't happen until the settle effect below fires, `SETTLE_DELTA_DELAY_MS`
    // later. A fast terminal outcome (very plausible for a failure, and not
    // impossible for a success against a quick sandbox) settling BEFORE that
    // increment runs will net out wrong (settles a bump that hasn't been
    // applied yet, then the delayed effect applies it with nothing left to
    // undo it). Not reachable in this app today (no active skin sets
    // `transferSuccessScreen`) — but this is a real, known-broken path, not a
    // theoretical one; do not enable `transferSuccessScreen` on a live skin
    // without fixing this ordering first (e.g. by moving the increment into
    // `finishTransfer` itself, ahead of `onTransferExecute`, same as the
    // non-success-screen path does).
    if (transferSuccessScreen) {
      pendingSettle.current = { mode, cents, dest };
      return;
    }
    if (mode === 'add') {
      // Deliberately NO optimistic bump, toast or Activity row here: money
      // arriving is announced by Grid's INCOMING_PAYMENT.COMPLETED webhook (the
      // host refreshes the balance and toasts off the back of it). Claiming it
      // at tap time was a lie for a pull, which Grid can't even execute — the
      // payer still has to push.
      if (closeSheet) setSheetOpen(false);
      return;
    } else if (!onTransferExecute) {
      // No host wired to move `balance` synchronously — self-track locally
      // (this is the only path for a standalone/unwired caller).
      setDeltaCents((c) => c - cents);
    }
    // else: a host callback IS wired, and `onTransferExecute` above already
    // moved the real `balance` synchronously, in this same commit — do not
    // ALSO apply the delta here, or `availableCents` briefly double-counts
    // the movement for one frame (old − 2×cents) before self-correcting.
    if (closeSheet) setSheetOpen(false);
    const sentTo =
      dest?.kind === 'crypto'
        ? truncateAddress(dest.address)
        : dest?.kind === 'bank'
          ? dest.recipientName || dest.bankName
          : 'recipient';
    // 'add' returned above — arrivals are announced by the webhook, not here.
    showToast(
      mode === 'withdraw'
        ? `${toastUsd(cents)} withdrawn from balance`
        : `${toastUsd(cents)} sent to ${sentTo}`,
    );
    window.clearTimeout(sheetInsertTimer.current);
    sheetInsertTimer.current = window.setTimeout(() => {
      setActivity((prev) => [makeTransferRow(mode, cents, dest), ...prev]);
    }, SHEET_INSERT_DELAY_MS);
  };
  useEffect(() => () => window.clearTimeout(sheetInsertTimer.current), []);

  // Success-screen skins settle on the HOME screen: once the success sheet has
  // slid away, the balance ticks to its new value, then the Activity row grows
  // in a beat later.
  const pendingSettle = useRef<{
    mode: WalletTransferMode;
    cents: number;
    dest: TransferActivity | null;
  } | null>(null);
  const settleDeltaTimer = useRef(0);
  useEffect(() => {
    if (sheetOpen || !pendingSettle.current) return;
    const { mode, cents, dest } = pendingSettle.current;
    pendingSettle.current = null;
    settleDeltaTimer.current = window.setTimeout(() => {
      // Same add-vs-sync split as `finishTransfer` above (not currently
      // reachable in this app — no active skin sets `transferSuccessScreen`
      // — kept consistent for any skin that does).
      if (mode === 'add') {
        pendingAdds.current += 1;
        setDeltaCents((c) => c + cents);
      } else if (!onTransferExecute) {
        setDeltaCents((c) => c - cents);
      }
    }, SETTLE_DELTA_DELAY_MS);
    window.clearTimeout(sheetInsertTimer.current);
    sheetInsertTimer.current = window.setTimeout(() => {
      setActivity((prev) => [makeTransferRow(mode, cents, dest), ...prev]);
    }, SETTLE_INSERT_DELAY_MS);
  }, [sheetOpen]);
  useEffect(() => () => window.clearTimeout(settleDeltaTimer.current), []);

  // Confirm tapped in a transfer sheet: stash the amount + destination for the
  // Activity row, then run Face ID (which calls finishTransfer on done).
  const confirmTransfer = (cents: number, activityDest: TransferActivity) => {
    pendingCents.current = cents;
    pendingActivity.current = activityDest;
    setSheetConfirming(true);
  };

  /**
   * SANDBOX ONLY (see lib/gridEnv): stand in for the inbound wire the user would
   * really send to the deposit details on screen, so Add money still completes.
   * Runs the host's real on-ramp — same money path, balance move, settle
   * reconciliation and Activity row as a confirmed add; only the trigger is
   * simulated. Never call this against production keys.
   */
  const simulateBankDeposit = (cents: number, accountLast4: string) => {
    pendingCents.current = cents;
    pendingActivity.current = {
      kind: 'bank',
      bankName: 'Bank transfer',
      last4: accountLast4,
      countryCode: 'us',
      recipientName: '',
    };
    // Leaves the sheet OPEN: the instructions screen is a fork (wire to these
    // details, or add an account to pull from), so yanking it away mid-decision
    // would be worse than letting the balance move behind it.
    finishTransfer({ closeSheet: false, simulated: true });
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
        // Self-track only when no host callback is wired — a wired host moves
        // `balance` synchronously via `onReceivePayment` below.
        if (!onReceivePayment) setDeltaCents((c) => c + cents);
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
    simulateBankDeposit,
    // Derived money / activity
    availableCents,
    earningsTodayCents,
    earningsMonthCents,
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

/** The wallet brain's full surface — hosted above the skin boundary (see
 *  SignInFlow's WalletHost) and handed to each skin's view as a prop, so the
 *  state survives skin switches. */
export type WalletHome = ReturnType<typeof useWalletHome>;
