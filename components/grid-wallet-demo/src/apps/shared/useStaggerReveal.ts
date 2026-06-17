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
const VISIBLE = { opacity: 1, y: 0, filter: 'blur(0px)' };

/**
 * Returns a `reveal(index)` helper that spreads motion props onto any element to
 * fade + lift + de-blur it in, staggered by its index. Works across separate
 * containers (no wrapper divs needed) and honors reduced-motion.
 *
 *   const reveal = useStaggerReveal();
 *   <motion.p {...reveal(0)}>Title</motion.p>
 *   <motion.p {...reveal(1)}>Subtitle</motion.p>
 */
export function useStaggerReveal({
  baseDelay = 0.06,
  stagger = 0.08,
  duration = 0.5,
}: StaggerRevealOptions = {}) {
  const reduceMotion = useReducedMotion();

  return (index: number) => {
    if (reduceMotion) {
      return { initial: false as const, animate: VISIBLE };
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
