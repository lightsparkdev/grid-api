import { Redis } from '@upstash/redis';

/* Spend guards for the model: messages per browser and per network in a window, model calls per day across
   everyone, and web price lookups per day. A browser is the random ID the page sends (lib/visitor); the network
   is the address Vercel saw, which a visitor can't set. The network cap is the backstop for anyone minting browser
   IDs, so it sits well above what a room of people behind one office, carrier or proxy address would send. Counts
   live in Upstash when the deploy has it (the same KV_REST_* variables the cards demo uses), and in memory
   otherwise: fine locally, per instance in production. */

const PER_BROWSER = Number(process.env.AGENT_RATE_LIMIT ?? 75);
const PER_NETWORK = Number(process.env.AGENT_NETWORK_LIMIT ?? 1_000);
const WINDOW_SECONDS = 10 * 60;
const PER_DAY = Number(process.env.AGENT_DAILY_CAP ?? 20_000);
/** Web price lookups a day across everyone. Each runs up to two paid searches, so they get their own, smaller cap. */
const LOOKUPS_PER_DAY = Number(process.env.AGENT_DAILY_LOOKUPS ?? 500);
/** The most model calls one message takes before the page stops the loop (the page enforces it too). */
export const STEPS_PER_MESSAGE = 6;

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

/**
 * The network an address belongs to. IPv4 is one address; IPv6 is the /64 a connection is handed, since a device
 * can pick any address inside it.
 */
export function networkOf(ip: string): string {
  const mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (mapped) return mapped[1];
  if (!ip.includes(':')) return ip;
  const [head, tail = ''] = ip.toLowerCase().split('::');
  const left = head ? head.split(':') : [];
  const right = ip.includes('::') && tail ? tail.split(':') : [];
  const groups = [...left, ...Array(Math.max(0, 8 - left.length - right.length)).fill('0'), ...right];
  return `${groups.slice(0, 4).map((g) => g.replace(/^0+(?=.)/, '')).join(':')}::/64`;
}

export type LimitResult = 'ok' | 'visitor' | 'daily';

/** Who a request is from: its browser (or, without one, its network) and its network. */
export interface Visitor {
  browser?: string;
  network: string;
}

async function windowed(kind: string, v: Visitor, perBrowser: number, perNetwork: number): Promise<LimitResult> {
  const net = networkOf(v.network);
  if ((await bump(`${kind}:b:${v.browser ?? `net:${net}`}`, WINDOW_SECONDS)) > perBrowser) return 'visitor';
  if ((await bump(`${kind}:n:${net}`, WINDOW_SECONDS)) > perNetwork) return 'visitor';
  return dailyCap();
}

/** Count one message; say whether it may go to the model. */
export const takeTurn = (v: Visitor) => windowed('rl', v, PER_BROWSER, PER_NETWORK);

/** Count one step that carries out a message: a model call after a tool ran. */
export const takeStep = (v: Visitor) => windowed('st', v, PER_BROWSER * STEPS_PER_MESSAGE, PER_NETWORK * STEPS_PER_MESSAGE);

const today = () => new Date().toISOString().slice(0, 10);

async function dailyCap(): Promise<LimitResult> {
  const all = await bump(`day:${today()}`, 26 * 60 * 60);
  return all > PER_DAY ? 'daily' : 'ok';
}

/** Count one web price lookup; past the day's cap the shelf prices from the model's estimate instead. */
export async function takeLookup(): Promise<boolean> {
  return (await bump(`lookups:${today()}`, 26 * 60 * 60)) <= LOOKUPS_PER_DAY;
}
