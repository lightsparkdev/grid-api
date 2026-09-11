'use client';

import clsx from 'clsx';
import { useEffect, useState, type ReactNode } from 'react';
import { IconWallet1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconWallet1';
import { IconGauge } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconGauge';
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossMedium';
import { IconArrowUndoUp } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowUndoUp';
import { BottomSheet } from '@/apps/shared/BottomSheet';
import { ContentAreaButton } from '@/apps/shared/ContentAreaButton';
import { GlassSymbolButton, headerGlassBrightness, SHEET_GLASS } from '@/apps/shared/glass';
import { SfSymbol } from '@/apps/shared/icons';
import { useBrand } from '@/apps/shared/brand/BrandContext';
import { CATEGORY_LABEL, formatUsdCents, type CardControls, type SpendLimits } from '@/apps/shared/card';
import NumericText from '@/components/NumericText';
import { useThemeMode } from '@/hooks/useThemeMode';
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

/* ── Already in Apple Wallet ─────────────────────────────────────────────── */

/** A second Add to Wallet: the card is already on this iPhone. */
export function WalletAgainSheet({ card }: { card: CardControls }) {
  const open = card.sheet === 'walletAgain';
  const brand = useBrand().programName.trim();
  return (
    <SheetShell
      open={open}
      onDismiss={card.closeSheet}
      icon={<IconWallet1 size={28} />}
      title="Already in Apple Wallet"
      sub={`Your ${brand ? `${brand} card` : 'card'} is in your Apple Wallet and ready to use.`}
    >
      <div className={styles.actions}>
        <ContentAreaButton type="button" variant="filled" onClick={card.closeSheet}>
          Done
        </ContentAreaButton>
      </div>
    </SheetShell>
  );
}

/* ── Spending limits ──────────────────────────────────────────────────────── */

const PER_TXN_STEPS = [null, 2_500, 5_000, 7_500, 10_000, 25_000] as const;
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
  // The draft lives in the controls (seeded by `openLimits`) so the Limits
  // flow can pick the steps the way the cardholder would.
  const { limitsDraft: draft, setLimitsDraft: setDraft } = card;
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
          onChange={(v) => setDraft((d: SpendLimits) => ({ ...d, perTransactionCents: v }))}
        />
        <LimitPicker
          label="Per day"
          hint={`maxSpendPerDay — resets at 00:00 UTC. Spent today: ${formatUsdCents(used)}. Refunds don't restore capacity.`}
          steps={PER_DAY_STEPS}
          value={draft.perDayCents}
          onChange={(v) => setDraft((d: SpendLimits) => ({ ...d, perDayCents: v }))}
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
            <dd>{row.category ? CATEGORY_LABEL[row.category] : 'Retail'}</dd>
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
