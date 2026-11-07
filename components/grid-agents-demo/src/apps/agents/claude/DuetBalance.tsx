import type { ReactNode } from 'react';
import { IconArrowDown } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowDown';
import { IconBank } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconBank';
import { IconChevronRight } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronRight';
import { IconCreditCard1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCreditCard1';
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossMedium';
import { IconDollar } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconDollar';
import { IconDotGrid1x3Vertical } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconDotGrid1x3Vertical';
import { IconGauge } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconGauge';
import { IconHand4Finger } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconHand4Finger';
import { IconPlusMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPlusMedium';
import { IconWallet1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconWallet1';
import { BankMark } from '../BankMark';
import { useBalanceSheet, type BalancePageProps, type BalanceSheetOptions } from '../BalancePage';
import { SheetDisc, SheetPage } from '../SheetPage';
import vault from './DuetVault.module.scss';
import styles from './DuetBalance.module.scss';

/*
 * Duet balance as the Claude app draws Settings (IMG_1930): the account card (a gray disc, the name over a
 * muted line, then a blue "+ Add account" row), a blue one-line card ("Give the gift of Claude"), and muted
 * section labels over white groups of line-icon rows with a value and a chevron. × at the left, ⋮ at the right.
 */

function Row({ icon, label, value, sub }: { icon?: ReactNode; label: string; value?: string; sub?: string }) {
  return (
    <div className={styles.row}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.text}>
        <span>{label}</span>
        {sub && <small>{sub}</small>}
      </span>
      {value && <span className={styles.value}>{value}</span>}
    </div>
  );
}

function DuetBalancePage({ wallet, view: v, onClose, onAction }: BalancePageProps) {
  return (
    <SheetPage
      title={wallet}
      leading={
        <SheetDisc label="Close" onClick={onClose}>
          <IconCrossMedium size={22} />
        </SheetDisc>
      }
      trailing={
        <SheetDisc label="More">
          <IconDotGrid1x3Vertical size={20} />
        </SheetDisc>
      }
    >
      <div className={styles.body}>
        <div className={styles.group}>
          <div className={styles.account}>
            <span className={styles.avatar}>
              <IconWallet1 size={20} />
            </span>
            <span className={styles.text}>
              <strong>{v.amount}</strong>
              <small>{wallet} · available to spend</small>
            </span>
          </div>
          <button type="button" className={`${styles.row} ${styles.blue}`} onClick={() => onAction('fund')}>
            <span className={styles.icon}>
              <IconPlusMedium size={22} />
            </span>
            Add money
          </button>
        </div>

        <button type="button" className={`${styles.group} ${styles.solo} ${styles.blue}`} onClick={() => onAction('cashout')}>
          <span className={styles.icon}>
            <IconArrowDown size={20} />
          </span>
          Move to bank
          <IconChevronRight size={16} className={styles.chevron} />
        </button>

        <h3 className={styles.label}>Limits</h3>
        <div className={styles.group}>
          <Row icon={<IconGauge size={22} />} label="Spent today" value={`${v.spent} of ${v.daily}`} />
          <Row icon={<IconDollar size={22} />} label="Per payment" value={v.perPayment} />
          <Row icon={<IconHand4Finger size={22} />} label="Asks you above" value={v.asksAbove} />
        </div>

        <h3 className={styles.label}>Connected</h3>
        <div className={styles.group}>
          <Row
            icon={v.bank ? <BankMark bank={v.bank.name} country={v.bank.country} size={24} /> : <IconBank size={22} />}
            label={v.bank ? v.bank.name : 'Bank account'}
            value={v.bank ? `•••• ${v.bank.last4}` : 'None'}
          />
          <Row icon={<IconCreditCard1 size={22} />} label="Card" value={v.card ? `${v.card.brand} •••• ${v.card.last4}` : 'None'} />
        </div>

        <h3 className={styles.label}>Activity</h3>
        <div className={styles.group}>
          {v.activity.length ? (
            v.activity.map((l) => <Row key={l.id} label={l.title} sub={l.detail} value={l.amount} />)
          ) : (
            <Row label="No activity yet" />
          )}
        </div>
      </div>
    </SheetPage>
  );
}

export const useDuetBalance = (o: BalanceSheetOptions) => useBalanceSheet({ ...o, theme: vault.theme, page: DuetBalancePage });
