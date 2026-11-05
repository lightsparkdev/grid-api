import { TextMorph } from 'torph/react';
import { Flag } from '@/apps/shared/Flag';
import { ChatFrame, ComposerField, Said } from '../ChatFrame';
import { GlassDisc, GlassPill } from '../glass';
import type { Message } from '../conversation';
import { askButtons, AskCard, ChipRow, Divider, MetaLine, MORPH, NoteCard, ProductRow, WorkLine } from '../parts';
import type { AgentChatProps } from '../types';
import styles from './GrokChat.module.scss';

/** Figma 89:95, Grok Bot · Pay abroad (PIX). */
const A = '/assets/agents/grok';

const mask = (src: string) => ({ maskImage: `url(${src})` });

/** Grok's payout row: who, what, and Approve, with its promise under it. */
function PayoutCard({
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
  const name = ask.who?.name ?? ask.title;
  const detail = ask.who?.detail ?? [ask.amount, ask.method].filter(Boolean).join(' · ');
  return (
    <div className={styles.payoutWrap}>
      <div className={styles.payout}>
        <span className={styles.flagTile}>
          {ask.who?.flag ? <Flag code={ask.who.flag} size={34} /> : name[0]}
        </span>
        <span className={styles.payoutText}>
          <span className={styles.payoutName}>
            {name}
            {ask.who && <img src={`${A}/verified.svg`} alt="" width={16} height={16} />}
          </span>
          <span className={styles.payoutDetail}>{detail}</span>
        </span>
        <button
          type="button"
          className={styles.approve}
          data-pressing={b.pressing || undefined}
          data-done={state === 'done' || undefined}
          data-muted={state === 'denied' || state === 'expired' || undefined}
          disabled={b.settled || b.pressing}
          onClick={onAllow}
        >
          <TextMorph {...MORPH}>{state === 'denied' ? b.denyLabel : b.allowLabel}</TextMorph>
        </button>
      </div>
      <p className={styles.caption}>
        Grok Bot always asks before moving money over your limit.{' '}
        {!b.settled && !b.pressing && (
          <button type="button" className={styles.decline} onClick={onDeny}>
            {ask.deny ?? 'Decline'}
          </button>
        )}
      </p>
    </div>
  );
}

export function GrokChat({ chat }: AgentChatProps) {
  const render = (m: Message) => {
    switch (m.kind) {
      case 'them':
        return (
          <>
            {m.sender && <span className={styles.sender}>{m.sender}</span>}
            <Said typing={m.typing} className={styles.bubble}>
              <p>{m.text}</p>
              {m.bullets?.map((b) => (
                <div key={b} className={styles.bullet}>
                  <span>•</span>
                  <p>{b}</p>
                </div>
              ))}
            </Said>
          </>
        );
      case 'me':
        return <span className={styles.me}>{m.text}</span>;
      case 'ask':
        // The payout row is for moving money; an ask with details to read (connecting, limits) is a plain approval.
        return m.ask.rows ? (
          <AskCard ask={m.ask} state={m.state} onAllow={chat.allow} onDeny={chat.deny} />
        ) : (
          <PayoutCard m={m} onAllow={chat.allow} onDeny={chat.deny} />
        );
      case 'card':
        return <NoteCard note={m.card} />;
      case 'chips':
        return <ChipRow chips={m.chips} picked={m.picked} onPick={chat.pick} expired={m.expired} />;
      case 'tag':
      case 'stamp':
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
      gap={9}
      threadTop={124}
      composerBottom={26}
      composerHeight={48}
      edge={<div className={styles.edge} />}
      header={
        <>
          <div className={styles.back}>
            <GlassDisc label="Back" icon={`${A}/back.svg`} width={12} height={20} />
          </div>
          <div className={styles.more}>
            <GlassDisc label="More" icon={`${A}/ellipsis.svg`} width={18} height={4} />
          </div>
          <GlassPill radius={22} absolute className={styles.title}>
            <span className={styles.titleRow}>
              <img src={`${A}/avatar.svg`} alt="" width={28} height={28} />
              Grok Bot
            </span>
          </GlassPill>
        </>
      }
      composer={
        <GlassPill radius={24} className={styles.composer}>
          <span className={styles.composerRow}>
            <span className={styles.plus}>
              <span className={styles.glyph} style={{ ...mask(`${A}/plus.svg`), width: 14, height: 14 }} />
            </span>
            <ComposerField chat={chat} placeholder="Ask Grok Bot" className={styles.field} />
            <span className={`${styles.glyph} ${styles.mic}`} style={{ ...mask(`${A}/mic.svg`), width: 14, height: 20, opacity: 0.6 }} />
            <span className={styles.voice} role="button" onClick={chat.send} data-ready={chat.canSend || undefined}>
              <span className={styles.voiceGlyph} style={{ ...mask(`${A}/waveform.svg`), width: 16, height: 14 }} />
            </span>
          </span>
        </GlassPill>
      }
    />
  );
}
