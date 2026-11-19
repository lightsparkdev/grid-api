import type { Block, ToolCall, ToolResult, Turn } from '@/lib/llm/tools';

/* The one record of the conversation, written as each thing happens: what the person typed, what they tapped and
   what the app did then, the model's calls, and what each call did. The model reads the conversation from here, so
   whatever happened is in front of it the moment it's asked: nothing waits for a step to finish to be recorded. */

/** How much of the conversation the model sees: the latest turns, starting on something from the person's side. */
const MAX_TURNS = 48;
const MAX_RESULT = 3_600;
const MAX_TYPED = 300;

export type Log = Turn[];

function add(log: Log, role: Turn['role'], content: Block[]) {
  if (!content.length) return;
  const last = log[log.length - 1];
  if (last?.role === role) log[log.length - 1] = { role, content: [...last.content, ...content] };
  else log.push({ role, content });
}

/** JSON that fits: long lists and strings give way before the whole is cut mid-way. */
function fit(value: Record<string, unknown>, max: number): string {
  let out = JSON.stringify(value);
  if (out.length <= max) return out;
  const trimmed = Object.fromEntries(
    Object.entries(value).map(([k, v]) => [k, Array.isArray(v) ? v.slice(0, 4).map((x) => (typeof x === 'string' ? x.slice(0, 240) : x)) : typeof v === 'string' ? v.slice(0, 400) : v]),
  );
  out = JSON.stringify(trimmed);
  return out.length <= max ? out : JSON.stringify({ ...trimmed, shown: undefined, account: undefined }).slice(0, max);
}

/** Something the person typed (or a tile's or suggestion's words, sent as theirs). It can't pass for a line from the app. */
export function typed(log: Log, text: string) {
  add(log, 'user', [{ type: 'text', text: text.replace(/<\/?app>/gi, '').slice(0, MAX_TYPED) || '…' }]);
}

/** Something from the app: what they tapped, and what happened then. */
export function fromApp(log: Log, event: Record<string, unknown>) {
  add(log, 'user', [{ type: 'text', text: `<app>${fit(event, MAX_RESULT)}</app>` }]);
}

const UNSETTLED = JSON.stringify({ status: 'cut_short', note: 'something else happened before this finished: what follows says what' });

/**
 * The model's calls, each paired with its result from the start, so the record always reads as a whole: a result is
 * filled in the moment its call is done, and one cut short (a tile tapped over it) says so.
 */
export function called(log: Log, calls: ToolCall[], asked?: End) {
  // What landed while the model was answering (they typed again) wasn't in front of it: it reads after the answer.
  const last = log[log.length - 1];
  const since = asked && last?.role === 'user' && log.length === asked.turns ? last.content.slice(asked.blocks) : [];
  if (since.length) log[log.length - 1] = { ...last, content: last.content.slice(0, asked!.blocks) };
  add(log, 'assistant', calls.map((c) => ({ type: 'tool_use', id: c.id, name: c.name, input: c.input })));
  add(log, 'user', calls.map((c) => ({ type: 'tool_result', tool_use_id: c.id, content: UNSETTLED })));
  add(log, 'user', since);
}

/** Where the record ends: what's added after this point came later. */
export type End = { turns: number; blocks: number };
export const endOf = (log: Log): End => ({ turns: log.length, blocks: log[log.length - 1]?.content.length ?? 0 });

/** What a call did, written over its place in the record. */
export function settled(log: Log, id: string, result: ToolResult, isError = false) {
  for (let t = log.length - 1; t >= 0; t--) {
    const at = log[t].content.findIndex((b) => b.type === 'tool_result' && b.tool_use_id === id);
    if (at < 0) continue;
    const content = log[t].content.slice();
    content[at] = { type: 'tool_result', tool_use_id: id, content: fit(result, MAX_RESULT), ...(isError && { is_error: true }) };
    log[t] = { ...log[t], content };
    return;
  }
}

/** The latest turns, cut so they start on the person's side, with no result left from a call that was cut off. */
export function windowOf(log: Log): Turn[] {
  const recent = log.slice(-MAX_TURNS);
  while (recent.length && recent[0].role !== 'user') recent.shift();
  if (!recent.length) return recent;
  const content = recent[0].content.filter((b) => b.type !== 'tool_result');
  return content.length ? [{ ...recent[0], content }, ...recent.slice(1)] : windowOf(recent.slice(1));
}
