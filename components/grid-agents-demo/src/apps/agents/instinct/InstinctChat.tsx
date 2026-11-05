import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { PhoneStatusBar } from '@/apps/shared/AppShell/PhoneStatusBar';
import { playAppSwitch, WALLPAPER } from '@/apps/shared/appSwitch';
import { SfSymbol } from '@/apps/shared/icons';
import { ChatFrame, ComposerField, Said } from '../ChatFrame';
import { GlassDisc, GlassPill } from '../glass';
import type { Message } from '../conversation';
import { ChipRow, Divider, MetaLine, NoteCard, ProductRow, WorkLine } from '../parts';
import type { AgentChatProps } from '../types';
import { INSTINCT_HOST, InstinctSafari } from './InstinctSafari';
import styles from './InstinctChat.module.scss';

/** Figma 89:297 (iMessage), as your 1:1 thread with Instinct; approvals open app.instinct.com in Safari. */
const A = '/assets/agents/instinct';

const mask = (src: string, width: number, height: number) => ({ maskImage: `url(${src})`, width, height });

/** Instinct's side of the thread: its texts, cards, links and quick replies run together; the last text takes the tail. */
const THEIRS = new Set<Message['kind']>(['them', 'card', 'chips', 'ask']);

type Ask = Extract<Message, { kind: 'ask' }>;

/** After the page settles, the beat Safari holds before heading back to Messages. */
const RETURN_MS = 900;

/** Your message gets Instinct's 👍 once the approval it led to goes through. */
function tapbackFor(i: number, all: Message[]) {
  for (let j = i + 1; j < all.length; j++) {
    const m = all[j];
    if (m.kind === 'me') return false;
    if (m.kind === 'ask') return m.state === 'done';
  }
  return false;
}

/** An iMessage rich link to Instinct's approval page: the page's preview, then its title and domain. */
function LinkPreview({ m, onOpen }: { m: Ask; onOpen: () => void }) {
  const { ask, state } = m;
  return (
    <button type="button" className={styles.link} data-open-link disabled={state !== 'open'} onClick={onOpen}>
      <span className={styles.linkHero}>
        <span className={styles.linkMark}>
          <img src={`${A}/logo.png`} alt="" width={6.3} height={17.6} />
        </span>
        <span className={styles.linkHeadline}>{ask.amount ?? ask.total ?? 'Approve'}</span>
        <span className={styles.linkState} data-state={state}>
          {state === 'done' ? 'Approved' : state === 'denied' ? 'Declined' : state === 'expired' ? 'Expired' : 'Tap to review'}
        </span>
      </span>
      <span className={styles.linkMeta}>
        <strong>{ask.title}</strong>
        <small>{INSTINCT_HOST}</small>
      </span>
    </button>
  );
}

export function InstinctChat({ chat, dark }: AgentChatProps) {
  const messagesCard = useRef<HTMLDivElement>(null);
  const safariCard = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<'messages' | 'safari'>('messages');
  const [switchTo, setSwitchTo] = useState<'messages' | 'safari' | null>(null);
  const [linkId, setLinkId] = useState<number | null>(null);
  const open = chat.messages.find((m): m is Ask => m.kind === 'ask' && m.id === linkId);

  const openLink = (id: number) => {
    if (switchTo || view !== 'messages') return;
    setLinkId(id);
    setSwitchTo('safari');
  };
  const back = useCallback(() => {
    if (switchTo || view !== 'safari') return;
    setSwitchTo('messages');
  }, [switchTo, view]);

  // Both apps ride the switch as cards with their own status bars; the phone's own bar steps aside meanwhile.
  useLayoutEffect(() => {
    if (!switchTo) return;
    const [from, to] = switchTo === 'safari' ? [messagesCard.current, safariCard.current] : [safariCard.current, messagesCard.current];
    if (!from || !to) return;
    const stage = from.parentElement!;
    const statusBar = stage.closest('[data-screen-body]')?.parentElement?.querySelector<HTMLElement>('[data-status-bar]');
    if (statusBar) statusBar.style.visibility = 'hidden';
    const radius = parseFloat(getComputedStyle(stage).getPropertyValue('--screen-corner-radius')) || 55;
    let live = true;
    playAppSwitch(from, to, { wallpaper: WALLPAPER, radius, direction: switchTo === 'safari' ? 1 : -1 }).then(() => {
      if (statusBar) statusBar.style.visibility = '';
      if (!live) return;
      setView(switchTo);
      setSwitchTo(null);
    });
    return () => {
      live = false;
      if (statusBar) statusBar.style.visibility = '';
    };
  }, [switchTo]);

  // Once the page has its answer (or the request is gone), Safari hands back to Messages.
  const askState = open?.state;
  useEffect(() => {
    if (view !== 'safari' || switchTo) return;
    if (askState === 'open' || askState === 'pressing' || askState === 'authing') return;
    const t = window.setTimeout(back, askState === 'done' || askState === 'denied' ? RETURN_MS : 0);
    return () => window.clearTimeout(t);
  }, [view, switchTo, askState, back]);

  const render = (m: Message, i: number, all: Message[]) => {
    const theirsNext = i < all.length - 1 && THEIRS.has(all[i + 1].kind);
    switch (m.kind) {
      case 'stamp':
      case 'tag':
        return (
          <span className={styles.stamp}>
            {i === 0 && <strong>iMessage</strong>}
            {m.text}
          </span>
        );
      case 'them':
        return (
          <div className={styles.body}>
            <Said typing={m.typing} className={styles.bubble}>
              {m.text}
            </Said>
            {!theirsNext && <span className={styles.tailIn} />}
          </div>
        );
      case 'card':
        return <NoteCard note={m.card} className={styles.ask} />;
      case 'ask':
        return <LinkPreview m={m} onOpen={() => openLink(m.id)} />;
      case 'chips':
        return <ChipRow chips={m.chips} picked={m.picked} onPick={chat.pick} expired={m.expired} />;
      case 'me':
        return (
          <span className={styles.me}>
            {m.text}
            <span className={styles.tailOut} />
            {tapbackFor(i, all) && <span className={styles.tapback}>👍</span>}
          </span>
        );
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

  const tone = dark ? 'light' : 'default';
  const showSafari = (view === 'safari' || switchTo !== null) && open;

  return (
    <div className={styles.stage}>
      <div ref={messagesCard} className={styles.card} data-away={(view === 'safari' && !switchTo) || undefined}>
        <ChatFrame
          className={styles.screen}
          messages={chat.messages}
          render={render}
          faceId={chat.authing}
          onFaceIdDone={chat.authed}
          gap={3}
          threadTop={178}
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
                <span className={styles.navInstinct}>
                  <img src={`${A}/logo.png`} alt="" width={10.4} height={28.9} />
                </span>
                <GlassPill radius={16} absolute className={styles.name}>
                  <span className={styles.nameRow}>
                    Instinct
                    <span className={styles.muted} style={mask(`${A}/chevron.svg`, 6, 11)} />
                  </span>
                </GlassPill>
              </div>
            </div>
          }
          composer={
            <div className={styles.composer}>
              <GlassPill radius={20} className={styles.plus}>
                <span className={styles.plusIcon}>
                  <span className={styles.glyph} style={mask(`${A}/plus.svg`, 16, 16)} />
                </span>
              </GlassPill>
              <GlassPill radius={20} className={styles.field}>
                <span className={styles.fieldRow}>
                  <ComposerField chat={chat} placeholder="iMessage" className={styles.fieldText} />
                  {chat.composer ? (
                    <span className={styles.send} role="button" onClick={chat.send} data-ready={chat.canSend || undefined}>
                      <SfSymbol name="arrow.up" size={14} />
                    </span>
                  ) : (
                    <span className={`${styles.muted} ${styles.dictation}`} style={mask(`${A}/dictation.svg`, 18, 16)} />
                  )}
                </span>
              </GlassPill>
            </div>
          }
        />
        {switchTo && (
          <div className={styles.cardStatus}>
            <PhoneStatusBar tone={tone} />
          </div>
        )}
      </div>
      {showSafari && (
        <div ref={safariCard} className={styles.card} data-switching={switchTo !== null || undefined}>
          <InstinctSafari ask={open.ask} state={open.state} onAllow={chat.allow} onDeny={chat.deny} onBack={back} />
          {switchTo && (
            <div className={styles.cardStatus}>
              <PhoneStatusBar tone={tone} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
