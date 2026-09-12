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
const BODY =
  'M6 2.91L16.98 2.91C18.76 2.91 19.69 1.96 19.69 0.04L19.69-8.27C19.69-9.96 18.96-10.90 17.55-11.09L5.44-11.10C4.03-10.91 3.29-9.96 3.29-8.27L3.29 0.04C3.29 1.96 4.22 2.91 6 2.91Z';
/** The legs run on into the body; the body, drawn over them, hides the ends. */
const SHACKLE = 'M6.535-9L6.535-13.98A4.96 5.41 0 0 1 16.455-13.98L16.455-9';
const SHACKLE_WIDTH = 2.19;
/** The shackle swings about the foot of its left leg, at the body's top. */
const PIVOT_X = 6.535;
const PIVOT_Y = -11.1;

/** Open: the shackle, lifted clear of the body, swung out to the right. */
const SWING_FROM = 70;
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
  /** Play the locking on mount: the shackle swings in from the right, drops
   *  to engage, and the lock dips on impact. Off, the lock is at rest. */
  locking?: boolean;
}

/**
 * The lock, locking. SF Symbols' lock.fill as a body and a shackle: the
 * shackle starts swung out to the right and raised, swings to upright, drops
 * into the body, and the whole lock gives a little under the hit.
 */
export function AnimatedLock({ size = 24, className, locking = true }: AnimatedLockProps) {
  const reduceMotion = useReducedMotion();
  const play = locking && !reduceMotion;
  const whole = useRef<SVGGElement>(null);
  const shackle = useRef<SVGGElement>(null);
  const swing = useMotionValue(play ? SWING_FROM : 0);
  const lift = useMotionValue(play ? -LIFT : 0);
  const dip = useMotionValue(0);

  // The transforms are written by hand, in the symbol's own units, so the
  // pivot is a point on the glyph rather than a box's corner.
  useEffect(() => {
    const apply = () => {
      shackle.current?.setAttribute(
        'transform',
        `translate(${PIVOT_X} ${PIVOT_Y + lift.get()}) rotate(${swing.get()}) translate(${-PIVOT_X} ${-PIVOT_Y})`,
      );
      whole.current?.setAttribute('transform', `translate(0 ${dip.get()})`);
    };
    apply();
    const stop = [swing.on('change', apply), lift.on('change', apply), dip.on('change', apply)];
    return () => stop.forEach((off) => off());
  }, [swing, lift, dip]);

  useEffect(() => {
    if (!play) return;
    let cancelled = false;
    const run = async () => {
      await animate(swing, 0, SWING);
      if (cancelled) return;
      await animate(lift, 0, ENGAGE);
      if (cancelled) return;
      animate(dip, [0, DIP, 0], IMPACT);
    };
    run();
    return () => {
      cancelled = true;
      swing.stop();
      lift.stop();
      dip.stop();
    };
  }, [play, swing, lift, dip]);

  return (
    <svg className={clsx(styles.symbol, className)} viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <g ref={whole}>
        <g transform={SF_SYMBOL_PATHS['lock.fill'].transform}>
          <g ref={shackle}>
            <path d={SHACKLE} fill="none" stroke="currentColor" strokeWidth={SHACKLE_WIDTH} />
          </g>
          <path d={BODY} fill="currentColor" />
        </g>
      </g>
    </svg>
  );
}
