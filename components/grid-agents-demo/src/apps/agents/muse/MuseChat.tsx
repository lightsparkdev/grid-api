import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { TextMorph } from 'torph/react';
import { IconArrowUp } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowUp';
import { IconChevronRight } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronRight';
import { IconGlobe } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconGlobe';
import { IconWallet1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconWallet1';
import { ChatFrame, ComposerField, ScrollEdge, STILL, TypingDots, useOpenedIds, type RowMotion, type ScrollCause, type ScrollCurve } from '../ChatFrame';
import { GlassDisc, GlassPill, NoopButton } from '../glass';
import type { AgentBalance, AskRow, Chip, Message, Product } from '../conversation';
import { askButtons, Divider, MetaLine, MORPH, NoteCard, RowGlyph, SubAgentRow, useSubAgentSheet } from '../parts';
import { BankMark } from '../BankMark';
import { useMuseBalance } from './MuseBalance';
import { ConnectorCard, useMuseBank, useMuseCard, useMusePayWith } from './MuseConnect';
import type { AgentChatProps } from '../types';
import styles from './MuseChat.module.scss';

/** Muse, from recording 9 (refs/muse/spec.md) over Figma 87:259 and its dark 124:3873. */
const A = '/assets/agents/muse';

/** What the agent does in a browser: these show as the Browser card while they run. */
const BROWSING = new Set(['searching', 'filling', 'paying']);

/** The Browser card: Muse working a page for you, a blurred look at it, and Open browser. */
function BrowserCard({ status, waiting, pos }: { status: string; waiting?: boolean; pos?: string }) {
  return (
    <div className={styles.browser} data-pos={pos}>
      <div className={styles.browserHead}>
        <span className={styles.globe}>
          <IconGlobe size={14} />
        </span>
        <span className={styles.browserTitle}>
          <strong>Browser</strong>
          <small>{waiting ? 'Waiting' : status.replace(/^\S+\s/, '')}</small>
        </span>
      </div>
      <div className={styles.preview} aria-hidden>
        <span className={styles.previewBar} />
        <span className={styles.previewHero} />
        <span className={styles.previewLine} />
        <span className={styles.previewLine} data-short />
      </div>
      <span className={styles.openBrowser}>Open browser</span>
    </div>
  );
}

/** Muse balance as one of Muse's artifacts: the balance tile; tapping it opens the balance page. */
function BalanceArtifact({ balance, onOpen, pos }: { balance: AgentBalance; onOpen: () => void; pos?: string }) {
  return (
    <button type="button" className={`${styles.artifact} ${styles.balanceArtifact}`} data-opens-sheet data-pos={pos} onClick={onOpen}>
      <span className={styles.artifactHead}>
        {balance.wallet}
        <IconChevronRight size={14} />
      </span>
      <span className={styles.tileBig}>
        <small>Balance</small>
        <b>{balance.amount}</b>
        <em>{balance.note}</em>
      </span>
    </button>
  );
}

/** What Muse found, as entity links in its bubble: a thumbnail, the name in bold, the price. */
function EntityLinks({ products, pos }: { products: Product[]; pos?: string }) {
  return (
    <div className={styles.them} data-bubble data-pos={pos}>
      {products.map((p, i) => (
        <span key={p.title} className={styles.entityLine}>
          {i > 0 && ' '}
          <img src={p.image} alt="" className={styles.entityThumb} />
          <strong className={styles.entity}>{p.title}</strong> at {p.price}
          {p.pick && products.length > 1 ? ' is my pick.' : i === 1 ? ', or' : '.'}
        </span>
      ))}
    </div>
  );
}

type AvatarMode = 'idle' | 'working' | 'still';

/**
 * muse.ai's own avatar loops: idle, working, and the full-body still while it
 * needs approval, crossfaded on change. The hidden loop pauses so only one plays.
 */
function MuseAvatar({ mode }: { mode: AvatarMode }) {
  const idle = useRef<HTMLVideoElement>(null);
  const working = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const live = mode === 'idle' ? idle.current : mode === 'working' ? working.current : null;
    for (const v of [idle.current, working.current]) {
      if (!v) continue;
      if (v === live) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else {
        const el = v;
        window.setTimeout(() => el.pause(), 300);
      }
    }
  }, [mode]);
  return (
    <div className={styles.avatar} aria-hidden>
      <video ref={idle} src={`${A}/hatch.mp4`} muted loop playsInline autoPlay data-on={mode === 'idle' || undefined} />
      <video ref={working} src={`${A}/hatch-working.mp4`} muted loop playsInline data-on={mode === 'working' || undefined} />
      <img src={`${A}/hatch-still.png`} alt="" draggable={false} data-on={mode === 'still' || undefined} />
    </div>
  );
}

/** Everything the agent sends joins into one run: bubbles, cards, choices, asks, products. 6.5pt corners where they meet. */
const GROUPS = new Set<Message['kind']>(['them', 'card', 'chips', 'ask', 'products', 'work']);

/** Choices right under a question ride inside its bubble (IMG_1938), so they aren't a row of their own. */
const inBubble = (i: number, all: Message[]) => {
  const above = all[i - 1];
  return all[i]?.kind === 'chips' && above?.kind === 'them' && !above.typing;
};

/** A saved-card or linked-bank line right under its connector card, which already says it: drawn as nothing. */
const repeatsCard = (i: number, all: Message[]) => {
  const m = all[i];
  const prev = all[i - 1];
  return m?.kind === 'meta' && m.meta.icon === 'check' && prev?.kind === 'ask' && prev.state === 'done' && !!(prev.ask.bank || prev.ask.card);
};

function groupPosition(i: number, all: Message[]) {
  let above = i - 1;
  while (above >= 0 && repeatsCard(above, all)) above -= 1;
  let below = i + 1;
  while (below < all.length && repeatsCard(below, all)) below += 1;
  if (inBubble(below, all)) below += 1;
  const up = above >= 0 && GROUPS.has(all[above].kind);
  const down = below < all.length && GROUPS.has(all[below].kind);
  if (up && down) return 'middle';
  if (up) return 'last';
  if (down) return 'first';
  return 'single';
}

function RowLead({ row }: { row: AskRow }) {
  if (row.image) return <img className={styles.product} src={row.image} alt="" width={32} height={32} />;
  switch (row.icon) {
    case 'truck':
      return <span className={styles.glyph} style={{ maskImage: `url(${A}/truck.png)` }} />;
    case 'envelope':
      return <span className={styles.glyph} style={{ maskImage: `url(${A}/envelope.png)` }} />;
    case 'meta':
      return <img src={`${A}/meta.svg`} alt="" width={24} height={16} />;
    default:
      return (
        <span className={styles.symbol}>
          <RowGlyph row={row} size={18} />
        </span>
      );
  }
}

/** Muse's choices: dashed chips in the agent's bubble; the pick takes a solid outline and a check. */
function Choices({
  chips,
  picked,
  expired,
  onPick,
  pos,
  inline,
}: {
  chips: Chip[];
  picked: number | null;
  expired?: boolean;
  onPick: (i: number) => void;
  pos?: string;
  /** Inside the question's bubble, under its text. */
  inline?: boolean;
}) {
  const settled = picked !== null || !!expired;
  return (
    <div className={`${styles.choices} ${inline ? styles.inline : ''}`} data-pos={pos}>
      {chips.map((c, i) => (
        <button
          key={c.label}
          type="button"
          className={styles.choice}
          data-state={picked === i ? 'selected' : settled ? 'dimmed' : 'open'}
          disabled={settled}
          onClick={() => onPick(i)}
        >
          <svg className={styles.choiceDash} aria-hidden>
            <rect />
          </svg>
          <span>{c.label}</span>
          {picked === i && <span className={styles.choiceCheck} />}
        </button>
      ))}
    </div>
  );
}

/**
 * Meta Pay's approval sheet: what the agent wants, the details, the total, Deny
 * or Allow. Payment and Total settle in after a beat, as Meta Pay loads them.
 */
function ApprovalCard({
  m,
  pos,
  onAllow,
  onDeny,
  onPay,
}: {
  m: Extract<Message, { kind: 'ask' }>;
  pos?: string;
  onAllow: () => void;
  onDeny: () => void;
  /** The Pay with row, when the checkout can switch what pays. */
  onPay: () => void;
}) {
  const { ask, state } = m;
  const b = askButtons(ask, state);
  const [ready, setReady] = useState(state !== 'open');
  useEffect(() => {
    if (ready) return;
    const t = window.setTimeout(() => setReady(true), 900);
    return () => window.clearTimeout(t);
  }, [ready]);
  // A payment is a checkout Muse is holding open; setting up or changing the balance is Muse asking about itself.
  const checkout = !!(ask.amount || ask.total);
  return (
    <div className={styles.card} data-ready={ready || undefined} data-pos={pos}>
      <div className={styles.browserHead}>
        <span className={styles.globe}>{checkout ? <IconGlobe size={14} /> : <IconWallet1 size={14} />}</span>
        <span className={styles.browserTitle}>
          <strong>{checkout ? 'Checkout' : ask.rows?.some((r) => r.icon === 'wallet') ? 'Muse balance' : 'Muse'}</strong>
          <small>
            {state === 'open'
              ? checkout
                ? 'Waiting for you'
                : 'Needs you'
              : state === 'done'
                ? 'Done'
                : state === 'denied'
                  ? 'Stopped'
                  : state === 'expired'
                    ? 'Expired'
                    : 'Working'}
          </small>
        </span>
      </div>
      <div className={styles.cardTitle}>
        <span>{ask.title}</span>
        {ask.badge && <span className={styles.merchant}>{ask.badge}</span>}
      </div>
      {ask.who && (
        <div className={styles.details}>
          <div className={styles.detail}>
            <span className={styles.lead}>
              {ask.who.bank ? (
                <BankMark bank={ask.who.bank} country={ask.who.flag} size={32} />
              ) : (
                <span className={styles.productLetter}>{ask.who.name[0]}</span>
              )}
            </span>
            <span className={styles.detailText}>
              <span className={styles.oneLine}>{ask.who.name}</span>
              <small>{ask.who.detail}</small>
            </span>
          </div>
        </div>
      )}
      {ask.rows && (
        <div className={styles.details}>
          {ask.rows.map((row) => (
            <div key={row.text} className={styles.detail} data-tall={(row.sub?.length ?? 0) > 34 || undefined}>
              <span className={styles.lead}>
                <RowLead row={row} />
              </span>
              <span className={styles.detailText}>
                <span className={styles.oneLine}>{row.text}</span>
                {row.sub && <small>{row.sub}</small>}
              </span>
            </div>
          ))}
        </div>
      )}
      {ask.payWith && (
        // The whole row switches what pays, while the checkout is open and has another way to pay.
        <div
          className={`${styles.total} ${styles.payRow}`}
          role={ask.pay && state === 'open' ? 'button' : undefined}
          data-switch={(ask.pay && state === 'open') || undefined}
          onClick={ask.pay && state === 'open' ? onPay : undefined}
        >
          <span>Pay with</span>
          <span className={styles.payValue}>
            {ask.payWith}
            {ask.method && <small>{ask.method}</small>}
          </span>
          <span className={styles.chevronSmall} />
        </div>
      )}
      {(ask.total ?? ask.amount) && (
        <div className={styles.total}>
          <span>Total</span>
          <span>{ask.total ?? ask.amount}</span>
          <span className={styles.chevronSmall} />
        </div>
      )}
      {!ask.rows && ask.method && <p className={styles.method}>{ask.method}</p>}
      <div className={styles.actions} data-state={state}>
        {ask.deny && (
          <button
            type="button"
            className={styles.deny}
            data-chosen={state === 'denied' || undefined}
            disabled={!ready || b.settled || b.pressing}
            onClick={onDeny}
          >
            <TextMorph {...MORPH}>{b.denyLabel}</TextMorph>
          </button>
        )}
        <button
          type="button"
          className={styles.allow}
          data-pressing={b.pressing || undefined}
          data-done={state === 'done' || undefined}
          disabled={!ready || b.settled || b.pressing}
          onClick={onAllow}
        >
          <TextMorph {...MORPH}>{b.allowLabel}</TextMorph>
        </button>
      </div>
      {ask.legal && (
        <p className={styles.legal}>
          By clicking allow, you agree to share order info with {ask.legal} and accept {ask.legal}’s{' '}
          <em>Refund Policy</em>, <em>Privacy Policy</em> and <em>Terms of Service</em>.
        </p>
      )}
    </div>
  );
}

/** Your bubble as Muse sends it (recording 9, 30.08s): the fill lands pale and its text fades in over ~70ms. */
function SentBubble({ fresh, children }: { fresh: boolean; children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!fresh || !el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const css = getComputedStyle(el);
    const fill = css.backgroundColor;
    const ink = css.color;
    const a = el.animate(
      [
        { backgroundColor: `color-mix(in srgb, ${fill} 65%, transparent)`, color: 'transparent', offset: 0 },
        { backgroundColor: `color-mix(in srgb, ${fill} 85%, transparent)`, color: 'transparent', offset: 0.43 },
        { backgroundColor: fill, color: ink, offset: 1 },
      ],
      { duration: 117, easing: 'ease-out' },
    );
    return () => a.cancel();
    // A bubble is sent once, on mount.
  }, []);
  return (
    <span ref={ref} className={styles.me} data-bubble>
      {children}
    </span>
  );
}

/** Muse streams its replies (recording 9, 62.8s): a short first chunk replaces the dots, then a line or two every ~100ms. */
const STREAM = { first: 22, chunk: 60, everyMs: 100 } as const;

/** The end of the chunk that starts at `from`, on a word boundary. */
function chunkEnd(text: string, from: number, size: number) {
  if (from + size >= text.length) return text.length;
  const space = text.indexOf(' ', from + size);
  return space < 0 ? text.length : space;
}

function Streamed({ text, fresh }: { text: string; fresh: boolean }) {
  const [shown, setShown] = useState(() => (fresh ? chunkEnd(text, 0, STREAM.first) : text.length));
  useEffect(() => {
    if (shown >= text.length) return;
    const t = window.setTimeout(() => setShown((n) => chunkEnd(text, n, STREAM.chunk)), STREAM.everyMs);
    return () => window.clearTimeout(t);
  }, [shown, text]);
  return <>{text.slice(0, shown)}</>;
}

/**
 * Muse's arrivals. Recording 9 jumps the thread and pops each row in; here a new row (a reply, a card, the typing
 * bubble) fades up into place and the thread glides to it, while each streamed chunk still lands at once.
 */
const MUSE_EASE: [number, number, number, number] = [0.25, 0.8, 0.25, 1];
const MUSE_IN: RowMotion = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, ease: MUSE_EASE } };
const museScroll = (cause: ScrollCause): ScrollCurve => (cause === 'grow' ? 'snap' : { ms: 300, ease: MUSE_EASE });

/** Muse's tab bar (IMG_1862, Figma Tab Bar - iPhone): icon, left and top in pt, width, height. */
const TABS = [
  ['tab-chat', 52, 811, 25.3, 22.7],
  ['tab-feed', 122, 810, 22.7, 22.7],
  ['tab-ideas', 192, 810, 17.7, 23.3],
  ['tab-goals', 258, 810, 22.7, 22.7],
  ['tab-library', 326, 811, 22, 21.7],
] as const;

export function MuseChat({ chat }: AgentChatProps) {
  const openedIds = useOpenedIds(chat.messages);
  const sub = useSubAgentSheet(chat.messages);
  const card = useMuseCard({ messages: chat.messages, onAllow: chat.allow });
  const bank = useMuseBank({ messages: chat.messages, onAllow: chat.allow });
  const balance = useMuseBalance({ account: chat.account, onAction: chat.prompt });
  const payWith = useMusePayWith({ messages: chat.messages, onSwap: chat.swap });
  const render = (m: Message, i: number, all: Message[]) => {
    switch (m.kind) {
      case 'them': {
        const next = inBubble(i + 1, all) ? all[i + 1] : null;
        return (
          <div
            className={`${styles.them} ${m.typing ? styles.typing : ''}`}
            data-bubble
            data-pos={groupPosition(i, all)}
            data-choices={next ? true : undefined}
            data-fill={next ? true : undefined}
          >
            {m.typing ? <TypingDots /> : <Streamed text={m.text} fresh={!openedIds.has(m.id)} />}
            {next?.kind === 'chips' && <Choices chips={next.chips} picked={next.picked} expired={next.expired} onPick={chat.pick} inline />}
          </div>
        );
      }
      case 'me':
        return <SentBubble fresh={!openedIds.has(m.id)}>{m.text}</SentBubble>;
      case 'ask':
        if (m.ask.bank) return <ConnectorCard ask={m.ask} state={m.state} pos={groupPosition(i, all)} onOpen={() => bank.open(m.id, m.ask)} />;
        if (m.ask.card) return <ConnectorCard ask={m.ask} state={m.state} pos={groupPosition(i, all)} onOpen={() => card.open(m.id, m.ask)} />;
        return <ApprovalCard m={m} pos={groupPosition(i, all)} onAllow={chat.allow} onDeny={chat.deny} onPay={() => payWith.open(m.id, m.ask)} />;
      case 'card': {
        const b = m.card.balance;
        if (b) return <BalanceArtifact balance={b} pos={groupPosition(i, all)} onOpen={() => balance.open(b.wallet)} />;
        return (
          <div className={styles.noteWrap} data-pos={groupPosition(i, all)}>
            <NoteCard note={m.card} className={styles.note} />
          </div>
        );
      }
      case 'chips':
        if (inBubble(i, all)) return null;
        return (
          <Choices
            chips={m.chips}
            picked={m.picked}
            expired={m.expired}
            onPick={chat.pick}
            pos={groupPosition(i, all)}
          />
        );
      case 'tag':
      case 'stamp':
        return <span className={styles.stamp}>{m.text}</span>;
      case 'work':
        return BROWSING.has(m.key) ? (
          <BrowserCard status={m.status} pos={groupPosition(i, all)} />
        ) : (
          <span className={`${styles.them} ${styles.typing}`} data-bubble>
            <TypingDots />
          </span>
        );
      case 'products':
        return <EntityLinks products={m.products} pos={groupPosition(i, all)} />;
      case 'meta': {
        if (repeatsCard(i, all)) return null;
        return <MetaLine meta={m.meta} />;
      }
      case 'divider':
        return <Divider text={m.text} />;
      case 'subagent':
        return <SubAgentRow agent={m.agent} done={m.done} onOpen={() => sub.open(m.id)} />;
      default: {
        const exhaustive: never = m;
        return exhaustive;
      }
    }
  };

  const avatar: AvatarMode = chat.asking ? 'still' : chat.busy ? 'working' : 'idle';
  const work = chat.messages.find((m): m is Extract<Message, { kind: 'work' }> => m.kind === 'work');
  const subtitle = chat.asking ? 'Needs approval' : work ? work.status : chat.busy ? 'is working' : '';

  return (
    <ChatFrame
      className={styles.screen}
      messages={chat.messages}
      render={render}
      rowMotion={(m) => (m.kind === 'me' || openedIds.has(m.id) ? STILL : MUSE_IN)}
      scroll={museScroll}
      overlay={
        <>
          {sub.sheet}
          {card.sheet}
          {bank.sheet}
          {balance.sheet}
          {payWith.sheet}
        </>
      }
      faceId={chat.authing}
      onFaceIdDone={chat.authed}
      gap={0}
      threadTop={178}
      edge={<ScrollEdge className={styles.edge} />}
      composerBottom={91}
      composerHeight={46}
      header={
        <>
          <NoopButton label="Menu" className={styles.menu}>
            <GlassDisc label="Menu" icon={`${A}/menu.svg`} width={32} height={32} />
          </NoopButton>
          <NoopButton label="Call or send a gift" size={100} className={styles.callGift}>
            <GlassPill radius={22}>
              <span className={styles.callGiftRow}>
                <span className={styles.callGiftIcon} style={{ maskImage: 'url(/assets/agents/dot/phone.svg)', maskSize: '126%' }} />
                <span className={styles.callGiftIcon} style={{ maskImage: `url(${A}/gift.svg)` }} />
              </span>
            </GlassPill>
          </NoopButton>
          <GlassPill radius={16} absolute className={styles.status}>
            <span className={styles.statusText}>
              <strong>Muse</strong>
              {subtitle && (
                <span data-asking={chat.asking || undefined}>
                  <TextMorph {...MORPH}>{subtitle}</TextMorph>
                </span>
              )}
            </span>
          </GlassPill>
          <MuseAvatar mode={avatar} />
        </>
      }
      composer={
        <GlassPill radius={22} className={styles.composer}>
          <span className={styles.composerRow}>
            <span className={styles.slot}>
              <span className={styles.icon} style={{ maskImage: `url(${A}/plus.svg)` }} />
            </span>
            <ComposerField chat={chat} placeholder="Message" className={styles.field} />
            {chat.composer ? (
              <span className={styles.slot} role="button" aria-label="Send" onClick={chat.send}>
                <span className={styles.sendCircle} data-ready={chat.canSend || undefined}>
                  <IconArrowUp size={18} />
                </span>
              </span>
            ) : (
              <>
                <span className={styles.slot}>
                  <span className={styles.mic} style={{ maskImage: `url(${A}/mic.svg)` }} />
                </span>
                {chat.busy && (
                  <span className={styles.slot}>
                    <span className={styles.circle} aria-label="Stop">
                      <span className={styles.stopSquare} />
                    </span>
                  </span>
                )}
              </>
            )}
          </span>
        </GlassPill>
      }
      tabBar={
        <div className={styles.tabBar}>
          <GlassPill radius={29} absolute className={styles.tabPill}>
            <span className={styles.tabSelected} />
          </GlassPill>
          {TABS.map(([icon, x, y, w, h]) => (
            <span
              key={icon}
              className={styles.tabIcon}
              style={{ left: x, top: y - 779, width: w, height: h, maskImage: `url(${A}/${icon}.png)` }}
            />
          ))}
        </div>
      }
    />
  );
}
