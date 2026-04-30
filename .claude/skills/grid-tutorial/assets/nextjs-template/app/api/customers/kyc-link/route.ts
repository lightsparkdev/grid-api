// Tutorial step 2: GET /customers/kyc-link
// Returns a single-use hosted KYC URL. Customer opens it; sandbox auto-approves.
// Customer.status flips from PENDING to ACTIVE when verification completes.
import { NextRequest, NextResponse } from "next/server";
import { gridFetch } from "@/lib/grid";

export async function GET(req: NextRequest) {
  const platformCustomerId = req.nextUrl.searchParams.get("platformCustomerId") ?? undefined;
  const redirectUri = req.nextUrl.searchParams.get("redirectUri") ?? undefined;
  const result = await gridFetch("/customers/kyc-link", {
    query: { platformCustomerId, redirectUri },
  });
  return NextResponse.json(result.data, { status: result.status });
}
