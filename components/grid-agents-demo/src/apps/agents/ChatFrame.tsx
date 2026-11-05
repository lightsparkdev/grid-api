import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
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
/** The field grows a line at a time to this many, then scrolls. */
const COMPOSER_LINES = 5;

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
  threadTop,
  fadeTop,
  faceId,
  onFaceIdDone,
}: {
  className?: string;
  messages: Message[];
  /** A message, given the thread around it (group chats show a sender's name and avatar once per run). */
  render: (m: Message, i: number, all: Message[]) => ReactNode;
  header: ReactNode;
  /** The brand's scroll-edge fade under the header. */
  edge?: ReactNode;
  /** Where a short thread starts (pt from the top, under the header); it fills down, then scrolls up from the composer. */
  threadTop?: number;
  /** Fade the thread out under the header: gone above `[0]`, whole from `[1]` (pt from the top). Defaults to the 64pt above `threadTop`. */
  fadeTop?: [number, number];
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
  const fade = fadeTop ?? (threadTop !== undefined ? [threadTop - 64, threadTop] : undefined);
  // The composer grows with its text, and the thread's foot rises with it.
  const composerRef = useRef<HTMLDivElement>(null);
  const [composerH, setComposerH] = useState(composerHeight);
  useLayoutEffect(() => {
    const el = composerRef.current;
    if (!el) return;
    const measure = () => setComposerH(Math.max(composerHeight, el.offsetHeight));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [composerHeight]);
  return (
    <div
      className={`${styles.screen} ${className ?? ''}`}
      style={
        {
          '--composer-bottom': `${composerBottom}px`,
          '--thread-foot': `${composerBottom + composerH + 12}px`,
          '--gap': `${gap}px`,
          ...(threadTop !== undefined && { '--thread-top': `${threadTop}px` }),
        } as CSSProperties
      }
    >
      <div
        className={styles.thread}
        style={
          fade && {
            maskImage: `linear-gradient(180deg, transparent ${fade[0]}px, #000 ${fade[1]}px)`,
          }
        }
      >
        <div className={styles.stack} data-top={threadTop !== undefined || undefined}>
          {messages.map((m, i) => {
            const node = render(m, i, messages);
            // A skin may draw a message elsewhere (Muse's status sits in its header).
            if (node === null) return null;
            return (
              <motion.div
                key={m.id}
                layout="position"
                className={styles.row}
                data-kind={m.kind}
                initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={ROW_IN}
              >
                {node}
              </motion.div>
            );
          })}
        </div>
      </div>
      {edge}
      {header}
      {tabBar}
      <div ref={composerRef} className={styles.composer}>
        {composer}
      </div>
      {overlay && onFaceIdDone && createPortal(<FaceIdAuth active={!!faceId} onDone={onFaceIdDone} />, overlay)}
    </div>
  );
}

/**
 * The composer's field: a real text area that grows a line at a time (up to
 * COMPOSER_LINES, then scrolls). Enter sends; Shift+Enter starts a new line.
 * A hidden twin measures the text, so the height can animate between lines.
 * Skins set `--field-pad` (the padding that centers one line against their
 * buttons) and may style the wrapper's `[data-multiline]`.
 */
export function ComposerField({
  chat,
  placeholder,
  className,
}: {
  chat: Pick<ChatView, 'composer' | 'setComposer' | 'send'>;
  placeholder: string;
  className?: string;
}) {
  const wrap = useRef<HTMLSpanElement>(null);
  const twin = useRef<HTMLTextAreaElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [lines, setLines] = useState(1);

  useLayoutEffect(() => {
    const el = twin.current;
    const box = wrap.current;
    if (!el || !box) return;
    const measure = () => {
      el.value = chat.composer || ' ';
      const cs = getComputedStyle(el);
      const line = parseFloat(cs.lineHeight) || 22;
      const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      const n = Math.max(1, Math.round((el.scrollHeight - pad) / line));
      setLines(n);
      setHeight(Math.min(n, COMPOSER_LINES) * line + pad);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    return () => ro.disconnect();
  }, [chat.composer]);

  return (
    <span ref={wrap} className={`${styles.fieldWrap} ${className ?? ''}`} data-multiline={lines > 1 || undefined}>
      <textarea
        className={styles.field}
        style={{ height: height ?? undefined }}
        rows={1}
        value={chat.composer}
        placeholder={placeholder}
        maxLength={COMPOSER_MAX}
        enterKeyHint="send"
        aria-label="Message"
        data-scrolls={lines > COMPOSER_LINES || undefined}
        onChange={(e) => chat.setComposer(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chat.send();
          }
        }}
      />
      <textarea ref={twin} className={`${styles.field} ${styles.twin}`} rows={1} tabIndex={-1} aria-hidden readOnly />
    </span>
  );
}

/** A bubble that shows the typing dots, then becomes the message: one object, so nothing below it has to close a gap. */
export function Said({
  typing,
  className,
  pos,
  children,
}: {
  typing: boolean;
  className?: string;
  /** Where the bubble sits in a run of the sender's messages, for skins that join corners. */
  pos?: string;
  children: ReactNode;
}) {
  return (
    <motion.div layout className={className} data-pos={pos} transition={motionTransition(easeOutSnappy, 0.45)}>
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
