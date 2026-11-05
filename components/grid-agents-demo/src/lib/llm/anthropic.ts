import type { ModelAdapter, ModelAnswer, ModelRequest } from './types';

/** A small, cheap model is plenty: a sentence or two and a pick from a list. */
const DEFAULT_MODEL = 'claude-haiku-4-5';
const MAX_TOKENS = 220;
const TIMEOUT_MS = 12_000;

/**
 * Claude, forced to answer through one tool whose input is the answer's
 * schema, so the reply always arrives as `{ reply, flow, variant }` and never
 * as free-form text.
 */
export function anthropicAdapter(apiKey: string, model = process.env.AGENT_MODEL || DEFAULT_MODEL): ModelAdapter {
  return {
    async answer({ system, turns, flows, variants }: ModelRequest): Promise<ModelAnswer> {
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
          system,
          messages: turns.map((t) => ({ role: t.role, content: t.text })),
          tools: [
            {
              name: 'respond',
              description: 'Your answer to the person: a short reply, and the flow it starts, if any.',
              input_schema: {
                type: 'object',
                properties: {
                  reply: { type: 'string', description: 'What you say back. One to three short sentences, plain text.' },
                  flow: { type: 'string', enum: [...flows, 'none'], description: 'The flow your reply starts, or none.' },
                  variant: { type: 'string', enum: variants, description: 'For buy: "order" or "subscription".' },
                },
                required: ['reply', 'flow'],
              },
            },
          ],
          tool_choice: { type: 'tool', name: 'respond' },
        }),
      });
      if (!res.ok) throw new Error(`Anthropic ${res.status}`);
      const data = (await res.json()) as { content?: { type: string; input?: unknown }[] };
      const call = data.content?.find((c) => c.type === 'tool_use');
      const input = call?.input as Partial<ModelAnswer> | undefined;
      if (!input || typeof input.reply !== 'string' || typeof input.flow !== 'string') throw new Error('No answer');
      return { reply: input.reply, flow: input.flow, variant: input.variant };
    },
  };
}
