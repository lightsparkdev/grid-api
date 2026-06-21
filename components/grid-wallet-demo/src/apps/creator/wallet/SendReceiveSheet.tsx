'use client';

import { BottomSheet } from '@/apps/shared/BottomSheet';
import { ContentAreaButton } from '@/apps/shared/ContentAreaButton';
import { SfSymbol } from '@/apps/shared/icons';
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
 * Figma 109:28513 — the "Send or receive" chooser, dressed in the auth
 * phone/email sheet's look (AuthSheet): a 64px gradient icon tile + glass X
 * header, a left-aligned title and subtitle, then the two bordered action
 * pills. Send chains into the money sheet; Receive opens the deposit list.
 */
export function SendReceiveSheet({ open, onDismiss, onSend, onReceive }: SendReceiveSheetProps) {
  return (
    <BottomSheet
      open={open}
      onDismiss={onDismiss}
      glass={CREATOR_FLAT_SHEET}
    >
      {/* Persistent header: the activity-row icon tile top-left, glass X top-right. */}
      <div className={styles.header}>
        <span className={styles.tile} aria-hidden>
          <SfSymbol name="arrow.up.arrow.down" size={28} />
        </span>
      </div>
      <span className={styles.close}>
        <SheetIconButton
          aria-label="Close"
          size={40}
          type="button"
          ghost
          onClick={onDismiss}
        >
          <IconCrossMedium size={24} />
        </SheetIconButton>
      </span>

      <h2 className={styles.heading}>Send or receive</h2>
      <p className={styles.sub}>Move money to and from any bank account or wallet</p>

      <div className={styles.actions}>
        <ContentAreaButton type="button" variant="bordered" onClick={onSend}>
          Send
        </ContentAreaButton>
        <ContentAreaButton type="button" variant="bordered" onClick={onReceive}>
          Receive
        </ContentAreaButton>
      </div>
    </BottomSheet>
  );
}
