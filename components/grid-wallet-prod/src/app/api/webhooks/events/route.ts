import { NextResponse } from 'next/server';
import { listEvents } from '@/lib/webhookEvents';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ events: listEvents() });
}
