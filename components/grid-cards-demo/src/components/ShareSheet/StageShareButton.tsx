'use client';

import clsx from 'clsx';
import { AnimatePresence, motion as m, useReducedMotion } from 'motion/react';
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossMedium';
import { IconShareOs } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconShareOs';
import { easeOutQuick, easeOutSnappy, motionTransition } from '@/lib/easing';
import { pressable } from '@/lib/sounds';
import styles from './StageShareButton.module.scss';

interface StageShareButtonProps {
  /** The card is floating alone (the button goes with the phone). */
  visible: boolean;
  /** The share panel is up: the button closes it. */
  open: boolean;
  onClick: () => void;
}

const SWAP_IN = motionTransition(easeOutSnappy, 0.32);
const SWAP_OUT = motionTransition(easeOutQuick, 0.14);

/** Share, on the stage under the floating card: the developer's control,
 *  beside the card as an object, not on the cardholder's phone. With the
 *  panel up it reads Close. */
export function StageShareButton({ visible, open, onClick }: StageShareButtonProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const key = open ? 'close' : 'share';
  return (
    <div className={clsx(styles.root, !visible && styles.hidden)} aria-hidden={!visible}>
      <button
        type="button"
        className={styles.button}
        tabIndex={visible ? 0 : -1}
        aria-label={open ? 'Close' : 'Share'}
        {...pressable({ onClick })}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <m.span
            key={key}
            className={styles.content}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, transition: SWAP_IN }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, transition: SWAP_OUT }}
          >
            {open ? <IconCrossMedium size={16} aria-hidden /> : <IconShareOs size={16} aria-hidden />}
            {open ? 'Close' : 'Share'}
          </m.span>
        </AnimatePresence>
      </button>
    </div>
  );
}
