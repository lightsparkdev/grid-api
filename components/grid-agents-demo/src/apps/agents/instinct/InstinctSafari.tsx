import { TextMorph } from 'torph/react';
import { Flag } from '@/apps/shared/Flag';
import { SafariBar } from '@/apps/shared/appSwitch';
import type { AgentAsk, AskState } from '../conversation';
import { askButtons, MORPH, RowGlyph } from '../parts';
import styles from './InstinctSafari.module.scss';

const A = '/assets/agents/instinct';
export const INSTINCT_HOST = 'app.instinct.com';

/**
 * Instinct's approval page on app.instinct.com, in Safari: Instinct lives in iMessage, so anything that needs a
 * decision arrives as a link that opens here. Instinct's warm paper and serif headline, the request, then Approve.
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
  const outcome = state === 'done' ? 'done' : state === 'denied' ? 'denied' : null;
  return (
    <div className={styles.page}>
      <button type="button" className={styles.breadcrumb} data-status-back onClick={onBack}>
        <svg width="8" height="9" viewBox="0 0 8 9" aria-hidden>
          <path d="M7.6 0.3v8.4L0.4 4.5z" fill="currentColor" />
        </svg>
        Messages
      </button>
      <header className={styles.brand}>
        <span className={styles.mark}>
          <img src={`${A}/logo.png`} alt="" width={7.6} height={21} />
        </span>
        Instinct
      </header>
      <main className={styles.sheet}>
        <span className={styles.eyebrow}>{outcome === 'done' ? 'Approved' : outcome === 'denied' ? 'Declined' : 'Needs your approval'}</span>
        <h1 className={styles.title}>{ask.title}</h1>
        {ask.amount && <p className={styles.amount}>{ask.amount}</p>}
        {ask.who && (
          <div className={styles.who}>
            <span className={styles.whoMark}>
              {ask.who.flag ? (
                <Flag code={ask.who.flag} size={36} />
              ) : ask.who.icon ? (
                <img src={ask.who.icon} alt="" width={36} height={36} />
              ) : (
                ask.who.name[0]
              )}
            </span>
            <span className={styles.whoText}>
              <span>{ask.who.name}</span>
              <small>{ask.who.detail}</small>
            </span>
          </div>
        )}
        {ask.rows && (
          <ul className={styles.rows}>
            {ask.rows.map((r) => (
              <li key={r.text}>
                <span className={styles.rowLead}>
                  <RowGlyph row={r} size={15} />
                </span>
                <span className={styles.rowText}>
                  <span>{r.text}</span>
                  {r.sub && <small>{r.sub}</small>}
                </span>
              </li>
            ))}
          </ul>
        )}
        {(ask.total || ask.method) && (
          <dl className={styles.summary}>
            {ask.total && (
              <div>
                <dt>Total</dt>
                <dd>{ask.total}</dd>
              </div>
            )}
            {ask.method && (
              <div>
                <dt>Paid from</dt>
                <dd>{ask.method}</dd>
              </div>
            )}
          </dl>
        )}
        <p className={styles.note}>Nothing is charged until you approve. Your Instinct can’t spend past the limits you set.</p>
        <div className={styles.actions} data-state={state}>
          <button
            type="button"
            className={styles.allow}
            data-pressing={b.pressing || undefined}
            data-done={state === 'done' || undefined}
            disabled={b.settled || b.pressing}
            onClick={onAllow}
          >
            <TextMorph {...MORPH}>{b.allowLabel}</TextMorph>
          </button>
          <button
            type="button"
            className={styles.deny}
            data-chosen={state === 'denied' || undefined}
            disabled={b.settled || b.pressing}
            onClick={onDeny}
          >
            <TextMorph {...MORPH}>{b.denyLabel}</TextMorph>
          </button>
        </div>
      </main>
      <SafariBar host={INSTINCT_HOST} />
    </div>
  );
}
