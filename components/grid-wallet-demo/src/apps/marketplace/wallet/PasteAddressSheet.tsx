'use client';

import { motion, useReducedMotion } from 'motion/react';
import { SEND_NETWORKS, truncateAddress, type MoneySheet } from '@/apps/shared/wallet';
import { useRegisterSheet } from '@/apps/shared/SheetPresentation';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { easeOutSnappy, motionTransition } from '@/lib/easing';
import { IconCrossMedium } from '../icons';
import { MARKETPLACE_SHEET_DURATION } from '../config';
import { StickerTile } from '../blocks/FlagTile';
import styles from './PasteAddressSheet.module.scss';

const SHEET_TRANSITION = motionTransition(easeOutSnappy, MARKETPLACE_SHEET_DURATION);

/** Registers with the presentation stage so the nav stack scales down. */
function SheetPresenter({ on }: { on: boolean }) {
  useRegisterSheet(on);
  return null;
}

interface PasteAddressSheetProps {
  m: MoneySheet;
  open: boolean;
  onDismiss: () => void;
}

/**
 * "Paste address" — Aurora's clipboard sheet in the Airbnb voice: a partial-
 * height bottom sheet with the iOS STACK effect (the send flow scales down and
 * recedes behind it — the pageSheet mechanic, at chooser-sheet height).
 * Framed as a paste affordance: each row is a Receive chain's address; tapping
 * one drops it into the recipient card with that network's currency + type.
 */
export function PasteAddressSheet({ m, open, onDismiss }: PasteAddressSheetProps) {
  const reduceMotion = useReducedMotion();
  const clip = useSquircleClip<HTMLDivElement>({ figmaRadii: [24, 24, 0, 0] });

  return (
    <>
      <SheetPresenter on={open} />

      {/* Presentation scrim over the receded stack (the shared token). */}
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
            <span className={styles.barTitle}>Paste address</span>
            <button
              type="button"
              className={styles.closeBtn}
              aria-label="Close"
              onClick={onDismiss}
            >
              <IconCrossMedium size={24} />
            </button>
          </header>
          <div className={styles.list}>
            {SEND_NETWORKS.map((net) => (
              <button
                key={net.id}
                type="button"
                className={styles.row}
                onClick={() => m.pickNetwork(net)}
              >
                <StickerTile>
                  <img className={styles.netLogo} src={net.logo} alt="" draggable={false} />
                </StickerTile>
                <span className={styles.rowLines}>
                  <span className={styles.rowTitle}>{truncateAddress(net.address)}</span>
                  <span className={styles.rowSub}>{net.name} wallet</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}
