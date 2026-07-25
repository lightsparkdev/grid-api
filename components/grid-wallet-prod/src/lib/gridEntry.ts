import type { ApiCall } from '@/data/flow';
import type { GridEnvelope } from './gridClient';

const STATUS_TEXT: Record<number, string> = {
  200: 'OK', 201: 'Created', 202: 'Accepted', 400: 'Bad Request',
  401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 409: 'Conflict',
  429: 'Too Many Requests', 500: 'Internal Server Error', 502: 'Bad Gateway',
};

/** Map a proxy {request,response} envelope to the panel's ApiCall shape. */
export function envelopeToApiCall(env: GridEnvelope, title?: string): ApiCall {
  const method = env.request.method === 'GET' ? 'GET' : 'POST';
  const path = env.request.path.split('?')[0]; // panel shows the clean path
  const code = env.response.status;
  // Drop the redacted Authorization; the curl formatter re-adds "Basic $GRID_KEY".
  const headers = { ...env.request.headers };
  delete headers.Authorization;
  delete (headers as Record<string, string>).authorization;
  return {
    method,
    path,
    title,
    headers: Object.keys(headers).length ? headers : undefined,
    reqBody: (env.request.body as Record<string, unknown> | undefined) ?? undefined,
    resBody: env.response.body,
    realStatus: code,
    status: `${code} ${STATUS_TEXT[code] ?? ''}`.trim(),
  };
}
