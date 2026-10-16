/* GET /api/shares/slug?slug=…: is this slug free? Team only. */

import { NextResponse } from 'next/server';

import { fail } from '@/lib/share/http';
import { shareStore } from '@/lib/share/store';
import { isTeamRequest } from '@/lib/share/team';
import { normalizeSlug, validSlug } from '@/lib/share/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!isTeamRequest(req)) return fail('team-only', 403);
  const slug = normalizeSlug(new URL(req.url).searchParams.get('slug') ?? '');
  const valid = validSlug(slug);
  const available = valid && (await shareStore().slugAvailable(slug));
  return NextResponse.json({ slug, available, valid });
}
