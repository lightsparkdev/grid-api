import { vi } from "vitest";
import { buildProgram } from "../src/index";

export interface CapturedRequest {
  method: string;
  url: URL;
  path: string;
  query: Record<string, string>;
  body: unknown;
  headers: Record<string, string>;
}

export interface RunResult {
  request: CapturedRequest | null;
  calls: number;
  stdout: string;
}

/**
 * Drives the CLI through its real entry point (argv parsing → request building)
 * with `fetch` stubbed at the network boundary, and returns the HTTP request the
 * command produced. This is the stable boundary: internals can be rewritten and
 * these assertions still hold as long as the emitted request is unchanged.
 */
export async function runCli(
  args: string[],
  response: { status?: number; body?: unknown } = {}
): Promise<RunResult> {
  const prevTokenId = process.env.GRID_API_TOKEN_ID;
  const prevClientSecret = process.env.GRID_API_CLIENT_SECRET;
  const prevExitCode = process.exitCode;
  process.env.GRID_API_TOKEN_ID = "test-token-id";
  process.env.GRID_API_CLIENT_SECRET = "test-client-secret";

  let captured: CapturedRequest | null = null;
  let calls = 0;

  const fetchMock = vi.fn(async (input: string | URL, init?: RequestInit) => {
    calls += 1;
    const url = new URL(String(input));
    const headers = normalizeHeaders(init?.headers);
    captured = {
      method: init?.method ?? "GET",
      url,
      path: url.pathname,
      query: Object.fromEntries(url.searchParams.entries()),
      body: init?.body ? JSON.parse(init.body as string) : undefined,
      headers,
    };
    return new Response(JSON.stringify(response.body ?? { ok: true }), {
      status: response.status ?? 200,
      headers: { "content-type": "application/json" },
    });
  });

  const originalFetch = globalThis.fetch;
  globalThis.fetch = fetchMock as unknown as typeof fetch;

  const stdout: string[] = [];
  const logSpy = vi
    .spyOn(console, "log")
    .mockImplementation((...parts: unknown[]) => {
      stdout.push(parts.map(String).join(" "));
    });

  try {
    const program = await buildProgram();
    program.exitOverride();
    // A stable base URL keeps assertions on `path`/`query` independent of the
    // default production host.
    await program.parseAsync([
      "node",
      "grid",
      "--base-url",
      "https://api.test/grid/v1",
      ...args,
    ]);
  } finally {
    globalThis.fetch = originalFetch;
    logSpy.mockRestore();
    restoreEnv("GRID_API_TOKEN_ID", prevTokenId);
    restoreEnv("GRID_API_CLIENT_SECRET", prevClientSecret);
    // Actions signal failure via process.exitCode; reset so one test's failure
    // path can't bleed into the next test or the runner's exit status.
    process.exitCode = prevExitCode;
  }

  return { request: captured, calls, stdout: stdout.join("\n") };
}

function restoreEnv(key: string, value: string | undefined): void {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

function normalizeHeaders(
  headers: RequestInit["headers"]
): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return { ...(headers as Record<string, string>) };
}
