// Tutorial step 6: POST /quotes
// Creates a locked-rate quote. Always include `currency` in the destination
// object — it's the most common 400. Quotes expire in ~5 minutes.
import { NextRequest, NextResponse } from "next/server";
import { gridFetch } from "@/lib/grid";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await gridFetch("/quotes", { method: "POST", body });
  return NextResponse.json(result.data, { status: result.status });
}
