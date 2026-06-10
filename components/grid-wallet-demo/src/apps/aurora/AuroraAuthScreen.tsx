'use client';

import { AUTH_METHODS } from '@/data/configure';
import { authCta, type AuthMethod } from '@/data/flow';
import { AuroraBackground } from '@/apps/shared/AuroraBackground';
import { ContentAreaButton } from '@/apps/shared/ContentAreaButton';
import { AUTH_METHOD_ICONS, AUTH_METHOD_ORDER } from '@/apps/shared/authMethodIcons';
import styles from './AuroraAuthScreen.module.scss';

/** Three lines at 322px — keeps the superpowers hook, drops filler. */
export const AURORA_AUTH_DESCRIPTION =
  'Like a bank account with global superpowers. Fund in 65+ countries. Debit card, rewards, and BTC.';

interface AuroraAuthScreenProps {
  busy?: boolean;
  onSignIn: (method: AuthMethod) => void;
}

export function AuroraAuthScreen({ busy, onSignIn }: AuroraAuthScreenProps) {
  const enabled = new Set(
    AUTH_METHODS.filter((m) => m.enabled).map((m) => m.id),
  );
  const methods = AUTH_METHOD_ORDER.filter((id) => enabled.has(id));

  return (
    <div className={styles.root}>
      <div className={styles.hero}>
        <AuroraBackground fadeBottom showRadialGradient={false} className={styles.heroBg} />
        <img
          className={styles.wallet}
          src="/assets/financial-app/aurora-wallet.svg"
          alt=""
          aria-hidden
          draggable={false}
        />
      </div>

      <div className={styles.copy}>
        <div className={styles.headings}>
          <h1 className={styles.title}>Aurora</h1>
          <p className={styles.tagline}>Your money, everywhere</p>
        </div>
        <p className={styles.description}>{AURORA_AUTH_DESCRIPTION}</p>
      </div>

      <div className={styles.actions}>
        {methods.map((method) => {
          const Icon = AUTH_METHOD_ICONS[method];
          return (
            <ContentAreaButton
              key={method}
              icon={<Icon size={24} />}
              disabled={busy}
              onClick={() => onSignIn(method)}
            >
              {authCta(method)}
            </ContentAreaButton>
          );
        })}
      </div>
    </div>
  );
}
