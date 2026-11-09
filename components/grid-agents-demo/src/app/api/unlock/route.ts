import { NextResponse, type NextRequest } from 'next/server';
import { ACCESS_HEADER, accessToken, hasAccess } from '@/lib/access';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Whether this browser's token still opens the playground. */
export async function GET(req: NextRequest) {
  return new NextResponse(null, { status: (await hasAccess(req.headers.get(ACCESS_HEADER))) ? 204 : 401 });
}

/** The password for a token; a wrong one waits a moment, so guessing is slow. */
export async function POST(req: NextRequest) {
  const password = process.env.PLAYGROUND_PASSWORD;
  if (!password) return NextResponse.json({ token: '' });
  const body = (await req.json().catch(() => null)) as { password?: unknown } | null;
  const given = typeof body?.password === 'string' ? body.password.trim() : '';
  if (given !== password) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return NextResponse.json({ wrong: true }, { status: 401 });
  }
  return NextResponse.json({ token: await accessToken(password) });
}
