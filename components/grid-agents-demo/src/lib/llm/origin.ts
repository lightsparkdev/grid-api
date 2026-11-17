import type { NextRequest } from 'next/server';

/** Only the playground's own page may spend the key: the request comes from its own origin. */
export function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).host === req.headers.get('host');
  } catch {
    return false;
  }
}
