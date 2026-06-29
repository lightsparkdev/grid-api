'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { authLabel, type AuthMethod } from '@/data/flow';
import type { SkinAuthScreenProps } from '@/apps/types';
import { easeOutQuick, easeOutSnappy, motionTransition } from '@/lib/easing';
import { ZLogo } from './ZLogo';
import { SOCIAL_AUTH } from './config';
import { SOCIAL_AUTH_METHOD_ICONS } from './icons';
import styles from './SocialAuthScreen.module.scss';

/** Circle CTAs, in order: Google, Apple, Email, Passkey. */
const CIRCLE_ORDER: AuthMethod[] = ['oauth', 'apple', 'email_otp', 'passkey'];

// Dismiss: the composition blur-fades out; the centered logo + "Signing you
// in…" beat fades in, then the flow swaps to the Money home. Mirrors the
// creator skin's simpler (no sleeve-glide) timing.
const CONTENT_OUT = motionTransition(easeOutQuick, 0.5);
// Method toggles (add/remove a circle, swap the pill, show/hide the divider) ride
// the same blur-fade + reflow language as Aurora's auth CTAs.
const TOGGLE = motionTransition(easeOutSnappy, 0.32);
const HOVER = motionTransition(easeOutSnappy, 0.18);
// Circles add/remove with popLayout: the exiting circle is lifted out of flow and
// fades/scales out in place while its siblings animate (layout="position") to
// their new centered positions — no end-of-tween reflow snap. The rows below
// collapse their own height/margin so the cluster shrinks and the centered brand
// above rides up smoothly when a whole row leaves.
const CIRCLE_HIDDEN = { opacity: 0, scale: 0.5, filter: 'blur(6px)' };
const CIRCLE_SHOWN = { opacity: 1, scale: 1, filter: 'blur(0px)' };
const ROW_HIDDEN = { height: 0, marginBottom: 0, opacity: 0, filter: 'blur(6px)' };
const ROW_SHOWN = { height: 56, marginBottom: 20, opacity: 1, filter: 'blur(0px)' };
const OR_HIDDEN = { height: 0, marginBottom: 0, opacity: 0, filter: 'blur(6px)' };
const OR_SHOWN = { height: 20, marginBottom: 20, opacity: 1, filter: 'blur(0px)' };
const PILL_ENTER = { opacity: 0, y: 6, filter: 'blur(6px)' };
const PILL_REST = { opacity: 1, y: 0, filter: 'blur(0px)' };
const PILL_EXIT = { opacity: 0, y: -6, filter: 'blur(6px)' };
const CAPTION_DELAY_MS = 500;
const CAPTION_IN = motionTransition(easeOutQuick, 0.35);
const CAPTION_OUT = motionTransition(easeOutQuick, 0.28);
const CAPTION_HIDDEN = { opacity: 0, y: 10, filter: 'blur(8px)' };
const CAPTION_REST = { opacity: 1, y: 0, filter: 'blur(0px)' };

/** Z (social) auth — logo + "See what's going on" centered in the space above,
 *  four social circle CTAs (Google/Apple/Email/Passkey), a primary "Continue
 *  with …" pill, and the legal copy. Each control drives the shared onSignIn; a
 *  method toggled off in Configure drops its circle, and the pill always keeps
 *  one method. */
export function SocialAuthScreen({
  busy,
  methods,
  dismissed = false,
  leaving = false,
  onSignIn,
}: SkinAuthScreenProps) {
  // The pill takes Phone when available; otherwise it pulls the LAST circle in
  // the row (passkey first, then back toward Google), so removing the pill's
  // method promotes the trailing circle into the CTA — never the first one — and
  // the pill is never empty. The circles are whatever's left.
  const pillMethod = methods.includes('sms')
    ? ('sms' as AuthMethod)
    : [...CIRCLE_ORDER].reverse().find((m) => methods.includes(m));
  const circleMethods = CIRCLE_ORDER.filter((m) => methods.includes(m) && m !== pillMethod);
  const PillIcon = pillMethod ? SOCIAL_AUTH_METHOD_ICONS[pillMethod] : null;

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
        animate={{
          opacity: dismissed ? 0 : 1,
          filter: dismissed ? 'blur(12px)' : 'blur(0px)',
        }}
        transition={CONTENT_OUT}
        style={{ pointerEvents: dismissed ? 'none' : 'auto' }}
      >
        <div className={styles.brandArea}>
          <div className={styles.brand}>
            <ZLogo size={56} className={styles.logo} />
            <h1 className={styles.headline}>{SOCIAL_AUTH.headline}</h1>
          </div>
        </div>

        <div className={styles.cluster}>
          <AnimatePresence initial={false}>
            {circleMethods.length > 0 && (
              <motion.div
                key="circles"
                className={styles.circles}
                initial={ROW_HIDDEN}
                animate={ROW_SHOWN}
                exit={ROW_HIDDEN}
                transition={TOGGLE}
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {circleMethods.map((m) => {
                    const Icon = SOCIAL_AUTH_METHOD_ICONS[m];
                    const disabled = busy || dismissed;
                    return (
                      <motion.button
                        key={m}
                        type="button"
                        className={styles.circle}
                        layout="position"
                        initial={CIRCLE_HIDDEN}
                        animate={CIRCLE_SHOWN}
                        exit={CIRCLE_HIDDEN}
                        transition={TOGGLE}
                        whileHover={disabled ? undefined : { scale: 1.06, transition: HOVER }}
                        whileTap={disabled ? undefined : { scale: 0.92, transition: HOVER }}
                        disabled={disabled}
                        onClick={() => onSignIn(m)}
                        aria-label={`Continue with ${authLabel(m)}`}
                      >
                        <Icon size={24} />
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {circleMethods.length > 0 && pillMethod && (
              <motion.div
                key="or"
                className={styles.orRow}
                aria-hidden
                initial={OR_HIDDEN}
                animate={OR_SHOWN}
                exit={OR_HIDDEN}
                transition={TOGGLE}
              >
                <span className={styles.orLine} />
                <span className={styles.orText}>or</span>
                <span className={styles.orLine} />
              </motion.div>
            )}
          </AnimatePresence>

          {pillMethod && PillIcon && (
            <motion.button
              type="button"
              className={styles.phoneBtn}
              disabled={busy || dismissed}
              onClick={() => onSignIn(pillMethod)}
              whileHover={busy || dismissed ? undefined : { scale: 1.015, transition: HOVER }}
              whileTap={busy || dismissed ? undefined : { scale: 0.985, transition: HOVER }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={pillMethod}
                  className={styles.phoneInner}
                  initial={PILL_ENTER}
                  animate={PILL_REST}
                  exit={PILL_EXIT}
                  transition={TOGGLE}
                >
                  <PillIcon size={22} />
                  <span className={styles.phoneLabel}>Continue with {authLabel(pillMethod)}</span>
                </motion.span>
              </AnimatePresence>
            </motion.button>
          )}

          <p className={styles.legal}>
            By continuing, you agree to our{' '}
            <span className={styles.legalLink}>Terms</span>,{' '}
            <span className={styles.legalLink}>Privacy Policy</span> and{' '}
            <span className={styles.legalLink}>Cookie Use</span>.
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {dismissed && captionOn && !leaving && (
          <motion.div
            key="signingin"
            className={styles.creatingSlot}
            initial={CAPTION_HIDDEN}
            animate={CAPTION_REST}
            exit={{ ...CAPTION_HIDDEN, transition: CAPTION_OUT }}
            transition={CAPTION_IN}
          >
            <ZLogo size={64} className={styles.creatingLogo} />
            <span className={styles.creatingLabel}>{SOCIAL_AUTH.signingIn}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
