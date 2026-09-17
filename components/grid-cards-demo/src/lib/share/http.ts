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

/** A JSON body no bigger than a design has any business being. */
const MAX_JSON_BYTES = 64 * 1024;

export async function readJsonBody(req: Request): Promise<unknown> {
  const body = await readBodyCapped(req, MAX_JSON_BYTES);
  if (!body) return undefined;
  try {
    return JSON.parse(new TextDecoder().decode(body));
  } catch {
    return undefined;
  }
}

/** The request body, or null once it runs past `max` bytes: a declared
 *  length over the cap is refused unread, and a stream is cut off as it
 *  crosses it, so an oversized upload never sits whole in memory. */
export async function readBodyCapped(req: Request, max: number): Promise<ArrayBuffer | null> {
  const declared = Number(req.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > max) return null;
  if (!req.body) return new ArrayBuffer(0);
  const chunks: Uint8Array[] = [];
  let total = 0;
  const reader = req.body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > max) {
      reader.cancel().catch(() => {});
      return null;
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let at = 0;
  for (const c of chunks) {
    out.set(c, at);
    at += c.byteLength;
  }
  return out.buffer;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Whether a design's image source is one of ours: a root-relative path
 *  (the presets under `/assets`, the local store's `/api/shares/…/files`)
 *  or a file in this deployment's Blob store. Anything else, a stranger's
 *  server included, is not stored: the visitor's browser would fetch it. */
export function ownedImageUrl(url: string): boolean {
  if (url.startsWith('/') && !url.startsWith('//')) return true;
  const host = blobHost();
  if (!host) return false;
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && u.hostname === host;
  } catch {
    return false;
  }
}

/** The public hostname of this deployment's Blob store, from its id
 *  (`store_AbC…` is served at `abc….public.blob.vercel-storage.com`). */
function blobHost(): string | null {
  const id = process.env.BLOB_STORE_ID;
  if (!id) return null;
  return `${id.replace(/^store_/, '').toLowerCase()}.public.blob.vercel-storage.com`;
}

/** Enough of a check to keep junk out of the store; the renderer handles the
 *  rest. An image source that is not ours (an object URL, which can't be
 *  stored; a data URL; another server) becomes null; the client uploads the
 *  file and the upload route points the design at it. */
export function cleanDesign(input: unknown): CardDesign | null {
  if (!isRecord(input)) return null;
  if (typeof input.programName !== 'string' || typeof input.cardholderName !== 'string') return null;
  if (input.material !== 'plastic' && input.material !== 'metal') return null;
  const design = { ...input } as unknown as CardDesign;
  for (const key of ['logoUrl', 'backgroundUrl'] as const) {
    const v = design[key];
    if (v !== null && v !== undefined && (typeof v !== 'string' || !ownedImageUrl(v))) design[key] = null;
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
