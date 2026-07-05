'use client';

import { SEND_NETWORKS, truncateAddress, type MoneySheet } from '@/apps/shared/wallet';
import { StickerTile } from '../blocks/FlagTile';
import { PartialSheet } from './PartialSheet';
import styles from './PasteAddressSheet.module.scss';

interface PasteAddressSheetProps {
  m: MoneySheet;
  open: boolean;
  onDismiss: () => void;
}

/**
 * "Paste address" — Aurora's clipboard sheet on the Airbnb partial sheet,
 * WITH the iOS stack effect (the send flow scales down and recedes behind
 * it — the pageSheet mechanic at partial height). Framed as a paste
 * affordance: each row is a Receive chain's address; tapping one drops it
 * into the recipient card with that network's currency + account type.
 */
export function PasteAddressSheet({ m, open, onDismiss }: PasteAddressSheetProps) {
  return (
    <PartialSheet open={open} onDismiss={onDismiss} recede>
      <h2 className={styles.title}>Paste address</h2>
      <div className={styles.list}>
        {SEND_NETWORKS.map((net) => (
          <button
            key={net.id}
            type="button"
            className={styles.row}
            onClick={() => m.pickNetwork(net)}
          >
            <StickerTile>
              <img className={styles.netLogo} src={net.logo} alt="" draggable={false} />
            </StickerTile>
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
