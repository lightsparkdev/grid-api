'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
   the content (copy + buttons) lives in a SLEEVE whose own top edge IS the
   gradient mask (painted into its padding strip). The intro slides the whole
   sleeve down off the screen — one GPU transform, no per-frame layout — so
   the aurora is uncovered exactly as the content gives up the screen (the
   mask leaves WITH it; nothing to dissolve), and the logo glides to center
   on the SAME curve and clock. The flow flips `leaving` for the caption's
   exit, then swaps + blur-fades the screen. */
const SLEEVE_OUT = motionTransition(easeOutSnappy, 1.2);
// Items inside the sleeve keep the bottom-up content-out language (fade +
// blur + a small travel) while the sleeve carries the actual movement.
const contentOut = (fromBottom: number) =>
  motionTransition(easeOutQuick, 0.18, { delay: fromBottom * 0.025 });
const CONTENT_OUT = { opacity: 0, y: 6, filter: 'blur(8px)' };
const CONTENT_REST = { opacity: 1, y: 0, filter: 'blur(0px)' };
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

  // Logo glide — measured once on dismiss (before any transform), the exact
  // travel from its resting flex slot to the true screen center. Runs on the
  // sleeve's curve and clock so logo and sleeve move as one scene.
  const rootRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLImageElement>(null);
  const [glideDy, setGlideDy] = useState(0);
  useLayoutEffect(() => {
    if (!dismissed) {
      setGlideDy(0);
      return;
    }
    const root = rootRef.current;
    const img = walletRef.current;
    if (!root || !img) return;
    const rb = root.getBoundingClientRect();
    const ib = img.getBoundingClientRect();
    setGlideDy(rb.top + rb.height / 2 - (ib.top + ib.height / 2));
  }, [dismissed]);

  return (
    <div ref={rootRef} className={styles.root}>
      {/* ONE full-screen aurora field for rest AND intro — the hero look is
          the sleeve's own gradient edge, so full-bleed = same surface. */}
      <div className={styles.aurora} aria-hidden>
        <AuroraBackground
          showRadialGradient={false}
          className={styles.auroraBg}
          fieldId="signin"
        />
      </div>

      <div className={styles.hero}>
        <motion.img
          ref={walletRef}
          className={styles.wallet}
          src="/assets/financial-app/aurora-wallet.webp"
          alt=""
          aria-hidden
          draggable={false}
          initial={false}
          animate={{ y: glideDy, scale: dismissed ? 0.75 : 1 }}
          transition={SLEEVE_OUT}
        />
      </div>

      {/* The content sleeve — its padding strip paints the gradient mask, so
          sliding it down uncovers the aurora on the same transform track.
          Items inside fade bottom-up (0 = bottom-most). */}
      <motion.div
        className={styles.sleeve}
        initial={false}
        animate={{ y: dismissed ? '100%' : '0%' }}
        transition={SLEEVE_OUT}
      >
        {/* Blur rides the CONTENT only — blurring the sleeve itself feathers
            its background's left/right edges at the screen bounds. */}
        <motion.div
          initial={false}
          animate={{ filter: dismissed ? 'blur(12px)' : 'blur(0px)' }}
          transition={SLEEVE_OUT}
        >
        <div className={styles.copy}>
          <div className={styles.headings}>
            <motion.h1
              className={styles.title}
              initial={false}
              animate={dismissed ? CONTENT_OUT : CONTENT_REST}
              transition={contentOut(methods.length + 2)}
            >
              Aurora
            </motion.h1>
            <motion.p
              className={styles.tagline}
              initial={false}
              animate={dismissed ? CONTENT_OUT : CONTENT_REST}
              transition={contentOut(methods.length + 1)}
            >
              Your money, everywhere
            </motion.p>
          </div>
          <motion.p
            className={styles.description}
            initial={false}
            animate={dismissed ? CONTENT_OUT : CONTENT_REST}
            transition={contentOut(methods.length)}
          >
            {AURORA_AUTH_DESCRIPTION}
          </motion.p>
        </div>

        <div className={styles.actions}>
          {methods.map((method, i) => {
            const Icon = AUTH_METHOD_ICONS[method];
            return (
              <motion.div
                key={method}
                initial={false}
                animate={dismissed ? CONTENT_OUT : CONTENT_REST}
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
        </div>
        </motion.div>
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
