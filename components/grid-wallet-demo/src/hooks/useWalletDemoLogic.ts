'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import type { AuthMethod, Persona, ScreenId, ApiCall } from '@/data/flow';
import { primaryAuthMethod, type UseCaseId } from '@/data/configure';
import {
  initialCompleted,
  initialWallet,
  phoneFromState,
  type ActionId,
  type CompletedFlows,
  type WalletState,
} from '@/data/actions';
import {
  addMoneySettlementCalls,
  cardCalls,
  externalAccountCreateCall,
  oauthVerifyCall,
  otpRequestCall,
  otpVerifyCall,
  passkeyChallengeCall,
  passkeyVerifyCall,
  receivePaymentCalls,
  tapCalls,
  transferExecuteCalls,
  transferQuoteCall,
  type ExternalAccountInput,
  type ReceivePaymentInfo,
  type TransferDest,
} from '@/data/apiCalls';
import { oauthNonce, passkeyCeremony } from '@/lib/auth';
import type { WalletEntry, WalletTransferMode } from '@/apps/aurora/wallet';
import type { Entry } from '@/components/ApiPanel/types';
import { SEED_API_PANEL, seedApiEntries } from '@/data/apiPanelSeed';

const TRANSFER_LABEL: Record<WalletTransferMode, string> = {
  add: 'Add money',
  withdraw: 'Withdraw',
  send: 'Send payment',
};

const newGroupId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/** Silent funding applied when a jumped-to flow needs a balance and there's none. */
const FAST_FORWARD_FUND_CENTS = 500_000;

/** A transfer's transaction settles a beat after execute, so calls land 1-by-1. */
const SETTLE_DELAY_MS = 650;

interface Transient {
  screen: ScreenId;
  note?: string;
  activated?: boolean;
}

interface Session {
  method?: AuthMethod;
  email?: string;
  phone?: string;
  expiresAt?: number;
}

const SESSION_MS = 15 * 60 * 1000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Demo interaction logic — preserved for phase 2 UI wiring.
 * Returns the full surface area Sidebar / Phone / ApiPanel expect.
 */
export function useWalletDemoLogic() {
  const [persona, setPersona] = useState<Persona>('fintech');
  const [useCase, setUseCase] = useState<UseCaseId>('fintech');
  const [methods, setMethods] = useState<AuthMethod[]>([
    'email_otp',
    'sms',
    'oauth',
    'apple',
    'passkey',
  ]);
  const method = useMemo(() => primaryAuthMethod(methods), [methods]);
  const [wallet, setWallet] = useState<WalletState>(initialWallet);
  // Sticky sidebar checkmarks — "have you ever run this flow". Separate from
  // `wallet` so replaying "Sign in" (which resets the session wallet) keeps them;
  // only Reset wipes them.
  const [completed, setCompleted] = useState<CompletedFlows>(initialCompleted);
  const [entries, setEntries] = useState<Entry[]>(() =>
    SEED_API_PANEL ? seedApiEntries() : [],
  );
  const [transient, setTransient] = useState<Transient | null>(null);
  const [running, setRunning] = useState(false);

  const [signInMethod, setSignInMethod] = useState<AuthMethod | null>(null);
  const [passkeyActive, setPasskeyActive] = useState(false);
  const [faceIdActive, setFaceIdActive] = useState(false);
  const [otpActive, setOtpActive] = useState(false);
  const [emailActive, setEmailActive] = useState(false);
  const [phoneActive, setPhoneActive] = useState(false);
  const [gNonce, setGNonce] = useState<string | null>(null);
  const [aNonce, setANonce] = useState<string | null>(null);
  // A REAL provider popup is pending (aurora's Airbnb-model sign-in) — the
  // auth screen must NOT show a busy state while it's open (the phone stays
  // exactly as it is; `running` still guards re-entry underneath).
  const [popupWait, setPopupWait] = useState(false);

  // A jump command for the live Aurora wallet (provision + open a flow out of
  // order). Bumping its nonce makes the wallet apply it once.
  const [walletEntry, setWalletEntry] = useState<WalletEntry | undefined>(undefined);
  // Skip the sign-in intro hold when a fast-forward jump signs you in silently.
  const [skipIntro, setSkipIntro] = useState(false);
  // The in-flight transfer's group id — its create-quote and execute calls
  // stream into one API-panel group.
  const transferGroup = useRef<string | null>(null);
  const transferFundingCurrency = useRef<string | null>(null);
  // Pending "transaction settled" pushes (so execute and the GET land 1-by-1);
  // cleared on reset so a late push can't re-add a row to a wiped panel.
  const settleTimers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const session = useRef<Session>({});
  const passkeyPrompt = useRef<{ resolve: () => void; reject: (e: Error) => void } | null>(null);
  const faceIdPrompt = useRef<{ resolve: () => void; timer: ReturnType<typeof setTimeout> } | null>(
    null,
  );
  const otpPrompt = useRef<{ resolve: (c: string) => void; reject: (e: Error) => void } | null>(null);
  const emailPrompt = useRef<{ resolve: (e: string) => void; reject: (e: Error) => void } | null>(null);
  const phonePrompt = useRef<{ resolve: (n: string) => void; reject: (e: Error) => void } | null>(null);
  const googlePrompt = useRef<{ resolve: (t: string) => void; reject: (e: Error) => void } | null>(null);
  const applePrompt = useRef<{ resolve: (t: string) => void; reject: (e: Error) => void } | null>(null);

  const promptEmail = useCallback((): Promise<string> => {
    setEmailActive(true);
    return new Promise((resolve, reject) => (emailPrompt.current = { resolve, reject }));
  }, []);
  const submitEmail = useCallback((email: string) => {
    setEmailActive(false);
    const p = emailPrompt.current;
    emailPrompt.current = null;
    p?.resolve(email);
  }, []);
  const cancelEmail = useCallback(() => {
    setEmailActive(false);
    const p = emailPrompt.current;
    emailPrompt.current = null;
    p?.reject(new Error('cancelled'));
  }, []);
  const promptPhone = useCallback((): Promise<string> => {
    setPhoneActive(true);
    return new Promise((resolve, reject) => (phonePrompt.current = { resolve, reject }));
  }, []);
  const submitPhone = useCallback((number: string) => {
    setPhoneActive(false);
    const p = phonePrompt.current;
    phonePrompt.current = null;
    p?.resolve(number);
  }, []);
  const cancelPhone = useCallback(() => {
    setPhoneActive(false);
    const p = phonePrompt.current;
    phonePrompt.current = null;
    p?.reject(new Error('cancelled'));
  }, []);
  const cancelOtp = useCallback(() => {
    setOtpActive(false);
    const p = otpPrompt.current;
    otpPrompt.current = null;
    p?.reject(new Error('cancelled'));
  }, []);
  /** OTP step → back to the entry step (authenticate's OTP loop re-prompts). */
  const backOtp = useCallback(() => {
    setOtpActive(false);
    // Re-arm the ACTIVE method's entry step IN THE SAME RENDER: the loop's
    // re-prompt arrives a beat later, and without this the sheet's `open`
    // (entry || otp) blips false for a frame — the dismiss animation starts
    // and the sheet visibly jumps as it recovers.
    if ((session.current.method ?? method) === 'sms') setPhoneActive(true);
    else setEmailActive(true);
    const p = otpPrompt.current;
    otpPrompt.current = null;
    p?.reject(new Error('back'));
  }, [method]);

  const promptPasskey = useCallback((): Promise<void> => {
    setPasskeyActive(true);
    return new Promise((resolve, reject) => (passkeyPrompt.current = { resolve, reject }));
  }, []);
  const confirmPasskey = useCallback(() => {
    // Leave the sheet up — it stays through the credential ceremony (the passcode /
    // system passkey dialog) and only dismisses once that resolves, in the passkey
    // branch of `authenticate`.
    const p = passkeyPrompt.current;
    passkeyPrompt.current = null;
    p?.resolve();
  }, []);
  const cancelPasskey = useCallback(() => {
    setPasskeyActive(false);
    const p = passkeyPrompt.current;
    passkeyPrompt.current = null;
    p?.reject(new Error('cancelled'));
  }, []);

  const finishFaceId = useCallback(() => {
    const p = faceIdPrompt.current;
    faceIdPrompt.current = null;
    if (p) clearTimeout(p.timer);
    setFaceIdActive(false);
    p?.resolve();
  }, []);
  // Plays the iOS Face ID animation in the phone and resolves once it has run its
  // full course (the FaceIdAuth overlay calls finishFaceId on exit). A safety
  // timeout guarantees sign-in never hangs if the overlay is interrupted before it
  // can report done — otherwise `running` would stay true and lock every button.
  const playFaceId = useCallback((): Promise<void> => {
    setFaceIdActive(true);
    return new Promise((resolve) => {
      const timer = setTimeout(finishFaceId, 6000);
      faceIdPrompt.current = { resolve, timer };
    });
  }, [finishFaceId]);

  const promptOtp = useCallback((): Promise<string> => {
    setOtpActive(true);
    return new Promise((resolve, reject) => (otpPrompt.current = { resolve, reject }));
  }, []);
  const submitOtp = useCallback((code: string) => {
    setOtpActive(false);
    const p = otpPrompt.current;
    otpPrompt.current = null;
    p?.resolve(code);
  }, []);

  const promptGoogle = useCallback((nonce: string): Promise<string> => {
    setGNonce(nonce);
    return new Promise((resolve, reject) => (googlePrompt.current = { resolve, reject }));
  }, []);
  const submitGoogle = useCallback((token: string) => {
    setGNonce(null);
    const p = googlePrompt.current;
    googlePrompt.current = null;
    p?.resolve(token);
  }, []);

  const promptApple = useCallback((nonce: string): Promise<string> => {
    setANonce(nonce);
    return new Promise((resolve, reject) => (applePrompt.current = { resolve, reject }));
  }, []);
  const submitApple = useCallback((token: string) => {
    setANonce(null);
    const p = applePrompt.current;
    applePrompt.current = null;
    p?.resolve(token);
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

  const startSession = useCallback(() => {
    session.current.expiresAt = Date.now() + SESSION_MS;
  }, []);

  const authenticate = useCallback(
    /**
     * `popup` is a REAL provider popup already opened by the CTA's tap
     * handler (popup blockers require the window to open inside the user
     * gesture, so the loop can't open it after an await). When absent,
     * oauth/apple fall back to the classic full-screen prompt with the
     * provider's own widget.
     */
    async (firstTime: boolean, popup?: Promise<string>) => {
      const m = session.current.method ?? method;
      if (m === 'email_otp' || m === 'sms') {
        // ONE loop for both OTP methods — only the entry prompt and the
        // session field differ. The OTP step can come BACK to the entry step
        // (the sheet's X): the prompt rejects with 'back' and the loop
        // re-prompts the entry.
        const field = m === 'sms' ? ('phone' as const) : ('email' as const);
        const promptEntry = m === 'sms' ? promptPhone : promptEmail;
        // Request + verify stream into ONE "Sign in" group as they actually fire.
        const gid = newGroupId();
        let needEntry = firstTime;
        for (;;) {
          if (needEntry || !session.current[field]) {
            session.current[field] = await promptEntry();
          }
          // Submitting the phone/email fires the OTP request right away.
          pushCalls([otpRequestCall(m, session.current[field])], 'Sign in', gid);
          setTransient({ screen: 'creating', note: 'Sending you a code…' });
          await sleep(600);
          try {
            await promptOtp();
            break;
          } catch (e) {
            if ((e as Error)?.message !== 'back') throw e;
            setTransient(null);
            needEntry = true;
          }
        }
        // Code accepted → verify fires; then let the sheet's dismiss VISIBLY
        // finish (transient clears first so the auth screen is back underneath
        // the departing sheet) before the wallet flip starts the intro.
        pushCalls([otpVerifyCall(m)], 'Sign in', gid);
        setTransient(null);
        await sleep(400);
      } else if (m === 'passkey') {
        const gid = newGroupId();
        await promptPasskey();
        // Confirming the passkey starts the challenge.
        pushCalls([passkeyChallengeCall()], 'Sign in', gid);
        try {
          await passkeyCeremony();
        } finally {
          // Dismiss the sheet once the passcode / passkey ceremony is done
          // (whether it succeeded or was cancelled).
          setPasskeyActive(false);
        }
        await playFaceId();
        // Assertion verified after the Face ID ceremony.
        pushCalls([passkeyVerifyCall()], 'Sign in', gid);
      } else if (m === 'oauth' || m === 'apple') {
        if (popup) {
          // The popup is already open — the phone stays untouched until it
          // resolves (cancel rejects 'cancelled' and nothing here ran).
          await popup;
        } else {
          const prompt = m === 'apple' ? promptApple : promptGoogle;
          await prompt(await oauthNonce());
        }
        // The same post-resolve beat as the OTP sheet's dismiss: a breath
        // between the ceremony finishing and the wallet flip's intro.
        await sleep(400);
        pushCalls([oauthVerifyCall(m)], 'Sign in');
      } else {
        throw new Error(`Sign-in method "${m}" is not available.`);
      }
      startSession();
    },
    [method, promptEmail, promptPhone, promptOtp, promptGoogle, promptApple, promptPasskey, playFaceId, pushCalls, startSession],
  );

  const signInWithMethod = useCallback(
    async (m: AuthMethod, popup?: Promise<string>) => {
      if (running) {
        // A flow is already live (e.g. its popup is open) — swallow the
        // stray popup promise so the rejection doesn't go unhandled.
        popup?.catch(() => {});
        return;
      }
      setRunning(true);
      // A manual sign-in plays the full intro and starts clean — drop any stale
      // fast-forward jump/skip from a prior session.
      setSkipIntro(false);
      setWalletEntry(undefined);
      // The popup wait must not read as busy on the auth screen — the phone
      // stays exactly as it is while the real provider popup is up.
      if (popup) setPopupWait(true);
      try {
        session.current = { method: m };
        setSignInMethod(m);
        await authenticate(true, popup);
        setWallet((w) => ({ ...w, created: true, balanceCents: 0 }));
        setCompleted((c) => ({ ...c, signIn: true }));
        setTransient(null);
      } catch (e: unknown) {
        if ((e as Error)?.message !== 'cancelled') console.error('[grid-demo]', e);
        setTransient(null);
      } finally {
        setPopupWait(false);
        setRunning(false);
      }
    },
    [running, authenticate],
  );

  // The live Aurora wallet owns its own UI + displayed balance; it reports each
  // step up so we log the matching Grid calls and keep a mirror of wallet state
  // for the sidebar's availability/done gating. A transfer is two beats: the
  // create-quote (amount committed) opens a group; the execute (Face ID) streams
  // into that same group and moves the balance.
  const onQuoteCreate = useCallback(
    (mode: WalletTransferMode, cents: number, dest?: TransferDest) => {
      const gid = newGroupId();
      transferGroup.current = gid;
      transferFundingCurrency.current =
        mode === 'add' && dest?.kind === 'bank' ? dest.currency : null;
      pushCalls([transferQuoteCall(mode, cents, dest)], TRANSFER_LABEL[mode], gid);
    },
    [pushCalls],
  );

  // Linking a recipient (a bank account or a crypto address) — its own group,
  // logged the moment "Add bank account" / "Add recipient" is confirmed.
  const onLinkExternalAccount = useCallback(
    (input: ExternalAccountInput, label: string) => {
      pushCalls([externalAccountCreateCall(input)], label);
    },
    [pushCalls],
  );

  const onTransferExecute = useCallback(
    (mode: WalletTransferMode, cents: number) => {
      const gid = transferGroup.current ?? newGroupId();
      transferGroup.current = null;
      if (mode === 'add') {
        const fundingCurrency = transferFundingCurrency.current ?? 'USD';
        transferFundingCurrency.current = null;
        const [webhookCall, ...settleCalls] = addMoneySettlementCalls(cents, fundingCurrency);
        pushCalls([webhookCall], TRANSFER_LABEL[mode], gid);
        if (settleCalls.length) {
          const timer = setTimeout(() => {
            settleTimers.current.delete(timer);
            pushCalls(settleCalls, TRANSFER_LABEL[mode], gid);
          }, SETTLE_DELAY_MS);
          settleTimers.current.add(timer);
        }
        setWallet((w) => ({ ...w, balanceCents: w.balanceCents + cents }));
        setCompleted((c) => ({ ...c, add: true }));
        return;
      }
      // Calls land one at a time: execute now, the transaction settles a beat
      // later (real interactions only — fast-forward batches its setup group).
      transferFundingCurrency.current = null;
      const [executeCall, ...settleCalls] = transferExecuteCalls(mode);
      pushCalls([executeCall], TRANSFER_LABEL[mode], gid);
      if (settleCalls.length) {
        const timer = setTimeout(() => {
          settleTimers.current.delete(timer);
          pushCalls(settleCalls, TRANSFER_LABEL[mode], gid);
        }, SETTLE_DELAY_MS);
        settleTimers.current.add(timer);
      }
      setWallet((w) => ({
        ...w,
        balanceCents: Math.max(0, w.balanceCents - cents),
      }));
      setCompleted((c) => ({ ...c, [mode]: true }));
    },
    [pushCalls],
  );

  const onCardIssued = useCallback(() => {
    pushCalls(cardCalls(), 'Issue a card');
    setWallet((w) => ({ ...w, hasCard: true }));
    setCompleted((c) => ({ ...c, card: true }));
  }, [pushCalls]);

  const onTapToPay = useCallback(
    (cents: number, merchant: string) => {
      pushCalls(tapCalls(merchant, cents), 'Tap to pay');
      setWallet((w) => ({
        ...w,
        cardActivated: true,
        balanceCents: Math.max(0, w.balanceCents - cents),
      }));
      setCompleted((c) => ({ ...c, tap: true }));
    },
    [pushCalls],
  );

  // A payment landed (Receive flow): no client call to make — Grid POSTs the
  // inbound webhook, then we read the transaction. The webhook lands now and the
  // GET a beat later (same 1-by-1 cadence as a transfer's settle).
  const onReceivePayment = useCallback(
    (info: ReceivePaymentInfo) => {
      // Add-from-crypto is the same inbound webhook, just grouped + checked as the
      // Add flow (you topped up your own balance) rather than Receive.
      const isAdd = info.intent === 'add';
      const label = isAdd ? 'Add money' : 'Receive payment';
      const gid = newGroupId();
      const [webhookCall, ...rest] = receivePaymentCalls(info);
      pushCalls([webhookCall], label, gid);
      if (rest.length) {
        const timer = setTimeout(() => {
          settleTimers.current.delete(timer);
          pushCalls(rest, label, gid);
        }, SETTLE_DELAY_MS);
        settleTimers.current.add(timer);
      }
      setWallet((w) => ({ ...w, balanceCents: w.balanceCents + info.amountCents }));
      setCompleted((c) => ({ ...c, [isAdd ? 'add' : 'receive']: true }));
    },
    [pushCalls],
  );

  // "Sign in again" — drop back to the auth screen to replay the flow. Resets
  // the session wallet to fresh, but KEEPS the API log and the sidebar
  // checkmarks (completed flows) — only "Reset" wipes those.
  const returnToSignIn = useCallback(() => {
    for (const p of [passkeyPrompt, otpPrompt, emailPrompt, phonePrompt, googlePrompt, applePrompt]) {
      p.current?.reject(new Error('cancelled'));
      p.current = null;
    }
    if (faceIdPrompt.current) {
      clearTimeout(faceIdPrompt.current.timer);
      faceIdPrompt.current.resolve();
      faceIdPrompt.current = null;
    }
    session.current = {};
    transferGroup.current = null;
    transferFundingCurrency.current = null;
    settleTimers.current.forEach((t) => clearTimeout(t));
    settleTimers.current.clear();
    setWallet(initialWallet);
    setTransient(null);
    setSignInMethod(null);
    setPasskeyActive(false);
    setFaceIdActive(false);
    setOtpActive(false);
    setEmailActive(false);
    setPhoneActive(false);
    setGNonce(null);
    setANonce(null);
    setPopupWait(false);
    setWalletEntry(undefined);
    setSkipIntro(false);
    setRunning(false);
  }, []);

  const handleAction = useCallback(
    (id: ActionId) => {
      if (running) return;
      // "Sign in" is the one flow you watch, not skip — replay the auth screen.
      if (id === 'create') {
        returnToSignIn();
        return;
      }
      // Fast-forward: silently satisfy whatever this flow needs (sign in, funds,
      // a card) so it works from any starting point — no linear track. This is
      // STATE only — no API calls are logged for the provisioning (just like the
      // phone skips the sign-in animation), and it earns no checkmark. Each flow
      // logs only its own calls, and is checked, when the user actually runs it.
      let next = wallet;
      const provision: { issued?: boolean; fundCents?: number } = {};

      if (!next.created) {
        next = { ...next, created: true };
        setSignInMethod(method);
        setSkipIntro(true); // cold jump — land on the wallet without the hold
      }
      const needsFunds = id === 'send' || id === 'withdraw' || id === 'tap';
      if (needsFunds && next.balanceCents <= 0) {
        next = { ...next, balanceCents: FAST_FORWARD_FUND_CENTS };
        provision.fundCents = FAST_FORWARD_FUND_CENTS;
      }
      if (id === 'tap' && !next.hasCard) {
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
    [running, wallet, method, returnToSignIn, pushCalls],
  );

  const reset = useCallback(() => {
    for (const p of [passkeyPrompt, otpPrompt, emailPrompt, phonePrompt, googlePrompt, applePrompt]) {
      p.current?.reject(new Error('cancelled'));
      p.current = null;
    }
    if (faceIdPrompt.current) {
      clearTimeout(faceIdPrompt.current.timer);
      faceIdPrompt.current.resolve();
      faceIdPrompt.current = null;
    }
    session.current = {};
    transferGroup.current = null;
    transferFundingCurrency.current = null;
    settleTimers.current.forEach((t) => clearTimeout(t));
    settleTimers.current.clear();
    setWallet(initialWallet);
    setCompleted(initialCompleted);
    setEntries([]);
    setTransient(null);
    setSignInMethod(null);
    setPasskeyActive(false);
    setFaceIdActive(false);
    setOtpActive(false);
    setEmailActive(false);
    setPhoneActive(false);
    setGNonce(null);
    setANonce(null);
    setPopupWait(false);
    setWalletEntry(undefined);
    setSkipIntro(false);
    setRunning(false);
  }, []);

  const toggleMethod = useCallback((m: AuthMethod) => {
    // Always togglable — even signed in, so you can re-pick and sign in again.
    // At least one method stays selected.
    setMethods((prev) => {
      if (prev.includes(m)) {
        return prev.length === 1 ? prev : prev.filter((id) => id !== m);
      }
      return [...prev, m];
    });
  }, []);

  const base = phoneFromState(wallet);
  const phone = transient
    ? {
        ...base,
        screen: transient.screen,
        note: transient.note,
        cardActivated: transient.activated ?? base.cardActivated,
      }
    : base;

  return {
    persona,
    setPersona,
    useCase,
    setUseCase,
    methods,
    toggleMethod,
    method,
    wallet,
    completed,
    entries,
    running,
    handleAction,
    signInWithMethod,
    signInMethod,
    reset,
    phone,
    passkeyActive,
    confirmPasskey,
    cancelPasskey,
    faceIdActive,
    finishFaceId,
    otpActive,
    submitOtp,
    cancelOtp,
    backOtp,
    emailActive,
    submitEmail,
    cancelEmail,
    phoneActive,
    submitPhone,
    cancelPhone,
    gNonce,
    submitGoogle,
    aNonce,
    submitApple,
    popupWait,
    walletEntry,
    skipIntro,
    onQuoteCreate,
    onLinkExternalAccount,
    onTransferExecute,
    onCardIssued,
    onTapToPay,
    onReceivePayment,
  };
}
