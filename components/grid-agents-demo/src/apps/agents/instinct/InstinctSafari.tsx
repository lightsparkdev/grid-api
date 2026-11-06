import type { ReactNode } from 'react';
import { IconArrowDown } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowDown';
import { IconBank } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconBank';
import { IconCoins } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCoins';
import { IconCreditCard1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCreditCard1';
import { IconGauge } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconGauge';
import { IconLock } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconLock';
import { SfSymbol } from '@/apps/shared/icons';
import { SafariBar } from '@/apps/shared/appSwitch';
import type { AccountSnapshot } from '@/data/agentApiCalls';
import { BankMark } from '../BankMark';
import { balanceView, type BalanceAction } from '../BalancePage';
import type { AgentAsk, AskState, SubAgent } from '../conversation';
import { askButtons } from '../parts';
import { InstinctBank, SiteBar, SiteField } from './InstinctBank';
import bal from './InstinctBalance.module.scss';
import styles from './InstinctSafari.module.scss';

export const INSTINCT_HOST = 'app.instinct.com';

/** Safari over app.instinct.com: "◀ Messages" under the status bar's time, the page, Safari's toolbar. */
function Safari({ onBack, children }: { onBack: () => void; children: ReactNode }) {
  return (
    <div className={styles.page}>
      <button type="button" className={styles.breadcrumb} data-status-back onClick={onBack}>
        <svg width="8" height="9" viewBox="0 0 8 9" aria-hidden>
          <path d="M7.6 0.3v8.4L0.4 4.5z" fill="currentColor" />
        </svg>
        Messages
      </button>
      {children}
      <SafariBar host={INSTINCT_HOST} />
    </div>
  );
}

/**
 * Instinct's vault on app.instinct.com, in Safari (IMG_1926–1929, recording 6): Instinct lives in iMessage, so
 * anything sensitive opens here instead. A card or a setting is an "Add login" form (the serif title, labeled
 * beige fields, Save); a bank picks its country first. Once saved, "Saved to your vault" and the way back.
 */
export function InstinctSafari({
  ask,
  state,
  onAllow,
  onDeny,
  onBack,
}: {
  ask: AgentAsk;
  state: AskState;
  onAllow: () => void;
  onDeny: () => void;
  onBack: () => void;
}) {
  const b = askButtons(ask, state);
  const saved = state === 'done';
  if (ask.bank && !saved) {
    return (
      <Safari onBack={onBack}>
        <InstinctBank payee={ask.recipient} onLinked={onAllow} onClose={onBack} />
      </Safari>
    );
  }
  if (saved) {
    return (
      <Safari onBack={onBack}>
        <div className={styles.sitePage}>
          <SiteBar left="menu" />
          <main className={styles.siteScroll}>
            <span className={styles.tile} aria-hidden>
              <SfSymbol name="checkmark" size={16} />
            </span>
            <h1 className={styles.siteTitle}>{ask.recipient ? `Saved ${ask.recipient.first}’s bank` : 'Saved to your vault'}</h1>
            <p className={styles.sub}>{ask.recipient ? `Instinct can pay ${ask.recipient.first} now, inside your limits.` : 'Instinct can use it now, inside your limits.'}</p>
            <button type="button" className={styles.black} onClick={onBack}>
              Back to iMessage
            </button>
          </main>
        </div>
      </Safari>
    );
  }
  const busy = b.settled || b.pressing;
  return (
    <Safari onBack={onBack}>
      <div className={styles.sitePage}>
        <SiteBar left="close" onLeft={onBack} save={{ enabled: !busy, label: b.pressing ? 'Saving' : 'Save', onClick: onAllow }} />
        <main className={styles.siteScroll}>
          <h1 className={styles.siteTitle}>{ask.title}</h1>
          <div className={styles.siteFields}>
            {ask.rows?.map((r) => (
              <SiteField key={r.text} label={r.text} value={r.sub ?? ''} icon={r.icon === 'lock' ? <SfSymbol name="lock.fill" size={12} /> : undefined} />
            ))}
          </div>
          <p className={styles.siteNote}>Only you can change these. Instinct never sees this page.</p>
          <button type="button" className={styles.black} data-pressing={b.pressing || undefined} disabled={busy} onClick={onAllow}>
            {b.pressing ? 'Saving…' : (ask.allow ?? 'Save to vault')}
          </button>
          {ask.deny && (
            <button type="button" className={styles.notNow} disabled={busy} onClick={onDeny}>
              {state === 'denied' ? (ask.denied ?? ask.deny) : ask.deny}
            </button>
          )}
        </main>
      </div>
    </Safari>
  );
}

function BalanceSection({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <section className={bal.section}>
      <h2>{title}</h2>
      <p>{sub}</p>
      {children}
    </section>
  );
}

function BalanceRow({ icon, title, sub, amount, incoming }: { icon?: ReactNode; title: string; sub: string; amount?: string; incoming?: boolean }) {
  return (
    <div className={bal.row}>
      {icon && <span className={bal.icon}>{icon}</span>}
      <span className={bal.rowText}>
        <b>{title}</b>
        <small>{sub}</small>
      </span>
      {amount && (
        <span className={bal.amount} data-incoming={incoming || undefined}>
          {amount}
        </span>
      )}
    </div>
  );
}

const SEGMENTS = 10;

/**
 * The balance on app.instinct.com, opened from the link under its text, laid out as the site's account pages
 * (IMG_1926, IMG_1929): serif sections over a dark rule, the light serif counter with its segmented track
 * ("0/10 invites used"), a black button and an outlined one, then rows of a glyph and two lines.
 */
export function InstinctBalancePage({ account, onAction, onBack }: { account: AccountSnapshot; onAction: (flow: BalanceAction) => void; onBack: () => void }) {
  const v = balanceView(account);
  const [whole, cents] = v.amount.split('.');
  const filled = Math.round(v.ratio * SEGMENTS);
  return (
    <Safari onBack={onBack}>
      <div className={styles.sitePage}>
        <SiteBar left="close" onLeft={onBack} />
        <main className={styles.siteScroll}>
          <BalanceSection title="Balance" sub="What Instinct can spend for you">
            <div className={bal.counter}>
              <span className={bal.big}>
                {whole}
                <span>.{cents}</span>
              </span>
              <small>available · {v.left} left today</small>
            </div>
            <div className={bal.track} aria-hidden>
              {Array.from({ length: SEGMENTS }, (_, i) => (
                <i key={i} data-on={i < filled || undefined} />
              ))}
            </div>
            <small className={bal.spent}>
              {v.spent} of {v.daily} spent today
            </small>
            <button type="button" className={bal.black} onClick={() => onAction('fund')}>
              Add money
            </button>
            <button type="button" className={bal.outline} onClick={() => onAction('cashout')}>
              <IconArrowDown size={16} />
              Move to bank
            </button>
          </BalanceSection>

          <BalanceSection title="Limits" sub="Only you can change these. Instinct asks before anything over them.">
            <BalanceRow icon={<IconCoins size={20} />} title="Per payment" sub={`Up to ${v.perPayment} at a time`} />
            <BalanceRow icon={<IconGauge size={20} />} title="Daily" sub={`${v.daily} a day · ${v.left} left today`} />
            <BalanceRow icon={<IconLock size={20} />} title="Approval" sub={`Asks you above ${v.asksAbove}`} />
          </BalanceSection>

          <BalanceSection title="Linked" sub="Where money comes from and goes back to">
            <BalanceRow
              icon={v.bank ? <BankMark bank={v.bank.name} country={v.bank.country} size={28} /> : <IconBank size={20} />}
              title="Bank"
              sub={v.bank ? `${v.bank.name} •••• ${v.bank.last4} · ${v.bank.rail}` : 'Not linked'}
            />
            <BalanceRow icon={<IconCreditCard1 size={20} />} title="Card" sub={v.card ? `${v.card.brand} •••• ${v.card.last4}` : 'Not saved'} />
          </BalanceSection>

          <BalanceSection title="Activity" sub="What came in and went out">
            {v.activity.length ? (
              v.activity.map((l) => <BalanceRow key={l.id} title={l.title} sub={l.detail} amount={l.amount} incoming={l.incoming} />)
            ) : (
              <p className={bal.empty}>Nothing yet.</p>
            )}
          </BalanceSection>
        </main>
      </div>
    </Safari>
  );
}

/** The conversation with another agent, on app.instinct.com: what Instinct thought, then what they said. */
export function InstinctThreadPage({ agent, onBack }: { agent: SubAgent; onBack: () => void }) {
  return (
    <Safari onBack={onBack}>
      <div className={styles.sitePage}>
        <SiteBar left="menu" />
        <main className={styles.siteScroll}>
          <span className={styles.tile} aria-hidden>
            {agent.initial}
          </span>
          <h1 className={styles.siteTitle}>{agent.name}</h1>
          <p className={styles.sub}>{agent.done}</p>
          <ol className={styles.thinking}>
            {agent.steps.map((st) => (
              <li key={st.title}>
                <b>{st.title}</b>
                <span>{st.detail}</span>
              </li>
            ))}
          </ol>
          <div className={styles.exchange}>
            {agent.messages.map((m, i) => (
              <p key={i} data-from={m.from}>
                <small>{m.from === 'us' ? 'Instinct' : agent.name}</small>
                {m.text}
              </p>
            ))}
          </div>
          <button type="button" className={styles.black} onClick={onBack}>
            Back to iMessage
          </button>
        </main>
      </div>
    </Safari>
  );
}
