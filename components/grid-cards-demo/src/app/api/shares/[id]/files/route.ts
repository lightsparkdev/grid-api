/* POST /api/shares/{id}/files?role=…: store an upload for a share, with the
   edit token. The body is the raw file; `content-type` names its type. The
   reply is the file's URL. The record is not touched: the client publishes
   every file of a share in one PATCH once they are all stored, so a failure
   part way leaves the public link as it was. */

import { NextResponse } from 'next/server';

import { authorized, fail, failFrom, rateLimited, readBodyCapped } from '@/lib/share/http';
import { shareStore } from '@/lib/share/store';
import { MAX_BYTES, SHARE_FILE_TYPES } from '@/lib/share/types';
import type { ShareFileRole } from '@/lib/share/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

function isRole(v: string | null): v is ShareFileRole {
  return v !== null && v in SHARE_FILE_TYPES;
}

export async function POST(req: Request, { params }: Ctx) {
  const auth = await authorized(req, params.id);
  if ('error' in auth) return auth.error;

  const role = new URL(req.url).searchParams.get('role');
  if (!isRole(role)) return fail('bad-role');
  const contentType = (req.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
  if (!SHARE_FILE_TYPES[role].includes(contentType)) return fail('bad-type');

  const limited = await rateLimited(req, 'upload');
  if (limited) return limited;

  // The cap is enforced while the body is read, not after it is all in
  // memory; a declared length over it is refused before any of it is.
  const body = await readBodyCapped(req, MAX_BYTES[role]);
  if (!body) return fail('too-large', 413);

  try {
    const url = await shareStore().putFile(auth.record.id, role, body, contentType);
    return NextResponse.json({ url });
  } catch (err) {
    return failFrom(err);
  }
}
