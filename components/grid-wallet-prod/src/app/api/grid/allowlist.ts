/** Pure helpers for the Grid proxy — no Next runtime, unit-tested directly. */

const ID = '[^/?]+'; // a path segment (e.g. AuthMethod:..., Quote:..., InternalAccount:...)

export const GRID_ALLOWLIST: { method: string; pattern: RegExp }[] = [
  { method: 'GET', pattern: new RegExp('^/auth/credentials$') },
  { method: 'POST', pattern: new RegExp('^/auth/credentials$') },
  { method: 'POST', pattern: new RegExp(`^/auth/credentials/${ID}/challenge$`) },
  { method: 'POST', pattern: new RegExp(`^/auth/credentials/${ID}/verify$`) },
  { method: 'GET', pattern: new RegExp('^/customers/internal-accounts$') },
  { method: 'GET', pattern: new RegExp('^/platform/internal-accounts$') },
  { method: 'GET', pattern: new RegExp('^/customers/external-accounts$') },
  { method: 'POST', pattern: new RegExp('^/customers/external-accounts$') },
  { method: 'GET', pattern: new RegExp('^/transactions$') },
  { method: 'GET', pattern: new RegExp(`^/transactions/${ID}$`) },
  { method: 'POST', pattern: new RegExp('^/quotes$') },
  { method: 'POST', pattern: new RegExp(`^/quotes/${ID}/execute$`) },
  { method: 'POST', pattern: new RegExp(`^/sandbox/internal-accounts/${ID}/fund$`) },
  { method: 'POST', pattern: new RegExp('^/sandbox/send$') },
];

/** `pathname` is the Grid path WITHOUT query string (e.g. "/quotes"). */
export function isAllowed(method: string, pathname: string): boolean {
  return GRID_ALLOWLIST.some(
    (r) => r.method === method.toUpperCase() && r.pattern.test(pathname),
  );
}

/** Redact the injected Basic auth so it can be echoed to the panel safely. */
export function redactHeaders(h: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(h)) {
    out[k] = k.toLowerCase() === 'authorization' ? 'Basic ***' : v;
  }
  return out;
}

/** Replace every {customerId} placeholder token with the real id. */
export function substituteCustomerId(text: string, customerId: string): string {
  return text.split('{customerId}').join(customerId);
}
