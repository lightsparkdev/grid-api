'use client';

import clsx from 'clsx';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useBrand } from '@/apps/shared/brand/BrandContext';
import { PAN_GROUPS, type CardControls } from '@/apps/shared/card';
import { GlassOver } from '@/components/liquid-glass';
import { GlassSymbolButton, headerGlassBrightness, TEXT_GLASS, TEXT_GLASS_PRIMARY_BACKDROP, useOverlayGlass } from '@/apps/shared/glass';
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
/** The form follows the titles up as they shorten. */
const GROUP_MOVE = motionTransition(easeOutSnappy, 0.4);

const LEGAL =
  'Card-related information, location, and information about device settings and use patterns may be sent to Apple and may be used together with account information to provide assessments to your card issuer or payment network to set up Apple Pay and prevent transaction fraud.';

/**
 * Apple's add-card flow (PKAddPaymentPassViewController), 1:1 with iOS: "Add
 * Card to Apple Pay" with the name and number, Continue, then "Adding Card"
 * through "Contacting the Card Issuer…" and "Setting up Card for Apple Pay…"
 * to the check. System chrome, so its colors are iOS's, not the app's. It
 * covers the card in the slot as it rises.
 */
export function ApplePayAddCard({ card }: { card: CardControls }) {
  const reduceMotion = useReducedMotion();
  const theme = useThemeMode();
  const design = useBrand();
  const overlayGlass = useOverlayGlass();
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

            {/* popLayout: an outgoing title or subtitle leaves the flow the
                moment it starts fading, so the layout change lands in the
                same render as the phase change and the group below animates
                up to meet it (with mode="wait" it left later, in a render
                the group didn't take part in, and the group jumped). The
                titles box itself takes its new height at once: its text
                crossfades, and animating its size (a scale) threw the popped
                text off before the group settled. */}
            <div className={styles.titles}>
              <h1 className={styles.title}>
                <AnimatePresence mode="popLayout" initial={false}>
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
              <AnimatePresence mode="popLayout" initial={false}>
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
            </div>

            {/* Position only: the group's size never changes, and a size
                animation would scale the rows' text on the way. */}
            <motion.div className={styles.group} layout="position" transition={GROUP_MOVE}>
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
              {intro ? (
                // Apple's prominent button, as iOS draws it now: blue glass.
                <GlassOver className={styles.continueGlass} backdrop={TEXT_GLASS_PRIMARY_BACKDROP} {...overlayGlass.text}>
                  <span className={styles.continueLabel}>Continue</span>
                </GlassOver>
              ) : (
                <span className={styles.continueLabel}>
                  {waiting ? <span className={styles.spinner} aria-label="Adding card" /> : 'Continue'}
                </span>
              )}
            </button>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
