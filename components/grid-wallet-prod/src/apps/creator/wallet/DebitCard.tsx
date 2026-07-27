'use client';

import clsx from 'clsx';
import { motion, useReducedMotion } from 'motion/react';
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
  /** Loop an ambient shimmer (sweep + pause, ~5s cycle) on the settled card. */
  shimmerLoop?: boolean;
  className?: string;
}

/** The card face content (Figma 2528:21062) — rendered on BOTH faces so the
 *  issuance half-flip (180°, lands on the "back") shows the same card. */
function CardFace({
  issued,
  shimmer,
  shimmerLoop,
}: {
  issued: boolean;
  shimmer: boolean;
  shimmerLoop: boolean;
}) {
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
      {(shimmer || shimmerLoop) && (
        <motion.div
          key={shimmerLoop ? 'loop' : 'once'}
          className={styles.shimmer}
          initial={{ x: '-130%' }}
          animate={{ x: '130%' }}
          transition={
            shimmerLoop
              ? // Ambient: sweep (0.9s) then rest, ~5s cycle, forever.
                { duration: 0.9, ease: 'easeInOut', repeat: Infinity, repeatDelay: 4.1 }
              : // Creating: one sweep AFTER the card lands its flip (~1.0s).
                { duration: 0.9, ease: 'easeInOut', delay: 1.05 }
          }
        />
      )}
    </>
  );
}

/** Figma 2528:21062 — Glitch debit card: flat brand-purple, logo lockup top-left,
 *  "Spend anywhere" → masked number bottom-left, DEBIT + Visa bottom-right. Two
 *  identical faces so the issuance flip is a single continuous 180° roll (iso →
 *  head-on) that lands on the duplicated back instead of a full 360. */
export function DebitCard({ issued = false, shimmer = false, shimmerLoop = false, className }: DebitCardProps) {
  const reduce = useReducedMotion();
  const loop = shimmerLoop && !reduce;
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
        <CardFace issued={issued} shimmer={shimmer} shimmerLoop={loop} />
      </div>
      <div style={cardClip.style} className={clsx(styles.cardFace, styles.cardBack)} aria-hidden>
        <CardFace issued={issued} shimmer={shimmer} shimmerLoop={loop} />
      </div>
    </div>
  );
}
