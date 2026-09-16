/* Where shares live. One interface, two homes: a folder on disk
   (`LocalFsStore`) and Vercel Blob + Redis (`VercelStore`). The deployed one
   is used wherever its env vars are present, which is every Vercel deployment
   and a local checkout after `vercel env pull`; `SHARE_STORE=local` forces
   the folder (the smoke test, working offline). Route handlers talk only to
   this; nothing above them knows which is in use. Server only. */

import { localFsStore } from './localFsStore';
import type { ShareCreateInput, ShareFileRole, SharePatch, ShareRecord } from './types';
import { vercelStore, vercelStoreConfigured } from './vercelStore';

export interface ShareStore {
  /** Make a record. Returns it with the edit token, shown to its maker once. */
  create(input: ShareCreateInput): Promise<{ record: ShareRecord; editToken: string }>;
  /** By id or slug. */
  get(idOrSlug: string): Promise<ShareRecord | null>;
  /** Apply a patch. The caller has verified the token. */
  update(id: string, patch: SharePatch): Promise<ShareRecord | null>;
  verifyEditToken(id: string, token: string): Promise<boolean>;
  slugAvailable(slug: string): Promise<boolean>;
  /** Store a file for a share; returns the URL it is served from. */
  putFile(id: string, role: ShareFileRole, data: ArrayBuffer, contentType: string): Promise<string>;
  /** Count one human open; returns the new total. */
  recordView(id: string): Promise<number>;
  /** Rate limiting: one more hit in this bucket is within `limit` per window. */
  allow(bucket: string, limit: number, windowSeconds: number): Promise<boolean>;
}

/** The store for this deployment. */
export function shareStore(): ShareStore {
  const forced = process.env.SHARE_STORE;
  if (forced === 'local') return localFsStore();
  if (forced === 'vercel' || vercelStoreConfigured()) return vercelStore();
  return localFsStore();
}
