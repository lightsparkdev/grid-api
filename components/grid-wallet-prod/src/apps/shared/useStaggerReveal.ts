'use client';

import { useReducedMotion } from 'motion/react';
import { easeOutSnappy } from '@/lib/easing';

interface StaggerRevealOptions {
  /** Delay before the first item starts (seconds). */
  baseDelay?: number;
  /** Gap between consecutive items (seconds). */
  stagger?: number;
  /** Per-item duration (seconds). */
  duration?: number;
}

const HIDDEN = { opacity: 0, y: 12, filter: 'blur(8px)' };
// transitionEnd strips the resting blur(0px): a lingering filter keeps the
// element on a separate rasterization path, so its shadows/gradients render
// a hair differently whenever an ancestor animates group opacity (a visible
// shimmer in an otherwise pixel-identical crossfade) — and it forces WebKit
// to composite the whole subtree through the filter path.
const VISIBLE = {
  opacity: 1,
  y: 0,
  filter: 'blur(0px)',
  transitionEnd: { filter: 'none' as const },
};

/**
 * Returns a `reveal(index)` helper that spreads motion props onto any element to
 * fade + lift + de-blur it in, staggered by its index. Works across separate
 * containers (no wrapper divs needed) and honors reduced-motion.
 *
 *   const reveal = useStaggerReveal();
 *   <motion.p {...reveal(0)}>Title</motion.p>
 *   <motion.p {...reveal(1)}>Subtitle</motion.p>
 *
 * `reveal(index, held)` — while `held` is true the item PARKS in the hidden
 * pose instead of playing; flipping it false releases the cascade. Lets a
 * mounted layer (e.g. an auth-screen backdrop) hold its entrance until a
 * choreography beat — a sheet dismissal — cues it. No-op under reduced motion.
 */
export function useStaggerReveal({
  baseDelay = 0.06,
  stagger = 0.08,
  duration = 0.5,
}: StaggerRevealOptions = {}) {
  const reduceMotion = useReducedMotion();

  return (index: number, held = false) => {
    if (reduceMotion) {
      return { initial: false as const, animate: VISIBLE };
    }
    if (held) {
      return { initial: HIDDEN, animate: HIDDEN };
    }
    return {
      initial: HIDDEN,
      animate: VISIBLE,
      transition: {
        duration,
        ease: [...easeOutSnappy] as [number, number, number, number],
        delay: baseDelay + index * stagger,
      },
    };
  };
}
