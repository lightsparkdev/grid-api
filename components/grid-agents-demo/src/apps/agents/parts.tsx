import { TextMorph } from 'torph/react';
import { Flag } from '@/apps/shared/Flag';
import { SfSymbol } from '@/apps/shared/icons';
import { cubicBezierCss, easeOutSnappy } from '@/lib/easing';
import type { AgentAsk, AgentNote, AskRow, AskState, Chip } from './conversation';
import styles from './parts.module.scss';

/* The pieces a skin draws when it has no bespoke design for them. Each reads
   its skin's `--part-*` tokens (set on the skin's screen), so a receipt in
   Grok looks like Grok and the same receipt in dot looks like dot. */

export const MORPH = { duration: 280, ease: cubicBezierCss(easeOutSnappy) };

const ROW_SYMBOL = {
  lock: 'lock.fill',
  gauge: 'gauge.with.dots.needle.bottom.50percent',
  checkmark: 'checkmark',
  card: 'creditcard.and.numbers',
  wallet: 'wallet.pass.fill',
} as const;

/** An ask row's lead: its image, or a symbol the playground has. */
export function RowGlyph({ row, size = 18 }: { row: AskRow; size?: number }) {
  if (row.image) return <img className={styles.rowImage} src={row.image} alt="" width={32} height={32} />;
  const icon = row.icon;
  if (icon && icon in ROW_SYMBOL) return <SfSymbol name={ROW_SYMBOL[icon as keyof typeof ROW_SYMBOL]} size={size} />;
  return <span className={styles.rowDot} />;
}

/** A receipt, an address, a limits summary. */
export function NoteCard({ note, className }: { note: AgentNote; className?: string }) {
  return (
    <div className={`${styles.note} ${className ?? ''}`} data-done={note.done || undefined}>
      <span className={styles.noteTitle}>
        {note.done && (
          <span className={styles.check}>
            <SfSymbol name="checkmark" size={10} />
          </span>
        )}
        {note.title}
      </span>
      {note.code && <code className={styles.code}>{note.code}</code>}
      {note.lines.map((l) => (
        <span key={l} className={styles.noteLine}>
          {l}
        </span>
      ))}
    </div>
  );
}

/** Quick replies: the visitor taps one, or the agent's pick lands on its own. */
export function ChipRow({
  chips,
  picked,
  onPick,
  className,
}: {
  chips: Chip[];
  picked: number | null;
  onPick: () => void;
  className?: string;
}) {
  return (
    <div className={`${styles.chips} ${className ?? ''}`} data-picked={picked !== null || undefined}>
      {chips.map((c, i) => (
        <button key={c.label} type="button" className={styles.chip} data-picked={picked === i || undefined} onClick={onPick}>
          {c.flag ? <Flag code={c.flag} size={20} /> : c.icon ? <img src={c.icon} alt="" width={20} height={20} /> : null}
          {c.label}
        </button>
      ))}
    </div>
  );
}

/** The plain approval card: what, how much, with what, and Approve. */
export function AskCard({
  ask,
  state,
  onAnswer,
  className,
}: {
  ask: AgentAsk;
  state: AskState;
  onAnswer: () => void;
  className?: string;
}) {
  const done = state === 'done';
  return (
    <div className={`${styles.ask} ${className ?? ''}`}>
      <div className={styles.askTop}>
        <span className={styles.askTitle}>{ask.title}</span>
        {ask.amount && <strong className={styles.askAmount}>{ask.amount}</strong>}
      </div>
      {ask.who && (
        <div className={styles.askWho}>
          <span className={styles.askWhoMark}>
            {ask.who.flag ? (
              <Flag code={ask.who.flag} size={28} />
            ) : ask.who.icon ? (
              <img src={ask.who.icon} alt="" width={28} height={28} />
            ) : (
              ask.who.name[0]
            )}
          </span>
          <span className={styles.askWhoText}>
            <span>{ask.who.name}</span>
            <small>{ask.who.detail}</small>
          </span>
        </div>
      )}
      {ask.rows && (
        <div className={styles.askRows}>
          {ask.rows.map((r) => (
            <div key={r.text} className={styles.askRow}>
              <span className={styles.askRowLead}>
                <RowGlyph row={r} size={14} />
              </span>
              <span className={styles.askRowText}>
                <span>{r.text}</span>
                {r.sub && <small>{r.sub}</small>}
              </span>
            </div>
          ))}
        </div>
      )}
      {ask.method && <span className={styles.askMethod}>{ask.method}</span>}
      <div className={styles.askActions}>
        <button type="button" className={styles.askDeny} disabled={done}>
          {ask.deny ?? 'Not now'}
        </button>
        <button
          type="button"
          className={styles.askAllow}
          data-pressing={state === 'pressing' || state === 'authing' || undefined}
          data-done={done || undefined}
          onClick={onAnswer}
        >
          <TextMorph {...MORPH}>{done ? (ask.allowed ?? 'Approved') : (ask.allow ?? 'Approve')}</TextMorph>
        </button>
      </div>
    </div>
  );
}
