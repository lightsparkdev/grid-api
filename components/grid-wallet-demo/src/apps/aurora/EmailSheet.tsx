'use client';

import { useState, type ReactNode } from 'react';
import { BottomSheet } from '@/apps/shared/BottomSheet';
import { GlassTextButton } from '@/apps/shared/glass';
import styles from './EmailSheet.module.scss';

interface EmailSheetProps {
  open: boolean;
  onSubmit: (email: string) => void;
  onCancel?: () => void;
  /** Copy of the screen behind the sheet, for the glass to refract. */
  behind?: ReactNode;
}

/** Floating (inset) email-entry sheet — Figma 2191:48065. Bottom corners hug the
 *  phone screen; title + subtitle + white input card + glass Continue button. */
export function EmailSheet({ open, onSubmit, onCancel, behind }: EmailSheetProps) {
  const [email, setEmail] = useState('');
  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
  const submit = () => {
    if (valid) onSubmit(email.trim());
  };

  return (
    <BottomSheet open={open} onDismiss={onCancel ?? (() => {})} inset={6} topRadius={40} behind={behind}>
      <div className={styles.title}>
        <h2 className={styles.heading}>Enter your email</h2>
        <p className={styles.sub}>We&rsquo;ll send you a one-time code to log in</p>
      </div>

      <div className={styles.cardContainer}>
        <div className={styles.card}>
          <input
            className={styles.input}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
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
