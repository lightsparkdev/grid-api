import type { ReactNode } from 'react';
import { IconArrowDown } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowDown';
import { IconBank } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconBank';
import { IconChevronRight } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronRight';
import { IconCoins } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCoins';
import { IconCreditCard1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCreditCard1';
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossMedium';
import { IconHand4Finger } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconHand4Finger';
import { IconWallet1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconWallet1';
import { BankMark } from '../BankMark';
import { useBalanceSheet, type BalancePageProps, type BalanceSheetOptions } from '../BalancePage';
import { SheetDisc, SheetPage } from '../SheetPage';
import connect from './MuseConnect.module.scss';
import styles from './MuseBalance.module.scss';

/*
 * Muse balance as Muse draws its Settings (IMG_1907) and Wallet (IMG_1911): the Wallet page's tile, centered
 * title and line; the plan card's usage bar with its blue link (here, today's spend and Add money); icon rows in
 * rounded cards; × at the top right.
 */

function Row({ icon, label, value, onClick }: { icon: ReactNode; label: string; value?: ReactNode; onClick?: () => void }) {
  const body = (
    <>
      <span className={styles.icon}>{icon}</span>
      <span className={styles.label}>{label}</span>
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

function MuseBalancePage({ wallet, view: v, onClose, onAction }: BalancePageProps) {
  return (
    <SheetPage
      title={wallet}
      heading={
        <div className={styles.hero}>
          <span className={styles.tile}>
            <IconWallet1 size={24} />
          </span>
          <h1>{v.amount}</h1>
          <p>In your {wallet}. Muse spends it for you, inside your limits.</p>
        </div>
      }
      trailing={
        <SheetDisc label="Close" onClick={onClose}>
          <IconCrossMedium size={22} />
        </SheetDisc>
      }
    >
      <div className={styles.body}>
        <div className={styles.plan}>
          <span className={styles.planHead}>
            <span>Today</span>
            <small>{v.used}</small>
          </span>
          <span className={styles.planSub}>
            {v.spent} of {v.daily} · resets at midnight
          </span>
          <span className={styles.bar}>
            <i style={{ width: `${Math.max(1.5, v.ratio * 100)}%` }} />
          </span>
          <button type="button" className={styles.link} onClick={() => onAction('fund')}>
            Add money
          </button>
        </div>

        <div className={styles.card}>
          <Row icon={<IconArrowDown size={22} />} label="Move to bank" onClick={() => onAction('cashout')} />
          <Row
            icon={v.bank ? <BankMark bank={v.bank.name} country={v.bank.country} size={24} /> : <IconBank size={22} />}
            label={v.bank ? v.bank.name : 'Bank account'}
            value={v.bank ? `•••• ${v.bank.last4}` : 'Not linked'}
          />
          <Row icon={<IconCreditCard1 size={22} />} label="Card" value={v.card ? `${v.card.brand} •••• ${v.card.last4}` : 'Not saved'} />
        </div>

        <div className={styles.card}>
          <Row icon={<IconCoins size={22} />} label="Per payment" value={v.perPayment} />
          <Row icon={<IconHand4Finger size={22} />} label="Asks you above" value={v.asksAbove} />
        </div>

        <span className={styles.section}>Activity</span>
        <div className={styles.card}>
          {v.activity.length ? (
            v.activity.map((l) => (
              <div key={l.id} className={styles.activity}>
                <span className={styles.activityText}>
                  <span>{l.title}</span>
                  <small>{l.detail}</small>
                </span>
                <span className={styles.amount} data-incoming={l.incoming || undefined}>
                  {l.amount}
                </span>
              </div>
            ))
          ) : (
            <p className={styles.empty}>No activity yet.</p>
          )}
        </div>
      </div>
    </SheetPage>
  );
}

export const useMuseBalance = (o: BalanceSheetOptions) => useBalanceSheet({ ...o, theme: connect.theme, page: MuseBalancePage });
