'use client';

import { IconUserKey } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconUserKey';
import { SfSymbol } from '@/apps/shared/icons';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import styles from './PasskeyNudge.module.scss';

interface PasskeyNudgeProps {
  onAdd: () => void;
  /** A registration is in flight — the row stays put but can't be re-tapped. */
  busy?: boolean;
}

/**
 * "Add a passkey" — the security nudge a real wallet shows once you're in. A
 * Global Account signs in on its EMAIL_OTP credential first; adding the passkey
 * is a separate, signed action, so it belongs here rather than in the sign-in
 * flow. Shown only while the account has no passkey.
 */
export function PasskeyNudge({ onAdd, busy = false }: PasskeyNudgeProps) {
  const clip = useSquircleClip<HTMLButtonElement>();
  return (
    <div className={styles.wrap}>
      <button
        type="button"
        ref={clip.ref}
        style={clip.style}
        className={styles.card}
        onClick={busy ? undefined : onAdd}
        aria-busy={busy || undefined}
      >
        <span className={styles.tile} aria-hidden>
          <IconUserKey size={24} />
        </span>
        <span className={styles.labels}>
          <span className={styles.title}>Add a passkey</span>
          <span className={styles.sub}>Use Face ID to sign in next time</span>
        </span>
        <span className={styles.chevron} aria-hidden>
          <SfSymbol name="chevron.right" size={14} />
        </span>
      </button>
    </div>
  );
}
