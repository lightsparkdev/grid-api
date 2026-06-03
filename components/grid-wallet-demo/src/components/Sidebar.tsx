'use client';

import { useState } from 'react';
import clsx from 'clsx';
import type { AuthMethod, Persona } from '@/data/flow';
import { ACTIONS, type ActionId, type WalletState } from '@/data/actions';
import { IconChevronBottom } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronBottom';
import { IconWallet1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconWallet1';
import { IconSparklesTwo } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconSparklesTwo';
import { IconBank } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconBank';
import { IconFingerPrint1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconFingerPrint1';
import { IconGoogle } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconGoogle';
import { IconApple } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconApple';
import { IconMailbox } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconMailbox';
import { IconPhone } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPhone';
import { IconPlusMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPlusMedium';
import { IconSend } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconSend';
import { IconCreditCard1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCreditCard1';
import { IconCreditCardAdd } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCreditCardAdd';
import { IconCheckmark1Small } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckmark1Small';
import { IconRotate360Left } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconRotate360Left';
import styles from './Sidebar.module.scss';

type IconCmp = typeof IconWallet1;

const PERSONAS: { id: Persona; label: string; desc: string; Icon: IconCmp; soon?: boolean }[] = [
  { id: 'fintech', label: 'Fintech / Neobank', desc: 'Dollar accounts & cards', Icon: IconWallet1 },
  { id: 'social', label: 'Social platform', desc: 'Creator payouts', Icon: IconSparklesTwo, soon: true },
  { id: 'marketplace', label: 'Marketplace', desc: 'Buyer & seller balances', Icon: IconBank, soon: true },
];

const METHODS: { id: AuthMethod; label: string; Icon: IconCmp; soon?: boolean }[] = [
  { id: 'passkey', label: 'Passkey', Icon: IconFingerPrint1 },
  { id: 'oauth', label: 'Google', Icon: IconGoogle },
  { id: 'apple', label: 'Apple', Icon: IconApple },
  { id: 'email_otp', label: 'Email', Icon: IconMailbox },
  { id: 'sms', label: 'Phone', Icon: IconPhone, soon: true },
];

const ACTION_ICON: Record<ActionId, IconCmp> = {
  create: IconWallet1,
  add: IconPlusMedium,
  send: IconSend,
  withdraw: IconBank,
  card: IconCreditCardAdd,
  tap: IconCreditCard1,
};

export default function Sidebar({
  persona,
  setPersona,
  method,
  setMethod,
  wallet,
  onAction,
  running,
  onReset,
}: {
  persona: Persona;
  setPersona: (p: Persona) => void;
  method: AuthMethod;
  setMethod: (m: AuthMethod) => void;
  wallet: WalletState;
  onAction: (id: ActionId) => void;
  running: boolean;
  onReset: () => void;
}) {
  const [actionsOpen, setActionsOpen] = useState(false);
  return (
    <>
      <section className={styles.section}>
        <div className={styles.sectionLabel}>Use case</div>
        <div className={styles.cards}>
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              className={clsx(styles.miniCard, persona === p.id && styles.miniCardActive, p.soon && styles.miniCardSoon)}
              onClick={() => !p.soon && setPersona(p.id)}
              disabled={p.soon}
            >
              <span className={styles.miniIconBox}>
                <p.Icon size={18} />
              </span>
              <span className={styles.miniText}>
                <span className={styles.miniTitle}>
                  {p.label}
                  {p.soon && <span className={styles.soonBadge}>Soon</span>}
                </span>
                <span className={styles.miniDesc}>{p.desc}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionLabel}>Sign-in method</div>
        <div className={styles.chips}>
          {METHODS.map((m) => (
            <button
              key={m.id}
              className={clsx(styles.chip, method === m.id && styles.chipActive)}
              onClick={() => !m.soon && setMethod(m.id)}
              disabled={running || wallet.created || m.soon}
              title={
                m.soon
                  ? 'Coming soon'
                  : wallet.created
                    ? 'Reset to change sign-in method'
                    : undefined
              }
            >
              <m.Icon size={15} />
              {m.label}
              {m.soon && <span className={styles.soonBadge}>Soon</span>}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <button
          className={styles.disclosure}
          onClick={() => setActionsOpen((o) => !o)}
          aria-expanded={actionsOpen}
        >
          <span className={styles.disclosureText}>Explore actions</span>
          <span className={clsx(styles.disclosureChev, actionsOpen && styles.disclosureChevOpen)}>
            <IconChevronBottom size={14} />
          </span>
          <span className={styles.disclosureLine} />
        </button>
        <div className={clsx(styles.cards, styles.actionList, actionsOpen && styles.actionListOpen)}>
          {ACTIONS.map((a) => {
            const Icon = ACTION_ICON[a.id];
            const enabled = a.available(wallet) && !running;
            const done = a.done?.(wallet) ?? false;
            return (
              <button
                key={a.id}
                className={clsx(styles.actionRow, enabled && styles.actionEnabled, done && styles.actionDone)}
                onClick={() => enabled && onAction(a.id)}
                disabled={!enabled}
              >
                <span className={styles.actionRowIcon}>
                  <Icon size={16} />
                </span>
                <span className={styles.actionRowLabel}>{a.label}</span>
                {done && (
                  <span className={styles.actionRowCheck}>
                    <IconCheckmark1Small size={13} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {wallet.created && (
        <button className={styles.resetBtn} onClick={onReset} disabled={running}>
          <IconRotate360Left size={14} />
          Start over
        </button>
      )}
    </>
  );
}
