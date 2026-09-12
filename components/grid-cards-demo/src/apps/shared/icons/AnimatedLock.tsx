'use client';

import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { animate, useMotionValue, useReducedMotion } from 'motion/react';
import { easeOutSnappy, motionTransition } from '@/lib/easing';
import { SF_SYMBOL_PATHS } from './sfSymbolPaths';
import styles from './SfSymbol.module.scss';

// SF Symbols' lock.fill, in two parts. The symbol is one outline; these are its
// body (the outline below the shackle's legs, closed along the top) and its
// shackle (a stroke down the middle of the outline's inverted U: legs at the
// outline's leg centers, the arc through the middle of its crown), in the same
// coordinates, placed by the same transform, so at rest they are the symbol.
// As on a padlock, the shackle's right leg is the fixed one: long, it stays
// in the body however far the shackle lifts (the body, drawn over it, hides
// its end). The left leg is the free one: short, it reaches the body's top
// and no further, so raised it hangs clear.
const BODY =
  'M6 2.91L16.98 2.91C18.76 2.91 19.69 1.96 19.69 0.04L19.69-8.27C19.69-9.96 18.96-10.90 17.55-11.09L5.44-11.10C4.03-10.91 3.29-9.96 3.29-8.27L3.29 0.04C3.29 1.96 4.22 2.91 6 2.91Z';
const SHACKLE = 'M6.535-11.1L6.535-13.98A4.96 5.41 0 0 1 16.455-13.98L16.455-4';
const SHACKLE_WIDTH = 2.19;
/** The fixed leg's line: the shackle turns about it. */
const AXIS_X = 16.455;

/** Open: the shackle lifted clear of the body and turned half way round its
 *  fixed leg, so the free leg hangs off the body's right side (SF Symbols'
 *  lock.open.fill has it there). The turn is about a vertical axis, seen
 *  head on: the shackle's reach from that leg scales by the cosine, edge-on
 *  at a quarter turn. */
const TURN_FROM = 180;
const LIFT = 4;
/** The impact: the whole lock dips this far (viewBox units) and comes back. */
const DIP = 1.6;

const SWING = motionTransition(easeOutSnappy, 0.42, { delay: 0.22 });
/** The drop gathers speed into the body: an ease-in. */
const ENGAGE = motionTransition([0.4, 0, 1, 1], 0.12);
const IMPACT = motionTransition(easeOutSnappy, 0.34);

interface AnimatedLockProps {
  size?: number;
  className?: string;
  /** Play the locking on mount: the shackle turns in from the right, drops
   *  to engage, and the lock dips on impact. Off, the lock is at rest. */
  locking?: boolean;
}

/**
 * The lock, locking. SF Symbols' lock.fill as a body and a shackle: the
 * shackle starts raised and turned round its fixed leg, its free leg hanging
 * off to the right; it turns back over the body, drops in, and the whole lock
 * gives a little under the hit.
 */
export function AnimatedLock({ size = 24, className, locking = true }: AnimatedLockProps) {
  const reduceMotion = useReducedMotion();
  const play = locking && !reduceMotion;
  const whole = useRef<SVGGElement>(null);
  const shackle = useRef<SVGGElement>(null);
  const turn = useMotionValue(play ? TURN_FROM : 0);
  const lift = useMotionValue(play ? -LIFT : 0);
  const dip = useMotionValue(0);

  // The transforms are written by hand, in the symbol's own units, so the
  // axis is a line on the glyph rather than a box's edge.
  useEffect(() => {
    const apply = () => {
      const reach = Math.cos((turn.get() * Math.PI) / 180);
      shackle.current?.setAttribute(
        'transform',
        `translate(${AXIS_X} ${lift.get()}) scale(${reach.toFixed(4)} 1) translate(${-AXIS_X} 0)`,
      );
      whole.current?.setAttribute('transform', `translate(0 ${dip.get()})`);
    };
    apply();
    const stop = [turn.on('change', apply), lift.on('change', apply), dip.on('change', apply)];
    return () => stop.forEach((off) => off());
  }, [turn, lift, dip]);

  useEffect(() => {
    if (!play) return;
    let cancelled = false;
    const run = async () => {
      await animate(turn, 0, SWING);
      if (cancelled) return;
      await animate(lift, 0, ENGAGE);
      if (cancelled) return;
      animate(dip, [0, DIP, 0], IMPACT);
    };
    run();
    return () => {
      cancelled = true;
      turn.stop();
      lift.stop();
      dip.stop();
    };
  }, [play, turn, lift, dip]);

  return (
    <svg
      className={clsx(styles.symbol, className)}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      // Turned out, the shackle reaches past the symbol's box.
      style={{ overflow: 'visible' }}
      aria-hidden
    >
      <g ref={whole}>
        <g transform={SF_SYMBOL_PATHS['lock.fill'].transform}>
          <g ref={shackle}>
            <path d={SHACKLE} fill="none" stroke="currentColor" strokeWidth={SHACKLE_WIDTH} strokeLinecap="round" />
          </g>
          <path d={BODY} fill="currentColor" />
        </g>
      </g>
    </svg>
  );
}
