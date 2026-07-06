'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { TapToPayStatus } from '@/apps/shared/TapToPayStatus';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { easeOutQuick, easeOutSnappy, motionTransition } from '@/lib/easing';
import type { CardView, TapPhase, WalletListItemData } from '@/apps/shared/wallet';
import {
  IconCreditCard1,
  IconCrossMedium,
  IconDotGrid1x3Horizontal,
  IconGlobe,
  IconLoadingCircle,
  IconNfc1,
  IconWallet1,
} from '../icons';
import { ONDEMAND_SHEET_DURATION } from '../config';
import { SuperCard } from '../blocks/SuperCard';
import { OndemandActivityList } from './ActivityList';
import styles from './CardScreen.module.scss';

const RISE_TRANSITION = motionTransition(easeOutSnappy, ONDEMAND_SHEET_DURATION);
const SWAP = motionTransition(easeOutQuick, 0.35);

const CARD_W = 296;
/** Card home: full width minus the 24px gutters (402 screen − 48). */
const HOME_CARD_SCALE = 354 / CARD_W;

// Tap-to-pay is SYSTEM choreography — tuned to read identically across every
// skin (same constants as Z/aurora/creator/marketplace): the card lifts 56px,
// the header chrome steps away, the home content blur-fades out, and the
// reader status fades in a beat later, riding the same lift.
const TAP_LIFT = -56;
const LIFT_T = motionTransition(easeOutSnappy, 0.5);
const TAP_CONTENT_IN = motionTransition(easeOutQuick, 0.4, { delay: 0.3 });
const TAP_CONTENT_OUT = motionTransition(easeOutQuick, 0.2);
// Header chrome vs the lift: our card sits only 24px under the X and reaches
// the header zone almost immediately. A near-instant fade + a 0.1s lift delay
// keeps it reading as one motion while guaranteeing the chrome is GONE before
// the card passes under it (and back in only after it clears).
const TAP_LIFT_DELAY = 0.1;
const TAP_CHROME_OUT = motionTransition(easeOutQuick, 0.12);
const TAP_CHROME_IN = motionTransition(easeOutQuick, 0.25, { delay: 0.25 });

/** Ready-screen value props — title + description rows in the Super voice. */
const VALUE_PROPS = [
  {
    Icon: IconCreditCard1,
    title: 'Draws from your balance',
    desc: 'Every purchase comes straight out of your Super balance.',
  },
  {
    Icon: IconGlobe,
    title: 'Accepted everywhere',
    desc: 'Pay online and in person in 65+ countries, anywhere cards are accepted.',
  },
  {
    Icon: IconWallet1,
    title: 'Add to Apple Wallet',
    desc: 'Tap to pay with your phone, on all your devices.',
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
 * The Super debit card flow — a full-screen view rising from the bottom
 * (the pageSheet clock), all on the white page. One matte black card (no
 * design gallery — the face is a placeholder for later art direction): the
 * intro pitches it with a black CTA; Create fades everything but the card and
 * runs a spinner under it, then the card glides up into the card home: Tap to
 * pay and the transactions list in the ondemand voice.
 */
export function OndemandCardScreen({
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
  // intro/creating/ready keep the card centered ('ready' is the "Your card is
  // ready" beat); Continue moves to 'home', where the card pins up top.
  const centered = open && cardView !== 'home';
  const creating = cardView === 'creating';
  const intro = cardView === 'intro';
  const ready = cardView === 'ready';
  const created = cardView === 'ready' || cardView === 'home';
  const isTap = tapPhase !== 'idle';
  // The reader status keeps its last real phase while the exit animation runs
  // (computed before any narrowing so the fallback stays type-legal).
  const tapStatusPhase: Exclude<TapPhase, 'idle'> = tapPhase === 'idle' ? 'hold' : tapPhase;
  const [scrolled, setScrolled] = useState(false);
  const cta = useSquircleClip<HTMLButtonElement>({ figmaRadii: 8 });
  const ctaContinue = useSquircleClip<HTMLButtonElement>({ figmaRadii: 8 });
  const tapBtn = useSquircleClip<HTMLButtonElement>({ figmaRadii: 8 });

  // Every step change is the same two-beat sequence: fade the leaving content
  // out FIRST (in place — layout intact so the card holds still), THEN move
  // the card, then the arriving content fades in.

  // Intro → creating: CTA tapped, intro content fades, then the brain flips.
  const [createLeaving, setCreateLeaving] = useState(false);
  const onCreateTap = () => {
    if (createLeaving) return;
    setCreateLeaving(true);
    window.setTimeout(onCreate, reduceMotion ? 0 : 300);
  };
  useEffect(() => {
    if (cardView !== 'intro') setCreateLeaving(false);
  }, [cardView]);

  // Creating → ready: the brain flips on its own timer, so the VISUAL stage
  // lags it — "Creating card" fades out first, then `settled` runs the glide
  // and mounts the ready content.
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

  // Ready → home: Continue tapped, ready content fades, then the brain flips.
  const [leaving, setLeaving] = useState(false);
  const onContinue = () => {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(onRevealed, reduceMotion ? 0 : 300);
  };
  useEffect(() => {
    if (cardView !== 'ready') setLeaving(false);
  }, [cardView]);
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
            {/* The X hides while creating (nothing to escape to) and during
                tap-to-pay (the header steps away — system choreography). */}
            <button
              type="button"
              className={styles.closeBtn}
              data-hidden={creating || isTap || undefined}
              aria-label="Close"
              onClick={onClose}
              disabled={creating || isTap}
            >
              <IconCrossMedium size={24} />
            </button>
            {/* Bar title + more menu on the card home only — the intro keeps
                the header clean (X only) so the pitch stays the single
                headline. */}
            <AnimatePresence initial={false}>
              {cardView === 'home' && !isTap && (
                <motion.span
                  key="header-title"
                  className={styles.headerTitle}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: TAP_CHROME_IN }}
                  exit={{ opacity: 0, transition: TAP_CHROME_OUT }}
                >
                  Your card
                </motion.span>
              )}
              {cardView === 'home' && !isTap && (
                <motion.button
                  key="header-more"
                  type="button"
                  className={styles.moreBtn}
                  aria-label="More options"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: TAP_CHROME_IN }}
                  exit={{ opacity: 0, transition: TAP_CHROME_OUT }}
                >
                  <IconDotGrid1x3Horizontal size={24} />
                </motion.button>
              )}
            </AnimatePresence>
          </header>

          <div className={styles.column}>
            {/* The card is ONE persistent element across both phases: the slot
                CENTERS it in the leftover space on the pitch, pins it up top on
                the card home — framer's layout glide carries it between. */}
            {/* data-lift (creating): a header-height bottom pad recenters the
                group in the PHONE, not the sub-header area — expressed in
                LAYOUT (not a y tween) so the layout glide is the only mover
                and there's no compound-animation stutter. */}
            <div
              className={styles.cardSlot}
              data-centered={centered || undefined}
              data-lift={creating || (ready && !settled) || undefined}
            >
              <motion.div
                className={styles.railWrap}
                layout={reduceMotion ? false : 'position'}
                initial={false}
                // The 56px tap-to-pay lift (system); the way up starts a hair
                // late so the chrome fade wins. Layout glides keep SWAP.
                animate={{ y: isTap ? TAP_LIFT : 0 }}
                transition={{
                  y: isTap ? { ...LIFT_T, delay: TAP_LIFT_DELAY } : LIFT_T,
                  layout: SWAP,
                }}
              >
                <div className={styles.cardWrap}>
                  {/* On the card home the card scales to full width minus the
                      gutters — a transform, so the same element rides the
                      glide with no re-layout of the scaled face. */}
                  <motion.div
                    initial={false}
                    animate={{ scale: centered ? 1 : HOME_CARD_SCALE }}
                    transition={SWAP}
                  >
                    <SuperCard width={CARD_W} showNumber={created} />
                  </motion.div>
                </div>

                {/* Below the card: the "Creating card" beat while issuing. In
                    flow so the slot centers card + strip as a GROUP; the strip
                    only collapses on the home flip (collapsing it mid-issuance
                    changed layout under the glide and made the card dip). */}
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
                      // Enters late (after the glide lands); exits immediately
                      // when 'ready' hits — the first beat of that sequence.
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
                // createLeaving: fade IN PLACE (layout intact — see Continue).
                <motion.div
                  key="pitch"
                  className={styles.pitch}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: createLeaving ? 0 : 1 }}
                  exit={{ opacity: 0 }}
                  transition={SWAP}
                >
                  <h1 className={styles.pitchTitle}>Spend your earnings anywhere</h1>
                  <p className={styles.pitchSub}>
                    Turn your earnings into everyday spending. Your card draws
                    straight from your Super balance, online and in person.
                  </p>
                </motion.div>
              ) : readyVisual ? (
                // Leaving (Continue tapped): fade IN PLACE — the block keeps
                // its layout so the card doesn't recenter until the glide.
                <motion.div
                  key="ready"
                  className={styles.pitch}
                  data-ready
                  initial={{ opacity: 0 }}
                  animate={{ opacity: leaving ? 0 : 1 }}
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
                <motion.div
                  key="home"
                  className={styles.homeBody}
                  initial={false}
                  exit={{ opacity: 0 }}
                  transition={SWAP}
                  onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 2)}
                >
                  {/* Lift layer: rides up 56px with the card while tap-to-pay
                      runs (system choreography). The home content blur-fades
                      IN PLACE (no unmount — the post-Continue stagger below
                      must not re-run on every tap) and the reader status
                      overlays it a beat later. */}
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
                          ref={tapBtn.ref}
                          style={tapBtn.style}
                          className={styles.tapBtn}
                          onClick={onTapToPay}
                        >
                          Tap to pay
                          <IconNfc1 size={20} />
                        </button>
                      </motion.div>

                      {/* Second stagger beat — the transactions table. */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ ...SWAP, delay: reduceMotion ? 0 : 0.42 }}
                      >
                        <h2 className={styles.txTitle}>Transactions</h2>
                        <div className={styles.txListBleed}>
                          <OndemandActivityList
                            items={transactions}
                            emptyTitle="No transactions yet"
                            emptySub="Purchases with your Super card will show up here"
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pinned CTA — intro (Get your free card) and ready (Continue).
              popLayout: the exiting CTA leaves the flex layout IMMEDIATELY, so
              the slot's final geometry is known when the card's recenter glide
              starts — otherwise the slot grows again when the fade ends and
              the card snaps at the end of the glide. */}
          <AnimatePresence initial={false} mode="popLayout">
            {intro ? (
              <motion.div
                key="cta-create"
                className={styles.ctaWrap}
                initial={{ opacity: 0 }}
                animate={{ opacity: createLeaving ? 0 : 1 }}
                exit={{ opacity: 0 }}
                transition={SWAP}
              >
                <button
                  type="button"
                  ref={cta.ref}
                  style={cta.style}
                  className={styles.cta}
                  onClick={onCreateTap}
                >
                  Get your free card
                </button>
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
                animate={{ opacity: leaving ? 0 : 1 }}
                exit={{ opacity: 0 }}
                transition={SWAP}
              >
                <button
                  type="button"
                  ref={ctaContinue.ref}
                  style={ctaContinue.style}
                  className={styles.cta}
                  onClick={onContinue}
                >
                  Continue
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
