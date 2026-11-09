import { Fragment, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, type Transition } from 'motion/react';
import { IconArrowCornerDownRight } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowCornerDownRight';
import { IconArrowUp } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowUp';
import { IconCheckCircle2 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckCircle2';
import { IconCheckmark1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckmark1';
import { IconChevronDownSmall } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronDownSmall';
import { IconCreditCard1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCreditCard1';
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossMedium';
import { IconReceiptBill } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconReceiptBill';
import { IconRepeat } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconRepeat';
import { IconSettingsSliderHor } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconSettingsSliderHor';
import { Flag } from '@/apps/shared/Flag';
import {
  ChatFrame,
  ComposerField,
  NATIVE_IN,
  STILL,
  ScrollEdge,
  useOpenedIds,
  type ScrollCause,
  type ScrollCurve,
} from '../ChatFrame';
import { GlassButton, GlassDisc, GlassPill, NoopButton } from '../glass';
import { SheetDisc } from '../SheetPage';
import type { AgentAsk, AgentMeta, AgentNote, Message, PayTo, Product } from '../conversation';
import { linkedBank } from '../linkedBank';
import { recipientNamed } from '../recipients';
import { AddressQr, BalanceCard, copyLabel, Divider, NoteCard, SubAgentRow, useCopy, useSubAgentSheet } from '../parts';
import { BankMark } from '../BankMark';
import { AppSheet } from '../sheet';
import { useAskSheet } from '../vault/useAskSheet';
import { cardLabel } from '../vault/useCardEntry';
import { useDotBalance } from './DotBalance';
import { DotGlyph, useDotBank, useDotCard } from './DotVault';
import { ADDRESS, PERSON } from '../story';
import type { AgentChatProps } from '../types';
import styles from './DotChat.module.scss';

/** Dots, rebuilt from recordings 3, 5, 7 and 8 (refs/dots/spec.md). */
const A = '/assets/agents/dot';
const mask = (src: string, width: number, height: number) => ({ maskImage: `url(${src})`, width, height });

type Ask = Extract<Message, { kind: 'ask' }>;

/** The sheet rising: fast start, long ease, no overshoot (fitted from recording 7, ~500ms). */
const SHEET_IN: Transition = { duration: 0.5, ease: [0.12, 1, 0.6, 1] };
/** The composer turning into a card (~120ms in recording 3). */
const CARD: Transition = { duration: 0.12, ease: [0.25, 0.1, 0.25, 1] };
/** The send grows in where the mic was while the mic steps left, in three frames (recording 23-04-09). */
const SEND_IN: Transition = { duration: 0.05, ease: 'easeOut' };
/** How long the pay sheet shows "Preparing your checkout…". */
const PREPARING_MS = 900;

/** The agent's markdown: **bold** runs, and lines starting "- " as bullets. */
function Markdown({ text }: { text: string }) {
  const inline = (line: string) =>
    line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>,
    );
  const lines = text.split('\n');
  const out: ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (!bullets.length) return;
    out.push(
      <ul key={`ul-${out.length}`}>
        {bullets.map((b, i) => (
          <li key={i}>{inline(b)}</li>
        ))}
      </ul>,
    );
    bullets = [];
  };
  for (const line of lines) {
    if (line.startsWith('- ')) bullets.push(line.slice(2));
    else {
      flush();
      if (line.trim()) out.push(<p key={`p-${out.length}`}>{inline(line)}</p>);
    }
  }
  flush();
  return <>{out}</>;
}

/** What dot found, as its markdown list. */
function productsText(products: Product[]) {
  return products.map((p) => `- **${p.title}**, ${p.price} at ${p.merchant}${p.pick && products.length > 1 ? ' (my pick)' : ''}`).join('\n');
}

/** Dots' mark: the blue blob, as the logo in its sheets and pills. */
function DotsMark({ size }: { size: number }) {
  return (
    <span className={styles.mark} style={{ width: size, height: size }}>
      <img src={`${A}/body.png`} alt="" />
    </span>
  );
}

/**
 * Dots' action pill (IMG_1891, IMG_1906): light blue, 48pt, a 20pt blue glyph, the blue label and a chevron.
 * Once done the glyph gives way to what it set up (the bank's flag, Dots' mark) and a check takes the chevron's place.
 */
function Pill({ m, lead, label, done, onOpen }: { m: Ask; lead: ReactNode; label: string; done: ReactNode; onOpen: () => void }) {
  const { state } = m;
  const pending = state === 'pressing' || state === 'authing';
  return (
    <button type="button" className={styles.pill} data-state={state} disabled={state !== 'open'} onClick={onOpen} data-opens-sheet>
      <span className={styles.pillLead}>{state === 'done' ? done : lead}</span>
      <span className={styles.pillLabel}>{label}</span>
      {pending ? (
        <i className={styles.spinner} />
      ) : state === 'done' ? (
        <IconCheckmark1 size={18} className={styles.pillCheck} />
      ) : state === 'open' ? (
        <span className={styles.chevron} />
      ) : null}
    </button>
  );
}

/** A request to set something up (a bank, a card, turning on the account): its pill, which opens the sheet. */
function ActionPill({ m, onOpen }: { m: Ask; onOpen: () => void }) {
  const { ask, state } = m;
  const kind = ask.bank ? 'bank' : ask.card ? 'card' : null;
  const payee = ask.recipient ? recipientNamed(ask.recipient.name) : undefined;
  const label =
    state === 'done'
      ? ask.recipient
        ? `${ask.recipient.first}’s ${payee?.bank.bankName ?? 'bank'}`
        : ask.bank
          ? `${linkedBank().bankName} •••• ${linkedBank().last4}`
          : ask.card
            ? cardLabel(ask)
            : (ask.allowed ?? 'Done')
      : state === 'denied'
        ? (ask.denied ?? 'Not now')
        : (ask.form?.title ?? ask.title);
  const flag = ask.recipient?.country ?? (ask.bank ? linkedBank().country.code : null);
  return (
    <Pill
      m={m}
      lead={ask.recipient ? <Flag code={ask.recipient.country} size={20} /> : kind ? <DotGlyph glyph={kind} /> : <IconSettingsSliderHor size={20} />}
      done={flag ? <Flag code={flag} size={20} /> : kind ? <DotGlyph glyph={kind} /> : <DotsMark size={20} />}
      label={label}
      onOpen={onOpen}
    />
  );
}

/** Something to send money to (an address, an invoice, bank details): an action pill, as Dots links everything. */
function NotePill({ note, onOpen }: { note: AgentNote; onOpen: () => void }) {
  return (
    <button type="button" className={styles.pill} data-state="open" onClick={onOpen} data-opens-sheet>
      <span className={styles.pillLead}>
        <DotGlyph glyph={note.glyph ?? 'coin'} />
      </span>
      <span className={styles.pillLabel}>{note.title}</span>
      <span className={styles.chevron} />
    </button>
  );
}

/** The pill's sheet, built like the setup sheet: the code as a QR and in full, what to know, and a black Copy. */
function AddressSheet({ note, onClose }: { note: AgentNote; onClose: () => void }) {
  const code = note.code ?? '';
  const { copied, copy } = useCopy(code);
  const label = copied ? 'Copied' : copyLabel(note);
  return (
    <div className={styles.setup}>
      <span className={styles.close}>
        <SheetDisc label="Close" onClick={onClose}>
          <IconCrossMedium size={20} />
        </SheetDisc>
      </span>
      {note.glyph !== 'bank' && (
        <span className={styles.setupMarks}>
          <AddressQr value={code} size={148} />
        </span>
      )}
      <strong className={styles.setupTitle}>{note.title}</strong>
      <code className={styles.addressFull}>{code}</code>
      <div className={styles.setupBody}>
        {note.lines.map((l) => (
          <p key={l}>{l}</p>
        ))}
      </div>
      <GlassButton label={label} tint="var(--dot-cta)" ink="var(--dot-cta-text)" size={340} className={styles.black} onClick={copy}>
        {label}
      </GlassButton>
    </div>
  );
}

/** The setup sheet: a floating card with Dots' mark, the terms in plain words, Not now and the black button. */
function SetupSheet({ ask, onAllow, onDeny, onClose }: { ask: AgentAsk; onAllow: () => void; onDeny: () => void; onClose: () => void }) {
  return (
    <div className={styles.setup}>
      <span className={styles.close}>
        <SheetDisc label="Close" onClick={onClose}>
          <IconCrossMedium size={20} />
        </SheetDisc>
      </span>
      <span className={styles.setupMarks}>
        <DotsMark size={52} />
      </span>
      <strong className={styles.setupTitle}>{ask.form?.title ?? ask.title}</strong>
      <div className={styles.setupBody}>
        {ask.rows?.map((r) => (
          <p key={r.text}>
            <b>{r.text}.</b> {r.sub}
          </p>
        ))}
        <p>
          Your dot stays inside these limits. You can turn it off any time in{' '}
          <u>Settings</u>.
        </p>
      </div>
      {ask.deny && (
        <button type="button" className={styles.notNow} onClick={onDeny}>
          {ask.deny}
        </button>
      )}
      <GlassButton label={ask.allow ?? 'Turn on'} tint="var(--dot-cta)" ink="var(--dot-cta-text)" size={340} className={styles.black} onClick={onAllow}>
        {ask.allow ?? 'Turn on'}
      </GlassButton>
    </div>
  );
}

/** The pay sheet: Dots' own checkout. It prepares, then shows the payment with Approve (closing it, or saying no, declines). */
function PaySheet({
  ask,
  onAllow,
  onDeny,
  onClose,
  onSwap,
}: {
  ask: AgentAsk;
  onAllow: () => void;
  onDeny: () => void;
  onClose: () => void;
  onSwap: (to: PayTo) => void;
}) {
  const [ready, setReady] = useState(false);
  const [picking, setPicking] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), PREPARING_MS);
    return () => window.clearTimeout(t);
  }, []);
  const who = ask.who;
  const order = !!who?.icon;
  const method = ask.method?.replace(/^From /, '');
  return (
    <div className={styles.pay}>
      <div className={styles.payBar}>
        <SheetDisc label="Close" onClick={onClose}>
          <IconCrossMedium size={20} />
        </SheetDisc>
        <strong>Dots</strong>
        <SheetDisc label="Menu">
          <span className={styles.burger} />
        </SheetDisc>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {!ready ? (
          <motion.div key="prep" className={styles.preparing} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <DotsMark size={44} />
            <strong>Preparing your {order ? 'checkout' : 'payment'}…</strong>
            <i className={styles.spinner} />
          </motion.div>
        ) : (
          <motion.div key="pay" className={styles.payBody} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <span className={styles.payMarks}>
              <DotsMark size={44} />
              {who?.bank ? (
                <BankMark bank={who.bank} country={who.flag} size={44} />
              ) : (
                <span className={styles.payWho}>
                  {who?.flag ? <Flag code={who.flag} size={44} /> : who?.icon ? <img src={who.icon} alt="" /> : (who?.mark ?? (who?.name ?? ask.title)[0])}
                </span>
              )}
            </span>
            <strong className={styles.payTitle}>
              Pay {ask.amount} to {who?.name ?? ask.title}
            </strong>
            <span className={styles.requested}>
              Requested by <DotsMark size={18} /> your dot
            </span>
            <span className={styles.email}>
              <i>{PERSON.first[0]}</i>
              {PERSON.email}
            </span>
            <div className={styles.total}>
              {who?.icon && <img src={who.icon} alt="" />}
              <span>
                <b>Total</b>
                <small>{order ? '1 item' : who?.detail}</small>
              </span>
              <b>{ask.amount}</b>
            </div>
            <div className={styles.payRows}>
              {order ? (
                <div>
                  <span>{ask.soon ? 'Deliver to' : 'Ship to'}</span>
                  <p>
                    {PERSON.full}
                    <br />
                    {ADDRESS}
                  </p>
                </div>
              ) : (
                <div>
                  <span>Send to</span>
                  <p>
                    {who?.name}
                    <br />
                    {who?.detail}
                  </p>
                </div>
              )}
              {method && (
                <div>
                  <span>Pay with</span>
                  {ask.pay ? (
                    <PayWith pay={ask.pay} method={method} open={picking} onToggle={() => setPicking((p) => !p)} onSwap={onSwap} />
                  ) : (
                    <p className={styles.balanceRow}>
                      <DotsMark size={20} />
                      {method}
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={styles.payActions}>
        {ask.deny && (
          <GlassButton label={ask.deny} onClick={onDeny}>
            {ask.deny}
          </GlassButton>
        )}
        <GlassButton label={ask.allow ?? 'Approve'} tint="var(--dot-blue)" ink="#fff" disabled={!ready} onClick={onAllow}>
          {ask.allow ?? 'Approve'}
        </GlassButton>
      </div>
    </div>
  );
}

/** The checkout's Pay with, when it can switch: what pays now, and under it the saved card and the Dots balance. */
function PayWith({
  pay,
  method,
  open,
  onToggle,
  onSwap,
}: {
  pay: NonNullable<AgentAsk['pay']>;
  method: string;
  open: boolean;
  onToggle: () => void;
  onSwap: (to: PayTo) => void;
}) {
  const pick = (to: PayTo) => (to === pay.by ? onToggle() : onSwap(to));
  return (
    <div className={styles.payWith}>
      <button type="button" className={styles.payNow} onClick={onToggle}>
        {pay.by === 'card' ? <IconCreditCard1 size={20} /> : <DotsMark size={20} />}
        <b>{method}</b>
        <IconChevronDownSmall size={18} className={styles.payChevron} data-open={open || undefined} />
      </button>
      {open && (
        <div className={styles.payOptions}>
          <button type="button" onClick={() => pick('card')} data-on={pay.by === 'card' || undefined}>
            <IconCreditCard1 size={20} />
            <b>
              {pay.card}
              <small>Saved card</small>
            </b>
            {pay.by === 'card' && <IconCheckmark1 size={18} />}
          </button>
          <button type="button" onClick={() => pick('balance')} disabled={!pay.enough} data-on={pay.by === 'balance' || undefined}>
            <DotsMark size={20} />
            <b>
              {pay.wallet}
              <small>{pay.enough ? `${pay.balance} available` : `${pay.balance} · not enough`}</small>
            </b>
            {pay.by === 'balance' && <IconCheckmark1 size={18} />}
          </button>
          {!pay.enough && (
            <button type="button" className={styles.payAdd} onClick={() => onSwap('topup')}>
              Add money to {pay.wallet}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** A payment waiting on you, as its pill in the thread: tap to review it in Dots. */
function PayPill({ m, onOpen }: { m: Ask; onOpen: () => void }) {
  const { ask, state } = m;
  const label =
    state === 'done'
      ? `${ask.allowed ?? 'Paid'} · ${ask.amount}`
      : state === 'denied'
        ? `${ask.denied ?? 'Declined'} · ${ask.amount}`
        : state === 'expired'
          ? 'Expired'
          : `Review payment · ${ask.amount}`;
  return <Pill m={m} lead={<IconReceiptBill size={20} />} done={<DotsMark size={20} />} label={label} onOpen={onOpen} />;
}

/** What dot set up or saved, as the gray pill it leaves in the thread (IMG_1890, "Created task"). */
function MetaPill({ meta }: { meta: AgentMeta }) {
  const Glyph = meta.icon === 'routine' ? IconRepeat : IconCheckCircle2;
  return (
    <span className={styles.metaPill}>
      <Glyph size={20} />
      <span className={styles.pillLabel}>{meta.text}</span>
      <span className={styles.chevron} />
    </span>
  );
}

/** The send's glide, fitted frame by frame (recording 23-05-49 at 60fps): a quarter of the way in one frame, done by ~200ms. */
const SEND_GLIDE = 'linear(0, 0.27 8.3%, 0.47 16.7%, 0.63 25%, 0.75 33.3%, 0.83 41.7%, 0.89 50%, 0.93 58.3%, 0.96 66.7%, 0.98 75%, 0.99 83.3%, 1)';
/** Its rise over the same ~200ms: still for a frame, then steady, easing in at the end. */
const SEND_LIFT = 'linear(0, 0 8.3%, 0.085 16.7%, 0.23 25%, 0.36 33.3%, 0.49 41.7%, 0.62 50%, 0.7 58.3%, 0.79 66.7%, 0.85 75%, 0.91 83.3%, 0.94 91.7%, 1)';

/**
 * Your bubble as Dots sends it (recording 23-05-49): the text leaves from where it sat in the field and glides right
 * across the screen as the thread lifts it, bare for ~40ms, then the blue fills in behind it by ~83ms as it turns white.
 */
function SentBubble({ fresh, children }: { fresh: boolean; children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    const screen = el?.closest<HTMLElement>(`.${styles.screen}`);
    if (!fresh || !el || !screen || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const s = screen.getBoundingClientRect();
    const k = s.width / screen.offsetWidth || 1;
    const css = getComputedStyle(el);
    const field = screen.querySelector<HTMLElement>('textarea:not([aria-hidden])');
    if (!field) return;
    const at = el.getBoundingClientRect();
    const from = field.getBoundingClientRect();
    const fieldCss = getComputedStyle(field);
    const dx = (from.left - at.left) / k + parseFloat(fieldCss.paddingLeft) - parseFloat(css.paddingLeft);
    const dy = (from.top - at.top) / k + parseFloat(fieldCss.paddingTop) - parseFloat(css.paddingTop);
    const blue = css.backgroundColor;
    const clear = `color-mix(in srgb, ${blue} 0%, transparent)`;
    const ink = css.getPropertyValue('--dot-text').trim() || '#000';
    const fitted = CSS.supports('animation-timing-function', 'linear(0, 1)');
    const slide = el.animate([{ translate: `${dx}px 0` }, { translate: '0 0' }], {
      duration: 200,
      easing: fitted ? SEND_GLIDE : 'cubic-bezier(0.1, 0.8, 0.3, 1)',
    });
    // Up from the field: in a full thread the scroll does most of it, in a short one this does all of it.
    const lift = el.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], {
      duration: 200,
      easing: fitted ? SEND_LIFT : 'cubic-bezier(0.4, 0.2, 0.3, 1)',
    });
    // It leaves over the composer's glass, and the field stays blank until it's clear (~83ms).
    el.style.zIndex = '5';
    void lift.finished.then(() => (el.style.zIndex = '')).catch(() => {});
    field.style.setProperty('--placeholder', 'transparent');
    const blank = window.setTimeout(() => field.style.removeProperty('--placeholder'), 83);
    const fill = el.animate(
      [
        { backgroundColor: clear, color: ink, offset: 0 },
        { backgroundColor: clear, color: ink, offset: 0.5 },
        { backgroundColor: `color-mix(in srgb, ${blue} 12%, transparent)`, color: ink, offset: 0.6 },
        { backgroundColor: `color-mix(in srgb, ${blue} 65%, transparent)`, color: '#fff', offset: 0.8 },
        { backgroundColor: blue, color: '#fff', offset: 1 },
      ],
      { duration: 84, easing: 'linear' },
    );
    return () => {
      slide.cancel();
      lift.cancel();
      fill.cancel();
      window.clearTimeout(blank);
      field.style.removeProperty('--placeholder');
    };
    // A bubble is sent once, on mount.
  }, []);
  return (
    <span ref={ref} className={styles.me} data-bubble>
      {children}
    </span>
  );
}

/** When the receipt under your bubble changes, in ms from the send (recording 8, 33.74s on). */
const RECEIPT = { delivered: 1100, seen: 1580 } as const;
/** Dots starts typing once it has seen you. */
export const DOTS_READS_FOR = 2200;
/** Then thinks for about two seconds before the reply (recording 23-05-49, 5.07s to 7.15s). */
export const DOTS_TYPES_FOR = 2000;

/** One blink (recording 8, 27.33s): half shut for a frame, shut for two, half again, open. */
const BLINK: { lid: 'half' | 'shut' | null; ms: number }[] = [
  { lid: 'half', ms: 33 },
  { lid: 'shut', ms: 67 },
  { lid: 'half', ms: 50 },
  { lid: null, ms: 0 },
];

/**
 * Your dot (recordings 3 and 8): he bobs about 0.4pt over ~5s and blinks every 11 to 16s. While he works a
 * lightbulb grows in at his top right (~260ms) and slowly warms and cools, then shrinks away when he's done.
 */
function DotAvatar({ thinking }: { thinking: boolean }) {
  const [lid, setLid] = useState<'half' | 'shut' | null>(null);
  useEffect(() => {
    let t: number;
    const blink = (i: number) => {
      setLid(BLINK[i].lid);
      t = i < BLINK.length - 1 ? window.setTimeout(() => blink(i + 1), BLINK[i].ms) : window.setTimeout(() => blink(0), 11000 + Math.random() * 5000);
    };
    t = window.setTimeout(() => blink(0), 3000 + Math.random() * 4000);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <span className={styles.avatar} aria-hidden>
      <span className={styles.avatarBody}>
        <img src={`${A}/body.png`} alt="" width={78} height={62} draggable={false} />
        <img className={styles.lid} src={`${A}/blink-half.png`} alt="" width={78} height={62} draggable={false} data-on={lid === 'half' || undefined} />
        <img className={styles.lid} src={`${A}/blink-shut.png`} alt="" width={78} height={62} draggable={false} data-on={lid === 'shut' || undefined} />
      </span>
      <AnimatePresence>
        {thinking && (
          <motion.img
            key="bulb"
            className={styles.bulb}
            src={`${A}/bulb.png`}
            alt=""
            draggable={false}
            initial={{ scale: 0 }}
            animate={{ scale: 1, transition: { type: 'spring', stiffness: 420, damping: 22 } }}
            exit={{ scale: 0, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }}
          />
        )}
      </AnimatePresence>
    </span>
  );
}

/** How much of a request a quote keeps: "Help me plan my afternoon"… */
const QUOTE_WORDS = 5;

/** Over a reply that carries on a request after you answered something in between: ↳ "Help me plan my afternoon"… */
function ReplyTo({ request }: { request: string }) {
  const words = request.trim().split(/\s+/);
  const cut = words.length > QUOTE_WORDS;
  const kept = words.slice(0, QUOTE_WORDS).join(' ');
  return (
    <span className={styles.replyTo}>
      <IconArrowCornerDownRight size={14} />
      {cut ? `"${kept.replace(/[.,!?;:]+$/, '')}"...` : `"${kept}"`}
    </span>
  );
}

/** Dots thinks in a thought bubble rather than a typing bubble (recording 23-05-49). */
function Thought() {
  return (
    <span className={styles.thought} data-bubble aria-label="Typing">
      <i />
      <i />
      <i />
    </span>
  );
}

/** The thought bubble goes at once and the reply fades in from pale, bubble and all (~100ms). */
function DotSaid({ typing, children }: { typing: boolean; children: ReactNode }) {
  const thought = useRef(typing);
  if (typing) return <Thought />;
  return (
    <motion.div
      className={styles.them}
      data-bubble
      initial={thought.current ? { opacity: 0.3 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

/** Under your last message: Delivered fades up from pale as the thread makes room, then crossfades to Seen. */
function Receipt({ fresh }: { fresh: boolean }) {
  const [stage, setStage] = useState<'sent' | keyof typeof RECEIPT>(fresh ? 'sent' : 'seen');
  useEffect(() => {
    if (!fresh) return;
    const timers = (Object.keys(RECEIPT) as (keyof typeof RECEIPT)[]).map((s) => window.setTimeout(() => setStage(s), RECEIPT[s]));
    return () => timers.forEach(window.clearTimeout);
  }, [fresh]);
  if (stage === 'sent') return null;
  const cross = { duration: 0.2, ease: 'easeInOut' } as const;
  return (
    <span className={styles.seen}>
      <motion.span
        initial={{ opacity: fresh ? 0.4 : 0 }}
        animate={{ opacity: stage === 'delivered' ? 1 : 0 }}
        transition={stage === 'delivered' ? { duration: 0.09, ease: 'easeOut' } : cross}
      >
        Delivered
      </motion.span>
      <motion.span initial={fresh ? { opacity: 0 } : false} animate={{ opacity: stage === 'seen' ? 1 : 0 }} transition={cross}>
        Seen
      </motion.span>
    </span>
  );
}

/** How Dots' thread follows each kind of growth (recording 8, fitted per event). */
function dotsScroll(cause: ScrollCause): ScrollCurve {
  switch (cause) {
    case 'me':
      return { ms: 230, ease: [0.25, 0.3, 0.2, 1] };
    case 'typing':
      return { ms: 270, ease: [0.3, 0, 0.6, 0.9] };
    case 'grow':
      return { ms: 270, ease: [0.2, 0.1, 0, 0.8] };
    default:
      return { ms: 230, ease: [0.5, 0.6, 0.5, 0.9] };
  }
}

export function DotChat({ chat }: AgentChatProps) {
  const lastMe = chat.messages.reduce((id, m) => (m.kind === 'me' ? m.id : id), -1);
  const openedIds = useOpenedIds(chat.messages);
  const [multiline, setMultiline] = useState(false);
  // Checkouts and setup asks: Dots opens them in its own sheet. Cards and banks have theirs.
  const sheet = useAskSheet(chat.messages, (a) => !a.card && !a.bank);
  const sub = useSubAgentSheet(chat.messages, SHEET_IN);
  const card = useDotCard({ messages: chat.messages, present: SHEET_IN, onAllow: chat.allow });
  const bank = useDotBank({ messages: chat.messages, present: SHEET_IN, onAllow: chat.allow, onDeny: chat.deny });
  const balance = useDotBalance({ present: SHEET_IN, account: chat.account, onAction: chat.prompt });
  // The address sheet keeps its note while it slides away.
  const [address, setAddress] = useState<{ note: AgentNote; open: boolean } | null>(null);
  const open = (m: Ask) => sheet.show(m.id, m.ask);
  // A payment opens its checkout as it arrives, as the checkout link does in the app.
  const opened = useRef(new Set<number>());
  useEffect(() => {
    const ask = [...chat.messages].reverse().find((m): m is Ask => m.kind === 'ask' && m.state === 'open');
    if (!ask || ask.ask.rows || ask.ask.card || opened.current.has(ask.id)) return;
    opened.current.add(ask.id);
    const t = window.setTimeout(() => (ask.ask.bank ? bank.open(ask.id, ask.ask) : open(ask)), 500);
    return () => window.clearTimeout(t);
  }, [chat.messages]);

  const close = sheet.hide;
  const allow = () => {
    close();
    chat.allow();
  };
  const deny = () => {
    close();
    chat.deny();
  };
  const swap = (to: PayTo) => {
    close();
    chat.swap(to);
  };

  const render = (m: Message, i: number, all: Message[]) => {
    switch (m.kind) {
      case 'them':
        return (
          <>
            {m.sender && <span className={styles.sender}>{m.sender}</span>}
            {m.replyTo && <ReplyTo request={m.replyTo} />}
            <DotSaid typing={m.typing}>
              <Markdown text={m.text} />
            </DotSaid>
          </>
        );
      case 'me': {
        const fresh = !openedIds.has(m.id);
        return (
          <>
            <SentBubble fresh={fresh}>{m.text}</SentBubble>
            {m.id === lastMe && <Receipt key={m.id} fresh={fresh} />}
          </>
        );
      }
      case 'chips':
        return (
          <div className={styles.chips} data-picked={m.picked !== null || m.expired || undefined}>
            {m.chips.map((c, i) => (
              <button
                key={c.label}
                type="button"
                className={styles.chip}
                data-picked={m.picked === i || undefined}
                disabled={m.picked !== null || m.expired}
                onClick={() => chat.pick(i)}
              >
                {c.flag ? (
                  <Flag code={c.flag} size={20} />
                ) : c.glyph ? (
                  <DotGlyph glyph={c.glyph} />
                ) : c.icon ? (
                  <img src={c.icon} alt="" width={20} height={20} />
                ) : null}
                <span className={styles.pillLabel}>{c.label}</span>
                <span className={styles.chevron} />
              </button>
            ))}
          </div>
        );
      case 'ask':
        if (m.ask.card) return <ActionPill m={m} onOpen={() => card.open(m.id, m.ask)} />;
        if (m.ask.bank) return <ActionPill m={m} onOpen={() => bank.open(m.id, m.ask)} />;
        return m.ask.rows ? <ActionPill m={m} onOpen={() => open(m)} /> : <PayPill m={m} onOpen={() => open(m)} />;
      case 'card': {
        const b = m.card.balance;
        return b ? (
          <BalanceCard
            balance={b}
            className={styles.accountSkin}
            onOpen={() => balance.open(b.wallet)}
          />
        ) : m.card.code ? (
          <NotePill note={m.card} onOpen={() => setAddress({ note: m.card, open: true })} />
        ) : (
          <NoteCard note={m.card} />
        );
      }
      case 'stamp':
      case 'tag': {
        const [day, ...time] = m.text.split(' ');
        return (
          <span className={styles.stamp}>
            <b>{day}</b> {time.join(' ')}
          </span>
        );
      }
      case 'work':
        return <Thought />;
      case 'products':
        return (
          <div className={styles.them} data-bubble>
            <Markdown text={productsText(m.products)} />
          </div>
        );
      case 'meta': {
        // A done pill already says what was saved; the check line would only repeat it.
        const prev = all[i - 1];
        if (m.meta.icon === 'check' && prev?.kind === 'ask' && prev.state === 'done') return null;
        return <MetaPill meta={m.meta} />;
      }
      case 'divider':
        return <Divider text={m.text} />;
      case 'subagent':
        return <SubAgentRow agent={m.agent} done={m.done} onOpen={() => sub.open(m.id)} />;
      // Only Duet labels a run.
      case 'eyebrow':
        return null;
      default: {
        const exhaustive: never = m;
        return exhaustive;
      }
    }
  };

  const hasText = chat.composer.length > 0;
  // The render where the send comes or goes moves the mic on the send's clock, not the composer's.
  const hadText = useRef(hasText);
  const sendFlip = hadText.current !== hasText;
  useEffect(() => {
    hadText.current = hasText;
  }, [hasText]);

  return (
    <div className={styles.stage}>
      <ChatFrame
        className={styles.screen}
        messages={chat.messages}
        render={render}
        rowMotion={(m) => (m.kind === 'me' ? STILL : NATIVE_IN)}
        scroll={dotsScroll}
        faceId={chat.authing}
        onFaceIdDone={chat.authed}
        gap={6}
        threadTop={172}
        composerBottom={37.5}
        composerHeight={48}
        edge={<ScrollEdge className={styles.edge} />}
        header={
          <>
            <NoopButton label="Menu" className={styles.menu}>
              <GlassDisc label="Menu" icon={`${A}/menu.svg`} width={20} height={14} />
            </NoopButton>
            <NoopButton label="Call" className={styles.call}>
              <GlassDisc label="Call" icon={`${A}/phone.svg`} width={22} height={22} />
            </NoopButton>
            <DotAvatar thinking={chat.busy || chat.messages.some((m) => m.kind === 'work')} />
            <GlassPill radius={18.5} absolute className={styles.name}>
              <span className={styles.nameText}>dot</span>
            </GlassPill>
          </>
        }
        composer={
          <motion.div layout transition={CARD} className={styles.composerBox} style={{ borderRadius: 24 }}>
            <GlassPill radius={24} className={styles.composer}>
              <span className={styles.composerGrid} data-multiline={multiline || undefined}>
                <motion.span layout="position" transition={CARD} className={`${styles.slot} ${styles.plusSlot}`} style={{ gridArea: 'plus' }}>
                  <span className={styles.glyph} style={mask(`${A}/plus.svg`, 18, 18)} />
                </motion.span>
                <motion.span layout="position" transition={CARD} className={styles.fieldSlot}>
                  <ComposerField chat={chat} placeholder="Ask dot to buy or send…" className={styles.field} onMultiline={setMultiline} />
                </motion.span>
                <span className={styles.tools}>
                  <motion.span layout="position" transition={sendFlip ? SEND_IN : CARD} className={styles.slot}>
                    <span className={styles.glyph} style={mask(`${A}/mic.svg`, 16, 22)} />
                  </motion.span>
                  {hasText && (
                    <motion.span
                      layout="position"
                      initial={{ scale: 0.8, opacity: 0.3 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ default: SEND_IN, layout: CARD }}
                      className={styles.send}
                      role="button"
                      aria-label="Send"
                      onClick={chat.send}
                      data-ready={chat.canSend || undefined}
                    >
                      <IconArrowUp size={18} />
                    </motion.span>
                  )}
                </span>
              </span>
            </GlassPill>
          </motion.div>
        }
      />
      <AppSheet open={sheet.open} present={SHEET_IN} className={sheet.ask?.rows ? styles.setupPanel : styles.payPanel} onDismiss={close}>
        {sheet.ask &&
          (sheet.ask.rows ? (
            <SetupSheet ask={sheet.ask} onAllow={allow} onDeny={deny} onClose={close} />
          ) : (
            <PaySheet key={sheet.id} ask={sheet.ask} onAllow={allow} onDeny={deny} onClose={close} onSwap={swap} />
          ))}
      </AppSheet>
      <AppSheet open={!!address?.open} present={SHEET_IN} className={styles.setupPanel} onDismiss={() => setAddress((a) => a && { ...a, open: false })}>
        {address && <AddressSheet note={address.note} onClose={() => setAddress((a) => a && { ...a, open: false })} />}
      </AppSheet>
      {sub.sheet}
      {card.sheet}
      {bank.sheet}
      {balance.sheet}
    </div>
  );
}
