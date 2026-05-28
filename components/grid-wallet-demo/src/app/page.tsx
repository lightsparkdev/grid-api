'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AuthMethod, Persona, ScreenId } from '@/data/flow';
import {
  ACTIONS,
  initialWallet,
  phoneFromState,
  runAction,
  type ActionId,
  type WalletState,
} from '@/data/actions';
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

export default function Page() {
  const { theme, setTheme } = useTheme();
  const [persona, setPersona] = useState<Persona>('fintech');
  const [method, setMethod] = useState<AuthMethod>('passkey');
  const [wallet, setWallet] = useState<WalletState>(initialWallet);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [transient, setTransient] = useState<Transient | null>(null);
  const [running, setRunning] = useState(false);
  const [isEmbed, setIsEmbed] = useState(false);

  const timers = useRef<number[]>([]);
  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  useEffect(() => {
    setIsEmbed(new URLSearchParams(window.location.search).get('embed') === 'true');
    return clearTimers;
  }, [clearTimers]);

  const handleAction = useCallback(
    (id: ActionId) => {
      if (running) return;
      const action = ACTIONS.find((a) => a.id === id);
      if (!action || !action.available(wallet)) return;

      const res = runAction(id, wallet, method);
      setRunning(true);

      setEntries((prev) => [
        ...prev.map((e) => ({ ...e, fresh: false })),
        ...res.calls.map((c, i) => ({ ...c, key: `${id}-${Date.now()}-${i}`, fresh: true })),
      ]);

      let t = 0;
      res.frames.forEach((f) => {
        timers.current.push(
          window.setTimeout(
            () => setTransient({ screen: f.screen, note: f.note, activated: f.activated }),
            t,
          ),
        );
        t += f.ms;
      });
      timers.current.push(
        window.setTimeout(() => {
          setWallet(res.next);
          setTransient(null);
          setRunning(false);
        }, t),
      );
    },
    [running, wallet, method],
  );

  const reset = useCallback(() => {
    clearTimers();
    setWallet(initialWallet);
    setEntries([]);
    setTransient(null);
    setRunning(false);
  }, [clearTimers]);

  // Changing the use case mid-session keeps state but rebrands; changing the
  // sign-in method is only allowed before the account exists.
  const onSetMethod = (m: AuthMethod) => {
    if (!wallet.created) setMethod(m);
  };

  const base = phoneFromState(wallet);
  const phone = transient
    ? {
        ...base,
        screen: transient.screen,
        note: transient.note,
        cardActivated: transient.activated ?? base.cardActivated,
      }
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
          />
        </div>
        <div className={styles.apiDock}>
          <ApiSteps entries={entries} />
        </div>
      </section>
    </main>
  );
}
