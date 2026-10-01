'use client';

import clsx from 'clsx';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { IconPinch } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPinch';
import { motionTransition } from '@/lib/easing';
import { ApiPanelSkeleton } from './ApiPanelSkeleton';
import styles from './ApiPanelEmpty.module.scss';

const INITIAL_DELAY_S = 0.45;
const REVEAL_DURATION_S = 0.55;
const CONTENT_STAGGER_S = 0.2;
const COVER_FADE_PX = 56;
/** Extra cover height above the pointer icon top — fade sits in this band. */
const COVER_ABOVE_ICON_PX = 72;

function offsetTopWithin(el: HTMLElement, ancestor: HTMLElement): number {
  let top = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
}

const hiddenMessage = { opacity: 0, y: 24, filter: 'blur(10px)' };
const visibleMessage = { opacity: 1, y: 0, filter: 'blur(0px)' };

export function ApiPanelEmpty() {
  const reduceMotion = useReducedMotion();
  const [coverVisible, setCoverVisible] = useState(reduceMotion === true);
  const [contentVisible, setContentVisible] = useState(reduceMotion === true);
  const [coverTop, setCoverTop] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const revealTransition = motionTransition(undefined, REVEAL_DURATION_S);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const icon = iconRef.current;
    if (!root || !icon) return;

    const measureCover = () => {
      const iconTop = offsetTopWithin(icon, root);
      setCoverTop(Math.max(0, iconTop - COVER_ABOVE_ICON_PX));
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
    <div className={styles.root} ref={rootRef}>
      <div className={styles.skeletonLayer}>
        <ApiPanelSkeleton />
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
          <span className={styles.iconBox} ref={iconRef} aria-hidden>
            <IconPinch size={24} />
          </span>
          <div className={styles.copy}>
            <p className={styles.title}>No API calls yet</p>
            <p className={styles.description}>
              Run a flow in the app and each request will appear here.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
