/* What the share route handlers have in common: error replies, the light
   design check, and the edit-token lookup. Server only. */

import { NextResponse } from 'next/server';

import type { CardDesign } from '@/data/design';

import { shareStore } from './store';
import type { ShareRecord } from './types';

export const EDIT_TOKEN_HEADER = 'x-edit-token';

const STATUS: Record<string, number> = {
  'slug-taken': 409,
  'slug-invalid': 400,
  'bad-kind': 400,
  'bad-type': 400,
  'too-large': 413,
  'not-found': 404,
};

export function fail(error: string, status?: number): NextResponse {
  return NextResponse.json({ error }, { status: status ?? STATUS[error] ?? 400 });
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
