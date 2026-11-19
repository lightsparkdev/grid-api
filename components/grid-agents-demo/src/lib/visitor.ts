// A random ID for this browser, so the agent's per-visitor limit counts people rather than networks (an office, a
// carrier or a corporate proxy puts many people behind one address). It names no one and only keys a 10-minute count.
export const VISITOR_HEADER = 'x-playground-visitor';
const VISITOR_KEY = 'playground-visitor';
const VISITOR_ID = /^[a-z0-9-]{16,64}$/;

// Storage can be blocked in a cross-site iframe, so the ID is kept in memory too.
let held: string | null = null;

function visitorId(): string {
  if (held) return held;
  try {
    held = window.localStorage.getItem(VISITOR_KEY);
  } catch {}
  if (held && VISITOR_ID.test(held)) return held;
  held = crypto.randomUUID();
  try {
    window.localStorage.setItem(VISITOR_KEY, held);
  } catch {}
  return held;
}

/** Client: the header that carries this browser's ID. */
export function visitorHeaders(): Record<string, string> {
  return { [VISITOR_HEADER]: visitorId() };
}

/** Server: the browser's ID from a request, if it's one this page made. */
export function visitorOf(value: string | null): string | undefined {
  return value && VISITOR_ID.test(value) ? value : undefined;
}
