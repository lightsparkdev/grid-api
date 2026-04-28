export async function apiPost<T = unknown>(
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>,
): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
    body: body ? JSON.stringify(body) : undefined,
  })
  return parseResponse<T>(res)
}

export async function apiGet<T = unknown>(path: string): Promise<T> {
  const res = await fetch(path)
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
    throw new Error((data as Record<string, string>).error ?? text)
  }
  return data
}
