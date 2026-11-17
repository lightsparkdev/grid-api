import type { ActionId } from '@/data/actions';
import type { AccountSnapshot } from '@/data/agentApiCalls';
import type { Mode } from '@/data/mode';
import type { Chip } from './conversation';

/* What to try once a flow finishes, so it doesn't end on a dead end: a few flows that follow from it, in the
   person's own words, each starting that flow when tapped. */

const NEXT: Record<Mode, Partial<Record<ActionId, ActionId[]>>> = {
  personal: {
    connect: ['fund', 'pay', 'buy'],
    card: ['buy', 'fund', 'limits'],
    bank: ['fund', 'cashout', 'pay'],
    fund: ['pay', 'buy', 'limits'],
    limits: ['buy', 'pay', 'agent'],
    pay: ['getpaid', 'buy', 'history'],
    crypto: ['pay', 'history', 'balance'],
    buy: ['agent', 'limits', 'history'],
    agent: ['buy', 'history', 'balance'],
    getpaid: ['cashout', 'pay', 'balance'],
    cashout: ['history', 'fund', 'balance'],
    balance: ['fund', 'pay', 'history'],
    history: ['pay', 'buy', 'balance'],
  },
  business: {
    company: ['teammate', 'invoice', 'fund'],
    teammate: ['payroll', 'empcard', 'team'],
    fund: ['invoice', 'bill', 'payroll'],
    team: ['empcard', 'teammate', 'payroll'],
    empcard: ['bill', 'payroll', 'history'],
    invoice: ['invoices', 'bill', 'contractor'],
    invoices: ['invoice', 'bill', 'balance'],
    bill: ['contractor', 'payroll', 'history'],
    contractor: ['payroll', 'invoice', 'history'],
    payroll: ['teammate', 'history', 'invoice'],
    balance: ['fund', 'invoice', 'payroll'],
    history: ['invoice', 'bill', 'payroll'],
  },
};

const SAID: Record<Mode, Partial<Record<ActionId, string>>> = {
  personal: {
    connect: 'Set up a balance',
    card: 'Add a card',
    bank: 'Link my bank',
    fund: 'Add money',
    limits: 'Set my limits',
    pay: 'Send money to someone',
    crypto: 'Send stablecoins',
    buy: 'Buy something online',
    agent: 'Book a hotel',
    getpaid: 'Get paid',
    cashout: 'Move money to my bank',
    balance: 'What’s my balance?',
    history: 'What did I spend?',
  },
  business: {
    company: 'Set up my company',
    teammate: 'Add a teammate',
    fund: 'Add money',
    team: 'Set up a team budget',
    empcard: 'Give someone a card',
    invoice: 'Send an invoice',
    invoices: 'Check unpaid invoices',
    bill: 'Pay a bill',
    contractor: 'Pay a contractor',
    payroll: 'Run payroll',
    balance: 'What’s our balance?',
    history: 'Show recent activity',
  },
};

/** Whether a flow is already done, so offering it again would only hear "already". */
function done(flow: ActionId, a: AccountSnapshot): boolean {
  switch (flow) {
    case 'connect':
    case 'company':
      return a.balanceOn;
    case 'card':
      return a.cardVaulted;
    case 'bank':
      return a.bankLinked;
    case 'team':
      return a.business?.budget != null;
    default:
      return false;
  }
}

/** Up to three things to try after `flow`, leaving out what's done. */
export function nextSteps(flow: ActionId, mode: Mode, account: AccountSnapshot): Chip[] {
  return (NEXT[mode][flow] ?? [])
    .filter((f) => f !== flow && !done(f, account))
    .slice(0, 3)
    .map((f) => ({ label: SAID[mode][f] ?? f, flow: f }));
}
