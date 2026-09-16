/* POST /api/shares/{id}/files?role=…: store an upload for a share, with the
   edit token. The body is the raw file; `content-type` names its type. The
   record is patched to point at it: renders into `assets`, a logo or art into
   the design. */

import { NextResponse } from 'next/server';

import { authorized, fail, failFrom, rateLimited } from '@/lib/share/http';
import { shareStore } from '@/lib/share/store';
import { SHARE_FILE_TYPES } from '@/lib/share/types';
import type { ShareFileRole, SharePatch } from '@/lib/share/types';

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

  const store = shareStore();
  const id = auth.record.id;
  try {
    const url = await store.putFile(id, role, await req.arrayBuffer(), contentType);
    const patch: SharePatch = {};
    switch (role) {
      case 'og':
      case 'card':
      case 'square':
      case 'video':
        patch.assets = { [role]: url };
        break;
      case 'logo':
        patch.design = { ...auth.record.design, logoUrl: url };
        break;
      case 'art':
        patch.design = { ...auth.record.design, backgroundUrl: url };
        break;
      default: {
        const unhandled: never = role;
        return fail(`bad-role:${String(unhandled)}`);
      }
    }
    const record = await store.update(id, patch);
    if (!record) return fail('not-found');
    return NextResponse.json({ url, record });
  } catch (err) {
    return failFrom(err);
  }
}
