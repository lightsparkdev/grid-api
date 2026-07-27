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
 * "Send or receive" chooser — the Uber partial sheet (IMG_0678's grammar):
 * square-top card, centered title bar with a hairline, then the subhead and
 * Aurora's two actions as full-width pills.
 */
export function SendReceiveSheet({ open, onDismiss, onSend, onReceive }: SendReceiveSheetProps) {
  const sendClip = useSquircleClip<HTMLButtonElement>({ figmaRadii: 8 });
  const receiveClip = useSquircleClip<HTMLButtonElement>({ figmaRadii: 8 });

  return (
    <PartialSheet open={open} onDismiss={onDismiss} title="Send or receive">
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
