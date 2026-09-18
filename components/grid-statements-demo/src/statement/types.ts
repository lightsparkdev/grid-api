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

interface ActivityBase {
  id: string;
  day: string;
  label: string;
  party: string;
}

interface ConsumerActivityFields {
  disputable: boolean;
  terminal?: string;
}

interface CommercialActivityFields {
  disputable?: never;
  terminal?: never;
}

interface IncomingActivityFields {
  kind: 'incoming';
  rail: 'ACH' | 'RTP';
  receivedAmountCents: number;
}

interface OutgoingActivityFields {
  kind: 'outgoing';
  rail: 'ACH' | 'WIRE';
  sentAmountCents: number;
  feeCents: number;
}

interface CardActivityFields {
  kind: 'card';
  merchant: {
    descriptor: string;
    mcc: string;
    city: string;
    state: string;
    country: string;
  };
  settledAmountCents: number;
}

export type ConsumerActivity = ActivityBase &
  ConsumerActivityFields &
  (IncomingActivityFields | OutgoingActivityFields | CardActivityFields);

export type CommercialActivity = ActivityBase &
  CommercialActivityFields &
  (IncomingActivityFields | OutgoingActivityFields | CardActivityFields);

export interface StatementRow {
  id: string;
  day: string;
  type: string;
  party: string;
  amountCents: number;
  isFee: boolean;
  disputable?: boolean;
  terminal?: string;
}

interface StatementBase {
  brand: StatementBrand;
  period: StatementPeriod;
  account: {
    id: string;
    customerId: string;
    platformCustomerId: string;
    holder: string;
    type: string;
    number: string;
  };
  openingBalanceCents: number;
}

export interface ConsumerStatement extends StatementBase {
  variant: 'consumer';
  activities: readonly ConsumerActivity[];
}

export interface CommercialStatement extends StatementBase {
  variant: 'commercial';
  activities: readonly CommercialActivity[];
}

export type StatementModel = ConsumerStatement | CommercialStatement;

export interface StatementTotals {
  closingBalanceCents: number;
  totalFeesCents: number;
}
