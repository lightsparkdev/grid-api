'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { easeOutSnappy, motionTransition } from '@/lib/easing';
import { IconCrossMedium } from '../icons';
import { MARKETPLACE_SHEET_DURATION } from '../config';
import styles from './SendReceiveSheet.module.scss';

const SHEET_TRANSITION = motionTransition(easeOutSnappy, MARKETPLACE_SHEET_DURATION);

interface SendReceiveSheetProps {
  open: boolean;
  onDismiss: () => void;
  /** Send tapped — the sheet drops as the send flow pushes in. */
  onSend: () => void;
  /** Receive tapped — the sheet drops as the receive flow pushes in. */
  onReceive: () => void;
}

/**
 * "Send or receive" chooser — the Airbnb partial-height bottom sheet
 * (IMG_0630's chrome: centered bar title + X over a flat white card) carrying
 * Aurora's chooser content: the subtitle and the two action pills. Dim only,
 * no stack recede (iOS partial sheets don't scale the presenter).
 */
export function SendReceiveSheet({ open, onDismiss, onSend, onReceive }: SendReceiveSheetProps) {
  const reduceMotion = useReducedMotion();
  const clip = useSquircleClip<HTMLDivElement>({ figmaRadii: [24, 24, 0, 0] });
  const sendClip = useSquircleClip<HTMLButtonElement>({ figmaRadii: 12 });
  const receiveClip = useSquircleClip<HTMLButtonElement>({ figmaRadii: 12 });

  return (
    <>
      <motion.div
        className={styles.scrim}
        aria-hidden
        initial={false}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: MARKETPLACE_SHEET_DURATION, ease: 'easeOut' }}
        style={{ pointerEvents: open ? 'auto' : 'none' }}
        onClick={onDismiss}
      />
      <motion.div
        className={styles.layer}
        initial={false}
        animate={{ y: open ? 0 : '110%' }}
        transition={reduceMotion ? { duration: 0 } : SHEET_TRANSITION}
        style={{ pointerEvents: open ? 'auto' : 'none' }}
        aria-hidden={!open}
      >
        <div ref={clip.ref} style={clip.style} className={styles.sheet}>
          <header className={styles.headerBar}>
            <span className={styles.barTitle}>Send or receive</span>
            <button
              type="button"
              className={styles.closeBtn}
              aria-label="Close"
              onClick={onDismiss}
            >
              <IconCrossMedium size={24} />
            </button>
          </header>
          <p className={styles.sub}>Move money to and from any bank account or wallet</p>
          <div className={styles.actions}>
            <button
              type="button"
              ref={sendClip.ref}
              style={sendClip.style}
              className={styles.actionBtn}
              onClick={onSend}
            >
              Send
            </button>
            <button
              type="button"
              ref={receiveClip.ref}
              style={receiveClip.style}
              className={styles.actionBtn}
              onClick={onReceive}
            >
              Receive
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
