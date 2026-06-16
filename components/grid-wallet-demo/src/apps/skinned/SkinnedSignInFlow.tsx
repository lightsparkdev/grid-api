'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { AuthMethod } from '@/data/flow';
import { easeOutQuick, easeOutSnappy, motionTransition } from '@/lib/easing';
import { AuroraWalletScreen, type WalletEntry, type WalletTransferMode } from '@/apps/aurora/wallet';
import type { ExternalAccountInput, ReceivePaymentInfo, TransferDest } from '@/data/apiCalls';
import type { SkinEntry } from './types';
import styles from './SkinnedSignInFlow.module.scss';

// Same auth ⇄ home handoff as AuroraSignInFlow: hold the auth screen through its
// dismiss choreography (creating beat), then mount the home beneath and blur-fade
// the auth screen away. v1 home = the reskinned AuroraWalletScreen placeholder.
const INTRO_HOLD_MS = 2300;
const INTRO_LEAVE_MS = 300;
const REVEAL_OUT = motionTransition(easeOutQuick, 0.45);
const REVEAL_IN = motionTransition(easeOutSnappy, 0.4);
const SWAP_FADE = motionTransition(easeOutQuick, 0.25);

interface SkinnedSignInFlowProps {
  /** The skin to render — its AuthScreen + config. */
  skin: SkinEntry;
  screen: 'auth' | 'wallet';
  busy?: boolean;
  methods: AuthMethod[];
  onSignIn: (method: AuthMethod) => void;
  skipIntro?: boolean;
  entry?: WalletEntry;
  onQuoteCreate?: (mode: WalletTransferMode, cents: number, dest?: TransferDest) => void;
  onLinkExternalAccount?: (input: ExternalAccountInput, label: string) => void;
  onTransferExecute?: (mode: WalletTransferMode, cents: number) => void;
  onCardIssued?: () => void;
  onTapToPay?: (cents: number, merchant: string) => void;
  onReceivePayment?: (info: ReceivePaymentInfo) => void;
  /** Auth-side overlays (passkey / OTP sheets) — rendered with the auth screen. */
  children?: ReactNode;
}

export function SkinnedSignInFlow({
  skin,
  screen,
  busy,
  methods,
  onSignIn,
  skipIntro,
  entry,
  onQuoteCreate,
  onLinkExternalAccount,
  onTransferExecute,
  onCardIssued,
  onTapToPay,
  onReceivePayment,
  children,
}: SkinnedSignInFlowProps) {
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(screen);
  const [intro, setIntro] = useState<'none' | 'hold' | 'leaving'>('none');
  const introTimer = useRef(0);

  const [prevScreen, setPrevScreen] = useState(screen);
  if (screen !== prevScreen) {
    setPrevScreen(screen);
    if (screen === 'wallet' && !reduceMotion && !skipIntro) {
      setIntro('hold');
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
          setIntro('leaving');
        } else {
          setShown('wallet');
          setIntro('none');
        }
      },
      intro === 'hold' ? INTRO_HOLD_MS : INTRO_LEAVE_MS,
    );
    return () => window.clearTimeout(introTimer.current);
  }, [intro]);

  const AuthScreen = skin.AuthScreen;

  return (
    <div className={styles.flow}>
      <AnimatePresence initial={false}>
        {shown === 'auth' ? (
          <motion.div
            key="auth"
            className={clsx(styles.screen, styles.screenAuth)}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, filter: 'blur(10px)' }}
            animate={
              reduceMotion
                ? { opacity: 1, transition: SWAP_FADE }
                : { opacity: 1, filter: 'blur(0px)', transition: REVEAL_IN }
            }
            exit={
              reduceMotion
                ? { opacity: 0, transition: SWAP_FADE }
                : { opacity: 0, filter: 'blur(10px)', transition: REVEAL_OUT }
            }
          >
            <AuthScreen
              busy={busy}
              methods={methods}
              dismissed={intro !== 'none'}
              leaving={intro === 'leaving'}
              onSignIn={onSignIn}
              config={skin.config}
            />
            {children}
          </motion.div>
        ) : (
          <motion.div
            key="wallet"
            className={styles.screen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: SWAP_FADE }}
            exit={{ opacity: 1, transition: REVEAL_IN }}
          >
            <AuroraWalletScreen
              entrance={!reduceMotion}
              entry={entry}
              home={skin.config.home}
              onQuoteCreate={onQuoteCreate}
              onLinkExternalAccount={onLinkExternalAccount}
              onTransferExecute={onTransferExecute}
              onCardIssued={onCardIssued}
              onTapToPay={onTapToPay}
              onReceivePayment={onReceivePayment}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
