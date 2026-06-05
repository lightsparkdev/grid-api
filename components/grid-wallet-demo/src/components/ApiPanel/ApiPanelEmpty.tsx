'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { IconPinch } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPinch';
import { motionTransition } from '@/lib/easing';
import { ApiPanelSkeleton } from './ApiPanelSkeleton';
import styles from './ApiPanelEmpty.module.scss';

const REVEAL_DELAY_S = 0.45;
const REVEAL_DURATION_S = 0.55;

const hiddenMessage = { opacity: 0, y: 24, filter: 'blur(10px)' };
const visibleMessage = { opacity: 1, y: 0, filter: 'blur(0px)' };

export function ApiPanelEmpty() {
  const reduceMotion = useReducedMotion();
  const [revealed, setRevealed] = useState(reduceMotion === true);
  const revealTransition = motionTransition(undefined, REVEAL_DURATION_S);

  useEffect(() => {
    if (reduceMotion) return;

    const timer = window.setTimeout(() => {
      setRevealed(true);
    }, REVEAL_DELAY_S * 1000);

    return () => window.clearTimeout(timer);
  }, [reduceMotion]);

  return (
    <div className={styles.root}>
      <div className={styles.skeletonLayer}>
        <ApiPanelSkeleton />
        <motion.div
          className={styles.skeletonCover}
          aria-hidden
          initial={reduceMotion ? false : { height: '0%' }}
          animate={{ height: revealed ? '72%' : '0%' }}
          transition={revealTransition}
        />
      </div>

      <div className={styles.messageLayer}>
        <motion.div
          className={styles.message}
          initial={reduceMotion ? false : hiddenMessage}
          animate={revealed ? visibleMessage : hiddenMessage}
          transition={revealTransition}
        >
          <span className={styles.iconBox} aria-hidden>
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
