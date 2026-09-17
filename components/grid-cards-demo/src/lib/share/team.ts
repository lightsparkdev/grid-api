/* The team gate. Vanity slugs and pitch shares are for the team; a shared key
   in SHARE_TEAM_KEY unlocks them. Visiting `/api/team?key=...` sets a cookie
   holding the key's hash, and requests carrying it pass. Locally the gate is
   always open so the feature can be reviewed without setup. Server only. */

import { createHash } from 'crypto';

export const TEAM_COOKIE = 'cards_team';
/** Readable by the client, so the UI can show the team controls. */
export const TEAM_UI_COOKIE = 'cards_team_ui';

interface HasCookies {
  cookies: { get(name: string): { value: string } | undefined };
}

export function teamKey(): string | null {
  return process.env.SHARE_TEAM_KEY ?? null;
}

/** What the team cookie holds: the key's sha256 hex, or null with no key. */
export function teamCookieValue(): string | null {
  const key = teamKey();
  return key ? createHash('sha256').update(key).digest('hex') : null;
}

function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    const name = part.slice(0, eq).trim();
    if (!name) continue;
    try {
      out[name] = decodeURIComponent(part.slice(eq + 1).trim());
    } catch {
      out[name] = part.slice(eq + 1).trim();
    }
  }
  return out;
}

function cookieOf(req: Request | HasCookies, name: string): string | undefined {
  if ('cookies' in req && req.cookies && typeof req.cookies.get === 'function') {
    return req.cookies.get(name)?.value;
  }
  return parseCookies((req as Request).headers.get('cookie'))[name];
}

export function isTeamRequest(req: Request | HasCookies): boolean {
  if (process.env.NODE_ENV === 'development') return true;
  const expected = teamCookieValue();
  if (!expected) return false;
  return cookieOf(req, TEAM_COOKIE) === expected;
}
