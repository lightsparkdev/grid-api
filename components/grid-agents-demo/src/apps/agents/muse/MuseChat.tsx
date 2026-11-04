import { TextMorph } from 'torph/react';
import { SfSymbol } from '@/apps/shared/icons';
import { ChatFrame, Draft, Said } from '../ChatFrame';
import { GlassDisc, GlassPill } from '../glass';
import type { AskRow, Message } from '../conversation';
import { ChipRow, MORPH, NoteCard, RowGlyph } from '../parts';
import type { AgentChatProps } from '../types';
import styles from './MuseChat.module.scss';

/** Figma 87:259, Muse · Approval (Meta Pay balance); dark from 124:3873. */
const A = '/assets/agents/muse';

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

/** Meta Pay's approval sheet: what the agent wants, the details, the total, Deny or Allow. */
function ApprovalCard({ m, onAnswer }: { m: Extract<Message, { kind: 'ask' }>; onAnswer: () => void }) {
  const { ask, state } = m;
  const done = state === 'done';
  return (
    <div className={styles.card}>
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
      <div className={styles.actions}>
        <button type="button" className={styles.deny} disabled={done}>
          {ask.deny ?? 'Deny'}
        </button>
        <button
          type="button"
          className={styles.allow}
          data-pressing={state === 'pressing' || state === 'authing' || undefined}
          data-done={done || undefined}
          onClick={onAnswer}
        >
          <TextMorph {...MORPH}>{done ? (ask.allowed ?? 'Allowed') : (ask.allow ?? 'Allow')}</TextMorph>
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

const TABS = [
  ['tab-chat', 52, 811, 25.3, 22.7],
  ['tab-feed', 122, 810, 22.7, 22.7],
  ['tab-ideas', 192, 810, 17.7, 23.3],
  ['tab-goals', 258, 810, 22.7, 22.7],
  ['tab-library', 326, 811, 22, 21.7],
] as const;

export function MuseChat({ chat, dark }: AgentChatProps) {
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
        return <ApprovalCard m={m} onAnswer={chat.answer} />;
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
      gap={10}
      composerBottom={103}
      composerHeight={44}
      edge={<div className={styles.edge} />}
      header={
        <>
          <div className={styles.menu}>
            <GlassDisc label="Menu" icon={`${A}/menu.svg`} width={32} height={32} />
          </div>
          <div className={styles.gift}>
            <GlassDisc label="Gift" icon={`${A}/gift.svg`} width={24} height={24} />
          </div>
          <GlassPill radius={16} absolute className={styles.status}>
            <span className={styles.statusText}>
              <strong>Muse</strong>
              <span data-asking={chat.asking || undefined}>
                <TextMorph {...MORPH}>{chat.asking ? 'Needs approval' : 'Assistant'}</TextMorph>
              </span>
            </span>
          </GlassPill>
          <img className={styles.avatar} src={`${A}/avatar.png`} alt="" width={68} height={68} draggable={false} />
        </>
      }
      composer={
        <GlassPill radius={22} className={styles.composer}>
          <span className={styles.composerRow}>
            <span className={styles.slot}>
              <span className={styles.icon} style={{ maskImage: `url(${A}/plus.svg)` }} />
            </span>
            <Draft draft={chat.draft} placeholder="Message" className={styles.field} />
            <span className={styles.slot}>
              <span className={styles.icon} style={{ maskImage: `url(${A}/mic.svg)` }} />
            </span>
            <span className={styles.slot}>
              {chat.draft ? (
                <span className={styles.send} data-pressing={chat.sending || undefined}>
                  <SfSymbol name="arrow.up" size={15} />
                </span>
              ) : (
                <span className={styles.stop}>
                  <img src={`${A}/stop.svg`} alt="" width={15} height={15} />
                </span>
              )}
            </span>
          </span>
        </GlassPill>
      }
      tabBar={
        <div className={styles.tabBar}>
          <GlassPill radius={29} absolute className={styles.tabPill}>
            <span className={styles.tabSelected} />
          </GlassPill>
          {TABS.map(([icon, x, y, w, h]) => (
            <span
              key={icon}
              className={styles.tabIcon}
              style={{ left: x, top: y - 779, width: w, height: h, maskImage: `url(${A}/${icon}.png)` }}
            />
          ))}
        </div>
      }
    />
  );
}
