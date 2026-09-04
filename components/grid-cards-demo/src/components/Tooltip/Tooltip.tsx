'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useState, type FocusEvent, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './Tooltip.module.scss';

interface Anchor {
  x: number;
  y: number;
}

/** The handlers a target spreads to show and hide its tooltip. */
export interface TooltipTargetProps {
  onMouseEnter: (e: MouseEvent<HTMLElement>) => void;
  onMouseLeave: () => void;
  onFocus: (e: FocusEvent<HTMLElement>) => void;
  onBlur: () => void;
}

/**
 * A small glass label above a target on hover or focus, the Flow Builder's
 * tooltip (grid-visualizer FlowPanel): fixed to the viewport in a portal,
 * so it escapes the tile's overflow clip, and it rises in over 150 ms. Render
 * prop, so the target keeps its own element and layout.
 */
export function Tooltip({ text, children }: { text: string; children: (target: TooltipTargetProps) => ReactNode }) {
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const show = useCallback((el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    setAnchor({ x: r.left + r.width / 2, y: r.top });
  }, []);
  const hide = useCallback(() => setAnchor(null), []);
  const target: TooltipTargetProps = {
    onMouseEnter: (e) => show(e.currentTarget),
    onMouseLeave: hide,
    onFocus: (e) => show(e.currentTarget),
    onBlur: hide,
  };
  return (
    <>
      {children(target)}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {anchor && (
              <div className={styles.anchor} style={{ left: anchor.x, top: anchor.y }} role="tooltip">
                <motion.div
                  className={styles.tip}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                >
                  {text}
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
