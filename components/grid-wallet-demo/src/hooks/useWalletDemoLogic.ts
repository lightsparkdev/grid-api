'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import type { AuthMethod, Persona, ScreenId, ApiCall } from '@/data/flow';
import { primaryAuthMethod, type UseCaseId } from '@/data/configure';
import {
  ACTIONS,
  fmt,
  initialWallet,
  phoneFromState,
  runAction,
  type ActionId,
  type WalletState,
} from '@/data/actions';
import { addMoneyCalls, sendCalls, signInCalls, withdrawCalls } from '@/data/apiCalls';
import { oauthNonce, passkeyCeremony } from '@/lib/auth';
import type { Entry } from '@/components/ApiPanel/types';
import { SEED_API_PANEL, seedApiEntries } from '@/data/apiPanelSeed';

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

type AmountConfig = {
  title: string;
  cta: string;
  source: string;
  sub: string;
  defaultDollars: number;
};

const SESSION_MS = 15 * 60 * 1000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Demo interaction logic — preserved for phase 2 UI wiring.
 * Returns the full surface area Sidebar / Phone / ApiSteps expect.
 */
export function useWalletDemoLogic() {
  const [persona, setPersona] = useState<Persona>('fintech');
  const [useCase, setUseCase] = useState<UseCaseId>('fintech');
  const [methods, setMethods] = useState<AuthMethod[]>(['oauth']);
  const method = useMemo(() => primaryAuthMethod(methods), [methods]);
  const [wallet, setWallet] = useState<WalletState>(initialWallet);
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
  const [amountConfig, setAmountConfig] = useState<AmountConfig | null>(null);

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
  const amountPrompt = useRef<{ resolve: (d: number) => void; reject: (e: Error) => void } | null>(null);

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

  const promptAmount = useCallback((config: AmountConfig): Promise<number> => {
    setAmountConfig(config);
    return new Promise((resolve, reject) => (amountPrompt.current = { resolve, reject }));
  }, []);
  const submitAmount = useCallback((dollars: number) => {
    setAmountConfig(null);
    const p = amountPrompt.current;
    amountPrompt.current = null;
    p?.resolve(dollars);
  }, []);
  const cancelAmount = useCallback(() => {
    setAmountConfig(null);
    const p = amountPrompt.current;
    amountPrompt.current = null;
    p?.reject(new Error('cancelled'));
  }, []);

  const pushCalls = useCallback((calls: ApiCall[], groupLabel: string) => {
    if (!calls?.length) return;
    const groupId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const baseTime = Date.now();
    setEntries((prev) => [
      ...prev,
      ...calls.map((c, i) => ({
        ...c,
        key: `${baseTime}-${i}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: baseTime + i,
        groupId,
        groupLabel,
      })),
    ]);
  }, []);

  const startSession = useCallback(() => {
    session.current.expiresAt = Date.now() + SESSION_MS;
  }, []);
  const hasValidSession = () =>
    !!session.current.expiresAt && Date.now() < session.current.expiresAt - 5000;

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
        let needEntry = firstTime;
        for (;;) {
          if (needEntry || !session.current[field]) {
            session.current[field] = await promptEntry();
          }
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
        // Let the sheet's dismiss VISIBLY finish before the flow moves on:
        // the transient clears FIRST (so the auth screen is back underneath
        // the departing sheet — leaving it set would re-arm the sheet's
        // sending state and hold it open), then a beat slightly longer than
        // the BottomSheet exit (0.35s) before the wallet flip starts the
        // post-sign-in intro.
        setTransient(null);
        await sleep(400);
        pushCalls(signInCalls('email_otp', session.current[field]), 'Sign in');
      } else if (m === 'passkey') {
        await promptPasskey();
        try {
          await passkeyCeremony();
        } finally {
          // Dismiss the sheet once the passcode / passkey ceremony is done
          // (whether it succeeded or was cancelled).
          setPasskeyActive(false);
        }
        await playFaceId();
        pushCalls(signInCalls('passkey'), 'Sign in');
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
        pushCalls(signInCalls(m), 'Sign in');
      } else {
        throw new Error(`Sign-in method "${m}" is not available.`);
      }
      startSession();
    },
    [method, promptEmail, promptPhone, promptOtp, promptGoogle, promptApple, promptPasskey, playFaceId, pushCalls, startSession],
  );

  const runSignIn = useCallback(async () => {
    session.current = { method };
    setSignInMethod(method);
    await authenticate(true);
    setWallet((w) => ({ ...w, created: true, balanceCents: 0 }));
    setTransient(null);
  }, [method, authenticate]);

  const signInWithMethod = useCallback(
    async (m: AuthMethod, popup?: Promise<string>) => {
      if (running) {
        // A flow is already live (e.g. its popup is open) — swallow the
        // stray popup promise so the rejection doesn't go unhandled.
        popup?.catch(() => {});
        return;
      }
      setRunning(true);
      // The popup wait must not read as busy on the auth screen — the phone
      // stays exactly as it is while the real provider popup is up.
      if (popup) setPopupWait(true);
      try {
        session.current = { method: m };
        setSignInMethod(m);
        await authenticate(true, popup);
        setWallet((w) => ({ ...w, created: true, balanceCents: 0 }));
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

  const ensureSession = useCallback(async () => {
    if (hasValidSession()) return;
    await authenticate(false);
  }, [authenticate]);

  const runAdd = useCallback(async () => {
    const dollars = await promptAmount({
      title: 'Add money',
      cta: 'Confirm',
      source: 'Linked bank',
      sub: '•••• 3872 · Instant',
      defaultDollars: 5000,
    });
    const cents = Math.round(dollars * 100);
    setTransient({ screen: 'creating', note: `Adding ${fmt(cents)}` });
    pushCalls(addMoneyCalls(cents), 'Add money');
    await sleep(1100);
    setWallet((w) => ({
      ...w,
      balanceCents: w.balanceCents + cents,
      activity: [
        { kind: 'bank', name: 'Linked bank', sub: 'Added · Just now', amount: `+${fmt(cents)}`, positive: true },
        ...w.activity,
      ],
    }));
    setTransient(null);
  }, [promptAmount, pushCalls]);

  const runSend = useCallback(async () => {
    const dollars = await promptAmount({
      title: 'Send',
      cta: 'Send',
      source: '$leo@grid.app',
      sub: 'UMA address · Instant',
      defaultDollars: 250,
    });
    await ensureSession();
    const cents = Math.round(dollars * 100);
    setTransient({ screen: 'creating', note: `Sending ${fmt(cents)}` });
    pushCalls(sendCalls(Math.round(dollars * 1e6)), 'Send payment');
    await sleep(1100);
    setWallet((w) => ({
      ...w,
      balanceCents: Math.max(0, w.balanceCents - cents),
      activity: [
        { kind: 'send', name: 'Sent to $leo@grid.app', sub: 'Payment · Just now', amount: `-${fmt(cents)}` },
        ...w.activity,
      ],
    }));
    setTransient(null);
  }, [promptAmount, ensureSession, pushCalls]);

  const runWithdraw = useCallback(async () => {
    const dollars = await promptAmount({
      title: 'Withdraw',
      cta: 'Confirm',
      source: 'Linked bank',
      sub: '•••• 3872 · Instant',
      defaultDollars: 200,
    });
    await ensureSession();
    const cents = Math.round(dollars * 100);
    setTransient({ screen: 'creating', note: `Withdrawing ${fmt(cents)}` });
    pushCalls(withdrawCalls(Math.round(dollars * 1e6)), 'Withdraw');
    await sleep(1100);
    setWallet((w) => ({
      ...w,
      balanceCents: Math.max(0, w.balanceCents - cents),
      activity: [
        { kind: 'bank', name: 'Linked bank', sub: 'Withdrawal · Just now', amount: `-${fmt(cents)}` },
        ...w.activity,
      ],
    }));
    setTransient(null);
  }, [promptAmount, ensureSession, pushCalls]);

  const runSimulated = useCallback(
    async (id: ActionId) => {
      const action = ACTIONS.find((a) => a.id === id);
      const res = runAction(id, wallet, method);
      for (const f of res.frames) {
        setTransient({ screen: f.screen, note: f.note, activated: f.activated });
        await sleep(f.ms);
      }
      if (res.calls.length) {
        pushCalls(res.calls, action?.label ?? id);
      }
      setWallet(res.next);
      setTransient(null);
    },
    [wallet, method, pushCalls],
  );

  const handleAction = useCallback(
    async (id: ActionId) => {
      if (running) return;
      const action = ACTIONS.find((a) => a.id === id);
      if (!action || !action.available(wallet)) return;
      setRunning(true);
      try {
        if (id === 'create') await runSignIn();
        else if (id === 'add') await runAdd();
        else if (id === 'send') await runSend();
        else if (id === 'withdraw') await runWithdraw();
        else await runSimulated(id);
      } catch (e: unknown) {
        if ((e as Error)?.message !== 'cancelled') console.error('[grid-demo]', e);
        setTransient(null);
      } finally {
        setRunning(false);
      }
    },
    [running, wallet, runSignIn, runAdd, runSend, runWithdraw, runSimulated],
  );

  const reset = useCallback(() => {
    for (const p of [passkeyPrompt, otpPrompt, emailPrompt, phonePrompt, googlePrompt, applePrompt, amountPrompt]) {
      p.current?.reject(new Error('cancelled'));
      p.current = null;
    }
    if (faceIdPrompt.current) {
      clearTimeout(faceIdPrompt.current.timer);
      faceIdPrompt.current.resolve();
      faceIdPrompt.current = null;
    }
    session.current = {};
    setWallet(initialWallet);
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
    setAmountConfig(null);
    setRunning(false);
  }, []);

  const toggleMethod = useCallback(
    (m: AuthMethod) => {
      if (wallet.created) return;
      setMethods((prev) => {
        if (prev.includes(m)) {
          return prev.length === 1 ? prev : prev.filter((id) => id !== m);
        }
        return [...prev, m];
      });
    },
    [wallet.created],
  );

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
    amountConfig,
    submitAmount,
    cancelAmount,
  };
}
