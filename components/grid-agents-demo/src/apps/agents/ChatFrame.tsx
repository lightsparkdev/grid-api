import type { CSSProperties, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useScreenOverlay } from '@/apps/shared/AppShell/ScreenOverlayContext';
import { FaceIdAuth } from '@/apps/shared/FaceIdAuth';
import { easeOutSnappy, motionTransition } from '@/lib/easing';
import type { Message } from './conversation';
import type { ChatView } from './types';
import styles from './ChatFrame.module.scss';

const ROW_IN = motionTransition(easeOutSnappy, 0.5);
/** The composer takes a sentence, not an essay (the model's guardrails start here). */
export const COMPOSER_MAX = 300;

/**
 * The frame every agent chat shares, at the phone's true 402 × 874: a thread
 * pinned to the composer (new messages land at the foot and push the rest up
 * under the brand's scroll edge and header), the composer, and an optional tab bar.
 */
export function ChatFrame({
  className,
  messages,
  render,
  header,
  edge,
  composer,
  tabBar,
  composerBottom,
  composerHeight,
  gap = 8,
  faceId,
  onFaceIdDone,
}: {
  className?: string;
  messages: Message[];
  /** A message, given the thread around it (group chats show a sender's name and avatar once per run). */
  render: (m: Message, i: number, all: Message[]) => ReactNode;
  header: ReactNode;
  /** The brand's scroll-edge fade under the header. */
  edge: ReactNode;
  composer: ReactNode;
  tabBar?: ReactNode;
  /** The composer's resting distance from the screen's foot, and its height (pt). */
  composerBottom: number;
  composerHeight: number;
  /** Space between messages. */
  gap?: number;
  /** Face ID plays in the Dynamic Island (portaled over the status bar, as the wallet apps do). */
  faceId?: boolean;
  onFaceIdDone?: () => void;
}) {
  const overlay = useScreenOverlay();
  return (
    <div
      className={`${styles.screen} ${className ?? ''}`}
      style={
        {
          '--composer-bottom': `${composerBottom}px`,
          '--thread-foot': `${composerBottom + composerHeight + 12}px`,
          '--gap': `${gap}px`,
        } as CSSProperties
      }
    >
      <div className={styles.thread}>
        <div className={styles.stack}>
          {messages.map((m, i) => (
            <motion.div
              key={m.id}
              layout="position"
              className={styles.row}
              data-kind={m.kind}
              initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={ROW_IN}
            >
              {render(m, i, messages)}
            </motion.div>
          ))}
        </div>
      </div>
      {edge}
      {header}
      {tabBar}
      <div className={styles.composer}>{composer}</div>
      {overlay && onFaceIdDone && createPortal(<FaceIdAuth active={!!faceId} onDone={onFaceIdDone} />, overlay)}
    </div>
  );
}

/**
 * The composer's field: a real input. A tile prefills it with its flow's line;
 * the visitor sends it, or types their own (answered by the model).
 */
export function ComposerField({
  chat,
  placeholder,
  className,
}: {
  chat: Pick<ChatView, 'composer' | 'setComposer' | 'send' | 'prefilled'>;
  placeholder: string;
  className?: string;
}) {
  return (
    <input
      className={`${styles.field} ${className ?? ''}`}
      data-prefilled={chat.prefilled || undefined}
      value={chat.composer}
      placeholder={placeholder}
      maxLength={COMPOSER_MAX}
      enterKeyHint="send"
      aria-label="Message"
      onChange={(e) => chat.setComposer(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          chat.send();
        }
      }}
    />
  );
}

/** A bubble that shows the typing dots, then becomes the message: one object, so nothing below it has to close a gap. */
export function Said({
  typing,
  className,
  children,
}: {
  typing: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div layout className={className} transition={motionTransition(easeOutSnappy, 0.45)}>
      <AnimatePresence initial={false} mode="popLayout">
        {typing ? (
          <motion.div key="dots" exit={{ opacity: 0, filter: 'blur(4px)' }} transition={{ duration: 0.15 }}>
            <TypingDots />
          </motion.div>
        ) : (
          <motion.div
            key="text"
            initial={{ opacity: 0, filter: 'blur(4px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={motionTransition(easeOutSnappy, 0.4)}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Three dots in a bubble while the agent writes. */
export function TypingDots() {
  return (
    <span className={styles.dots} aria-label="Typing">
      <i />
      <i />
      <i />
    </span>
  );
}
