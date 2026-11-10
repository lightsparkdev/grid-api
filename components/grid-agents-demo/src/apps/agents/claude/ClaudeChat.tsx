import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { TextMorph } from 'torph/react';
import { IconArrowCornerDownRight } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowCornerDownRight';
import { IconBank } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconBank';
import { IconCheckCircle2 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckCircle2';
import { IconCheckmark1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckmark1';
import { IconCoin1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCoin1';
import { IconCreditCard1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCreditCard1';
import { IconFileText } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconFileText';
import { IconPin } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPin';
import { IconSquareBehindSquare1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconSquareBehindSquare1';
import { FLOW_ICON_COLORS, FLOW_ICONS } from '@/data/flowIcons';
import { ChatFrame, ComposerField, Said, ScrollEdge, TypingDots } from '../ChatFrame';
import { GlassPill, NoopButton, useContinuousCorners } from '../glass';
import type { AgentNote, Message } from '../conversation';
import { AddressQr, askButtons, AskCard, BalanceCard, Divider, MetaLine, MORPH, NoteCard, ProductRow, SubAgentRow, useCopy, useSubAgentSheet } from '../parts';
import type { AgentChatProps } from '../types';
import { ClaudeMascot } from './ClaudeMascot';
import { useDuetBalance } from './DuetBalance';
import { ConnectList, Lift, OptionList, PermissionCard, SETUP } from './DuetChoices';
import { DuetConnector, useDuetBank, useDuetCard } from './DuetVault';
import type { MascotState } from './mascot';
import styles from './ClaudeChat.module.scss';

/** Figma 91:163, Claude Duet · Supplies budget (virtual card). */
const A = '/assets/agents/claude';

const mask = (src: string, width: number, height: number) => ({ maskImage: `url(${src})`, width, height });

/** Claude's spend card: the amount and its clock, what for, paid with, Approve. */
function SpendCard({
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
  const status =
    state === 'done' ? b.allowLabel : state === 'denied' ? b.denyLabel : state === 'expired' ? 'Expired' : (ask.expires ?? 'Needs you');
  return (
    <div className={styles.spend}>
      <div className={styles.spendTop}>
        <strong>{ask.amount}</strong>
        <span>{status}</span>
      </div>
      <span className={styles.spendWhat}>{ask.who ? `${ask.who.name} · ${ask.who.detail}` : ask.title}</span>
      {ask.method && (
        <div className={styles.spendMethod}>
          {ask.method}
          <span className={styles.chevron} style={mask(`${A}/chevron.svg`, 9, 16)} />
        </div>
      )}
      <div className={styles.spendActions} data-state={state}>
        <button
          type="button"
          className={styles.approve}
          data-pressing={b.pressing || undefined}
          data-done={state === 'done' || undefined}
          disabled={b.settled || b.pressing}
          onClick={onAllow}
        >
          <TextMorph {...MORPH}>{b.allowLabel}</TextMorph>
        </button>
        {ask.deny && (
          <button type="button" className={styles.notNow} disabled={b.settled || b.pressing} onClick={onDeny}>
            <TextMorph {...MORPH}>{b.denyLabel}</TextMorph>
          </button>
        )}
      </div>
    </div>
  );
}

/** Duet's quick replies: outlined pills in a row, each led by the reply arrow. */
function ReplyPills({ labels, picked, settled, onPick }: { labels: string[]; picked: number | null; settled: boolean; onPick: (i: number) => void }) {
  return (
    <Lift cards=":scope > * > *">
      <div className={styles.replies} data-settled={settled || undefined}>
        {labels.map((label, i) => (
          <button key={label} type="button" className={styles.reply} data-picked={picked === i || undefined} disabled={settled} onClick={() => onPick(i)}>
            <IconArrowCornerDownRight size={15} />
            {label}
          </button>
        ))}
      </div>
    </Lift>
  );
}

/**
 * A choice, drawn by what it offers: nothing but ways to set Duet up, as one card of connections; options with a line
 * under each, as option cards; anything else, as reply pills. Lists stay with the pick checked; pills go once answered.
 */
function Choice({ m, onPick }: { m: Extract<Message, { kind: 'chips' }>; onPick: (i: number) => void }) {
  const settled = m.picked !== null || !!m.expired;
  if (m.expired && m.picked === null) return null;
  const all = m.chips.map((chip, index) => ({ chip, index }));
  const isSetup = (c: (typeof all)[number]) => !!(c.chip.flow && SETUP[c.chip.flow]);
  const answers = all.filter((c) => c.chip.label !== 'Not now');
  const setup = answers.length > 0 && answers.every(isSetup) ? answers : [];
  const listed = setup.length ? setup : all.filter(({ chip }) => chip.detail);
  const rest = all.filter((c) => !listed.includes(c));
  const pills = (items: typeof all) =>
    !settled && items.length > 0 && <ReplyPills labels={items.map((c) => c.chip.label)} picked={null} settled={false} onPick={(j) => onPick(items[j].index)} />;
  if (!listed.length) return pills(all) || null;
  // The connections card keeps its own Not now; other leftovers stay as pills under the list.
  const notNow = setup.length ? rest.find((c) => c.chip.label === 'Not now') : undefined;
  const others = rest.filter((c) => c !== notNow);
  return (
    <div className={styles.choice}>
      {setup.length ? (
        <ConnectList items={listed} picked={m.picked} settled={settled} onPick={onPick} notNow={notNow?.index} />
      ) : (
        <OptionList items={listed} picked={m.picked} settled={settled} onPick={onPick} />
      )}
      {pills(others)}
    </div>
  );
}

/** What a run is about, hung from the thread line over its first message, as Duet labels a task. */
function Eyebrow({ m }: { m: Extract<Message, { kind: 'eyebrow' }> }) {
  const Icon = FLOW_ICONS[m.flow];
  return (
    <span className={styles.tag}>
      <span className={`${styles.thread} ${styles.chevron}`} style={mask(`${A}/thread.svg`, 11, 14)} />
      <span className={styles.tagIcon} style={{ '--flow': FLOW_ICON_COLORS[m.flow] } as CSSProperties}>
        <Icon size={12} />
      </span>
      {m.text}
      <span className={`${styles.chevron} ${styles.tagChevron}`} style={mask(`${A}/chevron.svg`, 5, 9)} />
    </span>
  );
}

/** Cards, bank accounts, invoices and addresses inside a line, as Duet sets a file or task in its text. */
const TOKEN = '((?:\\p{Lu}[\\p{L}&.\\-]*(?: \\p{Lu}[\\p{L}&.\\-]*)?) •••• \\d{4}|INV-\\d{4}|0x[0-9a-fA-F]{4}…[0-9a-fA-F]{4}|(?:spark1|sp1)\\w{0,4}…\\w{4})';
function withChips(text: string): ReactNode {
  const parts = text.split(new RegExp(TOKEN, 'gu'));
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (i % 2 === 0) return part;
    const Icon = part.startsWith('Visa') ? IconCreditCard1 : part.includes('••••') ? IconBank : part.startsWith('INV-') ? IconFileText : IconCoin1;
    return (
      <span key={i} className={styles.inlineChip}>
        <Icon size={13} />
        {part}
      </span>
    );
  });
}

/** Duet's artifact: a preview on top (a small label, a serif headline, then tiles or a picture), and under a hairline
 *  its name, when it was updated, a pin and a chevron (or Copy, for something to copy). */
function Artifact({
  label,
  headline,
  stats,
  preview,
  name,
  detail,
  action,
  onOpen,
}: {
  label?: string;
  headline?: string;
  stats?: { label: string; value: string }[];
  preview?: ReactNode;
  name: string;
  detail?: string;
  action?: ReactNode;
  onOpen?: () => void;
}) {
  const [updated] = useState(() => `Updated ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`);
  return (
    <div className={styles.artifact} data-opens-sheet={onOpen ? '' : undefined} onClick={onOpen}>
      <div className={styles.artifactPreview}>
        {label && <span className={styles.artifactLabel}>{label}</span>}
        {headline && <strong className={styles.artifactHeadline}>{headline}</strong>}
        {stats && stats.length > 0 && (
          <div className={styles.artifactStats}>
            {stats.map((st) => (
              <span key={st.label} className={styles.artifactStat}>
                <small>{st.label}</small>
                <b>{st.value}</b>
              </span>
            ))}
          </div>
        )}
        {preview}
      </div>
      <div className={styles.artifactFoot}>
        <span className={styles.artifactName}>
          <b>{name}</b>
          <small>{detail ?? updated}</small>
        </span>
        {action ?? (
          <>
            <IconPin size={18} />
            <span className={styles.chevron} style={mask(`${A}/chevron.svg`, 9, 16)} />
          </>
        )}
      </div>
    </div>
  );
}

/** Where to send money, as an artifact: the code under its QR, and Copy where the pin would be. */
function AddressArtifact({ note }: { note: AgentNote }) {
  const code = note.code ?? '';
  const { copied, copy } = useCopy(code);
  return (
    <Artifact
      preview={
        <div className={styles.artifactAddress}>
          {note.glyph !== 'bank' && <AddressQr value={code} size={76} />}
          <code>{code}</code>
        </div>
      }
      name={note.title}
      detail={note.lines.join(' · ')}
      action={
        <button type="button" className={styles.codeCopy} onClick={copy}>
          {copied ? <IconCheckmark1 size={14} /> : <IconSquareBehindSquare1 size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      }
    />
  );
}

/** A note as an artifact: a receipt's figures as tiles, a list as rows, anything else as its lines. */
function NoteArtifact({ note }: { note: AgentNote }) {
  if (note.rows) {
    return (
      <Artifact
        headline={note.title}
        preview={
          <div className={styles.artifactRows}>
            {note.rows.map((r, i) => (
              <span key={`${r.title}-${i}`}>
                <span>
                  {r.title}
                  <small>{r.detail}</small>
                </span>
                <b data-incoming={r.incoming || undefined}>{r.amount}</b>
              </span>
            ))}
          </div>
        }
        name="Activity"
      />
    );
  }
  const [first, ...rest] = note.lines;
  return <Artifact label={first} headline={note.title} stats={note.stats} name={note.done ? 'Receipt' : (rest[0] ?? note.title)} />;
}

/** A finished task, closed out the way Duet closes one: a check, and where to find it. */
function DoneRow() {
  return (
    <div className={styles.doneRow}>
      <IconCheckCircle2 size={20} />
      <span>Done</span>
      <small>See all tasks</small>
    </div>
  );
}

export function ClaudeChat({ chat }: AgentChatProps) {
  const sub = useSubAgentSheet(chat.messages);
  const card = useDuetCard({ messages: chat.messages, onAllow: chat.allow });
  const bank = useDuetBank({ messages: chat.messages, onAllow: chat.allow });
  const balance = useDuetBalance({ account: chat.account, onAction: chat.prompt });
  const selectedTab = useContinuousCorners<HTMLSpanElement>(27);
  // A run that ended in a receipt closes with Done once the next thing starts (or the thread rests). The balance a setup
  // shows is the account, not something finished.
  const closesRun = (i: number, all: Message[]) => {
    const next = all[i + 1];
    if (next ? next.kind !== 'me' && next.kind !== 'eyebrow' : chat.busy) return false;
    for (let j = i; j >= 0 && all[j].kind !== 'eyebrow' && all[j].kind !== 'me'; j--) {
      const m = all[j];
      if (m.kind === 'card' && m.card.done && m.card.stats) return true;
    }
    return false;
  };
  const render = (m: Message, i: number, all: Message[]) => {
    const node = renderOne(m, i, all);
    return node !== null && closesRun(i, all) ? (
      <>
        {node}
        <Lift>
          <DoneRow />
        </Lift>
      </>
    ) : (
      node
    );
  };
  const lastMe = chat.messages.findLastIndex((m) => m.kind === 'me');
  const renderOne = (m: Message, i: number, all: Message[]) => {
    switch (m.kind) {
      case 'them':
        return (
          <>
            {m.sender && <span className={styles.sender}>{m.sender}</span>}
            <Said typing={m.typing} className={styles.bubble}>
              {withChips(m.text)}
            </Said>
          </>
        );
      case 'eyebrow':
        return <Eyebrow m={m} />;
      case 'me':
        return i === lastMe && (i < all.length - 1 || chat.busy) ? (
          <>
            <span className={styles.me} data-bubble>
              {m.text}
            </span>
            <span className={styles.seen}>Seen</span>
          </>
        ) : (
          <span className={styles.me} data-bubble>
            {m.text}
          </span>
        );
      case 'tag':
        return (
          <span className={styles.tag}>
            <span className={`${styles.thread} ${styles.chevron}`} style={mask(`${A}/thread.svg`, 11, 14)} />
            <span className={styles.tagIcon}>
              <img src={`${A}/tag.svg`} alt="" width={12.4} height={12.4} />
            </span>
            {m.text}
          </span>
        );
      case 'ask':
        if (m.ask.bank || m.ask.card) {
          const open = m.ask.bank ? bank.open : card.open;
          return (
            <Lift>
              <DuetConnector ask={m.ask} state={m.state} onOpen={() => open(m.id, m.ask)} />
            </Lift>
          );
        }
        // Money gets the spend card; a yes Duet needs without money (setting up, limits) gets a permission card.
        if (m.ask.amount)
          return (
            <Lift>
              <SpendCard m={m} onAllow={chat.allow} onDeny={chat.deny} />
            </Lift>
          );
        if (m.ask.text) return <PermissionCard ask={m.ask} state={m.state} onAllow={chat.allow} onDeny={chat.deny} />;
        return (
          <Lift>
            <AskCard ask={m.ask} state={m.state} onAllow={chat.allow} onDeny={chat.deny} />
          </Lift>
        );
      case 'card': {
        const b = m.card.balance;
        return (
          <Lift>
            {b ? (
              <BalanceCard balance={b} onOpen={() => balance.open(b.wallet)} className={styles.accountSkin} />
            ) : m.card.code ? (
              <AddressArtifact note={m.card} />
            ) : m.card.stats || m.card.rows ? (
              <NoteArtifact note={m.card} />
            ) : (
              <NoteCard note={m.card} />
            )}
          </Lift>
        );
      }
      // Answered or passed by, the replies go; a tap already came through as your message.
      case 'chips':
        return <Choice m={m} onPick={chat.pick} />;
      case 'stamp':
        return <span className={styles.stamp}>{m.text}</span>;
      case 'work':
        return (
          <span className={styles.bubble} data-bubble>
            <TypingDots />
          </span>
        );
      case 'products':
        return (
          <Lift cards=":scope > * > *">
            <ProductRow products={m.products} />
          </Lift>
        );
      case 'meta': {
        // A connected card already says what was saved.
        const prev = all[i - 1];
        if (m.meta.icon === 'check' && prev?.kind === 'ask' && prev.state === 'done' && (prev.ask.bank || prev.ask.card)) return null;
        return <MetaLine meta={m.meta} />;
      }
      case 'divider':
        return <Divider text={m.text} />;
      case 'subagent':
        return (
          <Lift>
            <SubAgentRow agent={m.agent} done={m.done} onOpen={() => sub.open(m.id)} />
          </Lift>
        );
      default: {
        const exhaustive: never = m;
        return exhaustive;
      }
    }
  };

  const typing = chat.messages.some((m) => m.kind === 'them' && m.typing);
  const last = chat.messages.at(-1);
  const doing = last?.kind === 'work' ? last.status : typing ? 'Thinking it through' : '';
  // Kept while it fades out, so the label doesn't empty first.
  const shown = useRef('');
  if (doing) shown.current = doing;
  const mascotState: MascotState = chat.asking
    ? 'waitshape'
    : chat.busy && chat.activeFlow === 'connect'
      ? 'connecting'
      : typing
        ? 'think1'
        : chat.busy
          ? 'working'
          : 'tilde';

  return (
    <ChatFrame
      className={styles.screen}
      messages={chat.messages}
      render={render}
      overlay={
        <>
          {sub.sheet}
          {card.sheet}
          {bank.sheet}
          {balance.sheet}
        </>
      }
      faceId={chat.authing}
      onFaceIdDone={chat.authed}
      gap={8}
      threadTop={150}
      composerBottom={108}
      composerHeight={52}
      edge={<ScrollEdge className={styles.edge} />}
      header={
        <>
          <NoopButton label="Menu" size={48} className={styles.menu}>
            <GlassPill radius={24}>
              <span className={styles.disc}>
                <span className={styles.glyph} style={mask(`${A}/menu.svg`, 24, 24)} />
              </span>
            </GlassPill>
          </NoopButton>
          <GlassPill radius={38} absolute className={styles.mascot}>
            <span className={styles.disc}>
              <ClaudeMascot state={mascotState} />
            </span>
          </GlassPill>
          <span className={styles.activity} data-on={doing ? '' : undefined} aria-live="polite">
            {shown.current}
          </span>
          <NoopButton label="Account" size={48} className={styles.account}>
            <GlassPill radius={24}>
              <span className={styles.disc}>M</span>
            </GlassPill>
          </NoopButton>
        </>
      }
      composer={
        <GlassPill radius={26} className={styles.composer}>
          <span className={styles.composerRow}>
            <span className={`${styles.glyph} ${styles.rowGlyph}`} style={mask(`${A}/plus.svg`, 24, 24)} />
            <ComposerField chat={chat} placeholder="Message Claude" className={styles.field} />
            <span className={`${styles.glyph} ${styles.rowGlyph}`} style={mask(`${A}/mic.svg`, 24, 24)} />
            <span className={styles.voice} role="button" onClick={chat.send} data-ready={chat.canSend || undefined}>
              <span className={styles.voiceGlyph} style={mask(`${A}/waveform.svg`, 22, 22)} />
            </span>
          </span>
        </GlassPill>
      }
      tabBar={
        <>
          <span className={styles.foot} aria-hidden />
          <GlassPill radius={32} absolute className={styles.tabs}>
            <span className={styles.tabRow}>
              {(
                [
                  ['Chat', 'tab-chat'],
                  ['Tasks', 'tab-tasks'],
                  ['Make', 'tab-make'],
                ] as const
              ).map(([label, icon], i) => (
                <span
                  key={label}
                  ref={i === 0 ? selectedTab : undefined}
                  className={styles.tab}
                  data-selected={i === 0 || undefined}
                >
                  <span className={styles.tabGlyph} style={mask(`${A}/${icon}.svg`, 26, 26)} />
                  {label}
                </span>
              ))}
            </span>
          </GlassPill>
          <NoopButton label="Computer" size={64} className={styles.computer}>
            <GlassPill radius={32}>
              <span className={styles.disc}>
                <span className={styles.tabGlyph} style={mask(`${A}/computer.svg`, 28, 28)} />
              </span>
            </GlassPill>
          </NoopButton>
        </>
      }
    />
  );
}
