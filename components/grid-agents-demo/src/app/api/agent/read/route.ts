import { NextResponse, type NextRequest } from 'next/server';
import { readReply } from '@/lib/llm/anthropic';
import { takeStep } from '@/lib/llm/limits';
import { sameOrigin } from '@/lib/llm/origin';
import type { OpenKind, ReadRequest, ReadResponse } from '@/lib/llm/read';
import { VISITOR_HEADER, visitorOf } from '@/lib/visitor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 10;

const KINDS: OpenKind[] = ['approval', 'name', 'amount', 'choice'];
const MAX_BODY = 4_000;
const MAX_REPLY = 300;
const MAX_ASKED = 600;
const MAX_OPTIONS = 8;
const MAX_OPTION = 60;

const fallback = (reason: string, status = 200) => NextResponse.json({ fallback: reason } satisfies ReadResponse, { status });

/** The question and reply as the page sent them, checked and capped. */
function requestOf(raw: unknown): ReadRequest | null {
  if (!raw || typeof raw !== 'object') return null;
  const b = raw as Record<string, unknown>;
  if (!KINDS.includes(b.kind as OpenKind) || typeof b.reply !== 'string' || typeof b.asked !== 'string') return null;
  const reply = b.reply.replace(/\s+/g, ' ').trim();
  if (!reply || reply.length > MAX_REPLY) return null;
  const options = Array.isArray(b.options)
    ? b.options.filter((o): o is string => typeof o === 'string').slice(0, MAX_OPTIONS).map((o) => o.replace(/["\n]/g, ' ').trim().slice(0, MAX_OPTION))
    : undefined;
  const all = typeof b.all === 'number' && Number.isFinite(b.all) && b.all > 0 ? b.all : undefined;
  return { kind: b.kind as OpenKind, asked: b.asked.replace(/["\n]/g, ' ').slice(0, MAX_ASKED), options, all, reply: reply.replace(/"/g, "'") };
}

/**
 * A typed reply to the agent's open question (an approval, a name, an amount, a choice), read by the model: the
 * answer, or that it's about something else. Off, limited or failing, the page reads it the plain way.
 */
export async function POST(req: NextRequest) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (process.env.AGENT_MODEL_ENABLED !== 'true' || !key) return fallback('off');
  if (!sameOrigin(req)) return fallback('origin', 403);
  let request: ReadRequest | null;
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY) return fallback('invalid', 400);
    request = requestOf(JSON.parse(raw));
  } catch {
    return fallback('invalid', 400);
  }
  if (!request) return fallback('invalid', 400);

  const visitor = {
    browser: visitorOf(req.headers.get(VISITOR_HEADER)),
    network: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || 'local',
  };
  const limit = await takeStep(visitor);
  if (limit !== 'ok') return fallback(limit);

  try {
    const reading = await readReply(key, request);
    return reading ? NextResponse.json({ reading } satisfies ReadResponse) : fallback('unclear');
  } catch (e) {
    if (process.env.NODE_ENV === 'development') console.error('[read]', e);
    return fallback('error');
  }
}
