'use client';

import clsx from 'clsx';
import { motion } from 'motion/react';
import { TextMorph } from 'torph/react';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { cubicBezierCss, easeOutSwift } from '@/lib/easing';
import styles from './DebitCard.module.scss';

const GLITCH_MARK = '/assets/creator/logo-creator-platform-white.svg';
const VISA_LOGO = '/assets/VisaLogo.svg';

// Card thickness via a layered extrude — N 1px-spaced slices fill the side
// (~3px of visible edge once projected at the iso angle).
const EDGE_SLICES = 6;

interface DebitCardProps {
  /** A created card reveals the masked number; before issuance the slot reads
   *  "Spend anywhere" (the card has no number yet). */
  issued?: boolean;
  /** Sweep a one-time whiter gradient shimmer across the card (while creating). */
  shimmer?: boolean;
  className?: string;
}

/** The card face content (Figma 2528:21062) — rendered on BOTH faces so the
 *  issuance half-flip (180°, lands on the "back") shows the same card. */
function CardFace({ issued, shimmer }: { issued: boolean; shimmer: boolean }) {
  return (
    <>
      <div className={styles.lockup}>
        <img className={styles.mark} src={GLITCH_MARK} alt="" aria-hidden draggable={false} />
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
    </>
  );
}

/** Figma 2528:21062 — Glitch debit card: flat brand-purple, logo lockup top-left,
 *  "Spend anywhere" → masked number bottom-left, DEBIT + Visa bottom-right. Two
 *  identical faces so the issuance flip is a single continuous 180° roll (iso →
 *  head-on) that lands on the duplicated back instead of a full 360. */
export function DebitCard({ issued = false, shimmer = false, className }: DebitCardProps) {
  const cardClip = useSquircleClip<HTMLDivElement>({
    radiusVar: '--corner-radius-debit-card-squircle',
  });

  return (
    <div className={clsx(styles.cardShell, className)}>
      {/* Soft drop shadow — a blurred copy of the card's shape, behind it. */}
      <div className={styles.cardShadow} aria-hidden />
      {/* Thickness — a layered extrude: many thin squircle slices each pushed 1px
          further back in Z, so they FILL the gap between front and back and read as
          a solid edge (with sides) following the rounded corners when tilted. */}
      {Array.from({ length: EDGE_SLICES }).map((_, i) => (
        <div
          key={i}
          aria-hidden
          className={clsx(styles.cardFace, styles.cardEdge)}
          style={{ ...cardClip.style, transform: `translateZ(${-(i + 1)}px)` }}
        />
      ))}
      <div ref={cardClip.ref} style={cardClip.style} className={styles.cardFace}>
        <CardFace issued={issued} shimmer={shimmer} />
      </div>
      <div style={cardClip.style} className={clsx(styles.cardFace, styles.cardBack)} aria-hidden>
        <CardFace issued={issued} shimmer={shimmer} />
      </div>
    </div>
  );
}
