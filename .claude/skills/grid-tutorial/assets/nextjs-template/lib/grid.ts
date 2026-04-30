/**
 * Grid client setup.
 *
 * This file is the only place credentials are read. API routes call `gridFetch()`
 * to talk to Grid; the function adds HTTP Basic Auth and resolves the base URL.
 *
 * The official @lightsparkdev/grid SDK is also installed as a dependency. Once
 * comfortable with the HTTP shape, you can swap routes over to the SDK
 * (`import LightsparkGrid from '@lightsparkdev/grid'`) for typed call signatures.
 *
 * Note: this uses Node's `Buffer`. Routes default to the Node runtime, which is
 * what we want — do not add `export const runtime = "edge"` to the API routes
 * unless you also swap `Buffer.from(...).toString("base64")` for `btoa(...)`.
 */

const required = (name: "GRID_CLIENT_ID" | "GRID_CLIENT_SECRET" | "GRID_BASE_URL") => {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing env var ${name}. Copy .env.local.example to .env.local and fill it in, then restart 'npm run dev'.`,
    );
  }
  return value;
};

export type GridFetchOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  headers?: Record<string, string>;
};

export async function gridFetch<T = unknown>(
  path: string,
  { method = "GET", body, query, headers }: GridFetchOptions = {},
): Promise<{ status: number; data: T | { code?: string; message?: string } }> {
  const baseUrl = required("GRID_BASE_URL");
  const auth = Buffer.from(`${required("GRID_CLIENT_ID")}:${required("GRID_CLIENT_SECRET")}`).toString("base64");

  const url = new URL(`${baseUrl}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(headers ?? {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as T | { code?: string; message?: string };
  return { status: res.status, data };
}
