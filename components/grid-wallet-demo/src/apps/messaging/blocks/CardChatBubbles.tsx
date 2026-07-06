'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { easeOutQuick, motionTransition } from '@/lib/easing';
import { IconDoupleCheckmark1Small } from '../icons';
import styles from './CardChatBubbles.module.scss';

/** WhatsApp bubble tail (Bitcoin-2026 Figma 363:85386 — the exact exported
 *  path, 16×16 box). Drawn in currentColor so it always matches the bubble
 *  fill; the sent side mirrors it with a CSS scaleX(-1). */
function Tail() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
      <path
        d="M17.0017 9.88672C12.7555 13.6875 7.14897 16 1.00169 16C0.917684 16 0.833543 15.997 0.749739 15.9961C3.98979 12.82 6.00169 8.39559 6.00169 3.5V0H17.0017V9.88672Z"
        fill="currentColor"
      />
    </svg>
  );
}

interface BubbleMessage {
  side: 'sent' | 'received';
  text: string;
  /** Slot offset within the layer (percent of the card height). */
  top: string;
}

/* Short money chatter — cycles forever, alternating sides. Slots stagger the
   vertical position so consecutive bubbles never pop in the same spot. */
const MESSAGES: BubbleMessage[] = [
  { side: 'sent', text: '$8.50 for coffee ☕', top: '-14%' },
  { side: 'received', text: 'Sent you €45', top: '58%' },
  { side: 'sent', text: '₹600 for the cab', top: '72%' },
  { side: 'received', text: '+¥5,000', top: '-8%' },
  { side: 'sent', text: 'Pizza night — $22', top: '46%' },
  { side: 'received', text: 'R$120 for tickets', top: '30%' },
];

/* One bubble on screen at a time: pop in (spring, from the tail corner),
   hold, pop away; mode="wait" sequences the swap. */
const HOLD_MS = 2200;
const POP_IN = { type: 'spring' as const, stiffness: 460, damping: 28 };
const POP_OUT = motionTransition(easeOutQuick, 0.2);

/** Decorative money-chat bubbles popping in left and right over the card on
 *  the issuance pitch. Pure flourish: aria-hidden, no pointer events; reduced
 *  motion pins the first bubble instead of cycling. */
export function CardChatBubbles({ active }: { active: boolean }) {
  const reduceMotion = useReducedMotion();
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!active || reduceMotion) return;
    const t = window.setInterval(
      () => setIdx((i) => (i + 1) % MESSAGES.length),
      HOLD_MS,
    );
    return () => window.clearInterval(t);
  }, [active, reduceMotion]);

  const msg = MESSAGES[idx];
  const sent = msg.side === 'sent';

  return (
    <div className={styles.layer} aria-hidden>
      <AnimatePresence mode="wait">
        {active && (
          <motion.div
            key={idx}
            className={clsx(styles.slot, sent ? styles.slotSent : styles.slotReceived)}
            style={{ top: msg.top }}
            initial={reduceMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
            animate={
              reduceMotion
                ? { opacity: 1 }
                : { scale: 1, opacity: 1, transition: POP_IN }
            }
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { scale: 0.4, opacity: 0, transition: POP_OUT }
            }
          >
            {/* Figma bubble anatomy: r12, pt8 pb6 pl10, meta pinned bottom
                right inside the reserved right padding, tail bleeding -6px
                past the bottom corner. */}
            <div className={clsx(styles.bubble, sent ? styles.sent : styles.received)}>
              <span className={clsx(styles.tail, sent && styles.tailSent)}>
                <Tail />
              </span>
              <p className={styles.text}>{msg.text}</p>
              <span className={styles.meta}>
                <span className={styles.time}>9:41</span>
                {sent && (
                  <IconDoupleCheckmark1Small className={styles.check} size={16} />
                )}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
