export interface PopularFlow {
  label: string;
  sendCode: string;
  receiveCode: string;
}

export const popularFlows: PopularFlow[] = [
  { label: 'USDT → NGN', sendCode: 'USDT', receiveCode: 'NGN' },
  { label: 'USD → BRL', sendCode: 'USD', receiveCode: 'BRL' },
  { label: 'USD → MXN', sendCode: 'USD', receiveCode: 'MXN' },
  { label: 'EUR → GBP', sendCode: 'EUR', receiveCode: 'GBP' },
  { label: 'BTC → USD', sendCode: 'BTC', receiveCode: 'USD' },
  { label: 'USD → USDC', sendCode: 'USD', receiveCode: 'USDC' },
];
