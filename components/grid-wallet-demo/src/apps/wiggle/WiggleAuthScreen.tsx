'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CreatingCaption } from './wallet/CardIssuanceContent';
import { easeOutQuick, motionTransition } from '@/lib/easing';
import type { SkinAuthScreenProps } from '@/apps/types';
import { BrandHeader } from './blocks/BrandHeader';
import { Marquee } from './blocks/Marquee';
import { AuthCtaList } from './blocks/AuthCtaList';
import { WIGGLE_AUTH, WIGGLE_LOGO } from './config';
import styles from './WiggleAuthScreen.module.scss';

// Dismiss: the whole composition blur-fades out; the creating beat (logo +
// caption) fades in centered, then the flow swaps to the home. Mirrors Aurora's
// timing without the sleeve-glide (simpler; v1).
const CONTENT_OUT = motionTransition(easeOutQuick, 0.5);
const CAPTION_DELAY_MS = 500;
const CAPTION_IN = motionTransition(easeOutQuick, 0.35);
const CAPTION_OUT = motionTransition(easeOutQuick, 0.28);
const CAPTION_HIDDEN = { opacity: 0, y: 10, filter: 'blur(8px)' };
const CAPTION_REST = { opacity: 1, y: 0, filter: 'blur(0px)' };

/** Wiggle (creator) auth — brand header top-left, scrolling category/title
 *  marquee as the hero, reused auth CTAs at the bottom (Figma 2375:10338). */
export function WiggleAuthScreen({
  busy,
  methods,
  dismissed = false,
  leaving = false,
  onSignIn,
}: SkinAuthScreenProps) {
  // Hard mount-gate: the caption can't exist until the content has cleared.
  const [captionOn, setCaptionOn] = useState(false);
  useEffect(() => {
    if (!dismissed) {
      setCaptionOn(false);
      return;
    }
    const t = window.setTimeout(() => setCaptionOn(true), CAPTION_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [dismissed]);

  return (
    <div className={styles.root}>
      <motion.div
        className={styles.content}
        initial={false}
        animate={{ opacity: dismissed ? 0 : 1, filter: dismissed ? 'blur(12px)' : 'blur(0px)' }}
        transition={CONTENT_OUT}
        style={{ pointerEvents: dismissed ? 'none' : 'auto' }}
      >
        <BrandHeader
          className={styles.header}
          logoSrc={WIGGLE_LOGO}
          name={WIGGLE_AUTH.headline}
          tagline={WIGGLE_AUTH.subhead}
        />

        <div className={styles.hero}>
          <Marquee rows={WIGGLE_AUTH.marquee} interactive />
        </div>

        <div className={styles.footer}>
          <AuthCtaList methods={methods} dismissed={dismissed} busy={busy} onSignIn={onSignIn} />
        </div>
      </motion.div>

      <AnimatePresence>
        {dismissed && captionOn && !leaving && (
          <motion.div
            key="creating"
            className={styles.creatingSlot}
            initial={CAPTION_HIDDEN}
            animate={CAPTION_REST}
            exit={{ ...CAPTION_HIDDEN, transition: CAPTION_OUT }}
            transition={CAPTION_IN}
          >
            <img
              className={styles.creatingLogo}
              src={WIGGLE_LOGO}
              alt=""
              aria-hidden
              draggable={false}
            />
            <CreatingCaption label="Creating your account..." />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
