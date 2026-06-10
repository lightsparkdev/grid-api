'use client';

import clsx from 'clsx';
import { useState } from 'react';
import { motion, useAnimate, useReducedMotion } from 'motion/react';
import { TextMorph } from 'torph/react';
import { AuroraBackground } from '@/apps/shared/AuroraBackground';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { cubicBezierCss, easeOutOvershoot, easeOutSwift, motionTransition } from '@/lib/easing';
import styles from './DebitCard.module.scss';

/** Lift the card on hover; resolve back down on open. Negative = up. */
const HOVER_LIFT = -4;
/** Shared by the hover lift and the click resolve so they match. */
const LIFT_DURATION = 0.28;
/** Morph the primary label down to its tail ("debit card") when the card opens. */
const LABEL_DEFAULT = 'Get your free debit card';
const LABEL_OPEN = 'Debit card';

interface DebitCardProps {
  interactive?: boolean;
  onOpen?: () => void;
  /** Hide the card number (kept in layout via opacity) — issuance screens. */
  showNumber?: boolean;
  /** White inset border so the card reads over the full-screen aurora. */
  bordered?: boolean;
  /** A created card: morph the label to "Debit card" and reveal the number. */
  issued?: boolean;
}

/** Figma 2143:36184 — debit card behind the wallet sheet. */
export function DebitCard({
  interactive = true,
  onOpen,
  showNumber = true,
  bordered = false,
  issued = false,
}: DebitCardProps) {
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [opening, setOpening] = useState(false);
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const cardClip = useSquircleClip<HTMLButtonElement>({
    radiusVar: '--corner-radius-debit-card-squircle',
  });

  const handleClick = async () => {
    if (!interactive || !onOpen || opening) return;
    setOpening(true);
    setHovered(false);
    onOpen();

    if (reduceMotion || !scope.current) {
      setOpening(false);
      return;
    }

    try {
      await animate(
        scope.current,
        { y: 0 },
        motionTransition(easeOutOvershoot, LIFT_DURATION),
      );
    } finally {
      setOpening(false);
    }
  };

  // The "Get your free debit card" offer only shows on the un-issued home card;
  // once a card exists it morphs to "Debit card" and the masked number returns.
  const showOffer = interactive && !issued;
  const showCardNumber = showNumber && issued;

  return (
    <motion.div
      ref={scope}
      className={clsx(styles.cardShell, bordered && styles.cardShellFlat)}
      initial={false}
      animate={
        opening || !interactive ? false : hovered ? { y: HOVER_LIFT } : { y: 0 }
      }
      transition={motionTransition(easeOutOvershoot, LIFT_DURATION)}
    >
      <button
        type="button"
        ref={cardClip.ref}
        style={cardClip.style}
        className={clsx(styles.card, !interactive && styles.cardStatic)}
        aria-label="View debit card"
        disabled={!interactive}
        onClick={handleClick}
        onMouseEnter={() => interactive && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <AuroraBackground
          showRadialGradient={false}
          className={clsx(styles.aurora, bordered && styles.auroraHidden)}
        />
        <div className={styles.top}>
          <TextMorph
            as="span"
            className={styles.primary}
            duration={LIFT_DURATION * 1000}
            ease={cubicBezierCss(easeOutSwift)}
          >
            {showOffer ? LABEL_DEFAULT : LABEL_OPEN}
          </TextMorph>
          <span className={styles.secondary}>Spend locally</span>
        </div>
        <div className={styles.bottom}>
          <span
            className={styles.primary}
            style={showCardNumber ? undefined : { opacity: 0 }}
          >
            •••• 8972
          </span>
          <div className={styles.brand}>
            <span className={styles.secondary}>DEBIT</span>
            <img
              className={styles.visa}
              src="/assets/VisaLogo.svg"
              alt=""
              width={62}
              height={20}
              aria-hidden
              draggable={false}
            />
          </div>
        </div>
        {bordered && cardClip.path && (
          <svg
            className={styles.borderRing}
            viewBox={`0 0 ${cardClip.width} ${cardClip.height}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            <path d={cardClip.path} fill="none" stroke="rgba(255, 255, 255, 1)" strokeWidth={1} />
          </svg>
        )}
      </button>
    </motion.div>
  );
}
