'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { TapToPayStatus } from '@/apps/shared/TapToPayStatus';
import { GlassSymbolButton, headerGlassBrightness } from '@/apps/shared/glass';
import { SfSymbol } from '@/apps/shared/icons';
import { useThemeMode } from '@/hooks/useThemeMode';
import { easeOutQuick, easeOutSnappy, motionTransition } from '@/lib/easing';
import type { CardView, TapPhase, WalletListItemData } from '@/apps/shared/wallet';
import {
  IconBanknote1,
  IconCreditCard2,
  IconLoadingCircle,
  IconNfc1,
} from '../icons';
import { BRAND, MESSAGING_COVER_DURATION } from '../config';
import { CardIssueIntro } from '../blocks/CardIssueIntro';
import { ChatsCard } from '../blocks/ChatsCard';
import { GlassCta } from '../blocks/GlassCta';
import { MessagingActivityList } from './ActivityList';
import styles from './CardScreen.module.scss';

const RISE_TRANSITION = motionTransition(easeOutSnappy, MESSAGING_COVER_DURATION);
const SWAP = motionTransition(easeOutQuick, 0.35);

const CARD_W = 296;
/** Card home: full width minus the 24px gutters (402 screen − 48). */
const HOME_CARD_SCALE = 354 / CARD_W;

// Tap-to-pay is SYSTEM choreography — tuned to read identically across every
// skin (same constants as Z/aurora/creator/marketplace/ondemand): the card
// lifts 56px, the header chrome steps away, the home content blur-fades out,
// and the reader status fades in a beat later, riding the same lift.
const TAP_LIFT = -56;
const LIFT_T = motionTransition(easeOutSnappy, 0.5);
const TAP_CONTENT_IN = motionTransition(easeOutQuick, 0.4, { delay: 0.3 });
const TAP_CONTENT_OUT = motionTransition(easeOutQuick, 0.2);
// Header chrome vs the lift: our card sits only ~24px under the X and reaches
// the header zone almost immediately (the ondemand geometry). A near-instant
// fade + a 0.1s lift delay keeps it reading as one motion while guaranteeing
// the chrome is GONE before the card passes under it.
const TAP_LIFT_DELAY = 0.1;
const TAP_CHROME_OUT = motionTransition(easeOutQuick, 0.12);
const TAP_CHROME_IN = motionTransition(easeOutQuick, 0.25, { delay: 0.25 });

/** Ready-screen value props — the money-in-your-chats pitch, ChatsApp voice. */
const VALUE_PROPS = [
  {
    Icon: IconBanknote1,
    title: 'Spend your balance instantly',
    desc: 'Money friends send you is spendable the moment it lands. No transfers, no waiting.',
  },
  {
    Icon: IconNfc1,
    title: 'Tap to pay anywhere',
    desc: 'Add it to Apple Wallet and pay with your phone in 65+ countries.',
  },
  {
    Icon: IconCreditCard2,
    title: 'Locked down by default',
    desc: 'Your card number stays private, and you can freeze it any time in a tap.',
  },
];

interface CardScreenProps {
  cardView: CardView;
  tapPhase: TapPhase;
  /** Card charges only (tap-to-pay history) — the transactions list. */
  transactions: WalletListItemData[];
  onClose: () => void;
  /** CTA tapped — the brain runs the creating beat (spinner) then 'ready'. */
  onCreate: () => void;
  /** Continue tapped on the ready beat — settle the brain on the card home. */
  onRevealed: () => void;
  onTapToPay: () => void;
}

/**
 * The ChatsApp debit card flow — the ondemand (Super) card flow's
 * choreography on a clean page (NO dot-grid backdrop): a full-screen view
 * rising from the bottom, one green card pitched with a glass CTA; Create
 * fades everything but the card and runs a spinner under it, then the card
 * glides up into the card home: Tap to pay and the transactions list.
 */
export function MessagingCardScreen({
  cardView,
  tapPhase,
  transactions,
  onClose,
  onCreate,
  onRevealed,
  onTapToPay,
}: CardScreenProps) {
  const reduceMotion = useReducedMotion();
  const theme = useThemeMode();
  const open = cardView !== 'closed';
  // intro/creating/ready keep the card centered ('ready' is the "card is
  // ready" beat); Continue moves to 'home', where the card pins up top.
  const centered = open && cardView !== 'home';
  const creating = cardView === 'creating';
  const intro = cardView === 'intro';
  const ready = cardView === 'ready';
  const created = cardView === 'ready' || cardView === 'home';
  const isTap = tapPhase !== 'idle';
  // The reader status keeps its last real phase while the exit animation runs.
  const tapStatusPhase: Exclude<TapPhase, 'idle'> = tapPhase === 'idle' ? 'hold' : tapPhase;
  const [scrolled, setScrolled] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Creating → ready: the brain flips on its own timer, so the VISUAL stage
  // lags it — "Creating card" fades out first, then `settled` runs the glide
  // and mounts the ready content (the two-beat rule).
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (cardView !== 'ready') {
      setSettled(false);
      return;
    }
    const t = window.setTimeout(() => setSettled(true), reduceMotion ? 0 : 300);
    return () => window.clearTimeout(t);
  }, [cardView, reduceMotion]);
  const readyVisual = ready && settled;

  useLayoutEffect(() => {
    if (open) setScrolled(false);
  }, [open]);

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
          <header
            className={styles.header}
            data-bordered={(created && scrolled) || undefined}
          >
            {/* The glass X hides while creating (nothing to escape to) and
                during tap-to-pay (the header steps away — system choreography). */}
            <span
              className={styles.closeSlot}
              data-hidden={creating || isTap || undefined}
            >
              <GlassSymbolButton
                aria-label="Close"
                size={40}
                type="button"
                glass={{ brightness: headerGlassBrightness(theme) }}
                onClick={creating || isTap ? undefined : onClose}
                disabled={creating || isTap}
              >
                <SfSymbol name="xmark" size={14} />
              </GlassSymbolButton>
            </span>
            {/* Bar title + more menu on the card home only — the intro keeps
                the header clean (X only) so the pitch stays the headline. */}
            <AnimatePresence initial={false}>
              {cardView === 'home' && !isTap && (
                <motion.span
                  key="header-title"
                  className={styles.headerTitle}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: TAP_CHROME_IN }}
                  exit={{ opacity: 0, transition: TAP_CHROME_OUT }}
                >
                  {BRAND} Card
                </motion.span>
              )}
              {cardView === 'home' && !isTap && (
                <motion.span
                  key="header-more"
                  className={styles.moreSlot}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: TAP_CHROME_IN }}
                  exit={{ opacity: 0, transition: TAP_CHROME_OUT }}
                >
                  <GlassSymbolButton
                    aria-label="More options"
                    size={40}
                    type="button"
                    glass={{ brightness: headerGlassBrightness(theme) }}
                  >
                    <SfSymbol name="ellipsis" size={17} />
                  </GlassSymbolButton>
                </motion.span>
              )}
            </AnimatePresence>
          </header>

          <div className={styles.column}>
            {/* The card is ONE persistent element across both phases: the slot
                CENTERS it in the leftover space on the pitch, pins it up top on
                the card home — framer's layout glide carries it between. */}
            <div
              className={styles.cardSlot}
              data-centered={centered || undefined}
              data-lift={creating || (ready && !settled) || undefined}
            >
              {/* layout is OFF during tap-to-pay (the Aurora fix): the wrap is
                  transform-lifted then, and a re-render mid-lift makes the
                  layout measurement "correct" the shifted position — a visible
                  card jump. The card never changes slots mid-tap. */}
              <motion.div
                className={styles.railWrap}
                layout={!reduceMotion && !isTap ? 'position' : false}
                initial={false}
                // The 56px tap-to-pay lift (system); the way up starts a hair
                // late so the chrome fade wins. Layout glides keep SWAP.
                animate={{ y: isTap ? TAP_LIFT : 0 }}
                transition={{
                  y: isTap ? { ...LIFT_T, delay: TAP_LIFT_DELAY } : LIFT_T,
                  layout: SWAP,
                }}
              >
                <div className={styles.cardWrap} ref={cardRef}>
                  {/* On the card home the card scales to full width minus the
                      gutters — a transform, so the same element rides the
                      glide with no re-layout of the scaled face. */}
                  <motion.div
                    className={styles.cardFace}
                    initial={false}
                    animate={{ scale: centered ? 1 : HOME_CARD_SCALE }}
                    transition={SWAP}
                  >
                    {/* Intro: a money-chat conversation pops in over the slot,
                        then match-cuts into the card scaling up (in place of
                        Super's dot grid). Non-intro entries skip to the card. */}
                    <CardIssueIntro intro={intro}>
                      <ChatsCard width={CARD_W} showNumber={created} />
                    </CardIssueIntro>
                  </motion.div>
                </div>

                {/* Below the card: the "Creating card" beat while issuing. In
                    flow so the slot centers card + strip as a GROUP. */}
                <motion.div
                  className={styles.belowRail}
                  initial={false}
                  animate={{
                    height: centered ? 64 : 0,
                    opacity: creating ? 1 : 0,
                  }}
                  transition={SWAP}
                >
                  <AnimatePresence initial={false} mode="popLayout">
                    {creating && (
                      <motion.div
                        key="creating"
                        className={styles.creating}
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: 1,
                          transition: { ...SWAP, delay: reduceMotion ? 0 : 0.3 },
                        }}
                        exit={{ opacity: 0, transition: SWAP }}
                        role="status"
                      >
                        <span className={styles.spin} aria-hidden>
                          <IconLoadingCircle size={20} />
                        </span>
                        Creating card
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            </div>

            <AnimatePresence initial={false} mode="popLayout">
              {intro ? (
                // Exits (popLayout fade) WHILE the card glides — one motion.
                <motion.div
                  key="pitch"
                  className={styles.pitch}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={SWAP}
                >
                  <h1 className={styles.pitchTitle}>From chat to checkout</h1>
                  <p className={styles.pitchSub}>
                    Spend your {BRAND} balance anywhere cards are accepted.
                    Money a friend sends you is ready before the chat scrolls.
                  </p>
                </motion.div>
              ) : readyVisual ? (
                // Continue: exits (popLayout fade) as the card glides up.
                <motion.div
                  key="ready"
                  className={styles.pitch}
                  data-ready
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={SWAP}
                >
                  <h1 className={styles.pitchTitle}>Your card is ready</h1>
                  <div className={styles.valueProps}>
                    {VALUE_PROPS.map(({ Icon, title, desc }) => (
                      <div key={title} className={styles.valueProp}>
                        <span className={styles.valuePropIcon}>
                          <Icon size={24} />
                        </span>
                        <span className={styles.valuePropText}>
                          <span className={styles.valuePropTitle}>{title}</span>
                          <span className={styles.valuePropDesc}>{desc}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : cardView !== 'home' ? null : (
                // The popLayout child must be MARGIN-FREE (exit absolutizes at
                // the measured offset; margins would apply a second time).
                <motion.div
                  key="home"
                  className={styles.homeSlot}
                  initial={false}
                  exit={{ opacity: 0 }}
                  transition={SWAP}
                >
                  <div
                    className={styles.homeBody}
                    onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 2)}
                  >
                    {/* Lift layer: rides up 56px with the card while tap-to-pay
                        runs. The home content blur-fades IN PLACE (no unmount)
                        and the reader status overlays it a beat later. */}
                    <motion.div
                      className={styles.homeLift}
                      initial={false}
                      animate={{ y: isTap ? TAP_LIFT : 0 }}
                      transition={LIFT_T}
                    >
                      <motion.div
                        initial={false}
                        animate={
                          isTap
                            ? { opacity: 0, filter: 'blur(8px)' }
                            : { opacity: 1, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }
                        }
                        transition={isTap ? TAP_CONTENT_OUT : TAP_CONTENT_IN}
                        style={{ pointerEvents: isTap ? 'none' : 'auto' }}
                      >
                        {/* First stagger beat (the Continue sequence) — Tap to pay. */}
                        <motion.div
                          className={styles.tapZone}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ ...SWAP, delay: reduceMotion ? 0 : 0.3 }}
                        >
                          <button
                            type="button"
                            className={styles.tapBtn}
                            onClick={onTapToPay}
                          >
                            <span className={styles.tapLabel}>
                              Tap to pay
                              <IconNfc1 size={20} />
                            </span>
                          </button>
                        </motion.div>

                        {/* Second stagger beat — the transactions list. */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ ...SWAP, delay: reduceMotion ? 0 : 0.42 }}
                        >
                          <h2 className={styles.txTitle}>Transactions</h2>
                          <div className={styles.txListBleed}>
                            <MessagingActivityList
                              items={transactions}
                              emptyTitle="No transactions yet"
                              emptySub={`Purchases with your ${BRAND} card will show up here`}
                            />
                          </div>
                        </motion.div>
                      </motion.div>

                      <AnimatePresence initial={false}>
                        {isTap && (
                          <motion.div
                            key="tap-status"
                            className={styles.tapStatus}
                            initial={{ opacity: 0, filter: 'blur(8px)' }}
                            animate={{ opacity: 1, filter: 'blur(0px)', transition: TAP_CONTENT_IN }}
                            exit={{ opacity: 0, filter: 'blur(8px)', transition: TAP_CONTENT_OUT }}
                          >
                            <TapToPayStatus phase={tapStatusPhase} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pinned CTA — intro (Get your free card) and ready (Continue).
              popLayout: the exiting CTA leaves the flex layout IMMEDIATELY, so
              the slot's final geometry is known when the recenter glide starts. */}
          <AnimatePresence initial={false} mode="popLayout">
            {intro ? (
              <motion.div
                key="cta-create"
                className={styles.ctaWrap}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={SWAP}
              >
                <GlassCta onClick={onCreate}>Get your free card</GlassCta>
                <p className={styles.agreement}>
                  By tapping &ldquo;Get your free card&rdquo; you accept the{' '}
                  <span>Terms of Service</span> &amp; <span>Privacy Policy</span> and{' '}
                  <span>Card Holder Agreement</span>
                </p>
              </motion.div>
            ) : readyVisual ? (
              <motion.div
                key="cta-continue"
                className={styles.ctaWrap}
                data-solo
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={SWAP}
              >
                <GlassCta onClick={onRevealed}>Continue</GlassCta>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
