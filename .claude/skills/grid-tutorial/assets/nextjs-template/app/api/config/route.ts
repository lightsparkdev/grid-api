// Tutorial step 0 (sanity check): GET /config
// Confirms credentials work and returns supported currencies / platform settings.
import { NextResponse } from "next/server";
import { gridFetch } from "@/lib/grid";

export async function GET() {
  const result = await gridFetch("/config");
  return NextResponse.json(result.data, { status: result.status });
}
