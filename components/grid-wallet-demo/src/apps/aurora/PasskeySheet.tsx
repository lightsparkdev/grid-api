'use client';

import type { ReactNode } from 'react';
import { BottomSheet } from '@/apps/shared/BottomSheet';
import { GlassSymbolButton, GlassTextButton } from '@/apps/shared/glass';
import { SfSymbol } from '@/apps/shared/icons';
import styles from './PasskeySheet.module.scss';

interface PasskeySheetProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Copy of the screen behind the sheet, for the glass to refract. */
  behind?: ReactNode;
}

/** Figma 2183:47617 — passkey registration bottom sheet. */
export function PasskeySheet({ open, onConfirm, onCancel, behind }: PasskeySheetProps) {
  return (
    <BottomSheet open={open} onDismiss={onCancel} behind={behind}>
      <div className={styles.toolbar}>
        <GlassSymbolButton aria-label="Close" onClick={onCancel}>
          <SfSymbol name="xmark" size={17} />
        </GlassSymbolButton>
      </div>

      <div className={styles.body}>
        <SfSymbol name="faceid" size={48} className={styles.faceIcon} />
        <div className={styles.copy}>
          <h2 className={styles.title}>Save a passkey?</h2>
          <p className={styles.description}>
            &ldquo;passkeys.io&rdquo; supports passkeys, a stronger alternative to
            passwords that cannot be leaked or stolen. A passkey will be saved in
            &ldquo;Passwords&rdquo;.
          </p>
        </div>
      </div>

      <div className={styles.actions}>
        <GlassTextButton variant="primary" onClick={onConfirm}>
          Add Passkey
        </GlassTextButton>
        <GlassTextButton variant="secondary" onClick={onCancel}>
          More Options
        </GlassTextButton>
      </div>
    </BottomSheet>
  );
}
