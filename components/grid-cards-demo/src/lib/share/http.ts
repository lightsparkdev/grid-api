/* What the share route handlers have in common: error replies, the light
   design check, and the edit-token lookup. Server only. */

import { NextResponse } from 'next/server';

import type { CardDesign } from '@/data/design';

import { shareStore } from './store';
import type { ShareLook, ShareRecord } from './types';

export const EDIT_TOKEN_HEADER = 'x-edit-token';

const STATUS: Record<string, number> = {
  'slug-taken': 409,
  'slug-invalid': 400,
  'bad-kind': 400,
  'bad-type': 400,
  'too-large': 413,
  'not-found': 404,
  'rate-limited': 429,
};

export function fail(error: string, status?: number): NextResponse {
  return NextResponse.json({ error }, { status: status ?? STATUS[error] ?? 400 });
}

/** The caller's address, as Vercel's proxy reports it. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

/** Per-address caps on what anyone can write. A share is one create and a
 *  handful of uploads; the limits leave room for a busy afternoon of
 *  redesigns and stop a loop. */
export const RATE_LIMITS = {
  create: { limit: 40, windowSeconds: 3600 },
  upload: { limit: 400, windowSeconds: 3600 },
} as const;

/** A 429 if this address has used up its `kind` for the hour, else null. */
export async function rateLimited(req: Request, kind: keyof typeof RATE_LIMITS): Promise<NextResponse | null> {
  const { limit, windowSeconds } = RATE_LIMITS[kind];
  const ok = await shareStore().allow(`${kind}:${clientIp(req)}`, limit, windowSeconds);
  return ok ? null : fail('rate-limited');
}

/** A store error as a reply; anything unrecognized is a 500. */
export function failFrom(err: unknown): NextResponse {
  const message = err instanceof Error ? err.message : String(err);
  if (message in STATUS) return fail(message);
  console.error(err);
  return fail('internal', 500);
}

export async function readJsonBody(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return undefined;
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Enough of a check to keep junk out of the store; the renderer handles the
 *  rest. Object URLs can't be stored, so `blob:` sources become null; the
 *  client uploads those as files and patches them in. */
export function cleanDesign(input: unknown): CardDesign | null {
  if (!isRecord(input)) return null;
  if (typeof input.programName !== 'string' || typeof input.cardholderName !== 'string') return null;
  if (input.material !== 'plastic' && input.material !== 'metal') return null;
  const design = { ...input } as unknown as CardDesign;
  if (typeof design.logoUrl === 'string' && design.logoUrl.startsWith('blob:')) design.logoUrl = null;
  if (typeof design.backgroundUrl === 'string' && design.backgroundUrl.startsWith('blob:')) {
    design.backgroundUrl = null;
  }
  return design;
}

const HEX_RE = /^#[0-9a-f]{6}$/i;

/** A look, checked; `undefined` when the field is absent (leave it), `null`
 *  to clear it, or `false` when what was sent is not a look. */
export function cleanLook(input: unknown): ShareLook | null | undefined | false {
  if (input === undefined) return undefined;
  if (input === null) return null;
  if (!isRecord(input) || !isRecord(input.pose)) return false;
  const { surface } = input;
  const { rotX, rotY } = input.pose;
  if (typeof surface !== 'string' || !HEX_RE.test(surface)) return false;
  if (typeof rotX !== 'number' || typeof rotY !== 'number' || !Number.isFinite(rotX) || !Number.isFinite(rotY)) {
    return false;
  }
  return { surface: surface.toLowerCase(), pose: { rotX, rotY } };
}

/** The record at `idOrSlug`, only if the request's edit token is its own. */
export async function authorized(
  req: Request,
  idOrSlug: string,
): Promise<{ record: ShareRecord } | { error: NextResponse }> {
  const store = shareStore();
  const record = await store.get(idOrSlug);
  if (!record) return { error: fail('not-found') };
  const token = req.headers.get(EDIT_TOKEN_HEADER) ?? '';
  if (!(await store.verifyEditToken(record.id, token))) return { error: fail('bad-token', 401) };
  return { record };
}
