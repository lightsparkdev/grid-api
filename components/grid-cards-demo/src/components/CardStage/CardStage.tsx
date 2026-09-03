'use client';

import clsx from 'clsx';
import { useEffect, useRef, type PointerEvent } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { IconCreditCardAdd } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCreditCardAdd';
import { CardBack } from '@/apps/card/CardBack';
import { DebitCard } from '@/apps/card/DebitCard';
import { BrandProvider } from '@/apps/shared/brand/BrandContext';
import { brandVars } from '@/apps/shared/brand/brandPalette';
import { formatUsdCents, type CardHome } from '@/apps/shared/card';
import { usePhoneBoot } from '@/components/DotGridCanvas/PhoneBootContext';
import { FUNDING_SOURCE_CENTS } from '@/data/actions';
import type { CardDesign } from '@/data/design';
import styles from './CardStage.module.scss';

/** The card's intrinsic size — the phone screen (402) minus its 16px gutters. */
export const CARD_W = 370;
export const CARD_H = 232;
/** Largest the card gets on stage, relative to its size in the phone. */
const MAX_SCALE = 1.4;
const MIN_SCALE = 0.55;
/** Stage margin around the card, and room below it for the caption. */
const GUTTER_X = 28;
const GUTTER_Y = 180;
/** Cursor tilt, degrees. */
const TILT_DEG = 9;
/** Glide time constant toward the rest position (seconds). */
const GLIDE_TAU = 0.14;

const TILT_SPRING = { stiffness: 200, damping: 24, mass: 0.7 };
const FLIP_SPRING = { stiffness: 120, damping: 18, mass: 1 };

function easeInOutCubic(p: number) {
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
}

interface CardStageProps {
  design: CardDesign;
  home: CardHome;
  /** The phone is up for Issue: the card flies into its slot instead of resting beside it. */
  dive: boolean;
  /** Issue tapped on the stage. */
  onIssue: () => void;
}

/**
 * The card, always. It floats in its zone of the stage and reacts to the
 * cursor; flows act on it (frost, flip, shake, chips) while the phone slides in
 * beside it to show the cardholder's side.
 *
 * Position is imperative, per frame: the card glides toward the center of
 * `[data-card-zone]` (which snaps when the phone comes and goes), and during
 * Issue it interpolates from there into the phone's `[data-card-slot]` on the
 * phone's boot curve and parks there. It is the only card: the phone's slot is
 * an empty box, so nothing ever swaps or unmounts.
 */
export function CardStage({ design, home, dive, onIssue }: CardStageProps) {
  const { bootProgress } = usePhoneBoot();
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const { issued, issuing, card, isDeclined } = home;
  const revealed = card.sheet === 'details';
  const phoneUp = bootProgress > 0;

  // ── Position loop ──────────────────────────────────────────────────────────
  // Live inputs for the rAF loop without re-subscribing it.
  const live = useRef({ dive, t: 0 });
  live.current.dive = dive;
  live.current.t = dive ? easeInOutCubic(bootProgress) : 0;
  const pos = useRef<{ x: number; y: number; s: number } | null>(null);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const root = rootRef.current;
      const cardEl = cardRef.current;
      if (!root || !cardEl) return;
      const zone = root.ownerDocument.querySelector<HTMLElement>('[data-card-zone]');
      const r = root.getBoundingClientRect();
      const z = (zone ?? root).getBoundingClientRect();
      // Rest position: centered in the card zone, scaled to fit it.
      const rest = {
        x: z.left + z.width / 2 - r.left,
        y: z.top + z.height / 2 - r.top - 24,
        s: Math.max(
          MIN_SCALE,
          Math.min(MAX_SCALE, (z.width - GUTTER_X * 2) / CARD_W, (z.height - GUTTER_Y) / CARD_H),
        ),
      };
      if (z.width < 8) rest.s = MIN_SCALE; // zone collapsed (dive): keep a sane scale
      // Glide toward rest (exponential approach), snapping on the first frame.
      const k = pos.current ? 1 - Math.exp(-dt / GLIDE_TAU) : 1;
      const p = pos.current ?? { ...rest };
      p.x += (rest.x - p.x) * k;
      p.y += (rest.y - p.y) * k;
      p.s += (rest.s - p.s) * k;
      pos.current = p;
      // Dive: interpolate toward the phone's live card slot.
      let { x, y, s } = p;
      const { t } = live.current;
      if (t > 0) {
        const slot = root.ownerDocument.querySelector<HTMLElement>('[data-card-slot]');
        if (slot) {
          const b = slot.getBoundingClientRect();
          x += (b.left + b.width / 2 - r.left - x) * t;
          y += (b.top + b.height / 2 - r.top - y) * t;
          s += (b.width / CARD_W - s) * t;
        }
      }
      cardEl.style.transform = `translate(${x - CARD_W / 2}px, ${y - CARD_H / 2}px) scale(${s})`;
      // The caption follows the card.
      root.style.setProperty('--card-x', `${x}px`);
      root.style.setProperty('--card-bottom', `${y + (CARD_H / 2) * s}px`);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ── Cursor tilt + specular ─────────────────────────────────────────────────
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const tiltX = useSpring(rotateX, TILT_SPRING);
  const tiltY = useSpring(rotateY, TILT_SPRING);
  const flip = useSpring(revealed ? 180 : 0, FLIP_SPRING);
  useEffect(() => {
    flip.set(revealed ? 180 : 0);
  }, [revealed, flip]);
  const rotateYTotal = useTransform([tiltY, flip], ([a, b]) => (a as number) + (b as number));
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(30);
  const specular = useTransform(
    [glowX, glowY],
    ([gx, gy]) =>
      `radial-gradient(60% 80% at ${gx}% ${gy}%, rgba(255,255,255,0.28), rgba(255,255,255,0.06) 40%, transparent 70%)`,
  );

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || live.current.t > 0) return;
    const b = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - b.left) / b.width - 0.5;
    const py = (e.clientY - b.top) / b.height - 0.5;
    rotateY.set(px * TILT_DEG * 2);
    rotateX.set(-py * TILT_DEG * 2);
    glowX.set(50 + px * 60);
    glowY.set(30 + py * 60);
  };
  const onPointerLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    glowX.set(50);
    glowY.set(30);
  };

  // ── Caption ────────────────────────────────────────────────────────────────
  const state = card.closed ? 'Closed' : card.frozen ? 'Frozen' : issuing ? 'Processing' : 'Active';
  const limits = card.limits;
  const limitsText =
    limits.perTransactionCents !== null || limits.perDayCents !== null
      ? [
          limits.perTransactionCents !== null ? `${formatUsdCents(limits.perTransactionCents)} per purchase` : null,
          limits.perDayCents !== null ? `${formatUsdCents(limits.perDayCents)} per day` : null,
        ]
          .filter(Boolean)
          .join(' · ')
      : null;

  return (
    <div ref={rootRef} className={styles.root} style={brandVars(design.color, design.colorEnd)}>
      <BrandProvider value={design}>
        {/* The card: positioned per frame (outer), floats (mid), tilts + flips (inner). */}
        <div
          ref={cardRef}
          className={styles.card}
          style={{ width: CARD_W, height: CARD_H, pointerEvents: phoneUp && dive ? 'none' : 'auto' }}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
        >
          <div className={clsx(styles.float, (reduceMotion || phoneUp) && styles.floatStill)}>
            <motion.div
              className={styles.tilt}
              style={{ rotateX: tiltX, rotateY: rotateYTotal }}
              animate={isDeclined ? { x: [0, -12, 10, -7, 4, 0] } : { x: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div className={styles.front}>
                <DebitCard
                  issued={issued}
                  issuing={issuing}
                  frozen={card.frozen}
                  closed={card.closed}
                  inWallet={card.inWallet}
                />
                <motion.span className={styles.specular} style={{ background: specular }} aria-hidden />
              </div>
              <div className={styles.backFace}>
                <CardBack revealed={revealed && card.revealed} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Caption under the card: the offer before a card exists, the card's
            state once it does. Follows the card's position. */}
        <div className={styles.caption} style={{ opacity: dive && phoneUp ? 0 : 1 }}>
          {!issued && !issuing ? (
            <>
              <p className={styles.title}>Design your card</p>
              <p className={styles.sub}>
                Pick a color, finish, and logo, then issue it. Every flow you run acts on this card.
              </p>
              <button type="button" className={styles.issue} onClick={onIssue} disabled={phoneUp}>
                <IconCreditCardAdd size={16} />
                Issue card
              </button>
            </>
          ) : (
            <p className={styles.status}>
              <span className={clsx(styles.dot, styles[`dot${state}`])} aria-hidden />
              <span className={styles.statusState}>{state}</span>
              <span className={styles.statusSep} aria-hidden>
                ·
              </span>
              <span>Spend from Checking •••• 2502</span>
              <span className={styles.statusSep} aria-hidden>
                ·
              </span>
              <span className={styles.statusNum}>{formatUsdCents(home.availableCents ?? FUNDING_SOURCE_CENTS)}</span>
              {limitsText && (
                <>
                  <span className={styles.statusSep} aria-hidden>
                    ·
                  </span>
                  <span>{limitsText}</span>
                </>
              )}
            </p>
          )}
        </div>
      </BrandProvider>
    </div>
  );
}
