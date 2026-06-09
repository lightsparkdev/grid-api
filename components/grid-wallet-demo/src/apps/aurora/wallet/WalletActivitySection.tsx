'use client';

import clsx from 'clsx';
import { motion, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ContentAreaButton } from '@/apps/shared/ContentAreaButton';
import { SfSymbol } from '@/apps/shared/icons';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { motionTransition } from '@/lib/easing';
import styles from './WalletActivitySection.module.scss';

const INITIAL_DELAY_S = 0.45;
const REVEAL_DURATION_S = 0.55;
const CONTENT_STAGGER_S = 0.2;
const COVER_FADE_PX = 56;
/** Extra cover height above empty-state title — fade sits in this band. */
const COVER_ABOVE_TITLE_PX = 72;

const hiddenMessage = { opacity: 0, y: 24, filter: 'blur(10px)' };
const visibleMessage = { opacity: 1, y: 0, filter: 'blur(0px)' };

function offsetTopWithin(el: HTMLElement, ancestor: HTMLElement): number {
  let top = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
}

interface WalletActivitySectionProps {
  onAdd?: () => void;
}

/** Figma 84:12452 — Activity title + empty-state card with skeleton rows. */
export function WalletActivitySection({ onAdd }: WalletActivitySectionProps) {
  const reduceMotion = useReducedMotion();
  const [coverVisible, setCoverVisible] = useState(reduceMotion === true);
  const [contentVisible, setContentVisible] = useState(reduceMotion === true);
  const [coverTop, setCoverTop] = useState<number | null>(null);

  const cardInnerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
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
      const topRaw = inherited
        .getPropertyValue('--corner-radius-wallet-card-squircle')
        .trim();
      const screenR = screenRaw ? Number.parseFloat(screenRaw) : Number.NaN;
      const topR = topRaw ? Number.parseFloat(topRaw) : Number.NaN;
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

  useLayoutEffect(() => {
    const root = cardInnerRef.current;
    const title = titleRef.current;
    if (!root || !title) return;

    const measureCover = () => {
      const titleTop = offsetTopWithin(title, root);
      setCoverTop(Math.max(0, titleTop - COVER_ABOVE_TITLE_PX));
    };

    measureCover();
    const observer = new ResizeObserver(measureCover);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

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
          <div className={styles.cardInner} ref={cardInnerRef}>
            <div className={styles.skeletonLayer}>
              <div className={styles.list} aria-hidden>
                <SkeletonRow bordered />
                <SkeletonRow />
              </div>
              {coverTop !== null ? (
                <div
                  className={clsx(
                    styles.skeletonCover,
                    (coverVisible || reduceMotion === true) && styles.skeletonCoverVisible,
                  )}
                  style={{
                    ['--cover-fade-height' as string]: `${COVER_FADE_PX}px`,
                    ['--cover-top' as string]: `${coverTop}px`,
                    ['--cover-duration' as string]: `${REVEAL_DURATION_S}s`,
                  }}
                  aria-hidden
                />
              ) : null}
            </div>

            <div className={styles.messageLayer}>
              <motion.div
                className={styles.message}
                initial={reduceMotion ? false : hiddenMessage}
                animate={contentVisible ? visibleMessage : hiddenMessage}
                transition={revealTransition}
              >
                <div className={styles.emptyText}>
                  <p className={styles.emptyTitle} ref={titleRef}>
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
                  variant="bordered"
                  icon={<SfSymbol name="play.fill" size={17} />}
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
