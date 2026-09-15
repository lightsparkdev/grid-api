/* Where shares live. One interface, two homes: a folder on disk while the
   feature is built and reviewed locally (`LocalFsStore`), and Vercel Blob +
   Redis once it ships. Route handlers talk only to this; nothing above them
   knows which is in use. Server only. */

import { localFsStore } from './localFsStore';
import type { ShareCreateInput, ShareFileRole, SharePatch, ShareRecord } from './types';

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
}

/** The store for this deployment. */
export function shareStore(): ShareStore {
  // Phase 2 adds the Vercel store (Blob + Redis) here, picked by env.
  return localFsStore();
}
