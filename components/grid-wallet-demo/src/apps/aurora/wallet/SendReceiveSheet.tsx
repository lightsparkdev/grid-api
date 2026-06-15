'use client';

import { BottomSheet } from '@/apps/shared/BottomSheet';
import { ContentAreaButton } from '@/apps/shared/ContentAreaButton';
import { GlassSymbolButton, headerGlassBrightness, SHEET_GLASS } from '@/apps/shared/glass';
import { SfSymbol } from '@/apps/shared/icons';
import { useThemeMode } from '@/hooks/useThemeMode';
import styles from './SendReceiveSheet.module.scss';

interface SendReceiveSheetProps {
  open: boolean;
  onDismiss: () => void;
  /** Send tapped — parent swaps this sheet for the money sheet in send mode. */
  onSend: () => void;
}

/**
 * Figma 109:28513 — the "Send or receive" chooser, dressed in the auth
 * phone/email sheet's look (AuthSheet): a 64px gradient icon tile + glass X
 * header, a left-aligned title and subtitle, then the two bordered action
 * pills. Send chains into the money sheet; Receive is shown disabled (a demo
 * no-op until the deposit-address flow exists).
 */
export function SendReceiveSheet({ open, onDismiss, onSend }: SendReceiveSheetProps) {
  const theme = useThemeMode();
  return (
    <BottomSheet
      open={open}
      onDismiss={onDismiss}
      inset={16}
      topRadius={40}
      // Standard frost, tinted toward the wallet's #f9f9f9 on light — the same
      // float-sheet treatment as the auth sheet; dark unchanged.
      glass={{ ...SHEET_GLASS, tint: 'var(--float-sheet-tint)' }}
    >
      {/* Persistent header: the activity-row icon tile top-left, glass X top-right. */}
      <div className={styles.header}>
        <span className={styles.tile} aria-hidden>
          <SfSymbol name="arrow.up.arrow.down" size={28} />
        </span>
      </div>
      <span className={styles.close}>
        <GlassSymbolButton
          aria-label="Close"
          size={40}
          type="button"
          glass={{ brightness: headerGlassBrightness(theme) }}
          onClick={onDismiss}
        >
          <SfSymbol name="xmark" size={14} />
        </GlassSymbolButton>
      </span>

      <h2 className={styles.heading}>Send or receive</h2>
      <p className={styles.sub}>Move money to and from any bank account or wallet</p>

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
