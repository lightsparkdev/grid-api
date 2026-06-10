'use client';

import clsx from 'clsx';
import { useState } from 'react';
import { motion, useAnimate, useReducedMotion } from 'motion/react';
import { AuroraBackground } from '@/apps/shared/AuroraBackground';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { easeOutOvershoot, easeOutSwift, motionTransition } from '@/lib/easing';
import styles from './DebitCard.module.scss';

const HOVER_ROTATE = -0.8;
/** Shared by the hover tilt and the click level-out so they match. */
const ROTATE_DURATION = 0.28;

interface DebitCardProps {
  interactive?: boolean;
  onOpen?: () => void;
}

/** Figma 2143:36184 — debit card behind the wallet sheet. */
export function DebitCard({ interactive = true, onOpen }: DebitCardProps) {
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
        { rotate: 0 },
        motionTransition(easeOutOvershoot, ROTATE_DURATION),
      );
    } finally {
      setOpening(false);
    }
  };

  return (
    <motion.div
      ref={scope}
      className={styles.cardShell}
      style={{ transformOrigin: 'center left' }}
      initial={false}
      animate={
        opening || !interactive ? false : hovered ? { rotate: HOVER_ROTATE } : { rotate: 0 }
      }
      transition={motionTransition(easeOutSwift, ROTATE_DURATION)}
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
        <AuroraBackground showRadialGradient={false} className={styles.aurora} />
        <div className={styles.top}>
          <span className={styles.primary}>Get your free debit card</span>
          <span className={styles.secondary}>Spend locally</span>
        </div>
        <div className={styles.bottom}>
          <span className={styles.primary}>•••• 8972</span>
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
      </button>
    </motion.div>
  );
}
