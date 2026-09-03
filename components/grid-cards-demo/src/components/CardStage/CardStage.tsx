'use client';

import { useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { IconCreditCardAdd } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCreditCardAdd';
import { DebitCard } from '@/apps/card/DebitCard';
import { BrandProvider } from '@/apps/shared/brand/BrandContext';
import { brandVars } from '@/apps/shared/brand/brandPalette';
import { usePhoneBoot } from '@/components/DotGridCanvas/PhoneBootContext';
import type { CardDesign } from '@/data/design';
import type { StageCardState } from '@/hooks/useCardsDemoLogic';
import styles from './CardStage.module.scss';

/** The card's intrinsic size — the phone screen (402) minus its 16px gutters. */
export const CARD_W = 370;
export const CARD_H = 232;
/** How large the card sits on the bare stage, relative to its size in the phone. */
const STAGE_SCALE = 1.4;
/** Keep some stage margin around the card on narrow panels. */
const STAGE_GUTTER = 48;
/** Cursor tilt on the bare stage, degrees. */
const TILT_DEG = 7;

const TILT_SPRING = { stiffness: 220, damping: 22, mass: 0.6 };

function easeInOutCubic(p: number) {
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
}

interface CardStageProps {
  design: CardDesign;
  cardState: StageCardState;
  /** Issue tapped on the stage — fires POST /cards and brings the phone in. */
  onIssue: () => void;
}

/**
 * The bare-card stage. The card sits large in the middle of the dot grid while
 * you design it; Issue brings the phone in and the card flies into its slot.
 *
 * One curve does the whole flight: the phone boot value `t` (0 = bare stage,
 * 1 = phone up) from DotGridCanvas. The card is positioned imperatively each
 * frame by interpolating its stage rect toward the live rect of the phone's
 * `[data-card-slot]` (measured per frame, since the phone itself moves as it
 * boots). At t = 1 it hides; the identical card inside the phone is underneath.
 */
export function CardStage({ design, cardState, onIssue }: CardStageProps) {
  const { bootProgress } = usePhoneBoot();
  // The card travels on an ease-in-out so it visibly leaves the stage, crosses,
  // and settles, while the phone fades up underneath on its own ease-out.
  const t = easeInOutCubic(bootProgress);
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  // Re-run the flight math when the stage resizes.
  const [resizeTick, setResizeTick] = useState(0);
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver(() => setResizeTick((n) => n + 1));
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const anchor = anchorRef.current;
    const card = cardRef.current;
    if (!root || !anchor || !card) return;
    const r = root.getBoundingClientRect();
    const a = anchor.getBoundingClientRect();
    let cx = a.left + a.width / 2 - r.left;
    let cy = a.top + a.height / 2 - r.top;
    let s = a.width / CARD_W;
    if (t > 0) {
      const slot = root.ownerDocument.querySelector<HTMLElement>('[data-card-slot]');
      if (slot) {
        const b = slot.getBoundingClientRect();
        const sx = b.left + b.width / 2 - r.left;
        const sy = b.top + b.height / 2 - r.top;
        const ss = b.width / CARD_W;
        cx += (sx - cx) * t;
        cy += (sy - cy) * t;
        s += (ss - s) * t;
      }
    }
    card.style.transform = `translate(${cx - CARD_W / 2}px, ${cy - CARD_H / 2}px) scale(${s})`;
    card.style.visibility = t >= 1 ? 'hidden' : 'visible';
  }, [t, resizeTick]);

  // Cursor tilt on the bare stage.
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const tiltX = useSpring(rotateX, TILT_SPRING);
  const tiltY = useSpring(rotateY, TILT_SPRING);
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || t > 0) return;
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

  const onStage = t <= 0;
  const flying = t > 0 && t < 1;
  // Caption and CTA fall away as soon as the flight starts.
  const copyOpacity = Math.max(0, 1 - t * 2.5);

  const anchorStyle: CSSProperties = {
    width: `min(${CARD_W * STAGE_SCALE}px, calc(100% - ${STAGE_GUTTER * 2}px))`,
    aspectRatio: `${CARD_W} / ${CARD_H}`,
  };

  return (
    <div ref={rootRef} className={styles.root} style={brandVars(design.color, design.colorEnd)}>
      <BrandProvider value={design}>
        <div className={styles.layout} style={{ opacity: copyOpacity, pointerEvents: onStage ? 'auto' : 'none' }}>
          <div ref={anchorRef} className={styles.anchor} style={anchorStyle} />
          <div className={styles.copy}>
            <p className={styles.title}>Design your card</p>
            <p className={styles.sub}>
              Pick a color, finish, and logo on the left. When it looks right, issue it and it goes
              straight into the app.
            </p>
            <button type="button" className={styles.issue} onClick={onIssue} disabled={!onStage}>
              <IconCreditCardAdd size={16} />
              Issue card
            </button>
          </div>
        </div>

        {/* The flying card: imperatively positioned (see the layout effect). */}
        <div
          ref={cardRef}
          className={styles.card}
          style={{ width: CARD_W, height: CARD_H, pointerEvents: onStage ? 'auto' : 'none' }}
          data-flying={flying || undefined}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
        >
          <motion.div className={styles.tilt} style={{ rotateX: tiltX, rotateY: tiltY }}>
            <DebitCard issued={cardState === 'active'} issuing={cardState === 'processing'} />
          </motion.div>
        </div>
      </BrandProvider>
    </div>
  );
}
