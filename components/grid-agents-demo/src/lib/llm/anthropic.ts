import type { ModelAdapter, ModelAnswer, ModelRequest } from './types';

/** A small, fast model: replies have to land like texts. */
const DEFAULT_MODEL = 'claude-haiku-5-5';
const MAX_TOKENS = 900;
const TIMEOUT_MS = 12_000;

const usd = (description: string) => ({ type: 'number', description });

/**
 * Claude, forced to answer through one tool whose input is the answer's
 * schema, so the reply always arrives as `{ replies, flow, ... }` and never
 * as free-form text. The tools and the fixed instructions are marked for
 * caching, so each turn only pays full price for what changed.
 */
export function anthropicAdapter(apiKey: string, model = process.env.AGENT_MODEL || DEFAULT_MODEL): ModelAdapter {
  return {
    async answer({ system, turns, flows, variants, countries, methods, connectors }: ModelRequest): Promise<ModelAnswer> {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        signal: AbortSignal.timeout(TIMEOUT_MS),
        body: JSON.stringify({
          model,
          max_tokens: MAX_TOKENS,
          system: [
            { type: 'text', text: system.fixed, cache_control: { type: 'ephemeral' } },
            { type: 'text', text: system.now },
          ],
          messages: turns.map((t) => ({ role: t.role, content: t.text })),
          tools: [
            {
              name: 'respond',
              description: 'Your answer to the person: what you say, the flow it starts (if any), and the details that flow needs.',
              input_schema: {
                type: 'object',
                properties: {
                  replies: {
                    type: 'object',
                    description: 'What you text back, once per app in its own voice: one or two short sentences, plain text, the same message in each.',
                    properties: Object.fromEntries(connectors.map((c) => [c, { type: 'string' }])),
                    required: connectors,
                  },
                  flow: { type: 'string', enum: [...flows, 'none'], description: 'The flow your reply starts, or none while you still need details.' },
                  suggestions: {
                    type: 'array',
                    items: { type: 'string' },
                    maxItems: 4,
                    description: 'Only when your reply asks a question: up to 4 likely answers the person can tap, each 1 to 3 words.',
                  },
                  name: { type: 'string', description: 'pay: the person being paid, as they were named (e.g. "Maria" or "Maria Lopez").' },
                  country: { type: 'string', enum: countries, description: 'pay: where that person banks.' },
                  amount: { type: 'number', description: 'pay: the amount, in `currency`. fund and cashout: the amount in USD.' },
                  currency: { type: 'string', description: 'pay: "USD", or the ISO code of the recipient’s local currency if they gave it in that currency.' },
                  note: { type: 'string', description: 'pay: what it’s for, a few words, if they said.' },
                  method: { type: 'string', enum: methods, description: 'fund: where the money comes from, if they said.' },
                  approve: usd('limits: the most you may spend without asking, USD.'),
                  daily: usd('limits: the daily limit, USD.'),
                  perTx: usd('limits: the per-payment limit, USD.'),
                  merchant: { type: 'string', description: 'buy subscription: the service, as it brands itself (e.g. "Spotify Premium").' },
                  price: usd('buy subscription: its monthly price, USD.'),
                  city: { type: 'string', description: 'agent: the city to stay in, as people name it ("Tokyo", "Mexico City").' },
                  checkIn: { type: 'string', description: 'agent: check-in date, YYYY-MM-DD.' },
                  checkOut: { type: 'string', description: 'agent: check-out date, YYYY-MM-DD.' },
                  guests: { type: 'number', description: 'agent: how many people are staying, only if they said.' },
                  variant: { type: 'string', enum: variants, description: 'buy: "order" for the saved ring light, "subscription" for a subscription.' },
                },
                required: ['replies', 'flow'],
              },
            },
          ],
          tool_choice: { type: 'tool', name: 'respond' },
        }),
      });
      if (!res.ok) throw new Error(`Anthropic ${res.status}: ${(await res.text()).slice(0, 300)}`);
      const data = (await res.json()) as { content?: { type: string; input?: unknown }[]; usage?: Record<string, number> };
      if (process.env.NODE_ENV === 'development' && data.usage) {
        const u = data.usage;
        console.info(`[agent] in ${u.input_tokens} · cache read ${u.cache_read_input_tokens ?? 0} · cache write ${u.cache_creation_input_tokens ?? 0} · out ${u.output_tokens}`);
      }
      const call = data.content?.find((c) => c.type === 'tool_use');
      const input = call?.input as Partial<ModelAnswer> | undefined;
      if (!input || typeof input.replies !== 'object' || !input.replies || typeof input.flow !== 'string') throw new Error('No answer');
      return input as ModelAnswer;
    },
  };
}
