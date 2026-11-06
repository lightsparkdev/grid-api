import { TextMorph } from 'torph/react';
import { ChatFrame, ComposerField, Said, ScrollEdge } from '../ChatFrame';
import { GlassPill, NoopButton } from '../glass';
import type { Message } from '../conversation';
import { askButtons, AskCard, BalanceCard, ChipRow, Divider, MetaLine, MORPH, NoteCard, ProductRow, SubAgentRow, useSubAgentSheet, WorkLine } from '../parts';
import type { AgentChatProps } from '../types';
import { ClaudeMascot } from './ClaudeMascot';
import { DuetConnector, useDuetBank, useDuetCard } from './DuetVault';
import type { MascotState } from './mascot';
import styles from './ClaudeChat.module.scss';

/** Figma 91:163, Claude Duet · Supplies budget (virtual card). */
const A = '/assets/agents/claude';

const mask = (src: string, width: number, height: number) => ({ maskImage: `url(${src})`, width, height });

/** Claude's spend card: the amount and its clock, what for, paid with, Approve or Not now. */
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
        <button type="button" className={styles.notNow} disabled={b.settled || b.pressing} onClick={onDeny}>
          <TextMorph {...MORPH}>{b.denyLabel}</TextMorph>
        </button>
      </div>
    </div>
  );
}

export function ClaudeChat({ chat }: AgentChatProps) {
  const sub = useSubAgentSheet(chat.messages);
  const card = useDuetCard({ messages: chat.messages, onAllow: chat.allow });
  const bank = useDuetBank({ messages: chat.messages, onAllow: chat.allow });
  const render = (m: Message, i: number, all: Message[]) => {
    switch (m.kind) {
      case 'them':
        return (
          <>
            {m.sender && <span className={styles.sender}>{m.sender}</span>}
            <Said typing={m.typing} className={styles.bubble}>
              {m.text}
            </Said>
          </>
        );
      case 'me':
        return <span className={styles.me} data-bubble>{m.text}</span>;
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
        if (m.ask.bank) return <DuetConnector ask={m.ask} state={m.state} onOpen={() => bank.open(m.id, m.ask)} />;
        if (m.ask.card) return <DuetConnector ask={m.ask} state={m.state} onOpen={() => card.open(m.id, m.ask)} />;
        // The spend card needs an amount; an ask without one (connecting, limits) is a plain approval.
        return m.ask.amount ? (
          <SpendCard m={m} onAllow={chat.allow} onDeny={chat.deny} />
        ) : (
          <AskCard ask={m.ask} state={m.state} onAllow={chat.allow} onDeny={chat.deny} />
        );
      case 'card':
        return m.card.balance ? <BalanceCard balance={m.card.balance} className={styles.accountSkin} /> : <NoteCard note={m.card} />;
      case 'chips':
        return <ChipRow chips={m.chips} picked={m.picked} onPick={chat.pick} expired={m.expired} />;
      case 'stamp':
        return <span className={styles.stamp}>{m.text}</span>;
      case 'work':
        return <WorkLine status={m.status} />;
      case 'products':
        return <ProductRow products={m.products} />;
      case 'meta': {
        // A connected card already says what was saved.
        const prev = all[i - 1];
        if (m.meta.icon === 'check' && prev?.kind === 'ask' && prev.state === 'done' && (prev.ask.bank || prev.ask.card)) return null;
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

  const typing = chat.messages.some((m) => m.kind === 'them' && m.typing);
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
            <ComposerField chat={chat} placeholder="Message" className={styles.field} />
            <span className={`${styles.glyph} ${styles.rowGlyph}`} style={mask(`${A}/mic.svg`, 24, 24)} />
            <span className={styles.voice} role="button" onClick={chat.send} data-ready={chat.canSend || undefined}>
              <span className={styles.voiceGlyph} style={mask(`${A}/waveform.svg`, 22, 22)} />
            </span>
          </span>
        </GlassPill>
      }
      tabBar={
        <GlassPill radius={32} absolute className={styles.tabs}>
          <span className={styles.tabRow}>
            {(
              [
                ['Chat', 'tab-chat'],
                ['Tasks', 'tab-tasks'],
                ['Make', 'tab-make'],
              ] as const
            ).map(([label, icon], i) => (
              <span key={label} className={styles.tab} data-selected={i === 0 || undefined}>
                <span className={styles.tabGlyph} style={mask(`${A}/${icon}.svg`, 26, 26)} />
                {label}
              </span>
            ))}
          </span>
        </GlassPill>
      }
    />
  );
}
