'use client';

import React from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion as m, useReducedMotion } from 'motion/react';
import { TextMorph } from 'torph/react';
import { IconArrowDown } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowDown';
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossMedium';
import { cubicBezierCss, easeOutQuick, easeOutSnappy, easeOutSwift, motionTransition } from '@/lib/easing';
import { pressable } from '@/lib/sounds';
import styles from './StageShareButton.module.scss';

interface StageShareButtonProps {
  visible: boolean;
  open: boolean;
  onClick: () => void;
}

const LABEL_MORPH_MS = 280;
const GLYPH_IN = motionTransition(easeOutSnappy, 0.34);
const GLYPH_OUT = motionTransition(easeOutQuick, 0.16);

export function StageShareButton({ visible, open, onClick }: StageShareButtonProps) {
  const reduceMotion = useReducedMotion() ?? false;
  return (
    <div className={clsx(styles.root, !visible && styles.hidden)} aria-hidden={!visible}>
      <button
        type="button"
        className={styles.button}
        tabIndex={visible ? 0 : -1}
        aria-label={open ? 'Cancel' : 'Export'}
        {...pressable({ onClick })}
      >
        <span className={styles.glyph} aria-hidden>
          <AnimatePresence initial={false}>
            <m.span
              key={open ? 'cross' : 'share'}
              className={styles.glyphLayer}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, rotate: open ? -90 : 90, scale: 0.7 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, rotate: 0, scale: 1, transition: GLYPH_IN }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, rotate: open ? 90 : -90, scale: 0.7, transition: GLYPH_OUT }}
            >
              {open ? <IconCrossMedium size={16} /> : <IconArrowDown size={16} />}
            </m.span>
          </AnimatePresence>
        </span>
        <TextMorph as="span" className={styles.label} duration={LABEL_MORPH_MS} ease={cubicBezierCss(easeOutSwift)}>
          {open ? 'Cancel' : 'Export'}
        </TextMorph>
      </button>
    </div>
  );
}
