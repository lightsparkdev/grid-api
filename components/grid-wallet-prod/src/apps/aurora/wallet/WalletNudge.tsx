'use client';

import type { ReactNode } from 'react';
import { SfSymbol } from '@/apps/shared/icons';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import styles from './WalletNudge.module.scss';

interface WalletNudgeProps {
  icon: ReactNode;
  title: string;
  sub: string;
  /** Absent for a row that only informs (the live session). */
  onTap?: () => void;
  /** An action is in flight — the row stays put but can't be re-tapped. */
  busy?: boolean;
}

/**
 * A row in the wallet sheet for the account's credentials and session: the
 * security nudges a real wallet shows once you're in ("Add a passkey"), and
 * the live session itself. Adding a credential is a signed action, so these
 * belong here rather than in the sign-in flow.
 */
export function WalletNudge({ icon, title, sub, onTap, busy = false }: WalletNudgeProps) {
  const clip = useSquircleClip<HTMLButtonElement>();
  return (
    <div className={styles.wrap}>
      <button
        type="button"
        ref={clip.ref}
        style={clip.style}
        className={styles.card}
        onClick={busy ? undefined : onTap}
        disabled={!onTap}
        aria-busy={busy || undefined}
      >
        <span className={styles.tile} aria-hidden>
          {icon}
        </span>
        <span className={styles.labels}>
          <span className={styles.title}>{title}</span>
          <span className={styles.sub}>{sub}</span>
        </span>
        {onTap && (
          <span className={styles.chevron} aria-hidden>
            <SfSymbol name="chevron.right" size={14} />
          </span>
        )}
      </button>
    </div>
  );
}
