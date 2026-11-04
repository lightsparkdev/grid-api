import type { ReactNode } from 'react';
import { SfSymbol } from '@/apps/shared/icons';
import { ChatFrame, Draft, Said } from '../ChatFrame';
import { GlassDisc, GlassPill } from '../glass';
import type { Message } from '../conversation';
import { AskCard, ChipRow, NoteCard } from '../parts';
import type { AgentChatProps } from '../types';
import styles from './InstinctChat.module.scss';

/** Figma 89:297, Instinct · Group bill split (iMessage). */
const A = '/assets/agents/instinct';
const INSTINCT = 'Instinct';

const mask = (src: string, width: number, height: number) => ({ maskImage: `url(${src})`, width, height });

/** The group's people: initials on Figma's gradients. Anyone else (another agent) is gray. */
const PEOPLE: Record<string, string> = {
  Marta: 'linear-gradient(180deg, #fdba74 0%, #f97316 100%)',
  Sam: 'linear-gradient(180deg, #93c5fd 0%, #3b82f6 100%)',
  Jules: 'linear-gradient(180deg, #86efac 0%, #22c55e 100%)',
};
const OTHER = 'linear-gradient(180deg, #c7c7cc 0%, #8e8e93 100%)';

function senderOf(m: Message | undefined) {
  if (!m) return undefined;
  if (m.kind === 'them' || m.kind === 'card') return m.sender;
  // Approvals and quick replies come from Instinct itself.
  if (m.kind === 'ask' || m.kind === 'chips') return INSTINCT;
  return undefined;
}

function Avatar({ name }: { name: string }) {
  if (name === INSTINCT) {
    return (
      <span className={`${styles.avatar} ${styles.instinctAvatar}`}>
        <img src={`${A}/logo.png`} alt="" width={6.3} height={17.6} />
      </span>
    );
  }
  return (
    <span className={styles.avatar} style={{ background: PEOPLE[name] ?? OTHER }}>
      {name[0]}
    </span>
  );
}

export function InstinctChat({ chat, dark }: AgentChatProps) {
  // A sender's name heads their run of messages; their avatar (and the bubble's tail) ends it.
  const inGroup = (m: Message, i: number, all: Message[], body: ReactNode, tail: boolean) => {
    const sender = senderOf(m) ?? '';
    const first = senderOf(all[i - 1]) !== sender;
    const last = senderOf(all[i + 1]) !== sender;
    return (
      <div className={styles.group} data-first={first || undefined}>
        {first && <span className={styles.sender}>{sender}</span>}
        <div className={styles.body}>
          {body}
          {tail && last && <span className={styles.tailIn} />}
        </div>
        {last && <Avatar name={sender} />}
      </div>
    );
  };

  const render = (m: Message, i: number, all: Message[]) => {
    switch (m.kind) {
      case 'stamp':
      case 'tag':
        return <span className={styles.stamp}>{m.text}</span>;
      case 'them':
        return inGroup(
          m,
          i,
          all,
          <Said typing={m.typing} className={styles.bubble}>
            {m.text}
          </Said>,
          true,
        );
      case 'card':
        return inGroup(m, i, all, <NoteCard note={m.card} className={styles.ask} />, false);
      case 'ask':
        return inGroup(
          m,
          i,
          all,
          <AskCard ask={m.ask} state={m.state} onAnswer={chat.answer} className={styles.ask} />,
          false,
        );
      case 'chips':
        return inGroup(m, i, all, <ChipRow chips={m.chips} picked={m.picked} onPick={chat.answer} />, false);
      case 'me':
        return (
          <span className={styles.me}>
            {m.text}
            <span className={styles.tailOut} />
          </span>
        );
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
      draft={chat.draft}
      keys={chat.keys}
      dark={dark}
      faceId={chat.authing}
      onFaceIdDone={chat.authed}
      gap={3}
      composerBottom={28}
      composerHeight={40}
      edge={<div className={styles.edge} />}
      header={
        <div className={styles.nav}>
          <GlassPill radius={22} absolute className={styles.back}>
            <span className={styles.backRow}>
              <span className={styles.glyph} style={mask(`${A}/back.svg`, 11, 19)} />
              <span className={styles.badge}>213</span>
            </span>
          </GlassPill>
          <div className={styles.facetime}>
            <GlassDisc label="FaceTime" icon={`${A}/video.svg`} width={27} height={18} />
          </div>
          <div className={styles.contact}>
            <span className={`${styles.navAvatar} ${styles.navM}`}>M</span>
            <span className={`${styles.navAvatar} ${styles.navS}`}>S</span>
            <span className={styles.navInstinct}>
              <img src={`${A}/logo.png`} alt="" width={10.4} height={28.9} />
            </span>
            <GlassPill radius={16} absolute className={styles.name}>
              <span className={styles.nameRow}>
                Lisbon crew
                <span className={styles.muted} style={mask(`${A}/chevron.svg`, 6, 11)} />
              </span>
            </GlassPill>
          </div>
        </div>
      }
      composer={
        <div className={styles.composer}>
          <GlassPill radius={20} absolute className={styles.plus}>
            <span className={styles.plusIcon}>
              <span className={styles.glyph} style={mask(`${A}/plus.svg`, 16, 16)} />
            </span>
          </GlassPill>
          <GlassPill radius={20} absolute className={styles.field}>
            <span className={styles.fieldRow}>
              <Draft draft={chat.draft} placeholder="iMessage" className={styles.fieldText} />
              {chat.draft ? (
                <span className={styles.send} data-pressing={chat.sending || undefined}>
                  <SfSymbol name="arrow.up" size={14} />
                </span>
              ) : (
                <span className={styles.muted} style={mask(`${A}/dictation.svg`, 18, 16)} />
              )}
            </span>
          </GlassPill>
        </div>
      }
    />
  );
}
