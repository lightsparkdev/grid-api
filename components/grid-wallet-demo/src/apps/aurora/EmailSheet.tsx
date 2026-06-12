'use client';

import { useEffect, useRef, useState } from 'react';
import { BottomSheet } from '@/apps/shared/BottomSheet';
import {
  GlassSymbolButton,
  GlassTextButton,
  headerGlassBrightness,
  SHEET_GLASS,
} from '@/apps/shared/glass';
import { SfSymbol } from '@/apps/shared/icons';
import { useThemeMode } from '@/hooks/useThemeMode';
import styles from './EmailSheet.module.scss';

interface EmailSheetProps {
  open: boolean;
  onSubmit: (email: string) => void;
  onCancel?: () => void;
}

/** Floating (inset) email-entry sheet — Figma 2191:48065. Bottom corners hug the
 *  phone screen; title + subtitle + white input card + glass Continue button. */
export function EmailSheet({ open, onSubmit, onCancel }: EmailSheetProps) {
  const theme = useThemeMode();
  const inputRef = useRef<HTMLInputElement>(null);
  // Focus WITHOUT scrolling — the `autoFocus` attribute scroll-into-views while
  // the sheet is still translated below the screen edge, which scrolls the
  // clipped phone screen up and shoves the whole layout off.
  useEffect(() => {
    if (open) inputRef.current?.focus({ preventScroll: true });
  }, [open]);
  const [email, setEmail] = useState('');
  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
  const submit = () => {
    if (valid) onSubmit(email.trim());
  };

  return (
    <BottomSheet
      open={open}
      onDismiss={onCancel ?? (() => {})}
      inset={8}
      topRadius={40}
      // Same float-sheet treatment as the send/receive picker.
      glass={{ ...SHEET_GLASS, tint: 'var(--float-sheet-tint)' }}
    >
      {/* Multi-step header: left-aligned title row with a glass X — steps swap
          the title while the control stays put. */}
      <div className={styles.title}>
        <div className={styles.headerRow}>
          <h2 className={styles.heading}>Enter your email</h2>
          <GlassSymbolButton
            aria-label="Close"
            size={40}
            type="button"
            glass={{ brightness: headerGlassBrightness(theme) }}
            onClick={onCancel}
          >
            <SfSymbol name="xmark" size={14} />
          </GlassSymbolButton>
        </div>
        <p className={styles.sub}>We&rsquo;ll send you a one-time code to log in</p>
      </div>

      <div className={styles.cardContainer}>
        <div className={styles.card}>
          <input
            ref={inputRef}
            className={styles.input}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
            }}
          />
        </div>
      </div>

      <div className={styles.actions}>
        <GlassTextButton variant="primary" disabled={!valid} onClick={submit}>
          Continue
        </GlassTextButton>
      </div>
    </BottomSheet>
  );
}
