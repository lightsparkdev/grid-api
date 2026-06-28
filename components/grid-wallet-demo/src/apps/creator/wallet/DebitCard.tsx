'use client';

import clsx from 'clsx';
import { motion } from 'motion/react';
import { TextMorph } from 'torph/react';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { cubicBezierCss, easeOutSwift } from '@/lib/easing';
import styles from './DebitCard.module.scss';

const GLITCH_MARK = '/assets/creator/logo-creator-platform-white.svg';
const VISA_LOGO = '/assets/VisaLogo.svg';

interface DebitCardProps {
  /** A created card reveals the masked number; before issuance the slot reads
   *  "Spend anywhere" (the card has no number yet). */
  issued?: boolean;
  /** Sweep a one-time whiter gradient shimmer across the card (while creating). */
  shimmer?: boolean;
  className?: string;
}

/** Figma 2528:21062 — Glitch debit card face: flat brand-purple, logo lockup
 *  top-left, "Spend anywhere" → masked number bottom-left, DEBIT + Visa bottom-right. */
export function DebitCard({ issued = false, shimmer = false, className }: DebitCardProps) {
  const cardClip = useSquircleClip<HTMLDivElement>({
    radiusVar: '--corner-radius-debit-card-squircle',
  });

  return (
    <div className={clsx(styles.cardShell, className)}>
      <div ref={cardClip.ref} style={cardClip.style} className={styles.card}>
        <div className={styles.lockup}>
          <img
            className={styles.mark}
            src={GLITCH_MARK}
            alt=""
            aria-hidden
            draggable={false}
          />
          <span className={styles.wordmark}>Glitch</span>
        </div>
        <div className={styles.bottom}>
          <TextMorph
            as="span"
            className={styles.number}
            duration={450}
            ease={cubicBezierCss(easeOutSwift)}
          >
            {issued ? '•••• 8972' : 'Spend anywhere'}
          </TextMorph>
          <div className={styles.brand}>
            <span className={styles.debit}>DEBIT</span>
            <img
              className={styles.visa}
              src={VISA_LOGO}
              alt=""
              width={62}
              height={20}
              aria-hidden
              draggable={false}
            />
          </div>
        </div>
        {shimmer && (
          <motion.div
            className={styles.shimmer}
            initial={{ x: '-130%' }}
            animate={{ x: '130%' }}
            transition={{ duration: 1.1, ease: 'easeInOut', delay: 0.15 }}
          />
        )}
      </div>
    </div>
  );
}
