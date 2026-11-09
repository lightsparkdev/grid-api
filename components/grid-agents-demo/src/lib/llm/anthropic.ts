import { CONNECTOR_IDS, TOOL_DEFS, TOOL_NAMES, type ToolCall, type ToolName, type Turn } from './tools';
import type { ModelAdapter, StepRequest, StepAnswer } from './types';

export const MODELS = { haiku: 'claude-haiku-5-5', sonnet: 'claude-sonnet-5-5' } as const;
/** The model behind the agent. Switch to MODELS.sonnet to compare; AGENT_MODEL overrides either. */
const MODEL: string = MODELS.haiku;

const MAX_TOKENS = 1500;
const TIMEOUT_MS = 15_000;

/** The last block of the conversation marked for caching, so the next step only pays full price for what's new. */
function cachedTurns(turns: Turn[]) {
  return turns.map((t, i) =>
    i === turns.length - 1 ? { ...t, content: t.content.map((b, j) => (j === t.content.length - 1 ? { ...b, cache_control: { type: 'ephemeral' } } : b)) } : t,
  );
}

const TOOLS = TOOL_DEFS.map((t, i) => (i === TOOL_DEFS.length - 1 ? { ...t, cache_control: { type: 'ephemeral' } } : t));

/**
 * Claude, planning one step at a time: it must call at least one tool, and the calls come back for the phone to
 * carry out. The tools, the fixed instructions and the conversation so far are marked for caching.
 */
export function anthropicAdapter(apiKey: string, model = process.env.AGENT_MODEL || MODEL): ModelAdapter {
  return {
    async step({ system, turns }: StepRequest): Promise<StepAnswer> {
      const started = Date.now();
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
        body: JSON.stringify({
          model,
          max_tokens: MAX_TOKENS,
          system: [
            { type: 'text', text: system.fixed, cache_control: { type: 'ephemeral' } },
            { type: 'text', text: system.now },
          ],
          messages: cachedTurns(turns),
          tools: TOOLS,
          // Sonnet and Opus reject a forced tool choice; they're told to always call one, and plain text becomes a reply.
          tool_choice: { type: /sonnet|opus/.test(model) ? 'auto' : 'any' },
        }),
      });
      if (!res.ok) throw new Error(`Anthropic ${res.status}: ${(await res.text()).slice(0, 300)}`);
      const data = (await res.json()) as { content?: { type: string; id?: string; name?: string; input?: unknown; text?: string }[]; usage?: Record<string, number> };
      const u = data.usage ?? {};
      const usage = { input: u.input_tokens ?? 0, cacheRead: u.cache_read_input_tokens ?? 0, cacheWrite: u.cache_creation_input_tokens ?? 0, output: u.output_tokens ?? 0 };
      if (process.env.NODE_ENV === 'development') {
        console.info(`[agent] in ${usage.input} · cache read ${usage.cacheRead} · cache write ${usage.cacheWrite} · out ${usage.output} · ${Date.now() - started}ms · ${model}`);
      }
      const calls: ToolCall[] = (data.content ?? [])
        .filter((c) => c.type === 'tool_use' && typeof c.id === 'string' && (TOOL_NAMES as readonly string[]).includes(c.name ?? ''))
        .map((c) => ({ id: c.id!, name: c.name as ToolName, input: (c.input ?? {}) as ToolCall['input'] }));
      const text = (data.content ?? []).flatMap((c) => (c.type === 'text' && c.text?.trim() ? [c.text.trim()] : [])).join(' ');
      if (!calls.length && text) calls.push({ id: `toolu_text_${started}`, name: 'reply', input: { say: Object.fromEntries(CONNECTOR_IDS.map((c) => [c, text])) } });
      if (!calls.length) throw new Error('No tool call');
      return { calls, usage };
    },
  };
}
