import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { PhoneStatusBar } from '@/apps/shared/AppShell/PhoneStatusBar';
import { playAppSwitch, WALLPAPER } from '@/apps/shared/appSwitch';
import { SfSymbol } from '@/apps/shared/icons';
import { ChatFrame, ComposerField, NATIVE_IN, Said, TypingDots, type RowMotion } from '../ChatFrame';
import { GlassDisc, GlassPill } from '../glass';
import type { AgentAsk, AgentBalance, AgentNote, Message, Product, SubAgent } from '../conversation';
import type { AgentChatProps } from '../types';
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

/** Your bubble rises from the field into place, as iMessage sends. */
const IMSG_SENT: RowMotion = {
  initial: { y: 34, scale: 0.98 },
  animate: { y: 0, scale: 1 },
  transition: { type: 'spring', stiffness: 420, damping: 38, mass: 1 },
};

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
  const what = ask.who ? `${ask.who.name}, ${ask.amount}` : `${ask.title}, ${ask.amount}`;
  const from = ask.method ? ` ${ask.method.replace(/^From /, 'from ')}.` : '';
  const verb = ask.who?.icon ? 'place the order' : 'send it';
  return `${what}.${from} reply yes and i’ll ${verb}`;
}

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

/** The balance, as the rich link to its page on app.instinct.com: the number in the serif, then the title and domain. */
function BalanceLink({ balance, onOpen }: { balance: AgentBalance; onOpen: () => void }) {
  return (
    <button type="button" className={styles.link} onClick={onOpen} aria-label={`${balance.wallet} ${balance.amount}`}>
      <span className={`${styles.linkHero} ${styles.balanceHero}`}>
        <span className={styles.balanceLabel}>{balance.wallet}</span>
        <strong className={styles.balanceAmount}>{balance.amount}</strong>
        <span className={styles.balanceSpent}>
          {balance.spent.today} of {balance.spent.limit} spent today
        </span>
        <span className={styles.linkWord}>Instinct</span>
      </span>
      <span className={styles.linkMeta}>
        <strong>{balance.wallet}</strong>
        <small>{INSTINCT_HOST}</small>
      </span>
    </button>
  );
}

/** Under your last message: Delivered, then Read with the time once Instinct has seen it. */
function Receipt() {
  const [read, setRead] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setRead(true), 1100);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <span className={styles.read}>
      {read ? (
        <>
          <b>Read</b> {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </>
      ) : (
        'Delivered'
      )}
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
            {state === 'done' ? 'Saved to your vault' : state === 'denied' ? 'Not now' : state === 'expired' ? 'Expired' : 'Saving…'}
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
  const [page, setPage] = useState<{ kind: 'balance'; balance: AgentBalance } | { kind: 'thread'; agent: SubAgent } | null>(null);
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

  // Once the page has its answer (or the request is gone), Safari hands back to Messages.
  const askState = open?.state;
  useEffect(() => {
    if (view !== 'safari' || switchTo) return;
    if (askState === 'open' || askState === 'pressing' || askState === 'authing') return;
    const t = window.setTimeout(back, askState === 'done' || askState === 'denied' ? RETURN_MS : 0);
    return () => window.clearTimeout(t);
  }, [view, switchTo, askState, back]);

  // A payment or a choice waits on a text: the likely answer is drafted, ready to send.
  const drafted = useRef(new Set<number>());
  const { composer, setComposer } = chat;
  useEffect(() => {
    const open = [...chat.messages]
      .reverse()
      .find((m) => (m.kind === 'ask' && m.state === 'open' && !m.ask.rows) || (m.kind === 'chips' && m.picked === null && !m.expired));
    if (!open || drafted.current.has(open.id)) return;
    drafted.current.add(open.id);
    if (!composer) setComposer(open.kind === 'chips' ? open.chips[0].label : 'Yes');
  }, [chat.messages, composer, setComposer]);
  const lastMe = chat.messages.reduce((id, m) => (m.kind === 'me' ? m.id : id), -1);

  const bubble = (key: string, body: ReactNode, tail: boolean) => (
    <div className={styles.body} key={key}>
      <div className={styles.bubble}>{body}</div>
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
            <Said typing={m.typing} className={styles.bubble}>
              <Detected text={m.text} />
            </Said>
            {!theirsNext && <span className={styles.tailIn} />}
          </div>
        );
      case 'card': {
        const b = m.card.balance;
        return b ? <BalanceLink balance={b} onOpen={() => openPage({ kind: 'balance', balance: b })} /> : <InstinctImage note={m.card} />;
      }
      case 'ask':
        return m.ask.rows ? (
          <VaultLink m={m} onOpen={() => openLink(m.id)} />
        ) : (
          bubble('ask', <Detected text={askText(m.ask)} />, !theirsNext)
        );
      case 'chips':
        return bubble('chips', <span className={styles.lines}>{chipsText(m)}</span>, !theirsNext);
      case 'work':
        return (
          <div className={styles.body}>
            <div className={`${styles.bubble} ${styles.typingBubble}`}>
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
          prev?.kind === 'ask' && !prev.ask.rows ? prev : prev?.kind === 'chips' ? prev : null;
        const tapback = m.react ?? (answers?.kind === 'ask' && answers.state === 'done' ? '👍' : undefined);
        return (
          <div className={styles.meCol}>
            {answers && (
              <span className={styles.replyTo}>
                <span className={styles.quote}>
                  {answers.kind === 'ask' ? askText(answers.ask) : chipsText(answers).split('\n')[0]}
                </span>
                <span className={styles.thread} />
              </span>
            )}
            <span className={styles.me}>
              <Detected text={m.text} />
              <span className={styles.tailOut} />
              {tapback && (
                <motion.span
                  className={styles.tapback}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 20, mass: 0.7 }}
                >
                  {tapback}
                </motion.span>
              )}
            </span>
            {m.id === lastMe && <Receipt key={m.id} />}
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
          rowMotion={(m) => (m.kind === 'me' ? IMSG_SENT : NATIVE_IN)}
          faceId={chat.authing}
          onFaceIdDone={chat.authed}
          gap={3}
          threadTop={178}
          composerBottom={28}
          composerHeight={40}
          edge={<div className={styles.edge} />}
          header={
            <div className={styles.nav}>
              <GlassPill radius={22} absolute className={styles.back}>
                <span className={styles.backRow}>
                  <span className={styles.glyph} style={mask(`${A}/back.svg`, 11, 19)} />
                  <span className={styles.badge}>233</span>
                </span>
              </GlassPill>
              <div className={styles.facetime}>
                <GlassDisc label="FaceTime" icon={`${A}/video.svg`} width={27} height={18} />
              </div>
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
                <span className={styles.fieldRow}>
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
            page &&
            (page.kind === 'balance' ? (
              <InstinctBalancePage balance={page.balance} onBack={back} />
            ) : (
              <InstinctThreadPage agent={page.agent} onBack={back} />
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
