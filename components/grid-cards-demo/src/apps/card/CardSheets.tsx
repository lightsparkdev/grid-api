'use client';

import clsx from 'clsx';
import { useEffect, useState, type ReactNode } from 'react';
import { IconWallet1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconWallet1';
import { IconArrowUndoUp } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowUndoUp';
import { BottomSheet } from '@/apps/shared/BottomSheet';
import { ContentAreaButton } from '@/apps/shared/ContentAreaButton';
import { GlassSymbolButton, headerGlassBrightness, SHEET_GLASS } from '@/apps/shared/glass';
import { SfSymbol } from '@/apps/shared/icons';
import { useBrand } from '@/apps/shared/brand/BrandContext';
import { CATEGORY_LABEL, type CardControls } from '@/apps/shared/card';
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
}

function SheetShell({ open, onDismiss, icon, title, sub, children }: ShellProps) {
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
        <span className={styles.tile} aria-hidden>
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

/* ── Lock / unlock ───────────────────────────────────────────────────── */

/** The lock's sheet. On a live card, the confirmation: what locking does,
 *  and the button that does it. On a locked card (from the header's lock or
 *  the lock on the card), the status: what locked means, with the way back
 *  and a Got it. `onConfirm` runs the flow (PATCH, webhook, push). */
export function FreezeSheet({ card, onConfirm }: { card: CardControls; onConfirm: () => void }) {
  const open = card.sheet === 'freeze';
  const { frozen } = card;
  return (
    <SheetShell
      open={open}
      onDismiss={card.closeSheet}
      icon={<SfSymbol name="lock.fill" size={28} />}
      title={frozen ? 'Card locked' : 'Lock card?'}
      sub={
        frozen
          ? 'New purchases are declined while it’s locked. Pending purchases still settle. Unlock it any time.'
          : 'New purchases are declined until you unlock it. Pending purchases still settle.'
      }
    >
      <div className={styles.actions}>
        <ContentAreaButton
          type="button"
          variant="filled"
          onClick={() => {
            card.closeSheet();
            onConfirm();
          }}
        >
          {frozen ? 'Unlock card' : 'Lock card'}
        </ContentAreaButton>
        <ContentAreaButton type="button" variant="bordered" onClick={card.closeSheet}>
          {frozen ? 'Got it' : 'Cancel'}
        </ContentAreaButton>
      </div>
    </SheetShell>
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

/* ── Transaction detail + refund ──────────────────────────────────────────── */

const STATUS_LABEL = { AUTHORIZED: 'Pending', SETTLED: 'Settled' } as const;

/** A purchase, or the refund that came back for one. A refund is its own
 *  line (a CREDIT the API links to the purchase), so the purchase keeps its
 *  Settled status and shows the refund beside it. */
export function TransactionSheet({ card }: { card: CardControls }) {
  const open = card.sheet === 'transaction';
  const row = card.selectedRow;
  const isRefund = row?.direction === 'CREDIT';
  const refund = row && !isRefund ? card.refundOf(row.id) : null;
  const [refunding, setRefunding] = useState(false);
  useEffect(() => {
    if (!open) setRefunding(false);
  }, [open]);
  useEffect(() => {
    if (refund) setRefunding(false);
  }, [refund]);
  return (
    <SheetShell
      open={open}
      onDismiss={card.closeSheet}
      icon={<IconArrowUndoUp size={28} />}
      title={row ? (isRefund ? `Refund from ${row.title}` : row.title) : 'Transaction'}
      sub={row ? `${isRefund ? 'Merchant return' : 'Tap to Pay'} · Card ending 8972` : undefined}
    >
      {row ? (
        <div className={styles.txnBody}>
          <div className={clsx(styles.txnAmount, isRefund && styles.txnAmountCredit)}>
            {isRefund ? '+' : ''}
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
            {refund ? (
              <>
                <dt>Refunded</dt>
                <dd>+{refund.amount}</dd>
              </>
            ) : null}
          </dl>
          {isRefund ? null : (
            <div className={styles.actions}>
              <ContentAreaButton
                type="button"
                variant="bordered"
                disabled={row.status !== 'SETTLED' || refunding || Boolean(refund)}
                onClick={() => {
                  setRefunding(true);
                  card.refundSelected();
                }}
              >
                {refund
                  ? 'Refunded'
                  : row.status === 'AUTHORIZED'
                    ? 'Waiting to settle…'
                    : refunding
                      ? 'Refunding…'
                      : 'Simulate merchant refund'}
              </ContentAreaButton>
            </div>
          )}
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
      icon={<SfSymbol name="xmark" size={24} />}
      title={closed ? 'Card is closed' : 'Close this card?'}
      sub={
        closed
          ? 'CLOSED is terminal. Trying again returns a 409 — issue a new card instead.'
          : 'This can’t be undone. Pending purchases still settle; new ones are declined.'
      }
    >
      <div className={styles.actions}>
        <ContentAreaButton type="button" variant={closed ? 'filled' : 'destructive'} onClick={card.closeCard}>
          {closed ? 'Try closing again' : 'Close card'}
        </ContentAreaButton>
        <ContentAreaButton type="button" variant="bordered" onClick={card.closeSheet}>
          {closed ? 'Done' : 'Keep card'}
        </ContentAreaButton>
      </div>
    </SheetShell>
  );
}
