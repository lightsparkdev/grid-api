import { NextRequest, NextResponse } from 'next/server';
import { verifyGridSignature } from '@/lib/gridWebhook';
import { pushEvent } from '@/lib/webhookEvents';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const raw = await req.text(); // RAW body, exactly as received (used for signature)
  const sig = req.headers.get('x-grid-signature') ?? '';
  const pubkey = process.env.GRID_WEBHOOK_PUBKEY ?? '';
  if (!verifyGridSignature(raw, sig, pubkey)) {
    return NextResponse.json({ error: { code: 'INVALID_SIGNATURE' } }, { status: 401 });
  }
  try {
    pushEvent(JSON.parse(raw));
  } catch {
    // Signature already passed; a non-JSON body is unexpected but non-fatal.
  }
  return NextResponse.json({ ok: true }, { status: 200 });
}
