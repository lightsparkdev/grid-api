'use client';

import clsx from 'clsx';
import { useEffect, useRef, type PointerEvent } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { CardBack } from '@/apps/card/CardBack';
import { DebitCard } from '@/apps/card/DebitCard';
import { BrandProvider } from '@/apps/shared/brand/BrandContext';
import { brandVars } from '@/apps/shared/brand/brandPalette';
import type { CardHome } from '@/apps/shared/card';
import { usePhoneBoot } from '@/components/DotGridCanvas/PhoneBootContext';
import type { CardDesign } from '@/data/design';
import { CARD_H, CARD_W } from '@/apps/card/cardMetrics';
import { applyFaceLight, SHADOW_OFFSET, solveFaceLight } from './cardLighting';
import styles from './CardStage.module.scss';

/** Largest the card gets on stage, relative to its size in the phone. */
const MAX_SCALE = 1.4;
const MIN_SCALE = 0.55;
/** Stage margin around the card. */
const GUTTER_X = 28;
const GUTTER_Y = 120;
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
}

/**
 * The card, always. Two states: floating alone on the stage (cursor tilt, idle
 * bob), or parked in the phone. Every flow brings the phone in and the card
 * flies into its slot; flows act on it there (frost, flip, shake, chips) while
 * the phone shows the cardholder's side; the phone leaves and the card floats
 * back out.
 *
 * Position is imperative, per frame: the rest point is the stage center; while
 * the phone is up the card interpolates toward the live rect of the phone's
 * `[data-card-slot]` on the phone's boot curve. It is the only card: the slot is
 * an empty box, so nothing ever swaps or unmounts.
 */
export function CardStage({ design, home }: CardStageProps) {
  const { bootProgress } = usePhoneBoot();
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const { issued, issuing, card, isDeclined } = home;
  const revealed = card.sheet === 'details';
  const phoneUp = bootProgress > 0;

  // ── Cursor tilt + flip ─────────────────────────────────────────────────────
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const tiltX = useSpring(rotateX, TILT_SPRING);
  const tiltY = useSpring(rotateY, TILT_SPRING);
  const flip = useSpring(revealed ? 180 : 0, FLIP_SPRING);
  useEffect(() => {
    flip.set(revealed ? 180 : 0);
  }, [revealed, flip]);
  const rotateYTotal = useTransform([tiltY, flip], ([a, b]) => (a as number) + (b as number));

  // ── Position + lighting loop ───────────────────────────────────────────────
  // Live inputs for the rAF loop without re-subscribing it.
  const live = useRef({ t: 0 });
  live.current.t = easeInOutCubic(bootProgress);
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
      // Light both faces for the pose the tilt element is showing this frame.
      const pose = { rotateX: tiltX.get(), rotateY: rotateYTotal.get() };
      if (frontRef.current) applyFaceLight(frontRef.current, solveFaceLight(pose, 'front'));
      if (backRef.current) applyFaceLight(backRef.current, solveFaceLight(pose, 'back'));
      const r = root.getBoundingClientRect();
      const z = r;
      // Rest position: centered on the stage, scaled to fit it.
      const rest = {
        x: z.left + z.width / 2 - r.left,
        y: z.top + z.height / 2 - r.top,
        s: Math.max(
          MIN_SCALE,
          Math.min(MAX_SCALE, (z.width - GUTTER_X * 2) / CARD_W, (z.height - GUTTER_Y) / CARD_H),
        ),
      };
      // Glide toward rest (exponential approach), snapping on the first frame.
      const k = pos.current ? 1 - Math.exp(-dt / GLIDE_TAU) : 1;
      const p = pos.current ?? { ...rest };
      p.x += (rest.x - p.x) * k;
      p.y += (rest.y - p.y) * k;
      p.s += (rest.s - p.s) * k;
      pos.current = p;
      // Phone up: interpolate toward the phone's live card slot and park there.
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
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // The motion values are stable for the component's life.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || live.current.t > 0) return;
    const b = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - b.left) / b.width - 0.5;
    const py = (e.clientY - b.top) / b.height - 0.5;
    rotateY.set(px * TILT_DEG * 2);
    rotateX.set(-py * TILT_DEG * 2);
  };
  const onPointerLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div
      ref={rootRef}
      className={styles.root}
      style={{
        ...brandVars(design.color, design.colorEnd),
        ['--shadow-x' as string]: `${SHADOW_OFFSET.x.toFixed(1)}px`,
        ['--shadow-y' as string]: `${SHADOW_OFFSET.y.toFixed(1)}px`,
      }}
    >
      <BrandProvider value={design}>
        {/* The card: positioned per frame (outer), floats (mid), tilts + flips (inner). */}
        <div
          ref={cardRef}
          className={styles.card}
          style={{ width: CARD_W, height: CARD_H, pointerEvents: phoneUp ? 'none' : 'auto' }}
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
              <div ref={frontRef} className={styles.front}>
                <DebitCard
                  issued={issued}
                  issuing={issuing}
                  frozen={card.frozen}
                  closed={card.closed}
                  inWallet={card.inWallet}
                />
              </div>
              <div ref={backRef} className={styles.backFace}>
                <CardBack revealed={revealed && card.revealed} />
              </div>
            </motion.div>
          </div>
        </div>
      </BrandProvider>
    </div>
  );
}
