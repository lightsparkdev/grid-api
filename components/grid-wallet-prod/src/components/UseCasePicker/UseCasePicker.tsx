'use client';

import Image from 'next/image';
import clsx from 'clsx';
import { LayoutGroup, motion, useAnimationControls, useMotionValue, useSpring } from 'motion/react';
import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { USE_CASES, type UseCaseId } from '@/data/configure';
import { easeOutSwift, motionTransition } from '@/lib/easing';
import styles from './UseCasePicker.module.scss';

interface UseCasePickerProps {
  selected: UseCaseId;
  onSelect: (id: UseCaseId) => void;
}

// The "Coming soon" tag trails the cursor (spring lag) while hovering a tile
// that isn't built yet, and flicks off + falls when you click it.
const TAG_OFFSET_X = 14;
const TAG_OFFSET_Y = 16;
const TAG_SPRING = { stiffness: 300, damping: 26, mass: 0.7 };
const TAG_EASE = [0.25, 0.1, 0.25, 1] as const;
// After a tag is flicked off, hold the live tag back this long before it can
// reappear — so you don't see a fresh tag while the old one is still falling.
// Roughly the fall duration; bump it up for a longer pause.
const TAG_REAPPEAR_DELAY = 700;
// Hidden = collapsed back at the cursor; shown = popped out to the offset. Tweening
// between them (with a top-left origin) makes the tag emerge/retract diagonally
// from the cursor.
const TAG_HIDDEN = { opacity: 0, scale: 0.5, x: -TAG_OFFSET_X, y: -TAG_OFFSET_Y };
const TAG_SHOWN = { opacity: 1, scale: 1, x: 0, y: 0 };

interface Faller {
  id: number;
  x: number;
  y: number;
}

/**
 * One flicked-off tag: pinned at its click point (x, y) and falling under
 * gravity, then it removes itself. Each click spawns its own, so rapid clicks
 * across tiles all fall from the right spot and can be airborne at once.
 */
function FallingTag({ x, y, onDone }: { x: number; y: number; onDone: () => void }) {
  const controls = useAnimationControls();
  useEffect(() => {
    let raf = 0;
    let vx = Math.random() * 50;
    let vy = -(120 + Math.random() * 80);
    const vr = -15 + Math.random() * 145;
    const gravity = 900;
    let px = 0;
    let py = 0;
    let r = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.04);
      last = now;
      vy += gravity * dt;
      px += vx * dt;
      py += vy * dt;
      r += vr * dt;
      const opacity = Math.max(0, 1 - Math.max(0, py) / 160);
      controls.set({ x: px, y: py, rotate: r, opacity, scale: 1 });
      if (opacity > 0) raf = requestAnimationFrame(step);
      else onDone();
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.comingSoonAnchor} style={{ left: x, top: y }} aria-hidden>
      <motion.div className={styles.comingSoonTag} initial={{ opacity: 1, scale: 1 }} animate={controls}>
        Coming soon
      </motion.div>
    </div>
  );
}

export function UseCasePicker({ selected, onSelect }: UseCasePickerProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Live cursor-following tag (shown over not-built tiles, trails with spring lag).
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const x = useSpring(mx, TAG_SPRING);
  const y = useSpring(my, TAG_SPRING);
  const tag = useAnimationControls();
  const overUnbuilt = useRef(false);
  const lastClient = useRef({ x: -1, y: -1 });
  // Touch/pen have no hover model, so the cursor-following tag would get stranded
  // on screen (revealed with nothing to dismiss it). Track whether the active
  // pointer is a mouse and gate the follow + auto-reappear on it.
  const pointerIsMouse = useRef(true);
  // While a tag is mid-fall, hold the live tag back so it doesn't reappear over
  // the falling one (the "pause").
  const suppressed = useRef(false);
  const suppressTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(suppressTimer.current), []);

  // Flicked-off copies, each falling independently from its own click point.
  const [fallers, setFallers] = useState<Faller[]>([]);
  const fallerId = useRef(0);

  // Comes out with a swift-out (slight overshoot); retracts on the plain ease.
  const showTag = () =>
    tag.start({ ...TAG_SHOWN, transition: { duration: 0.28, ease: easeOutSwift } });
  const hideTag = () =>
    tag.start({ ...TAG_HIDDEN, transition: { duration: 0.2, ease: TAG_EASE } });

  // Pop the tag in AT the cursor (jump there so it emerges from the point, no
  // spring fly-in), then it trails with the spring.
  const reveal = (cx: number, cy: number) => {
    const px = cx + TAG_OFFSET_X;
    const py = cy + TAG_OFFSET_Y;
    x.jump(px);
    y.jump(py);
    mx.set(px);
    my.set(py);
    overUnbuilt.current = true;
    showTag();
  };

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    pointerIsMouse.current = e.pointerType === 'mouse';
    // Touch/pen have no hover, so the follow tag would never get dismissed — skip it.
    if (!pointerIsMouse.current) return;
    lastClient.current = { x: e.clientX, y: e.clientY };
    const over = Boolean((e.target as Element).closest?.('[data-unbuilt]'));
    if (over && !overUnbuilt.current && !suppressed.current) {
      reveal(e.clientX, e.clientY);
    } else if (!over && overUnbuilt.current) {
      overUnbuilt.current = false;
      hideTag();
    }
    mx.set(e.clientX + TAG_OFFSET_X);
    my.set(e.clientY + TAG_OFFSET_Y);
  };

  // A tap can fire no pointermove, so capture the pointer kind on press too — the
  // click handler uses it to run the auto-reappear on mouse only.
  const handleDown = (e: PointerEvent<HTMLDivElement>) => {
    pointerIsMouse.current = e.pointerType === 'mouse';
  };

  const handleLeave = () => {
    overUnbuilt.current = false;
    hideTag();
  };

  // Clicking a not-built tile flicks a copy off from the EXACT click point (so
  // rapid clicks across tiles each fall from the right spot) and hides the live
  // tag instantly — it re-shows on the next cursor move.
  const dropTag = (e: MouseEvent<HTMLButtonElement>) => {
    const id = (fallerId.current += 1);
    const fx = e.clientX + TAG_OFFSET_X;
    const fy = e.clientY + TAG_OFFSET_Y;
    setFallers((list) => [...list, { id, x: fx, y: fy }]);
    overUnbuilt.current = false;
    tag.set(TAG_HIDDEN);
    // Touch/pen: no hover, so the auto-reappear below would re-show the tag at the
    // stale tap point with nothing to dismiss it (it sticks on screen). The flicked
    // copy still falls; we just don't bring the live tag back.
    if (!pointerIsMouse.current) return;
    // Pause: hold the live tag back until the flicked-off one has (mostly) fallen.
    suppressed.current = true;
    clearTimeout(suppressTimer.current);
    suppressTimer.current = setTimeout(() => {
      suppressed.current = false;
      // If the cursor is still resting on a not-built tile, bring the tag back
      // automatically — no need to jiggle the mouse.
      const { x: cx, y: cy } = lastClient.current;
      if (cx >= 0 && document.elementFromPoint(cx, cy)?.closest('[data-unbuilt]')) {
        reveal(cx, cy);
      }
    }, TAG_REAPPEAR_DELAY);
  };

  const removeFaller = (id: number) => setFallers((list) => list.filter((f) => f.id !== id));

  return (
    <LayoutGroup>
      <div
        className={styles.group}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
      >
        {USE_CASES.map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              className={clsx(styles.card, isSelected && styles.cardSelected)}
              // Built selects; not-built flicks the "Coming soon" tag off (a no-op
              // for selection, so the active indicator stays put).
              onClick={opt.built ? () => onSelect(opt.id) : dropTag}
              data-unbuilt={!opt.built || undefined}
              disabled={!opt.enabled}
              aria-pressed={isSelected}
            >
              {isSelected ? (
                <motion.span
                  layoutId="use-case-active-ring"
                  className={styles.activeRing}
                  transition={motionTransition(undefined, 0.22)}
                  aria-hidden
                />
              ) : null}
              <span className={styles.content}>
                <Image src={opt.iconSrc} alt="" width={48} height={48} className={styles.icon} />
                <span className={styles.label}>{opt.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      {mounted &&
        createPortal(
          <>
            <motion.div className={styles.comingSoonAnchor} style={{ x, y }} aria-hidden>
              <motion.div
                className={styles.comingSoonTag}
                style={{ transformOrigin: 'top left' }}
                initial={TAG_HIDDEN}
                animate={tag}
              >
                Coming soon
              </motion.div>
            </motion.div>
            {fallers.map((f) => (
              <FallingTag key={f.id} x={f.x} y={f.y} onDone={() => removeFaller(f.id)} />
            ))}
          </>,
          document.body,
        )}
    </LayoutGroup>
  );
}
