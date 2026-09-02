import type { Persona, PhoneState } from '@/data/flow';
import type { ActionId, WalletState } from '@/data/actions';
import type { CardDesign } from '@/data/design';
import type { UseWalletHomeOptions, WalletEntry } from '@/apps/shared/wallet';

/**
 * The demo phone's prop contract (AppPanel → DemoPhone). The live UI is the
 * active skin under `apps/*`; this file is just the shared type.
 */
export interface PhoneProps {
  phone: PhoneState;
  wallet: WalletState;
  persona: Persona;
  /** The "Design your card" state — read by the `custom` skin. */
  design: CardDesign;
  /** Bumped on reset; remounts the app so the wallet brain starts clean. */
  session: number;
  onAction: (id: ActionId) => void;
  /** Jump command for the wallet (sidebar → provision + open a flow). */
  walletEntry?: WalletEntry;
  /** Wallet events bubbled up so the demo logs the matching Grid calls. */
  onCardIssued?: () => void;
  onTapToPay?: UseWalletHomeOptions['onTapToPay'];
  onTapDeclined?: UseWalletHomeOptions['onTapDeclined'];
  cardOptions?: UseWalletHomeOptions['card'];
}
