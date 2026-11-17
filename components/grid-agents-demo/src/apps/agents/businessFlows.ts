import type { ActionId } from '@/data/actions';
import { BANK_COUNTRIES } from '@/data/bankCountries';
import { DEFAULT_BUSINESS } from '@/data/mode';
import {
  COMPANY_ADDRESS,
  COMPANY_BANK,
  cardLast4,
  CONTRACTOR_COUNTRIES,
  inDays,
  memberOf,
  newMember,
  nextSuggestion,
  payrollTotal,
  ROLES,
  STORY_BILL,
  STORY_CONTRACTOR,
  STORY_INVOICE,
  TEAM_BUDGET,
  type TeamMember,
} from './business';
import type { Beat, Params } from './conversation';
import { addShort, approvalOr, balanceParams, FLOWS, holdOr, offerFunds, recipientParams, type FlowContext, type FlowParams } from './flows';
import { draftRecipient, recipientNamed } from './recipients';
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

/** Who's on the team, in the order they were added. */
const teamOf = (ctx: FlowContext) => biz(ctx).team;

const firstNames = (team: readonly { first: string }[]) => {
  const names = team.map((m) => m.first);
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : (names[0] ?? '');
};

const initials = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

/** Everyone named in one answer ("Danny Glover and Jeremy Klein", "Ava, Sam & Lee"), in order. */
const namesIn = (value: string) =>
  value
    .split(/\s*(?:,|&|\band\b)\s*/i)
    .map((n) => n.trim())
    .filter(Boolean);

/** Monthly pay the pay question offers, in dollars, besides a suggested person's own. */
const PAY_OPTIONS = [3_000, 5_000, 7_500];

/**
 * Someone joins the team: their name (one tap away, or typed), their role and their monthly pay, then the bank payroll
 * pays, added in the app's own sheet as a vendor's is. Several named at once join one after another. `then` carries on
 * with whatever needed them, with the last one added.
 */
export function addTeammate(ctx: FlowContext, given: { name?: string } = {}, then?: (member: TeamMember) => Beat[]): Beat[] {
  const suggested = nextSuggestion(teamOf(ctx));
  const withBank = (name: string, role: string, pay: number, next: (member: TeamMember) => Beat[]): Beat[] => {
    const draft = draftRecipient(name, 'us');
    if (!draft) return [];
    const p = { ...names(ctx), ...recipientParams(draft), name, role, pay };
    return [
      { say: 'teammate.bank', params: p },
      {
        ask: 'recipient',
        params: p,
        allow: [
          {
            when: () => {
              const saved = recipientNamed(name) ?? draft;
              const member = newMember(saved.name, role, pay, { name: saved.bank.bankName, last4: saved.bank.last4 }, biz(ctx).company);
              const ready = { ...p, name: member.name, first: member.first, bank: member.bank.name, last4: member.bank.last4 };
              return [
                { emit: { type: 'recipient.add', name: member.name, bank: saved.bank } },
                { emit: { type: 'team.member', member } },
                { card: 'teammate.ready', params: ready },
                { when: () => next(member) },
              ];
            },
          },
        ],
        deny: [holdOr(ctx, { say: 'teammate.denied', params: p })],
      },
    ];
  };
  const askPay = (name: string, role: string, next: (member: TeamMember) => Beat[]): Beat[] => {
    const usual = suggested.name === name ? suggested.pay / 100 : undefined;
    const options = usual ? [usual, ...PAY_OPTIONS.filter((o) => o !== usual).slice(0, 2)].sort((a, b) => a - b) : PAY_OPTIONS;
    return [
      { say: 'teammate.pay', params: { first: name.split(' ')[0] } },
      { amount: true, options, then: (usd) => withBank(name, role, Math.round(usd * 100), next) },
    ];
  };
  const askRole = (name: string, next: (member: TeamMember) => Beat[]): Beat[] => {
    const roles = suggested.name === name ? [suggested.role, ...ROLES.filter((r) => r !== suggested.role)] : ROLES;
    return [
      { say: 'teammate.role', params: { first: name.split(' ')[0] } },
      { chips: roles.map((label) => ({ label })), reply: true, then: (picked) => askPay(name, roles[picked], next) },
    ];
  };
  const addAll = (people: string[], added: TeamMember[] = []): Beat[] => {
    const [name, ...rest] = people;
    return askRole(name, (member) => {
      const all = [...added, member];
      if (rest.length) return [{ say: 'teammate.next', params: { first: rest[0].split(' ')[0] } }, ...addAll(rest, all)];
      return then ? then(member) : [{ say: 'teammate.done', params: { people: firstNames(all), count: all.length } }];
    });
  };
  const start = (value: string): Beat[] => {
    const people = namesIn(value);
    const many: Beat[] = people.length > 1 ? [{ say: 'teammate.many', params: { people: firstNames(people.map((n) => ({ first: n.split(' ')[0] }))), first: people[0].split(' ')[0] } }] : [];
    return [...many, ...addAll(people.length ? people : [value])];
  };
  if (given.name) return start(given.name);
  return [
    { say: 'teammate.name', params: names(ctx) },
    { name: true, suggestion: suggested.name, other: 'teammate.name.other', named: start },
  ];
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
        verify: {
          company: biz(ctx).company,
          entity: 'LLC',
          taxId: '84-2193057',
          address: `${COMPANY_ADDRESS.line1}, ${COMPANY_ADDRESS.line2}, ${COMPANY_ADDRESS.city}, ${COMPANY_ADDRESS.state} ${COMPANY_ADDRESS.postalCode}`,
          owner: biz(ctx).owner,
        },
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
    // On the way to something else, it says what's waiting on the account.
    ctx.held ? { say: 'company.name.first', params: { what: ctx.held } } : { say: 'company.name' },
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
  if (!b.team.length) return [{ react: '👍' }, { say: 'team.none', params: names(ctx) }, ...addTeammate(ctx, {}, () => teamBudget(ctx).slice(1))];
  const limit = cents(ctx.params?.amount) ?? TEAM_BUDGET;
  const p = {
    ...names(ctx),
    budget: b.budget ?? limit,
    people: firstNames(b.team),
    count: b.team.length,
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
  const team = teamOf(ctx);
  // More than one teammate without a card: it asks who it's for.
  const without = team.filter((t) => !t.hasCard);
  if (!asked && without.length > 1)
    return [
      { react: '👍' },
      { say: 'empcard.who', params: names(ctx) },
      {
        chips: without.map((t) => ({ label: t.name })),
        reply: true,
        then: (picked) => employeeCard({ ...ctx, params: { ...ctx.params, name: without[picked].name } }).slice(1),
      },
    ];
  const m = memberOf(team, asked) ?? (asked ? undefined : (team.find((t) => !t.hasCard) ?? team[team.length - 1]));
  const forThem = (member: TeamMember) => employeeCard({ ...ctx, params: { ...ctx.params, name: member.name } }).slice(1);
  if (!m) {
    const first = asked?.trim().split(' ')[0] ?? '';
    return [{ react: '👍' }, { say: asked ? 'empcard.notTeam' : 'team.none', params: { ...names(ctx), first } }, ...addTeammate(ctx, asked ? { name: asked.trim() } : {}, forThem)];
  }
  const b = biz(ctx);
  const p = {
    ...names(ctx),
    name: m.name,
    first: m.first,
    role: m.role,
    purpose: ctx.params?.note || 'travel',
    last4: cardLast4(m.name),
    budget: b.budget ?? 0,
  };
  if (team.find((t) => t.name === m.name)?.hasCard) return [{ react: '👍' }, { say: 'empcard.already', params: p }];
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
    { pause: 2600 },
    { emit: { type: 'invoice.paid', number } },
    {
      when: () => [
        { say: 'invoice.paid', params: { ...p, balance: ctx.account().balanceCents } },
        { card: 'receipt.invoice', params: p },
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
            chips: [{ label: `Remind ${open[0].client}`, glyph: 'check' }, { label: 'Not now' }],
            reply: true,
            then: (picked) => [{ say: picked === 0 ? 'invoices.reminded' : 'invoices.later', params: p }],
          },
        ];
      },
    },
  ];
}

/** Pay someone's flow without its opening reaction, for a flow that has already reacted. */
const payOn = (ctx: FlowContext, params: FlowParams) => FLOWS.pay({ ...ctx, params }).filter((b) => !('react' in b));

/**
 * A bill is a payment to the vendor's US bank account, added once as a business: Pay someone's flow. From the tile, the
 * bill that came in is shown first, so the vendor isn't out of nowhere.
 */
export function payBill(ctx: FlowContext): Beat[] {
  if (ctx.params?.name)
    return FLOWS.pay({ ...ctx, params: { ...ctx.params, vendor: true, country: ctx.params.country ?? 'us', currency: ctx.params.currency ?? 'USD' } });
  const { name: vendor, what, number, dueIn } = STORY_BILL;
  const bill = { ...names(ctx), vendor, amount: STORY_BILL.amount * 100, what, number, due: inDays(dueIn) };
  return [
    { react: '👍' },
    { say: 'bill.found', params: bill },
    { card: 'bill', params: bill },
    ...payOn(ctx, { name: STORY_BILL.name, country: 'us', amount: STORY_BILL.amount, currency: 'USD', note: STORY_BILL.note, vendor: true }),
  ];
}

/** Contract amounts the amount question offers, in dollars. */
const CONTRACT_OPTIONS = [500, 1_000, 2_500];

/**
 * A contractor is paid to their own bank, at home or abroad, in their currency: Pay someone's flow, in dollars. From the
 * tile it asks who first, Priya one tap away; someone typed in is asked where they bank and how much.
 */
export function payContractor(ctx: FlowContext): Beat[] {
  const given = ctx.params?.name ? ctx.params : undefined;
  if (given) return FLOWS.pay({ ...ctx, params: { ...given, country: given.country ?? 'us', currency: 'USD' } });
  const askAmount = (name: string, country: string): Beat[] => [
    { say: 'contractor.amount', params: { first: name.split(' ')[0] } },
    { amount: true, options: CONTRACT_OPTIONS, then: (usd) => payOn(ctx, { name, country, amount: usd, currency: 'USD' }) },
  ];
  const named = (name: string): Beat[] => {
    if (name === STORY_CONTRACTOR.name) {
      const { country, amount, note } = STORY_CONTRACTOR;
      return payOn(ctx, { name, country, amount, currency: 'USD', note });
    }
    const known = recipientNamed(name);
    if (known) return askAmount(known.name, known.bank.country.code);
    const places = CONTRACTOR_COUNTRIES.map((code) => BANK_COUNTRIES.find((c) => c.code === code)!);
    return [
      { say: 'contractor.where', params: { first: name.split(' ')[0] } },
      { chips: places.map((c) => ({ label: c.name, flag: c.code })), reply: true, then: (picked) => askAmount(name, places[picked].code) },
    ];
  };
  return [
    { react: '👍' },
    { say: 'contractor.who', params: names(ctx) },
    { name: true, suggestion: STORY_CONTRACTOR.name, other: 'contractor.who.other', named },
  ];
}

/** Everyone on the team, in one run: previewed, then one approval for every row. */
export function runPayroll(ctx: FlowContext): Beat[] {
  const team = teamOf(ctx);
  if (!team.length) return [{ react: '👍' }, { say: 'payroll.none', params: names(ctx) }, ...addTeammate(ctx, {}, () => runPayroll(ctx).slice(1))];
  const total = payrollTotal(team);
  const rows = team.map((m) => ({ title: m.name, detail: `To ${m.bank.name} •••• ${m.bank.last4}`, amount: usd2(m.pay), incoming: false, initials: initials(m.name) }));
  const params = { ...names(ctx), count: team.length, people: firstNames(team), total, rows: JSON.stringify(rows) };
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
      'approval.over',
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
  teammate: () => 'Add a teammate',
  empcard: (ctx) => (ctx.params?.name ? `Card for ${ctx.params.name.split(' ')[0]}` : 'Team card'),
  invoice: (ctx) => `${ctx.params?.name ?? STORY_INVOICE.client} invoice`,
  invoices: () => 'Invoices',
  bill: (ctx) => `${ctx.params?.name ?? STORY_BILL.name} bill`,
  contractor: (ctx) => (ctx.params?.name ? `Pay ${ctx.params.name.split(' ')[0]}` : 'Pay a contractor'),
  payroll: () => 'Payroll',
};

/** What a setup on the way to a business task is for, so a no to it says what's on hold. */
export const BUSINESS_HELD: Partial<Record<ActionId, (p?: FlowParams) => string>> = {
  team: () => 'the team budget',
  teammate: () => 'adding them to the team',
  empcard: (p) => (p?.name ? `${p.name.split(' ')[0]}’s card` : 'the card'),
  invoice: () => 'the invoice',
  invoices: () => 'checking invoices',
  bill: (p) => `paying ${p?.name ?? STORY_BILL.name}`,
  contractor: (p) => (p?.name ? `paying ${p.name.split(' ')[0]}` : 'paying your contractor'),
  payroll: () => 'payroll',
};

/** The most a business run spends (USD cents), so a jump to it can top the balance up first. */
export function businessSpend(flow: 'bill' | 'contractor' | 'payroll', params?: FlowParams, team: readonly TeamMember[] = []): number {
  switch (flow) {
    case 'bill':
      return cents(params?.amount) ?? STORY_BILL.amount * 100;
    case 'contractor':
      return cents(params?.amount ?? STORY_CONTRACTOR.amount) ?? 0;
    case 'payroll':
      return payrollTotal(team);
    default: {
      const exhaustive: never = flow;
      return exhaustive;
    }
  }
}
