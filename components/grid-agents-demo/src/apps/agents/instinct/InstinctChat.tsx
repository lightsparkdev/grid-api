import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { PhoneStatusBar } from '@/apps/shared/AppShell/PhoneStatusBar';
import { playAppSwitch, WALLPAPER } from '@/apps/shared/appSwitch';
import { SfSymbol } from '@/apps/shared/icons';
import { ChatFrame, ComposerField, NATIVE_IN, Said, ScrollEdge, STILL, TypingDots, useOpenedIds } from '../ChatFrame';
import { GlassDisc, GlassPill, NoopButton } from '../glass';
import type { AgentAsk, AgentBalance, AgentNote, Message, Product, SubAgent } from '../conversation';
import type { AgentChatProps } from '../types';
import { INSTINCT_HOST, InstinctSafari, InstinctThreadPage } from './InstinctSafari';
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

/** Your bubble. Freshly sent, it flies out of the composer's field as iMessage's does. */
function SentBubble({ fresh, from, children }: { fresh: boolean; from: () => DOMRect | null; children: ReactNode }) {
  const bubble = useRef<HTMLSpanElement>(null);
  const ghost = useRef<HTMLSpanElement>(null);
  const [flying, setFlying] = useState(fresh);
  useLayoutEffect(() => {
    const el = bubble.current;
    const g = ghost.current;
    const col = el?.parentElement;
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
      <span ref={bubble} className={styles.me} data-bubble data-tail="br">
        {children}
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

/** A choice, as a numbered text to answer by typing. */
function chipsText(m: Extract<Message, { kind: 'chips' }>) {
  return `reply with one:\n${m.chips.map((c, i) => `${i + 1}. ${c.label}`).join('\n')}`;
}

const today = () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

/** An image Instinct generates: its paper, the headline in its serif, the details, its wordmark. */
function InstinctImage({ note }: { note: AgentNote }) {
  return (
    <div className={styles.image} role="img" aria-label={note.title}>
      <span className={styles.imageTop}>
        <span className={styles.wordmark}>Instinct</span>
        <span>{today()}</span>
      </span>
      <strong className={styles.imageTitle}>{note.title}</strong>
      {note.code && <code className={styles.imageCode}>{note.code}</code>}
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

/** The balance, as Instinct texts it: the number, then what's left of today. */
function balanceText(b: AgentBalance) {
  return `${b.amount} in your ${b.wallet}\n${b.spent.today} of ${b.spent.limit} spent today`;
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

/** What Instinct found, as the product image it sends: the photo, how many it found, brand, title, price. */
function ProductImage({ products }: { products: Product[] }) {
  const p = products.find((x) => x.pick) ?? products[0];
  return (
    <div className={styles.productStack} role="img" aria-label={p.title}>
      <span className={styles.stackBack} />
      <div className={styles.productImage}>
        <span className={styles.productPhoto}>
          <img src={p.image} alt="" />
          <i className={styles.count}>{products.length}</i>
        </span>
        <span className={styles.productBrand}>{p.merchant}</span>
        <strong>{p.title}</strong>
        <span className={styles.productPrice}>{p.price}</span>
        <span className={styles.imageTop}>
          <span>{today()}</span>
          <span className={styles.wordmark}>Instinct</span>
        </span>
      </div>
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
  const [view, setView] = useState<'messages' | 'safari'>('messages');
  const [switchTo, setSwitchTo] = useState<'messages' | 'safari' | null>(null);
  const [linkId, setLinkId] = useState<number | null>(null);
  const [page, setPage] = useState<{ kind: 'thread'; agent: SubAgent } | null>(null);
  const open = chat.messages.find((m): m is Ask => m.kind === 'ask' && m.id === linkId);

  const openLink = (id: number) => {
    if (switchTo || view !== 'messages') return;
    setPage(null);
    setLinkId(id);
    setSwitchTo('safari');
  };
  const openPage = (next: NonNullable<typeof page>) => {
    if (switchTo || view !== 'messages') return;
    setLinkId(null);
    setPage(next);
    setSwitchTo('safari');
  };
  const back = useCallback(() => {
    if (switchTo || view !== 'safari') return;
    setSwitchTo('messages');
  }, [switchTo, view]);

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
  const { composer, setComposer } = chat;
  useEffect(() => {
    const open = [...chat.messages]
      .reverse()
      .find((m) => (m.kind === 'ask' && m.state === 'open' && !linksOut(m.ask)) || (m.kind === 'chips' && m.picked === null && !m.expired));
    if (!open || drafted.current.has(open.id)) return;
    drafted.current.add(open.id);
    if (!composer) setComposer(open.kind === 'chips' ? open.chips[0].label : 'Yes');
  }, [chat.messages, composer, setComposer]);
  const lastMe = chat.messages.reduce((id, m) => (m.kind === 'me' ? m.id : id), -1);

  const opened = useOpenedIds(chat.messages);

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
        return b ? bubble('balance', <span className={styles.lines}>{balanceText(b)}</span>, !theirsNext) : <InstinctImage note={m.card} />;
      }
      case 'ask':
        return linksOut(m.ask) ? (
          <VaultLink m={m} onOpen={() => openLink(m.id)} />
        ) : (
          bubble('ask', <Detected text={askText(m.ask)} />, !theirsNext)
        );
      case 'chips':
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
        return <ProductImage products={m.products} />;
      case 'me': {
        // A reply to an ask or a choice shows what it answers, as iMessage's inline reply does.
        const answers =
          prev?.kind === 'ask' && !linksOut(prev.ask) ? prev : prev?.kind === 'chips' ? prev : null;
        // Instinct only ever thumbs-ups what you send (recording 2).
        const tapback = m.react || (answers?.kind === 'ask' && answers.state === 'done') ? '👍' : undefined;
        const fresh = !opened.has(m.id);
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
            <SentBubble fresh={fresh} from={takeSentFrom}>
              <Detected text={m.text} />
              <span className={styles.tailOut} />
              {tapback && (
                // The cloud grows out of its tail, and the emoji pops in a beat later (recording 2, 29.53s).
                <motion.span
                  className={styles.tapback}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={TAPBACK}
                >
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...TAPBACK, delay: 0.05 }}>
                    {tapback}
                  </motion.span>
                </motion.span>
              )}
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
          messages={chat.messages}
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
                  <ComposerField chat={chat} placeholder="iMessage" className={styles.fieldText} />
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
            page && <InstinctThreadPage agent={page.agent} onBack={back} />
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
