/** Headless wallet logic — shared by every skin's view. No JSX. */
export type {
  CardView,
  TapPhase,
  WalletEntry,
  WalletEntryTarget,
  WalletTransferMode,
} from './types';
export {
  EARNINGS_APY_PERCENT,
  WEEKLY_BAR_COUNT,
  TAP_MERCHANTS,
  initials,
  makeReceiveRow,
  makeTransferRow,
  parseCents,
  randomReceiveCents,
  toastUsd,
} from './activity';
export { useWalletHome, type UseWalletHomeOptions } from './useWalletHome';
