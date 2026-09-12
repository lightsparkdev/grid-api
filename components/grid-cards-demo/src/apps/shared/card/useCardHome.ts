'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FUNDING_SOURCE_CENTS } from '@/data/actions';
import type { ToastData } from '@/apps/shared/Toast';
import {
  useCardControls,
  type DeclineReason,
  type TransactionStatus,
  type UseCardControlsOptions,
  type WalletAddPhase,
} from './useCardControls';
import type { SpendLimits } from './useCardControls';
import type { ActivityKind, TapPhase, WalletEntry, WalletListItemData } from './types';
import { TAP_MERCHANTS, parseCents } from './merchants';

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
/** The reveal has played (page pushed, digits rolled); the page stays. */
const REVEAL_SETTLE_MS = 1400;
/** The cardholder reads Apple's "Add Card to Apple Pay" this long, then taps
 *  Continue. */
const WALLET_CONTINUE_MS = 1400;
/** Apple's waits, from Continue to its flow going (see useCardControls). */
const WALLET_ADDING_MS = 1500 + 1500 + 1100;
/** The app's toast lands as Apple's flow finishes sliding away. */
const WALLET_TOAST_MS = 350;
/** Dwell on the transaction sheet before the refund runs. */
const REFUND_START_MS = 1100;
/** Dwell after a refund before the sheet closes. */
const REFUND_HOLD_MS = 2200;
/** Simple state changes (freeze, close) settle after the notification. */
const NOTICE_SETTLE_MS = 1400;
/** Limits: the page opens; the cardholder opens Per purchase, turns its wheel,
 *  opens Per day (the first closes), turns that one, and saves. */
const LIMITS_OPEN_ROW_MS = 800;
const LIMITS_TURN_MS = 900;
const LIMITS_NEXT_ROW_MS = 1000;
const LIMITS_SAVE_MS = 1100;
/** Push notification hold. */
const NOTICE_MS = 3600;
/** The Limits flow applies these caps (platform-side PATCH). */
export const PRESET_LIMITS: SpendLimits = { perTransactionCents: 7_500, perDayCents: 25_000 };

/** How a card event reads in Activity. */
const EVENT_TITLE: Record<ActivityKind, string> = {
  issued: 'Card issued',
  frozen: 'Card frozen',
  unfrozen: 'Card unfrozen',
  wallet: 'Added to Apple Wallet',
  limits: 'Spending limits set',
  closed: 'Card closed',
};
const EVENT_DETAIL: Record<ActivityKind, string> = {
  issued: 'Virtual Visa debit',
  frozen: 'Purchases are declined',
  unfrozen: 'Purchases go through again',
  wallet: 'Ready for Apple Pay',
  limits: '',
  closed: 'No longer usable',
};

/** A phone moment the dev hook can pose and hold (see `pose` below). */
export type CardPose =
  | 'home'
  | 'faceid'
  | 'numbers'
  | 'wallet'
  | 'walletAgain'
  | 'freeze'
  | 'limits'
  | 'transaction'
  | 'close'
  | 'tap'
  | 'notice'
  | 'toast';

export interface CardPoseOptions {
  /** `wallet`: 'intro' | 'contacting' | 'setup' | 'added';
   *  `tap`: 'hold' | 'auth' | 'done' | 'declined'. */
  phase?: WalletAddPhase | TapPhase;
  /** `tap` at 'declined': why. */
  reason?: DeclineReason;
  /** `transaction`: seeds a row in this status. */
  status?: TransactionStatus;
  /** `notice`: its lines; `toast`: its text (title). */
  title?: string;
  body?: string;
}

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
  /** The current flow has played out on the phone; the next one can start. */
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

  // Push notification on the phone (freeze, limits, close, refund).
  const [notice, setNotice] = useState<CardNotice | null>(null);
  const noticeTimer = useRef(0);
  const notify = (title: string, body: string) => {
    setNotice({ id: Date.now(), title, body });
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), NOTICE_MS);
  };
  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  // Glass toast (overlay layer): the tap-to-pay balance guard, the wallet add.
  const [toast, setToast] = useState<ToastData | null>(null);
  const showToast = (text: string) => setToast({ id: Date.now(), text });

  // Funding source balance: opening balance less card spend this session.
  const [deltaCents, setDeltaCents] = useState(0);
  const availableCents = FUNDING_SOURCE_CENTS + deltaCents;

  const card = useCardControls({
    ...cardOptions,
    // The refund lands: the money is back on the funding source, the phone
    // says so, and the playground logs it, all on the same beat.
    onRefund: (row) => {
      setDeltaCents((c) => c + row.cents);
      notify(`Refund from ${row.title}`, `+${row.amount} back on your card`);
      cardOptions?.onRefund?.(row);
    },
    // Apple's flow is done and sliding away: the app's toast says so.
    onAddToWallet: () => {
      window.setTimeout(() => showToast('Added to Apple Wallet'), WALLET_TOAST_MS);
      cardOptions?.onAddToWallet?.();
    },
  });
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

  // Activity: the purchases (the controls' rows, labelled by lifecycle) and
  // the card's events, newest first.
  const activity: WalletListItemData[] = useMemo(() => {
    const purchases: WalletListItemData[] = card.rows.map((r) => ({
      ...r,
      detail: r.status === 'AUTHORIZED' ? 'Pending' : r.status === 'REFUNDED' ? 'Refunded' : r.detail,
    }));
    const events: WalletListItemData[] = card.events.map((e) => ({
      id: e.id,
      category: e.kind,
      title: EVENT_TITLE[e.kind],
      detail: e.detail ?? EVENT_DETAIL[e.kind],
      timestamp: e.timestamp,
      amount: '',
    }));
    return [...purchases, ...events].sort((a, b) => b.timestamp - a.timestamp);
  }, [card.rows, card.events]);

  const isTap = tapPhase !== 'idle';
  const isDeclined = tapPhase === 'declined';

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
    // A closed or frozen card is not brought back; this is a new one.
    card.reissue();
    onCardIssued?.();
    window.clearTimeout(issueTimer.current);
    issueTimer.current = window.setTimeout(() => {
      setIssued(true);
      setIssuing(false);
      cardRef.current.recordEvent('issued');
      settle(1100);
    }, ISSUE_MS);
  };
  useEffect(() => () => window.clearTimeout(issueTimer.current), []);

  // Dev posing holds a tap phase in place: the auto-advances below stand down.
  const posed = useRef(false);

  // Tap-to-pay: Hold Near Reader dwells, then Face ID runs.
  useEffect(() => {
    if (tapPhase !== 'hold' || posed.current) return;
    const t = window.setTimeout(() => setTapPhase('auth'), TAP_HOLD_MS);
    return () => window.clearTimeout(t);
  }, [tapPhase]);

  // Tap-to-pay: once the Done check lands, resolve back to the hub, THEN drop
  // the transaction in once the screen has settled — so the new row pushes the
  // list down instead of already being there. The insert timer lives in a ref:
  // the effect re-runs on the idle flip, and a cleanup there would kill it.
  const insertTimer = useRef(0);
  useEffect(() => {
    if (tapPhase !== 'done' || posed.current) return;
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
    if (tapPhase !== 'declined' || posed.current) return;
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

  // ── The flows. Each is what a tile runs, and what the cardholder's own tap
  // on the phone runs (the header buttons, the row under the card). `settle`
  // tells the playground a tile's flow is over; from the phone it is a no-op.

  /** A flow is starting for real: a dev pose no longer holds the phone. */
  const arm = () => {
    posed.current = false;
  };

  /** Reveal details: Face ID first, then the Card Numbers page is pushed and
   *  the card turns to its back. The page stays until Back or the next flow. */
  const startReveal = () => {
    arm();
    if (card.closed) {
      notify('Card closed', 'Details are no longer available for this card.');
      settle(NOTICE_SETTLE_MS);
      return;
    }
    setRevealPending(true);
  };
  const finishRevealAuth = () => {
    setRevealPending(false);
    card.reveal();
    settle(REVEAL_SETTLE_MS);
  };

  /** Freeze, or unfreeze: the PATCH and its webhook, and a push on the phone. */
  const toggleFreeze = () => {
    arm();
    if (card.closed) {
      notify('Card closed', 'A closed card can’t be frozen or unfrozen.');
      settle(NOTICE_SETTLE_MS);
      return;
    }
    const next = !card.frozen;
    card.setFrozen(next);
    notify(
      next ? 'Card frozen' : 'Card unfrozen',
      next ? 'Purchases will be declined until you unfreeze it.' : 'Your card is active again.',
    );
    settle(NOTICE_SETTLE_MS);
  };

  /** Add to Apple Wallet: Apple's add-card flow comes up; the cardholder's
   *  Continue is scripted (a real tap first wins, the script's is then a
   *  no-op); when Apple's flow goes, a toast says the card was added.
   *  Already added: a sheet says so. */
  const startAddToWallet = () => {
    arm();
    if (card.closed) {
      notify('Card closed', 'A closed card can’t be added to Apple Wallet.');
      settle(NOTICE_SETTLE_MS);
      return;
    }
    if (card.inWallet) {
      card.startAddToWallet(); // the "already in your wallet" sheet
      settle(NOTICE_SETTLE_MS);
      return;
    }
    card.startAddToWallet();
    later(() => cardRef.current.confirmAddToWallet(), WALLET_CONTINUE_MS);
    settle(WALLET_CONTINUE_MS + WALLET_ADDING_MS + WALLET_TOAST_MS + 600);
  };

  // The merchant is picked when the tap STARTS — the balance guard, the charge,
  // and the inserted row all see the same one. Shuffled-deck draw: every
  // merchant appears once (random order) before any repeats; the reshuffle
  // keeps the previous deck's last card off the top so back-to-back can't
  // happen across deck boundaries. A blocked tap puts the card back.
  const merchantDeck = useRef<typeof TAP_MERCHANTS>([]);
  const pendingTapTx = useRef(TAP_MERCHANTS[0]);
  const startTapToPay = () => {
    arm();
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
  // StrictMode's double-invoke don't replay it). The first flow brings the
  // phone in; once it has landed (or at once, if it is already up), the flow
  // plays out on its own — the cardholder's taps (Face ID, Add to Apple
  // Wallet) are scripted — and reports `onSettled` so the playground can
  // unlock the tiles. The phone stays up until the visitor sends it away.
  const lastEntryNonce = useRef(0);
  useEffect(() => {
    if (!entry || entry.nonce === lastEntryNonce.current) return;
    lastEntryNonce.current = entry.nonce;
    clearFlowTimers();
    posed.current = false;

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
          startReveal();
          break;
        case 'wallet':
          startAddToWallet();
          break;
        case 'freeze':
          toggleFreeze();
          break;
        case 'limits': {
          if (card.closed) {
            notify('Card closed', 'Limits can’t be changed on a closed card.');
            settle(NOTICE_SETTLE_MS);
            break;
          }
          // The cardholder opens Spending limits, opens Per purchase and turns
          // its wheel to the cap, then Per day, then saves; the page pops.
          card.openLimits();
          let at = LIMITS_OPEN_ROW_MS;
          later(() => cardRef.current.setLimitsRow('perTransaction'), at);
          at += LIMITS_TURN_MS;
          later(
            () => cardRef.current.setLimitsDraft((d) => ({ ...d, perTransactionCents: PRESET_LIMITS.perTransactionCents })),
            at,
          );
          at += LIMITS_NEXT_ROW_MS;
          later(() => cardRef.current.setLimitsRow('perDay'), at);
          at += LIMITS_TURN_MS;
          later(() => cardRef.current.setLimitsDraft((d) => ({ ...d, perDayCents: PRESET_LIMITS.perDayCents })), at);
          at += LIMITS_SAVE_MS;
          later(() => {
            const c = cardRef.current;
            c.saveLimits(c.limitsDraft);
            c.popPage();
            settle(500);
          }, at);
          break;
        }
        case 'refund': {
          // Only a settled purchase can be returned. None yet: provision one
          // (state only, like the other fast-forwards; it was spent from the
          // funding source) so the flow has something to act on.
          let target = card.rows.find((r) => r.status === 'SETTLED');
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
            setDeltaCents((c) => c - target!.cents);
          }
          const row = target;
          card.openTransaction(row.id);
          // The notice and the balance follow the row's flip (onRefund above).
          later(() => cardRef.current.refundRow(row.id), REFUND_START_MS);
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

    // Clear whatever the previous flow left up, then run: once the phone lands,
    // or at once when it is already up from an earlier flow. Issue starts at
    // once either way, so the phone arrives already on the creating screen
    // and the card dives into its centered slot.
    const busy = card.surfaceUp || revealPending || tapPhase !== 'idle';
    setTapPhase('idle');
    card.resetSurfaces();
    setRevealPending(false);
    setNotice(null);
    const waitForPhone = entry.phoneUp || entry.open === 'card' ? 0 : PHONE_IN_MS;
    later(run, waitForPhone + (busy ? ENTRY_HOME_SETTLE_MS : 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry]);

  // Dev: pose the phone in any flow moment and hold it there, so a screen can
  // be tuned without replaying its timed sequence. Nothing is logged. From the
  // console, with the phone up (`__cardsDemo.phone(true)`):
  //   __cardHome.pose('wallet', { phase: 'contacting' })
  //   __cardHome.pose('tap', { phase: 'declined', reason: 'OVER_PER_TXN_LIMIT' })
  //   __cardHome.pose('transaction', { status: 'AUTHORIZED' })
  //   __cardHome.pose('notice', { title: 'Card frozen', body: '…' })
  // The next flow from a tile takes over as usual.
  const pose = (target: CardPose, opts: CardPoseOptions = {}) => {
    clearFlowTimers();
    posed.current = true;
    const c = cardRef.current;
    setRevealPending(false);
    setNotice(null);
    setToast(null);
    c.setLastDecline(null);
    c.resetSurfaces();
    setTapPhase('idle');
    switch (target) {
      case 'home':
        break;
      case 'faceid':
        setRevealPending(true);
        break;
      case 'numbers':
        c.markRevealed();
        c.openNumbers();
        break;
      case 'wallet':
        c.setWalletPhase((opts.phase as WalletAddPhase | undefined) ?? 'intro');
        break;
      case 'walletAgain':
        c.setSheet('walletAgain');
        break;
      case 'freeze':
        c.setSheet('freeze');
        break;
      case 'limits':
        c.openLimits();
        break;
      case 'transaction': {
        let row = c.rows[0];
        if (!row || opts.status) {
          const seed = TAP_MERCHANTS[0];
          const seeded = { ...seed, id: `pose-${Date.now()}`, timestamp: Date.now(), cents: parseCents(seed.amount) };
          c.seedSettledRow(seeded, opts.status ?? 'SETTLED');
          row = { ...seeded, status: opts.status ?? 'SETTLED' };
        }
        c.openTransaction(row.id);
        break;
      }
      case 'close':
        c.setSheet('close');
        break;
      case 'tap': {
        const phase = (opts.phase as TapPhase | undefined) ?? 'hold';
        if (phase === 'declined') c.setLastDecline(opts.reason ?? 'CARD_PAUSED');
        setTapPhase(phase);
        break;
      }
      case 'notice':
        window.clearTimeout(noticeTimer.current);
        setNotice({ id: Date.now(), title: opts.title ?? 'Card frozen', body: opts.body ?? 'Purchases will be declined until you unfreeze it.' });
        break;
      case 'toast':
        setToast({ id: Date.now(), text: opts.title ?? 'Not enough balance' });
        break;
      default: {
        const never: never = target;
        throw new Error(`Unknown pose ${String(never)}`);
      }
    }
  };
  const poseRef = useRef(pose);
  poseRef.current = pose;
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    const w = window as unknown as Record<string, unknown>;
    w.__cardHome = {
      pose: (target: CardPose, opts?: CardPoseOptions) => poseRef.current(target, opts),
      get card() {
        return cardRef.current;
      },
    };
    return () => {
      delete w.__cardHome;
    };
  }, []);

  return {
    // Card / tap state
    issued,
    issuing,
    issueCard,
    tapPhase,
    setTapPhase,
    activity,
    availableCents,
    // Toast + push notification
    toast,
    setToast,
    showToast,
    notice,
    // Card controls (freeze / close / limits / reveal / wallet / transactions)
    card,
    revealPending,
    finishRevealAuth,
    finishTapAuth,
    // Derived view flags
    isTap,
    isDeclined,
    // The flows, for the cardholder's own taps on the phone
    startReveal,
    toggleFreeze,
    startAddToWallet,
    startTapToPay,
  };
}

/** The card brain's full surface — hosted above the face (CardHost) and handed
 *  to it as a prop. */
export type CardHome = ReturnType<typeof useCardHome>;
