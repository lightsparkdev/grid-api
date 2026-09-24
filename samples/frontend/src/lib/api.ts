import { getSessionId } from './session'

export async function apiPost<T = unknown>(
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>,
): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Id': getSessionId(),
      ...extraHeaders,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return parseResponse<T>(res)
}

export async function apiPatch<T = unknown>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Id': getSessionId(),
    },
    body: JSON.stringify(body),
  })
  return parseResponse<T>(res)
}

export async function apiGet<T = unknown>(path: string): Promise<T> {
  const res = await fetch(path, {
    headers: { 'X-Session-Id': getSessionId() },
  })
  return parseResponse<T>(res)
}

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text()
  let data: T
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(text)
  }
  if (!res.ok) {
    const err = data as Record<string, string>
    throw new Error(err.error ?? (err.code ? `${err.code}: ${err.reason ?? err.message ?? ''}` : text))
  }
  return data
}
