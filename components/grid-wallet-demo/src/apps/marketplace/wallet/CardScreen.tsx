'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { TapToPayStatus } from '@/apps/shared/TapToPayStatus';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { easeOutQuick, easeOutSnappy, motionTransition } from '@/lib/easing';
import type { CardView, TapPhase, WalletListItemData } from '@/apps/shared/wallet';
import { IconCrossMedium, IconLoadingCircle, IconNfc1 } from '../icons';
import { MARKETPLACE_SHEET_DURATION } from '../config';
import { WaterbnbCard } from '../blocks/WaterbnbCard';
import { MarketplaceActivityList } from './ActivityList';
import styles from './CardScreen.module.scss';

const RISE_TRANSITION = motionTransition(easeOutSnappy, MARKETPLACE_SHEET_DURATION);
const SWAP = motionTransition(easeOutQuick, 0.35);
/** The gradient's fade to white once the card is ready — the issuance reveal. */
const REVEAL_S = 0.7;

interface CardScreenProps {
  cardView: CardView;
  tapPhase: TapPhase;
  /** Card charges only (tap-to-pay history) — the transactions list. */
  transactions: WalletListItemData[];
  onClose: () => void;
  /** CTA tapped — the brain runs the creating beat (spinner) then 'ready'. */
  onCreate: () => void;
  /** The white reveal finished — settle the brain on the card home. */
  onRevealed: () => void;
  onTapToPay: () => void;
}

/**
 * The Waterbnb debit card flow — a full-screen view rising from the bottom
 * (the pageSheet clock). Intro sits on the brand gradient with the world-map
 * marquee (4% white) and the listing-earnings pitch; Create spins in the CTA
 * (the Z beat) and the gradient then fades out to white, revealing the card
 * home: card, Tap to pay, and the transactions list in the marketplace voice.
 */
export function MarketplaceCardScreen({
  cardView,
  tapPhase,
  transactions,
  onClose,
  onCreate,
  onRevealed,
  onTapToPay,
}: CardScreenProps) {
  const reduceMotion = useReducedMotion();
  const open = cardView !== 'closed';
  // intro/creating ride the gradient; ready/home are the white card home
  // (the gradient fades out over the ready beat).
  const onGradient = cardView === 'intro' || cardView === 'creating';
  const creating = cardView === 'creating';
  const isTap = tapPhase !== 'idle';
  const cta = useSquircleClip<HTMLButtonElement>({ figmaRadii: 13 });
  const tapBtn = useSquircleClip<HTMLButtonElement>({ figmaRadii: 12 });

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="card-screen"
          className={styles.screen}
          initial={reduceMotion ? { opacity: 0 } : { y: '110%' }}
          animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { y: '110%' }}
          transition={RISE_TRANSITION}
        >
          {/* Card-pink backdrop + the world-map marquee — fades to the white
              card home once the card is ready, then unmounts (an opaque
              background-color would keep steering the status-bar sampler). */}
          {cardView !== 'home' && (
            <motion.div
              className={styles.brandBg}
              initial={false}
              animate={{ opacity: onGradient ? 1 : 0 }}
              transition={motionTransition(undefined, REVEAL_S)}
              onAnimationComplete={() => {
                if (cardView === 'ready') onRevealed();
              }}
              aria-hidden
            >
              <div className={styles.mapMarquee}>
                <span className={styles.mapTile} />
                <span className={styles.mapTile} />
              </div>
            </motion.div>
          )}

          <header className={styles.header}>
            <button
              type="button"
              className={styles.closeBtn}
              data-on-gradient={onGradient || undefined}
              aria-label="Close"
              onClick={onClose}
              disabled={creating}
            >
              <IconCrossMedium size={24} />
            </button>
          </header>

          <div className={styles.column}>
            {/* The card is ONE persistent element across both phases: the slot
                CENTERS it in the leftover space on the pitch, pins it up top on
                the card home — framer's layout glide carries it between. */}
            <div className={styles.cardSlot} data-centered={onGradient || undefined}>
              <motion.div
                layout={reduceMotion ? false : 'position'}
                initial={false}
                animate={{ y: isTap ? -8 : 0 }}
                transition={SWAP}
              >
                <WaterbnbCard width={280} />
              </motion.div>
            </div>

            <AnimatePresence initial={false} mode="popLayout">
              {onGradient ? (
                <motion.div
                  key="pitch"
                  className={styles.pitch}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={SWAP}
                >
                  <h1 className={styles.pitchTitle}>Spend your earnings anywhere</h1>
                  <p className={styles.pitchSub}>
                    Turn hosting income into everyday spending. Your card draws
                    straight from your balance, online and in person, anywhere
                    Visa is accepted.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="home"
                  className={styles.homeBody}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={SWAP}
                >
                  {/* Tap to pay ⇄ the reader status (hold/auth/done). */}
                  <div className={styles.tapZone}>
                    <AnimatePresence initial={false} mode="popLayout">
                      {isTap ? (
                        <motion.div
                          key="tap-status"
                          className={styles.tapStatus}
                          initial={{ opacity: 0, filter: 'blur(8px)' }}
                          animate={{ opacity: 1, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, filter: 'blur(8px)' }}
                          transition={SWAP}
                        >
                          <TapToPayStatus phase={tapPhase} />
                        </motion.div>
                      ) : (
                        <motion.button
                          key="tap-btn"
                          type="button"
                          ref={tapBtn.ref}
                          style={tapBtn.style}
                          className={styles.tapBtn}
                          onClick={onTapToPay}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={SWAP}
                        >
                          <IconNfc1 size={20} />
                          Tap to pay
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>

                  <h2 className={styles.txTitle}>Transactions</h2>
                  <MarketplaceActivityList
                    items={transactions}
                    emptyTitle="No transactions yet"
                    emptySub="Purchases with your Waterbnb card will show up here"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pinned CTA — intro/creating only (the Z beat: spinner in place,
              then the reveal plays with no extra tap). */}
          <AnimatePresence initial={false}>
            {onGradient && (
              <motion.div
                key="cta"
                className={styles.ctaWrap}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={SWAP}
              >
                <button
                  type="button"
                  ref={cta.ref}
                  style={cta.style}
                  className={styles.cta}
                  onClick={() => !creating && onCreate()}
                >
                  {creating ? (
                    <span className={styles.ctaSpinner} aria-label="Creating your card">
                      <IconLoadingCircle size={20} />
                    </span>
                  ) : (
                    'Get your free card'
                  )}
                </button>
                <p className={styles.agreement}>
                  By tapping &ldquo;Get your free card&rdquo; you accept the{' '}
                  <span>Terms of Service</span> &amp; <span>Privacy Policy</span> and{' '}
                  <span>Card Holder Agreement</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
