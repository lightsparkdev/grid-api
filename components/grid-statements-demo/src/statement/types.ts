export type StatementVariant = 'consumer' | 'commercial';
export type PreviewWidth = 'full' | 'narrow';

export type StatementLogo =
  | { kind: 'none' }
  | { kind: 'image'; src: string; alt: string };

export interface StatementBrand {
  companyName: string;
  logo: StatementLogo;
}

export interface StatementPeriod {
  id: string;
  range: string;
  issued: string;
  transactionMonth: string;
}

interface TransactionBase {
  id: string;
  day: string;
  type: string;
  party: string;
  amountCents: number;
  isFee?: boolean;
}

export interface ConsumerTransaction extends TransactionBase {
  disputable: boolean;
  terminal?: string;
}

export interface CommercialTransaction extends TransactionBase {
  disputable?: never;
  terminal?: never;
}

interface StatementBase {
  brand: StatementBrand;
  period: StatementPeriod;
  account: {
    holder: string;
    type: string;
    number: string;
  };
  openingBalanceCents: number;
}

export interface ConsumerStatement extends StatementBase {
  variant: 'consumer';
  transactions: readonly ConsumerTransaction[];
}

export interface CommercialStatement extends StatementBase {
  variant: 'commercial';
  transactions: readonly CommercialTransaction[];
}

export type StatementModel = ConsumerStatement | CommercialStatement;

export interface StatementTotals {
  closingBalanceCents: number;
  totalFeesCents: number;
}

export interface RequirementCoverage {
  id: string;
  requirement: string;
  renderedAt: string;
  source: string;
  appliesTo: 'all' | 'consumer';
}
