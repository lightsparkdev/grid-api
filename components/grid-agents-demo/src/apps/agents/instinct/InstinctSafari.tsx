import { SfSymbol } from '@/apps/shared/icons';
import { SafariBar } from '@/apps/shared/appSwitch';
import type { AgentAsk, AgentBalance, AskState, SubAgent } from '../conversation';
import { askButtons } from '../parts';
import styles from './InstinctSafari.module.scss';

export const INSTINCT_HOST = 'app.instinct.com';

/**
 * Instinct's vault on app.instinct.com, in Safari (recording 6, "Purchase card"):
 * Instinct lives in iMessage, so anything sensitive opens here instead. A small
 * tile, the serif title, labeled beige fields and a black button; once saved,
 * "Saved to your vault" and the way back to iMessage.
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
  return (
    <div className={styles.page}>
      <button type="button" className={styles.breadcrumb} data-status-back onClick={onBack}>
        <svg width="8" height="9" viewBox="0 0 8 9" aria-hidden>
          <path d="M7.6 0.3v8.4L0.4 4.5z" fill="currentColor" />
        </svg>
        Messages
      </button>
      <main className={styles.sheet}>
        <span className={styles.tile} aria-hidden>
          <SfSymbol name={saved ? 'checkmark' : 'wallet.pass.fill'} size={16} />
        </span>
        <h1 className={styles.title}>{saved ? 'Saved to your vault' : ask.title}</h1>
        <p className={styles.sub}>
          {saved ? 'Instinct can use it now, inside your limits.' : 'Only you can change these. Instinct never sees this page.'}
        </p>
        {!saved && (
          <div className={styles.fields}>
            {ask.rows?.map((r) => (
              <label key={r.text} className={styles.field}>
                <span className={styles.label}>
                  <SfSymbol name="lock.fill" size={10} />
                  {r.text}
                </span>
                <span className={styles.input}>{r.sub}</span>
              </label>
            ))}
          </div>
        )}
        {saved ? (
          <button type="button" className={styles.black} onClick={onBack}>
            Back to iMessage
          </button>
        ) : (
          <>
            <button type="button" className={styles.black} data-pressing={b.pressing || undefined} disabled={b.settled || b.pressing} onClick={onAllow}>
              {b.pressing ? 'Saving…' : (ask.allow ?? 'Save to vault')}
            </button>
            <button type="button" className={styles.notNow} disabled={b.settled || b.pressing} onClick={onDeny}>
              {state === 'denied' ? (ask.denied ?? 'Not now') : (ask.deny ?? 'Not now')}
            </button>
          </>
        )}
      </main>
      <SafariBar host={INSTINCT_HOST} />
    </div>
  );
}

/** The Instinct balance page on app.instinct.com: the number in the serif, the limits as fields, recent activity. */
export function InstinctBalancePage({ balance, onBack }: { balance: AgentBalance; onBack: () => void }) {
  return (
    <div className={styles.page}>
      <button type="button" className={styles.breadcrumb} data-status-back onClick={onBack}>
        <svg width="8" height="9" viewBox="0 0 8 9" aria-hidden>
          <path d="M7.6 0.3v8.4L0.4 4.5z" fill="currentColor" />
        </svg>
        Messages
      </button>
      <main className={styles.sheet}>
        <span className={styles.tile} aria-hidden>
          <SfSymbol name="wallet.pass.fill" size={16} />
        </span>
        <h1 className={styles.title}>{balance.wallet}</h1>
        <p className={styles.amount}>{balance.amount}</p>
        <p className={styles.sub}>{balance.note}</p>
        <div className={styles.fields}>
          {balance.stats.map((st) => (
            <label key={st.label} className={styles.field}>
              <span className={styles.label}>{st.label}</span>
              <span className={styles.input}>{st.value}</span>
            </label>
          ))}
        </div>
        {balance.activity.length > 0 && (
          <ul className={styles.activity}>
            {balance.activity.map((r, i) => (
              <li key={`${r.title}-${i}`}>
                <span>
                  {r.title}
                  <small>{r.detail}</small>
                </span>
                <b data-in={r.incoming || undefined}>{r.amount}</b>
              </li>
            ))}
          </ul>
        )}
        <button type="button" className={styles.black} onClick={onBack}>
          Back to iMessage
        </button>
      </main>
      <SafariBar host={INSTINCT_HOST} />
    </div>
  );
}

/** The conversation with another agent, on app.instinct.com: what Instinct thought, then what they said. */
export function InstinctThreadPage({ agent, onBack }: { agent: SubAgent; onBack: () => void }) {
  return (
    <div className={styles.page}>
      <button type="button" className={styles.breadcrumb} data-status-back onClick={onBack}>
        <svg width="8" height="9" viewBox="0 0 8 9" aria-hidden>
          <path d="M7.6 0.3v8.4L0.4 4.5z" fill="currentColor" />
        </svg>
        Messages
      </button>
      <main className={`${styles.sheet} ${styles.scroll}`}>
        <span className={styles.tile} aria-hidden>
          {agent.initial}
        </span>
        <h1 className={styles.title}>{agent.name}</h1>
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
      <SafariBar host={INSTINCT_HOST} />
    </div>
  );
}
