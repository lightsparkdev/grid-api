import { NextResponse, type NextRequest } from 'next/server';
import { isTailored, listedFor, listsBrand, type BuyRequest } from '@/apps/agents/products';
import { BANK_COUNTRIES } from '@/data/bankCountries';
import { CONNECTORS, type ConnectorId } from '@/data/connectors';
import { anthropicAdapter } from '@/lib/llm/anthropic';
import { takeStep, takeTurn } from '@/lib/llm/limits';
import { lookUpPrice } from '@/lib/llm/priceLookup';
import { systemPrompt, type PromptState } from '@/lib/llm/prompt';
import { CONNECTOR_IDS, TOOL_NAMES, type Block, type Say, type ToolCall, type Turn } from '@/lib/llm/tools';
import type { AgentResponse } from '@/lib/llm/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
/** The model, then a web price lookup for a product we don't list. */
export const maxDuration = 30;

const MAX_TEXT = 300;
const MAX_TURNS = 40;
const MAX_BLOCK = 2_400;
const MAX_BODY = 80_000;
const MAX_REPLY = 360;
const MAX_NAME = 40;
const COUNTRY_CODES = BANK_COUNTRIES.map((c) => c.code);

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

/** A promise to do something later that no tool does: remind, warn, flag, keep watch. */
const PROMISE =
  /\b(i['’]ll|i will|i['’]m going to|i can)\s+(also\s+)?(remind|warn|flag|alert|notify|ping|nudge|follow up|check (in |back )?with you|keep an eye|keep watch|watch (your|the) balance|let you know (if|when|before))/i;

/** A line never promises what no tool does: a sentence that does goes. */
function noPromises(reply: string): string {
  if (!PROMISE.test(reply)) return reply;
  return (reply.match(/[^.!?]+[.!?]*/g) ?? [reply]).filter((s) => !PROMISE.test(s)).join('').trim();
}

/** Plain text only, a few sentences: no code, no markdown. Never "crypto": it's stablecoins. */
function clean(reply: string): string {
  return stablecoinsOnly(noPromises(
    reply
      .replace(/\bcrypto(?:currenc(?:y|ies))?\b/gi, (m) => (m[0] === 'C' ? 'Stablecoins' : 'stablecoins'))
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]*)`/g, '$1')
      .replace(/[*_#>]/g, '')
      .replace(/\s+/g, ' ')
      .trim(),
  )).slice(0, MAX_REPLY);
}

const BITCOIN = /bitcoin|\bbtc\b|lightning/i;

/** The playground never goes near bitcoin: a sentence that names it goes, and a reply that was only that says what it does. */
function stablecoinsOnly(reply: string): string {
  if (!BITCOIN.test(reply)) return reply;
  const kept = (reply.match(/[^.!?]+[.!?]*/g) ?? [reply]).filter((s) => !BITCOIN.test(s)).join('').trim();
  const lower = reply === reply.toLowerCase();
  const what = lower ? 'i work in stablecoins, like usdc and usdt.' : 'I work in stablecoins, like USDC and USDT.';
  // What's left may lean on what went ("one of those"), so it follows the line that says what it does.
  return /stablecoin/i.test(kept) ? kept : `${what} ${kept}`.trim();
}

interface Body {
  connector?: string;
  turns?: Turn[];
  state?: Partial<PromptState>;
}

/** The conversation as the page kept it, checked: the person first, roles taking turns, known blocks, sizes capped. */
function turnsOf(raw: unknown): Turn[] | null {
  if (!Array.isArray(raw) || !raw.length || raw.length > MAX_TURNS) return null;
  const turns: Turn[] = [];
  for (const t of raw as Turn[]) {
    if ((t?.role !== 'user' && t?.role !== 'assistant') || !Array.isArray(t.content) || !t.content.length) return null;
    if (turns.length ? turns[turns.length - 1].role === t.role : t.role !== 'user') return null;
    const content: Block[] = [];
    for (const b of t.content) {
      if (b?.type === 'text' && typeof b.text === 'string' && b.text.trim()) content.push({ type: 'text', text: b.text.slice(0, MAX_BLOCK) });
      else if (b?.type === 'tool_use' && t.role === 'assistant' && typeof b.id === 'string' && (TOOL_NAMES as readonly string[]).includes(b.name) && b.input && typeof b.input === 'object')
        content.push({ type: 'tool_use', id: b.id.slice(0, 64), name: b.name, input: b.input });
      else if (b?.type === 'tool_result' && t.role === 'user' && typeof b.tool_use_id === 'string' && typeof b.content === 'string')
        content.push({ type: 'tool_result', tool_use_id: b.tool_use_id.slice(0, 64), content: b.content.slice(0, MAX_BLOCK), ...(b.is_error && { is_error: true }) });
      else return null;
    }
    turns.push({ role: t.role, content });
  }
  return turns[turns.length - 1].role === 'user' ? turns : null;
}

/**
 * The model behind the composer, one step at a time. The page sends the conversation (the person's messages and
 * the tool calls so far with what they did); the model answers with its next calls, which the phone carries out
 * and checks. The model can't approve anything.
 */
export async function POST(req: NextRequest) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (process.env.AGENT_MODEL_ENABLED !== 'true' || !key) return fallback('off');
  if (!sameOrigin(req)) return fallback('origin', 403);

  let body: Body;
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY) return fallback('invalid', 400);
    body = JSON.parse(raw) as Body;
  } catch {
    return fallback('invalid', 400);
  }
  const connector = CONNECTORS.find((c) => c.id === body.connector)?.id as ConnectorId | undefined;
  const turns = turnsOf(body.turns);
  if (!connector || !turns) return fallback('invalid', 400);
  const last = turns[turns.length - 1].content;
  const message = last.find((b): b is Extract<Block, { type: 'text' }> => b.type === 'text');
  if (message && message.text.length > MAX_TEXT) return fallback('invalid', 400);

  // A new message from the person counts against their limit; the steps that carry it out only against the day's.
  const visitor = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || 'local';
  const limit = message ? await takeTurn(visitor) : await takeStep(visitor);
  if (limit !== 'ok') return fallback(limit);

  const money = (v: unknown, or: string) => (typeof v === 'string' ? v.slice(0, 20) : or);
  const recipients = (Array.isArray(body.state?.recipients) ? body.state.recipients : [])
    .filter((r) => typeof r?.name === 'string' && COUNTRY_CODES.includes(r?.country))
    .slice(0, 12)
    .map((r) => ({ name: r.name.slice(0, MAX_NAME), country: r.country }));
  const state: PromptState = {
    connected: Boolean(body.state?.connected),
    balanceOn: Boolean(body.state?.balanceOn),
    balance: money(body.state?.balance, '$0.00'),
    approvalAbove: money(body.state?.approvalAbove, '$10'),
    perTx: money(body.state?.perTx, '$1,000'),
    daily: money(body.state?.daily, '$2,500'),
    cardSaved: Boolean(body.state?.cardSaved),
    bankLinked: Boolean(body.state?.bankLinked),
    recipients,
  };

  try {
    const { calls } = await anthropicAdapter(key).step({ system: systemPrompt(connector, state), turns });
    const out = await Promise.all(calls.map((c) => tidy(key, c, connector)));
    return NextResponse.json({ calls: out } satisfies AgentResponse);
  } catch (e) {
    if (process.env.NODE_ENV === 'development') console.error('[agent]', e);
    return fallback('error');
  }
}

/** Apps that text in all lowercase, names too; the rest write in sentence case. */
const LOWERCASE = new Set<ConnectorId>(['dot', 'instinct']);

/** Every app's line cleaned. One the model left out is filled from a sentence-case app's (lowercased for the apps that
 *  text that way), so no app shows another's casing. */
function saidBy(raw: unknown, connector: ConnectorId): Say | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const lines = raw as Record<string, unknown>;
  const given = Object.fromEntries(CONNECTOR_IDS.map((id) => [id, typeof lines[id] === 'string' ? clean(lines[id] as string) : ''])) as Record<ConnectorId, string>;
  const plain = (['yourapp', 'claude', 'muse', 'grok'] as ConnectorId[]).map((id) => given[id]).find(Boolean) ?? given[connector] ?? CONNECTOR_IDS.map((id) => given[id]).find(Boolean);
  if (!plain) return undefined;
  return Object.fromEntries(CONNECTOR_IDS.map((id) => [id, LOWERCASE.has(id) ? (given[id] || plain).toLowerCase() : given[id] || plain])) as Say;
}

/** A line that starts something doesn't ask anything (the tools do): a trailing question goes, if there's more to it. */
function statement(line: string): string {
  if (!line.endsWith('?')) return line;
  const sentences = line.match(/[^.!?]+[.!?]+/g) ?? [line];
  return sentences.length > 1 ? sentences.slice(0, -1).join('').trim() : line;
}

/** A call made ready for the phone: its lines cleaned, taps checked, and a product we don't list priced from the web. */
async function tidy(key: string, call: ToolCall, connector: ConnectorId): Promise<ToolCall> {
  const said = saidBy(call.input.say, connector);
  const asks = call.name === 'reply' || call.name === 'offer_choices';
  const input: ToolCall['input'] = { ...call.input, say: said && !asks ? (Object.fromEntries(Object.entries(said).map(([id, l]) => [id, statement(l ?? '')])) as Say) : said };
  if (!input.say) delete input.say;
  if (call.name === 'reply') input.suggestions = suggestionsOf(input.suggestions, false);
  if (call.name === 'offer_choices') input.options = suggestionsOf(input.options, true);
  if (call.name === 'search') {
    const price = await priced(key, input);
    if (price) input.typical_price_usd = price;
  }
  return { ...call, input };
}

/** A product they named that we don't list gets its current price from the web; the model's estimate stops at its training. */
async function priced(key: string, input: Record<string, unknown>): Promise<number | undefined> {
  const s = (k: string) => (typeof input[k] === 'string' ? (input[k] as string).slice(0, 60) : undefined);
  const r: BuyRequest = { query: s('query'), product: s('product'), brand: s('brand'), kind: s('kind') as BuyRequest['kind'] };
  if (r.kind === 'gift' || isTailored(r) || listedFor(r)) return undefined;
  // A product they named, or a brand we don't list with what they want from it ("buffalo trace bourbon").
  const named = r.product ?? (r.brand && !listsBrand(r.brand) ? r.query : undefined);
  return named ? lookUpPrice(key, named, r.brand) : undefined;
}

const COUNTRY_ALIASES: Record<string, string> = { us: 'us', usa: 'us', uk: 'gb', uae: 'ae', england: 'gb', america: 'us' };

/** A suggestion that names a country we pay, by its name in the list. */
function countryNamed(s: string) {
  const q = s.toLowerCase().replace(/\./g, '').trim();
  const code = COUNTRY_ALIASES[q];
  return BANK_COUNTRIES.find((c) => (code ? c.code === code : c.name.toLowerCase() === q));
}

/** Up to four short, plain taps. Under a plain reply never bare amounts (people type those); offering countries, only
 *  ones a payment can go to, as the list names them. */
function suggestionsOf(raw: unknown, amounts: boolean): string[] {
  if (!Array.isArray(raw)) return [];
  const all = raw
    .filter((s): s is string => typeof s === 'string')
    .map((s) => s.replace(/[*_#`>]/g, '').trim())
    .filter((s) => s && s.length <= 28 && (amounts || !/^[$€£¥₹]?\s*\d[\d,.]*\s*\w{0,4}$/.test(s)));
  const countries = all.map(countryNamed);
  const offersCountries = countries.filter(Boolean).length >= 2;
  return (offersCountries ? countries.filter((c) => c).map((c) => c!.name) : all).slice(0, 4);
}
