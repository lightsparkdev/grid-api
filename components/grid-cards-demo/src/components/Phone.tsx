import type { CardDesign } from '@/data/design';
import type { UseCardHomeOptions, WalletEntry } from '@/apps/shared/card';

/**
 * The demo phone's prop contract (AppPanel → DemoPhone). The live UI is the
 * active skin under `apps/*`; this file is just the shared type.
 */
export interface PhoneProps {
  /** The "Design your card" state — read by the `custom` skin. */
  design: CardDesign;
  /** Bumped on reset; remounts the app so the wallet brain starts clean. */
  session: number;
  /** Jump command for the wallet (sidebar → provision + open a flow). */
  walletEntry?: WalletEntry;
  /** Wallet events bubbled up so the demo logs the matching Grid calls. */
  onCardIssued?: () => void;
  onTapToPay?: UseCardHomeOptions['onTapToPay'];
  onTapDeclined?: UseCardHomeOptions['onTapDeclined'];
  cardOptions?: UseCardHomeOptions['card'];
}
