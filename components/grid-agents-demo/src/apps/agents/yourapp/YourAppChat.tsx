import { TextMorph } from 'torph/react';
import { SfSymbol } from '@/apps/shared/icons';
import { GridLogoMark } from '@/components/GridWordmark';
import { ChatFrame, ComposerField, Said, ScrollEdge } from '../ChatFrame';
import { GlassPill } from '../glass';
import type { Message } from '../conversation';
import { AskCard, BalanceCard, ChipRow, Divider, MetaLine, MORPH, NoteCard, ProductRow, SubAgentRow, useSubAgentSheet, WorkLine } from '../parts';
import { useBankLink, useCardSheet, VaultBankAsk, VaultCardAsk } from '../vault/BankLink';
import type { AgentChatProps } from '../types';
import styles from './YourAppChat.module.scss';

/** A plain chat for the agent a platform builds itself: no brand, just the thread. */
export function YourAppChat({ chat }: AgentChatProps) {
  const sub = useSubAgentSheet(chat.messages);
  const card = useCardSheet({ messages: chat.messages, onAllow: chat.allow });
  const bank = useBankLink({ wallet: 'your balance', messages: chat.messages, onAllow: chat.allow, onDeny: chat.deny });
  const render = (m: Message, i: number, all: Message[]) => {
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
        return <span className={styles.me} data-bubble>{m.text}</span>;
      case 'ask':
        if (m.ask.bank) return <VaultBankAsk ask={m.ask} state={m.state} onOpen={() => bank.open(m.id)} onDeny={chat.deny} />;
        if (m.ask.card) return <VaultCardAsk ask={m.ask} state={m.state} onOpen={() => card.open(m.id, m.ask)} onDeny={chat.deny} />;
        return <AskCard ask={m.ask} state={m.state} onAllow={chat.allow} onDeny={chat.deny} />;
      case 'card':
        return m.card.balance ? <BalanceCard balance={m.card.balance} onAction={chat.prompt} className={styles.accountSkin} /> : <NoteCard note={m.card} />;
      case 'chips':
        return <ChipRow chips={m.chips} picked={m.picked} onPick={chat.pick} expired={m.expired} />;
      case 'tag':
      case 'stamp':
        return <span className={styles.stamp}>{m.text}</span>;
      case 'work':
        return <WorkLine status={m.status} />;
      case 'products':
        return <ProductRow products={m.products} />;
      case 'meta': {
        // A saved card or linked bank already says so.
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
      threadTop={172}
      composerBottom={34}
      composerHeight={48}
      edge={<ScrollEdge className={styles.edge} />}
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
            <ComposerField chat={chat} placeholder="Message your agent" className={styles.field} />
            <span className={styles.send} data-active={chat.composer ? true : undefined} role="button" onClick={chat.send} data-ready={chat.canSend || undefined}>
              <SfSymbol name="arrow.up" size={15} />
            </span>
          </span>
        </GlassPill>
      }
    />
  );
}
