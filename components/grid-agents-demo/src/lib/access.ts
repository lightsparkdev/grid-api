// The early-access password (PLAYGROUND_PASSWORD). Set, the playground asks for it before it opens and the agent route
// takes only unlocked requests; unset, everything is open. The browser keeps a hash of the password and sends it as a
// header, so changing the password locks everyone out again. Web Crypto only.
export const ACCESS_HEADER = 'x-playground-access';
const ACCESS_KEY = 'playground-access';

export async function accessToken(password: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`grid-agents-playground:${password}`));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Server: whether a request's token opens the playground. */
export async function hasAccess(token: string | null): Promise<boolean> {
  const password = process.env.PLAYGROUND_PASSWORD;
  if (!password) return true;
  return token === (await accessToken(password));
}

// Storage can be blocked in a cross-site iframe, so the token is kept in memory too.
let held: string | null = null;

export function readAccess(): string | null {
  try {
    held ??= window.localStorage.getItem(ACCESS_KEY);
  } catch {}
  return held;
}

export function saveAccess(token: string) {
  held = token;
  try {
    window.localStorage.setItem(ACCESS_KEY, token);
  } catch {}
}

/** Client: the header that carries the token, if there is one. */
export function accessHeaders(): Record<string, string> {
  const token = readAccess();
  return token ? { [ACCESS_HEADER]: token } : {};
}
