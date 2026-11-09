'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { IconEyeOpen } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconEyeOpen';
import { IconEyeSlash } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconEyeSlash';
import { CONNECTORS } from '@/data/connectors';
import { accessHeaders, saveAccess } from '@/lib/access';
import { appFor } from '@/lib/forApp';
import styles from './AccessGate.module.scss';

/** The early-access gate (lib/access): the playground opens once this browser has the password. */
export function AccessGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<'checking' | 'locked' | 'open'>('checking');
  useEffect(() => {
    fetch('/api/unlock', { headers: accessHeaders() })
      .then((res) => setState(res.ok ? 'open' : 'locked'))
      .catch(() => setState('locked'));
  }, []);
  if (state === 'open') return children;
  if (state === 'checking') return null;
  return <Unlock onOpen={() => setState('open')} />;
}

/** Who the link was made for, from `?for=`, leads the page. */
function Unlock({ onOpen }: { onOpen: () => void }) {
  const [app] = useState(() => CONNECTORS.find((c) => c.id === appFor(window.location.search)));
  const [password, setPassword] = useState('');
  const [wrong, setWrong] = useState(false);
  const [shown, setShown] = useState(false);
  const [pending, setPending] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      const res = await fetch('/api/unlock', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        saveAccess(((await res.json()) as { token: string }).token);
        onOpen();
        return;
      }
      setWrong(true);
    } catch {
      setWrong(true);
    }
    setPending(false);
  };

  return (
    <main className={styles.page}>
      <form className={styles.card} onSubmit={submit}>
        <h1 className={styles.title}>
          <span className={styles.titleSecondary}>{app ? `Early access for ${app.label}` : 'Early access'}</span>
          <span>Agent Accounts Playground</span>
        </h1>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">
            Password
          </label>
          <div className={styles.inputWrap}>
            <input
              id="password"
              className={styles.input}
              type={shown ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              autoFocus
              required
              value={password}
              aria-invalid={wrong || undefined}
              onChange={(e) => {
                setPassword(e.target.value);
                setWrong(false);
              }}
            />
            <button type="button" className={styles.reveal} aria-label={shown ? 'Hide password' : 'Show password'} onClick={() => setShown((s) => !s)}>
              {shown ? <IconEyeSlash size={18} /> : <IconEyeOpen size={18} />}
            </button>
          </div>
          {wrong && <span className={styles.error}>That password isn’t right.</span>}
        </div>
        <button className={styles.button} type="submit" disabled={pending || !password}>
          Continue
        </button>
      </form>
    </main>
  );
}
