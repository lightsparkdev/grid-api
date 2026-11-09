import type { DepositNetwork } from './agentEvents';

/* Sending crypto out of the balance, as Grid's agent quotes allow: USDC or USDT to an address on another chain
   (`CHAIN_ADDRESS`, `AgentSendNetwork`), a Lightning invoice (`LIGHTNING_INVOICE`), or USDB to a Spark address
   (one of the customer's `SPARK_WALLET` accounts). Base takes USDC only and Tron USDT only. */

export type SendAsset = 'USDC' | 'USDT' | 'BTC' | 'USDB';

/** What an address is, from its shape. On-chain Bitcoin is recognized so the agent can say it can't send there. */
export type AddressKind = 'evm' | 'solana' | 'tron' | 'lightning' | 'spark' | 'bitcoin' | 'invalid';

export interface CryptoPayee {
  address: string;
  network: DepositNetwork;
  asset: SendAsset;
  /** What the recipient gets, USD cents (stablecoins and USDB are a dollar each; a Lightning invoice is priced in dollars here). */
  usd: number;
  /** The network fee Grid adds to what leaves the balance, USD cents. */
  fee: number;
}

const BASE58 = '[1-9A-HJ-NP-Za-km-z]';

export function addressKind(raw: string): AddressKind {
  const a = raw.trim();
  if (/^ln(bc|tb|bcrt)[0-9a-z]{20,}$/i.test(a)) return 'lightning';
  if (/^(sp1|spark1)[0-9a-z]{20,}$/i.test(a)) return 'spark';
  if (/^0x[0-9a-fA-F]{40}$/.test(a)) return 'evm';
  if (new RegExp(`^T${BASE58}{33}$`).test(a)) return 'tron';
  if (/^bc1[0-9a-z]{25,62}$/i.test(a)) return 'bitcoin';
  if (new RegExp(`^${BASE58}{43,44}$`).test(a)) return 'solana';
  if (new RegExp(`^[13]${BASE58}{25,34}$`).test(a)) return 'bitcoin';
  return 'invalid';
}

/** The networks an address of each kind can be on. One EVM address works on every EVM chain, so the person picks. */
export const NETWORKS_FOR: Record<Exclude<AddressKind, 'bitcoin' | 'invalid'>, DepositNetwork[]> = {
  evm: ['BASE', 'ETHEREUM', 'POLYGON', 'ARBITRUM'],
  solana: ['SOLANA'],
  tron: ['TRON'],
  lightning: ['LIGHTNING'],
  spark: ['SPARK'],
};

/** What each network can receive from the agent. */
export const SENDS_ON: Record<DepositNetwork, SendAsset[]> = {
  BASE: ['USDC'],
  ETHEREUM: ['USDC', 'USDT'],
  SOLANA: ['USDC', 'USDT'],
  POLYGON: ['USDC', 'USDT'],
  ARBITRUM: ['USDC', 'USDT'],
  TRON: ['USDT'],
  LIGHTNING: ['BTC'],
  SPARK: ['USDB'],
};

/** Each network's fee in USD cents, made up but in proportion: Ethereum mainnet costs, the rest are near free. */
export const NETWORK_FEE: Record<DepositNetwork, number> = {
  BASE: 2,
  ETHEREUM: 150,
  SOLANA: 1,
  POLYGON: 1,
  ARBITRUM: 3,
  TRON: 100,
  LIGHTNING: 1,
  SPARK: 0,
};

/** Whether the agent can send to this address at all (and this asset, if named), before anything is set up for it. */
export function canSend(address: string, asset?: SendAsset): boolean {
  const kind = addressKind(address);
  // The playground only sends stablecoins: no bitcoin, on-chain or over Lightning.
  if (kind === 'invalid' || kind === 'bitcoin' || kind === 'lightning') return false;
  return !asset || NETWORKS_FOR[kind].some((n) => SENDS_ON[n].includes(asset));
}

export const shortAddress = (a: string) => (a.length > 16 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a);

/** How much they get, as people say it: "50 USDC", or dollars for a Lightning invoice. */
export function sendsLabel(asset: SendAsset, usdCents: number): string {
  if (asset === 'BTC') return `$${(usdCents / 100).toFixed(2)}`;
  return `${(usdCents / 100).toLocaleString('en-US', { maximumFractionDigits: 2 })} ${asset}`;
}
