'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AuthMethod, Persona, ScreenId, ApiCall } from '@/data/flow';
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
import { useTheme } from '@/hooks/useTheme';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LightsparkWordmark } from '@/components/LightsparkWordmark';
import Sidebar from '@/components/Sidebar';
import Phone from '@/components/Phone';
import ApiSteps, { type Entry } from '@/components/ApiSteps';
import styles from './page.module.scss';

interface Transient {
  screen: ScreenId;
  note?: string;
  activated?: boolean;
}

interface Session {
  method?: AuthMethod;
  email?: string;
  /** Epoch ms when the auth session expires; undefined = no active session. */
  expiresAt?: number;
}

const SESSION_MS = 15 * 60 * 1000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Page() {
  const { theme, setTheme } = useTheme();
  const [persona, setPersona] = useState<Persona>('fintech');
  const [method, setMethod] = useState<AuthMethod>('passkey');
  const [wallet, setWallet] = useState<WalletState>(initialWallet);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [transient, setTransient] = useState<Transient | null>(null);
  const [running, setRunning] = useState(false);
  const [isEmbed, setIsEmbed] = useState(false);

  const [otpActive, setOtpActive] = useState(false);
  const [emailActive, setEmailActive] = useState(false);
  const [gNonce, setGNonce] = useState<string | null>(null);
  type AmountConfig = { title: string; cta: string; source: string; sub: string; defaultDollars: number };
  const [amountConfig, setAmountConfig] = useState<AmountConfig | null>(null);

  const session = useRef<Session>({});
  const otpPrompt = useRef<{ resolve: (c: string) => void; reject: (e: Error) => void } | null>(null);
  const emailPrompt = useRef<{ resolve: (e: string) => void; reject: (e: Error) => void } | null>(null);
  const googlePrompt = useRef<{ resolve: (t: string) => void; reject: (e: Error) => void } | null>(null);
  const amountPrompt = useRef<{ resolve: (d: number) => void; reject: (e: Error) => void } | null>(null);

  useEffect(() => {
    setIsEmbed(new URLSearchParams(window.location.search).get('embed') === 'true');
  }, []);

  /* ---- interactive pauses (resolve when the user acts on the phone) ---- */
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

  const pushCalls = useCallback((calls: ApiCall[]) => {
    if (!calls?.length) return;
    setEntries((prev) => [
      ...prev.map((e) => ({ ...e, fresh: false })),
      ...calls.map((c, i) => ({ ...c, key: `${Date.now()}-${i}-${Math.random()}`, fresh: true })),
    ]);
  }, []);

  const startSession = useCallback(() => {
    session.current.expiresAt = Date.now() + SESSION_MS;
  }, []);
  const hasValidSession = () =>
    !!session.current.expiresAt && Date.now() < session.current.expiresAt - 5000;

  /** Run the real ceremony for the active method (Touch ID / Google popup / OTP). */
  const authenticate = useCallback(
    async (firstTime: boolean) => {
      const m = session.current.method ?? method;
      if (m === 'email_otp') {
        const email = firstTime ? await promptEmail() : session.current.email;
        if (firstTime) session.current.email = email;
        setTransient({ screen: 'creating', note: 'Sending you a code…' });
        await sleep(600);
        await promptOtp();
        pushCalls(signInCalls('email_otp', session.current.email));
      } else if (m === 'passkey') {
        setTransient({ screen: 'credential' });
        await passkeyCeremony();
        pushCalls(signInCalls('passkey'));
      } else if (m === 'oauth') {
        await promptGoogle(await googleNonce());
        pushCalls(signInCalls('oauth'));
      } else {
        throw new Error(`Sign-in method "${m}" is not available.`);
      }
      startSession();
    },
    [method, promptEmail, promptOtp, promptGoogle, pushCalls, startSession],
  );

  /** Sign in (returning user) — authenticate, then unlock the wallet. */
  const runSignIn = useCallback(async () => {
    session.current = { method };
    await authenticate(true);
    setWallet((w) => ({ ...w, created: true, balanceCents: 0 }));
    setTransient(null);
  }, [method, authenticate]);

  /** Ensure a valid session before a signed action (re-auth with the method). */
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
    pushCalls(addMoneyCalls(cents));
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
    pushCalls(sendCalls(Math.round(dollars * 1e6)));
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
    pushCalls(withdrawCalls(Math.round(dollars * 1e6)));
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

  /** Card / tap — on-phone animation only (no Grid endpoints exist for these). */
  const runSimulated = useCallback(
    async (id: ActionId) => {
      const res = runAction(id, wallet, method);
      for (const f of res.frames) {
        setTransient({ screen: f.screen, note: f.note, activated: f.activated });
        await sleep(f.ms);
      }
      setWallet(res.next);
      setTransient(null);
    },
    [wallet, method],
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
      } catch (e: any) {
        if (e?.message !== 'cancelled') console.error('[grid-demo]', e);
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
    setOtpActive(false);
    setEmailActive(false);
    setGNonce(null);
    setAmountConfig(null);
    setRunning(false);
  }, []);

  const onSetMethod = (m: AuthMethod) => {
    if (!wallet.created) setMethod(m);
  };

  const base = phoneFromState(wallet);
  const phone = transient
    ? { ...base, screen: transient.screen, note: transient.note, cardActivated: transient.activated ?? base.cardActivated }
    : base;

  return (
    <main className={styles.layout}>
      <div className={styles.sidebar}>
        {!isEmbed && (
          <div className={styles.sidebarHeader}>
            <LightsparkWordmark />
            <a href="https://www.lightspark.com/contact" className={styles.headerLink}>
              Book a live demo
            </a>
          </div>
        )}

        <div className={styles.sidebarContent}>
          <div className={styles.sidebarContentInner}>
            <Header />
            <Sidebar
              persona={persona}
              setPersona={setPersona}
              method={method}
              setMethod={onSetMethod}
              wallet={wallet}
              onAction={handleAction}
              running={running}
              onReset={reset}
            />
          </div>
        </div>

        <div className={styles.sidebarFooter}>
          <Footer theme={theme} setTheme={setTheme} />
        </div>
      </div>

      <section className={styles.rightPanel}>
        <div className={styles.canvas}>
          <Phone
            phone={phone}
            wallet={wallet}
            persona={persona}
            method={method}
            onAction={handleAction}
            busy={running}
            otp={{ active: otpActive, onSubmit: submitOtp }}
            email={{ active: emailActive, onSubmit: submitEmail }}
            google={{ nonce: gNonce, onCredential: submitGoogle }}
            amount={{ config: amountConfig, onSubmit: submitAmount, onCancel: cancelAmount }}
          />
        </div>
        <div className={styles.apiDock}>
          <ApiSteps entries={entries} />
        </div>
      </section>
    </main>
  );
}
