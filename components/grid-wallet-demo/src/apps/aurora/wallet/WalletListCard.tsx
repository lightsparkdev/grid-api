'use client';

import type { ReactNode } from 'react';
import clsx from 'clsx';
import { motion, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { readCssVarPx } from '@/apps/shared/figmaSquircleRadius';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { motionTransition } from '@/lib/easing';
import styles from './WalletListCard.module.scss';

// Hold the loading skeleton this long before the empty-state reveal (cover fades
// the skeleton out, then the "Nothing here, yet" group animates in).
const INITIAL_DELAY_S = 1.2;
const REVEAL_DURATION_S = 0.55;
const CONTENT_STAGGER_S = 0.2;

const hiddenMessage = { opacity: 0, y: 24, filter: 'blur(10px)' };
const visibleMessage = { opacity: 1, y: 0, filter: 'blur(0px)' };

interface WalletListCardProps {
  emptyTitle: string;
  emptySub: ReactNode;
  /** Optional CTA inside the empty message (e.g. "Add money"). */
  cta?: ReactNode;
  /** Hug the phone bezel with concentric bottom corners (wallet home activity). */
  concentricBottom?: boolean;
}

/**
 * Elevated card with skeleton rows under a gradient cover and a centered empty
 * message that reveals in. Shared by the wallet "Activity" and card-home
 * "Transactions" sections (Figma 84:12456 / 2143:40930).
 */
export function WalletListCard({
  emptyTitle,
  emptySub,
  cta,
  concentricBottom = false,
}: WalletListCardProps) {
  const reduceMotion = useReducedMotion();
  const [coverVisible, setCoverVisible] = useState(reduceMotion === true);
  const [contentVisible, setContentVisible] = useState(reduceMotion === true);

  const revealTransition = motionTransition(undefined, REVEAL_DURATION_S);

  // Bottom corners hug the phone screen (same math as BottomSheet) when concentric.
  const [cornerRadii, setCornerRadii] = useState<
    [number, number, number, number] | undefined
  >();
  const roRef = useRef<ResizeObserver | null>(null);
  const wrapRef = useCallback(
    (el: HTMLElement | null) => {
      roRef.current?.disconnect();
      if (!el || !concentricBottom) return;
      const measure = () => {
        const cs = getComputedStyle(el);
        const screenRaw = cs.getPropertyValue('--screen-corner-radius').trim();
        const screenR = screenRaw ? Number.parseFloat(screenRaw) : Number.NaN;
        const topR = readCssVarPx(el, '--corner-radius-wallet-card-squircle');
        const inset = Number.parseFloat(cs.paddingLeft.trim());
        if (Number.isFinite(screenR) && Number.isFinite(topR) && Number.isFinite(inset)) {
          const bottom = Math.max(0, screenR - inset);
          setCornerRadii([topR, topR, bottom, bottom]);
        } else {
          setCornerRadii(undefined);
        }
      };
      measure();
      roRef.current = new ResizeObserver(measure);
      roRef.current.observe(el);
    },
    [concentricBottom],
  );

  const cardClip = useSquircleClip({ cornerRadii });

  useEffect(() => {
    if (reduceMotion) return;
    const coverTimer = window.setTimeout(
      () => setCoverVisible(true),
      INITIAL_DELAY_S * 1000,
    );
    const contentTimer = window.setTimeout(
      () => setContentVisible(true),
      (INITIAL_DELAY_S + CONTENT_STAGGER_S) * 1000,
    );
    return () => {
      window.clearTimeout(coverTimer);
      window.clearTimeout(contentTimer);
    };
  }, [reduceMotion]);

  return (
    <div
      ref={wrapRef}
      className={clsx(styles.cardWrap, concentricBottom && styles.cardWrapInsetBottom)}
    >
      <div ref={cardClip.ref} style={cardClip.style} className={styles.card}>
        <div className={styles.cardInner}>
          <div className={styles.skeletonLayer}>
            <div className={styles.list} aria-hidden>
              <SkeletonRow bordered />
              <SkeletonRow />
              <div
                className={clsx(
                  styles.gradientMask,
                  (coverVisible || reduceMotion === true) && styles.gradientMaskVisible,
                )}
                style={{ ['--cover-duration' as string]: `${REVEAL_DURATION_S}s` }}
                aria-hidden
              />
            </div>
          </div>

          <div className={styles.messageLayer}>
            <motion.div
              className={styles.message}
              initial={reduceMotion ? false : hiddenMessage}
              animate={contentVisible ? visibleMessage : hiddenMessage}
              transition={revealTransition}
            >
              <div className={styles.emptyText}>
                <p className={styles.emptyTitle}>{emptyTitle}</p>
                <p className={styles.emptySub}>{emptySub}</p>
              </div>
              {cta}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonRow({ bordered }: { bordered?: boolean }) {
  return (
    <div className={styles.row}>
      <div className={styles.rowGraphic} />
      <div className={bordered ? styles.rowContentBordered : styles.rowContent}>
        <div className={styles.rowInner}>
          <div className={styles.rowLabels}>
            <SkeletonPill width="72.215px" />
            <SkeletonPill width="143.25px" />
            <SkeletonPill width="108.723px" />
          </div>
          <div className={styles.rowAmount}>
            <SkeletonPill width="50px" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonPill({ width }: { width: string }) {
  return (
    <div className={styles.skeletonLine}>
      <span className={styles.skeletonPill} style={{ width }} />
    </div>
  );
}
