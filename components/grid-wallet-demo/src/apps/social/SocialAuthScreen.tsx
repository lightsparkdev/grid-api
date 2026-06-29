'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { authLabel, type AuthMethod } from '@/data/flow';
import type { SkinAuthScreenProps } from '@/apps/types';
import { easeOutQuick, motionTransition } from '@/lib/easing';
import { ZLogo } from './ZLogo';
import { SOCIAL_AUTH } from './config';
import {
  SOCIAL_AUTH_METHOD_ICONS,
  IconCall,
  IconAt,
  IconChevronRightSmall,
} from './icons';
import styles from './SocialAuthScreen.module.scss';

/** The three circle CTAs, in screenshot order (Google, Apple, Email). */
const SOCIAL_ORDER: AuthMethod[] = ['oauth', 'apple', 'email_otp'];

// Dismiss: the composition blur-fades out; the centered logo + "Signing you
// in…" beat fades in, then the flow swaps to the Money home. Mirrors the
// creator skin's simpler (no sleeve-glide) timing.
const CONTENT_OUT = motionTransition(easeOutQuick, 0.5);
const CAPTION_DELAY_MS = 500;
const CAPTION_IN = motionTransition(easeOutQuick, 0.35);
const CAPTION_OUT = motionTransition(easeOutQuick, 0.28);
const CAPTION_HIDDEN = { opacity: 0, y: 10, filter: 'blur(8px)' };
const CAPTION_REST = { opacity: 1, y: 0, filter: 'blur(0px)' };

/** Z (social) auth — centered logo + "See what's going on", three social circle
 *  CTAs, the "Continue with Phone" pill, legal copy, and a full-bleed "Login with
 *  username" footer. Fixed X layout; each control still drives the shared
 *  onSignIn, and a method toggled off in Configure hides its slot. */
export function SocialAuthScreen({
  busy,
  methods,
  dismissed = false,
  leaving = false,
  onSignIn,
}: SkinAuthScreenProps) {
  const socialMethods = SOCIAL_ORDER.filter((m) => methods.includes(m));
  const hasPhone = methods.includes('sms');
  const hasUsername = methods.includes('passkey');

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
        <div className={styles.spacerTop} />

        <div className={styles.brand}>
          <ZLogo size={44} className={styles.logo} />
          <h1 className={styles.headline}>{SOCIAL_AUTH.headline}</h1>
        </div>

        <div className={styles.spacerBottom} />

        <div className={styles.cluster}>
          {socialMethods.length > 0 && (
            <div className={styles.circles}>
              {socialMethods.map((m) => {
                const Icon = SOCIAL_AUTH_METHOD_ICONS[m];
                return (
                  <button
                    key={m}
                    type="button"
                    className={styles.circle}
                    disabled={busy || dismissed}
                    onClick={() => onSignIn(m)}
                    aria-label={`Continue with ${authLabel(m)}`}
                  >
                    <Icon size={24} />
                  </button>
                );
              })}
            </div>
          )}

          {socialMethods.length > 0 && hasPhone && (
            <div className={styles.orRow} aria-hidden>
              <span className={styles.orLine} />
              <span className={styles.orText}>or</span>
              <span className={styles.orLine} />
            </div>
          )}

          {hasPhone && (
            <button
              type="button"
              className={styles.phoneBtn}
              disabled={busy || dismissed}
              onClick={() => onSignIn('sms')}
            >
              <IconCall size={22} />
              <span className={styles.phoneLabel}>Continue with Phone</span>
            </button>
          )}

          <p className={styles.legal}>
            By continuing, you agree to our{' '}
            <span className={styles.legalLink}>Terms</span>,{' '}
            <span className={styles.legalLink}>Privacy Policy</span> and{' '}
            <span className={styles.legalLink}>Cookie Use</span>.
          </p>
        </div>

        {hasUsername && (
          <button
            type="button"
            className={styles.usernameBar}
            disabled={busy || dismissed}
            onClick={() => onSignIn('passkey')}
          >
            <IconAt size={18} className={styles.usernameAt} />
            <span className={styles.usernameLabel}>{SOCIAL_AUTH.usernameCta}</span>
            <IconChevronRightSmall size={18} className={styles.usernameChevron} />
          </button>
        )}
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
            <ZLogo size={52} className={styles.creatingLogo} />
            <span className={styles.creatingLabel}>{SOCIAL_AUTH.signingIn}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
