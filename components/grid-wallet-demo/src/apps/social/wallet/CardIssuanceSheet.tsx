'use client';

import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import { BottomSheet } from '@/apps/shared/BottomSheet';
import { PHONE_SHELL_GLASS } from '@/components/liquid-glass';
import { motionTransition } from '@/lib/easing';
import type { CardView } from '@/apps/shared/wallet';
import { IconCrossMedium as IconCrossZ } from '../icons';
import { IntroContent, ReadyContent } from './CardIssuanceContent';
import { useCard3DSupport } from './card3d/useCard3DSupport';
import { CanvasErrorBoundary } from './card3d/CanvasErrorBoundary';
import styles from './CardIssuanceSheet.module.scss';

// Code-split the 3D card (three.js) — only fetched when the issuance flow opens
// (or prewarmed on idle, below).
const ZCardCanvas = lazy(() => import('./card3d/ZCardCanvas'));

// Slower slide to match the Z money flows' full-screen presentation.
const SHEET_DURATION = 0.5;
// Step swap — the leaver blur-fades + drops out; the arriver's own stagger reveal
// plays in (same content language as the rest of the app).
const STEP_EXIT = {
  exit: { opacity: 0, y: 12, filter: 'blur(8px)' },
  transition: motionTransition(undefined, 0.28),
};

// ── Creation choreography (ms from the Create tap) — the full tap-to-landed
// run is ~2.8s (0.7 spinner + 0.25 swap + 1.85 flight) ──
const SPINNER_MS = 700; // spinner sits centered in the CTA before anything moves
const GRAPHIC_SWAP_MS = 250; // fan fades out (with the content) before the card fades in

/**
 * Presentation phases layered over the brain's cardView:
 *  fan      – intro fan spinning (intro copy, or the CTA spinner)
 *  swap     – content exits; the fan fades out (canvas hidden, scene swaps)
 *  reveal   – single card fades in on the "table", floats up + 360° spin
 *  resolved – card head-on; the ready copy staggers in (also the card-home
 *             state — cardView 'home' keeps flow at resolved and morphs the
 *             SAME card to the hero rect; the canvas never unmounts)
 */
type Flow = 'fan' | 'swap' | 'reveal' | 'resolved';

// Stub card-home actions — art direction TBD.
const CARD_HOME_ROWS = ['Tap to pay', 'Card details', 'Freeze card'];

/**
 * Z card issuance — a flat, full-screen sheet. The 3D metal card fills the top;
 * copy + CTA anchor at the bottom. Create runs the spinner → blur-out → card
 * reveal choreography; the ready copy waits for the card to resolve head-on.
 */
export function CardIssuanceSheet({
  open,
  cardView,
  issued,
  cardNumber = '•••• 8972',
  onClose,
  onCreate,
  onContinue,
}: {
  open: boolean;
  cardView: CardView;
  issued: boolean;
  cardNumber?: string;
  onClose: () => void;
  onCreate: () => void;
  onContinue: () => void;
}) {
  const support = useCard3DSupport();
  // Fade the 3D graphic in only once its maps are generated (no placeholder, no
  // untextured flash).
  const [graphicReady, setGraphicReady] = useState(false);
  // Mount the canvas only after the sheet's slide settles, so WebGL init +
  // shader compile never compete with the open animation (the graphic fades in
  // afterwards anyway).
  const [settled, setSettled] = useState(false);
  const [flow, setFlow] = useState<Flow>(
    cardView === 'ready' || cardView === 'home' ? 'resolved' : 'fan',
  );
  // Sheet opened on an already-created card — the scene skips to the resolved pose.
  const revealInstantRef = useRef(cardView === 'ready' || cardView === 'home');

  // The card's final perch, measured from the real layout (center of the gap
  // between the nav and the copy) as a fraction of screen height. The hidden
  // ready-copy spacer below stands in for the copy during the reveal, so this
  // stays correct if the content ever changes — nothing is hardcoded.
  const rootRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [endYFrac, setEndYFrac] = useState(0.32);
  const measure = useCallback(() => {
    const root = rootRef.current;
    const nav = navRef.current;
    const content = contentRef.current;
    if (!root || !nav || !content || root.offsetHeight === 0) return;
    const navBottom = nav.offsetTop + nav.offsetHeight;
    const contentTop = root.offsetHeight - content.offsetHeight;
    setEndYFrac((navBottom + contentTop) / 2 / root.offsetHeight);
  }, []);
  useEffect(() => {
    measure();
    const content = contentRef.current;
    if (!content || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(content);
    return () => ro.disconnect();
  }, [measure, open]);

  // Card-home hero rect (16px gutters, card aspect ratio) — measured from the
  // invisible placeholder in the card-home layout and handed to the scene as
  // fractions, so the 3D card lands wherever the layout puts it.
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroFrac, setHeroFrac] = useState<{ y: number; w: number } | null>(null);
  const measureHero = useCallback(() => {
    const root = rootRef.current;
    const heroEl = heroRef.current;
    if (!root || !heroEl || root.offsetHeight === 0) return;
    // Rect-based (not offset chains) so it survives the phone shell's CSS
    // scale — both rects scale together and the fractions cancel it out.
    const rootRect = root.getBoundingClientRect();
    const rect = heroEl.getBoundingClientRect();
    setHeroFrac({
      y: (rect.top + rect.height / 2 - rootRect.top) / rootRect.height,
      w: rect.width / rootRect.width,
    });
  }, []);
  useEffect(() => {
    if (cardView !== 'home') {
      // Clear only when a NEW issuance starts (the reveal must fly to the
      // perch, not the hero). Keep it across 'closed' so reopening straight
      // onto the card home finds the card already parked at the hero rect.
      if (cardView === 'intro' || cardView === 'creating') setHeroFrac(null);
      return;
    }
    measureHero();
    const el = heroRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measureHero);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cardView, measureHero]);

  // Prewarm on idle: fetch + parse the three.js chunk and generate both texture
  // variants while nothing is animating, so the first open doesn't stutter.
  useEffect(() => {
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const schedule = win.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 400));
    const cancel = win.cancelIdleCallback ?? window.clearTimeout;
    const id = schedule(() => {
      void import('./card3d/ZCardCanvas').then((m) => m.prewarmCardAssets(cardNumber));
    });
    return () => cancel(id);
  }, [cardNumber]);

  // STICKY: once settled (first open's slide done), stays true forever — the
  // canvas never unmounts again (the sheet keeps it alive while closed, with
  // the render loop paused), so reopening skips WebGL init + shader compile.
  useEffect(() => {
    if (!open || settled) return;
    const t = window.setTimeout(() => setSettled(true), SHEET_DURATION * 1000 + 80);
    return () => window.clearTimeout(t);
  }, [open, settled]);

  // Drive the creation choreography off the brain's cardView.
  useEffect(() => {
    // Closed: leave the scene exactly as it is. The sheet (and the live canvas
    // inside it) stays mounted and rides the slide-down — resetting to the fan
    // here would visibly swap the scene mid-dismiss.
    if (cardView === 'closed') return;
    if (cardView === 'intro') {
      setFlow('fan');
      revealInstantRef.current = false;
      return;
    }
    if (cardView === 'home') {
      // Continue (already resolved — no-op) or a direct open on an issued card
      // (the sheet stays mounted while closed, so flow was reset to 'fan'):
      // the card home always shows the resolved card, skipping the flight.
      setFlow('resolved');
      revealInstantRef.current = true;
      return;
    }
    if (cardView !== 'creating') return;
    // Create tapped: spinner dwells in the CTA, then the content + fan leave and
    // the single-card reveal takes over.
    const toSwap = window.setTimeout(() => setFlow('swap'), SPINNER_MS);
    const toReveal = window.setTimeout(() => setFlow('reveal'), SPINNER_MS + GRAPHIC_SWAP_MS);
    return () => {
      window.clearTimeout(toSwap);
      window.clearTimeout(toReveal);
    };
  }, [cardView]);

  const showIntro = cardView === 'intro' || (cardView === 'creating' && flow === 'fan');
  const showReady = cardView === 'ready' && flow === 'resolved';
  const showHome = cardView === 'home';
  // No `open` here: the card stays visible while the sheet slides away (it
  // rides the sheet), and reopening never waits on a fade-in.
  const graphicVisible = graphicReady && flow !== 'swap';

  return (
    <BottomSheet
      open={open}
      onDismiss={onClose}
      duration={SHEET_DURATION}
      // The 3D canvas lives in here — keep it mounted (hidden + paused) across
      // close/reopen so flows never pay WebGL init twice.
      keepMounted
      glass={{
        radius: 0,
        cornerSmoothing: PHONE_SHELL_GLASS.cornerSmoothing,
        tint: 'var(--app-bg)',
        edge: 'var(--sheet-flat-edge)',
        edgeGlint: false,
        edgeWidth: 0.5,
        shadow: '0 15px 37.5px rgba(0, 0, 0, 0.18)',
      }}
    >
      <div className={styles.issuance} ref={rootRef}>
        <header className={styles.nav} ref={navRef}>
          <button
            type="button"
            className={styles.navBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <IconCrossZ size={24} />
          </button>
        </header>

        {/* The 3D metal Z card — fills the space between the nav and the copy.
            The wrapper crossfades (slight blur) between the fan and the reveal.
            Flat fallback during load / when WebGL is unavailable; reduced-motion
            renders the card static. */}
        <div className={styles.graphic} aria-hidden>
          {support?.webgl && settled && (
            <CanvasErrorBoundary fallback={null}>
              <Suspense fallback={null}>
                <motion.div
                  style={{ width: '100%', height: '100%' }}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: graphicVisible ? 1 : 0,
                    filter: graphicVisible ? 'blur(0px)' : 'blur(6px)',
                  }}
                  transition={{
                    duration: flow === 'swap' ? GRAPHIC_SWAP_MS / 1000 : 0.5,
                    ease: 'easeOut',
                  }}
                >
                  <ZCardCanvas
                    stage={flow === 'reveal' || flow === 'resolved' ? 'reveal' : 'fan'}
                    paused={!open}
                    issued={issued}
                    cardNumber={cardNumber}
                    endYFrac={endYFrac}
                    heroYFrac={heroFrac?.y ?? null}
                    heroWFrac={heroFrac?.w ?? null}
                    revealInstant={revealInstantRef.current}
                    reducedMotion={support.reducedMotion}
                    onReady={() => setGraphicReady(true)}
                    onRevealResolved={() => setFlow('resolved')}
                  />
                </motion.div>
              </Suspense>
            </CanvasErrorBoundary>
          )}
        </div>

        {/* Copy + CTA, anchored at the bottom on a solid bg (the full-screen
            graphic sits behind it). Nothing visible renders while the card
            reveal is in flight — the spinner in the CTA was the loading signal,
            and the ready copy waits for the card to land. The invisible spacer
            is the ready copy's stand-in so the perch measurement (see `measure`)
            reflects the real final layout before the copy mounts. */}
        {/* Solid bg only under the intro/fan (the fan's lower arc passes behind
            the copy). From the reveal on it stays transparent — the resolved
            card perches above the copy and must never get clipped by this
            block (e.g. while gliding up as the ready copy appears). */}
        {/* Card home — the debit-card view. The hero placeholder is invisible
            (the LIVE 3D card morphs onto its measured rect); the rows below are
            a stub layout. pointer-events pass through to the canvas everywhere
            except the interactive rows, so the hero card keeps its hover tilt. */}
        {showHome && (
          <motion.div
            key="home"
            className={styles.cardHome}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className={styles.cardHero} ref={heroRef} aria-hidden />
            <motion.div
              className={styles.cardHomeBody}
              initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ ...motionTransition(undefined, 0.4), delay: 0.25 }}
            >
              {CARD_HOME_ROWS.map((label) => (
                <button key={label} type="button" className={styles.cardHomeRow}>
                  {label}
                </button>
              ))}
            </motion.div>
          </motion.div>
        )}

        <div
          className={clsx(styles.content, flow === 'fan' && styles.contentSolid)}
          ref={contentRef}
        >
          {(flow === 'reveal' || flow === 'resolved') && !showReady && !showHome && (
            <div className={styles.contentSpacer} aria-hidden>
              <ReadyContent />
            </div>
          )}
          <AnimatePresence mode="wait" initial={false}>
            {showIntro && (
              <motion.div key="intro" {...STEP_EXIT}>
                <IntroContent onCreate={onCreate} creating={cardView === 'creating'} />
              </motion.div>
            )}
            {showReady && (
              <motion.div key="ready" {...STEP_EXIT}>
                <ReadyContent onContinue={onContinue} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </BottomSheet>
  );
}
