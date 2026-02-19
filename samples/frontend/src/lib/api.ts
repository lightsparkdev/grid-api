export async function apiPost<T = unknown>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
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
