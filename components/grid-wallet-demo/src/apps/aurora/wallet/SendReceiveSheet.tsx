'use client';

import { BottomSheet } from '@/apps/shared/BottomSheet';
import { ContentAreaButton } from '@/apps/shared/ContentAreaButton';
import { SHEET_GLASS } from '@/apps/shared/glass';
import { SfSymbol } from '@/apps/shared/icons';
import styles from './SendReceiveSheet.module.scss';

interface SendReceiveSheetProps {
  open: boolean;
  onDismiss: () => void;
  /** Send tapped — parent swaps this sheet for the money sheet in send mode. */
  onSend: () => void;
}

/**
 * Figma 109:28513 — the "Send or receive" chooser: a small floating frosted
 * sheet (the auth flow's inset-6 frost, not the solid money sheet) with a
 * symbol title, a two-line subtitle, and two large bordered actions. No
 * toolbar — the scrim dismisses. Send chains into the money sheet; Receive
 * is shown disabled (a demo no-op until the deposit-address flow exists).
 */
export function SendReceiveSheet({ open, onDismiss, onSend }: SendReceiveSheetProps) {
  return (
    <BottomSheet
      open={open}
      onDismiss={onDismiss}
      inset={8}
      topRadius={40}
      // Standard frost, but tinted toward the wallet's #f9f9f9 on light (the
      // shared sheet tint reads cooler against this screen); dark unchanged.
      glass={{ ...SHEET_GLASS, tint: 'var(--float-sheet-tint)' }}
    >
      <div className={styles.titleGroup}>
        <h2 className={styles.title}>
          <SfSymbol name="arrow.up.arrow.down" size={22} className={styles.titleSymbol} />
          Send or receive
        </h2>
        <p className={styles.subtitle}>
          Move money to and from any
          <br />
          bank account or wallet
        </p>
      </div>

      <div className={styles.actions}>
        <ContentAreaButton type="button" variant="bordered" onClick={onSend}>
          Send
        </ContentAreaButton>
        <ContentAreaButton
          type="button"
          variant="bordered"
          className={styles.receiveBtn}
          disabled
        >
          Receive
        </ContentAreaButton>
      </div>
    </BottomSheet>
  );
}
