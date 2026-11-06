import { useState, type ReactNode } from 'react';
import type { Transition } from 'motion/react';
import { IconArrowDown } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowDown';
import { IconBank } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconBank';
import { IconCreditCard1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCreditCard1';
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossMedium';
import { IconPlusMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPlusMedium';
import type { AccountSnapshot } from '@/data/agentApiCalls';
import { BankMark } from './BankMark';
import { linkedBank } from './linkedBank';
import { PageSheet, SheetDisc, SheetPage } from './SheetPage';
import { usd, usd2 } from './story';
import styles from './BalancePage.module.scss';

/* The balance card opens the app's balance page: the balance and its two moves (Add money, Move to bank),
   today's spend against the limits, the bank and card behind it, and what moved. Each app draws it the way it
   draws its own settings (muse/MuseBalance, grok/GrokBalance, …) from `balanceView`; an app without settings
   of its own gets `BalanceDetails`. */

export type BalanceAction = 'fund' | 'cashout';

export interface BalanceRow {
  id: string;
  title: string;
  detail: string;
  amount: string;
  incoming: boolean;
}

/** The account as a balance page reads it, formatted. */
export function balanceView(a: AccountSnapshot) {
  const { daily, perTransaction, approvalAbove } = a.limits;
  const ratio = daily > 0 ? Math.min(1, a.spentTodayCents / daily) : 0;
  const bank = linkedBank();
  return {
    amount: usd2(a.balanceCents),
    spent: usd2(a.spentTodayCents),
    daily: usd(daily),
    left: usd2(Math.max(0, daily - a.spentTodayCents)),
    perPayment: usd(perTransaction),
    asksAbove: usd(approvalAbove),
    ratio,
    used: `${Math.round(ratio * 100)}% used`,
    bank: a.bankLinked ? { name: bank.bankName, last4: bank.last4, country: bank.country.code, rail: bank.country.rail, currency: bank.currency } : null,
    card: a.cardVaulted ? { brand: 'Visa', last4: '4242', expires: '09/29' } : null,
    activity: a.ledger.slice(0, 8).map(
      (l): BalanceRow => ({
        id: l.id,
        title: l.title,
        detail: l.status === 'PENDING' ? 'Pending' : l.detail,
        amount: `${l.cents >= 0 ? '+' : '−'}${usd2(l.cents)}`,
        incoming: l.cents >= 0,
      }),
    ),
  };
}

export type BalanceView = ReturnType<typeof balanceView>;

export interface BalancePageProps {
  wallet: string;
  view: BalanceView;
  onClose: () => void;
  /** Closes the page and asks in the thread, as the tiles do. */
  onAction: (flow: BalanceAction) => void;
}

export interface BalanceSheetOptions {
  account: () => AccountSnapshot;
  onAction: (flow: BalanceAction) => void;
}

/** A sheet app's balance page: `open(wallet)` from its balance card, and the page sheet to render. */
export function useBalanceSheet({
  theme,
  present,
  account,
  onAction,
  page: Page,
}: BalanceSheetOptions & {
  /** The app's sheet theme (its --sp-* variables). */
  theme: string;
  present?: Transition;
  page: (props: BalancePageProps) => ReactNode;
}) {
  const [wallet, setWallet] = useState<string | null>(null);
  const [shown, setShown] = useState(false);
  const close = () => setShown(false);
  return {
    open: (name: string) => {
      setWallet(name);
      setShown(true);
    },
    sheet: (
      <PageSheet open={shown} present={present} className={theme} onDismiss={close}>
        {wallet && (
          <Page
            wallet={wallet}
            view={balanceView(account())}
            onClose={close}
            onAction={(flow) => {
              close();
              onAction(flow);
            }}
          />
        )}
      </PageSheet>
    ),
  };
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h3 className={styles.head}>{title}</h3>
      <div className={styles.group}>{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.row}>
      <span>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  );
}

function Linked({ mark, title, detail }: { mark: ReactNode; title: string; detail: string }) {
  return (
    <div className={styles.linked}>
      {mark}
      <span className={styles.linkedText}>
        <strong>{title}</strong>
        <small>{detail}</small>
      </span>
    </div>
  );
}

/** iOS's grouped page, for an app without settings of its own (Your agent). */
function NeutralPage({ wallet, view: v, onClose, onAction }: BalancePageProps) {
  return (
    <SheetPage
      title={wallet}
      leading={
        <SheetDisc label="Close" onClick={onClose}>
          <IconCrossMedium size={22} />
        </SheetDisc>
      }
    >
      <div className={styles.details}>
        <div className={styles.hero}>
          <strong className={styles.amount}>{v.amount}</strong>
          <span className={styles.note}>Available to spend</span>
          <div className={styles.actions}>
            <button type="button" data-primary onClick={() => onAction('fund')}>
              <IconPlusMedium size={18} />
              Add money
            </button>
            <button type="button" onClick={() => onAction('cashout')}>
              <IconArrowDown size={18} />
              Move to bank
            </button>
          </div>
        </div>
        <Group title="Today">
          <div className={styles.track}>
            <span>
              <b>{v.spent}</b> of {v.daily} spent
            </span>
            <span className={styles.bar}>
              <i style={{ width: `${Math.max(2, v.ratio * 100)}%` }} />
            </span>
          </div>
          <Row label="Left today" value={v.left} />
          <Row label="Per payment" value={v.perPayment} />
          <Row label="Asks you above" value={v.asksAbove} />
        </Group>
        <Group title="Linked">
          {v.bank ? (
            <Linked mark={<BankMark bank={v.bank.name} country={v.bank.country} size={32} />} title={`${v.bank.name} •••• ${v.bank.last4}`} detail={`${v.bank.rail} in ${v.bank.currency}`} />
          ) : (
            <Linked
              mark={
                <span className={styles.glyph}>
                  <IconBank size={18} />
                </span>
              }
              title="No bank yet"
              detail="Link one to add money or cash out"
            />
          )}
          {v.card && (
            <Linked
              mark={
                <span className={styles.glyph}>
                  <IconCreditCard1 size={18} />
                </span>
              }
              title={`${v.card.brand} •••• ${v.card.last4}`}
              detail="Tops up your balance"
            />
          )}
        </Group>
        <Group title="Activity">
          {v.activity.length ? (
            v.activity.map((l) => (
              <div key={l.id} className={styles.activity}>
                <span className={styles.linkedText}>
                  <strong>{l.title}</strong>
                  <small>{l.detail}</small>
                </span>
                <span className={styles.amountCell} data-incoming={l.incoming || undefined}>
                  {l.amount}
                </span>
              </div>
            ))
          ) : (
            <p className={styles.empty}>Nothing yet. Money in and out shows here.</p>
          )}
        </Group>
      </div>
    </SheetPage>
  );
}

export const useBalancePage = (o: BalanceSheetOptions) => useBalanceSheet({ ...o, theme: styles.neutral, page: NeutralPage });
