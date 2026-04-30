// Tutorial step 8: GET /transactions/{transactionId}
// Polled until status is COMPLETED or FAILED. In production you'd consume the
// OUTGOING_PAYMENT webhook instead of polling — see references/webhooks-followup.md.
import { NextRequest, NextResponse } from "next/server";
import { gridFetch } from "@/lib/grid";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const result = await gridFetch(`/transactions/${encodeURIComponent(id)}`);
  return NextResponse.json(result.data, { status: result.status });
}
