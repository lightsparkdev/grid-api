import { useCallback, useRef, type ReactNode } from 'react';
import { AnimatePresence, motion, type Transition } from 'motion/react';
import { PHONE_SHELL_GLASS, squirclePath } from '@/components/liquid-glass';
import styles from './sheet.module.scss';

/** iOS sheet dismiss: quicker than the present, easing in as it leaves. */
const DISMISS: Transition = { duration: 0.32, ease: [0.32, 0, 0.67, 0] };

/** Where `el` sits inside `root`, by layout (the present's transform doesn't move it). */
function offsetWithin(el: HTMLElement, root: HTMLElement) {
  let x = 0;
  let y = 0;
  let e: HTMLElement | null = el;
  while (e && e !== root) {
    x += e.offsetLeft;
    y += e.offsetTop;
    e = e.offsetParent as HTMLElement | null;
  }
  return e === root ? { x, y } : null;
}

/**
 * The sheet's foot follows the screen's own corner: the screen is clipped to a superellipse (AppShell), which no
 * border-radius can draw everywhere, so the surface (the panel's first child) is clipped to the same curve, tightened
 * by however far it sits in from the screen's edge. Its CSS bottom corners go square underneath, since a clip only
 * takes paint away. Its top corners keep the surface's own radius.
 */
function fitFoot(surface: HTMLElement) {
  const screen = surface.closest<HTMLElement>('[data-screen-body]');
  const at = screen && offsetWithin(surface, screen);
  if (!screen || !at) return;
  const cs = getComputedStyle(surface);
  const screenRadius = parseFloat(cs.getPropertyValue('--screen-corner-radius'));
  const w = surface.offsetWidth;
  const h = surface.offsetHeight;
  const inset = Math.min(at.x, screen.clientWidth - at.x - w, screen.clientHeight - at.y - h);
  if (!(screenRadius > inset) || inset < 0) return;
  const top = parseFloat(cs.borderTopLeftRadius) || 0;
  const foot = screenRadius - inset;
  surface.style.borderBottomLeftRadius = '0px';
  surface.style.borderBottomRightRadius = '0px';
  surface.style.clipPath = `path('${squirclePath(w, h, [top, top, foot, foot], PHONE_SHELL_GLASS.cornerSmoothing)}')`;
}

function useFootFit() {
  const stop = useRef<(() => void) | null>(null);
  return useCallback((panel: HTMLDivElement | null) => {
    stop.current?.();
    stop.current = null;
    if (!panel) return;
    const sizes = new ResizeObserver(() => {
      if (panel.firstElementChild instanceof HTMLElement) fitFoot(panel.firstElementChild);
    });
    const watch = () => {
      sizes.disconnect();
      const surface = panel.firstElementChild;
      if (!(surface instanceof HTMLElement)) return;
      fitFoot(surface);
      sizes.observe(surface);
    };
    const swaps = new MutationObserver(watch);
    swaps.observe(panel, { childList: true });
    watch();
    stop.current = () => {
      swaps.disconnect();
      sizes.disconnect();
    };
  }, []);
}

/**
 * A sheet over the chat: the screen dims and the panel rises from below.
 * Each app brings its own panel (Grok's large sheet, Dots' floating card) and
 * its own present curve, fitted from its recording.
 */
export function AppSheet({
  open,
  onDismiss,
  present,
  dim = 0.23,
  className,
  children,
}: {
  open: boolean;
  onDismiss?: () => void;
  present: Transition;
  /** Black over the screen while the sheet is up (Dots measured 23%). */
  dim?: number;
  className?: string;
  children: ReactNode;
}) {
  const foot = useFootFit();
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="dim"
          className={styles.dim}
          style={{ background: `rgba(0, 0, 0, ${dim})` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.3 } }}
          exit={{ opacity: 0, transition: DISMISS }}
          onClick={onDismiss}
        />
      )}
      {open && (
        <motion.div
          key="sheet"
          ref={foot}
          role="dialog"
          className={`${styles.sheet} ${className ?? ''}`}
          initial={{ y: '105%' }}
          animate={{ y: 0, transition: present }}
          exit={{ y: '105%', transition: DISMISS }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
