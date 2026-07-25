'use client';

export interface GridEnvelope {
  request: {
    method: string;
    path: string;
    headers: Record<string, string>;
    body?: unknown;
  };
  response: {
    status: number;
    body: unknown;
    headers?: Record<string, string>;
  };
}

export interface GridFetchOpts {
  body?: unknown;
  /** Extra headers forwarded verbatim (Grid-Wallet-Signature, Request-Id, Idempotency-Key). */
  headers?: Record<string, string>;
}

/**
 * Call the same-origin proxy. `path` is the Grid path (may contain the
 * {customerId} placeholder), e.g. "/customers/internal-accounts?customerId={customerId}".
 * Returns the {request, response} envelope; response.status mirrors Grid.
 */
export async function gridFetch(
  method: 'GET' | 'POST',
  path: string,
  opts: GridFetchOpts = {},
): Promise<GridEnvelope> {
  const res = await fetch(`/api/grid${path}`, {
    method,
    headers: {
      ...(opts.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(opts.headers ?? {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  return (await res.json()) as GridEnvelope;
}
