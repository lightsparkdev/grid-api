'use client';

import { BottomSheet } from '@/apps/shared/BottomSheet';
import { ContentAreaButton } from '@/apps/shared/ContentAreaButton';
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconCrossMedium';
import { SheetIconButton } from '../blocks/SheetIconButton';
import { CREATOR_FLAT_SHEET } from '../glass-presets';
import styles from './SendReceiveSheet.module.scss';

interface SendReceiveSheetProps {
  open: boolean;
  onDismiss: () => void;
  /** Send tapped — parent swaps this sheet for the money sheet in send mode. */
  onSend: () => void;
  /** Receive tapped — parent swaps this sheet for the deposit list. */
  onReceive: () => void;
}

/**
 * Figma 109:28513 — the "Send or receive" chooser, dressed in the email/phone
 * auth sheet's look (AuthSheet): a left-aligned title + ghost close row, a
 * subtitle, then the two bordered action pills. Send chains into the money
 * sheet; Receive opens the deposit list.
 */
export function SendReceiveSheet({ open, onDismiss, onSend, onReceive }: SendReceiveSheetProps) {
  return (
    <BottomSheet
      open={open}
      onDismiss={onDismiss}
      glass={CREATOR_FLAT_SHEET}
      // Match the auth sheet's 24px top corners (scoped; preset untouched).
      topRadius={24}
      // Small chooser sheet — don't scale the whole screen back behind it (the
      // stacked-sheet effect is reserved for the big money sheets).
      scalesBackground={false}
    >
      {/* Title + ghost close in one row — matches the email/phone auth sheet. */}
      <div className={styles.titleRow}>
        <h2 className={styles.title}>Transfer</h2>
        <SheetIconButton
          className={styles.closeBtn}
          aria-label="Close"
          size={40}
          type="button"
          ghost
          onClick={onDismiss}
        >
          <IconCrossMedium size={24} />
        </SheetIconButton>
      </div>
      <p className={styles.sub}>Move money to and from any bank account or wallet</p>

      <div className={styles.actions}>
        <ContentAreaButton
          type="button"
          variant="secondary"
          className={styles.choiceBtn}
          onClick={onSend}
        >
          Send
        </ContentAreaButton>
        <ContentAreaButton
          type="button"
          variant="secondary"
          className={styles.choiceBtn}
          onClick={onReceive}
        >
          Receive
        </ContentAreaButton>
      </div>
    </BottomSheet>
  );
}
