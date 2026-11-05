import { Redis } from '@upstash/redis';

/* Spend guards for the model: messages per visitor in a window, and model
   calls per day across everyone. Counts live in Upstash when the deploy has
   it (the same KV_REST_* variables the cards demo uses), and in memory
   otherwise: fine locally, per instance in production. */

const PER_VISITOR = Number(process.env.AGENT_RATE_LIMIT ?? 20);
const WINDOW_SECONDS = 10 * 60;
const PER_DAY = Number(process.env.AGENT_DAILY_CAP ?? 2000);

const redis =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN })
    : null;
const env = process.env.VERCEL_ENV ?? 'local';
const memory = new Map<string, { count: number; until: number }>();

async function bump(key: string, windowSeconds: number): Promise<number> {
  if (redis) {
    const full = `agents:${env}:${key}`;
    const count = await redis.incr(full);
    if (count === 1) await redis.expire(full, windowSeconds);
    return count;
  }
  const now = Date.now();
  const slot = memory.get(key);
  if (!slot || slot.until < now) {
    memory.set(key, { count: 1, until: now + windowSeconds * 1000 });
    return 1;
  }
  slot.count += 1;
  return slot.count;
}

export type LimitResult = 'ok' | 'visitor' | 'daily';

/** Count one message from this visitor; say whether it may go to the model. */
export async function takeTurn(visitor: string): Promise<LimitResult> {
  const mine = await bump(`rl:${visitor}`, WINDOW_SECONDS);
  if (mine > PER_VISITOR) return 'visitor';
  const day = new Date().toISOString().slice(0, 10);
  const all = await bump(`day:${day}`, 26 * 60 * 60);
  if (all > PER_DAY) return 'daily';
  return 'ok';
}
