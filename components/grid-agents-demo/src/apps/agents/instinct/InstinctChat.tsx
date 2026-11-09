import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { PhoneStatusBar } from '@/apps/shared/AppShell/PhoneStatusBar';
import { playAppSwitch, WALLPAPER } from '@/apps/shared/appSwitch';
import { SfSymbol } from '@/apps/shared/icons';
import { ChatFrame, ComposerField, NATIVE_IN, Said, ScrollEdge, STILL, TypingDots, useOpenedIds, useOpenedMarks } from '../ChatFrame';
import { GlassDisc, GlassPill, NoopButton } from '../glass';
import { shortCode, useCopy } from '../parts';
import type { AgentAsk, AgentBalance, AgentNote, Message, Product, SubAgent } from '../conversation';
import { useKeptAsk, useKeptBalance } from '../openSheets';
import type { AgentChatProps } from '../types';
import { Hatch } from './Hatch';
import { InstinctOptionsPage, OPTIONS_HOST, optionsTitle } from './InstinctOptions';
import { INSTINCT_HOST, InstinctBalancePage, InstinctSafari, InstinctThreadPage } from './InstinctSafari';
import styles from './InstinctChat.module.scss';

/**
 * Instinct over iMessage (recordings 1, 2, 4, 6): text only. Besides bubbles
 * there is only what iMessage itself draws: tapbacks, rich links, and the
 * images Instinct generates (receipts, product cards). Payments are approved
 * by replying, and anything sensitive goes through a vault link in Safari.
 */
const A = '/assets/agents/instinct';

const mask = (src: string, width: number, height: number) => ({ maskImage: `url(${src})`, width, height });

/** Instinct's side of the thread: its texts, images and links run together; the last takes the tail. */
const THEIRS = new Set<Message['kind']>(['them', 'card', 'chips', 'ask', 'work', 'products']);

type Ask = Extract<Message, { kind: 'ask' }>;

/** After the page settles, the beat Safari holds before heading back to Messages. */
const RETURN_MS = 1600;

const TAPBACK = { type: 'spring', duration: 0.32, bounce: 0.25 } as const;

type Keys = readonly (readonly [number, number])[];

/** A value along keyframes [ms, value], straight between them. */
function at(t: number, keys: Keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    if (t > t1) continue;
    const [t0, v0] = keys[i - 1];
    return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
  }
  return keys[keys.length - 1][1];
}

/**
 * iMessage's send, frame by frame from recording 2 (24.68s on, ms from the tap).
 * The field's text lifts off as a pale, blurred copy of the field; the bubble
 * condenses out of it at 0.81 size, rises to its place, then swells to full
 * size from its tail corner.
 */
const SEND = {
  /** How far the bubble's bottom-right corner has come from the field's to its own. */
  rise: [[0, 0], [33, 0.03], [117, 0.21], [133, 0.34], [150, 0.47], [167, 0.58], [183, 0.73], [200, 0.82], [233, 0.88], [250, 0.92], [267, 0.94], [283, 0.98], [317, 1]],
  scale: [[217, 0.81], [233, 0.82], [250, 0.835], [267, 0.85], [283, 0.87], [300, 0.89], [317, 0.9], [333, 0.92], [350, 0.935], [367, 0.946], [383, 0.959], [400, 0.968], [417, 0.978], [433, 0.985], [450, 0.989], [520, 1]],
  opacity: [[0, 0], [33, 0.35], [117, 0.7], [167, 1]],
  blur: [[0, 8], [117, 3], [183, 0]],
  /** The pale field left behind: it narrows from the left, sinks a little, and is gone as the field drops to one line. */
  ghost: [[0, 0], [33, 0.45], [100, 0.7], [140, 0]],
  ghostInset: [[0, 0], [33, 13], [83, 28]],
  ghostSink: [[0, 0], [117, -6]],
  end: 520,
} satisfies Record<string, Keys | number>;

/**
 * Your bubble. Freshly sent, it flies out of the composer's field as iMessage's does. `mark` (the tapback) sits
 * beside it rather than in it: the bubble is clipped to its corners, which would cut the cloud where it overlaps one.
 */
function SentBubble({ fresh, from, mark, children }: { fresh: boolean; from: () => DOMRect | null; mark?: ReactNode; children: ReactNode }) {
  const bubble = useRef<HTMLSpanElement>(null);
  const ghost = useRef<HTMLSpanElement>(null);
  const [flying, setFlying] = useState(fresh);
  useLayoutEffect(() => {
    const el = bubble.current;
    const g = ghost.current;
    const col = el?.parentElement?.parentElement;
    const field = from();
    if (!fresh || !el || !g || !col || !field || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFlying(false);
      return;
    }
    // The phone is drawn scaled; transforms are in its own pixels.
    const k = col.getBoundingClientRect().width / col.offsetWidth || 1;
    let dx = 0;
    let dy = 0;
    let raf = 0;
    const t0 = performance.now();
    const land = () => {
      el.style.transform = el.style.opacity = el.style.filter = '';
    };
    const frame = (now: number) => {
      const t = now - t0;
      if (t >= SEND.end) {
        land();
        setFlying(false);
        return;
      }
      // Where the bubble sits in the thread right now (the thread is scrolling under it).
      const r = el.getBoundingClientRect();
      const right = r.right - dx * k;
      const bottom = r.bottom - dy * k;
      const rise = at(t, SEND.rise);
      dx = ((field.right - right) * (1 - rise)) / k;
      dy = ((field.bottom - bottom) * (1 - rise)) / k;
      el.style.transform = `translate(${dx}px, ${dy}px) scale(${at(t, SEND.scale)})`;
      el.style.opacity = String(at(t, SEND.opacity));
      el.style.filter = `blur(${at(t, SEND.blur)}px)`;
      const c = col.getBoundingClientRect();
      const inset = at(t, SEND.ghostInset);
      Object.assign(g.style, {
        left: `${(field.left - c.left) / k + inset}px`,
        top: `${(field.top - c.top) / k}px`,
        width: `${field.width / k - inset}px`,
        height: `${field.height / k + at(t, SEND.ghostSink)}px`,
        opacity: String(at(t, SEND.ghost)),
      });
      raf = requestAnimationFrame(frame);
    };
    frame(t0);
    return () => {
      cancelAnimationFrame(raf);
      land();
    };
    // A bubble flies once, on mount.
  }, []);
  return (
    <>
      {flying && <span ref={ghost} className={styles.ghost} />}
      <span className={styles.meBox}>
        <span ref={bubble} className={styles.me} data-bubble data-tail="br">
          {children}
        </span>
        {mark}
      </span>
    </>
  );
}

/** iMessage's data detectors: amounts, days and street addresses, underlined. */
const DETECT = /(R?\$[\d,]+(?:\.\d{2})?|\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b|\d{3,5} [A-Z][\w ]+? (?:Blvd|St|Ave|Rd)\b[^,.]*)/gi;

function Detected({ text }: { text: string }) {
  const parts = text.split(DETECT);
  return (
    <>
      {parts.map((p, i) => (i % 2 === 1 ? <u key={i} className={styles.detected}>{p}</u> : <Fragment key={i}>{p}</Fragment>))}
    </>
  );
}

/** A money ask, as Instinct texts it: what, how much, from where, and to reply yes. */
function askText(ask: AgentAsk) {
  if (ask.text) return ask.text;
  const what = ask.who ? `${ask.who.name}, ${ask.amount}` : `${ask.title}, ${ask.amount}`;
  const from = ask.method ? ` ${ask.method.replace(/^From /, 'from ')}.` : '';
  const verb = ask.who?.icon ? 'place the order' : 'send it';
  return `${what}.${from} reply yes and i’ll ${verb}`;
}

/** Only what's sensitive (a card, a bank) opens app.instinct.com; everything else is answered by texting back. */
const linksOut = (ask: AgentAsk) => !!(ask.card || ask.bank);

/**
 * Instinct only takes a text yes or no, so an ask settled with another app's button reads as answered here too:
 * the reply it would have taken, sent under it.
 */
const withReplies = (messages: Message[]): Message[] =>
  messages.flatMap((m, i) =>
    m.kind === 'ask' && !linksOut(m.ask) && (m.state === 'done' || m.state === 'denied') && messages[i + 1]?.kind !== 'me'
      ? [m, { id: -m.id - 1, kind: 'me', text: m.state === 'done' ? 'yes' : 'no' }]
      : [m],
  );

/** A choice among the options a products message just showed (between them, only Instinct's own lines). */
function choosesProduct(i: number, all: Message[]) {
  for (let k = i - 1; k >= 0; k--) {
    if (all[k].kind === 'them') continue;
    return all[k].kind === 'products';
  }
  return false;
}

/** The options page for a products message: its buttons pick while the choice after it is open, then hand back. */
function OptionsPage({ messages, id, onPick, onBack }: { messages: Message[]; id: number; onPick: (i: number) => void; onBack: () => void }) {
  const at = messages.findIndex((m) => m.id === id);
  const found = messages[at];
  if (!found || found.kind !== 'products') return null;
  const choice = messages.slice(at + 1).find((m): m is Extract<Message, { kind: 'chips' }> => m.kind === 'chips');
  return (
    <InstinctOptionsPage
      products={found.products}
      query={found.query}
      open={!!choice && choice.picked === null && !choice.expired}
      onPick={(i) => {
        onPick(i);
        window.setTimeout(onBack, PICKED_MS);
      }}
      onBack={onBack}
    />
  );
}

/** How long Sent to Instinct shows before Safari hands back to Messages (the recording's beat). */
const PICKED_MS = 700;

/** A choice, as a numbered text to answer by typing. */
function chipsText(m: Extract<Message, { kind: 'chips' }>) {
  return `reply with one:\n${m.chips.map((c, i) => `${i + 1}. ${c.label}`).join('\n')}`;
}

const today = () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

/** The address an image shows, sent after it as text so it can be taken: a tap copies it, as a long press would. */
function CodeText({ value, tail }: { value: string; tail: boolean }) {
  const { copied, copy } = useCopy(value);
  return (
    <div className={styles.body}>
      <span className={styles.codeBox}>
        <button type="button" className={`${styles.bubble} ${styles.codeText}`} data-bubble data-tail={tail ? 'bl' : undefined} onClick={copy}>
          {value}
        </button>
        <span className={styles.copied} data-on={copied || undefined} aria-live="polite">
          {copied ? 'Copied' : ''}
        </span>
      </span>
      {tail && <span className={styles.tailIn} />}
    </div>
  );
}

/** An image Instinct generates: its paper, the headline in its serif, the details, its wordmark. */
function InstinctImage({ note }: { note: AgentNote }) {
  return (
    <div className={styles.image} role="img" aria-label={note.title}>
      <span className={styles.imageTop}>
        <span className={styles.wordmark}>Instinct</span>
        <span>{today()}</span>
      </span>
      <strong className={styles.imageTitle}>{note.title}</strong>
      {note.code && <code className={styles.imageCode}>{shortCode(note.code)}</code>}
      {note.lines.map((l) => (
        <span key={l} className={styles.imageLine}>
          {l}
        </span>
      ))}
      {note.rows?.map((r, i) => (
        <span key={`${r.title}-${i}`} className={styles.imageRow}>
          <span>{r.title}</span>
          <b data-in={r.incoming || undefined}>{r.amount}</b>
        </span>
      ))}
      {note.done && <span className={styles.imageDone}>✓ Done</span>}
    </div>
  );
}

/** The balance, as Instinct texts it. */
function balanceText(b: AgentBalance) {
  return `${b.amount} in your ${b.wallet}`;
}

/** When the receipt under your bubble changes, in ms from the send (recording 2). */
const RECEIPT = { delivered: 1390, out: 2260, read: 2570 } as const;
type ReceiptStage = 'sent' | keyof typeof RECEIPT;

/** Over iMessage, Instinct reacts or starts typing only once it has read you, after Read has faded in. */
export const INSTINCT_READS_FOR = RECEIPT.read + 330;

/**
 * Under your last message. The row opens (the thread rises to make room) as
 * Delivered fades in; Delivered fades out, a beat of nothing, then Read and
 * the time fade in.
 */
function Receipt({ fresh }: { fresh: boolean }) {
  const [stage, setStage] = useState<ReceiptStage>(fresh ? 'sent' : 'read');
  const [time] = useState(() => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
  useEffect(() => {
    if (!fresh) return;
    const timers = (Object.keys(RECEIPT) as (keyof typeof RECEIPT)[]).map((s) =>
      window.setTimeout(() => setStage(s), RECEIPT[s]),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [fresh]);
  if (stage === 'sent') return null;
  return (
    <span className={styles.read}>
      <motion.span
        initial={{ opacity: 0 }}
        animate={
          stage === 'delivered'
            ? { opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } }
            : { opacity: 0, transition: { duration: 0.17, ease: 'easeIn' } }
        }
      >
        Delivered
      </motion.span>
      <motion.span
        initial={fresh ? { opacity: 0 } : false}
        animate={{ opacity: stage === 'read' ? 1 : 0 }}
        transition={{ duration: 0.17, ease: 'easeOut' }}
      >
        <b>Read</b> {time}
      </motion.span>
    </span>
  );
}

/** The options link's corner mark: a page with a folded corner over another, like iMessage's file previews. */
function PagesGlyph() {
  return (
    <svg className={styles.linkPages} viewBox="0 0 13 15" width={13} height={15} aria-hidden>
      <path d="M1.5 4.5v8.2c0 .8.6 1.3 1.3 1.3h6.4" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
      <path
        d="M4.6 1h4.2l3.2 3.2v6.6c0 .7-.5 1.2-1.2 1.2H4.6c-.7 0-1.2-.5-1.2-1.2V2.2c0-.7.5-1.2 1.2-1.2Z M8.6 1.2v3.2h3.2"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * One product, as the image Instinct makes for it (recording 4, 11:04): the photo large on light gray, the brand over
 * the name with the price in green, a rule, then the date and Instinct's wordmark.
 */
function ProductShot({ product: p }: { product: Product }) {
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return (
    <div className={styles.shot} role="img" aria-label={`${p.title}, ${p.price}`}>
      <span className={styles.shotPhoto}>
        <img src={p.image} alt="" />
      </span>
      <span className={styles.shotBrand}>{p.merchant}</span>
      <span className={styles.shotName}>
        <b>{p.model ?? p.title}</b>
        <span>{p.price}</span>
      </span>
      <span className={styles.shotFoot}>
        <span>{date}</span>
        <span className={styles.shotWord}>Instinct</span>
      </span>
    </div>
  );
}

/** The vault link: iMessage's rich link to Instinct's page, its preview over the title and domain. */
function VaultLink({ m, onOpen }: { m: Ask; onOpen: () => void }) {
  const { ask, state } = m;
  return (
    <button type="button" className={styles.link} data-open-link disabled={state !== 'open'} onClick={onOpen}>
      <span className={styles.linkHero}>
        <span className={styles.linkHeadline}>{ask.title}</span>
        <span className={styles.linkWord}>Instinct</span>
        {state !== 'open' && (
          <span className={styles.linkState} data-state={state}>
            {state === 'done' ? (ask.recipient ? `Saved, Instinct can pay ${ask.recipient.first}` : 'Saved to your vault') : state === 'denied' ? 'Not now' : state === 'expired' ? 'Expired' : 'Saving…'}
          </span>
        )}
      </span>
      <span className={styles.linkMeta}>
        <strong>{ask.title}</strong>
        <small>{INSTINCT_HOST}</small>
      </span>
    </button>
  );
}

export function InstinctChat({ chat, dark }: AgentChatProps) {
  const messagesCard = useRef<HTMLDivElement>(null);
  const safariCard = useRef<HTMLDivElement>(null);
  // Kept across an app switch: Safari opens on the balance page or the card or bank page that was up.
  const kept = useKeptBalance();
  const keptLink = useKeptAsk('ask', chat.messages, linksOut);
  const [view, setView] = useState<'messages' | 'safari'>(kept.open || keptLink.initial ? 'safari' : 'messages');
  const [switchTo, setSwitchTo] = useState<'messages' | 'safari' | null>(null);
  const [linkId, setLinkId] = useState<number | null>(kept.open ? null : (keptLink.initial?.id ?? null));
  const [page, setPage] = useState<{ kind: 'thread'; agent: SubAgent } | { kind: 'balance' } | { kind: 'options'; id: number } | null>(
    kept.open ? { kind: 'balance' } : null,
  );
  const open = chat.messages.find((m): m is Ask => m.kind === 'ask' && m.id === linkId);

  const openLink = (id: number) => {
    if (switchTo || view !== 'messages') return;
    setPage(null);
    setLinkId(id);
    setSwitchTo('safari');
    keptLink.keep(id);
  };
  const openPage = (next: NonNullable<typeof page>) => {
    if (switchTo || view !== 'messages') return;
    setLinkId(null);
    setPage(next);
    setSwitchTo('safari');
    kept.keep(next.kind === 'balance');
  };
  const { keep } = kept;
  const { release } = keptLink;
  const back = useCallback(() => {
    if (switchTo || view !== 'safari') return;
    setSwitchTo('messages');
    keep(false);
    release(linkId);
  }, [switchTo, view, keep, release, linkId]);

  // Both apps ride the switch as cards with their own status bars; the phone's own bar steps aside meanwhile.
  useLayoutEffect(() => {
    if (!switchTo) return;
    const [from, to] = switchTo === 'safari' ? [messagesCard.current, safariCard.current] : [safariCard.current, messagesCard.current];
    if (!from || !to) return;
    const stage = from.parentElement!;
    const statusBar = stage.closest('[data-screen-body]')?.parentElement?.querySelector<HTMLElement>('[data-status-bar]');
    if (statusBar) statusBar.style.visibility = 'hidden';
    const radius = parseFloat(getComputedStyle(stage).getPropertyValue('--screen-corner-radius')) || 55;
    let live = true;
    from.style.visibility = '';
    to.style.visibility = '';
    playAppSwitch(from, to, { wallpaper: WALLPAPER, radius, direction: switchTo === 'safari' ? 1 : -1 }).then(() => {
      // The app left behind is hidden the moment the switch lands: the switch clears its transform, and
      // until React drops it, it would flash full-screen over the app you came back to.
      from.style.visibility = 'hidden';
      if (statusBar) statusBar.style.visibility = '';
      if (!live) return;
      setView(switchTo);
      setSwitchTo(null);
      if (switchTo === 'messages') setPage(null);
    });
    return () => {
      live = false;
      if (statusBar) statusBar.style.visibility = '';
    };
  }, [switchTo]);

  // Once the vault page has its answer (or the request is gone), Safari hands back to Messages.
  // A page you opened to read (a sub-agent's conversation) stays until you tap back.
  const askState = open?.state;
  useEffect(() => {
    if (view !== 'safari' || switchTo || page) return;
    if (askState === 'open' || askState === 'pressing' || askState === 'authing') return;
    const t = window.setTimeout(back, askState === 'done' || askState === 'denied' ? RETURN_MS : 0);
    return () => window.clearTimeout(t);
  }, [view, switchTo, askState, back, page]);

  // A payment or a choice waits on a text: the likely answer is drafted, ready to send.
  const drafted = useRef(new Set<number>());
  const draft = useRef<{ id: number; text: string } | null>(null);
  const { composer, setComposer } = chat;
  useEffect(() => {
    const open = [...chat.messages]
      .reverse()
      .find((m) => (m.kind === 'ask' && m.state === 'open' && !linksOut(m.ask)) || (m.kind === 'chips' && m.picked === null && !m.expired));
    if (!open || drafted.current.has(open.id)) return;
    drafted.current.add(open.id);
    // Suggestions (the greeting's, or under a reply) are offers, not a question the agent is waiting on.
    if (open.kind === 'chips' && !chat.activeFlow) return;
    // Choosing among the options happens on their page, so nothing is drafted for it.
    if (open.kind === 'chips' && choosesProduct(chat.messages.indexOf(open), chat.messages)) return;
    // Only an untouched draft gives way to the next one; anything typed stays.
    if (composer && composer !== draft.current?.text) return;
    draft.current = { id: open.id, text: open.kind === 'chips' ? open.chips[0].label : 'Yes' };
    setComposer(draft.current.text);
  }, [chat.messages, chat.activeFlow, composer, setComposer]);
  // The composer is every app's: a draft left untouched doesn't follow the person into the next app, and is
  // drafted again on the way back.
  useEffect(
    () => () => {
      const d = draft.current;
      if (!d) return;
      drafted.current.delete(d.id);
      setComposer((c) => (c === d.text ? '' : c));
    },
    [setComposer],
  );
  const thread = useMemo(() => withReplies(chat.messages), [chat.messages]);
  const lastMe = thread.reduce<number | null>((id, m) => (m.kind === 'me' ? m.id : id), null);

  const opened = useOpenedIds(thread);
  const tappedAtOpen = useOpenedMarks();

  // A bubble flies out of the field as it was when sent (two lines tall, say), not the emptied one.
  const fieldRow = useRef<HTMLSpanElement>(null);
  const sentFrom = useRef<DOMRect | null>(null);
  useLayoutEffect(() => {
    if (chat.composer && fieldRow.current) sentFrom.current = fieldRow.current.getBoundingClientRect();
  }, [chat.composer]);
  const takeSentFrom = useCallback(() => {
    const rect = sentFrom.current ?? fieldRow.current?.getBoundingClientRect() ?? null;
    sentFrom.current = null;
    return rect;
  }, []);

  const bubble = (key: string, body: ReactNode, tail: boolean) => (
    <div className={styles.body} key={key}>
      <div className={styles.bubble} data-bubble data-tail={tail ? 'bl' : undefined}>
        {body}
      </div>
      {tail && <span className={styles.tailIn} />}
    </div>
  );

  const render = (m: Message, i: number, all: Message[]) => {
    const theirsNext = i < all.length - 1 && THEIRS.has(all[i + 1].kind);
    const prev = all[i - 1];
    switch (m.kind) {
      case 'stamp':
      case 'tag':
        return (
          <span className={styles.stamp}>
            {i === 0 && <strong>iMessage</strong>}
            {m.text}
          </span>
        );
      case 'them':
        return (
          <div className={styles.body}>
            <Said typing={m.typing} className={styles.bubble} tail={theirsNext ? undefined : 'bl'}>
              <Detected text={m.text} />
            </Said>
            {!theirsNext && <span className={styles.tailIn} />}
          </div>
        );
      case 'card': {
        const b = m.card.balance;
        if (!b)
          return m.card.code ? (
            <>
              <InstinctImage note={m.card} />
              <CodeText value={m.card.code} tail={!theirsNext} />
            </>
          ) : (
            <InstinctImage note={m.card} />
          );
        return (
          <>
            {bubble('balance', <span className={styles.lines}>{balanceText(b)}</span>, false)}
            <button type="button" className={styles.link} data-open-link onClick={() => openPage({ kind: 'balance' })}>
              <span className={styles.linkHero}>
                <span className={styles.linkHeadline}>{b.amount}</span>
                <span className={styles.linkWord}>Instinct</span>
              </span>
              <span className={styles.linkMeta}>
                <strong>Your balance</strong>
                <small>{INSTINCT_HOST}</small>
              </span>
            </button>
          </>
        );
      }
      case 'ask':
        return linksOut(m.ask) ? (
          <VaultLink m={m} onOpen={() => openLink(m.id)} />
        ) : (
          bubble('ask', <Detected text={askText(m.ask)} />, !theirsNext)
        );
      case 'chips':
        // The options' page is where you choose; the thread doesn't list them again (typing one still works).
        if (choosesProduct(i, all)) return null;
        return bubble('chips', <span className={styles.lines}>{chipsText(m)}</span>, !theirsNext);
      case 'work':
        return (
          <div className={styles.body}>
            <div className={`${styles.bubble} ${styles.typingBubble}`} data-bubble data-tail="bl">
              <TypingDots />
            </div>
            <span className={styles.tailIn} />
          </div>
        );
      case 'products':
        if (m.products.length === 1) return <ProductShot product={m.products[0]} />;
        return (
          <button type="button" className={styles.link} data-open-link onClick={() => openPage({ kind: 'options', id: m.id })}>
            <span className={`${styles.linkHero} ${styles.linkHeroOptions}`}>
              <Hatch src={m.products[0].image} className={styles.linkHatch} />
              <span className={styles.linkHeadlineSans}>{optionsTitle(m.products, m.query)}</span>
              <PagesGlyph />
              <span className={styles.linkWord}>Instinct</span>
            </span>
            <span className={styles.linkMeta}>
              <strong>{optionsTitle(m.products, m.query)}</strong>
              <small>{OPTIONS_HOST}</small>
            </span>
          </button>
        );
      case 'me': {
        // A reply to an ask or a choice shows what it answers, as iMessage's inline reply does.
        const answers =
          prev?.kind === 'ask' && !linksOut(prev.ask) ? prev : prev?.kind === 'chips' && !prev.expired ? prev : null;
        // Instinct only ever thumbs-ups what you send (recording 2).
        const tapback = m.react || (answers?.kind === 'ask' && answers.state === 'done') ? '👍' : undefined;
        const fresh = !opened.has(m.id);
        const tappedStill = !!tapback && tappedAtOpen(`tapback-${m.id}`);
        return (
          <div className={styles.meCol} data-tapped={tapback ? true : undefined}>
            {answers && (
              <motion.span
                className={styles.replyTo}
                initial={fresh ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <span className={styles.quote}>
                  {answers.kind === 'ask'
                    ? askText(answers.ask)
                    : answers.picked !== null
                      ? `${answers.picked + 1}. ${answers.chips[answers.picked].label}`
                      : chipsText(answers).split('\n')[0]}
                </span>
                <span className={styles.thread} />
              </motion.span>
            )}
            <SentBubble
              fresh={fresh}
              from={takeSentFrom}
              mark={
                tapback && (
                  // The cloud grows out of its tail, and the emoji pops in a beat later (recording 2, 29.53s).
                  <motion.span className={styles.tapback} initial={tappedStill ? false : { scale: 0 }} animate={{ scale: 1 }} transition={TAPBACK}>
                    <motion.span initial={tappedStill ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ ...TAPBACK, delay: 0.05 }}>
                      {tapback}
                    </motion.span>
                  </motion.span>
                )
              }
            >
              <Detected text={m.text} />
              <span className={styles.tailOut} />
            </SentBubble>
            {m.id === lastMe && <Receipt key={m.id} fresh={fresh} />}
          </div>
        );
      }
      case 'subagent':
        // While it works, a text; once it's done, a link to the conversation on app.instinct.com.
        return m.done ? (
          <button type="button" className={styles.link} onClick={() => openPage({ kind: 'thread', agent: m.agent })}>
            <span className={styles.linkHero}>
              <span className={styles.linkHeadline}>{m.agent.done}</span>
              <span className={styles.linkWord}>Instinct</span>
            </span>
            <span className={styles.linkMeta}>
              <strong>Conversation with {m.agent.name}</strong>
              <small>{INSTINCT_HOST}</small>
            </span>
          </button>
        ) : (
          bubble('sub', `on it. ${m.agent.working.toLowerCase()}…`, !theirsNext)
        );
      case 'meta':
        return null;
      case 'divider':
        return (
          <span className={styles.stamp}>
            <strong>{m.text}</strong>
          </span>
        );
      // Only Duet labels a run.
      case 'eyebrow':
        return null;
      default: {
        const exhaustive: never = m;
        return exhaustive;
      }
    }
  };

  const tone = dark ? 'light' : 'default';
  const showSafari = (view === 'safari' || switchTo !== null) && (open || page);

  return (
    <div className={styles.stage}>
      <div ref={messagesCard} className={styles.card} data-away={(view === 'safari' && !switchTo) || undefined}>
        <ChatFrame
          className={styles.screen}
          messages={thread}
          render={render}
          rowMotion={(m) => (m.kind === 'me' ? STILL : NATIVE_IN)}
          faceId={chat.authing}
          onFaceIdDone={chat.authed}
          gap={3}
          threadTop={178}
          composerBottom={28}
          composerHeight={40}
          edge={<ScrollEdge className={styles.edge} />}
          header={
            <div className={styles.nav}>
              <NoopButton label="Back" size={96} className={styles.back}>
                <GlassPill radius={22}>
                  <span className={styles.backRow}>
                    <span className={styles.glyph} style={mask(`${A}/back.svg`, 11, 19)} />
                    <span className={styles.badge}>233</span>
                  </span>
                </GlassPill>
              </NoopButton>
              <NoopButton label="FaceTime" className={styles.facetime}>
                <GlassDisc label="FaceTime" icon={`${A}/video.svg`} width={27} height={18} />
              </NoopButton>
              <div className={styles.contact}>
                <span className={styles.navInstinct}>
                  <img src={`${A}/logo.png`} alt="" width={10.4} height={28.9} />
                </span>
                <GlassPill radius={16} absolute className={styles.name}>
                  <span className={styles.nameRow}>
                    Instinct
                    <span className={styles.muted} style={mask(`${A}/chevron.svg`, 6, 11)} />
                  </span>
                </GlassPill>
              </div>
            </div>
          }
          composer={
            <div className={styles.composer}>
              <GlassPill radius={20} className={styles.plus}>
                <span className={styles.plusIcon}>
                  <span className={styles.glyph} style={mask(`${A}/plus.svg`, 16, 16)} />
                </span>
              </GlassPill>
              <GlassPill radius={20} className={styles.field}>
                <span ref={fieldRow} className={styles.fieldRow}>
                  <ComposerField chat={chat} placeholder="text Instinct to buy or send…" waiting={{ ask: 'reply yes, or type a change' }} className={styles.fieldText} />
                  {chat.composer ? (
                    <span className={styles.send} role="button" onClick={chat.send} data-ready={chat.canSend || undefined}>
                      <SfSymbol name="arrow.up" size={14} />
                    </span>
                  ) : (
                    <span className={`${styles.muted} ${styles.dictation}`} style={mask(`${A}/dictation.svg`, 18, 16)} />
                  )}
                </span>
              </GlassPill>
            </div>
          }
        />
        {switchTo && (
          <div className={styles.cardStatus}>
            <PhoneStatusBar tone={tone} />
          </div>
        )}
      </div>
      {showSafari && (
        <div ref={safariCard} className={styles.card} data-switching={switchTo !== null || undefined}>
          {open ? (
            <InstinctSafari ask={open.ask} state={open.state} onAllow={chat.allow} onDeny={chat.deny} onBack={back} />
          ) : (
            page &&
            (page.kind === 'thread' ? (
              <InstinctThreadPage agent={page.agent} onBack={back} />
            ) : page.kind === 'options' ? (
              <OptionsPage messages={chat.messages} id={page.id} onPick={(i) => chat.pick(i, true)} onBack={back} />
            ) : (
              <InstinctBalancePage
                account={chat.account()}
                onBack={back}
                onAction={(flow) => {
                  back();
                  chat.prompt(flow);
                }}
              />
            ))
          )}
          {switchTo && (
            <div className={styles.cardStatus}>
              <PhoneStatusBar tone={tone} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
