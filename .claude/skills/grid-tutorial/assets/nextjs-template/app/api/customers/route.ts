// Tutorial step 1: POST /customers
// Creates a customer (INDIVIDUAL or BUSINESS). Grid auto-provisions one internal
// account per supported currency. Save the returned customer.id — every subsequent
// step needs it. See references/payouts.md step 1 for the "why".
import { NextRequest, NextResponse } from "next/server";
import { gridFetch } from "@/lib/grid";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await gridFetch("/customers", { method: "POST", body });
  return NextResponse.json(result.data, { status: result.status });
}
