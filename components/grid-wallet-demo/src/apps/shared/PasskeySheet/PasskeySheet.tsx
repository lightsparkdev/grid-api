'use client';

import { BottomSheet } from '@/apps/shared/BottomSheet';
import { GlassSymbolButton, GlassTextButton } from '@/apps/shared/glass';
import { SfSymbol } from '@/apps/shared/icons';
import styles from './PasskeySheet.module.scss';

interface PasskeySheetProps {
  open: boolean;
  /** App display name iOS shows in the copy (e.g. "Aurora") — the only per-app
   *  variation; everything else is identical system chrome. */
  appName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Figma 2183:47617 — the iOS system passkey-registration sheet. SHARED across
 *  every skin: it's system chrome, so it looks identical (canonical iOS colors,
 *  pinned in the scss) regardless of brand — only the app name varies. */
export function PasskeySheet({ open, appName, onConfirm, onCancel }: PasskeySheetProps) {
  return (
    <BottomSheet open={open} onDismiss={onCancel}>
      <div className={styles.sheet}>
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
              &ldquo;{appName}&rdquo; supports passkeys, a stronger alternative to
              passwords that cannot be leaked or stolen. A passkey will be saved in
              &ldquo;Passwords&rdquo;.
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          <GlassTextButton variant="primary" onClick={onConfirm}>
            Add Passkey
          </GlassTextButton>
          <GlassTextButton variant="secondary" type="button">
            More Options
          </GlassTextButton>
        </div>
      </div>
    </BottomSheet>
  );
}
