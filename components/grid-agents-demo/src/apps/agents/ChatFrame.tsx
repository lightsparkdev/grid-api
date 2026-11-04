import type { CSSProperties, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useScreenOverlay } from '@/apps/shared/AppShell/ScreenOverlayContext';
import { FaceIdAuth } from '@/apps/shared/FaceIdAuth';
import { KEYBOARD_H, Keyboard } from '@/apps/agents/keyboard/Keyboard';
import { suggestionsFor } from '@/apps/agents/keyboard/suggest';
import { easeOutSnappy, motionTransition } from '@/lib/easing';
import type { Message } from './conversation';
import type { Keys } from './useAgentChat';
import styles from './ChatFrame.module.scss';

// The keyboard's timing from the GoFundMe demo (in 0.35s after a 0.12s lag, out in 0.19s).
const KEYBOARD_IN = { duration: 0.35, ease: [0.4, 0, 0.35, 1] as const, delay: 0.12 };
const KEYBOARD_OUT = { duration: 0.19, ease: [0.4, 0, 0.35, 1] as const };
const ROW_IN = motionTransition(easeOutSnappy, 0.5);

/**
 * The frame every agent chat shares, at the phone's true 402 × 874: a thread pinned
 * to the composer (new messages land at the foot and push the rest up under the
 * brand's scroll edge and header), the composer, an optional tab bar, and the
 * keyboard, which lifts the thread and composer together as iOS does.
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
  foot = 0,
  draft,
  keys,
  dark,
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
  /** Points of screen the tile crops off the bottom; the composer and newest message sit above them. */
  foot?: number;
  draft: string | null;
  keys: Keys;
  dark?: boolean;
  /** Face ID plays in the Dynamic Island (portaled over the status bar, as the wallet apps do). */
  faceId?: boolean;
  onFaceIdDone?: () => void;
}) {
  const overlay = useScreenOverlay();
  const restingBottom = composerBottom + foot;
  // The keyboard stays at the true foot of the screen (the tile crops it as it crops the phone);
  // the composer rides up to sit 8pt over it.
  const lift = Math.max(0, KEYBOARD_H + 8 - restingBottom);
  return (
    <div
      className={`${styles.screen} ${className ?? ''}`}
      data-keyboard={draft !== null || undefined}
      style={
        {
          '--composer-bottom': `${restingBottom}px`,
          '--thread-foot': `${restingBottom + composerHeight + 12}px`,
          '--lift': `${lift}px`,
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
      <AnimatePresence>
        {draft !== null && (
          <motion.div
            key="keyboard"
            className={styles.keyboard}
            initial={{ y: KEYBOARD_H + 40 }}
            animate={{ y: 0, transition: KEYBOARD_IN }}
            exit={{ y: KEYBOARD_H + 40, transition: KEYBOARD_OUT }}
          >
            <Keyboard
              layer={keys.layer}
              shift={keys.shift}
              pressed={keys.pressed}
              dark={dark}
              suggestions={suggestionsFor(draft)}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {overlay &&
        onFaceIdDone &&
        createPortal(<FaceIdAuth active={!!faceId} onDone={onFaceIdDone} />, overlay)}
    </div>
  );
}

/** The composer's field: the placeholder, or what's being typed with its caret, newest words in view. */
export function Draft({
  draft,
  placeholder,
  className,
}: {
  draft: string | null;
  placeholder: string;
  className?: string;
}) {
  return draft ? (
    <span className={`${styles.field} ${styles.typed} ${className ?? ''}`}>
      <span className={styles.line}>
        {draft}
        <i className={styles.caret} />
      </span>
    </span>
  ) : (
    <span className={`${styles.field} ${className ?? ''}`}>
      {draft !== null && <i className={styles.caret} />}
      <span className={styles.placeholder}>{placeholder}</span>
    </span>
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
          <motion.div
            key="dots"
            exit={{ opacity: 0, filter: 'blur(4px)' }}
            transition={{ duration: 0.15 }}
          >
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
