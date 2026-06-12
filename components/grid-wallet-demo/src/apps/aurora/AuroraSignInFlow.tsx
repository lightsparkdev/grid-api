'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { AuthMethod } from '@/data/flow';
import type { ActionId } from '@/data/actions';
import { easeOutQuick, motionTransition } from '@/lib/easing';
import { AuroraAuthScreen } from './AuroraAuthScreen';
import { AuroraWalletScreen } from './wallet';
import styles from './AuroraSignInFlow.module.scss';

// The auth screen plays the sign-in intro (content out → mask dissolve → logo
// to center → "Creating your account..." hold) on `dismissed`. The exit is
// strictly sequenced: the caption animates OUT first (`leaving`), and only
// then does the swap + reveal begin. Keep in step with AuroraAuthScreen.
const INTRO_HOLD_MS = 2300; // dismiss → caption starts leaving
const INTRO_LEAVE_MS = 300; // caption exit room before the swap/reveal

// The reveal: the wallet mounts UNDER the held aurora screen, which then
// blur-fades out in place — a one-shot exit on a single layer (the app's
// blur/fade exit language; no sustained filter work).
const REVEAL_OUT = motionTransition(easeOutQuick, 0.45);
// Reduced motion (and the wallet's entry beneath): a plain quick crossfade.
const SWAP_FADE = motionTransition(easeOutQuick, 0.25);

interface AuroraSignInFlowProps {
  /** Demo screen from the wallet logic — flips auth → wallet on sign-in. */
  screen: 'auth' | 'wallet';
  busy?: boolean;
  onSignIn: (method: AuthMethod) => void;
  /** Formatted balance for the wallet home. */
  balance?: string;
  onAction: (id: ActionId) => void;
  /** Auth-side overlays (passkey / email sheets) — rendered with the auth screen. */
  children?: ReactNode;
}

/**
 * Auth ⇄ wallet handoff with the post-sign-in intro. When the demo flips
 * `screen` to `wallet` (any auth method that lands directly — passkey today),
 * the auth screen is HELD while it plays its dismiss choreography ending on
 * the "Creating your account..." beat; then the wallet mounts BENEATH it and
 * the whole aurora screen blur-fades away as the home staggers in. Reduced
 * motion skips the hold — just the crossfade.
 */
export function AuroraSignInFlow({
  screen,
  busy,
  onSignIn,
  balance,
  onAction,
  children,
}: AuroraSignInFlowProps) {
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(screen);
  // 'hold' = intro playing (creating beat); 'leaving' = caption exiting.
  const [intro, setIntro] = useState<'none' | 'hold' | 'leaving'>('none');
  const introTimer = useRef(0);

  // Derive on prop change DURING render (the money sheet's reset pattern) so
  // the intro starts on the same frame the demo flips the screen.
  const [prevScreen, setPrevScreen] = useState(screen);
  if (screen !== prevScreen) {
    setPrevScreen(screen);
    if (screen === 'wallet' && !reduceMotion) {
      setIntro('hold'); // hold the auth screen; the timers below sequence out
    } else {
      setShown(screen);
      setIntro('none');
    }
  }

  useEffect(() => {
    if (intro === 'none') return;
    introTimer.current = window.setTimeout(
      () => {
        if (intro === 'hold') {
          setIntro('leaving'); // caption out…
        } else {
          setShown('wallet'); // …then the swap + blur-fade reveal
          setIntro('none');
        }
      },
      intro === 'hold' ? INTRO_HOLD_MS : INTRO_LEAVE_MS,
    );
    return () => window.clearTimeout(introTimer.current);
  }, [intro]);

  return (
    <div className={styles.flow}>
      <AnimatePresence initial={false}>
        {shown === 'auth' ? (
          <motion.div
            key="auth"
            // Above the entering wallet so the exit reads as the aurora screen
            // dissolving off the home, not the home fading in over it.
            className={clsx(styles.screen, styles.screenAuth)}
            exit={
              reduceMotion
                ? { opacity: 0, transition: SWAP_FADE }
                : { opacity: 0, filter: 'blur(10px)', transition: REVEAL_OUT }
            }
          >
            <AuroraAuthScreen
              busy={busy}
              dismissed={intro !== 'none'}
              leaving={intro === 'leaving'}
              onSignIn={onSignIn}
            />
            {children}
          </motion.div>
        ) : (
          <motion.div
            key="wallet"
            className={styles.screen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: SWAP_FADE }}
            exit={{ opacity: 0, transition: SWAP_FADE }}
          >
            <AuroraWalletScreen
              balance={balance}
              entrance={!reduceMotion}
              onAdd={() => onAction('add')}
              onWithdraw={() => onAction('withdraw')}
              onSend={() => onAction('send')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
