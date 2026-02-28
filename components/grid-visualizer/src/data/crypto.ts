export interface CryptoAccountType {
  type: string;
  label: string;
  network: string;
}

export interface ExamplePerson {
  fullName: string;
  nationality: string;
}

export interface CryptoAsset {
  symbol: string;
  name: string;
  accountTypes: CryptoAccountType[];
  examplePerson: ExamplePerson;
}

export const cryptoAssets: CryptoAsset[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    accountTypes: [
      { type: 'SPARK_WALLET', label: 'Wallet', network: 'Spark' },
      { type: 'LIGHTNING', label: 'Lightning', network: 'Lightning' },
    ],
    examplePerson: { fullName: 'Satoshi Tanaka', nationality: 'JP' },
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    accountTypes: [
      { type: 'SOLANA_WALLET', label: 'Wallet', network: 'Solana' },
      { type: 'POLYGON_WALLET', label: 'Wallet', network: 'Polygon' },
      { type: 'BASE_WALLET', label: 'Wallet', network: 'Base' },
    ],
    examplePerson: { fullName: 'Alex Rivera', nationality: 'US' },
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    accountTypes: [
      { type: 'TRON_WALLET', label: 'Wallet', network: 'Tron' },
    ],
    examplePerson: { fullName: 'Sam Chen', nationality: 'US' },
  },
  {
    symbol: 'USDB',
    name: 'Bitcoin USD',
    accountTypes: [
      { type: 'SPARK_WALLET', label: 'Wallet', network: 'Spark' },
    ],
    examplePerson: { fullName: 'Jordan Lee', nationality: 'US' },
  },
];
