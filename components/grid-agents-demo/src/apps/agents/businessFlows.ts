import type { ActionId } from '@/data/actions';
import { DEFAULT_BUSINESS } from '@/data/mode';
import { COMPANY_BANK, inDays, payrollTotal, STORY_BILL, STORY_CONTRACTOR, STORY_INVOICE, TEAM, TEAM_BUDGET, teamMember } from './business';
import type { Beat, Params } from './conversation';
import { addShort, approvalOr, balanceParams, FLOWS, holdOr, offerFunds, type FlowContext, type FlowParams } from './flows';
import { renameBusinessBank } from './linkedBank';
import { usd2 } from './story';

/* The business account's flows, on the same building blocks as the personal ones: the company is set up the way a
   personal balance is (it's the agent's account on the business), bills are paid the way Pay someone pays, and
   everything over the threshold waits for the owner. Function declarations, so flows.ts can reach them while the two
   modules load each other. */

const cents = (usd: number | undefined) => (usd && usd > 0 ? Math.round(usd * 100) : undefined);

function biz(ctx: FlowContext) {
  return (
    ctx.account().business ?? { company: DEFAULT_BUSINESS.company, owner: DEFAULT_BUSINESS.owner, named: false, team: [], budget: null, invoices: [] }
  );
}

/** The company and the owner, as every business line can say them. */
function names(ctx: FlowContext): Params {
  const b = biz(ctx);
  return { company: b.company, owner: b.owner, ownerFirst: b.owner.split(' ')[0] };
}

/** The company's account card: its balance, and the US bank details clients pay it at. */
function companyCard(ctx: FlowContext): Params {
  return {
    ...names(ctx),
    ...balanceParams(ctx),
    bank: COMPANY_BANK.bankName,
    routing: COMPANY_BANK.routingNumber,
    account: COMPANY_BANK.accountNumber,
  };
}

/**
 * The business account: named first (the company, then the owner, each with a one-tap default, unless the owner already
 * said them), then the account itself, which the owner approves. On the way to something else (a bill, payroll), that
 * comes next once it's set up; `done` plays once it is.
 */
export function companySetup(ctx: FlowContext, given: { company?: string; owner?: string } = {}, done: Beat[] = []): Beat[] {
  if (ctx.account().balanceOn) {
    return [{ react: '👍' }, { say: 'company.already', params: names(ctx) }, { when: () => [{ card: 'company.ready', params: companyCard(ctx) }] }];
  }
  const approve = (): Beat[] => {
    const l = ctx.account().limits;
    const p = { ...names(ctx), perTx: l.perTransaction, daily: l.daily, approve: l.approvalAbove };
    return [
      { say: ctx.then ? 'company.intro' : 'company.self', params: p },
      {
        ask: 'company',
        params: p,
        faceId: true,
        allow: [
          { work: 'company', ms: 1400, params: p },
          { emit: { type: 'connect' } },
          { say: 'company.done', params: p },
          ...done,
          {
            when: () =>
              ctx.then
                ? ctx.then()
                : [{ card: 'company.ready', params: companyCard(ctx) }, ...(ctx.account().balanceCents > 0 ? [] : offerFunds(ctx))],
          },
        ],
        deny: [holdOr(ctx, { say: 'company.denied', params: p })],
      },
    ];
  };
  // The names land before the approval is built, so it reads them.
  const named = (company: string, owner: string): Beat[] => {
    renameBusinessBank(company);
    return [{ emit: { type: 'business.name', company, owner } }, { when: approve }];
  };
  const askOwner = (company: string): Beat[] => [
    { say: 'company.owner', params: { company } },
    { name: true, suggestion: DEFAULT_BUSINESS.owner, other: 'company.owner.other', named: (owner) => named(company, owner) },
  ];
  if (biz(ctx).named) return [{ react: '❤️' }, ...approve()];
  if (given.company && given.owner) return [{ react: '❤️' }, ...named(given.company, given.owner)];
  if (given.company) return [{ react: '❤️' }, ...askOwner(given.company)];
  return [
    { react: '❤️' },
    { say: 'company.name' },
    { name: true, suggestion: DEFAULT_BUSINESS.company, other: 'company.name.other', named: askOwner },
  ];
}

/** No business account yet: it offers to set one up rather than showing an empty one. */
export function noCompanyYet(ctx: FlowContext): Beat[] {
  return [
    { react: '👍' },
    { say: 'company.none', params: names(ctx) },
    {
      chips: [{ label: 'Set up my company', glyph: 'wallet' }, { label: 'Not now' }],
      reply: true,
      then: (picked) => (picked === 0 ? companySetup(ctx).filter((b) => !('react' in b)) : [{ say: 'company.later' }]),
    },
  ];
}

/** A budget the team shares and an agent for each person on it, approved by the owner. */
export function teamBudget(ctx: FlowContext): Beat[] {
  const b = biz(ctx);
  const limit = cents(ctx.params?.amount) ?? TEAM_BUDGET;
  const p = {
    ...names(ctx),
    budget: b.budget ?? limit,
    people: TEAM.map((m) => m.first).join(' and '),
    count: TEAM.length,
    perTx: 100_000,
    approve: 25_000,
  };
  if (b.budget) return [{ react: '👍' }, { say: 'team.already', params: p }, { card: 'team.ready', params: p }];
  return [
    { react: '👍' },
    { say: 'team.intro', params: p },
    {
      ask: 'team',
      params: p,
      faceId: true,
      allow: [
        { work: 'team', ms: 1300 },
        { emit: { type: 'team.budget', limit } },
        { say: 'team.done', params: p },
        { card: 'team.ready', params: p },
      ],
      deny: [{ say: 'team.denied', params: p }],
    },
  ];
}

/** A card in a teammate's name, issued by their own agent. Someone not on the team is said so, not given a card. */
export function employeeCard(ctx: FlowContext): Beat[] {
  const asked = ctx.params?.name;
  const m = teamMember(asked) ?? (asked ? undefined : TEAM[1]);
  if (!m)
    return [{ react: '👍' }, { say: 'empcard.notTeam', params: { ...names(ctx), name: asked ?? '', team: TEAM.map((t) => t.first).join(' and ') } }];
  const b = biz(ctx);
  const p = {
    ...names(ctx),
    name: m.name,
    first: m.first,
    role: m.role,
    purpose: ctx.params?.note || 'travel',
    last4: m.first === 'Maya' ? '3381' : '7729',
    budget: b.budget ?? 0,
  };
  if (b.team.find((t) => t.name === m.name)?.hasCard) return [{ react: '👍' }, { say: 'empcard.already', params: p }];
  return [
    { react: '👍' },
    { say: 'empcard.intro', params: p },
    {
      ask: 'empcard',
      params: p,
      faceId: true,
      allow: [
        { work: 'issuing', ms: 1200 },
        { emit: { type: 'employee.card', member: m.name } },
        { card: 'receipt.empcard', params: p },
        { say: 'empcard.done', params: p },
      ],
      deny: [{ say: 'empcard.denied', params: p }],
    },
  ];
}

/**
 * The app writes the invoice, with the company's US bank details on it; Grid receives the transfer that pays it, and
 * the app matches it by the invoice number in the transfer's remittance.
 */
export function sendInvoice(ctx: FlowContext): Beat[] {
  const client = ctx.params?.name?.trim() || STORY_INVOICE.client;
  const amount = cents(ctx.params?.amount) ?? STORY_INVOICE.amount;
  const memo = ctx.params?.note?.trim() || (ctx.params?.name ? 'Services' : STORY_INVOICE.memo);
  const number = `INV-${1038 + biz(ctx).invoices.length}`;
  const due = inDays(14);
  const p = {
    ...names(ctx),
    number,
    client,
    amount,
    memo,
    due,
    bank: COMPANY_BANK.bankName,
    account: COMPANY_BANK.accountNumber,
    routing: COMPANY_BANK.routingNumber,
  };
  return [
    { react: '👍' },
    { say: 'invoice.intro', params: p },
    { work: 'invoicing', ms: 1000 },
    { emit: { type: 'invoice.send', number, client, amount, memo, due } },
    { card: 'invoice', params: p },
    { say: 'invoice.sent', params: p },
    { divider: 'Two days later' },
    { emit: { type: 'invoice.paid', number } },
    {
      when: () => [
        { card: 'receipt.invoice', params: p },
        { say: 'invoice.paid', params: { ...p, balance: ctx.account().balanceCents } },
      ],
    },
  ];
}

/** The app's invoices against the payments Grid received: paid, or still open with a reminder to send. */
export function trackInvoices(ctx: FlowContext): Beat[] {
  return [
    { react: '👍' },
    { work: 'checking', ms: 800 },
    { emit: { type: 'invoices.check' } },
    {
      when: () => {
        const invoices = biz(ctx).invoices;
        const open = invoices.filter((i) => i.status === 'OPEN');
        const rows = invoices.map((i) => ({
          title: `${i.number} · ${i.client}`,
          detail: i.status === 'PAID' ? 'Paid' : `Due ${i.due}`,
          amount: usd2(i.amount),
          incoming: i.status === 'PAID',
        }));
        const p = {
          ...names(ctx),
          open: open.length,
          paid: invoices.length - open.length,
          openTotal: open.reduce((sum, i) => sum + i.amount, 0),
          first: open[0]?.client ?? '',
          number: open[0]?.number ?? '',
          rows: JSON.stringify(rows),
        };
        if (!open.length)
          return [
            { say: 'invoices.allPaid', params: p },
            { card: 'invoices', params: p },
          ];
        return [
          { say: 'invoices.answer', params: p },
          { card: 'invoices', params: p },
          {
            chips: [{ label: 'Send a reminder', glyph: 'check' }, { label: 'Not now' }],
            reply: true,
            then: (picked) => [{ say: picked === 0 ? 'invoices.reminded' : 'invoices.later', params: p }],
          },
        ];
      },
    },
  ];
}

/** A bill is a payment to the vendor's US bank account, added once as a business: Pay someone's flow. */
export function payBill(ctx: FlowContext): Beat[] {
  const p: FlowParams = ctx.params?.name
    ? { ...ctx.params, vendor: true, country: ctx.params.country ?? 'us', currency: ctx.params.currency ?? 'USD' }
    : { name: STORY_BILL.name, country: 'us', amount: STORY_BILL.amount, currency: 'USD', note: STORY_BILL.note, vendor: true };
  return FLOWS.pay({ ...ctx, params: p });
}

/** Someone with no account gets a link to claim the money into their own bank; over the threshold, the owner approves. */
export function payContractor(ctx: FlowContext): Beat[] {
  const p = ctx.params?.name ? ctx.params : undefined;
  const name = p?.name?.trim() || STORY_CONTRACTOR.name;
  const first = name.split(' ')[0];
  const email = p?.email?.trim() || (p ? `${first.toLowerCase()}@example.com` : STORY_CONTRACTOR.email);
  const country = (p?.country ?? STORY_CONTRACTOR.country).toUpperCase();
  const amount = cents(p?.amount) ?? STORY_CONTRACTOR.amount;
  const note = p?.note?.trim() || (p ? 'Contract work' : STORY_CONTRACTOR.note);
  const params = { ...names(ctx), name, first, email, amount, note };
  const send = (c: FlowContext): Beat[] => [
    { emit: { type: 'contractor.send', name, email, country, amount, note } },
    ...approvalOr(
      c,
      c.needsApproval(amount),
      { key: 'contractor', params },
      'contractor.auto',
      [
        { card: 'contractor.link', params },
        { say: 'contractor.sent', params },
        { divider: 'Later that day' },
        { emit: { type: 'contractor.claimed' } },
        { card: 'receipt.contractor', params },
        { when: () => [{ say: 'contractor.done', params: { ...params, balance: ctx.account().balanceCents } }] },
      ],
      'contractor.denied',
      params,
    ),
  ];
  const short = amount - ctx.account().balanceCents;
  return [
    { react: '👍' },
    { say: 'contractor.intro', params },
    ...(short > 0 ? addShort({ ...ctx, held: `paying ${first}` })(short, () => send(ctx)) : send(ctx)),
  ];
}

/** Everyone on the team, in one run: previewed, then one approval for every row. */
export function runPayroll(ctx: FlowContext): Beat[] {
  const total = payrollTotal();
  const rows = TEAM.map((m) => ({
    title: m.name,
    detail: `To ${m.bank.name} •••• ${m.bank.last4}`,
    amount: usd2(m.pay),
    incoming: false,
    initials: m.name
      .split(' ')
      .map((w) => w[0])
      .join(''),
  }));
  const params = { ...names(ctx), count: TEAM.length, people: TEAM.map((m) => m.first).join(' and '), total, rows: JSON.stringify(rows) };
  const run = (c: FlowContext): Beat[] => [
    { work: 'quoting', ms: 1000 },
    { emit: { type: 'payroll.preview' } },
    { card: 'payroll.preview', params },
    { emit: { type: 'payroll.execute' } },
    ...approvalOr(
      c,
      c.needsApproval(total),
      { key: 'payroll', params },
      'payroll.auto',
      [
        { work: 'sending', ms: 1200 },
        { card: 'receipt.payroll', params },
        { when: () => [{ say: 'payroll.done', params: { ...params, balance: ctx.account().balanceCents } }] },
      ],
      'payroll.denied',
      params,
    ),
  ];
  const short = total - ctx.account().balanceCents;
  return [
    { react: '👍' },
    { say: 'payroll.intro', params },
    ...(short > 0 ? addShort({ ...ctx, held: 'payroll' })(short, () => run(ctx)) : run(ctx)),
  ];
}

/** What a business run is about, for an app that labels it (Duet's eyebrow). */
export const BUSINESS_TOPIC: Partial<Record<ActionId, (ctx: FlowContext) => string>> = {
  company: (ctx) => (biz(ctx).named ? `Set up ${biz(ctx).company}` : 'Set up your company'),
  team: () => 'Team budget',
  empcard: (ctx) => `Card for ${(teamMember(ctx.params?.name) ?? TEAM[1]).first}`,
  invoice: (ctx) => `${ctx.params?.name ?? STORY_INVOICE.client} invoice`,
  invoices: () => 'Invoices',
  bill: (ctx) => `${ctx.params?.name ?? STORY_BILL.name} bill`,
  contractor: (ctx) => `Pay ${(ctx.params?.name ?? STORY_CONTRACTOR.name).split(' ')[0]}`,
  payroll: () => 'Payroll',
};

/** What a setup on the way to a business task is for, so a no to it says what's on hold. */
export const BUSINESS_HELD: Partial<Record<ActionId, (p?: FlowParams) => string>> = {
  team: () => 'the team budget',
  empcard: (p) => `${(teamMember(p?.name) ?? TEAM[1]).first}’s card`,
  invoice: () => 'the invoice',
  invoices: () => 'checking invoices',
  bill: (p) => `paying ${p?.name ?? STORY_BILL.name}`,
  contractor: (p) => `paying ${(p?.name ?? STORY_CONTRACTOR.name).split(' ')[0]}`,
  payroll: () => 'payroll',
};

/** The most a business run spends (USD cents), so a jump to it can top the balance up first. */
export function businessSpend(flow: 'bill' | 'contractor' | 'payroll', params?: FlowParams): number {
  switch (flow) {
    case 'bill':
      return cents(params?.amount) ?? STORY_BILL.amount * 100;
    case 'contractor':
      return cents(params?.amount) ?? STORY_CONTRACTOR.amount;
    case 'payroll':
      return payrollTotal();
    default: {
      const exhaustive: never = flow;
      return exhaustive;
    }
  }
}
