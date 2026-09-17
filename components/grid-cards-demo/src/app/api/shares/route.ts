/* POST /api/shares: make a share. Pitch shares and wanted slugs are for the
   team. Replies with the record, its edit token (shown once), and its link. */

import { NextResponse } from 'next/server';

import { cleanDesign, cleanLook, fail, failFrom, rateLimited, readJsonBody } from '@/lib/share/http';
import { shareStore } from '@/lib/share/store';
import { isTeamRequest } from '@/lib/share/team';
import type { ShareCreateInput, ShareKind } from '@/lib/share/types';
import { shareUrl } from '@/lib/share/urls';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = (await readJsonBody(req)) as Partial<ShareCreateInput> | undefined;
  if (!body || typeof body !== 'object') return fail('bad-body');

  const kind = body.kind as ShareKind;
  if (kind !== 'public' && kind !== 'pitch') return fail('bad-kind');
  if (kind === 'pitch' || body.slug !== undefined) {
    if (!isTeamRequest(req)) return fail('team-only', 403);
  }
  if (body.slug !== undefined && typeof body.slug !== 'string') return fail('slug-invalid');
  if (body.forName !== undefined && body.forName !== null && typeof body.forName !== 'string') {
    return fail('bad-body');
  }

  const design = cleanDesign(body.design, null);
  if (!design) return fail('bad-design');
  const look = cleanLook(body.look);
  if (look === false) return fail('bad-body');

  const limited = await rateLimited(req, 'create');
  if (limited) return limited;

  try {
    const { record, editToken } = await shareStore().create({
      design,
      kind,
      slug: body.slug,
      forName: body.forName ?? null,
      look: look ?? null,
    });
    return NextResponse.json({ record, editToken, url: shareUrl(record.slug) });
  } catch (err) {
    return failFrom(err);
  }
}
