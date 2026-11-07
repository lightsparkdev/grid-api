/* Core types for the playground's API panel. */

/** Full API base for cURL — version lives here, not in operation paths. */
export const GRID_API_BASE_URL = 'https://api.lightspark.com/grid/2025-10-13';

/** Who signs a request: the platform with its API key, the agent with the
 *  token it got by redeeming its device code, or nobody (the device code is
 *  its own proof). */
export type ApiAuth = 'platform' | 'agent' | 'none';

export interface ApiCall {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  /** Defaults to `platform`. Ignored for inbound webhooks. */
  auth?: ApiAuth;
  /** Short step label shown above the description. */
  title?: string;
  headers?: Record<string, string>;
  reqBody?: Record<string, unknown>;
  status: string;
  resBody?: Record<string, unknown>;
  /** Longer explanatory copy under the title. */
  note?: string;
  /** Inbound webhook (Grid → your endpoint): `path` is your full URL, and the
   *  curl drops the Grid `Authorization` header (Grid signs it instead). */
  inbound?: boolean;
  /** The webhook's name in the OpenAPI spec (`webhooks.<name>`), shown the
   *  way the API reference shows it: `WEBHOOK agent-action`. */
  webhook?: string;
}
