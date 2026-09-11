'use client';

import clsx from 'clsx';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useBrand } from '@/apps/shared/brand/BrandContext';
import { PAN_GROUPS, type CardControls } from '@/apps/shared/card';
import { ContentAreaButton } from '@/apps/shared/ContentAreaButton';
import { GlassSymbolButton, headerGlassBrightness } from '@/apps/shared/glass';
import { SfSymbol } from '@/apps/shared/icons';
import { useThemeMode } from '@/hooks/useThemeMode';
import { easeOutQuick, easeOutSnappy, motionTransition } from '@/lib/easing';
import styles from './AddToWalletFlow.module.scss';

/** A full-screen presentation: up from the bottom, back down to leave. */
const COVER_HIDDEN = { y: '100%' };
const COVER_SHOWN = { y: 0 };
const COVER_IN = motionTransition(easeOutSnappy, 0.5);
const COVER_OUT = motionTransition(easeOutSnappy, 0.42);
/** Apple's copy swaps between steps: a quick crossfade. */
const SWAP = motionTransition(easeOutQuick, 0.22);

const LEGAL =
  'Card-related information, location, and information about device settings and use patterns may be sent to Apple and may be used together with account information to provide assessments to your card issuer or payment network to set up Apple Pay and prevent transaction fraud.';

/**
 * Apple's add-card flow (PKAddPaymentPassViewController), 1:1 with iOS: "Add
 * Card to Apple Pay" with the name and number, Continue, then "Adding Card"
 * through "Contacting the Card Issuer…" and "Setting up Card for Apple Pay…"
 * to the check. System chrome, so its colors are iOS's, not the app's. The
 * card in the slot is under it (the stage clips the card to its top edge).
 */
export function ApplePayAddCard({ card }: { card: CardControls }) {
  const reduceMotion = useReducedMotion();
  const theme = useThemeMode();
  const design = useBrand();
  const phase = card.walletPhase;
  const open = phase === 'intro' || phase === 'contacting' || phase === 'setup' || phase === 'added';
  const intro = phase === 'intro';
  const waiting = phase === 'contacting' || phase === 'setup';
  const name = (design.cardholderName.trim() || 'Cardholder name').toUpperCase();

  const subtitle =
    phase === 'intro'
      ? 'Your Card will be available in Wallet.'
      : phase === 'contacting'
        ? 'Contacting the Card Issuer…'
        : phase === 'setup'
          ? 'Setting up Card for Apple Pay…'
          : null;

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.section
          key="apple-pay"
          className={styles.cover}
          data-covers-card
          aria-label="Add Card to Apple Pay"
          initial={reduceMotion ? { opacity: 0 } : COVER_HIDDEN}
          animate={reduceMotion ? { opacity: 1 } : COVER_SHOWN}
          exit={reduceMotion ? { opacity: 0, transition: SWAP } : { ...COVER_HIDDEN, transition: COVER_OUT }}
          transition={COVER_IN}
        >
          <div className={styles.top}>
            {/* The X is Apple's; it goes once the card is being added. */}
            <AnimatePresence initial={false}>
              {intro && (
                <motion.span
                  key="close"
                  className={styles.close}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: SWAP }}
                  exit={{ opacity: 0, transition: SWAP }}
                >
                  <GlassSymbolButton
                    aria-label="Cancel"
                    size={44}
                    type="button"
                    glass={{ brightness: headerGlassBrightness(theme) }}
                    onClick={card.finishAddToWallet}
                  >
                    <SfSymbol name="xmark" size={16} />
                  </GlassSymbolButton>
                </motion.span>
              )}
            </AnimatePresence>

            <motion.div className={styles.titles} layout transition={SWAP}>
              <h1 className={styles.title}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={intro ? 'add' : 'adding'}
                    className={styles.titleText}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: SWAP }}
                    exit={{ opacity: 0, transition: SWAP }}
                  >
                    {intro ? 'Add Card to Apple Pay' : 'Adding Card'}
                  </motion.span>
                </AnimatePresence>
                <AnimatePresence initial={false}>
                  {phase === 'added' && (
                    <motion.span
                      key="check"
                      className={styles.titleCheck}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1, transition: motionTransition(easeOutSnappy, 0.4) }}
                      aria-label="Added"
                    >
                      <SfSymbol name="checkmark" size={22} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </h1>
              <AnimatePresence mode="wait" initial={false}>
                {subtitle && (
                  <motion.p
                    key={subtitle}
                    className={styles.subtitle}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: SWAP }}
                    exit={{ opacity: 0, transition: SWAP }}
                  >
                    {subtitle}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div className={styles.group} layout transition={SWAP}>
              <div className={styles.row}>
                <span className={styles.rowLabel}>Name</span>
                <span className={styles.rowValue}>{name}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowLabel}>Card Number</span>
                <span className={clsx(styles.rowValue, styles.rowNumber)}>{PAN_GROUPS.join(' ')}</span>
              </div>
            </motion.div>
          </div>

          <div className={styles.bottom}>
            <span className={clsx(styles.privacy, !intro && styles.privacyDim)} aria-hidden />
            <p className={styles.legal}>
              {LEGAL}
              <br />
              <span className={clsx(styles.legalLink, !intro && styles.legalLinkDim)}>See how your data is managed…</span>
            </p>
            <button
              type="button"
              className={clsx(styles.continue, !intro && styles.continueDim)}
              onClick={card.confirmAddToWallet}
              disabled={!intro}
            >
              {waiting ? <span className={styles.spinner} aria-label="Adding card" /> : 'Continue'}
            </button>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

/**
 * The app's own screen once Apple hands back: the card is in Apple Pay. It is
 * under Apple's flow as that leaves, so the slide-down reveals it; Done takes
 * it down the same way, back to the card home.
 */
export function WalletAddedScreen({ card }: { card: CardControls }) {
  const reduceMotion = useReducedMotion();
  // "Your Acme card", or just "Your card" until the brand has a name.
  const brand = useBrand().programName.trim();
  const open = card.walletPhase === 'confirm';
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.section
          key="wallet-added"
          className={styles.confirm}
          data-covers-card
          aria-label="Card added to Apple Pay"
          initial={false}
          animate={{ y: 0, opacity: 1 }}
          exit={reduceMotion ? { opacity: 0, transition: SWAP } : { ...COVER_HIDDEN, transition: COVER_OUT }}
        >
          <div className={styles.confirmBody}>
            <span className={styles.confirmCheck} aria-hidden>
              <SfSymbol name="checkmark" size={30} />
            </span>
            <h1 className={styles.confirmTitle}>Your {brand ? `${brand} card` : 'card'} was added to Apple Pay.</h1>
          </div>
          <div className={styles.confirmActions}>
            <ContentAreaButton type="button" variant="filled" onClick={card.finishAddToWallet}>
              Done
            </ContentAreaButton>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
