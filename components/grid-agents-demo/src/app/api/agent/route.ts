import { NextResponse, type NextRequest } from 'next/server';
import { ACTIONS } from '@/data/actions';
import { CONNECTORS, type ConnectorId } from '@/data/connectors';
import { anthropicAdapter } from '@/lib/llm/anthropic';
import { takeTurn } from '@/lib/llm/limits';
import { systemPrompt, type PromptState } from '@/lib/llm/prompt';
import type { ChatTurn } from '@/lib/llm/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_TEXT = 300;
const MAX_TURNS = 8;
const MAX_REPLY = 360;
const FLOWS = ACTIONS.map((a) => a.id as string);
const VARIANTS = ['order', 'subscription'];

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
 * The model behind the composer. It answers in a fixed shape (a reply and at
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

  const state: PromptState = {
    connected: Boolean(body.state?.connected),
    balance: String(body.state?.balance ?? '$0.00').slice(0, 20),
    approvalAbove: String(body.state?.approvalAbove ?? '$10').slice(0, 20),
  };

  try {
    const answer = await anthropicAdapter(key).answer({
      system: systemPrompt(connector, state),
      turns,
      flows: FLOWS,
      variants: VARIANTS,
    });
    const reply = clean(answer.reply);
    if (!reply) return fallback('error');
    const flow = FLOWS.includes(answer.flow) ? answer.flow : undefined;
    const variant = flow === 'buy' && answer.variant === 'subscription' ? 1 : 0;
    return NextResponse.json({ reply, ...(flow ? { flow, variant } : {}) });
  } catch {
    return fallback('error');
  }
}
