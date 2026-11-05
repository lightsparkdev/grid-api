import type { ReactNode } from 'react';
import { AnimatePresence, motion, type Transition } from 'motion/react';
import styles from './sheet.module.scss';

/** iOS sheet dismiss: quicker than the present, easing in as it leaves. */
const DISMISS: Transition = { duration: 0.32, ease: [0.32, 0, 0.67, 0] };

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
