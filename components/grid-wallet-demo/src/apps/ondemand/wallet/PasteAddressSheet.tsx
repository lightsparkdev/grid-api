'use client';

import { SEND_NETWORKS, truncateAddress, type MoneySheet } from '@/apps/shared/wallet';
import { CircleLogo } from '../blocks/PlainMarks';
import { PartialSheet } from './PartialSheet';
import styles from './PasteAddressSheet.module.scss';

interface PasteAddressSheetProps {
  m: MoneySheet;
  open: boolean;
  onDismiss: () => void;
}

/**
 * "Paste address" — the clipboard sheet on the partial sheet (plain slide-up
 * over a dim scrim; no stack recede in this app). Framed as a paste
 * affordance: each row is a Receive chain's address; tapping one drops it
 * into the recipient card with that network's currency + account type.
 */
export function PasteAddressSheet({ m, open, onDismiss }: PasteAddressSheetProps) {
  return (
    <PartialSheet open={open} onDismiss={onDismiss} title="Paste address">
      <div className={styles.list}>
        {SEND_NETWORKS.map((net) => (
          <button
            key={net.id}
            type="button"
            className={styles.row}
            onClick={() => m.pickNetwork(net)}
          >
            <CircleLogo src={net.logo} />
            <span className={styles.rowLines}>
              <span className={styles.rowTitle}>{truncateAddress(net.address)}</span>
              <span className={styles.rowSub}>{net.name} wallet</span>
            </span>
          </button>
        ))}
      </div>
    </PartialSheet>
  );
}
