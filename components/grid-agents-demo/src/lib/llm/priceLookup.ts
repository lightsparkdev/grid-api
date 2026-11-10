import { Redis } from '@upstash/redis';
import { takeLookup } from './limits';

/* The current US price of a product we don't list, looked up on the web and remembered for a week. The model's
   own estimate stops at its training, so a new launch (the iPhone Duo) would otherwise get a guess. Remembered in
   Upstash when the deploy has it (the same KV_REST_* variables the limits use), in memory otherwise. */

const MODEL = process.env.AGENT_MODEL || 'claude-haiku-5-5';
const TIMEOUT_MS = 9_000;
const WEEK_SECONDS = 7 * 24 * 60 * 60;
const MAX_PRICE = 20_000;

const redis =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN })
    : null;
const env = process.env.VERCEL_ENV ?? 'local';
/** What each lookup found, or `none` when the search ran and found no price. Errors aren't remembered. */
const memory = new Map<string, number | 'none'>();

const keyOf = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);

/** USD, or undefined when there's no price to be found (or the search failed). */
export async function lookUpPrice(apiKey: string, product: string, brand?: string): Promise<number | undefined> {
  const named = brand && !product.toLowerCase().includes(brand.toLowerCase()) ? `${brand} ${product}` : product;
  const key = keyOf(named);
  const store = `agents:${env}:price:${key}`;
  const known = memory.get(key) ?? (redis ? await redis.get<number | 'none'>(store).catch(() => null) : null);
  if (known != null) return known === 'none' ? undefined : known;
  if (!(await takeLookup())) return undefined;
  const found = await search(apiKey, named);
  if (found === 'error') return undefined;
  memory.set(key, found);
  if (redis) await redis.set(store, found, { ex: WEEK_SECONDS }).catch(() => {});
  return found === 'none' ? undefined : found;
}

async function search(apiKey: string, named: string): Promise<number | 'none' | 'error'> {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 800,
        tools: [
          { type: 'web_search_20250305', name: 'web_search', max_uses: 2, user_location: { type: 'approximate', country: 'US' } },
          {
            name: 'price',
            description: 'Report the price you found.',
            input_schema: { type: 'object', properties: { price: { type: 'number', description: 'USD; 0 if there is no such product or no price.' } }, required: ['price'] },
          },
        ],
        messages: [
          {
            role: 'user',
            content: `Find the current US price of a new ${named} (the base version) at its maker's store or a major US retailer. Then call price with it in USD, or 0 if it doesn't exist or has no price.`,
          },
        ],
      }),
    });
    if (!res.ok) return 'error';
    const data = (await res.json()) as { content?: { type: string; name?: string; input?: { price?: unknown } }[] };
    const price = data.content?.find((c) => c.type === 'tool_use' && c.name === 'price')?.input?.price;
    if (typeof price !== 'number') return 'error';
    return price > 0 && price <= MAX_PRICE ? Math.round(price * 100) / 100 : 'none';
  } catch {
    return 'error';
  }
}
