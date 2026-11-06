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

/* The balance card opens this page: the balance and its two moves, today's spend against the limits, the
   bank and card behind it, and what moved. The host app themes it through its sheet's --sp-* variables and
   the --bp-* ones below; Instinct draws the same details on its web page. */

export type BalanceAction = 'fund' | 'cashout';

const ACTIVITY_ROWS = 8;

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

export function BalanceDetails({ account: a, onAction }: { account: AccountSnapshot; onAction: (flow: BalanceAction) => void }) {
  const bank = linkedBank();
  const { daily, perTransaction, approvalAbove } = a.limits;
  const ratio = daily > 0 ? Math.min(1, a.spentTodayCents / daily) : 0;
  return (
    <div className={styles.details}>
      <div className={styles.hero}>
        <strong className={styles.amount}>{usd2(a.balanceCents)}</strong>
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
            <b>{usd2(a.spentTodayCents)}</b> of {usd(daily)} spent
          </span>
          <span className={styles.bar}>
            <i style={{ width: `${Math.max(2, ratio * 100)}%` }} />
          </span>
        </div>
        <Row label="Left today" value={usd2(Math.max(0, daily - a.spentTodayCents))} />
        <Row label="Per payment" value={usd(perTransaction)} />
        <Row label="Asks you above" value={usd(approvalAbove)} />
      </Group>
      <Group title="Linked">
        {a.bankLinked ? (
          <Linked
            mark={<BankMark bank={bank.bankName} country={bank.country.code} size={32} />}
            title={`${bank.bankName} •••• ${bank.last4}`}
            detail={`${bank.country.rail} in ${bank.currency}`}
          />
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
        {a.cardVaulted && (
          <Linked
            mark={
              <span className={styles.glyph}>
                <IconCreditCard1 size={18} />
              </span>
            }
            title="Visa •••• 4242"
            detail="Tops up your balance"
          />
        )}
      </Group>
      <Group title="Activity">
        {a.ledger.length ? (
          a.ledger.slice(0, ACTIVITY_ROWS).map((l) => (
            <div key={l.id} className={styles.activity}>
              <span className={styles.linkedText}>
                <strong>{l.title}</strong>
                <small>{l.status === 'PENDING' ? 'Pending' : l.detail}</small>
              </span>
              <span className={styles.amountCell} data-incoming={l.cents >= 0 || undefined}>
                {l.cents >= 0 ? '+' : '−'}
                {usd2(l.cents)}
              </span>
            </div>
          ))
        ) : (
          <p className={styles.empty}>Nothing yet. Money in and out shows here.</p>
        )}
      </Group>
    </div>
  );
}

export interface BalancePageOptions {
  present?: Transition;
  account: () => AccountSnapshot;
  onAction: (flow: BalanceAction) => void;
}

/** A sheet app's balance page: `open(wallet)` from its balance card; the action closes it and asks in the thread. */
export function useBalancePage({
  theme = styles.neutral,
  large,
  present,
  account,
  onAction,
}: BalancePageOptions & {
  /** The app's sheet theme (its --sp-* and --bp-* variables); iOS's grouped page without one. */
  theme?: string;
  /** Muse opens its pages on a large title. */
  large?: boolean;
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
          <SheetPage
            title={wallet}
            large={large}
            leading={
              <SheetDisc label="Close" onClick={close}>
                <IconCrossMedium size={22} />
              </SheetDisc>
            }
          >
            <BalanceDetails
              account={account()}
              onAction={(flow) => {
                close();
                onAction(flow);
              }}
            />
          </SheetPage>
        )}
      </PageSheet>
    ),
  };
}
