// Tutorial step 7: POST /quotes/{quoteId}/execute
// Executes a previously-created quote. Returns a Transaction in PROCESSING; the
// transfer settles asynchronously (poll step 8 for completion).
//
// For Global Accounts withdrawals, pass `walletSignature` in the body — it is
// forwarded as the `Grid-Wallet-Signature` header. In sandbox the magic value
// "sandbox-valid-signature" is accepted (see references/global-accounts.md).
import { NextRequest, NextResponse } from "next/server";
import { gridFetch } from "@/lib/grid";

export async function POST(req: NextRequest) {
  const { quoteId, walletSignature, idempotencyKey } = await req.json();
  if (!quoteId) {
    return NextResponse.json({ error: "quoteId required" }, { status: 400 });
  }

  const headers: Record<string, string> = {};
  if (walletSignature) headers["Grid-Wallet-Signature"] = walletSignature;
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;

  const result = await gridFetch(`/quotes/${encodeURIComponent(quoteId)}/execute`, {
    method: "POST",
    headers: Object.keys(headers).length ? headers : undefined,
  });
  return NextResponse.json(result.data, { status: result.status });
}
