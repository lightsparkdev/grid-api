import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Where a model-backed brain will run: it takes the conversation so far, the
 * connector and flow, and the agent's policy, and streams back the same steps
 * the scripted brain yields (lib/chatBrain.ts), Grid events included. Until a
 * model is wired in, the playground plays its scripts and this says so.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: {
        status: 501,
        code: 'NOT_IMPLEMENTED',
        message: 'The playground plays scripted conversations. A model-backed agent is not wired in yet.',
      },
    },
    { status: 501 },
  );
}
