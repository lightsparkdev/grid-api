import { useRef, useState } from 'react';
import { TextMorph } from 'torph/react';
import type { Transition } from 'motion/react';
import { IconCheckmark1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckmark1';
import { IconChevronRight } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronRight';
import { Flag } from '@/apps/shared/Flag';
import { BankMark } from './BankMark';
import { SfSymbol } from '@/apps/shared/icons';
import { cubicBezierCss, easeOutSnappy } from '@/lib/easing';
import type { AgentAsk, AgentBalance, AgentMeta, AgentNote, AskRow, AskState, Chip, Message, Product, SubAgent } from './conversation';
import { AppSheet } from './sheet';
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
      {note.rows && (
        <div className={styles.noteRows}>
          {note.rows.map((r, i) => (
            <div key={`${r.title}-${i}`} className={styles.noteRow}>
              <span className={styles.noteRowText}>
                <span>{r.title}</span>
                <small>{r.detail}</small>
              </span>
              <span className={styles.noteRowAmount} data-incoming={r.incoming || undefined}>
                {r.amount}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * The app's balance, in the website card's anatomy ("{App} balance", the
 * amount, a note), skinned by the host app through the --acct-* variables.
 * The whole card opens the app's balance page, where Add money and Move to
 * bank live.
 */
export function BalanceCard({
  balance,
  track,
  onOpen,
  className,
}: {
  balance: AgentBalance;
  /** Draw today's spend against the daily limit. */
  track?: boolean;
  onOpen: () => void;
  className?: string;
}) {
  return (
    <button type="button" className={`${styles.account} ${className ?? ''}`} data-kind="account" data-opens-sheet onClick={onOpen}>
      <span className={styles.accountLabel}>
        {balance.wallet}
        <IconChevronRight size={14} />
      </span>
      <strong className={styles.accountAmount}>{balance.amount}</strong>
      <span className={styles.accountNote}>{balance.note}</span>
      {track && (
        <span className={styles.accountTrack}>
          <span className={styles.accountBar}>
            <i style={{ width: `${Math.max(2, balance.spent.ratio * 100)}%` }} />
          </span>
          <small>
            {balance.spent.left} left of {balance.spent.limit} today
          </small>
        </span>
      )}
    </button>
  );
}

/** The sub-agent at work: its mark, what it's doing (shimmering until it's done), and a chevron to look inside. */
export function SubAgentRow({
  agent,
  done,
  onOpen,
  className,
}: {
  agent: SubAgent;
  done: boolean;
  onOpen: () => void;
  className?: string;
}) {
  return (
    <button type="button" className={`${styles.sub} ${className ?? ''}`} onClick={onOpen} data-done={done || undefined} data-subagent>
      <span className={styles.subMark}>{agent.initial}</span>
      <span className={styles.subLabel}>
        <strong>{agent.name}</strong>
        <small>{done ? agent.summary : <span className={styles.subShimmer}>{agent.status}…</span>}</small>
      </span>
      <IconChevronRight size={16} className={styles.subChevron} />
    </button>
  );
}

/** Inside the sub-agent: its chain of thought, a step at a time (each opens), then what the two agents said. */
export function SubAgentDetail({ agent, done }: { agent: SubAgent; done: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  const finished = done ? agent.steps.length : 2;
  return (
    <div className={styles.subDetail}>
      <div className={styles.subHead}>
        <span className={styles.subMark} data-big>
          {agent.initial}
        </span>
        <span>
          <b>{agent.name}</b>
          <small>{done ? 'Finished' : 'Working…'}</small>
        </span>
      </div>
      <span className={styles.detailHead}>Thinking</span>
      <ol className={styles.steps}>
        {agent.steps.map((st, i) => (
          <li key={st.title} data-pending={i >= finished || undefined}>
            <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
              <span className={styles.stepMark}>{i < finished ? <IconCheckmark1 size={11} /> : <i />}</span>
              <span className={styles.stepTitle}>{st.title}</span>
              <IconChevronRight size={12} className={styles.stepChevron} />
            </button>
            {open === i && <p>{st.detail}</p>}
          </li>
        ))}
      </ol>
      <span className={styles.detailHead}>Messages</span>
      <div className={styles.subMessages}>
        {agent.messages.slice(0, done ? undefined : 3).map((m, i) => (
          <span key={i} data-from={m.from}>
            {m.text}
          </span>
        ))}
      </div>
    </div>
  );
}

const SHEET_IN: Transition = { duration: 0.45, ease: [0.3, 0.7, 0.2, 1] };

/** The sub-agent's sheet, in the skin's colors (its --part-* tokens): the name, Done, and the detail. */
export function SubAgentSheet({
  agent,
  done,
  open,
  onClose,
  present = SHEET_IN,
  className,
}: {
  agent: SubAgent | null;
  done: boolean;
  open: boolean;
  onClose: () => void;
  present?: Transition;
  className?: string;
}) {
  return (
    <AppSheet open={open} present={present} dim={0.2} className={styles.subPanel} onDismiss={onClose}>
      {agent && (
        <div className={`${styles.subSheet} ${className ?? ''}`}>
          <div className={styles.subBar}>
            <span />
            <strong>Agent conversation</strong>
            <button type="button" onClick={onClose}>
              Done
            </button>
          </div>
          <SubAgentDetail agent={agent} done={done} />
        </div>
      )}
    </AppSheet>
  );
}

/** A skin's sub-agent sheet: `open(id)` from the row, and the sheet to render in the skin's screen. */
export function useSubAgentSheet(messages: Message[], present?: Transition) {
  const [id, setId] = useState<number | null>(null);
  const [shown, setShown] = useState(false);
  const m = messages.find((x): x is Extract<Message, { kind: 'subagent' }> => x.kind === 'subagent' && x.id === id);
  // The sheet keeps its agent while it slides away.
  const last = useRef<SubAgent | null>(null);
  if (m) last.current = m.agent;
  return {
    open: (next: number) => {
      setId(next);
      setShown(true);
    },
    sheet: <SubAgentSheet agent={last.current} done={m?.done ?? true} open={shown && !!m} onClose={() => setShown(false)} present={present} />,
  };
}

const META_SYMBOL = { routine: 'clock.arrow.trianglehead.counterclockwise.rotate.90', check: 'checkmark' } as const;

/** What the agent found, as a sideways row of cards; its pick is marked. */
export function ProductRow({ products, className }: { products: Product[]; className?: string }) {
  return (
    <div className={`${styles.products} ${className ?? ''}`}>
      {products.map((p) => (
        <div key={p.title} className={styles.product}>
          <img className={styles.productImage} src={p.image} alt="" />
          <span className={styles.productText}>
            <strong>{p.title}</strong>
            <small>
              {p.merchant}
              {p.rating && ` · ★ ${p.rating}`}
            </small>
            <span>{p.price}</span>
            {p.pick && <span className={styles.productPick}>Best match</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

/** A routine the agent set up, a rename: one small centered line. */
export function MetaLine({ meta, className }: { meta: AgentMeta; className?: string }) {
  return (
    <span className={`${styles.meta} ${className ?? ''}`}>
      <SfSymbol name={META_SYMBOL[meta.icon]} size={12} />
      {meta.text}
    </span>
  );
}

/** What the agent is doing right now, as a quiet line with a pulse. */
export function WorkLine({ status, className }: { status: string; className?: string }) {
  return (
    <span className={`${styles.work} ${className ?? ''}`}>
      <span className={styles.workDots} aria-hidden>
        <i />
        <i />
        <i />
      </span>
      {status}
    </span>
  );
}

/** The unread marker. */
export function Divider({ text, className }: { text: string; className?: string }) {
  return <span className={`${styles.divider} ${className ?? ''}`}>{text}</span>;
}

/** Quick replies: the visitor taps one, or the agent's pick lands on its own. */
export function ChipRow({
  chips,
  picked,
  expired,
  onPick,
  className,
}: {
  chips: Chip[];
  picked: number | null;
  expired?: boolean;
  onPick: (i: number) => void;
  className?: string;
}) {
  const settled = picked !== null || expired;
  return (
    <div className={`${styles.chips} ${className ?? ''}`} data-picked={settled || undefined}>
      {chips.map((c, i) => (
        <button
          key={c.label}
          type="button"
          className={styles.chip}
          data-picked={picked === i || undefined}
          disabled={settled}
          onClick={() => onPick(i)}
        >
          {c.flag ? <Flag code={c.flag} size={20} /> : c.icon ? <img src={c.icon} alt="" width={20} height={20} /> : null}
          {c.label}
        </button>
      ))}
    </div>
  );
}

/** Labels and flags for an ask's buttons in each state. An approval has no decline button (saying no declines it), so its one button reads the outcome either way. */
export function askButtons(ask: AgentAsk, state: AskState) {
  const settled = state === 'done' || state === 'denied' || state === 'expired';
  return {
    settled,
    allowLabel:
      state === 'done' ? (ask.allowed ?? 'Approved') : state === 'denied' && !ask.deny ? (ask.denied ?? 'Declined') : (ask.allow ?? 'Approve'),
    denyLabel: state === 'denied' ? (ask.denied ?? 'Declined') : (ask.deny ?? 'Not now'),
    pressing: state === 'pressing' || state === 'authing',
  };
}

export function AskCard({
  ask,
  state,
  onAllow,
  onDeny,
  className,
}: {
  ask: AgentAsk;
  state: AskState;
  onAllow: () => void;
  onDeny: () => void;
  className?: string;
}) {
  const b = askButtons(ask, state);
  return (
    <div className={`${styles.ask} ${className ?? ''}`}>
      <div className={styles.askTop}>
        <span className={styles.askTitle}>{ask.title}</span>
        {ask.amount && <strong className={styles.askAmount}>{ask.amount}</strong>}
      </div>
      {ask.who && (
        <div className={styles.askWho}>
          {ask.who.bank ? (
            <BankMark bank={ask.who.bank} country={ask.who.flag} size={36} />
          ) : (
            <span className={styles.askWhoMark}>
              {ask.who.flag ? (
                <Flag code={ask.who.flag} size={28} />
              ) : ask.who.icon ? (
                <img src={ask.who.icon} alt="" width={28} height={28} />
              ) : (
                ask.who.name[0]
              )}
            </span>
          )}
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
      <div className={styles.askActions} data-state={state}>
        {ask.deny && (
          <button
            type="button"
            className={styles.askDeny}
            data-chosen={state === 'denied' || undefined}
            disabled={b.settled || b.pressing}
            onClick={onDeny}
          >
            <TextMorph {...MORPH}>{b.denyLabel}</TextMorph>
          </button>
        )}
        <button
          type="button"
          className={styles.askAllow}
          data-pressing={b.pressing || undefined}
          data-done={state === 'done' || undefined}
          disabled={b.settled || b.pressing}
          onClick={onAllow}
        >
          <TextMorph {...MORPH}>{b.allowLabel}</TextMorph>
        </button>
      </div>
    </div>
  );
}
