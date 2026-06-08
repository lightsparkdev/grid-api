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
import { googleNonce, passkeyCeremony } from '@/lib/auth';
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
  const [otpActive, setOtpActive] = useState(false);
  const [emailActive, setEmailActive] = useState(false);
  const [gNonce, setGNonce] = useState<string | null>(null);
  const [amountConfig, setAmountConfig] = useState<AmountConfig | null>(null);

  const session = useRef<Session>({});
  const otpPrompt = useRef<{ resolve: (c: string) => void; reject: (e: Error) => void } | null>(null);
  const emailPrompt = useRef<{ resolve: (e: string) => void; reject: (e: Error) => void } | null>(null);
  const googlePrompt = useRef<{ resolve: (t: string) => void; reject: (e: Error) => void } | null>(null);
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
    async (firstTime: boolean) => {
      const m = session.current.method ?? method;
      if (m === 'email_otp') {
        const email = firstTime ? await promptEmail() : session.current.email;
        if (firstTime) session.current.email = email;
        setTransient({ screen: 'creating', note: 'Sending you a code…' });
        await sleep(600);
        await promptOtp();
        pushCalls(signInCalls('email_otp', session.current.email), 'Sign in');
      } else if (m === 'passkey') {
        setTransient({ screen: 'credential' });
        await passkeyCeremony();
        pushCalls(signInCalls('passkey'), 'Sign in');
      } else if (m === 'oauth') {
        await promptGoogle(await googleNonce());
        pushCalls(signInCalls('oauth'), 'Sign in');
      } else if (m === 'apple') {
        setTransient({ screen: 'credential' });
        await sleep(900);
        pushCalls(signInCalls('apple'), 'Sign in');
      } else if (m === 'sms') {
        setTransient({ screen: 'creating', note: 'Sending you a code…' });
        await sleep(600);
        await promptOtp();
        pushCalls(signInCalls('email_otp', '+1 ••• ••• 1234'), 'Sign in');
      } else {
        throw new Error(`Sign-in method "${m}" is not available.`);
      }
      startSession();
    },
    [method, promptEmail, promptOtp, promptGoogle, pushCalls, startSession],
  );

  const runSignIn = useCallback(async () => {
    session.current = { method };
    setSignInMethod(method);
    await authenticate(true);
    setWallet((w) => ({ ...w, created: true, balanceCents: 0 }));
    setTransient(null);
  }, [method, authenticate]);

  const signInWithMethod = useCallback(
    async (m: AuthMethod) => {
      if (running) return;
      setRunning(true);
      try {
        session.current = { method: m };
        setSignInMethod(m);
        await authenticate(true);
        setWallet((w) => ({ ...w, created: true, balanceCents: 0 }));
        setTransient(null);
      } catch (e: unknown) {
        if ((e as Error)?.message !== 'cancelled') console.error('[grid-demo]', e);
        setTransient(null);
      } finally {
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
    for (const p of [otpPrompt, emailPrompt, googlePrompt, amountPrompt]) {
      p.current?.reject(new Error('cancelled'));
      p.current = null;
    }
    session.current = {};
    setWallet(initialWallet);
    setEntries([]);
    setTransient(null);
    setSignInMethod(null);
    setOtpActive(false);
    setEmailActive(false);
    setGNonce(null);
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
    otpActive,
    submitOtp,
    emailActive,
    submitEmail,
    gNonce,
    submitGoogle,
    amountConfig,
    submitAmount,
    cancelAmount,
  };
}
