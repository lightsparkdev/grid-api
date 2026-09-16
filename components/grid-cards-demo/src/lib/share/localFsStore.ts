/* The local store: a folder on disk, for building and reviewing the feature
   without any service behind it. Layout under `.shares/`:

     {id}/record.json   the ShareRecord
     {id}/secret.json   { editTokenHash }, kept out of the record
     {id}/files/        uploads, named {role}.{ext}
     slugs.json         { [slug]: id }

   Everything is read from disk on each call, so there is no state to share
   between instances. Server only. */

import { createHash, timingSafeEqual } from 'crypto';
import { mkdir, readFile, stat, writeFile } from 'fs/promises';
import { customAlphabet, nanoid } from 'nanoid';
import path from 'path';

import type { ShareStore } from './store';
import {
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  SHARE_FILE_TYPES,
  extensionFor,
  normalizeSlug,
  validSlug,
} from './types';
import type { ShareCreateInput, ShareFileRole, SharePatch, ShareRecord } from './types';

const ROOT = path.join(process.cwd(), '.shares');
const ID_RE = /^[0-9a-z]{8}$/;

const newId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8);

interface Secret {
  editTokenHash: string;
}

type SlugIndex = Record<string, string>;

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function dirOf(id: string): string {
  return path.join(ROOT, id);
}

function recordPath(id: string): string {
  return path.join(dirOf(id), 'record.json');
}

function secretPath(id: string): string {
  return path.join(dirOf(id), 'secret.json');
}

function filesDir(id: string): string {
  return path.join(dirOf(id), 'files');
}

const slugsPath = path.join(ROOT, 'slugs.json');

async function readJson<T>(file: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(file, 'utf8')) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw err;
  }
}

async function writeJson(file: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(value, null, 2));
}

async function readSlugs(): Promise<SlugIndex> {
  return (await readJson<SlugIndex>(slugsPath)) ?? {};
}

async function readRecord(id: string): Promise<ShareRecord | null> {
  if (!ID_RE.test(id)) return null;
  return readJson<ShareRecord>(recordPath(id));
}

async function exists(file: string): Promise<boolean> {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

/** Stored file names: `{role}.{ext}`. Anything else is a traversal attempt. */
export const FILE_NAME_RE = /^[a-z]+\.[a-z0-9]+$/;

/** Where a stored file lives, or null if there is none. */
export async function shareFilePath(id: string, name: string): Promise<string | null> {
  if (!ID_RE.test(id) || !FILE_NAME_RE.test(name)) return null;
  const file = path.join(filesDir(id), name);
  return (await exists(file)) ? file : null;
}

export function contentTypeFor(ext: string): string {
  switch (ext) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'svg':
      return 'image/svg+xml';
    case 'mp4':
      return 'video/mp4';
    default:
      return 'application/octet-stream';
  }
}

class LocalFsStore implements ShareStore {
  async create(input: ShareCreateInput): Promise<{ record: ShareRecord; editToken: string }> {
    if (input.kind !== 'public' && input.kind !== 'pitch') throw new Error('bad-kind');

    let id = newId();
    while (await exists(dirOf(id))) id = newId();

    let slug = id;
    if (input.kind === 'pitch') {
      slug = normalizeSlug(input.slug ?? '');
      if (!validSlug(slug)) throw new Error('slug-invalid');
      if (!(await this.slugAvailable(slug))) throw new Error('slug-taken');
    }

    const now = new Date().toISOString();
    const record: ShareRecord = {
      id,
      slug,
      kind: input.kind,
      forName: input.forName ?? null,
      design: input.design,
      look: input.look ?? null,
      assets: { og: null, card: null, square: null, video: null },
      createdAt: now,
      updatedAt: now,
      views: 0,
    };
    const editToken = nanoid(24);
    const secret: Secret = { editTokenHash: hashToken(editToken) };

    await mkdir(filesDir(id), { recursive: true });
    await writeJson(recordPath(id), record);
    await writeJson(secretPath(id), secret);
    if (slug !== id) {
      const slugs = await readSlugs();
      slugs[slug] = id;
      await writeJson(slugsPath, slugs);
    }
    return { record, editToken };
  }

  async get(idOrSlug: string): Promise<ShareRecord | null> {
    const byId = await readRecord(idOrSlug);
    if (byId) return byId;
    const slugs = await readSlugs();
    const id = slugs[idOrSlug];
    return id ? readRecord(id) : null;
  }

  async update(id: string, patch: SharePatch): Promise<ShareRecord | null> {
    const record = await readRecord(id);
    if (!record) return null;
    if (patch.design) record.design = { ...record.design, ...patch.design };
    if (patch.forName !== undefined) record.forName = patch.forName;
    if (patch.look !== undefined) record.look = patch.look;
    if (patch.assets) {
      for (const [role, url] of Object.entries(patch.assets)) {
        if (url !== undefined) record.assets[role as keyof ShareRecord['assets']] = url;
      }
    }
    record.updatedAt = new Date().toISOString();
    await writeJson(recordPath(id), record);
    return record;
  }

  async verifyEditToken(id: string, token: string): Promise<boolean> {
    if (!ID_RE.test(id) || !token) return false;
    const secret = await readJson<Secret>(secretPath(id));
    if (!secret) return false;
    const a = Buffer.from(secret.editTokenHash, 'hex');
    const b = Buffer.from(hashToken(token), 'hex');
    return a.length === b.length && timingSafeEqual(a, b);
  }

  async slugAvailable(slug: string): Promise<boolean> {
    if (!validSlug(slug)) return false;
    const slugs = await readSlugs();
    if (slugs[slug]) return false;
    // A public share's slug is its id; keep the two namespaces from colliding.
    return !(await exists(dirOf(slug)));
  }

  async putFile(id: string, role: ShareFileRole, data: ArrayBuffer, contentType: string): Promise<string> {
    const types = SHARE_FILE_TYPES[role];
    if (!types || !types.includes(contentType)) throw new Error('bad-type');
    const max = role === 'video' ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (data.byteLength > max) throw new Error('too-large');
    if (!(await readRecord(id))) throw new Error('not-found');

    const name = `${role}.${extensionFor(contentType)}`;
    await mkdir(filesDir(id), { recursive: true });
    await writeFile(path.join(filesDir(id), name), Buffer.from(data));
    return `/api/shares/${id}/files/${name}`;
  }

  async recordView(id: string): Promise<number> {
    const record = await readRecord(id);
    if (!record) throw new Error('not-found');
    record.views += 1;
    await writeJson(recordPath(id), record);
    return record.views;
  }

  private readonly buckets = new Map<string, { count: number; resetAt: number }>();

  /** In memory: one process locally, and the folder store never ships. */
  async allow(bucket: string, limit: number, windowSeconds: number): Promise<boolean> {
    const now = Date.now();
    const cur = this.buckets.get(bucket);
    if (!cur || cur.resetAt <= now) {
      this.buckets.set(bucket, { count: 1, resetAt: now + windowSeconds * 1000 });
      return true;
    }
    cur.count += 1;
    return cur.count <= limit;
  }
}

let instance: LocalFsStore | null = null;

export function localFsStore(): ShareStore {
  if (!instance) instance = new LocalFsStore();
  return instance;
}
