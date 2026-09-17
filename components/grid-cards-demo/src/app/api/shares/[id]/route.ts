/* GET /api/shares/{id}: the record, by id or slug.
   PATCH /api/shares/{id}: change its design, name, or look, with the edit
   token. The assets are not patchable here: only an upload sets them, so
   every URL a share carries is a file of ours. */

import { NextResponse } from 'next/server';

import { authorized, cleanDesign, cleanLook, fail, failFrom, readJsonBody } from '@/lib/share/http';
import { shareStore } from '@/lib/share/store';
import type { SharePatch } from '@/lib/share/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const record = await shareStore().get(params.id);
  if (!record) return fail('not-found');
  return NextResponse.json({ record });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const auth = await authorized(req, params.id);
  if ('error' in auth) return auth.error;

  const body = (await readJsonBody(req)) as Partial<SharePatch> | undefined;
  if (!body || typeof body !== 'object') return fail('bad-body');

  const patch: SharePatch = {};
  if (body.design !== undefined) {
    const design = cleanDesign(body.design);
    if (!design) return fail('bad-design');
    patch.design = design;
  }
  if (body.forName !== undefined) {
    if (body.forName !== null && typeof body.forName !== 'string') return fail('bad-body');
    patch.forName = body.forName;
  }
  const look = cleanLook(body.look);
  if (look === false) return fail('bad-body');
  if (look !== undefined) patch.look = look;

  try {
    const record = await shareStore().update(auth.record.id, patch);
    if (!record) return fail('not-found');
    return NextResponse.json({ record });
  } catch (err) {
    return failFrom(err);
  }
}
