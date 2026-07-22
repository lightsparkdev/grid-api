'use client';

import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { PartialSheet } from './PartialSheet';
import styles from './SendReceiveSheet.module.scss';

interface SendReceiveSheetProps {
  open: boolean;
  onDismiss: () => void;
  /** Send tapped — the sheet drops as the send flow pushes in. */
  onSend: () => void;
  /** Receive tapped — the sheet drops as the receive flow pushes in. */
  onReceive: () => void;
}

/**
 * "Send or receive" chooser — the Airbnb partial sheet (IMG_0612's layout):
 * floating X, big centered title + subhead IN the content (no header bar or
 * divider), then Aurora's two actions as full-width pills.
 */
export function SendReceiveSheet({ open, onDismiss, onSend, onReceive }: SendReceiveSheetProps) {
  const sendClip = useSquircleClip<HTMLButtonElement>({ figmaRadii: 12 });
  const receiveClip = useSquircleClip<HTMLButtonElement>({ figmaRadii: 12 });

  return (
    <PartialSheet open={open} onDismiss={onDismiss}>
      <h2 className={styles.title}>Send or receive</h2>
      <p className={styles.sub}>
        Move money to and from any
        <br />
        bank account or wallet
      </p>
      <div className={styles.actions}>
        <button
          type="button"
          ref={sendClip.ref}
          style={sendClip.style}
          className={styles.actionBtn}
          onClick={onSend}
        >
          Send
        </button>
        <button
          type="button"
          ref={receiveClip.ref}
          style={receiveClip.style}
          className={styles.actionBtn}
          onClick={onReceive}
        >
          Receive
        </button>
      </div>
    </PartialSheet>
  );
}
