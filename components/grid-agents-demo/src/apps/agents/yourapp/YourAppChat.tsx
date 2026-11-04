import { TextMorph } from 'torph/react';
import { SfSymbol } from '@/apps/shared/icons';
import { GridLogoMark } from '@/components/GridWordmark';
import { ChatFrame, Draft, Said } from '../ChatFrame';
import { GlassPill } from '../glass';
import type { Message } from '../conversation';
import { AskCard, ChipRow, MORPH, NoteCard } from '../parts';
import type { AgentChatProps } from '../types';
import styles from './YourAppChat.module.scss';

/** A plain chat for the agent a platform builds itself: no brand, just the thread. */
export function YourAppChat({ chat, dark }: AgentChatProps) {
  const render = (m: Message) => {
    switch (m.kind) {
      case 'them':
        return (
          <>
            {m.sender && <span className={styles.sender}>{m.sender}</span>}
            <Said typing={m.typing} className={styles.them}>
              {m.text}
            </Said>
          </>
        );
      case 'me':
        return <span className={styles.me}>{m.text}</span>;
      case 'ask':
        return <AskCard ask={m.ask} state={m.state} onAnswer={chat.answer} />;
      case 'card':
        return <NoteCard note={m.card} />;
      case 'chips':
        return <ChipRow chips={m.chips} picked={m.picked} onPick={chat.answer} />;
      case 'tag':
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
      draft={chat.draft}
      keys={chat.keys}
      dark={dark}
      faceId={chat.authing}
      onFaceIdDone={chat.authed}
      gap={8}
      composerBottom={34}
      composerHeight={48}
      edge={<div className={styles.edge} />}
      header={
        <>
          <span className={styles.mark}>
            <GridLogoMark className={styles.logo} />
          </span>
          <GlassPill radius={18} absolute className={styles.title}>
            <span className={styles.titleText}>
              <strong>Your agent</strong>
              <span data-asking={chat.asking || undefined}>
                <TextMorph {...MORPH}>{chat.asking ? 'Needs approval' : 'Online'}</TextMorph>
              </span>
            </span>
          </GlassPill>
        </>
      }
      composer={
        <GlassPill radius={24} className={styles.composer}>
          <span className={styles.composerRow}>
            <Draft draft={chat.draft} placeholder="Message your agent" className={styles.field} />
            <span className={styles.send} data-active={chat.draft ? true : undefined} data-pressing={chat.sending || undefined}>
              <SfSymbol name="arrow.up" size={15} />
            </span>
          </span>
        </GlassPill>
      }
    />
  );
}
