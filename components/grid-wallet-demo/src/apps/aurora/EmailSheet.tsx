'use client';

import { useEffect, useRef, useState } from 'react';
import { IconEmail1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconEmail1';
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
  // Prefilled so Continue is live on open — one tap through the demo.
  const [email, setEmail] = useState('playground@lightspark.com');
  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
  const submit = () => {
    if (valid) onSubmit(email.trim());
  };

  return (
    <BottomSheet
      open={open}
      onDismiss={onCancel ?? (() => {})}
      inset={16}
      topRadius={40}
      // Same float-sheet treatment as the send/receive picker.
      glass={{ ...SHEET_GLASS, tint: 'var(--float-sheet-tint)' }}
    >
      {/* Header: the activity-row icon tile top-left (email glyph), glass X
          top-right; title + body below. */}
      <div className={styles.header}>
        <span className={styles.tile} aria-hidden>
          <IconEmail1 size={28} />
        </span>
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
      <h2 className={styles.heading}>Continue with email</h2>
      <p className={styles.sub}>
        Enter your email and we&rsquo;ll send you a one-time code to log in
      </p>

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
