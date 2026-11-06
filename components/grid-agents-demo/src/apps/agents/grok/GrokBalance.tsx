import { useState, type ReactNode } from 'react';
import { IconBank } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconBank';
import { IconChevronRight } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronRight';
import { IconCreditCard1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCreditCard1';
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossMedium';
import { IconWallet1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconWallet1';
import { useBalanceSheet, type BalancePageProps, type BalanceSheetOptions } from '../BalancePage';
import { SheetDisc, SheetPage } from '../SheetPage';
import bank from './GrokBank.module.scss';
import styles from './GrokBalance.module.scss';

/*
 * Bot balance as Grok draws its Settings (IMG_1919) and Vault (IMG_1922, IMG_1923): white groups of 17pt rows
 * with a gray line under the name, a faint section label, the Vault's rows with their outlined glyph and the
 * gray note under them, and its pill tabs with counts over the activity.
 */

type Tab = 'all' | 'spent' | 'received';

function Row({ lead, title, sub, value, onClick }: { lead?: ReactNode; title: ReactNode; sub?: string; value?: string; onClick?: () => void }) {
  const body = (
    <>
      {lead}
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        {sub && <span className={styles.sub}>{sub}</span>}
      </span>
      {value && <span className={styles.value}>{value}</span>}
      {onClick && <IconChevronRight size={18} className={styles.chevron} />}
    </>
  );
  return onClick ? (
    <button type="button" className={styles.row} onClick={onClick}>
      {body}
    </button>
  ) : (
    <div className={styles.row}>{body}</div>
  );
}

function GrokBalancePage({ wallet, view: v, onClose, onAction }: BalancePageProps) {
  const [tab, setTab] = useState<Tab>('all');
  const spent = v.activity.filter((l) => !l.incoming);
  const received = v.activity.filter((l) => l.incoming);
  const tabs: { id: Tab; label: string; rows: typeof v.activity }[] = [
    { id: 'all', label: 'All', rows: v.activity },
    { id: 'spent', label: 'Spent', rows: spent },
    { id: 'received', label: 'Received', rows: received },
  ];
  const rows = tabs.find((t) => t.id === tab)!.rows;
  return (
    <SheetPage
      title={wallet}
      leading={
        <SheetDisc label="Close" onClick={onClose}>
          <IconCrossMedium size={22} />
        </SheetDisc>
      }
    >
      <div className={styles.group}>
        <Row
          lead={
            <span className={styles.avatar}>
              <IconWallet1 size={20} />
            </span>
          }
          title={<span className={styles.amount}>{v.amount}</span>}
          sub="Available to spend"
        />
        <Row title="Spent today" value={v.used} />
        <Row title="Add money" sub="From your card, bank or crypto" onClick={() => onAction('fund')} />
        <Row title="Move to bank" sub={v.bank ? `To ${v.bank.name} ending ${v.bank.last4}` : 'To a bank you link'} onClick={() => onAction('cashout')} />
      </div>

      <span className={styles.label}>Limits</span>
      <div className={styles.group}>
        <Row title="Per payment" value={v.perPayment} />
        <Row title="Daily" sub={`${v.left} left today`} value={v.daily} />
        <Row title="Asks you above" sub="Face ID to approve" value={v.asksAbove} />
      </div>

      <span className={styles.label}>Vault</span>
      <div className={styles.group}>
        {v.card && <Row lead={<IconCreditCard1 size={20} className={styles.glyph} />} title={`${v.card.brand} ending ${v.card.last4}`} sub={`Expires ${v.card.expires}`} />}
        {v.bank && <Row lead={<IconBank size={20} className={styles.glyph} />} title={`${v.bank.name} ending ${v.bank.last4}`} sub={`${v.bank.rail} · ${v.bank.currency}`} />}
        {!v.card && !v.bank && <Row lead={<IconBank size={20} className={styles.glyph} />} title="Nothing saved yet" sub="A card or bank you add shows here" />}
      </div>
      <p className={styles.help}>Grok Bot never sees a saved card&apos;s number or your bank login. It only moves money inside your limits.</p>

      <div className={bank.tabs} role="tablist">
        {tabs.map((t) => (
          <button key={t.id} type="button" role="tab" className={bank.tab} aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label}
            <span>{t.rows.length}</span>
          </button>
        ))}
      </div>
      <div className={styles.group}>
        {rows.length ? (
          rows.map((l) => <Row key={l.id} title={l.title} sub={l.detail} value={l.amount} />)
        ) : (
          <Row title="Nothing here yet" />
        )}
      </div>
    </SheetPage>
  );
}

export const useGrokBalance = (o: BalanceSheetOptions) => useBalanceSheet({ ...o, theme: bank.theme, page: GrokBalancePage });
