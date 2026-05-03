// Tutorial step 4: POST /sandbox/internal-accounts/{accountId}/fund
// Sandbox-only faucet. Body: { amount } in smallest currency units (cents).
// In production this is replaced by a real ACH/wire/crypto deposit + INCOMING_PAYMENT webhook.
import { NextRequest, NextResponse } from "next/server";
import { gridFetch } from "@/lib/grid";

export async function POST(req: NextRequest) {
  const { accountId, amount } = await req.json();
  if (!accountId || typeof amount !== "number") {
    return NextResponse.json({ error: "accountId and numeric amount required" }, { status: 400 });
  }
  const result = await gridFetch(`/sandbox/internal-accounts/${encodeURIComponent(accountId)}/fund`, {
    method: "POST",
    body: { amount },
  });
  return NextResponse.json(result.data, { status: result.status });
}
