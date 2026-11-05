import { TextMorph } from 'torph/react';
import { ChatFrame, ComposerField, Said } from '../ChatFrame';
import { GlassPill } from '../glass';
import type { Message } from '../conversation';
import { AskCard, askButtons, ChipRow, MORPH, NoteCard } from '../parts';
import type { AgentChatProps } from '../types';
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
  const render = (m: Message) => {
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
        return <span className={styles.me}>{m.text}</span>;
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
        // The spend card needs an amount; an ask without one (connecting, limits) is a plain approval.
        return m.ask.amount ? (
          <SpendCard m={m} onAllow={chat.allow} onDeny={chat.deny} />
        ) : (
          <AskCard ask={m.ask} state={m.state} onAllow={chat.allow} onDeny={chat.deny} />
        );
      case 'card':
        return <NoteCard note={m.card} />;
      case 'chips':
        return <ChipRow chips={m.chips} picked={m.picked} onPick={chat.pick} expired={m.expired} />;
      case 'stamp':
        return <span className={styles.stamp}>{m.text}</span>;
      default: {
        const exhaustive: never = m;
        return exhaustive;
      }
    }
  };

  return (
    <ChatFrame
      className={styles.screen}
      messages={chat.messages}
      render={render}
      faceId={chat.authing}
      onFaceIdDone={chat.authed}
      gap={8}
      composerBottom={108}
      composerHeight={52}
      edge={<div className={styles.edge} />}
      header={
        <>
          <GlassPill radius={24} absolute className={styles.menu}>
            <span className={styles.disc}>
              <span className={styles.glyph} style={mask(`${A}/menu.svg`, 24, 24)} />
            </span>
          </GlassPill>
          <GlassPill radius={38} absolute className={styles.mascot}>
            <span className={styles.disc}>
              <img src={`${A}/mascot.svg`} alt="" width={76} height={76} />
            </span>
          </GlassPill>
          <GlassPill radius={24} absolute className={styles.account}>
            <span className={styles.disc}>M</span>
          </GlassPill>
        </>
      }
      composer={
        <GlassPill radius={26} className={styles.composer}>
          <span className={styles.composerRow}>
            <span className={styles.glyph} style={mask(`${A}/plus.svg`, 24, 24)} />
            <ComposerField chat={chat} placeholder="Message" className={styles.field} />
            <span className={styles.glyph} style={mask(`${A}/mic.svg`, 24, 24)} />
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
