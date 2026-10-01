/* GET /api/shares/{id}/views: the view count, for the share's maker. */

import { NextResponse } from 'next/server';

import { authorized } from '@/lib/share/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

export async function GET(req: Request, { params }: Ctx) {
  const auth = await authorized(req, params.id);
  if ('error' in auth) return auth.error;
  return NextResponse.json({ views: auth.record.views });
}
