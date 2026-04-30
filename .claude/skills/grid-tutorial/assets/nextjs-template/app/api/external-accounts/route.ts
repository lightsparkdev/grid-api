// Tutorial step 5: POST /customers/external-accounts
// Registers a destination bank/wallet/UPI/CLABE account for the customer.
// Per-corridor field shapes live in references/account-type-cheatsheet.md.
import { NextRequest, NextResponse } from "next/server";
import { gridFetch } from "@/lib/grid";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await gridFetch("/customers/external-accounts", { method: "POST", body });
  return NextResponse.json(result.data, { status: result.status });
}
