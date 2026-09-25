'use client';

import clsx from 'clsx';
import { IconRotate360Right } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconRotate360Right';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { cancelFrame, frame, useReducedMotion } from 'motion/react';
import { footprint } from '@/apps/card/cardMetrics';
import { programNameOf } from '@/apps/shared/brand/BrandContext';
import type { CardHome } from '@/apps/shared/card';
import { AnimatedLock } from '@/apps/shared/icons';
import { CARD_PARKED_T, easeInOutCubic, usePhoneBoot } from '@/components/DotGridCanvas/PhoneBootContext';
import type { CardDesign } from '@/data/design';
import { canScrollBy } from '@/lib/scroll';
import { play } from '@/lib/sounds';
import type { ShareStageState } from './CardStage';
import { CardIntro } from './CardIntro';
import { CardMotion } from './cardMotion';
import { useCardMomentSounds } from './cardSounds';
import { installExportDevHook } from './export/devHook';
import type { CardFrameSource } from './export/exportRenderer';
import { FlatExporter, type FlatFaces } from './export/flatExporter';
import { applyIntroLook, clearIntroLook, FlatCard, poseTransform } from './FlatCard';
import { INTRO_END, stepIntro } from './introTimeline';
import { clipToScreen, GLIDE_TAU, restOn, ShareFlight, towardSlot, type Placement } from './stagePlacement';
import styles from './CardStage.module.scss';

interface FlatCardStageProps {
  design: CardDesign;
  home: CardHome;
  /** Filled with the flat card's exporter (the share renders through it). */
  exportRef?: MutableRefObject<CardFrameSource | null>;
  share?: ShareStageState;
  /** The 3D card played the intro before it failed: the flat one starts shown. */
  introPlayed?: boolean;
  /** The blueprint has dissolved and the card stands alone. */
  onIntroDone?: () => void;
}

/**
 * The stage without WebGL: the flat card where the 3D one would be, on the
 * same motion (drag to turn, fling, tilt under the pointer, the idle bob) and
 * the same intro. It rests in the middle of the stage, flies into the
 * phone's slot as the phone comes up, and into the share frame's while it is
 * open. The brand and art are placed from the design panel; there is no
 * dragging them on the card here.
 */
export function FlatCardStage({ design, home, exportRef, share, introPlayed = false, onIntroDone }: FlatCardStageProps) {
  const { bootProgress } = usePhoneBoot();
  const reduceMotion = useReducedMotion() ?? false;
  const rootRef = useRef<HTMLDivElement>(null);
  const hitRef = useRef<HTMLDivElement>(null);
  const lookRef = useRef<HTMLDivElement>(null);
  const turnRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<SVGSVGElement>(null);
  const motion = useMemo(() => new CardMotion(), []);
  const { issued, issuing, card, isDeclined, isTap } = home;

  const t = easeInOutCubic(bootProgress);
  const phoneUp = bootProgress > 0;
  const inFlightNow = phoneUp && t < CARD_PARKED_T;
  const stateShown = phoneUp && !inFlightNow;
  const dimmed = stateShown && (card.frozen || card.closed);
  const [introDone, setIntroDone] = useState(introPlayed);
  useEffect(() => {
    if (introDone && !introPlayed) onIntroDone?.();
  }, [introDone, introPlayed, onIntroDone]);
  // Nothing says the card can be turned; say it once, until the first drag.
  const [dragged, setDragged] = useState(false);

  useCardMomentSounds({ issued, issuing, frozen: card.frozen, closed: card.closed });
  useEffect(() => {
    if (!isDeclined) return;
    motion.shake();
    play('decline');
  }, [isDeclined, motion]);

  // The share frame: open, the card flies into its slot and is posed there;
  // closed, it flies back and settles on a face again (as on the 3D stage).
  const shareOpen = !!share?.open && !phoneUp;
  const shareLocked = !!share?.locked;
  useEffect(() => {
    motion.free = shareOpen && !shareLocked;
    if (!shareOpen) {
      const p = motion.pose;
      motion.setPose({ rotX: Math.round(p.rotX / 180) * 180, rotY: Math.round(p.rotY / 180) * 180 });
    }
  }, [shareOpen, shareLocked, motion]);
  const sharePose = share?.pose ?? null;
  useEffect(() => {
    if (shareOpen && sharePose) motion.setPose(sharePose);
  }, [shareOpen, sharePose, motion]);
  const shareFlight = useMemo(() => new ShareFlight(), []);

  // Read by the frame loop and the pointer handlers, which outlive renders.
  const liveNow = {
    t,
    orientation: design.orientation,
    wantBack: card.page === 'numbers',
    tap: isTap,
    inert: dimmed,
    reduceMotion,
    shareWanted: shareOpen,
    shareLocked,
    onTurned: share?.onTurned,
    onSettled: share?.onSettled,
  };
  const live = useRef(liveNow);
  live.current = liveNow;
  const inFlight = () => (live.current.t > 0 && live.current.t < CARD_PARKED_T) || shareFlight.flying;
  const inPhone = () => live.current.t >= CARD_PARKED_T;
  const inShare = () => shareFlight.t > 0;

  // The share's pictures of the card, from its painted faces.
  const facesRef = useRef<FlatFaces | null>(null);
  const designRef = useRef(design);
  designRef.current = design;
  useEffect(() => {
    if (!exportRef) return;
    const exporter = new FlatExporter({
      faces: () => facesRef.current,
      orientation: () => live.current.orientation,
      livePose: () => motion.pose,
    });
    exportRef.current = exporter;
    const uninstall = installExportDevHook(exporter, () => designRef.current);
    return () => {
      uninstall();
      if (exportRef.current === exporter) exportRef.current = null;
    };
  }, [exportRef, motion]);

  // The intro's clock: -1 until the front has painted, then seconds.
  const intro = useRef(introPlayed ? { t: INTRO_END, done: true } : { t: -1, done: false });
  const onPainted = useCallback(() => {
    if (intro.current.t < 0) intro.current.t = 0;
  }, []);

  useLayoutEffect(() => {
    let pos: Placement | null = null;
    let last: number | null = null;
    const step = ({ timestamp }: { timestamp: number }) => {
      const root = rootRef.current;
      const hit = hitRef.current;
      const look = lookRef.current;
      const turn = turnRef.current;
      if (!root || !hit || !look || !turn) return;
      const dt = last === null ? 0 : Math.min(0.05, (timestamp - last) / 1000);
      last = timestamp;
      const lv = live.current;
      const it = intro.current;
      const r = root.getBoundingClientRect();
      const foot = footprint(lv.orientation);
      const rest = restOn(r.width, r.height, foot);
      const k = pos ? 1 - Math.exp(-dt / GLIDE_TAU) : 1;
      const p = pos ?? { ...rest };
      p.x += (rest.x - p.x) * k;
      p.y += (rest.y - p.y) * k;
      p.s += (rest.s - p.s) * k;
      pos = p;
      const flight = shareFlight.step(dt, {
        wanted: lv.shareWanted,
        reduceMotion: lv.reduceMotion,
        motion,
        doc: root.ownerDocument,
        r,
        foot,
        at: lv.t > 0 ? towardSlot(p, lv.t, root.ownerDocument, r, foot) : p,
        onSettled: lv.onSettled,
      });
      const { x, y, s } = flight.at;

      // Held flat in flight (to the phone or the share frame), through the
      // intro, at the reader, and locked or closed in the phone, as the 3D
      // card is. Posed in the share frame it holds still (no bob).
      const pose = motion.step(dt, {
        wantBack: lv.wantBack,
        hold: (lv.t > 0 && lv.t < CARD_PARKED_T) || shareFlight.flying || !it.done || lv.tap || lv.inert,
        reduceMotion: lv.reduceMotion,
        bob: shareFlight.t === 0,
        path: flight.path,
      });
      const bob = pose.dy * (1 - lv.t);
      hit.style.transform = `translate(${x + pose.dx * s - foot.w / 2}px, ${y + bob - foot.h / 2}px) scale(${s})`;
      hit.style.setProperty('--card-scale', s.toFixed(4));
      turn.style.transform = poseTransform(pose);

      // The intro: the blueprint draws, then the card comes into focus under
      // it. A flow starting mid-intro (or reduced motion) ends it now.
      if (!it.done) {
        if (it.t >= 0) it.t += dt;
        if (lv.t > 0 || lv.reduceMotion) it.t = INTRO_END;
        if (overlayRef.current) stepIntro(overlayRef.current, it.t);
        applyIntroLook(look, it.t);
        if (it.t >= INTRO_END) {
          it.done = true;
          clearIntroLook(look);
          setIntroDone(true);
        }
      }
      clipToScreen(root, r, lv.t >= CARD_PARKED_T);
    };
    // Placed before the first paint, then after Motion writes each frame's
    // transforms (the phone's slot moves with them).
    step({ timestamp: performance.now() });
    frame.postRender(step, true);
    return () => cancelFrame(step);
  }, [motion, shareFlight]);

  // ── Turning it by hand ─────────────────────────────────────────────────
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const lv = live.current;
    if (inFlight() || !intro.current.done || e.button !== 0) return;
    // On Card numbers the card is turned over for the reveal and stays so; at
    // the reader it is held; locked or closed it is inert; in the hand it is
    // held as the hand holds it.
    if (lv.wantBack || lv.tap || lv.inert || (inShare() && lv.shareLocked)) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Not capturable; the window-level release still ends the drag.
    }
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    setDragged(true);
    motion.beginDrag(e.timeStamp);
    e.currentTarget.classList.add(styles.hitDragging);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (d && e.pointerId === d.id) {
      motion.drag(e.clientX - d.x, e.clientY - d.y, e.timeStamp);
      d.x = e.clientX;
      d.y = e.clientY;
      return;
    }
    // Posed in the share frame the card holds its angles: no tilt, so what is
    // seen is what the picture will be.
    if (inFlight() || inShare() || live.current.reduceMotion || live.current.inert || e.pointerType !== 'mouse') return;
    const b = e.currentTarget.getBoundingClientRect();
    motion.setTilt((e.clientX - b.left) / b.width - 0.5, (e.clientY - b.top) / b.height - 0.5);
  };
  /** Let go, whichever way the drag ended (a pointerup off the card or the
   *  embed, the capture lost): a drag left set would hold the card mid-turn. */
  const release = useCallback(
    (now: number) => {
      if (!drag.current) return;
      drag.current = null;
      motion.endDrag(now);
      hitRef.current?.classList.remove(styles.hitDragging);
      // In the share frame the card stays as turned; the row's pose lets go.
      if (shareFlight.t > 0) live.current.onTurned?.();
    },
    [motion, shareFlight],
  );
  const onPointerLeave = () => {
    if (!drag.current) motion.clearTilt();
  };
  useEffect(() => {
    const hit = hitRef.current;
    const onUp = () => release(performance.now());
    // iOS Safari: keep a finger turning the card from scrolling the page
    // (native and not passive; React's touch handlers can't cancel).
    const onTouchMove = (e: TouchEvent) => {
      if (drag.current && e.cancelable) e.preventDefault();
    };
    // Parked, the wheel over the card scrolls the phone's page, as it does
    // anywhere else on it.
    const onWheel = (e: WheelEvent) => {
      if (!inPhone() || e.ctrlKey || !hit) return;
      const scroller = hit.ownerDocument.querySelector<HTMLElement>('[data-card-scroller]');
      if (!scroller || getComputedStyle(scroller).overflowY !== 'auto' || !canScrollBy(scroller, e.deltaY)) return;
      e.preventDefault();
      scroller.scrollTop += e.deltaY;
    };
    hit?.addEventListener('touchmove', onTouchMove, { passive: false });
    hit?.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    window.addEventListener('blur', onUp);
    return () => {
      hit?.removeEventListener('touchmove', onTouchMove);
      hit?.removeEventListener('wheel', onWheel);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      window.removeEventListener('blur', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [release]);

  const foot = footprint(design.orientation);
  return (
    <div ref={rootRef} className={styles.root} data-phone-up={phoneUp || undefined}>
      <div
        ref={hitRef}
        className={clsx(
          styles.hit,
          stateShown && (card.frozen || card.closed) && styles.hitInert,
          stateShown && card.frozen && styles.hitLocked,
        )}
        data-card-hit
        style={{ width: foot.w, height: foot.h, pointerEvents: inFlightNow || !introDone ? 'none' : 'auto' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => release(e.timeStamp)}
        onPointerCancel={(e) => release(e.timeStamp)}
        onLostPointerCapture={() => release(performance.now())}
        onPointerLeave={onPointerLeave}
        // Locked, in the phone: the whole card is the tap for its status.
        onClick={() => {
          if (inPhone() && card.frozen) card.setSheet('freeze');
        }}
      >
        <span className={styles.srOnly} role="img" aria-label={`${programNameOf(design)} card`} />
        <div className={clsx(styles.flatCard, dimmed && styles.canvasDimmed)}>
          <div ref={lookRef}>
            <FlatCard
              design={design}
              turnRef={turnRef}
              facesRef={facesRef}
              issued={issued}
              credentials={card.credentials}
              frozen={card.frozen}
              closed={card.closed}
              onPainted={onPainted}
            />
          </div>
        </div>
        {!introDone && <CardIntro ref={overlayRef} brand={programNameOf(design)} orientation={design.orientation} />}
        {stateShown && card.closed ? (
          <span className={styles.closedMark} aria-hidden>
            This card has been closed
          </span>
        ) : stateShown && card.frozen ? (
          <span className={styles.lockMark} aria-hidden>
            <AnimatedLock size={56} locking={false} locked />
          </span>
        ) : null}
        <span className={clsx(styles.hint, (dragged || !introDone || phoneUp || shareOpen) && styles.hintGone)} aria-hidden>
          <IconRotate360Right size={14} />
          Drag to turn it over
        </span>
      </div>
    </div>
  );
}
