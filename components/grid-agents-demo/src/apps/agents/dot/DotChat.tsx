import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, type Transition } from 'motion/react';
import { IconArrowUp } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowUp';
import { IconCheckmark1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckmark1';
import { IconChevronRight } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronRight';
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossMedium';
import { Flag } from '@/apps/shared/Flag';
import { ChatFrame, ComposerField, NATIVE_IN, Said, TypingDots } from '../ChatFrame';
import { GlassDisc, GlassPill } from '../glass';
import type { AgentAsk, AgentBalance, Message, Product } from '../conversation';
import { BalanceCard, BalanceDetail, Divider, MetaLine, NoteCard, SubAgentRow, useSubAgentSheet } from '../parts';
import { useCardScan } from '../vault/CardScan';
import { AppSheet } from '../sheet';
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
  return products.map((p) => `- **${p.title}**, ${p.price} at ${p.merchant}${p.pick ? ' (my pick)' : ''}`).join('\n');
}

/** Dots' mark: the blue blob, as the logo in its sheets and pills. */
function DotsMark({ size }: { size: number }) {
  return (
    <span className={styles.mark} style={{ width: size, height: size }}>
      <img src={`${A}/avatar.png`} alt="" />
    </span>
  );
}

/** The action pill: Dots' mark, what it does, then + (waiting), a spinner (working) or a check. */
function ActionPill({ m, onOpen }: { m: Ask; onOpen: () => void }) {
  const { ask, state } = m;
  const pending = state === 'pressing' || state === 'authing';
  const label = ask.form?.title ?? ask.title;
  return (
    <button type="button" className={styles.pill} data-state={state} disabled={state !== 'open'} onClick={onOpen} data-opens-sheet>
      <DotsMark size={22} />
      <span>{state === 'done' ? (ask.allowed ?? 'Done') : state === 'denied' ? (ask.denied ?? 'Not now') : label}</span>
      <span className={styles.pillEnd}>
        {pending ? <i className={styles.spinner} /> : state === 'done' ? <IconCheckmark1 size={16} /> : state === 'open' ? '+' : null}
      </span>
    </button>
  );
}

/** The setup sheet: a floating card with Dots' mark, the terms in plain words, Not now and the black button. */
function SetupSheet({ ask, onAllow, onDeny, onClose }: { ask: AgentAsk; onAllow: () => void; onDeny: () => void; onClose: () => void }) {
  return (
    <div className={styles.setup}>
      <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
        <IconCrossMedium size={18} />
      </button>
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
          Your dot can only spend what’s in your Dots balance, inside these limits. You can turn it off any time in{' '}
          <u>Settings</u>.
        </p>
      </div>
      <button type="button" className={styles.notNow} onClick={onDeny}>
        {ask.deny ?? 'Not now'}
      </button>
      <button type="button" className={styles.black} onClick={onAllow}>
        {ask.allow ?? 'Turn on'}
      </button>
    </div>
  );
}

/** The pay sheet: Dots' own checkout. It prepares, then shows the payment with Decline and Approve. */
function PaySheet({ ask, onAllow, onDeny, onClose }: { ask: AgentAsk; onAllow: () => void; onDeny: () => void; onClose: () => void }) {
  const [ready, setReady] = useState(false);
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
        <button type="button" className={styles.payDisc} aria-label="Close" onClick={onClose}>
          <IconCrossMedium size={18} />
        </button>
        <strong>Dots</strong>
        <span className={styles.payDisc} aria-hidden>
          <span className={styles.burger} />
        </span>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {!ready ? (
          <motion.div key="prep" className={styles.preparing} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <DotsMark size={44} />
            <strong>Preparing your checkout…</strong>
            <i className={styles.spinner} />
          </motion.div>
        ) : (
          <motion.div key="pay" className={styles.payBody} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <span className={styles.payMarks}>
              <DotsMark size={44} />
              <span className={styles.payWho}>
                {who?.flag ? <Flag code={who.flag} size={44} /> : who?.icon ? <img src={who.icon} alt="" /> : (who?.name ?? ask.title)[0]}
              </span>
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
                  <span>Ship to</span>
                  <p>
                    {PERSON.full}
                    <br />
                    {ADDRESS}
                  </p>
                </div>
              ) : (
                <div>
                  <span>Send to</span>
                  <p>{who?.detail}</p>
                </div>
              )}
              {method && (
                <div>
                  <span>Pay with</span>
                  <p className={styles.balanceRow}>
                    <DotsMark size={20} />
                    {method}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={styles.payActions}>
        <button type="button" className={styles.decline} onClick={onDeny}>
          {ask.deny ?? 'Decline'}
        </button>
        <button type="button" className={styles.approve} onClick={onAllow} disabled={!ready}>
          {ask.allow ?? 'Approve'}
        </button>
      </div>
    </div>
  );
}

/** Dots balance's sheet: the floating card with the amount, the limits, recent activity and Add money. */
function BalanceSheet({ balance, onClose }: { balance: AgentBalance; onClose: () => void }) {
  return (
    <div className={styles.setup}>
      <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
        <IconCrossMedium size={18} />
      </button>
      <span className={styles.setupMarks}>
        <DotsMark size={44} />
      </span>
      <span className={styles.balanceLabel}>{balance.wallet}</span>
      <strong className={styles.balanceAmount}>{balance.amount}</strong>
      <BalanceDetail balance={balance} className={styles.balanceDetail} />
      <button type="button" className={styles.black} onClick={onClose}>
        Add money
      </button>
    </div>
  );
}

/** A payment waiting on you, as its pill in the thread: tap to review it in Dots. */
function PayPill({ m, onOpen }: { m: Ask; onOpen: () => void }) {
  const { ask, state } = m;
  const pending = state === 'pressing' || state === 'authing';
  const label =
    state === 'done'
      ? `${ask.allowed ?? 'Paid'} · ${ask.amount}`
      : state === 'denied'
        ? `${ask.denied ?? 'Declined'} · ${ask.amount}`
        : state === 'expired'
          ? 'Expired'
          : `Review payment · ${ask.amount}`;
  return (
    <button type="button" className={styles.pill} data-state={state} disabled={state !== 'open'} onClick={onOpen} data-opens-sheet>
      <DotsMark size={22} />
      <span>{label}</span>
      <span className={styles.pillEnd}>
        {pending ? <i className={styles.spinner} /> : state === 'done' ? <IconCheckmark1 size={16} /> : state === 'open' ? <IconChevronRight size={14} /> : null}
      </span>
    </button>
  );
}

export function DotChat({ chat }: AgentChatProps) {
  const lastMe = chat.messages.reduce((id, m) => (m.kind === 'me' ? m.id : id), -1);
  const [multiline, setMultiline] = useState(false);
  const [sheet, setSheet] = useState<{ id: number; ask: AgentAsk } | null>(null);
  const [shown, setShown] = useState(false);
  const [balance, setBalance] = useState<AgentBalance | null>(null);
  const [balanceShown, setBalanceShown] = useState(false);
  const sub = useSubAgentSheet(chat.messages, SHEET_IN);
  const scan = useCardScan({ wallet: 'Dots balance', onAllow: chat.allow, onDeny: chat.deny });
  const sheetOpen = shown && !!sheet && chat.messages.some((m) => m.kind === 'ask' && m.id === sheet.id && m.state === 'open');
  const open = (m: Ask) => {
    setSheet({ id: m.id, ask: m.ask });
    setShown(true);
  };
  // A payment opens its checkout as it arrives, as the checkout link does in the app.
  const opened = useRef(new Set<number>());
  useEffect(() => {
    const ask = [...chat.messages].reverse().find((m): m is Ask => m.kind === 'ask' && m.state === 'open');
    if (!ask || ask.ask.rows || opened.current.has(ask.id)) return;
    opened.current.add(ask.id);
    const t = window.setTimeout(() => open(ask), 500);
    return () => window.clearTimeout(t);
  }, [chat.messages]);

  const close = () => setShown(false);
  const allow = () => {
    close();
    chat.allow();
  };
  const deny = () => {
    close();
    chat.deny();
  };

  const render = (m: Message) => {
    switch (m.kind) {
      case 'them':
        return (
          <>
            {m.sender && <span className={styles.sender}>{m.sender}</span>}
            <Said typing={m.typing} className={styles.them}>
              <Markdown text={m.text} />
            </Said>
          </>
        );
      case 'me':
        return (
          <>
            <span className={styles.me}>{m.text}</span>
            {m.id === lastMe && <span className={styles.seen}>Seen</span>}
          </>
        );
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
                {c.flag ? <Flag code={c.flag} size={22} /> : c.icon ? <img src={c.icon} alt="" width={22} height={22} /> : null}
                {c.label}
                <span className={styles.chevron} />
              </button>
            ))}
          </div>
        );
      case 'ask':
        if (m.ask.card) return <ActionPill m={m} onOpen={() => scan.open(m.ask)} />;
        return m.ask.rows ? <ActionPill m={m} onOpen={() => open(m)} /> : <PayPill m={m} onOpen={() => open(m)} />;
      case 'card': {
        const b = m.card.balance;
        return b ? (
          <BalanceCard
            balance={b}
            track
            className={styles.accountSkin}
            onOpen={() => {
              setBalance(b);
              setBalanceShown(true);
            }}
          />
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
        return (
          <span className={styles.typing}>
            <TypingDots />
          </span>
        );
      case 'products':
        return (
          <div className={styles.them}>
            <Markdown text={productsText(m.products)} />
          </div>
        );
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

  const hasText = chat.composer.length > 0;

  return (
    <div className={styles.stage}>
      <ChatFrame
        className={styles.screen}
        messages={chat.messages}
        render={render}
        rowMotion={() => NATIVE_IN}
        faceId={chat.authing}
        onFaceIdDone={chat.authed}
        gap={6}
        threadTop={172}
        composerBottom={38.5}
        composerHeight={48}
        edge={<div className={styles.edge} />}
        header={
          <>
            <div className={styles.menu}>
              <GlassDisc label="Menu" icon={`${A}/menu.svg`} width={20} height={14} />
            </div>
            <div className={styles.call}>
              <GlassDisc label="Call" icon={`${A}/phone.svg`} width={22} height={22} />
            </div>
            <img className={styles.avatar} src={`${A}/avatar.png`} alt="" width={78} height={62} draggable={false} />
            <GlassPill radius={18.5} absolute className={styles.name}>
              <span className={styles.nameText}>dot</span>
            </GlassPill>
          </>
        }
        composer={
          <motion.div layout transition={CARD} className={styles.composerBox} style={{ borderRadius: 24 }}>
            <GlassPill radius={24} className={styles.composer}>
              <span className={styles.composerGrid} data-multiline={multiline || undefined}>
                <motion.span layout="position" transition={CARD} className={styles.slot} style={{ gridArea: 'plus' }}>
                  <span className={styles.glyph} style={mask(`${A}/plus.svg`, 18, 18)} />
                </motion.span>
                <motion.span layout="position" transition={CARD} className={styles.fieldSlot}>
                  <ComposerField chat={chat} placeholder="Message your dot" className={styles.field} onMultiline={setMultiline} />
                </motion.span>
                <motion.span layout="position" transition={CARD} className={styles.tools}>
                  <span className={styles.slot}>
                    <span className={styles.glyph} style={mask(`${A}/mic.svg`, 16, 22)} />
                  </span>
                  {hasText && (
                    <span className={styles.send} role="button" aria-label="Send" onClick={chat.send} data-ready={chat.canSend || undefined}>
                      <IconArrowUp size={18} />
                    </span>
                  )}
                </motion.span>
              </span>
            </GlassPill>
          </motion.div>
        }
      />
      <AppSheet open={sheetOpen} present={SHEET_IN} className={sheet?.ask.rows ? styles.setupPanel : styles.payPanel} onDismiss={close}>
        {sheet &&
          (sheet.ask.rows ? (
            <SetupSheet ask={sheet.ask} onAllow={allow} onDeny={deny} onClose={close} />
          ) : (
            <PaySheet key={sheet.id} ask={sheet.ask} onAllow={allow} onDeny={deny} onClose={close} />
          ))}
      </AppSheet>
      {sub.sheet}
      {scan.sheet}
      <AppSheet open={balanceShown} present={SHEET_IN} className={styles.setupPanel} onDismiss={() => setBalanceShown(false)}>
        {balance && <BalanceSheet balance={balance} onClose={() => setBalanceShown(false)} />}
      </AppSheet>
    </div>
  );
}
