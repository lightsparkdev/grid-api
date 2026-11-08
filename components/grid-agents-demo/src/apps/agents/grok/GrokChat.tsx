import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion, type Transition } from 'motion/react';
import { IconArrowUp } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowUp';
import { IconCheckmark1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckmark1';
import { IconChevronGrabberVertical } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronGrabberVertical';
import { IconClock } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconClock';
import { IconCrossSmall } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossSmall';
import { IconGlobe } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconGlobe';
import { IconHome } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconHome';
import { IconPaperPlane } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPaperPlane';
import { IconTag } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconTag';
import { Flag } from '@/apps/shared/Flag';
import { ChatFrame, ComposerField, NATIVE_IN, ScrollEdge, useOpenedMarks, type RowMotion, type ScrollCause, type ScrollCurve } from '../ChatFrame';
import { GlassDisc, GlassPill, NoopButton, ScanGlyph } from '../glass';
import type { AgentAsk, Chip, Message, Product } from '../conversation';
import { BalanceCard, Divider, NoteCard, SubAgentRow, useSubAgentSheet } from '../parts';
import { BankMark } from '../BankMark';
import { AppSheet } from '../sheet';
import { useAskSheet } from '../vault/useAskSheet';
import { bankDoneLabel } from '../vault/useBankPicker';
import { useGrokBalance } from './GrokBalance';
import { useGrokBank } from './GrokBank';
import type { AgentChatProps } from '../types';
import { GrokEyes } from './GrokEyes';
import styles from './GrokChat.module.scss';

/** Grok Bot, rebuilt from recordings 10-13 and IMG_1849-1857 (refs/grok/spec.md). */
const A = '/assets/agents/grok';
const mask = (src: string) => ({ maskImage: `url(${src})` });

type Ask = Extract<Message, { kind: 'ask' }>;

/** The composer turning into a card: critically damped, ~300ms (fitted: stiffness 975, damping 62). */
const COMPOSER_SPRING: Transition = { type: 'spring', stiffness: 975, damping: 62, mass: 1 };
/** The form sheet: cubic-bezier(0.30, 0.70, 0.20, 1) over 450ms. */
const SHEET_IN: Transition = { duration: 0.45, ease: [0.3, 0.7, 0.2, 1] };
/** Your bubble lands in place at once; its fill darkens from gray (see .me). */
const SENT: RowMotion = { initial: { opacity: 1 }, animate: { opacity: 1 }, transition: { duration: 0 } };
/**
 * Grok's reaction (recording 10, 97.85 to 98.55s): the emoji lands big (~30pt) in your bubble's bottom-right corner,
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

/** Grok's thread: the status row's swap to Typing… jumps; everything else rises on the shared ease-in-out. */
const grokScroll = (cause: ScrollCause): ScrollCurve =>
  cause === 'typing' ? 'snap' : { ms: 280, ease: [0.28, 0.05, 0.65, 1] };

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
        <span className={styles.choiceClose} aria-hidden>
          <IconCrossSmall size={16} />
        </span>
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
function Products({ products }: { products: Product[] }) {
  return (
    <div className={styles.products}>
      {products.map((p) => (
        <div key={p.title} className={styles.product}>
          <span className={styles.productImage}>
            <img src={p.image} alt="" />
          </span>
          <span className={styles.productText}>
            <strong>{p.title}</strong>
            {p.rating && <small>★ {p.rating}</small>}
            <span>{p.price}</span>
            <span className={styles.productMerchant}>
              <i>{p.merchant[0]}</i>
              {p.merchant}
            </span>
          </span>
        </div>
      ))}
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
function OrderCard({ m, onAllow, onDeny }: { m: Ask; onAllow: () => void; onDeny: () => void }) {
  const { ask, state } = m;
  const who = ask.who;
  const order = !!who?.icon || ask.allowed === 'Approved';
  const placing = state === 'pressing' || state === 'authing';
  // A bank's mark is its own tile (an app icon with the flag hanging off it), so it skips the outlined one.
  const tile = who?.bank ? (
    <BankMark bank={who.bank} country={who.flag} size={22} />
  ) : (
    <span className={styles.orderTile}>{who?.flag ? <Flag code={who.flag} size={20} /> : <span>{who?.mark ?? (who?.name ?? ask.title)[0]}</span>}</span>
  );
  const method = ask.method?.replace(/^From /, '');
  return (
    <div className={styles.order} data-state={state}>
      <div className={styles.orderHead}>
        {tile}
        <span>{who?.name ?? ask.title}</span>
        {state === 'done' && <small>{order ? 'PRP9GNCWF' : 'Settled'}</small>}
      </div>
      {state === 'done' ? (
        <>
          <strong className={styles.orderTitle}>{order ? 'Your order is confirmed' : 'Payment sent'}</strong>
          <span className={styles.orderSub}>{who?.detail.split(' · ')[0] ?? ask.title}</span>
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
  // The sheet keeps its ask while it slides away.
  const bank = useGrokBank({ messages: chat.messages, onAllow: chat.allow });
  const balance = useGrokBalance({ account: chat.account, onAction: chat.prompt });
  const form = useAskSheet(chat.messages, (a) => !!a.form && !a.bank);
  const working = chat.busy || chat.messages.some((m) => m.kind === 'work');
  const sub = useSubAgentSheet(chat.messages, SHEET_IN);

  const render = (m: Message, i: number, all: Message[]) => {
    switch (m.kind) {
      case 'them':
        if (m.typing) return <StatusRow label="Typing…" typing />;
        return (
          <>
            {m.sender && <span className={styles.sender}>{m.sender}</span>}
            <Bubble className={styles.bubble} {...neighbors(i, all, 'them')}>
              {m.text}
            </Bubble>
          </>
        );
      case 'me':
        return (
          <span className={styles.meWrap} data-reacted={m.react ? true : undefined}>
            <Bubble className={styles.me} {...neighbors(i, all, 'me')}>
              {m.text}
            </Bubble>
            {m.react && <Reaction emoji={m.react} still={reactedAtOpen(`react-${m.id}`)} />}
          </span>
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
        return <NoteCard note={m.card} className={styles.note} />;
      }
      case 'chips':
        return <ChoiceCard m={m} onPick={chat.pick} />;
      case 'work':
        return <StatusRow label={m.status} />;
      case 'products':
        return <Products products={m.products} />;
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
      default: {
        const exhaustive: never = m;
        return exhaustive;
      }
    }
  };

  const hasText = chat.composer.trim().length > 0;

  return (
    <div className={styles.stage}>
      <ChatFrame
        className={styles.screen}
        messages={chat.messages}
        render={render}
        rowMotion={(m) => (m.kind === 'me' ? SENT : NATIVE_IN)}
        scroll={grokScroll}
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
                  <ComposerField chat={chat} placeholder="Ask Grok Bot" className={styles.fieldText} onMultiline={setMultiline} />
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
