/* GET /api/team?key=…: unlock the team layer. With the right key, sets the
   team cookies and sends the visitor home. */

import { NextResponse } from 'next/server';

import { fail } from '@/lib/share/http';
import { TEAM_COOKIE, TEAM_UI_COOKIE, teamCookieValue, teamKey } from '@/lib/share/team';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const YEAR = 60 * 60 * 24 * 365;

export async function GET(req: Request) {
  const key = teamKey();
  const value = teamCookieValue();
  if (!key || !value) return fail('no-team-key', 404);

  const url = new URL(req.url);
  if (url.searchParams.get('key') !== key) return fail('bad-key', 401);

  const res = NextResponse.redirect(new URL('/', url), 303);
  const secure = process.env.NODE_ENV === 'production';
  res.cookies.set(TEAM_COOKIE, value, { httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: YEAR });
  res.cookies.set(TEAM_UI_COOKIE, '1', { httpOnly: false, secure, sameSite: 'lax', path: '/', maxAge: YEAR });
  return res;
}
