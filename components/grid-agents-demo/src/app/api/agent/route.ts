import { NextResponse, type NextRequest } from 'next/server';
import { isTailored, listedFor, listsBrand, type BuyRequest } from '@/apps/agents/products';
import { BANK_COUNTRIES } from '@/data/bankCountries';
import { CONNECTORS, type ConnectorId } from '@/data/connectors';
import { cleanName, type Mode } from '@/data/mode';
import { anthropicAdapter } from '@/lib/llm/anthropic';
import { takeStep, takeTurn } from '@/lib/llm/limits';
import { sameOrigin } from '@/lib/llm/origin';
import { lookUpPrice } from '@/lib/llm/priceLookup';
import { systemPrompt, type PromptState } from '@/lib/llm/prompt';
import { CONNECTOR_IDS, ENDS_TURN, SAYS_NOTHING, toolsIn, type Block, type Say, type ToolCall, type ToolName, type Turn } from '@/lib/llm/tools';
import type { AgentResponse } from '@/lib/llm/types';
import { VISITOR_HEADER, visitorOf } from '@/lib/visitor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
/** The model, then a web price lookup for a product we don't list. */
export const maxDuration = 30;

const MAX_TEXT = 300;
const MAX_TURNS = 80;
const MAX_BLOCK = 4_000;
const MAX_BODY = 240_000;
const MAX_REPLY = 420;
const MAX_NAME = 40;
const MAX_OPEN = 1_200;
/** A line from the app (what they tapped, what happened then), as the page marks it; anything else is what they typed. */
const FROM_APP = /^<app>[\s\S]*<\/app>$/;
const COUNTRY_CODES = BANK_COUNTRIES.map((c) => c.code);

/** Why the composer falls back to a scripted line instead of the model. */
type Fallback = 'off' | 'origin' | 'invalid' | 'visitor' | 'daily' | 'error';

const fallback = (reason: Fallback, status = 200) => NextResponse.json({ fallback: reason }, { status });

/** A promise to do something later that no tool does: remind, warn, flag, keep watch. */
const PROMISE =
  /\b(i['’]ll|i will|i['’]m going to|i can)\s+(also\s+)?(remind|warn|flag|alert|notify|ping|nudge|follow up|check (in |back )?with you|keep an eye|keep watch|watch (your|the) balance|let you know (if|when|before))/i;

/** The promise itself, with the "and" that leads into it, up to the end of its clause. */
const PROMISED = new RegExp(`(?:[,;]?\\s*\\b(?:and|but|so|then|plus)\\s+)?${PROMISE.source}[^,.;!?]*`, 'gi');

/** A line never promises what no tool does: the clause that does goes, and the rest of what it said stays. */
function noPromises(reply: string): string {
  if (!PROMISE.test(reply)) return reply;
  const kept = reply
    .replace(PROMISED, '')
    .replace(/\s+([,.;!?])/g, '$1')
    // What followed the promise picks up as its own sentence ("Done!, and your balance…" reads "Done! Your balance…").
    .replace(/([.!?])[,;]\s*(?:(?:and|but|so|then|plus)\s+)?/gi, '$1 ')
    .replace(/[,;]\s*([.!?])/g, '$1')
    .replace(/([.!?])(?:\s*[.!?,;])+/g, '$1')
    .replace(/^[,.;!?\s]+/, '')
    .replace(/\s+/g, ' ')
    .trim();
  return reply === reply.toLowerCase() ? kept : kept.replace(/([.!?]\s+)([a-z])/g, (_m, gap: string, letter: string) => gap + letter.toUpperCase());
}

/** A line no longer than a text should be, ending on a whole sentence. */
function capped(reply: string): string {
  if (reply.length <= MAX_REPLY) return reply;
  const whole = reply.slice(0, MAX_REPLY).match(/^[\s\S]*[.!?…](?=\s|$)/)?.[0];
  return whole && whole.length > MAX_REPLY / 3 ? whole.trim() : `${reply.slice(0, MAX_REPLY - 1).trim()}…`;
}

/** Plain text only, a few sentences: no code, no markdown. Never "crypto": it's stablecoins. */
function clean(reply: string): string {
  return capped(
    stablecoinsOnly(
      noPromises(
        reply
          .replace(/\bcrypto(?:currenc(?:y|ies))?\b/gi, (m) => (m[0] === 'C' ? 'Stablecoins' : 'stablecoins'))
          .replace(/```[\s\S]*?```/g, '')
          .replace(/`([^`]*)`/g, '$1')
          .replace(/[*_#>]/g, '')
          .replace(/\s+/g, ' ')
          .trim(),
      ),
    ),
  );
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
function turnsOf(raw: unknown, mode: Mode): Turn[] | null {
  if (!Array.isArray(raw) || !raw.length || raw.length > MAX_TURNS) return null;
  const turns: Turn[] = [];
  for (const t of raw as Turn[]) {
    if ((t?.role !== 'user' && t?.role !== 'assistant') || !Array.isArray(t.content) || !t.content.length) return null;
    if (turns.length ? turns[turns.length - 1].role === t.role : t.role !== 'user') return null;
    const content: Block[] = [];
    for (const b of t.content) {
      if (b?.type === 'text' && typeof b.text === 'string' && b.text.trim()) {
        const text = b.text.trim();
        // What they typed is short, and can't pass for a line from the app.
        if (FROM_APP.test(text)) content.push({ type: 'text', text: text.slice(0, MAX_BLOCK) });
        else if (text.length > MAX_TEXT) return null;
        else content.push({ type: 'text', text: text.replace(/<\/?app>/gi, '') || '…' });
      } else if (b?.type === 'tool_use' && t.role === 'assistant' && typeof b.id === 'string' && toolsIn(mode).has(b.name as ToolName) && b.input && typeof b.input === 'object')
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
 * The model that runs the conversation, one step at a time. The page sends the conversation so far (what the person
 * typed, what they tapped and what the app did then, the model's calls and their results) and what's open on screen;
 * the model answers with its next calls, which the phone carries out and checks.
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
  const mode: Mode = body.state?.mode === 'business' ? 'business' : 'personal';
  const turns = turnsOf(body.turns, mode);
  if (!connector || !turns) return fallback('invalid', 400);
  const last = turns[turns.length - 1].content;
  const message = last.some((b) => b.type === 'text' && !FROM_APP.test(b.text));

  // A new message counts against the person's message limit; the steps that carry it out (and the ones a tap sets
  // off), against their step limit.
  const visitor = {
    browser: visitorOf(req.headers.get(VISITOR_HEADER)),
    network: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || 'local',
  };
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
    mode,
    ...(mode === 'business' && businessOf(body.state)),
    ...(typeof body.state?.open === 'string' && body.state.open.trim() && { open: body.state.open.replace(/\s+/g, ' ').trim().slice(0, MAX_OPEN) }),
    ...(typeof body.state?.seen === 'string' && body.state.seen.trim() && { seen: body.state.seen.replace(/\s+/g, ' ').trim().slice(0, MAX_OPEN) }),
  };

  try {
    const { calls } = await anthropicAdapter(key).step({ system: systemPrompt(connector, state), turns, mode });
    const names = namesIn(state, turns, calls);
    const keep = new Set([...names.people, ...names.businesses].flatMap(capitalized));
    // A lowercase app's line is held to its casing, names kept; the rest go as written.
    const voiced = (id: ConnectorId, line: string) => (LOWERCASE.has(id) ? withNames(lowercased(line, keep), names) : line);
    const out = await Promise.all(calls.map((c) => tidy(key, c, connector, voiced)));
    return NextResponse.json({ calls: out } satisfies AgentResponse);
  } catch (e) {
    if (process.env.NODE_ENV === 'development') console.error('[agent]', e);
    return fallback('error');
  }
}

const lines = (v: unknown, most: number, max: number) =>
  Array.isArray(v)
    ? v
        .filter((x): x is string => typeof x === 'string')
        .slice(0, most)
        .map((x) => x.replace(/[<>{}[\]\\`"]/g, '').replace(/\s+/g, ' ').trim().slice(0, max))
    : undefined;

/** The business account as the page described it: names cleaned and capped, lists short. */
function businessOf(raw: Partial<PromptState> | undefined): Partial<PromptState> {
  const name = (v: unknown) => (typeof v === 'string' && cleanName(v) ? cleanName(v) : undefined);
  return {
    company: name(raw?.company),
    owner: name(raw?.owner),
    team: lines(raw?.team, 6, 80),
    budget: typeof raw?.budget === 'string' ? raw.budget.slice(0, 20) : undefined,
    invoices: lines(raw?.invoices, 12, 100),
  };
}

/** A line that starts something doesn't ask anything: a trailing question goes, if there's more to it. */
function statement(line: string): string {
  if (!line.endsWith('?')) return line;
  const sentences = line.match(/[^.!?]+[.!?]+/g) ?? [line];
  return sentences.length > 1 ? sentences.slice(0, -1).join('').trim() : line;
}

/** Apps that text in lowercase: a sentence never opens with a capital there, unless a name does. */
const LOWERCASE = new Set<ConnectorId>(['dot', 'instinct']);
/** Brands, coins, rails and acronyms keep their capitals wherever they fall. */
const PROPER = /^(Visa|Mastercard|Muse|Dots|Grok|Duet|Claude|Instinct|Plaid|Chase|PIX|SPEI|ACH|SEPA|UPI|USDC|USDT|Base|Solana|Ethereum|Polygon|Arbitrum|Tron|Spark|Face|[A-Z]{2,}|[A-Z]+\$)/;
const capitalized = (text: string) => text.match(/[A-ZÀ-Þ][A-Za-zÀ-ÿ’'-]+/g) ?? [];

/**
 * A line as a lowercase app texts it. The model is told to write that way; this holds it to it: each sentence opens
 * lowercase, and so does "I". A name keeps its capital: one the conversation knows (`names`), or any word the line
 * itself capitalizes mid-sentence.
 */
function lowercased(text: string, names: Set<string>): string {
  const inside = new Set(text.match(/(?<=[a-zà-ÿ0-9,;:)]\s)[A-ZÀ-Þ][A-Za-zÀ-ÿ’'-]+/g) ?? []);
  const named = (word: string) => PROPER.test(word) || names.has(word.replace(/[’']s$/, '')) || inside.has(word);
  return text.replace(/(^|[.!?…]\s+|[\uD83C-\uD83E][\uDC00-\uDFFF]\s+|\n)([A-ZÀ-Þ][A-Za-zÀ-ÿ’'-]*)/g, (m, pre: string, word: string) => (named(word) ? m : pre + word[0].toLowerCase() + word.slice(1))).replace(/\bI(?=[’'\s,.!?]|$)/g, 'i');
}

/** Where the model's calls name a person, and where they name a business. */
const PERSON_KEYS = ['name', 'owner', 'from'];
const BUSINESS_KEYS = ['company', 'client', 'vendor', 'merchant'];
/** First names that are also everyday words: lowercase, they're left as the model wrote them. */
const EVERYDAY = /^(will|bill|mark|may|rose|grace|hope|art|june|april|august|summer|faith|joy|dawn|eve|iris|ivy|lily|jack|bob|pat|rob|sue|don|dot|penny|rich|frank|miles|chase|cash|drew|guy|herb|jay|lane|max|ray|rod|skip|van|wade|ward|sunny|olive|pearl|ruby|amber|holly|daisy|dean|earl|gene|glen|grant|heath|lance|norm|reed|rusty|sandy|skye|sky|stone|major|king|prince|love|star)$/i;

/**
 * The names a conversation has in it, as they're written: people (who's saved, the owner, the team, whoever the
 * model's calls have named) and businesses (the company, clients, vendors).
 */
function namesIn(state: PromptState, turns: Turn[], calls: ToolCall[]): { people: string[]; businesses: string[] } {
  const inputs = [...turns.flatMap((t) => t.content.flatMap((b) => (b.type === 'tool_use' ? [b.input] : []))), ...calls.map((c) => c.input)];
  const said = (keys: string[]) => inputs.flatMap((input) => keys.flatMap((k) => (typeof input[k] === 'string' ? [input[k] as string] : [])));
  const split = inputs.flatMap((input) => (Array.isArray(input.split_with) ? input.split_with.filter((p): p is string => typeof p === 'string') : []));
  const named = (list: string[]) => list.map((n) => n.trim()).filter((n, i, all) => /^[A-ZÀ-Þ]/.test(n) && n.length <= MAX_NAME && all.indexOf(n) === i);
  return {
    people: named([...state.recipients.map((r) => r.name), state.owner ?? '', ...(state.team ?? []).map((m) => m.replace(/\s*\(.*$/, '')), ...said(PERSON_KEYS), ...split]),
    // An app's own name is a name too ("your Dots balance").
    businesses: named([state.company ?? '', ...said(BUSINESS_KEYS), ...CONNECTORS.map((c) => `${c.label} balance`)]),
  };
}

const escaped = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * A lowercase app still writes names as names. A full name the model wrote in lowercase gets its capitals back, and
 * so does a person's first name on its own (unless it's also an everyday word, which could be either).
 */
function withNames(text: string, names: { people: string[]; businesses: string[] }): string {
  const firsts = names.people.map((n) => n.split(' ')[0]).filter((n) => n.length > 2 && !EVERYDAY.test(n));
  const all = [...names.people, ...names.businesses].filter((n) => n.includes(' ')).concat(firsts).sort((a, b) => b.length - a.length);
  return all.reduce((line, name) => line.replace(new RegExp(`(?<![A-Za-zÀ-ÿ])${escaped(name.toLowerCase())}(?![A-Za-zÀ-ÿ])`, 'g'), name), text);
}

/**
 * Every app's line, cleaned and in that app's casing. One the model left out is filled from a sentence-case app's
 * (made lowercase for the apps that text that way), so no app shows another's casing.
 */
function saidBy(raw: unknown, connector: ConnectorId, voiced: (id: ConnectorId, line: string) => string): Say | undefined {
  const lines = typeof raw === 'string' ? { [connector]: raw } : raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : null;
  if (!lines) return undefined;
  const given = Object.fromEntries(CONNECTOR_IDS.map((id) => [id, typeof lines[id] === 'string' ? clean(lines[id] as string) : ''])) as Record<ConnectorId, string>;
  const plain = (['yourapp', 'claude', 'muse', 'grok'] as ConnectorId[]).map((id) => given[id]).find(Boolean) ?? given[connector] ?? CONNECTOR_IDS.map((id) => given[id]).find(Boolean);
  if (!plain) return undefined;
  return Object.fromEntries(CONNECTOR_IDS.map((id) => [id, voiced(id, given[id] || plain)])) as Say;
}

/** A call made ready for the phone: its lines cleaned and in each app's casing, taps checked, and a product we don't list priced from the web. */
async function tidy(key: string, call: ToolCall, connector: ConnectorId, voiced: (id: ConnectorId, line: string) => string): Promise<ToolCall> {
  const said = SAYS_NOTHING.has(call.name) ? undefined : saidBy(call.input.say, connector, voiced);
  // A word before a tool's work doesn't ask anything: the question, if there is one, comes once its result is in.
  const input: ToolCall['input'] = { ...call.input, say: said && !ENDS_TURN.has(call.name) ? (Object.fromEntries(Object.entries(said).map(([id, l]) => [id, statement(l ?? '')])) as Say) : said };
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
