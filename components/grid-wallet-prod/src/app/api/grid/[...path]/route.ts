import { NextRequest, NextResponse } from 'next/server';
import {
  isAllowed,
  redactHeaders,
  substituteCustomerId,
} from '../allowlist';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BASE = process.env.GRID_API_BASE_URL ?? 'https://api.lightspark.com/grid/2025-10-13';
const CUSTOMER_ID = process.env.GRID_CUSTOMER_ID ?? '';

// Client-supplied headers that must reach Grid verbatim.
const PASS_THROUGH = ['grid-wallet-signature', 'request-id', 'idempotency-key'];
// Grid response headers worth surfacing to the client/panel.
const ECHO_RESPONSE = ['retry-after', 'content-type'];

function basicAuth(): string {
  const id = process.env.GRID_CLIENT_ID ?? '';
  const secret = process.env.GRID_CLIENT_SECRET ?? '';
  return 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64');
}

async function handle(req: NextRequest, method: string): Promise<NextResponse> {
  const url = new URL(req.url);
  const pathname = url.pathname.replace(/^\/api\/grid/, ''); // e.g. "/quotes"
  if (!isAllowed(method, pathname)) {
    return NextResponse.json(
      {
        request: { method, path: pathname, headers: {} },
        response: { status: 403, body: { error: { code: 'PROXY_NOT_ALLOWED', message: `${method} ${pathname} is not proxied` } } },
      },
      { status: 403 },
    );
  }

  // Build target URL: substitute {customerId} in path + query.
  const query = substituteCustomerId(url.search, CUSTOMER_ID);
  const target = BASE + pathname + query;

  // Body: read raw, substitute {customerId}, forward as-is (byte stable for stamps).
  const rawBody = method === 'GET' ? undefined : await req.text();
  const body = rawBody ? substituteCustomerId(rawBody, CUSTOMER_ID) : undefined;

  const outHeaders: Record<string, string> = { Authorization: basicAuth() };
  if (body) outHeaders['Content-Type'] = 'application/json';
  for (const name of PASS_THROUGH) {
    const v = req.headers.get(name);
    if (v) outHeaders[name] = v;
  }

  let gridStatus = 502;
  let gridBody: unknown = { error: { code: 'PROXY_UPSTREAM_ERROR', message: 'No response from Grid' } };
  const echoed: Record<string, string> = {};
  try {
    const res = await fetch(target, { method, headers: outHeaders, body });
    gridStatus = res.status;
    const text = await res.text();
    try {
      gridBody = text ? JSON.parse(text) : {};
    } catch {
      gridBody = { raw: text };
    }
    for (const name of ECHO_RESPONSE) {
      const v = res.headers.get(name);
      if (v) echoed[name] = v;
    }
  } catch (e) {
    gridBody = { error: { code: 'PROXY_UPSTREAM_ERROR', message: String(e) } };
  }

  const envelope = {
    request: {
      method,
      path: pathname + query,
      headers: redactHeaders(outHeaders),
      body: body ? safeJson(body) : undefined,
    },
    response: { status: gridStatus, body: gridBody, headers: echoed },
  };
  // Mirror Grid's status as the proxy status so fetch semantics stay truthful.
  return NextResponse.json(envelope, { status: gridStatus >= 200 && gridStatus < 600 ? gridStatus : 502 });
}

function safeJson(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

export async function GET(req: NextRequest) {
  return handle(req, 'GET');
}
export async function POST(req: NextRequest) {
  return handle(req, 'POST');
}
