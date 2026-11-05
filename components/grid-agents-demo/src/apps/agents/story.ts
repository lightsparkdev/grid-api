import type { DepositNetwork, Limits, MerchantAgent, Payee, Purchase } from '@/data/agentEvents';

/* The one story every app tells: the same person, the same people they pay,
   the same purchases. Only the voice and the look change between apps. */

export const PERSON = { first: 'Alex', full: 'Alex Rivera', email: 'alex.rivera@gmail.com', phone: '+1 (310) 555-0142' };
export const ADDRESS = '2140 Ocean Park Blvd, Apt 4, Santa Monica CA 90405, US';

export const FUND = {
  amount: 5_000,
  options: [
    { label: 'Lightning', network: 'LIGHTNING' as DepositNetwork, currency: 'USD' },
    { label: 'USDC on Base', network: 'BASE' as DepositNetwork, currency: 'USDC' },
    { label: 'USDT on Tron', network: 'TRON' as DepositNetwork, currency: 'USDT' },
  ],
};

/** What Set limits asks for: act alone under $100, $500 a payment, $1,000 a day. */
export const NEW_LIMITS: Limits = { perTransaction: 50_000, daily: 100_000, approvalAbove: 10_000 };

export const SOFIA: Payee & { flag: string; local: string; first: string } = {
  name: 'Sofia Almeida',
  first: 'Sofia',
  currency: 'BRL',
  amount: 25_000,
  usd: 4_520,
  rail: 'PIX',
  bank: 'Nubank',
  flag: 'br',
  local: 'R$250.00',
};

export const RING_LIGHT: Purchase & { item: string; image: string } = {
  merchant: 'NEEWER',
  description: 'NEEWER BASICS RP10-H 10" ring light, standard shipping',
  amount: 4_875,
  item: 'NEEWER BASICS RP10-H 10" Selfie Ring Light',
  image: '/assets/agents/muse/product.png',
};

export const SUBSCRIPTION: Purchase & { item: string } = {
  merchant: 'Duolingo',
  description: 'Duolingo Max, monthly',
  amount: 1_399,
  recurring: true,
  item: 'Duolingo Max',
};

export const HOTEL: MerchantAgent & { listed: number; nights: string } = {
  name: 'Hotel Alma',
  amount: 37_080,
  listed: 41_200,
  description: '2 nights, June 12 to 14, paid agent to agent',
  nights: 'June 12 to 14',
};

export const LUCIA = {
  name: 'Lucía Hernández',
  first: 'Lucía',
  amount: 46_820,
  invoice: 'INV-0042',
  options: [
    { label: 'USDC on Base', network: 'BASE' as DepositNetwork, currency: 'USDC' },
    { label: 'Bitcoin over Lightning', network: 'LIGHTNING' as DepositNetwork, currency: 'BTC' },
  ],
};

export const CASHOUT: (Payee & { flag?: string; local: string; chip: string })[] = [
  {
    name: 'Chase •••• 4417',
    chip: 'Chase •••• 4417',
    currency: 'USD',
    amount: 20_000,
    usd: 20_000,
    rail: 'RTP',
    bank: 'Chase',
    flag: 'us',
    local: '$200.00',
  },
  {
    name: 'Nubank (PIX)',
    chip: 'Nubank, PIX',
    currency: 'BRL',
    amount: 110_600,
    usd: 20_000,
    rail: 'PIX',
    bank: 'Nubank',
    flag: 'br',
    local: 'R$1,106.00',
  },
];

export function usd(cents: number) {
  const whole = cents % 100 === 0;
  return `$${(Math.abs(cents) / 100).toLocaleString('en-US', { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 })}`;
}

export function usd2(cents: number) {
  return `$${(Math.abs(cents) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
