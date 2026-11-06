import { NextResponse, type NextRequest } from 'next/server';
import type { FlowParams, FundMethod } from '@/apps/agents/flows';
import { ACTIONS, type ActionId } from '@/data/actions';
import { BANK_COUNTRIES, currencyFor } from '@/data/bankCountries';
import { CONNECTORS, type ConnectorId } from '@/data/connectors';
import { anthropicAdapter } from '@/lib/llm/anthropic';
import { takeTurn } from '@/lib/llm/limits';
import { systemPrompt, type PromptState } from '@/lib/llm/prompt';
import type { AgentResponse, ChatTurn, ModelAnswer } from '@/lib/llm/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_TEXT = 300;
const MAX_TURNS = 12;
const MAX_REPLY = 360;
const MAX_NAME = 40;
const FLOWS = ACTIONS.map((a) => a.id as string);
const VARIANTS = ['order', 'subscription'];
const COUNTRY_CODES = BANK_COUNTRIES.map((c) => c.code);
const METHODS: FundMethod[] = ['card', 'bank', 'usdc', 'bitcoin'];
const CONNECTOR_IDS = CONNECTORS.map((c) => c.id);

/** Why the composer falls back to a scripted line instead of the model. */
type Fallback = 'off' | 'origin' | 'invalid' | 'visitor' | 'daily' | 'error';

const fallback = (reason: Fallback, status = 200) => NextResponse.json({ fallback: reason }, { status });

/** Only the playground's own page may spend the key: the request comes from its own origin. */
function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).host === req.headers.get('host');
  } catch {
    return false;
  }
}

/** Plain text only, a few sentences: no code, no markdown. */
function clean(reply: string): string {
  return reply
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/[*_#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_REPLY);
}

interface Body {
  connector?: string;
  text?: string;
  history?: ChatTurn[];
  state?: Partial<PromptState>;
}

/**
 * The model behind the composer. It answers in a fixed shape (a reply in every app's voice and at
 * most one of the playground's flows), and the phone's brain plays that flow
 * exactly as a tile would. The model can't approve anything and never sees
 * more than the last few turns.
 */
export async function POST(req: NextRequest) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (process.env.AGENT_MODEL_ENABLED !== 'true' || !key) return fallback('off');
  if (!sameOrigin(req)) return fallback('origin', 403);

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return fallback('invalid', 400);
  }
  const connector = CONNECTORS.find((c) => c.id === body.connector)?.id as ConnectorId | undefined;
  const text = typeof body.text === 'string' ? body.text.trim() : '';
  if (!connector || !text || text.length > MAX_TEXT) return fallback('invalid', 400);

  const visitor = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || 'local';
  const limit = await takeTurn(visitor);
  if (limit !== 'ok') return fallback(limit);

  const history = (Array.isArray(body.history) ? body.history : [])
    .filter((t) => (t.role === 'user' || t.role === 'assistant') && typeof t.text === 'string' && t.text.trim())
    .slice(-MAX_TURNS)
    .map((t) => ({ role: t.role, text: t.text.slice(0, MAX_TEXT) }));
  // The model wants turns to alternate and to start with the person.
  const turns: ChatTurn[] = [];
  for (const t of [...history, { role: 'user' as const, text }]) {
    if (turns.length && turns[turns.length - 1].role === t.role) turns[turns.length - 1].text += `\n${t.text}`;
    else turns.push({ ...t });
  }
  while (turns.length && turns[0].role !== 'user') turns.shift();

  const money = (v: unknown, or: string) => (typeof v === 'string' ? v.slice(0, 20) : or);
  const recipients = (Array.isArray(body.state?.recipients) ? body.state.recipients : [])
    .filter((r) => typeof r?.name === 'string' && COUNTRY_CODES.includes(r?.country))
    .slice(0, 12)
    .map((r) => ({ name: r.name.slice(0, MAX_NAME), country: r.country }));
  const state: PromptState = {
    connected: Boolean(body.state?.connected),
    balance: money(body.state?.balance, '$0.00'),
    approvalAbove: money(body.state?.approvalAbove, '$10'),
    perTx: money(body.state?.perTx, '$1,000'),
    daily: money(body.state?.daily, '$2,500'),
    cardSaved: Boolean(body.state?.cardSaved),
    bankLinked: Boolean(body.state?.bankLinked),
    recipients,
  };

  try {
    const answer = await anthropicAdapter(key).answer({
      system: systemPrompt(connector, state),
      turns,
      flows: FLOWS,
      variants: VARIANTS,
      countries: COUNTRY_CODES,
      methods: METHODS,
      connectors: CONNECTOR_IDS,
    });
    const started = FLOWS.includes(answer.flow) ? (answer.flow as ActionId) : undefined;
    const params = started ? paramsFor(started, answer, recipients) : undefined;
    // A flow missing what it needs doesn't start; the reply stands on its own.
    const flow = params === null ? undefined : started;
    const replies: Partial<Record<ConnectorId, string>> = {};
    for (const id of CONNECTOR_IDS) {
      const raw = typeof answer.replies[id] === 'string' ? clean(answer.replies[id]) : '';
      if (raw) replies[id] = flow ? statement(raw) : raw;
    }
    const reply = replies[connector];
    if (!reply) return fallback('error');
    const variant = flow === 'buy' && answer.variant === 'subscription' ? 1 : 0;
    // Suggestions are for amounts, countries and choices: guessing someone's name would be odd.
    const suggestions = flow || /\bname\b/i.test(reply) ? [] : suggestionsOf(answer.suggestions);
    return NextResponse.json({
      reply,
      replies,
      ...(flow ? { flow, variant, ...(params ? { params } : {}) } : {}),
      ...(suggestions.length ? { suggestions } : {}),
    } satisfies AgentResponse);
  } catch (e) {
    if (process.env.NODE_ENV === 'development') console.error('[agent]', e);
    return fallback('error');
  }
}

/** A line that starts a flow doesn't ask anything (the flow does): a trailing question goes, if there's more to it. */
function statement(reply: string): string {
  if (!reply.endsWith('?')) return reply;
  const sentences = reply.match(/[^.!?]+[.!?]+/g) ?? [reply];
  return sentences.length > 1 ? sentences.slice(0, -1).join('').trim() : reply;
}

const COUNTRY_ALIASES: Record<string, string> = { us: 'us', usa: 'us', uk: 'gb', uae: 'ae', england: 'gb', america: 'us' };

/** A suggestion that names a country we pay, by its name in the list. */
function countryNamed(s: string) {
  const q = s.toLowerCase().replace(/\./g, '').trim();
  const code = COUNTRY_ALIASES[q];
  return BANK_COUNTRIES.find((c) => (code ? c.code === code : c.name.toLowerCase() === q));
}

/** Up to four short, plain suggestions. Offering countries, only ones a payment can go to, as the list names them. */
function suggestionsOf(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const all = raw
    .filter((s): s is string => typeof s === 'string')
    .map((s) => s.replace(/[*_#`>]/g, '').trim())
    .filter((s) => s && s.length <= 28);
  const countries = all.map(countryNamed);
  const offersCountries = countries.some(Boolean);
  return (offersCountries ? countries.filter((c) => c).map((c) => c!.name) : all).slice(0, 4);
}

const positive = (v: unknown, max: number) => (typeof v === 'number' && Number.isFinite(v) && v > 0 && v <= max ? v : undefined);
const text = (v: unknown, max: number) => {
  const s = typeof v === 'string' ? v.replace(/[^A-Za-z\u00C0-\u024F0-9 '’&.+-]/g, '').trim() : '';
  return s && s.length <= max ? s : undefined;
};

/**
 * The details a flow runs with, checked: what the model gave, kept only if it fits. `null` when the flow can't
 * start without something it didn't give (a payment needs who, where and how much).
 */
function paramsFor(flow: ActionId, a: ModelAnswer, saved: PromptState['recipients']): FlowParams | null | undefined {
  switch (flow) {
    case 'pay': {
      const name = text(a.name, MAX_NAME);
      const amount = positive(a.amount, 10_000_000);
      if (!name || !amount) return null;
      const first = name.split(' ')[0].toLowerCase();
      const known = saved.find((r) => r.name.toLowerCase() === name.toLowerCase() || r.name.split(' ')[0].toLowerCase() === first);
      const country = BANK_COUNTRIES.find((c) => c.code === (known?.country ?? a.country));
      if (!country) return null;
      const local = currencyFor(country);
      const currency = typeof a.currency === 'string' && a.currency.toUpperCase() === local ? local : 'USD';
      return { name, country: country.code, amount, currency, ...(text(a.note, 40) ? { note: text(a.note, 40) } : {}) };
    }
    case 'fund':
      return {
        ...(positive(a.amount, 10_000) ? { amount: a.amount } : {}),
        ...((METHODS as string[]).includes(a.method ?? '') ? { method: a.method as FundMethod } : {}),
      };
    case 'cashout':
      return positive(a.amount, 10_000) ? { amount: a.amount } : {};
    case 'limits':
      return {
        ...(positive(a.approve, 100_000) ? { approve: a.approve } : {}),
        ...(positive(a.perTx, 100_000) ? { perTx: a.perTx } : {}),
        ...(positive(a.daily, 100_000) ? { daily: a.daily } : {}),
      };
    case 'buy': {
      if (a.variant !== 'subscription') return undefined;
      const merchant = text(a.merchant, 32);
      const price = positive(a.price, 1_000);
      return merchant && price ? { merchant, price } : undefined;
    }
    case 'connect':
    case 'agent':
    case 'getpaid':
    case 'balance':
    case 'history':
      return undefined;
    default: {
      const exhaustive: never = flow;
      return exhaustive;
    }
  }
}
