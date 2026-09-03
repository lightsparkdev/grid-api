'use client';

import clsx from 'clsx';
import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { IconEyeOpen } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconEyeOpen';
import { IconWallet1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconWallet1';
import { IconGauge } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconGauge';
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossMedium';
import { IconArrowUndoUp } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowUndoUp';
import { IconClipboard } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconClipboard';
import { IconCheckmark1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckmark1';
import { BottomSheet } from '@/apps/shared/BottomSheet';
import { ContentAreaButton } from '@/apps/shared/ContentAreaButton';
import { GlassSymbolButton, headerGlassBrightness, SHEET_GLASS } from '@/apps/shared/glass';
import { SfSymbol } from '@/apps/shared/icons';
import { programNameOf, useBrand } from '@/apps/shared/brand/BrandContext';
import {
  CARD_CVV,
  CARD_EXP,
  formatUsdCents,
  PAN_GROUPS,
  type CardControls,
  type SpendLimits,
} from '@/apps/shared/card';
import NumericText from '@/components/NumericText';
import { useThemeMode } from '@/hooks/useThemeMode';
import { easeOutQuick, easeOutSnappy, motionTransition } from '@/lib/easing';
import styles from './CardSheets.module.scss';

/* ── Shared shell (the SendReceiveSheet dress: icon tile + glass X, title, sub) ── */

interface ShellProps {
  open: boolean;
  onDismiss: () => void;
  icon: ReactNode;
  title: string;
  sub?: ReactNode;
  children: ReactNode;
  tone?: 'default' | 'danger';
}

function SheetShell({ open, onDismiss, icon, title, sub, children, tone = 'default' }: ShellProps) {
  const theme = useThemeMode();
  return (
    <BottomSheet
      open={open}
      onDismiss={onDismiss}
      inset={16}
      topRadius={40}
      glass={{ ...SHEET_GLASS, tint: 'var(--float-sheet-tint)' }}
    >
      <div className={styles.header}>
        <span className={clsx(styles.tile, tone === 'danger' && styles.tileDanger)} aria-hidden>
          {icon}
        </span>
      </div>
      <span className={styles.close}>
        <GlassSymbolButton
          aria-label="Close"
          size={40}
          type="button"
          glass={{ brightness: headerGlassBrightness(theme) }}
          onClick={onDismiss}
        >
          <SfSymbol name="xmark" size={14} />
        </GlassSymbolButton>
      </span>
      <h2 className={styles.heading}>{title}</h2>
      {sub ? <p className={styles.sub}>{sub}</p> : null}
      {children}
    </BottomSheet>
  );
}

/* ── Details (PAN reveal) ─────────────────────────────────────────────────── */

const EXP = CARD_EXP;
const CVV = CARD_CVV;

function CopyField({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(t);
  }, [copied]);
  return (
    <button
      type="button"
      className={clsx(styles.field, wide && styles.fieldWide)}
      onClick={() => {
        navigator.clipboard?.writeText(value.replace(/\s/g, '')).catch(() => {});
        setCopied(true);
      }}
    >
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.fieldValue}>{value}</span>
      <span className={styles.fieldCopy} aria-hidden>
        {copied ? <IconCheckmark1 size={14} /> : <IconClipboard size={14} />}
      </span>
    </button>
  );
}

/** Digits roll in one group at a time (SwiftUI numericText), like the PAN
 *  arriving from the processor's iframe. */
function RollingPan({ armed }: { armed: boolean }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!armed) {
      setShown(0);
      return;
    }
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= PAN_GROUPS.length) window.clearInterval(id);
    }, 140);
    return () => window.clearInterval(id);
  }, [armed]);
  return (
    <span className={styles.pan} aria-label={PAN_GROUPS.join(' ')}>
      {PAN_GROUPS.map((g, i) => (
        <span key={g} className={styles.panGroup}>
          <NumericText value={i < shown ? Number(g) : 0} format={{ minimumIntegerDigits: 4, useGrouping: false }} />
        </span>
      ))}
    </span>
  );
}

export function CardDetailsSheet({ card }: { card: CardControls }) {
  const open = card.sheet === 'details';
  const name = programNameOf(useBrand());
  return (
    <SheetShell
      open={open}
      onDismiss={card.closeSheet}
      icon={<IconEyeOpen size={28} />}
      title="Card details"
      sub={`Rendered by the card processor. ${name} never sees or stores these.`}
    >
      <div className={styles.detailsBody}>
        <div className={styles.panRow}>
          <span className={styles.fieldLabel}>Card number</span>
          <RollingPan armed={open && card.revealed} />
        </div>
        <div className={styles.fieldGrid}>
          <CopyField label="Number" value={PAN_GROUPS.join(' ')} wide />
          <CopyField label="Expires" value={EXP} />
          <CopyField label="CVV" value={CVV} />
        </div>
        <p className={styles.fine}>Details hide automatically after 60 seconds.</p>
      </div>
    </SheetShell>
  );
}

/* ── Apple Wallet add ─────────────────────────────────────────────────────── */

const WALLET_FADE = motionTransition(easeOutQuick, 0.3);

export function WalletAddSheet({ card }: { card: CardControls }) {
  const open = card.sheet === 'wallet';
  const reduceMotion = useReducedMotion();
  const name = programNameOf(useBrand());
  const phase = card.walletPhase;
  return (
    <SheetShell
      open={open}
      onDismiss={card.closeSheet}
      icon={<IconWallet1 size={28} />}
      title={phase === 'done' ? 'Card added' : 'Add to Apple Wallet'}
      sub={
        phase === 'done'
          ? `Your ${name} card is ready to use with Apple Pay.`
          : `Pay in stores, in apps, and online with your ${name} card.`
      }
    >
      <div className={styles.walletBody}>
        {/* The Wallet pass slides into the stack as it's added. The card itself
            is on the stage — this is its pass, not a second card. */}
        <div className={styles.passStack} aria-hidden>
          <span className={clsx(styles.pass, styles.passBack)} />
          <span className={clsx(styles.pass, styles.passMid)} />
          <motion.div
            className={clsx(styles.pass, styles.passFront)}
            initial={false}
            animate={
              phase === 'done'
                ? { y: 0, scale: 1, rotateX: 0 }
                : phase === 'adding'
                  ? { y: -6, scale: 0.98, rotateX: 4 }
                  : { y: -28, scale: 1.02, rotateX: 8 }
            }
            transition={reduceMotion ? { duration: 0 } : motionTransition(easeOutSnappy, 0.6)}
          >
            <span className={styles.passName}>{name}</span>
            <span className={styles.passPay}>
              <span className={styles.appleMark}></span> Pay
            </span>
          </motion.div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {phase === 'adding' ? (
            <motion.p
              key="adding"
              className={styles.walletStatus}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: WALLET_FADE }}
              exit={{ opacity: 0, transition: WALLET_FADE }}
            >
              <span className={styles.spinner} aria-hidden />
              Adding card…
            </motion.p>
          ) : phase === 'done' ? (
            <motion.p
              key="done"
              className={clsx(styles.walletStatus, styles.walletDone)}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0, transition: WALLET_FADE }}
              exit={{ opacity: 0, transition: WALLET_FADE }}
            >
              <IconCheckmark1 size={16} />
              Added to Apple Wallet
            </motion.p>
          ) : (
            <motion.div
              key="cta"
              className={styles.walletActions}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: WALLET_FADE }}
              exit={{ opacity: 0, transition: WALLET_FADE }}
            >
              <button type="button" className={styles.appleBtn} onClick={card.confirmAddToWallet}>
                <span className={styles.appleMark} aria-hidden>
                  
                </span>
                Add to Apple Wallet
              </button>
              <p className={styles.fine}>
                Apple Wallet asks for a one-time code. {name} sends it with your name and logo.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SheetShell>
  );
}

/* ── Spending limits ──────────────────────────────────────────────────────── */

const PER_TXN_STEPS = [null, 2_500, 5_000, 10_000, 25_000, 50_000] as const;
const PER_DAY_STEPS = [null, 5_000, 10_000, 25_000, 50_000, 100_000] as const;

function LimitPicker({
  label,
  hint,
  steps,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  steps: readonly (number | null)[];
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <div className={styles.limitBlock}>
      <div className={styles.limitHead}>
        <span className={styles.limitLabel}>{label}</span>
        <span className={styles.limitValue}>
          {value === null ? 'No cap' : <NumericText value={value / 100} format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }} />}
        </span>
      </div>
      <div className={styles.steps} role="radiogroup" aria-label={label}>
        {steps.map((s) => (
          <button
            key={String(s)}
            type="button"
            role="radio"
            aria-checked={value === s}
            className={clsx(styles.step, value === s && styles.stepOn)}
            onClick={() => onChange(s)}
          >
            {s === null ? 'Off' : `$${s / 100}`}
          </button>
        ))}
      </div>
      <p className={styles.fine}>{hint}</p>
    </div>
  );
}

export function LimitsSheet({ card }: { card: CardControls }) {
  const open = card.sheet === 'limits';
  const [draft, setDraft] = useState<SpendLimits>(card.limits);
  // Re-seed the draft each time the sheet opens.
  useEffect(() => {
    if (open) setDraft(card.limits);
  }, [open, card.limits]);
  const dirty =
    draft.perTransactionCents !== card.limits.perTransactionCents ||
    draft.perDayCents !== card.limits.perDayCents;
  const used = card.dailyUsedCents;
  return (
    <SheetShell
      open={open}
      onDismiss={card.closeSheet}
      icon={<IconGauge size={28} />}
      title="Spending limits"
      sub="Purchases over a cap are declined at the terminal."
    >
      <div className={styles.limitsBody}>
        <LimitPicker
          label="Per purchase"
          hint="maxSpendPerTransaction — a single authorization can't exceed this."
          steps={PER_TXN_STEPS}
          value={draft.perTransactionCents}
          onChange={(v) => setDraft((d) => ({ ...d, perTransactionCents: v }))}
        />
        <LimitPicker
          label="Per day"
          hint={`maxSpendPerDay — resets at 00:00 UTC. Spent today: ${formatUsdCents(used)}. Refunds don't restore capacity.`}
          steps={PER_DAY_STEPS}
          value={draft.perDayCents}
          onChange={(v) => setDraft((d) => ({ ...d, perDayCents: v }))}
        />
        <div className={styles.actions}>
          <ContentAreaButton
            type="button"
            variant="filled"
            disabled={!dirty}
            onClick={() => {
              card.saveLimits(draft);
              card.closeSheet();
            }}
          >
            Save limits
          </ContentAreaButton>
        </div>
      </div>
    </SheetShell>
  );
}

/* ── Transaction detail + refund ──────────────────────────────────────────── */

const STATUS_LABEL = { AUTHORIZED: 'Pending', SETTLED: 'Settled', REFUNDED: 'Refunded' } as const;

export function TransactionSheet({ card }: { card: CardControls }) {
  const open = card.sheet === 'transaction';
  const row = card.selectedRow;
  const [refunding, setRefunding] = useState(false);
  useEffect(() => {
    if (!open) setRefunding(false);
  }, [open]);
  useEffect(() => {
    if (row?.status === 'REFUNDED') setRefunding(false);
  }, [row?.status]);
  return (
    <SheetShell
      open={open}
      onDismiss={card.closeSheet}
      icon={<IconArrowUndoUp size={28} />}
      title={row?.title ?? 'Transaction'}
      sub={row ? `${row.detail === 'Pending' || row.detail === 'Refunded' ? 'Tap to Pay' : row.detail} · Card ending 8972` : undefined}
    >
      {row ? (
        <div className={styles.txnBody}>
          <div className={styles.txnAmount}>
            <NumericText value={row.cents / 100} format={{ style: 'currency', currency: 'USD' }} />
          </div>
          <dl className={styles.kv}>
            <dt>Status</dt>
            <dd>
              <span className={clsx(styles.chip, styles[`chip-${row.status}`])}>{STATUS_LABEL[row.status]}</span>
            </dd>
            <dt>Merchant</dt>
            <dd>{row.title.toUpperCase()}</dd>
            <dt>Category</dt>
            <dd>{row.category ?? 'Retail'}</dd>
          </dl>
          <div className={styles.actions}>
            <ContentAreaButton
              type="button"
              variant="bordered"
              disabled={row.status !== 'SETTLED' || refunding}
              onClick={() => {
                setRefunding(true);
                card.refundSelected();
              }}
            >
              {row.status === 'REFUNDED'
                ? 'Refunded'
                : row.status === 'AUTHORIZED'
                  ? 'Waiting to settle…'
                  : refunding
                    ? 'Refunding…'
                    : 'Simulate merchant refund'}
            </ContentAreaButton>
          </div>
        </div>
      ) : null}
    </SheetShell>
  );
}

/* ── Close card ───────────────────────────────────────────────────────────── */

export function CloseCardSheet({ card }: { card: CardControls }) {
  const open = card.sheet === 'close';
  const { closed } = card;
  return (
    <SheetShell
      open={open}
      onDismiss={card.closeSheet}
      tone="danger"
      icon={<IconCrossMedium size={28} />}
      title={closed ? 'Card is closed' : 'Close this card?'}
      sub={
        closed
          ? 'CLOSED is terminal. Trying again returns a 409 — issue a new card instead.'
          : 'This can’t be undone. Pending purchases still settle; new ones are declined.'
      }
    >
      <div className={styles.actions}>
        <ContentAreaButton type="button" variant="filled" onClick={card.closeCard}>
          {closed ? 'Try closing again' : 'Close card'}
        </ContentAreaButton>
        <ContentAreaButton type="button" variant="bordered" onClick={card.closeSheet}>
          {closed ? 'Done' : 'Keep card'}
        </ContentAreaButton>
      </div>
    </SheetShell>
  );
}
