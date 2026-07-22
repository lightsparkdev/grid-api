'use client';

import { useEffect, useState, type ReactNode } from 'react';
import clsx from 'clsx';
import { motion, useReducedMotion } from 'motion/react';
import { easeOutSnappy, motionTransition } from '@/lib/easing';
import { IconDoupleCheckmark1Small } from '../icons';
import styles from './CardIssueIntro.module.scss';

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

/* Short money chatter — a 6-message conversation, friend left / you right
   (3 received, 3 sent), read top to bottom like a real chat. */
const MESSAGES: { side: 'sent' | 'received'; text: string }[] = [
  { side: 'received', text: 'Sent you €45' },
  { side: 'sent', text: '$8.50 for coffee ☕' },
  { side: 'received', text: '+¥5,000' },
  { side: 'sent', text: '₹600 for the cab' },
  { side: 'received', text: 'R$120 for tickets' },
  { side: 'sent', text: 'Pizza night — $22' },
];

/* Stack geometry — single-line bubbles are a fixed 36px (17/22 text + 8/6
   pads), so every row position is deterministic: the group stays EXACTLY
   centered as it grows (each arrival shifts the stack up half a step). */
const ROW_H = 36;
const ROW_GAP = 8;
const STEP = ROW_H + ROW_GAP;

/* Pop cadence — pretty fast; the reposition ride matches the pop spring. */
const FIRST_POP_MS = 240;
const POP_MS = 300;
const HOLD_MS = 550;
const POP_IN = { type: 'spring' as const, stiffness: 460, damping: 28 };
const RESEAT = motionTransition(easeOutSnappy, 0.3);

/* The match cut (the WelcomeDoodle grammar): the chat accelerates DOWN to half
   size and, the instant it cuts away, the card appears AT that same half size
   already growing — the scales match across the cut, so it reads as one
   continuous motion changing subject. */
const CUT_SCALE = 0.5;
const CUT_OUT_S = 0.25;
const CUT_IN_S = 0.4;
const EASE_IN: [number, number, number, number] = [0.55, 0.055, 0.675, 0.19];
const CUT_EXIT = motionTransition(EASE_IN, CUT_OUT_S);
const CUT_ENTER = motionTransition(easeOutSnappy, CUT_IN_S);

type Phase = 'chat' | 'cut' | 'card';

/** Vertical center offset of row `i` when `count` rows are visible. */
const rowY = (i: number, count: number) => (i - (count - 1) / 2) * STEP;

/**
 * The issuance-pitch card intro: a money-chat conversation pops in fast —
 * centered, re-centering as each message lands — then the whole chat scales
 * down into a match cut and the card (the children) scales up out of it.
 *
 * The card stays mounted throughout (it's the layout-defining element the
 * slot glides around); only its visibility/scale ride the cut. Non-intro
 * mounts (direct card-home entry, reduced motion) skip straight to the card.
 */
export function CardIssueIntro({
  intro,
  children,
}: {
  intro: boolean;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const playChat = intro && !reduceMotion;
  const [phase, setPhase] = useState<Phase>(playChat ? 'chat' : 'card');
  const [count, setCount] = useState(0);

  // Chat clock: pop the next message; once all six are in, hold, then cut.
  useEffect(() => {
    if (phase !== 'chat') return;
    if (count < MESSAGES.length) {
      const t = window.setTimeout(
        () => setCount(count + 1),
        count === 0 ? FIRST_POP_MS : POP_MS,
      );
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setPhase('cut'), HOLD_MS);
    return () => window.clearTimeout(t);
  }, [phase, count]);

  // Cut beat: the chat shrinks for CUT_OUT_S, then the card takes over.
  useEffect(() => {
    if (phase !== 'cut') return;
    const t = window.setTimeout(() => setPhase('card'), CUT_OUT_S * 1000);
    return () => window.clearTimeout(t);
  }, [phase]);

  // Leaving the intro early (Create tapped mid-chat) forces the card on.
  useEffect(() => {
    if (!intro && phase !== 'card') setPhase('card');
  }, [intro, phase]);

  return (
    <div className={styles.root}>
      {/* The card — hidden at the cut scale until the chat hands off. */}
      <motion.div
        className={styles.cardBeat}
        initial={false}
        animate={
          phase === 'card'
            ? { scale: 1, visibility: 'visible' }
            : { scale: CUT_SCALE, visibility: 'hidden' }
        }
        transition={
          phase === 'card'
            ? { scale: CUT_ENTER, visibility: { duration: 0 } }
            : { duration: 0 }
        }
      >
        {children}
      </motion.div>

      {/* The conversation — absolute over the card box, bubbles hanging just
          past its edges; the whole group scales as one at the cut. */}
      {phase !== 'card' && (
        <motion.div
          className={styles.chatLayer}
          aria-hidden
          initial={false}
          animate={phase === 'cut' ? { scale: CUT_SCALE } : { scale: 1 }}
          transition={phase === 'cut' ? CUT_EXIT : { duration: 0 }}
        >
          {MESSAGES.slice(0, count).map((msg, i) => {
            const sent = msg.side === 'sent';
            return (
              <motion.div
                key={msg.text}
                className={clsx(styles.row, sent ? styles.rowSent : styles.rowReceived)}
                initial={{ y: rowY(i, count), scale: 0, opacity: 0 }}
                animate={{ y: rowY(i, count), scale: 1, opacity: 1 }}
                transition={{
                  y: RESEAT,
                  scale: POP_IN,
                  opacity: { duration: 0.15 },
                }}
              >
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
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
