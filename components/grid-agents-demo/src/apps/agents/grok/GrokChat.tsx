import { useEffect, useLayoutEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { animate, AnimatePresence, motion, type Transition } from 'motion/react';
import { IconArrowUp } from '@central-icons-react/round-outlined-radius-3-stroke-2/IconArrowUp';
import { IconCheckmark1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckmark1';
import { IconChevronGrabberVertical } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronGrabberVertical';
import { IconClock } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconClock';
import { IconGlobe } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconGlobe';
import { IconHome } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconHome';
import { IconPaperPlane } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPaperPlane';
import { IconSquareBehindSquare1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconSquareBehindSquare1';
import { IconWallet1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconWallet1';
import { IconTag } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconTag';
import { Flag } from '@/apps/shared/Flag';
import { ChatFrame, ComposerField, NATIVE_IN, ScrollEdge, STILL, useOpenedIds, useOpenedMarks, type RowMotion, type ScrollCause, type ScrollCurve } from '../ChatFrame';
import { GlassDisc, GlassPill, NoopButton, ScanGlyph } from '../glass';
import type { AgentAsk, AgentNote, Chip, Invoice, Message, Product } from '../conversation';
import { AskMark, BalanceCard, copyLabel, CopyCode, Divider, NoteCard, NoteMark, shortCode, SubAgentRow, useCardArrival, useCopy, useSubAgentSheet } from '../parts';
import { BankMark } from '../BankMark';
import { AppSheet } from '../sheet';
import { useAskSheet } from '../vault/useAskSheet';
import { bankDoneLabel } from '../vault/useBankPicker';
import { useGrokBalance } from './GrokBalance';
import { useGrokBank } from './GrokBank';
import type { AgentChatProps } from '../types';
import { GrokEyes } from './GrokEyes';
import styles from './GrokChat.module.scss';

/** Grok Bot's chat. */
const A = '/assets/agents/grok';
const mask = (src: string) => ({ maskImage: `url(${src})` });

type Ask = Extract<Message, { kind: 'ask' }>;

/** The composer turning into a card: critically damped, ~300ms (fitted: stiffness 975, damping 62). */
const COMPOSER_SPRING: Transition = { type: 'spring', stiffness: 975, damping: 62, mass: 1 };
/** The form sheet: cubic-bezier(0.30, 0.70, 0.20, 1) over 450ms. */
const SHEET_IN: Transition = { duration: 0.45, ease: [0.3, 0.7, 0.2, 1] };
/** The single-line composer's height (pt), where a sent bubble first shows, just above it. */
const COMPOSER_H = 50;
/**
 * Sending, as the app does it: the bubble shows at once just above the composer, mostly see-through, and rises into
 * its place as it fills in, ~170ms on an ease-out. The thread scrolls on the same curve, so the two move as one.
 */
const SENT_S = 0.17;
const SENT_EASE: [number, number, number, number] = [0, 0, 0.2, 1];
const SENT_SCROLL: ScrollCurve = { ms: SENT_S * 1000, ease: SENT_EASE };
/** The status row ("Thinking…", "Typing…") shows only once your bubble has landed: ~350ms after you send. */
const STATUS_AFTER_SEND_MS = 350;
/** A reply that was typing fills in from pale as it lifts into place (~120ms). */
const REPLY_IN: Transition = { duration: 0.12, ease: [0, 0, 0.2, 1] };
/** A question box rises in from below as it fades in, on the thread's own curve, so it moves even when the thread
 *  has room and doesn't scroll. */
const CHOICES_IN: RowMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, ease: [0.28, 0.05, 0.65, 1] },
};
/**
 * Grok's reaction: the emoji lands big (~30pt) in your bubble's bottom-right corner,
 * holds ~350ms, then shrinks to 15pt as it drops ~35pt onto the bubble's bottom edge, where a gray pill pops in
 * around it.
 */
const REACT_LAND = 0.57;
const REACT_EMOJI: Transition = { duration: REACT_LAND, times: [0, 0.175, 0.65, 0.91, 1], ease: 'easeInOut' };
const REACT_PILL: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 22,
  mass: 0.7,
  delay: REACT_LAND - 0.05,
  opacity: { duration: 0.08, ease: 'easeOut', delay: REACT_LAND - 0.05 },
};

/** `still`: it was already there when the app opened, so it doesn't land again. */
function Reaction({ emoji, still }: { emoji: string; still: boolean }) {
  return (
    <span className={styles.react}>
      <motion.span
        className={styles.reactPill}
        initial={still ? false : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={REACT_PILL}
      />
      <motion.span
        className={styles.reactEmoji}
        initial={still ? false : { opacity: 0, scale: 0.75, y: -35 }}
        animate={{ opacity: [0, 1, 1, 1, 1], scale: [0.75, 1, 1, 0.55, 0.5], y: [-35, -35, -35, -3, 0] }}
        transition={REACT_EMOJI}
      >
        {emoji}
      </motion.span>
    </span>
  );
}

/** Grok's thread: the status row's swap to Typing… jumps; your sent bubble rises with its own curve; everything else
 *  rises on the shared ease-in-out. */
const grokScroll = (cause: ScrollCause): ScrollCurve =>
  cause === 'typing' ? 'snap' : cause === 'me' ? SENT_SCROLL : { ms: 280, ease: [0.28, 0.05, 0.65, 1] };

/**
 * Your just-sent bubble: drawn first just above the composer, then carried to its place in the thread on the same
 * curve the thread scrolls on, so wherever its place is (pinned to the foot or under the last message), it travels
 * there in one move.
 */
function SentRise({ rise, children }: { rise: boolean; children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    const composer = el?.closest('[data-thread]')?.parentElement?.querySelector('[data-composer]');
    if (!rise || !el || !composer) return;
    // Measured where it sits in the thread, not where a previous run of this effect had moved it.
    el.style.transform = '';
    const r = el.getBoundingClientRect();
    // The phone is scaled to fit the page; transforms are in its own px.
    const k = r.height / el.offsetHeight || 1;
    const start = composer.getBoundingClientRect().bottom - COMPOSER_H * k - 4 * k - r.height;
    const y = (start - r.top) / k;
    // Placed before the first paint, so it never flashes in its final spot.
    el.style.transform = `translateY(${y}px)`;
    el.style.opacity = '0.25';
    const run = animate(el, { y: [y, 0], opacity: [0.25, 1] }, { duration: SENT_S, ease: SENT_EASE });
    return () => run.stop();
  }, [rise]);
  return (
    <span ref={ref} className={styles.sentRise}>
      {children}
    </span>
  );
}

/**
 * A Grok bubble: a pill while it's one line, 20pt corners once it wraps (ChatFrame shapes it), and
 * tighter corners where it meets another bubble from the same sender.
 */
function Bubble({ className, up, down, children }: { className: string; up: boolean; down: boolean; children: ReactNode }) {
  return (
    <div className={className} data-bubble data-up={up || undefined} data-down={down || undefined}>
      {children}
    </div>
  );
}

/** Whether the bubble above or below is the same sender's. */
function neighbors(i: number, all: Message[], kind: 'them' | 'me') {
  const same = (m?: Message) => !!m && m.kind === kind && !(m.kind === 'them' && m.typing);
  return { up: same(all[i - 1]), down: same(all[i + 1]) };
}

/** The status label with Grok's dark shimmer band sweeping across it. */
function Shimmer({ children }: { children: string }) {
  return <span className={styles.shimmer}>{children}</span>;
}

/** What the bot is doing: its face, then the label, at the thread's foot. */
function StatusRow({ label, typing }: { label: string; typing?: boolean }) {
  return (
    <div className={styles.status}>
      {typing ? (
        <span className={styles.typingDots} aria-hidden>
          <i />
          <i />
          <i />
        </span>
      ) : (
        <GrokEyes size={26} />
      )}
      <Shimmer>{label}</Shimmer>
    </div>
  );
}

/** Lettered options in a white card, with the hint to answer in the chat instead. */
function ChoiceCard({ m, onPick }: { m: Extract<Message, { kind: 'chips' }>; onPick: (i: number) => void }) {
  const done = m.picked !== null || m.expired;
  return (
    <div className={styles.choiceWrap}>
      <div className={styles.choice} data-done={done || undefined}>
        {m.chips.map((c: Chip, i) => (
          <button
            key={c.label}
            type="button"
            className={styles.option}
            data-chip
            data-picked={m.picked === i || undefined}
            disabled={done}
            onClick={() => onPick(i)}
          >
            <span className={styles.key}>{String.fromCharCode(65 + i)}</span>
            {c.flag && <Flag code={c.flag} size={18} />}
            {c.label}
          </button>
        ))}
      </div>
      {!done && <span className={styles.hint}>Or answer in the chat below</span>}
    </div>
  );
}

/** What the bot found: a sideways carousel of product cards. */
function Products({ products, fresh }: { products: Product[]; fresh: boolean }) {
  const arrive = useCardArrival(fresh, products.length);
  return (
    <div className={styles.products}>
      {products.map((p, i) => (
        <motion.div key={p.title} className={styles.product} {...arrive(i)}>
          <span className={styles.productImage}>
            <img src={p.image} alt="" />
          </span>
          <span className={styles.productText}>
            <strong>{p.title}</strong>
            {p.detail ? <small>{p.detail}</small> : p.rating && <small>★ {p.rating}</small>}
            <span>{p.price}</span>
            <span className={styles.productMerchant}>
              <i>{p.merchant[0]}</i>
              {p.merchant}
            </span>
          </span>
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Something settled that has no order card of its own (money that came in, a payment that went out by itself): drawn
 * as the card a finished order gets, who it was with at its head, as wide as what it says.
 */
function GrokReceipt({ note }: { note: AgentNote }) {
  const status = note.stats?.find((s) => s.label === 'Status')?.value ?? 'Settled';
  return (
    <div className={`${styles.order} ${styles.receipt}`} data-state="done">
      <div className={styles.orderHead}>
        {note.who ? (
          <NoteMark note={note} size={22} round={!note.who.icon && !note.who.bank} />
        ) : (
          <span className={styles.orderTile}>
            <IconCheckmark1 size={12} />
          </span>
        )}
        <span>{note.who?.name ?? note.title}</span>
        <small>{status}</small>
      </div>
      <strong className={styles.orderTitle}>{note.title}</strong>
      {note.lines.length > 0 && <span className={styles.orderSub}>{note.lines.join(' · ')}</span>}
      <div className={styles.track} data-full>
        <span className={styles.trackEnd}>
          <IconPaperPlane size={12} />
        </span>
        <span className={styles.trackBar}>
          <i />
        </span>
        <span className={styles.trackMark}>
          <IconCheckmark1 size={12} />
        </span>
      </div>
    </div>
  );
}

/** Consent and limits: a form card; Continue opens the sheet, and once sent it folds to one line. */
function FormCard({ m, onOpen }: { m: Ask; onOpen: () => void }) {
  const f = m.ask.form!;
  if (m.state !== 'open') {
    const submitted = m.ask.bank ? bankDoneLabel(m.ask) : f.submitted;
    const label =
      m.state === 'denied' ? 'Canceled' : m.state === 'expired' ? 'Expired' : m.state === 'done' ? submitted : 'Submitting…';
    return (
      <div className={styles.formDone}>
        <IconGlobe size={16} />
        <span>Form</span>
        <small>{label}</small>
        <IconChevronGrabberVertical size={14} />
      </div>
    );
  }
  return (
    <div className={styles.form}>
      <span className={styles.formKind}>
        <IconGlobe size={16} />
        Form
      </span>
      <strong>{f.title}</strong>
      <span className={styles.formSub}>{f.sub}</span>
      <button type="button" className={styles.continue} onClick={onOpen} data-opens-sheet>
        Continue
      </button>
    </div>
  );
}

/** Where to send money, as Grok's form card: what it is, the code in a field with a copy glyph where the card
 *  number's scan glyph sits, and what to know under it. The whole field copies. */
function AddressForm({ note }: { note: AgentNote }) {
  const code = note.code ?? '';
  const { copied, copy } = useCopy(code);
  return (
    <div className={styles.form}>
      <span className={styles.formKind}>
        <IconWallet1 size={16} />
        {note.glyph === 'bank' ? 'Bank transfer' : note.glyph === 'bolt' ? 'Lightning invoice' : 'Deposit address'}
      </span>
      <strong>{note.title}</strong>
      <button type="button" className={`${styles.input} ${styles.addressField}`} onClick={copy} aria-label={copied ? 'Copied' : copyLabel(note)}>
        <code>{shortCode(code)}</code>
        {copied ? <IconCheckmark1 size={18} /> : <IconSquareBehindSquare1 size={18} />}
      </button>
      {note.lines.map((l) => (
        <span key={l} className={styles.addressLine}>
          {l}
        </span>
      ))}
    </div>
  );
}

/** The form's sheet: Cancel, the title and a blue Done; the fields come filled in. */
function FormSheet({ ask, onCancel, onDone }: { ask: AgentAsk; onCancel: () => void; onDone: () => void }) {
  const f = ask.form!;
  const [on, setOn] = useState(true);
  return (
    <div className={styles.sheet}>
      <div className={styles.sheetBar}>
        <button type="button" className={styles.sheetButton} onClick={onCancel}>
          <GlassPill radius={21.33} tint="var(--grok-pill)">
            <span className={styles.sheetLabel}>Cancel</span>
          </GlassPill>
        </button>
        <strong>{f.sheetTitle}</strong>
        <button type="button" className={`${styles.sheetButton} ${styles.sheetDone}`} onClick={onDone}>
          <GlassPill radius={21.33} tone="blue">
            <span className={styles.sheetLabel}>Done</span>
          </GlassPill>
        </button>
      </div>
      <div className={styles.fields}>
        {f.fields.map((x, i) => (
          <label key={x.label} className={styles.field}>
            <span>{x.label}</span>
            <span className={styles.input}>
              {x.value}
              {ask.card && i === 0 && <ScanGlyph />}
            </span>
          </label>
        ))}
        {f.toggle && (
          <button type="button" className={styles.toggleRow} onClick={() => setOn((v) => !v)} aria-pressed={on}>
            {f.toggle}
            <span className={styles.switch} data-on={on || undefined}>
              <i />
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

/** Money out: the order card, Pay in black; it collapses while it pays, then tracks. */
/** An invoice as Grok's order card: the business, what happened to it, and (still open) the details to pay it at. */
function GrokInvoice({ invoice }: { invoice: Invoice }) {
  const paid = invoice.status === 'paid';
  return (
    <div className={styles.order} data-state="done">
      <div className={styles.orderHead}>
        <span className={styles.orderTile}>
          <span>{invoice.from[0]}</span>
        </span>
        <span>{invoice.from}</span>
        <small>{invoice.number}</small>
      </div>
      <strong className={styles.orderTitle}>{paid ? 'Invoice paid' : 'Invoice sent'}</strong>
      <span className={styles.orderSub}>{paid ? `${invoice.amount} from ${invoice.to}, by bank transfer` : `To ${invoice.to}`}</span>
      {paid ? (
        <div className={styles.track} data-full>
          <span className={styles.trackEnd}>
            <IconPaperPlane size={12} />
          </span>
          <span className={styles.trackBar}>
            <i />
          </span>
          <span className={styles.trackMark}>
            <IconCheckmark1 size={12} />
          </span>
        </div>
      ) : (
        <>
          <div className={styles.orderLines}>
            <span>Amount</span>
            <strong>{invoice.amount}</strong>
            <span>Due</span>
            <span>{invoice.due}</span>
            <span>For</span>
            <span>{invoice.memo}</span>
          </div>
          <div className={styles.orderLines}>
            <span>Bank</span>
            <span>{invoice.bank}</span>
            <span>Routing</span>
            <span>{invoice.routing}</span>
          </div>
          <CopyCode value={invoice.account} />
        </>
      )}
    </div>
  );
}

function OrderCard({ m, onAllow, onDeny }: { m: Ask; onAllow: () => void; onDeny: () => void }) {
  const { ask, state } = m;
  const who = ask.who;
  // Something it can say better than "Your order is confirmed" (a bill, a booking) says that instead.
  const order = !ask.settled && (!!who?.icon || ask.allowed === 'Approved');
  const placing = state === 'pressing' || state === 'authing';
  // A bank's mark is its own tile (an app icon with the flag hanging off it), so it skips the outlined one.
  const tile = who?.bank ? (
    <BankMark bank={who.bank} country={who.flag} size={22} />
  ) : who?.icon || !who ? (
    <AskMark ask={ask} size={22} round={!who} />
  ) : (
    <span className={styles.orderTile}>{who?.flag ? <Flag code={who.flag} size={20} /> : <span>{who?.mark ?? (who?.name ?? ask.title)[0]}</span>}</span>
  );
  const method = ask.method?.replace(/^From /, '');
  return (
    <div className={styles.order} data-state={state}>
      <div className={styles.orderHead}>
        {tile}
        <span>{who?.name ?? ask.title}</span>
        {state === 'done' && <small>{order ? 'PRP9GNCWF' : (ask.settled?.status ?? 'Settled')}</small>}
      </div>
      {state === 'done' ? (
        <>
          <strong className={styles.orderTitle}>{order ? 'Your order is confirmed' : (ask.settled?.title ?? 'Payment sent')}</strong>
          <span className={styles.orderSub}>{ask.settled?.detail ?? who?.detail.split(' · ')[0] ?? ask.title}</span>
          <div className={styles.track} data-full={!order || undefined}>
            <span className={styles.trackEnd}>
              <IconPaperPlane size={12} />
            </span>
            <span className={styles.trackBar}>
              <i />
            </span>
            <span className={styles.trackMark}>{order ? <IconTag size={12} /> : <IconCheckmark1 size={12} />}</span>
            {order && (
              <span className={styles.trackEnd}>
                <IconHome size={12} />
              </span>
            )}
          </div>
        </>
      ) : (
        <>
          <div className={styles.orderItem}>
            {who?.icon && <img src={who.icon} alt="" />}
            <span>
              <strong>{ask.title}</strong>
              <small>{who?.detail}</small>
            </span>
          </div>
          {state === 'open' && (
            <>
              <div className={styles.orderLines}>
                <span>Total</span>
                <strong>{ask.amount}</strong>
                {method && (
                  <>
                    <span>Pay with</span>
                    <span>{method}</span>
                  </>
                )}
              </div>
              <div className={styles.orderActions}>
                {ask.deny && (
                  <button type="button" className={styles.cancel} onClick={onDeny}>
                    {ask.deny}
                  </button>
                )}
                <button type="button" className={styles.pay} onClick={onAllow}>
                  Pay {ask.amount}
                </button>
              </div>
            </>
          )}
          {placing && (
            <span className={styles.orderFoot}>
              <Shimmer>{order ? 'Placing your order…' : 'Sending…'}</Shimmer>
            </span>
          )}
          {(state === 'denied' || state === 'expired') && (
            <span className={styles.orderFoot}>{state === 'denied' ? 'Canceled. Nothing was charged.' : 'This request expired.'}</span>
          )}
        </>
      )}
    </div>
  );
}

/** A receipt right after the order card it settles would say it twice; the card already tracks it. */
function settledByOrder(i: number, all: Message[]) {
  for (let j = i - 1; j >= 0; j--) {
    const m = all[j];
    if (m.kind === 'me') return false;
    if (m.kind === 'ask') return m.state === 'done' && !m.ask.form;
  }
  return false;
}

export function GrokChat({ chat }: AgentChatProps) {
  const [multiline, setMultiline] = useState(false);
  const reactedAtOpen = useOpenedMarks();
  const openedIds = useOpenedIds(chat.messages);
  /** Replies that showed Typing… first: they fill in when the text lands. */
  const typedIds = useRef(new Set<number>());
  /** When your last message went: until it has landed, the thread follows it and the status row waits. */
  const sentIds = useRef(new Set<number>());
  const sentAt = useRef(-Infinity);
  const [, redraw] = useReducer((n: number) => n + 1, 0);
  const statusTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(statusTimer.current), []);
  /** A status row that came in with your message holds its (empty) place until the bubble lands. */
  const statusOr = (row: ReactNode) => {
    const wait = STATUS_AFTER_SEND_MS - (performance.now() - sentAt.current);
    if (wait <= 0) return row;
    window.clearTimeout(statusTimer.current);
    statusTimer.current = window.setTimeout(redraw, wait);
    return <div className={styles.statusSlot} aria-hidden />;
  };
  // The sheet keeps its ask while it slides away.
  const bank = useGrokBank({ messages: chat.messages, onAllow: chat.allow });
  const balance = useGrokBalance({ account: chat.account, onAction: chat.prompt });
  const form = useAskSheet(chat.messages, (a) => !!a.form && !a.bank);
  const working = chat.busy || chat.messages.some((m) => m.kind === 'work');
  const sub = useSubAgentSheet(chat.messages, SHEET_IN);

  const render = (m: Message, i: number, all: Message[]) => {
    switch (m.kind) {
      case 'them':
        if (m.typing) {
          typedIds.current.add(m.id);
          return statusOr(<StatusRow label="Typing…" typing />);
        }
        return (
          <motion.div
            className={styles.reply}
            initial={typedIds.current.has(m.id) ? { opacity: 0.3, y: 6 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={REPLY_IN}
          >
            {m.sender && <span className={styles.sender}>{m.sender}</span>}
            <Bubble className={styles.bubble} {...neighbors(i, all, 'them')}>
              {m.text}
            </Bubble>
          </motion.div>
        );
      case 'me':
        if (!openedIds.has(m.id) && !sentIds.current.has(m.id)) {
          sentIds.current.add(m.id);
          sentAt.current = performance.now();
        }
        return (
          <SentRise rise={!openedIds.has(m.id)}>
            <span className={styles.meWrap} data-reacted={m.react ? true : undefined}>
              <Bubble className={styles.me} {...neighbors(i, all, 'me')}>
                {m.text}
              </Bubble>
              {m.react && <Reaction emoji={m.react} still={reactedAtOpen(`react-${m.id}`)} />}
            </span>
          </SentRise>
        );
      case 'ask':
        return m.ask.form ? (
          <FormCard
            m={m}
            onOpen={() => {
              if (m.ask.bank) return bank.open(m.id, m.ask);
              form.show(m.id, m.ask);
            }}
          />
        ) : (
          <OrderCard m={m} onAllow={chat.allow} onDeny={chat.deny} />
        );
      case 'card': {
        const b = m.card.balance;
        if (b) {
          return (
            <BalanceCard
              balance={b}
              className={styles.accountSkin}
              onOpen={() => balance.open(b.wallet)}
            />
          );
        }
        if (m.card.done && settledByOrder(i, all)) return null;
        if (m.card.invoice) return <GrokInvoice invoice={m.card.invoice} />;
        if (m.card.code) return <AddressForm note={m.card} />;
        if (m.card.done && !m.card.rows) return <GrokReceipt note={m.card} />;
        return <NoteCard note={m.card} className={styles.note} />;
      }
      case 'chips':
        return <ChoiceCard m={m} onPick={chat.pick} />;
      case 'work':
        return statusOr(<StatusRow label={m.status} />);
      case 'products':
        return <Products products={m.products} fresh={!openedIds.has(m.id)} />;
      case 'meta':
        // The folded form already reads what was saved.
        if (m.meta.icon === 'check' && all[i - 1]?.kind === 'ask') return null;
        return (
          <span className={styles.meta}>
            <IconClock size={13} />
            {m.meta.text.replace(/ · .*/, '')}
          </span>
        );
      case 'divider':
        return <Divider text={m.text} className={styles.divider} />;
      case 'tag':
      case 'stamp':
        return <span className={styles.stamp}>{m.text}</span>;
      case 'subagent':
        return <SubAgentRow className={styles.subRow} agent={m.agent} done={m.done} onOpen={() => sub.open(m.id)} />;
      // Only Duet labels a run.
      case 'eyebrow':
        return null;
      default: {
        const exhaustive: never = m;
        return exhaustive;
      }
    }
  };

  const hasText = chat.composer.trim().length > 0;
  // Just sent: the status row's place under your bubble is held open, so it lands without moving anything.
  const awaiting = chat.messages[chat.messages.length - 1]?.kind === 'me';

  return (
    <div className={styles.stage}>
      <ChatFrame
        verify={{ app: 'grok', chat }}
        className={styles.screen}
        messages={chat.messages}
        render={render}
        // Your bubble moves itself (SentRise); a question box rises in.
        rowMotion={(m) => (m.kind === 'me' ? STILL : m.kind === 'chips' ? CHOICES_IN : NATIVE_IN)}
        // Whatever came in with your message (its status row), the thread carries your bubble up on the sent curve.
        scroll={(cause) => (performance.now() - sentAt.current < STATUS_AFTER_SEND_MS ? SENT_SCROLL : grokScroll(cause))}
        foot={awaiting ? <div className={styles.statusSlot} aria-hidden /> : undefined}
        faceId={chat.authing}
        onFaceIdDone={chat.authed}
        gap={9}
        threadTop={124}
        composerBottom={26}
        composerHeight={50}
        edge={<ScrollEdge className={styles.edge} />}
        header={
          <>
            <NoopButton label="Back" className={styles.back}>
              <GlassDisc label="Back" icon={`${A}/back.svg`} width={12} height={20} />
            </NoopButton>
            <NoopButton label="More" className={styles.more}>
              <GlassDisc label="More" icon={`${A}/ellipsis.svg`} width={18} height={4} />
            </NoopButton>
            <GlassPill radius={22} absolute className={styles.title}>
              <span className={styles.titleRow}>
                <GrokEyes size={26} header live={working} />
                Grok Bot
              </span>
            </GlassPill>
          </>
        }
        composer={
          <motion.div layout transition={COMPOSER_SPRING} className={styles.composerBox} style={{ borderRadius: multiline ? 24 : 25 }}>
            <GlassPill radius={multiline ? 24 : 25} className={styles.composer}>
              <span className={styles.composerGrid} data-multiline={multiline || undefined}>
                <motion.span layout="position" transition={COMPOSER_SPRING} className={styles.plus}>
                  <span className={styles.glyph} style={{ ...mask(`${A}/plus.svg`), width: 14, height: 14 }} />
                </motion.span>
                <motion.span layout="position" transition={COMPOSER_SPRING} className={styles.fieldSlot}>
                  <ComposerField chat={chat} placeholder="Message Grok Bot" className={styles.fieldText} onMultiline={setMultiline} />
                </motion.span>
                <motion.span layout="position" transition={COMPOSER_SPRING} className={styles.tools}>
                  <span className={styles.micDisc}>
                    <span className={styles.glyph} style={{ ...mask(`${A}/mic.svg`), width: 12, height: 17 }} />
                  </span>
                  <span
                    className={styles.voice}
                    role="button"
                    aria-label={hasText ? 'Send' : 'Voice'}
                    onClick={chat.send}
                    data-ready={chat.canSend || undefined}
                  >
                    <AnimatePresence initial={false} mode="popLayout">
                      {hasText ? (
                        <motion.span key="send" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.15 }} className={styles.voiceIcon}>
                          <IconArrowUp size={18} />
                        </motion.span>
                      ) : (
                        <motion.span key="wave" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.15 }} className={styles.voiceIcon}>
                          <span className={styles.voiceGlyph} style={{ ...mask(`${A}/waveform.svg`), width: 16, height: 14 }} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                </motion.span>
              </span>
            </GlassPill>
          </motion.div>
        }
      />
      <AppSheet open={form.open} present={SHEET_IN} dim={0.2} className={styles.sheetPanel} onDismiss={form.hide}>
        {form.ask && (
          <FormSheet
            ask={form.ask}
            onCancel={() => {
              form.hide();
              chat.deny();
            }}
            onDone={() => {
              form.hide();
              chat.allow();
            }}
          />
        )}
      </AppSheet>
      {sub.sheet}
      {bank.sheet}
      {balance.sheet}
    </div>
  );
}
