import { useEffect, useRef, useState } from 'react';
import { TextMorph } from 'torph/react';
import { IconArrowUp } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowUp';
import { IconGlobe } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconGlobe';
import { ChatFrame, ComposerField, NATIVE_IN, Said, TypingDots } from '../ChatFrame';
import { GlassDisc, GlassPill } from '../glass';
import type { AgentBalance, AskRow, Chip, Message, Product } from '../conversation';
import { askButtons, Divider, MetaLine, MORPH, NoteCard, RowGlyph, SubAgentRow, useSubAgentSheet } from '../parts';
import { useCardScan, VaultCardAsk } from '../vault/CardScan';
import type { AgentChatProps } from '../types';
import styles from './MuseChat.module.scss';

/** Muse, from recording 9 (refs/muse/spec.md) over Figma 87:259 and its dark 124:3873. */
const A = '/assets/agents/muse';

/** What the agent does in a browser: these show as the Browser card while they run. */
const BROWSING = new Set(['searching', 'filling', 'paying']);

/** The Browser card: Muse working a page for you, a blurred look at it, and Open browser. */
function BrowserCard({ status, waiting }: { status: string; waiting?: boolean }) {
  return (
    <div className={styles.browser}>
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

/** Muse balance as one of Muse's artifacts: dark stat tiles, the activity under them, then the actions. */
function BalanceArtifact({ balance }: { balance: AgentBalance }) {
  return (
    <div className={styles.artifact}>
      <span className={styles.artifactHead}>{balance.wallet}</span>
      <div className={styles.tiles}>
        <span className={styles.tileBig}>
          <small>Balance</small>
          <b>{balance.amount}</b>
          <em>{balance.note}</em>
        </span>
        <span className={styles.tile}>
          <small>Spent today</small>
          <b>{balance.spent.today}</b>
        </span>
        <span className={styles.tile}>
          <small>Daily limit</small>
          <b>{balance.spent.limit}</b>
        </span>
      </div>
      {balance.activity.length > 0 && (
        <div className={styles.artifactRows}>
          {balance.activity.map((r, i) => (
            <span key={`${r.title}-${i}`}>
              <span>
                {r.title}
                <small>{r.detail}</small>
              </span>
              <b data-in={r.incoming || undefined}>{r.amount}</b>
            </span>
          ))}
        </div>
      )}
      <span className={styles.artifactActions}>
        <span data-primary>Add money</span>
        <span>Card</span>
        <span>Send</span>
      </span>
    </div>
  );
}

/** What Muse found, as entity links in its bubble: a thumbnail, the name in bold, the price. */
function EntityLinks({ products }: { products: Product[] }) {
  return (
    <div className={styles.them}>
      {products.map((p, i) => (
        <span key={p.title} className={styles.entityLine}>
          {i > 0 && ' '}
          <img src={p.image} alt="" className={styles.entityThumb} />
          <strong className={styles.entity}>{p.title}</strong> at {p.price}
          {p.pick ? ' is my pick.' : i === 1 ? ', or' : '.'}
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

/** Agent bubbles, cards and choices join into one run: 6.5pt corners where they meet. */
const GROUPS = new Set<Message['kind']>(['them', 'card', 'chips']);

function groupPosition(i: number, all: Message[]) {
  const up = i > 0 && GROUPS.has(all[i - 1].kind);
  const down = i < all.length - 1 && GROUPS.has(all[i + 1].kind);
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
}: {
  chips: Chip[];
  picked: number | null;
  expired?: boolean;
  onPick: (i: number) => void;
  pos: string;
}) {
  const settled = picked !== null || !!expired;
  return (
    <div className={styles.choices} data-pos={pos}>
      {chips.map((c, i) => (
        <button
          key={c.label}
          type="button"
          className={styles.choice}
          data-state={picked === i ? 'selected' : settled ? 'dimmed' : 'open'}
          disabled={settled}
          onClick={() => onPick(i)}
        >
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
  onAllow,
  onDeny,
}: {
  m: Extract<Message, { kind: 'ask' }>;
  onAllow: () => void;
  onDeny: () => void;
}) {
  const { ask, state } = m;
  const b = askButtons(ask, state);
  const [ready, setReady] = useState(state !== 'open');
  useEffect(() => {
    if (ready) return;
    const t = window.setTimeout(() => setReady(true), 900);
    return () => window.clearTimeout(t);
  }, [ready]);
  return (
    <div className={styles.card} data-ready={ready || undefined}>
      <div className={styles.browserHead}>
        <span className={styles.globe}>
          <IconGlobe size={14} />
        </span>
        <span className={styles.browserTitle}>
          <strong>Checkout</strong>
          <small>{state === 'open' ? 'Waiting for you' : state === 'done' ? 'Done' : state === 'denied' ? 'Stopped' : state === 'expired' ? 'Expired' : 'Working'}</small>
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
              <span className={styles.productLetter}>{ask.who.name[0]}</span>
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
            <div
              key={row.text}
              className={styles.detail}
              data-tall={(row.sub?.length ?? 0) > 34 || undefined}
              data-pay={row.icon === 'meta' || undefined}
            >
              <span className={styles.lead}>
                <RowLead row={row} />
              </span>
              <span className={styles.detailText}>
                {row.icon === 'meta' ? (
                  <>
                    <span className={styles.payLines}>
                      {row.text}
                      {ask.method && (
                        <>
                          <br />
                          {ask.method}
                        </>
                      )}
                    </span>
                    <small className={styles.payWith}>
                      <img src={`${A}/meta-small.svg`} alt="" width={12} height={8} />
                      {row.sub}
                    </small>
                  </>
                ) : (
                  <>
                    <span className={styles.oneLine}>{row.text}</span>
                    {row.sub && <small>{row.sub}</small>}
                  </>
                )}
              </span>
              {row.icon === 'meta' && <span className={styles.chevron} />}
            </div>
          ))}
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
        <button
          type="button"
          className={styles.deny}
          data-chosen={state === 'denied' || undefined}
          disabled={!ready || b.settled || b.pressing}
          onClick={onDeny}
        >
          <TextMorph {...MORPH}>{b.denyLabel}</TextMorph>
        </button>
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

export function MuseChat({ chat }: AgentChatProps) {
  const sub = useSubAgentSheet(chat.messages);
  const scan = useCardScan({ wallet: 'Muse balance', messages: chat.messages, onAllow: chat.allow, onDeny: chat.deny });
  const render = (m: Message, i: number, all: Message[]) => {
    switch (m.kind) {
      case 'them':
        return (
          <Said
            typing={m.typing}
            className={`${styles.them} ${m.typing ? styles.typing : ''}`}
            pos={groupPosition(i, all)}
          >
            {m.text}
          </Said>
        );
      case 'me':
        return <span className={styles.me}>{m.text}</span>;
      case 'ask':
        if (m.ask.card) {
          return <VaultCardAsk ask={m.ask} state={m.state} onOpen={() => scan.open(m.id, m.ask)} onDeny={chat.deny} className={styles.vaultAsk} />;
        }
        return <ApprovalCard m={m} onAllow={chat.allow} onDeny={chat.deny} />;
      case 'card':
        if (m.card.balance) return <BalanceArtifact balance={m.card.balance} />;
        return (
          <div className={styles.noteWrap} data-pos={groupPosition(i, all)}>
            <NoteCard note={m.card} className={styles.note} />
          </div>
        );
      case 'chips':
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
          <BrowserCard status={m.status} />
        ) : (
          <span className={`${styles.them} ${styles.typing}`}>
            <TypingDots />
          </span>
        );
      case 'products':
        return <EntityLinks products={m.products} />;
      case 'meta':
        return <MetaLine meta={m.meta} />;
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
      rowMotion={() => NATIVE_IN}
      overlay={
        <>
          {sub.sheet}
          {scan.sheet}
        </>
      }
      faceId={chat.authing}
      onFaceIdDone={chat.authed}
      gap={0}
      threadTop={178}
      composerBottom={30}
      composerHeight={46}
      header={
        <>
          <div className={styles.menu}>
            <GlassDisc label="Menu" icon={`${A}/menu.svg`} width={32} height={32} />
          </div>
          <GlassPill radius={22} absolute className={styles.invite}>
            <span className={styles.inviteText}>Invite</span>
          </GlassPill>
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
    />
  );
}
