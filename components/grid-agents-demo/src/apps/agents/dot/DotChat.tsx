import { Flag } from '@/apps/shared/Flag';
import { SfSymbol } from '@/apps/shared/icons';
import { ChatFrame, ComposerField, Said } from '../ChatFrame';
import { GlassDisc, GlassPill } from '../glass';
import type { Message } from '../conversation';
import { AskCard, Divider, MetaLine, NoteCard, ProductRow, WorkLine } from '../parts';
import type { AgentChatProps } from '../types';
import styles from './DotChat.module.scss';

/** Figma 89:185, Dots · Fund account (PIX/SPEI/SEPA). */
const A = '/assets/agents/dot';

const mask = (src: string, width: number, height: number) => ({ maskImage: `url(${src})`, width, height });

// The real app widens its field over the keyboard and adds a send button beside the mic
// (Pat's capture, IMG_1807: 327pt at rest, about 371pt typing).
const RESTING_WIDTH = 327;
const TYPING_WIDTH = 371;

export function DotChat({ chat }: AgentChatProps) {
  const lastMe = chat.messages.reduce((id, m) => (m.kind === 'me' ? m.id : id), -1);

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
                {c.flag ? (
                  <Flag code={c.flag} size={22} />
                ) : c.icon ? (
                  <img src={c.icon} alt="" width={22} height={22} />
                ) : null}
                {c.label}
                <span className={styles.chevron} />
              </button>
            ))}
          </div>
        );
      case 'ask':
        return <AskCard ask={m.ask} state={m.state} onAllow={chat.allow} onDeny={chat.deny} />;
      case 'card':
        return <NoteCard note={m.card} />;
      case 'stamp':
      case 'tag':
        return <span className={styles.stamp}>{m.text}</span>;
      case 'work':
        return <WorkLine status={m.status} />;
      case 'products':
        return <ProductRow products={m.products} />;
      case 'meta':
        return <MetaLine meta={m.meta} />;
      case 'divider':
        return <Divider text={m.text} />;
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
      gap={5}
      threadTop={172}
      composerBottom={38.5}
      composerHeight={48.5}
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
        <GlassPill
          radius={24.25}
          className={styles.composer}
          style={{ width: chat.composer.length > 0 ? TYPING_WIDTH : RESTING_WIDTH }}
        >
          <span className={styles.composerRow}>
            <span className={styles.slot}>
              <span className={styles.glyph} style={mask(`${A}/plus.svg`, 18, 18)} />
            </span>
            <ComposerField chat={chat} placeholder="Message your dot" className={styles.field} />
            <span className={styles.slot}>
              <span className={styles.glyph} style={mask(`${A}/mic.svg`, 16, 22)} />
            </span>
            {chat.composer.length > 0 && (
              <span className={styles.sendSlot}>
                <span className={styles.send} role="button" onClick={chat.send} data-ready={chat.canSend || undefined}>
                  <SfSymbol name="arrow.up" size={17} />
                </span>
              </span>
            )}
          </span>
        </GlassPill>
      }
    />
  );
}
