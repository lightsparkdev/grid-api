import { useEffect, useRef, useState } from 'react';
import { TextMorph } from 'torph/react';
import type { Transition } from 'motion/react';
import { IconCheckmark1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckmark1';
import { IconChevronRight } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronRight';
import { IconSquareBehindSquare1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconSquareBehindSquare1';
import { Flag } from '@/apps/shared/Flag';
import { BankMark } from './BankMark';
import { SfSymbol } from '@/apps/shared/icons';
import { cubicBezierCss, easeOutSnappy } from '@/lib/easing';
import type { AgentAsk, AgentBalance, AgentMeta, AgentNote, AskRow, AskState, Chip, Invoice, Message, Product, SubAgent } from './conversation';
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

/** Avatar fills for people and businesses without a picture: strong enough for white initials on any skin. */
const TINTS = ['#e8613c', '#2f9e55', '#2f7cf6', '#9b59e8', '#e2457a', '#d98a12', '#1597ad', '#5b67d8'];

/** The same person or business always gets the same fill. */
export function tintFor(seed: string) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TINTS[h % TINTS.length];
}

/** An ask row's lead: its image, or a symbol the playground has. */
export function RowGlyph({ row, size = 18 }: { row: AskRow; size?: number }) {
  if (row.image) return <img className={styles.rowImage} src={row.image} alt="" width={32} height={32} />;
  if (row.initials)
    return (
      <span className={styles.rowInitials} style={{ background: tintFor(row.text), color: '#fff' }}>
        {row.initials}
      </span>
    );
  const icon = row.icon;
  if (icon && icon in ROW_SYMBOL) return <SfSymbol name={ROW_SYMBOL[icon as keyof typeof ROW_SYMBOL]} size={size} />;
  return <span className={styles.rowDot} />;
}

/**
 * Who an ask is with, as a picture at `size`: their logo, their bank's with their flag on it, their flag, or their
 * initial on a colored tile. An ask with rows and no counterparty shows its first row (payroll's first person).
 */
export function AskMark({ ask, size = 32, round }: { ask: AgentAsk; size?: number; round?: boolean }) {
  const who = ask.who;
  const radius = round ? '50%' : `${Math.round(size * 0.24)}px`;
  const tile = { width: size, height: size, borderRadius: radius };
  if (who?.icon) return <img className={styles.markLogo} src={who.icon} alt="" style={tile} draggable={false} />;
  if (who?.bank) return <BankMark bank={who.bank} country={who.flag} size={size} />;
  if (who?.flag) return <Flag code={who.flag} size={size} />;
  const row = ask.rows?.[0];
  if (!who && row?.image) return <img className={styles.markLogo} src={row.image} alt="" style={tile} draggable={false} />;
  const name = who?.name ?? row?.text ?? ask.title;
  const letter = who?.mark ?? row?.initials ?? name[0];
  return (
    <span className={styles.markLetter} style={{ ...tile, background: tintFor(name), fontSize: Math.round(size * (letter.length > 1 ? 0.36 : 0.44)) }}>
      {letter}
    </span>
  );
}

/** What copying a note's code is called, by what it is. */
export const copyLabel = (note: AgentNote) => (note.glyph === 'bank' ? 'Copy account number' : note.glyph === 'bolt' ? 'Copy invoice' : 'Copy address');

/**
 * A QR code's look for an address: finder squares in three corners and modules from a hash of the value, so each
 * address draws its own. It doesn't scan; the addresses are made up too.
 */
export function AddressQr({ value, size = 140 }: { value: string; size?: number }) {
  const n = 25;
  let h = 2166136261;
  const bits: boolean[] = [];
  for (let i = 0; i < n * n; i++) {
    h ^= value.charCodeAt(i % value.length) + i;
    h = Math.imul(h, 16777619) >>> 0;
    bits.push((h & 0b1000) !== 0);
  }
  const finder = (x: number, y: number) => x < 8 && y < 8;
  const inFinder = (x: number, y: number) => finder(x, y) || finder(n - 1 - x, y) || finder(x, n - 1 - y);
  const cells: string[] = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!inFinder(x, y) && bits[y * n + x]) cells.push(`M${x} ${y}h1v1h-1z`);
  const eye = (x: number, y: number) => `M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5zM${x + 2} ${y + 2}h3v3h-3z`;
  return (
    <svg className={styles.qr} viewBox={`-1 -1 ${n + 2} ${n + 2}`} width={size} height={size} role="img" aria-label="QR code">
      <path d={`${cells.join('')}${eye(0, 0)}${eye(n - 7, 0)}${eye(0, n - 7)}`} fillRule="evenodd" />
    </svg>
  );
}

/** An address or invoice, shortened in the middle the way wallets show them. Account numbers are short enough as is. */
export const shortCode = (value: string) => (value.length > 24 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value);

/** Whether a copy just happened, for its "Copied": copies the whole value, and settles back after a moment. */
export function useCopy(value: string) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = () => {
    void navigator.clipboard
      ?.writeText(value)
      .then(() => {
        setCopied(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  };
  return { copied, copy };
}

/** An address, invoice or account number to take away: the whole row copies it. */
export function CopyCode({ value }: { value: string }) {
  const { copied, copy } = useCopy(value);
  return (
    <button type="button" className={styles.code} onClick={copy} aria-label={copied ? 'Copied' : `Copy ${value}`}>
      <code>{shortCode(value)}</code>
      <span className={styles.codeCopy} data-copied={copied || undefined}>
        {copied ? <IconCheckmark1 size={14} /> : <IconSquareBehindSquare1 size={14} />}
        {copied ? 'Copied' : 'Copy'}
      </span>
    </button>
  );
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
      {note.code && <CopyCode value={note.code} />}
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
 * An invoice as a document: the amount and when it's due, who it's from and to, and the bank details to pay it at, the
 * account number copyable. In the skin's `--part-*` tokens; `--doc-serif` sets the title and amount in an app's serif.
 */
export function InvoiceCard({ invoice, className }: { invoice: Invoice; className?: string }) {
  const paid = invoice.status === 'paid';
  return (
    <div className={`${styles.invoice} ${className ?? ''}`}>
      <span className={styles.invoiceHead}>
        <span className={styles.invoiceTitle}>Invoice {invoice.number}</span>
        <span className={styles.invoiceStatus} data-paid={paid || undefined}>
          {paid ? 'Paid' : 'Open'}
        </span>
      </span>
      <strong className={styles.invoiceAmount}>{invoice.amount}</strong>
      <span className={styles.invoiceDue}>{paid ? 'Paid by bank transfer' : `Due ${invoice.due}`}</span>
      <dl className={styles.invoiceRows}>
        <dt>From</dt>
        <dd>{invoice.from}</dd>
        <dt>To</dt>
        <dd>{invoice.to}</dd>
        <dt>For</dt>
        <dd>{invoice.memo}</dd>
      </dl>
      {!paid && (
        <div className={styles.invoicePay}>
          <span className={styles.invoicePayLabel}>Pay by bank transfer</span>
          <dl className={styles.invoiceRows}>
            <dt>Bank</dt>
            <dd>{invoice.bank}</dd>
            <dt>Routing</dt>
            <dd>{invoice.routing}</dd>
            <dt>Reference</dt>
            <dd>{invoice.number}</dd>
          </dl>
          <CopyCode value={invoice.account} />
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
  onOpen,
  className,
}: {
  balance: AgentBalance;
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
      {agent.logo ? <img className={`${styles.subMark} ${styles.subLogo}`} src={agent.logo} alt="" draggable={false} /> : <span className={styles.subMark}>{agent.initial}</span>}
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
              {p.detail ? ` · ${p.detail}` : p.rating && ` · ★ ${p.rating}`}
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
                (ask.who.mark ?? ask.who.name[0])
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
