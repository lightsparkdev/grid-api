/* Core types + Grid API call shapes for the playground. The demo is
   action-driven: design the card, then freely trigger card actions on the app. */

/** Full API base for cURL — version lives here, not in operation paths. */
export const GRID_API_BASE_URL = 'https://api.lightspark.com/grid/2025-10-13';

export interface ApiCall {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  /** Short step label shown above the description. */
  title?: string;
  headers?: Record<string, string>;
  reqBody?: Record<string, unknown>;
  status: string;
  /** Response body to show. When omitted, apiCodeFormat synthesizes one from
   *  the request (the Global Accounts flows). */
  resBody?: Record<string, unknown>;
  /** Longer explanatory copy under the title. */
  note?: string;
  /** Inbound webhook (Grid → your endpoint): `path` is your full URL, and the
   *  curl drops the Grid `Authorization` header (Grid signs it instead). */
  inbound?: boolean;
}
