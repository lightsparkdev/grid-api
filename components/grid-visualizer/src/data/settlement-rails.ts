export interface SettlementRail {
  /** Asset code used in flow action cards, e.g. 'BTC' */
  asset: string;
  /** Display name for the picker, e.g. 'Bitcoin' */
  assetName: string;
  /** Network the asset settles over, e.g. 'Lightning' */
  network: string;
  /** Connector-label copy, e.g. 'Lightning Network' */
  networkLabel: string;
  icon: string;
}

// Rails Grid orchestrates over between switches. Backed by the API spec:
// USDC on Solana is the documented inter-VASP settlement-leg example
// (ReconciliationInstructions), and Spark legs carry USDB
// (PaymentSparkWalletInfo.assetType).
export const settlementRails: SettlementRail[] = [
  {
    asset: 'BTC',
    assetName: 'Bitcoin',
    network: 'Lightning',
    networkLabel: 'Lightning Network',
    icon: '/crypto/btc.svg',
  },
  {
    asset: 'USDC',
    assetName: 'USDC',
    network: 'Solana',
    networkLabel: 'Solana',
    icon: '/crypto/usdc.svg',
  },
  {
    asset: 'USDB',
    assetName: 'Bitcoin USD',
    network: 'Spark',
    networkLabel: 'Spark',
    icon: '/crypto/usdb.svg',
  },
];

export const DEFAULT_SETTLEMENT_RAIL = 'BTC';

export function getSettlementRail(asset?: string | null): SettlementRail {
  return settlementRails.find((r) => r.asset === asset) ?? settlementRails[0];
}
