import { useState, type ReactNode } from 'react';
import type { Transition } from 'motion/react';
import { IconArrowDownCircle } from '@central-icons-react/round-filled-radius-2-stroke-2/IconArrowDownCircle';
import { IconBank } from '@central-icons-react/round-filled-radius-2-stroke-2/IconBank';
import { IconCoins } from '@central-icons-react/round-filled-radius-2-stroke-2/IconCoins';
import { IconCreditCard1 } from '@central-icons-react/round-filled-radius-2-stroke-2/IconCreditCard1';
import { IconGauge } from '@central-icons-react/round-filled-radius-2-stroke-2/IconGauge';
import { IconHand4Finger } from '@central-icons-react/round-filled-radius-2-stroke-2/IconHand4Finger';
import { IconWallet1 } from '@central-icons-react/round-filled-radius-2-stroke-2/IconWallet1';
import { IconChevronRight } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronRight';
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossMedium';
import { BankMark } from '../BankMark';
import { useBalanceSheet, type BalancePageProps, type BalanceSheetOptions } from '../BalancePage';
import { SheetDisc, SheetPage } from '../SheetPage';
import vault from './DotVault.module.scss';
import styles from './DotBalance.module.scss';

/*
 * Dots balance as Dots draws Customize (IMG_1895), a plugin's page (IMG_1896) and Scheduled (IMG_1894): the
 * plugin's outlined header card, outlined cards of rows with a colored glyph and a status at the right, the
 * Active / Paused / Completed tabs over the activity, and the black "New task" pill floating at the foot.
 */

type Tab = 'all' | 'in' | 'out';

function Row({ icon, label, value, onClick }: { icon: ReactNode; label: string; value?: ReactNode; onClick?: () => void }) {
  const body = (
    <>
      <span className={styles.icon}>{icon}</span>
      <span className={styles.label}>{label}</span>
      {value !== undefined && <span className={styles.value}>{value}</span>}
      {onClick && <IconChevronRight size={16} className={styles.chevron} />}
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

function DotBalancePage({ wallet, view: v, onClose, onAction }: BalancePageProps) {
  const [tab, setTab] = useState<Tab>('all');
  const rows = v.activity.filter((l) => tab === 'all' || l.incoming === (tab === 'in'));
  return (
    <SheetPage
      title={wallet}
      leading={
        <SheetDisc label="Close" onClick={onClose}>
          <IconCrossMedium size={22} />
        </SheetDisc>
      }
      footer={
        <div className={styles.foot}>
          <button type="button" className={styles.pill} onClick={() => onAction('fund')}>
            Add money
          </button>
        </div>
      }
    >
      <div className={styles.body}>
        <div className={styles.hero}>
          <IconWallet1 size={28} className={styles.heroIcon} />
          <h1>{v.amount}</h1>
          <p>In your {wallet}. dot spends it for you, inside your limits.</p>
        </div>

        <div className={styles.card}>
          <Row icon={<IconGauge size={22} color="#ff9500" />} label="Spent today" value={`${v.spent} of ${v.daily}`} />
          <Row icon={<IconCoins size={22} color="#f2b600" />} label="Per payment" value={v.perPayment} />
          <Row icon={<IconHand4Finger size={22} color="#8e5bea" />} label="Asks you above" value={v.asksAbove} />
        </div>

        <div className={styles.card}>
          <Row
            icon={v.bank ? <BankMark bank={v.bank.name} country={v.bank.country} size={24} /> : <IconBank size={22} color="#5e5ce6" />}
            label={v.bank ? v.bank.name : 'Bank'}
            value={v.bank ? 'Connected' : 'Not linked'}
          />
          <Row icon={<IconCreditCard1 size={22} color="#0a84ff" />} label="Card" value={v.card ? `${v.card.brand} •••• ${v.card.last4}` : 'Not saved'} />
          <Row icon={<IconArrowDownCircle size={22} color="#30b0c7" />} label="Move to bank" onClick={() => onAction('cashout')} />
        </div>

        <div className={styles.tabs} role="tablist">
          {(
            [
              ['all', 'All'],
              ['in', 'In'],
              ['out', 'Out'],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </div>
        <span className={styles.section}>Recent</span>
        <div className={styles.list}>
          {rows.length ? (
            rows.map((l) => (
              <div key={l.id} className={styles.item}>
                <span className={styles.itemText}>
                  <span>{l.title}</span>
                  <small>{l.detail}</small>
                </span>
                <span className={styles.amount} data-incoming={l.incoming || undefined}>
                  {l.amount}
                </span>
              </div>
            ))
          ) : (
            <p className={styles.empty}>Nothing here yet.</p>
          )}
        </div>
      </div>
    </SheetPage>
  );
}

export const useDotBalance = (o: BalanceSheetOptions & { present?: Transition }) => useBalanceSheet({ ...o, theme: vault.theme, page: DotBalancePage });
