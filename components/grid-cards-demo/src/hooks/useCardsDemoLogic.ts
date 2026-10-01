'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ApiCall } from '@/data/flow';
import {
  ACTIONS,
  initialCompleted,
  initialWallet,
  type ActionId,
  type CompletedFlows,
  type WalletState,
} from '@/data/actions';
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
import { initialDesign, initialDesignFor, sameDesign, type CardDesign } from '@/data/design';
import { useThemeMode } from './useThemeMode';
import { applyPreset, PRESETS, presetOf, type PresetId } from '@/data/presets';
import type { Entry } from '@/components/ApiPanel/types';
import type { UseCardHomeOptions, WalletEntry } from '@/apps/shared/card';
import { fetchShare, rememberedToken } from '@/lib/share/client';
import type { ShareRecord } from '@/lib/share/types';
import { play } from '@/lib/sounds';

/** A share the playground was opened from. */
export interface SharedCard {
  record: ShareRecord;
  /** Present when this visitor may update it. */
  editToken: string | null;
}

// Matches ISSUE_MS in apps/shared/card/useCardHome: the activation webhook
// arrives as the card's chip flips from PROCESSING to ACTIVE on the phone.
const CARD_ACTIVE_DELAY_MS = 2700;
// A state-change webhook lands a beat after its PATCH so the rows arrive 1-by-1.
const WEBHOOK_DELAY_MS = 650;
/** The phone's flight out, with the card coming back to the stage: the brain
 *  resets once it has gone. */
const PHONE_OUT_MS = 1000;
/** Design edits that arrive as a stream without a gesture of their own
 *  (typing a name, the color picker's field, arrow nudges): a run of them
 *  within COALESCE_MS of each other is one step of undo. A drag on the card
 *  names its gesture instead (`DesignEditOptions`), so two drags are two
 *  steps however quickly one follows the other. */
const CONTINUOUS_FIELDS = new Set<string>(['brandLayout', 'artLayout', 'gradient', 'color', 'programName', 'cardholderName']);
const COALESCE_MS = 1000;
const HISTORY_MAX = 100;

export interface DesignEditOptions {
  /** The gesture this edit is a frame of (a drag, from press to release):
   *  every frame of one gesture is one step of undo. */
  gesture?: string;
}
const GROUP_LABEL: Record<ActionId, string> = {
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
 * The Cards playground brain: the card design, the wallet mirror the phone
 * renders from, the API-call log, and the flow jumps. There is no sign-in — the
 * cardholder is a Customer the platform already onboarded, so the phone boots
 * straight into the app.
 */
export function useCardsDemoLogic() {
  // The flow playing out on the phone; null between flows.
  const [activeFlow, setActiveFlow] = useState<ActionId | null>(null);
  // The cardholder's phone is on stage with the card in it. The first flow
  // brings it in; it stays through the flows that follow, so their residue
  // (rows settling, notifications, the card's state) is there to see, until
  // the visitor sends it away to get back to the card alone.
  const [phoneUp, setPhoneUp] = useState(false);
  const theme = useThemeMode();
  const [design, setDesign] = useState<CardDesign>(initialDesign);
  // Until the visitor designs something, the card is the theme's default:
  // ink on light, white on dark, following the theme if it changes. Reset
  // (a design equal to a theme's default) hands it back to the theme. A
  // layout effect, so the swap lands before paint: the theme hydrates as
  // light and flips to dark in the same commit, and the card must not show
  // a frame of the other stage's color first.
  const designed = useRef(false);
  useLayoutEffect(() => {
    if (!designed.current) setDesign(initialDesignFor(theme));
  }, [theme]);
  // The latest design, readable from callbacks without re-binding them.
  const designRef = useRef(design);
  designRef.current = design;
  // Undo: the designs before each edit, newest last, and the ones undone.
  // A drag or a run of typing is one edit: changes to the same continuous
  // fields in quick succession keep the state from before the first.
  const history = useRef<{ past: CardDesign[]; future: CardDesign[]; at: number; keys: string; gesture: string | null }>(
    { past: [], future: [], at: 0, keys: '', gesture: null },
  );
  const remember = useCallback((prev: CardDesign, keys: string[], gesture: string | null) => {
    const h = history.current;
    const key = keys.slice().sort().join(',');
    const now = performance.now();
    // A gesture's frames join the step its first frame began; anything else
    // joins the last step only if it is the same kind of streaming edit,
    // close behind, and not on the heels of a gesture.
    const coalesce = gesture
      ? gesture === h.gesture
      : h.gesture === null && keys.every((k) => CONTINUOUS_FIELDS.has(k)) && key === h.keys && now - h.at < COALESCE_MS;
    if (!coalesce) {
      h.past.push(prev);
      if (h.past.length > HISTORY_MAX) h.past.shift();
    }
    h.future = [];
    h.at = now;
    h.keys = key;
    h.gesture = gesture;
  }, []);
  const commitDesign = useCallback(
    (next: CardDesign) => {
      designed.current = !sameDesign(next, initialDesignFor(theme));
      setDesign(next);
    },
    [theme],
  );
  const updateDesign = useCallback(
    (patch: Partial<CardDesign>, opts?: DesignEditOptions) => {
      const prev = designRef.current;
      const next = { ...prev, ...patch };
      // Spot gloss has nothing to contrast against on a gloss card.
      if (next.finish === 'gloss') {
        if (next.logoTreatment === 'spotGloss') next.logoTreatment = 'print';
        if (next.artTreatment === 'spotGloss') next.artTreatment = 'print';
      }
      if (sameDesign(prev, next)) return;
      remember(prev, Object.keys(patch), opts?.gesture ?? null);
      designRef.current = next;
      commitDesign(next);
    },
    [remember, commitDesign],
  );
  const undoDesign = useCallback(() => {
    const h = history.current;
    const prev = h.past.pop();
    if (!prev) return false;
    h.future.push(designRef.current);
    h.keys = '';
    h.gesture = null;
    designRef.current = prev;
    commitDesign(prev);
    return true;
  }, [commitDesign]);
  const redoDesign = useCallback(() => {
    const h = history.current;
    const next = h.future.pop();
    if (!next) return false;
    h.past.push(designRef.current);
    h.keys = '';
    h.gesture = null;
    designRef.current = next;
    commitDesign(next);
    return true;
  }, [commitDesign]);
  // ⌘Z / Ctrl+Z undoes the last design edit, with Shift redoes it. Not
  // while typing in a field: there the browser's own undo applies.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey || e.key.toLowerCase() !== 'z') return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      e.preventDefault();
      if (e.shiftKey ? redoDesign() : undoDesign()) play('tickBright');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undoDesign, redoDesign]);

  // A shared card opened by its link: `?c=<id>` loads that design (the intro
  // then plays it), and `?edit=<token>`, or a token this browser kept from
  // making it, lets the visitor update the same share.
  const [shared, setShared] = useState<SharedCard | null>(null);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const c = p.get('c');
    if (!c) return;
    let alive = true;
    fetchShare(c)
      .then((record) => {
        if (!alive || !record) return;
        designed.current = true;
        // Fields added since the share was made take their defaults. The
        // share is where this session's edits start: nothing to undo to
        // before it.
        const loaded = { ...initialDesign, ...record.design };
        history.current = { past: [], future: [], at: 0, keys: '', gesture: null };
        designRef.current = loaded;
        setDesign(loaded);
        setShared({ record, editToken: p.get('edit') ?? rememberedToken(record.id) });
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  // The selected preset is read off the design: one while the design equals
  // it, none as soon as any control is edited away.
  const preset = useMemo(() => presetOf(design), [design]);
  const selectPreset = useCallback(
    (id: PresetId) => {
      const next = PRESETS.find((p) => p.id === id)?.design;
      if (!next) return;
      const prev = designRef.current;
      const applied = applyPreset(next, prev);
      if (sameDesign(prev, applied)) return;
      remember(prev, ['preset'], null);
      designRef.current = applied;
      designed.current = true;
      setDesign(applied);
    },
    [remember],
  );

  const [wallet, setWallet] = useState<WalletState>(initialWallet);
  const [completed, setCompleted] = useState<CompletedFlows>(initialCompleted);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [walletEntry, setWalletEntry] = useState<WalletEntry | undefined>(undefined);
  // Remounts the phone app on reset so the wallet brain starts clean.
  /** The brain's reset command (see useCardHome). */
  const [brainReset, setBrainReset] = useState({ nonce: 0, afterMs: 0 });
  // The card's current caps, mirrored so later PATCH responses show them.
  const limitsRef = useRef<CardSpendLimits>({});
  // The wallet-verification branding is platform config: set once, then only
  // when the brand changes. Adding the card itself makes no Grid call, so
  // repeat adds log nothing. Holds the brand the last PATCH sent.
  const walletBrandingRef = useRef<string | null>(null);
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
    // the phone brain flips the card to ACTIVE.
    pushWithWebhook(cardCalls(limitsRef.current), GROUP_LABEL.card, CARD_ACTIVE_DELAY_MS);
    // A new card: not frozen, whatever the last one was.
    setWallet((w) => ({ ...w, hasCard: true, frozen: false }));
    markDone('card');
  }, [pushWithWebhook, markDone]);

  const onTapToPay = useCallback<NonNullable<UseCardHomeOptions['onTapToPay']>>(
    (cents, merchant, rowId) => {
      const ref = newSpendRef(merchant, cents);
      const gid = pushWithWebhook(tapCalls(ref), GROUP_LABEL.tap);
      spendRefs.current.set(rowId, { ref, gid });
      setWallet((w) => ({ ...w, balanceCents: Math.max(0, w.balanceCents - cents) }));
      markDone('tap');
    },
    [pushWithWebhook, markDone],
  );

  const onTapDeclined = useCallback<NonNullable<UseCardHomeOptions['onTapDeclined']>>(
    (reason, cents, merchant) => {
      // The simulate now; CARD_TRANSACTION.DECLINED a beat later.
      pushWithWebhook(declineCalls(reason, merchant, cents), GROUP_LABEL.tap);
      // A decline proves the control that caused it.
      if (reason === 'CARD_PAUSED') markDone('freeze');
      if (reason === 'OVER_PER_TXN_LIMIT' || reason === 'OVER_DAILY_LIMIT') markDone('limits');
    },
    [pushWithWebhook, markDone],
  );

  const cardOptions = useMemo<NonNullable<UseCardHomeOptions['card']>>(
    () => ({
      onStateChange: (state) => {
        const label = state === 'CLOSED' ? GROUP_LABEL.close : GROUP_LABEL.freeze;
        pushWithWebhook(stateChangeCalls(state, limitsRef.current), label);
        setWallet((w) => ({ ...w, frozen: state === 'FROZEN' }));
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
        const brand = `${d.programName.trim()}|${d.logoUrl ?? ''}`;
        if (walletBrandingRef.current !== brand) {
          walletBrandingRef.current = brand;
          pushCalls(walletBrandingCalls(d.programName, d.logoUrl), GROUP_LABEL.wallet);
        }
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
      // Fast-forward: every flow but Issue needs a card, so silently provision
      // one from any starting point. STATE only — no API calls are logged for
      // the provisioning and it earns no checkmark. Each flow logs only its own
      // calls when the user actually runs it. The first flow brings the phone
      // in; the brain starts a later one at once since the phone is already up.
      const needsCard = id !== 'card' && !wallet.hasCard;
      if (needsCard) setWallet({ ...wallet, hasCard: true });
      setActiveFlow(id);
      setPhoneUp(true);
      setWalletEntry({
        nonce: Date.now(),
        provision: needsCard ? { issued: true } : undefined,
        open: id,
        phoneUp,
      });
    },
    [wallet, phoneUp],
  );

  // The phone brain reports the flow has played out; the tiles unlock. The
  // phone stays.
  const onSettled = useCallback(() => setActiveFlow(null), []);

  // Back to the card alone. Not while a flow is playing.
  const dismissPhone = useCallback(() => {
    if (activeFlow !== null) return;
    setPhoneUp(false);
  }, [activeFlow]);

  // Dev: bring the phone up or send it away from the console, for posing its
  // screens with `__cardHome.pose(...)` (see useCardHome).
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    const w = window as unknown as Record<string, unknown>;
    w.__cardsDemo = { phone: (up = true) => setPhoneUp(up) };
    return () => {
      delete w.__cardsDemo;
    };
  }, []);

  // Reset: the phone flies away with whatever it was showing (the card comes
  // back to the stage), the API log clears, and once the phone has gone the
  // brain resets in place to a fresh card (see useCardHome's `reset`). No
  // remount: everything animates through it.
  const reset = useCallback(() => {
    pendingTimers.current.forEach((t) => clearTimeout(t));
    pendingTimers.current.clear();
    spendRefs.current.clear();
    limitsRef.current = {};
    walletBrandingRef.current = null;
    setWallet(initialWallet);
    setActiveFlow(null);
    setCompleted(initialCompleted);
    setEntries([]);
    setWalletEntry(undefined);
    setBrainReset((r) => ({ nonce: r.nonce + 1, afterMs: phoneUp ? PHONE_OUT_MS : 0 }));
    setPhoneUp(false);
  }, [phoneUp]);

  return {
    activeFlow,
    // A flow is playing out on the phone; the panel holds tiles and Reset.
    running: activeFlow !== null,
    phoneUp,
    dismissPhone,
    design,
    updateDesign,
    shared,
    preset,
    selectPreset,
    wallet,
    completed,
    entries,
    walletEntry,
    brainReset,
    handleAction,
    reset,
    onCardIssued,
    onTapToPay,
    onTapDeclined,
    cardOptions,
    onSettled,
  };
}
