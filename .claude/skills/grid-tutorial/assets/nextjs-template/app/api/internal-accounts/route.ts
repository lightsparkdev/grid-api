// Tutorial step 3: list internal accounts.
// Routes to the right Grid endpoint based on the query:
//   - Global Accounts (Embedded Wallet): GET /internal-accounts?customerId=...&type=EMBEDDED_WALLET
//   - Payouts and everything else:        GET /customers/internal-accounts?customerId=...
// All client query params are forwarded so the caller can pass currency filters etc.
import { NextRequest, NextResponse } from "next/server";
import { gridFetch } from "@/lib/grid";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const query: Record<string, string> = {};
  for (const [k, v] of params.entries()) query[k] = v;

  const path = query.type === "EMBEDDED_WALLET" ? "/internal-accounts" : "/customers/internal-accounts";

  const result = await gridFetch(path, { query });
  return NextResponse.json(result.data, { status: result.status });
}
