'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import { AUTH_METHODS } from '@/data/configure';
import { authCta, type AuthMethod } from '@/data/flow';
import { AuroraBackground } from '@/apps/shared/AuroraBackground';
import { ContentAreaButton } from '@/apps/shared/ContentAreaButton';
import { AUTH_METHOD_ICONS, AUTH_METHOD_ORDER } from '@/apps/shared/authMethodIcons';
import { CreatingCaption } from './wallet/CardIssuanceContent';
import { easeOutQuick, easeOutSnappy, motionTransition } from '@/lib/easing';
import styles from './AuroraAuthScreen.module.scss';

/** Three lines at 322px — keeps the superpowers hook, drops filler. */
export const AURORA_AUTH_DESCRIPTION =
  'Like a bank account with global superpowers. Fund in 65+ countries. Debit card, rewards, and BTC.';

/* ── Sign-in intro beats (seconds from `dismissed`) — ONE continuous scene:
   the resting screen's aurora is already full-screen under layout-anchored
   fade overlays, so going full-bleed is just those overlays dissolving (no
   second field, no crossfade), and the resting logo itself glides. The flow
   flips `leaving` for the caption's exit, then swaps + blur-fades the screen. */
// 1 — copy + buttons cascade out BOTTOM-UP, and the exit is a REAL layout
//     collapse (items' heights AND the containers' gaps/paddings/margins all
//     animate to zero). Everything downstream rides that one track for free:
//     the hero (flex: 1) grows into the freed space, so the wallet logo is
//     re-centered by flexbox itself — no measured glide — and the hero-anchored
//     fade overlays slide down with the layout, uncovering the aurora exactly
//     as the content gives the space up.
/** Per-item staggered collapse (the version that read right — each item's
 *  fade AND height travel together, bottom-up), just a touch faster. Stack
 *  spacing lives on the ITEMS as margins (tweenable) rather than container
 *  `gap`: Framer can't interpolate `gap`, it SNAPS at the end of the
 *  transition — that was the logo's instant downward jump at resolve. */
const contentOut = (fromBottom: number) =>
  motionTransition(easeOutSnappy, 0.3, { delay: fromBottom * 0.02 });
const contentTarget = (dismissed: boolean, restMarginTop = 0) =>
  dismissed
    ? { opacity: 0, y: 6, filter: 'blur(8px)', height: 0, marginTop: 0 }
    : { opacity: 1, y: 0, filter: 'blur(0px)', height: 'auto', marginTop: restMarginTop };
// Containers melt their own padding/margin across the cascade window so the
// collapse lands at a TRUE zero height (no residual frame holding the hero
// off full-screen).
const frameOut = motionTransition(easeOutSnappy, 0.4);
const COPY_FRAME_OUT = { paddingTop: 0, marginTop: 0 };
const COPY_FRAME_REST = { paddingTop: 32, marginTop: -64 };
const ACTIONS_FRAME_OUT = { paddingTop: 0, paddingBottom: 0 };
const ACTIONS_FRAME_REST = { paddingTop: 32, paddingBottom: 32 };
// 2 — the fade overlays ride the growing hero (layout-anchored), then dissolve
//     LATE (CSS transition — see .heroFade) so the full-bleed reveal trails the
//     collapse instead of exposing the aurora behind still-visible content.
// 4 — "Creating your account..." enters only after the logo has visibly
//     settled at center. The gate is a real timer that MOUNTS the caption
//     (not a transition delay — a delay on an already-mounted element can be
//     skipped by re-renders, leaving the caption visible too early), HOLDS
//     (the card-issuance creating beat), then exits FIRST when `leaving`
//     flips — only after that does the flow start the reveal.
const CAPTION_DELAY_MS = 500;
const CAPTION_IN = motionTransition(easeOutQuick, 0.35);
const CAPTION_OUT = motionTransition(easeOutQuick, 0.28);
// The app's content-in/out language: blur + fade + a small vertical travel.
const CAPTION_HIDDEN = { opacity: 0, y: 10, filter: 'blur(8px)' };
const CAPTION_REST = { opacity: 1, y: 0, filter: 'blur(0px)' };

interface AuroraAuthScreenProps {
  busy?: boolean;
  /** Sign-in succeeded — play the intro dismiss (content out, mask dissolve,
   *  logo to center, creating hold). The parent swaps screens after. */
  dismissed?: boolean;
  /** Hold finished — the creating caption exits (ahead of the screen swap). */
  leaving?: boolean;
  onSignIn: (method: AuthMethod) => void;
}

export function AuroraAuthScreen({
  busy,
  dismissed = false,
  leaving = false,
  onSignIn,
}: AuroraAuthScreenProps) {
  const enabled = new Set(
    AUTH_METHODS.filter((m) => m.enabled).map((m) => m.id),
  );
  const methods = AUTH_METHOD_ORDER.filter((id) => enabled.has(id));

  // Hard mount-gate for the caption: it does not EXIST until the logo has
  // settled, so it can never be seen early regardless of render timing.
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
      {/* ONE full-screen aurora field for rest AND intro — the hero "fade" is
          the layout-anchored overlays below, so full-bleed = same surface. */}
      <div className={styles.aurora} aria-hidden>
        <AuroraBackground
          showRadialGradient={false}
          className={styles.auroraBg}
          fieldId="signin"
        />
      </div>

      <div className={styles.hero}>
        {/* The resting hero look: the fadeBottom profile over the hero box plus
            a solid cover below it — both dissolve on dismiss so the field
            visibly becomes full screen instead of swapping layers. */}
        <div
          className={clsx(styles.heroFade, dismissed && styles.fadeHidden)}
          aria-hidden
        />
        <div
          className={clsx(styles.heroCover, dismissed && styles.fadeHidden)}
          aria-hidden
        />
        {/* No glide animation: the logo is a centered flex child of the hero,
            and the hero (flex: 1) grows as the content collapses — flexbox
            re-centers it on the collapse's own track, every frame. It swells
            slightly (1.1x) as it takes the spotlight. */}
        <motion.img
          className={styles.wallet}
          src="/assets/financial-app/aurora-wallet.webp"
          alt=""
          aria-hidden
          draggable={false}
          initial={false}
          animate={{ scale: dismissed ? 1.1 : 1 }}
          transition={frameOut}
        />
      </div>

      {/* Cascade order counts FROM THE BOTTOM: last button = 0, first button =
          n-1, then description, tagline, title — each collapse drops the
          remaining stack down into the freed space. */}
      <motion.div
        className={styles.copy}
        initial={false}
        animate={dismissed ? COPY_FRAME_OUT : COPY_FRAME_REST}
        transition={frameOut}
      >
        <div className={styles.headings}>
          <motion.h1
            className={styles.title}
            initial={false}
            animate={contentTarget(dismissed)}
            transition={contentOut(methods.length + 2)}
          >
            Aurora
          </motion.h1>
          <motion.p
            className={styles.tagline}
            initial={false}
            animate={contentTarget(dismissed)}
            transition={contentOut(methods.length + 1)}
          >
            Your money, everywhere
          </motion.p>
        </div>
        {/* 16 = the old .copy gap, now an item margin so it tweens. */}
        <motion.p
          className={styles.description}
          initial={false}
          animate={contentTarget(dismissed, 16)}
          transition={contentOut(methods.length)}
        >
          {AURORA_AUTH_DESCRIPTION}
        </motion.p>
      </motion.div>

      <motion.div
        className={styles.actions}
        initial={false}
        animate={dismissed ? ACTIONS_FRAME_OUT : ACTIONS_FRAME_REST}
        transition={frameOut}
      >
        {methods.map((method, i) => {
          const Icon = AUTH_METHOD_ICONS[method];
          return (
            <motion.div
              key={method}
              initial={false}
              // 12 = the old .actions gap, as a tweenable item margin.
              animate={contentTarget(dismissed, i === 0 ? 0 : 12)}
              transition={contentOut(methods.length - 1 - i)}
            >
              <ContentAreaButton
                icon={<Icon size={24} />}
                disabled={busy || dismissed}
                onClick={() => onSignIn(method)}
              >
                {authCta(method)}
              </ContentAreaButton>
            </motion.div>
          );
        })}
      </motion.div>

      {/* "Creating your account..." — in after the glide settles; out FIRST
          (graceful presence exit — blur/fade/lift) when the hold ends, before
          the screen reveal. */}
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
            <CreatingCaption label="Creating your account..." />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
