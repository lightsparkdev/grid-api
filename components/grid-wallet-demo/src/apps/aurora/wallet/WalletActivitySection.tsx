'use client';

import clsx from 'clsx';
import { motion, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ContentAreaButton } from '@/apps/shared/ContentAreaButton';
import { readCssVarPx } from '@/apps/shared/figmaSquircleRadius';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { motionTransition } from '@/lib/easing';
import styles from './WalletActivitySection.module.scss';

const INITIAL_DELAY_S = 0.45;
const REVEAL_DURATION_S = 0.55;
const CONTENT_STAGGER_S = 0.2;

const hiddenMessage = { opacity: 0, y: 24, filter: 'blur(10px)' };
const visibleMessage = { opacity: 1, y: 0, filter: 'blur(0px)' };

interface WalletActivitySectionProps {
  onAdd?: () => void;
}

/** Figma 84:12452 — Activity title + empty-state card with skeleton rows. */
export function WalletActivitySection({ onAdd }: WalletActivitySectionProps) {
  const reduceMotion = useReducedMotion();
  const [coverVisible, setCoverVisible] = useState(reduceMotion === true);
  const [contentVisible, setContentVisible] = useState(reduceMotion === true);

  const revealTransition = motionTransition(undefined, REVEAL_DURATION_S);

  // Bottom corners hug the phone screen (same math as BottomSheet).
  const [cornerRadii, setCornerRadii] = useState<
    [number, number, number, number] | undefined
  >();
  const roRef = useRef<ResizeObserver | null>(null);
  const sectionRef = useCallback((el: HTMLElement | null) => {
    roRef.current?.disconnect();
    if (!el) return;
    const measure = () => {
      const inherited = getComputedStyle(el);
      const screenRaw = inherited.getPropertyValue('--screen-corner-radius').trim();
      const screenR = screenRaw ? Number.parseFloat(screenRaw) : Number.NaN;
      const topR = readCssVarPx(el, '--corner-radius-wallet-card-squircle');
      const wrap = el.querySelector<HTMLElement>(`.${styles.cardWrap}`);
      const insetRaw = wrap ? getComputedStyle(wrap).paddingLeft.trim() : '';
      const inset = insetRaw ? Number.parseFloat(insetRaw) : Number.NaN;

      if (
        Number.isFinite(screenR) &&
        Number.isFinite(topR) &&
        Number.isFinite(inset)
      ) {
        const bottom = Math.max(0, screenR - inset);
        setCornerRadii([topR, topR, bottom, bottom]);
      } else {
        setCornerRadii(undefined);
      }
    };
    measure();
    roRef.current = new ResizeObserver(measure);
    roRef.current.observe(el);
  }, []);

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
    <section ref={sectionRef} className={styles.section} aria-label="Activity">
      <h2 className={styles.title}>Activity</h2>
      <div className={styles.cardWrap}>
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
                  style={{
                    ['--cover-duration' as string]: `${REVEAL_DURATION_S}s`,
                  }}
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
                  <p className={styles.emptyTitle}>
                    Nothing here, yet
                  </p>
                  <p className={styles.emptySub}>
                    Fund your account to start
                    <br />
                    using your wallet
                  </p>
                </div>
                <ContentAreaButton
                  className={styles.emptyBtn}
                  type="button"
                  variant="filled"
                  onClick={onAdd}
                >
                  Add money
                </ContentAreaButton>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
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
