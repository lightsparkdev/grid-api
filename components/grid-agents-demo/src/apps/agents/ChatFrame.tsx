import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, type TargetAndTransition, type Transition } from 'motion/react';
import { useScreenOverlay } from '@/apps/shared/AppShell/ScreenOverlayContext';
import { FaceIdAuth } from '@/apps/shared/FaceIdAuth';
import { easeOutSnappy, motionTransition } from '@/lib/easing';
import { smoothShapeClip, type CapsuleQuarter } from '@/lib/squircle/path';
import type { Message } from './conversation';
import type { ChatView } from './types';
import styles from './ChatFrame.module.scss';

const ROW_IN = motionTransition(easeOutSnappy, 0.5);

/** How the thread moves up when something lands at its foot (fitted to the Grok and Dots captures, 233–300ms). */
export const THREAD_SCROLL: Transition = { duration: 0.28, ease: [0.28, 0.05, 0.65, 1] };

/** cubic-bezier(x1, y1, x2, y2) as a function of time, for the thread's own scroll animation. */
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const at = (a: number, b: number, t: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  return (x: number) => {
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (at(x1, x2, mid) < x) lo = mid;
      else hi = mid;
    }
    return at(y1, y2, (lo + hi) / 2);
  };
}
/** How the thread moves to its foot: a timed curve, or at once. */
export type ScrollCurve = { ms: number; ease: [number, number, number, number] } | 'snap';
/** What grew the thread: a new row of this kind, the agent starting to type, or a row growing in place (a receipt, a reaction, the composer). */
export type ScrollCause = Message['kind'] | 'typing' | 'grow';

const DEFAULT_SCROLL: ScrollCurve = { ms: 280, ease: [0.28, 0.05, 0.65, 1] };

/**
 * Keeps a scrolling thread on its newest message: when the content grows (a
 * message, a typing bubble turning into text, the composer growing), the whole
 * thread scrolls up together on the curve the skin measured for what grew it.
 * Scrolled back to read, it stays put until the visitor returns to the foot.
 */
function useStickToEnd(
  scroller: React.RefObject<HTMLDivElement>,
  content: React.RefObject<HTMLDivElement>,
  curveFor: React.MutableRefObject<() => ScrollCurve>,
) {
  useEffect(() => {
    const el = scroller.current;
    const inner = content.current;
    if (!el || !inner) return;
    let stuck = true;
    let raf = 0;
    let animating = false;
    // Where the thread last put itself. Its own writes fire scroll events a frame later, by which time a streamed
    // chunk may have grown the thread, and the browser scrolls on its own too (a clicked chip focusing into view).
    // Only a scroll right after the visitor's own gesture can unpin it.
    let placed = el.scrollTop;
    let gesture = -Infinity;
    const gestured = () => {
      gesture = performance.now();
    };
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) gestured();
    };
    const onPointer = (e: PointerEvent) => {
      if (e.target === el) gestured();
    };
    const place = (top: number) => {
      el.scrollTop = top;
      placed = el.scrollTop;
    };
    const end = () => el.scrollHeight - el.clientHeight;
    const settle = () => {
      cancelAnimationFrame(raf);
      animating = false;
    };
    const follow = () => {
      if (!stuck) return;
      const from = el.scrollTop;
      const to = end();
      if (Math.abs(to - from) < 1) return;
      settle();
      const curve = curveFor.current();
      // The first layout lands without motion.
      if (!el.dataset.ready || curve === 'snap') {
        place(to);
        return;
      }
      const ease = bezier(...curve.ease);
      animating = true;
      const t0 = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / curve.ms);
        place(from + (end() - from) * ease(t));
        if (t < 1) raf = requestAnimationFrame(step);
        else animating = false;
      };
      raf = requestAnimationFrame(step);
    };
    const onScroll = () => {
      if (animating || Math.abs(el.scrollTop - placed) < 1) return;
      // A trackpad moves a few px at a time: any step up leaves the foot, however close to it.
      const up = el.scrollTop < placed;
      placed = el.scrollTop;
      if (performance.now() - gesture > 500) return;
      stuck = !up && end() - el.scrollTop < 24;
    };
    const interrupt = () => {
      gestured();
      settle();
      stuck = end() - el.scrollTop < 24;
    };
    const ro = new ResizeObserver(follow);
    ro.observe(inner);
    ro.observe(el);
    follow();
    el.dataset.ready = '1';
    el.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('wheel', interrupt, { passive: true });
    el.addEventListener('touchstart', interrupt, { passive: true });
    el.addEventListener('touchmove', gestured, { passive: true });
    el.addEventListener('pointerdown', onPointer);
    el.addEventListener('keydown', onKey);
    return () => {
      settle();
      ro.disconnect();
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('wheel', interrupt);
      el.removeEventListener('touchstart', interrupt);
      el.removeEventListener('touchmove', gestured);
      el.removeEventListener('pointerdown', onPointer);
      el.removeEventListener('keydown', onKey);
    };
  }, [scroller, content, curveFor]);
}

/**
 * The header, scroll edge, tab bar and composer float over the thread, so a wheel
 * over them would go nowhere: it scrolls the thread instead, unless something under
 * the pointer scrolls that way itself (the composer's long text) or it's over a sheet.
 */
function useWheelThrough(screen: React.RefObject<HTMLDivElement>, thread: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
    const root = screen.current;
    const el = thread.current;
    if (!root || !el) return;
    const scrollsItself = (from: Element, dy: number) => {
      for (let n: Element | null = from; n && n !== root; n = n.parentElement) {
        if (n.scrollHeight <= n.clientHeight || !/auto|scroll/.test(getComputedStyle(n).overflowY)) continue;
        if (dy < 0 ? n.scrollTop > 0 : n.scrollTop < n.scrollHeight - n.clientHeight - 1) return true;
      }
      return false;
    };
    const onWheel = (e: WheelEvent) => {
      const t = e.target as Element;
      if (el.contains(t) || t.closest('[data-chat-overlay]') || scrollsItself(t, e.deltaY)) return;
      e.preventDefault();
      // As if it landed on the thread: the thread hears the gesture first, so it lets go of the foot.
      el.dispatchEvent(new WheelEvent('wheel', { deltaY: e.deltaY }));
      el.scrollTop += e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    };
    root.addEventListener('wheel', onWheel, { passive: false });
    return () => root.removeEventListener('wheel', onWheel);
  }, [screen, thread]);
}

/** A bubble up to 2.4 radii tall (one line in every skin) is a pill, with true capsule ends. */
const PILL_REACH = 1.2;
const CORNERS: [CapsuleQuarter, string][] = [
  ['tr', 'border-top-right-radius'],
  ['br', 'border-bottom-right-radius'],
  ['bl', 'border-bottom-left-radius'],
  ['tl', 'border-top-left-radius'],
];

/** The width of a bubble's text: its longest line, not the width the text wrapped in (absolute decorations aside). */
function textWidth(el: HTMLElement) {
  const range = document.createRange();
  let left = Infinity;
  let right = -Infinity;
  const take = (r: DOMRect) => {
    if (r.width === 0) return;
    left = Math.min(left, r.left);
    right = Math.max(right, r.right);
  };
  const inFlow = (node: Node) => {
    for (let p = node.parentElement; p && p !== el; p = p.parentElement) {
      if (getComputedStyle(p).position === 'absolute') return false;
    }
    return true;
  };
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent?.trim() || !inFlow(n)) continue;
    range.selectNodeContents(n);
    Array.from(range.getClientRects()).forEach(take);
  }
  el.querySelectorAll('img').forEach((img) => inFlow(img) && take(img.getBoundingClientRect()));
  return right > left ? right - left : null;
}

/**
 * Shapes every `[data-bubble]` in the thread as iOS does: the bubble hugs its
 * longest line (CSS sizes wrapped text to the width it wrapped in, leaving a
 * gap on the right), unless it holds more than text (`data-fill`, sized by its
 * CSS), and a one-line bubble is a pill (`data-pill`; see
 * styles/_corners.scss). Every corner is then clipped to its app's shape (the
 * CSS radius at `--bubble-smoothing`), a pill's ends as a smooth capsule, which
 * no CSS corner can draw. A corner with a tail (`data-tail`) keeps its CSS
 * shape, which the tail is drawn to meet.
 */
function useBubbleShapes(stack: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
    const root = stack.current;
    if (!root) return;
    const shape = (el: HTMLElement) => {
      el.style.width = '';
      const cs = getComputedStyle(el);
      const k = el.getBoundingClientRect().width / el.offsetWidth || 1;
      const text = el.hasAttribute('data-fill') ? null : textWidth(el);
      if (text !== null) {
        const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
        const border = parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);
        const inner = el.offsetWidth - padX - border;
        const hugged = Math.ceil(text / k + 1);
        if (hugged < inner) el.style.width = `${cs.boxSizing === 'border-box' ? hugged + padX + border : hugged}px`;
      }
      const r = parseFloat(cs.getPropertyValue('--bubble-r')) || 0;
      if (r <= 0) return;
      el.toggleAttribute('data-pill', el.offsetHeight <= 2 * r * PILL_REACH + 1);
      // The exact border box: offsetWidth rounds, and a rounded width shaves a flat off a pill's end.
      const content = cs.boxSizing !== 'border-box';
      const w = parseFloat(cs.width) + (content ? el.offsetWidth - el.clientWidth + parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) : 0);
      const h = parseFloat(cs.height) + (content ? el.offsetHeight - el.clientHeight + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) : 0);
      const tails = (el.dataset.tail ?? '').split(' ');
      const radii = CORNERS.map(([q, prop]) => (tails.includes(q) ? 0 : parseFloat(cs.getPropertyValue(prop)) || 0));
      const smoothing = parseFloat(cs.getPropertyValue('--bubble-smoothing'));
      el.style.clipPath = smoothShapeClip(w, h, radii as [number, number, number, number], smoothing, true);
      el.dataset.clip = radii.join(' ');
    };
    const ro = new ResizeObserver((entries) => entries.forEach((e) => shape(e.target as HTMLElement)));
    const seen = new WeakSet<Element>();
    const watch = () => {
      root.querySelectorAll<HTMLElement>('[data-bubble]').forEach((b) => {
        if (seen.has(b)) return;
        seen.add(b);
        ro.observe(b);
      });
    };
    // A bubble's place in a run (`data-pos`) changes its corners without changing its size, so it's reshaped then too.
    const mo = new MutationObserver((records) => {
      watch();
      records.forEach((r) => r.type === 'attributes' && r.target instanceof HTMLElement && r.target.hasAttribute('data-bubble') && shape(r.target));
    });
    mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-pos'] });
    watch();
    return () => {
      mo.disconnect();
      ro.disconnect();
    };
  }, [stack]);
}

/** The rows already in the thread when the app opened: they're just there, and only newer ones animate. */
export function useOpenedIds(messages: Message[]) {
  const opened = useRef<Set<number> | null>(null);
  opened.current ??= new Set(messages.map((m) => m.id));
  return opened.current;
}

/**
 * Marks drawn while the app opens (a reaction already on a bubble when you switch to it): `opened(key)` stays true
 * for those, so they're just there, and false for any that arrive later, which animate.
 */
export function useOpenedMarks() {
  const marks = useRef(new Set<string>());
  const opening = useRef(true);
  useEffect(() => {
    opening.current = false;
  }, []);
  return (key: string) => {
    if (opening.current) marks.current.add(key);
    return marks.current.has(key);
  };
}

/** How a row arrives: where it starts, where it lands, and how it gets there. */
export interface RowMotion {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  transition: Transition;
}

const SOFT_IN: RowMotion = {
  initial: { opacity: 0, y: 14, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: ROW_IN,
};

/**
 * The native apps' arrival (Dots, Muse, Grok in the captures): a row mounts in
 * its final place, pale, and fills in over ~150ms while the thread rises.
 */
export const NATIVE_IN: RowMotion = {
  initial: { opacity: 0.25 },
  animate: { opacity: 1 },
  transition: { duration: 0.15, ease: [0, 0, 0.2, 1] },
};
/**
 * The thread passing under the header, as the apps draw it (recordings 2, 8, 9, 10): a progressive blur,
 * heaviest behind the status bar and sharp again ~140pt down, over a wash of the app's background. Stacked
 * backdrop blurs, each masked to a band, build the gradient; the skin's className sets the height and wash.
 */
export function ScrollEdge({ className }: { className?: string }) {
  return (
    <div className={`${styles.scrollEdge} ${className ?? ''}`} aria-hidden>
      <i />
      <i />
      <i />
      <i />
      <i />
      <i />
    </div>
  );
}

/** A row that doesn't move on its own: its contents animate themselves (a bubble leaving the composer), or it simply appears. */
export const STILL: RowMotion = { initial: {}, animate: {}, transition: {} };
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
  faceId,
  onFaceIdDone,
  rowMotion,
  scroll,
  overlay,
}: {
  className?: string;
  /** How the thread follows each kind of growth (measured per app); defaults to the ease-in-out most of them use. */
  scroll?: (cause: ScrollCause) => ScrollCurve;
  /** Above everything in the screen, in the skin's colors: its sheets. */
  overlay?: ReactNode;
  messages: Message[];
  /** How each row arrives; defaults to a soft rise. */
  rowMotion?: (m: Message) => RowMotion;
  /** A message, given the thread around it (group chats show a sender's name and avatar once per run). */
  render: (m: Message, i: number, all: Message[]) => ReactNode;
  header: ReactNode;
  /** What the thread passes under at the top: the app's ScrollEdge. */
  edge?: ReactNode;
  /** Where a short thread starts (pt from the top, under the header); it fills down, then scrolls up from the composer. */
  threadTop?: number;
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
  const screenOverlay = useScreenOverlay();
  const threadRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  // The newest row names the growth once; anything after that is the thread growing in place.
  const last = messages[messages.length - 1];
  const lastKey = last ? `${last.id}:${last.kind === 'them' && last.typing}` : '';
  const cause: ScrollCause = !last ? 'grow' : last.kind === 'work' || (last.kind === 'them' && last.typing) ? 'typing' : last.kind;
  const followed = useRef(lastKey);
  const curveFor = useRef(() => DEFAULT_SCROLL);
  curveFor.current = () => {
    const fresh = followed.current !== lastKey;
    followed.current = lastKey;
    return scroll?.(fresh ? cause : 'grow') ?? DEFAULT_SCROLL;
  };
  useStickToEnd(threadRef, stackRef, curveFor);
  useBubbleShapes(stackRef);
  const screenRef = useRef<HTMLDivElement>(null);
  useWheelThrough(screenRef, threadRef);
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
      ref={screenRef}
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
      <div ref={threadRef} className={styles.thread}>
        <div ref={stackRef} className={styles.stack} data-top={threadTop !== undefined || undefined}>
          {messages.map((m, i) => {
            const node = render(m, i, messages);
            // A skin may draw a message elsewhere (Muse's status sits in its header).
            if (node === null) return null;
            const enter = rowMotion?.(m) ?? SOFT_IN;
            return (
              <motion.div
                key={m.id}
                className={styles.row}
                data-kind={m.kind}
                initial={enter.initial}
                animate={enter.animate}
                transition={enter.transition}
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
      <div className={styles.overlay} data-chat-overlay>
        {overlay}
      </div>
      {screenOverlay && onFaceIdDone && createPortal(<FaceIdAuth active={!!faceId} onDone={onFaceIdDone} />, screenOverlay)}
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
  onMultiline,
}: {
  chat: Pick<ChatView, 'composer' | 'setComposer' | 'send'>;
  placeholder: string;
  className?: string;
  /**
   * The text has outgrown one row. Skins whose composer turns into a card
   * (text on top, buttons below) relayout on this; it holds until the text is
   * shorter than where it first overflowed, so the wider card can't flip it back.
   */
  onMultiline?: (multiline: boolean) => void;
}) {
  const wrap = useRef<HTMLSpanElement>(null);
  const twin = useRef<HTMLTextAreaElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [lines, setLines] = useState(1);
  const overflowAt = useRef<number | null>(null);
  const multilineRef = useRef(false);
  const [multiline, setMultiline] = useState(false);
  const report = useRef(onMultiline);
  report.current = onMultiline;

  // Decided in the same layout pass as the measurement, so a composer that turns into a card does it before paint.
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
      const text = chat.composer;
      const was = multilineRef.current;
      let next = was;
      if (!was && (n > 1 || text.includes('\n'))) {
        overflowAt.current = text.length;
        next = true;
      } else if (was && !text.includes('\n') && text.length < (overflowAt.current ?? 0)) {
        overflowAt.current = null;
        next = false;
      }
      if (next !== was) {
        multilineRef.current = next;
        setMultiline(next);
        report.current?.(next);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    return () => ro.disconnect();
  }, [chat.composer]);

  return (
    <span ref={wrap} className={`${styles.fieldWrap} ${className ?? ''}`} data-multiline={multiline || undefined}>
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
        data-empty={!chat.composer || undefined}
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
  tail,
  children,
}: {
  typing: boolean;
  className?: string;
  /** Where the bubble sits in a run of the sender's messages, for skins that join corners. */
  pos?: string;
  /** The corner a tail hangs off, which the bubble's shape leaves to the tail. */
  tail?: CapsuleQuarter;
  children: ReactNode;
}) {
  // The dots give way at once and the text fills in from pale (~150ms, as Dots and Muse do it) while the bubble grows.
  return (
    <div className={className} data-bubble data-pos={pos} data-tail={tail} data-typing={typing || undefined}>
      <AnimatePresence initial={false} mode="popLayout">
        {typing ? (
          <motion.div key="dots" exit={{ opacity: 0 }} transition={{ duration: 0.08 }}>
            <TypingDots />
          </motion.div>
        ) : (
          <motion.div key="text" initial={{ opacity: 0.25 }} animate={{ opacity: 1 }} transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
