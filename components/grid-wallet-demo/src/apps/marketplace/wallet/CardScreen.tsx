'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { TapToPayStatus } from '@/apps/shared/TapToPayStatus';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { easeOutQuick, easeOutSnappy, motionTransition } from '@/lib/easing';
import type { CardView, TapPhase, WalletListItemData } from '@/apps/shared/wallet';
import {
  IconChevronLeftMedium,
  IconChevronRightMedium,
  IconCreditCard1,
  IconCrossMedium,
  IconDotGrid1x3Horizontal,
  IconGlobe,
  IconLoadingCircle,
  IconNfc1,
  IconWallet1,
} from '../icons';
import { MARKETPLACE_SHEET_DURATION } from '../config';
import { WaterbnbCard } from '../blocks/WaterbnbCard';
import { CARD_DESIGNS, cardDesignStore } from '../blocks/cardDesigns';
import { MarketplaceActivityList } from './ActivityList';
import styles from './CardScreen.module.scss';

const RISE_TRANSITION = motionTransition(easeOutSnappy, MARKETPLACE_SHEET_DURATION);
const SWAP = motionTransition(easeOutQuick, 0.35);

const CARD_W = 296;
/** Layout gap between rail items. Negative on purpose: neighbors render at
 *  0.88 scale, pulling ~18px away from their near edge — a −2px layout gap
 *  makes the VISIBLE gap to the full-size center card read as ~16px. */
const RAIL_GAP = -2;
const RAIL_STEP = CARD_W + RAIL_GAP;
/** Card home: full width minus the 24px gutters (402 screen − 48). */
const HOME_CARD_SCALE = 354 / CARD_W;
/** How much neighbors shrink in the carousel (centered card stays at 1). */
const NEIGHBOR_SHRINK = 0.12;

// Tap-to-pay is SYSTEM choreography — tuned to read identically across every
// skin (glitch is the reference; same constants as Z/aurora/creator): the card
// lifts 56px, the header chrome steps away, the home content blur-fades out,
// and the reader status fades in a beat later, riding the same lift.
const TAP_LIFT = -56;
const LIFT_T = motionTransition(easeOutSnappy, 0.5);
const TAP_CONTENT_IN = motionTransition(easeOutQuick, 0.4, { delay: 0.3 });
const TAP_CONTENT_OUT = motionTransition(easeOutQuick, 0.2);
// Header chrome vs the lift: Z's card sits far below its header, so a plain
// simultaneous fade wins the race; OUR card is only 24px under the X and
// reaches the header zone almost immediately. A near-instant fade + a 0.1s
// lift delay keeps it reading as one motion while guaranteeing the chrome is
// GONE before the card passes under it (and back in only after it clears).
const TAP_LIFT_DELAY = 0.1;
const TAP_CHROME_OUT = motionTransition(easeOutQuick, 0.12);
const TAP_CHROME_IN = motionTransition(easeOutQuick, 0.25, { delay: 0.25 });

/** Ready-screen value props — title + description rows (the Airbnb listing
 *  highlights anatomy) in the Waterbnb voice. */
const VALUE_PROPS = [
  {
    Icon: IconCreditCard1,
    title: 'Draws from your balance',
    desc: 'Every purchase comes straight out of your Waterbnb balance.',
  },
  {
    Icon: IconGlobe,
    title: 'Accepted everywhere',
    desc: 'Pay online and in person in 65+ countries, anywhere Visa is accepted.',
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
 * The Waterbnb debit card flow — a full-screen view rising from the bottom
 * (the pageSheet clock), all on the white page. Intro is a design-gallery
 * carousel (chevron controls under the rail) with the pitch and a brand-pink
 * CTA; Create fades everything but the chosen card and runs a spinner under
 * it, then the card glides up into the card home: Tap to pay and the
 * transactions list in the marketplace voice.
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
  // intro/creating/ready keep the card centered ('ready' is the "Your card is
  // ready" beat); Continue moves to 'home', where the card pins up top.
  const centered = open && cardView !== 'home';
  const creating = cardView === 'creating';
  const intro = cardView === 'intro';
  const ready = cardView === 'ready';
  const created = cardView === 'ready' || cardView === 'home';
  const isTap = tapPhase !== 'idle';
  const [scrolled, setScrolled] = useState(false);
  const cta = useSquircleClip<HTMLButtonElement>({ figmaRadii: 13 });
  const ctaContinue = useSquircleClip<HTMLButtonElement>({ figmaRadii: 13 });
  const tapBtn = useSquircleClip<HTMLButtonElement>({ figmaRadii: 12 });

  // Design picker: the intro card is a snap carousel of the design gallery.
  // The selection lives in a module store so it survives close/reopen AND the
  // whole skin unmounting (app switches); the rail re-syncs on remount.
  const [designIndex, setDesignIndexState] = useState(cardDesignStore.index);
  const setDesignIndex = (i: number) => {
    cardDesignStore.index = i;
    setDesignIndexState(i);
  };

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
  const railRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Proximity scale, driven directly off scroll position (items sit at
  // i * RAIL_STEP): the centered card is full size, neighbors shrink, and
  // everything in between interpolates as you drag.
  const applyScales = () => {
    const el = railRef.current;
    if (!el) return;
    itemRefs.current.forEach((node, i) => {
      if (!node) return;
      const d = Math.min(Math.abs(i * RAIL_STEP - el.scrollLeft) / RAIL_STEP, 1);
      node.style.transform = `scale(${1 - d * NEIGHBOR_SHRINK})`;
    });
  };
  const onRailScroll = () => {
    const el = railRef.current;
    if (!el) return;
    applyScales();
    const i = Math.round(el.scrollLeft / RAIL_STEP);
    setDesignIndex(Math.min(CARD_DESIGNS.length - 1, Math.max(0, i)));
  };
  const nudge = (dir: 1 | -1) => {
    railRef.current?.scrollBy({
      left: dir * RAIL_STEP,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };
  useLayoutEffect(() => {
    if (!open) return;
    setScrolled(false);
    const el = railRef.current;
    if (el) el.scrollLeft = designIndex * RAIL_STEP;
    applyScales();
    // Re-center only when the screen (re)mounts, not on every selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                headline; the carousel's peeking cards + chevrons imply the
                picking. */}
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
                the card home — framer's layout glide carries it between. On the
                intro it's a snap carousel of the design gallery; leaving the
                intro locks the rail and fades the neighbors, so the chosen
                card is what rides into the creation beat and card home. */}
            {/* data-lift (creating): a header-height bottom pad recenters the
                group in the PHONE, not the sub-header area — expressed in
                LAYOUT (not a y tween) so the layout glide is the only mover
                and there's no compound-animation stutter. */}
            <div
              className={styles.cardSlot}
              data-centered={centered || undefined}
              data-lift={creating || (ready && !settled) || undefined}
            >
              {/* layout is OFF during tap-to-pay (the Aurora fix): the wrap is
                  transform-lifted then, and a re-render mid-lift (Face ID
                  mounting at the 'auth' flip) makes the layout measurement see
                  the shifted position and "correct" it — a visible card jump.
                  The card never changes slots during a tap anyway. */}
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
                <div
                  ref={railRef}
                  className={styles.rail}
                  data-locked={!intro || undefined}
                  onScroll={onRailScroll}
                >
                  {CARD_DESIGNS.map((d, i) => (
                    <div
                      key={d.id}
                      ref={(node) => {
                        itemRefs.current[i] = node;
                      }}
                      className={styles.railItem}
                      data-hidden={(!intro && i !== designIndex) || undefined}
                    >
                      {/* On the card home the card scales to full width minus
                          the gutters — a transform, so the same element rides
                          the glide with no re-layout of the scaled face. */}
                      <motion.div
                        initial={false}
                        animate={{ scale: centered ? 1 : HOME_CARD_SCALE }}
                        transition={SWAP}
                      >
                        <WaterbnbCard width={CARD_W} art={d.art} showNumber={created} />
                      </motion.div>
                    </div>
                  ))}
                </div>

                {/* Below the rail: chevron controls on the intro ⇄ the
                    "Creating card" beat while issuing. In flow so the slot
                    centers card + controls as a GROUP; the strip only
                    collapses on the home flip (collapsing it mid-issuance
                    changed layout under the glide and made the card dip). */}
                <motion.div
                  className={styles.belowRail}
                  initial={false}
                  animate={{
                    height: centered ? 64 : 0,
                    opacity: intro || creating ? 1 : 0,
                  }}
                  transition={SWAP}
                >
                  <AnimatePresence initial={false} mode="popLayout">
                    {intro ? (
                      <motion.div
                        key="controls"
                        className={styles.controls}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: createLeaving ? 0 : 1 }}
                        exit={{ opacity: 0 }}
                        transition={SWAP}
                      >
                        <button
                          type="button"
                          className={styles.chevronBtn}
                          aria-label="Previous design"
                          disabled={designIndex === 0}
                          onClick={() => nudge(-1)}
                        >
                          <IconChevronLeftMedium size={20} />
                        </button>
                        <button
                          type="button"
                          className={styles.chevronBtn}
                          aria-label="Next design"
                          disabled={designIndex === CARD_DESIGNS.length - 1}
                          onClick={() => nudge(1)}
                        >
                          <IconChevronRightMedium size={20} />
                        </button>
                      </motion.div>
                    ) : creating ? (
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
                    ) : null}
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
                    Turn hosting income into everyday spending. Your card draws
                    straight from your balance, online and in person, anywhere
                    Visa is accepted.
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
                        <MarketplaceActivityList
                          items={transactions}
                          emptyTitle="No transactions yet"
                          emptySub="Purchases with your Waterbnb card will show up here"
                        />
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
                          <TapToPayStatus phase={tapPhase === 'idle' ? 'hold' : tapPhase} />
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
