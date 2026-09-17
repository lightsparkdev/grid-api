/* The deployed store: records in Redis (Upstash, through Vercel's storage
   marketplace), files in Vercel Blob. Keys and blob paths carry the Vercel
   environment, so a preview's shares never sit beside production's:

     cards:{env}:rec:{id}       the ShareRecord (views held at 0; see below)
     cards:{env}:secret:{id}    { h: editTokenHash }
     cards:{env}:slug:{slug}    id
     cards:{env}:views:{id}     a counter, so two opens at once both count
     cards:{env}:rl:{bucket}    rate-limit counters, expiring

     cards/{env}/{id}/{role}-{stamp}.{ext}   blobs, public, immutable

   The view count lives outside the record so `INCR` can bump it without a
   read-modify-write; `get` folds it back in. A blob's name carries a stamp,
   so a re-render lands at a new URL and nothing (the CDN, X's cache) can hand
   out the old picture; the previous blob is deleted on a best-effort basis.
   Server only. */

import { Redis } from '@upstash/redis';
import { del, put } from '@vercel/blob';
import { timingSafeEqual } from 'crypto';
import { customAlphabet, nanoid } from 'nanoid';

import { hashToken } from './localFsStore';
import type { ShareStore } from './store';
import {
  MAX_BYTES,
  SHARE_FILE_TYPES,
  extensionFor,
  normalizeSlug,
  validSlug,
} from './types';
import type { ShareCreateInput, ShareFileRole, SharePatch, ShareRecord } from './types';

const ID_RE = /^[0-9a-z]{8}$/;
const newId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8);

interface Secret {
  h: string;
}

/** The env vars Vercel injects for the two stores. */
export function vercelStoreConfigured(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN && process.env.BLOB_READ_WRITE_TOKEN);
}

function environment(): string {
  return process.env.VERCEL_ENV ?? 'development';
}

class VercelStore implements ShareStore {
  private readonly redis: Redis;
  private readonly keyPrefix: string;
  private readonly blobPrefix: string;

  constructor() {
    this.redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
    const env = environment();
    this.keyPrefix = `cards:${env}:`;
    this.blobPrefix = `cards/${env}`;
  }

  private key(kind: 'rec' | 'secret' | 'slug' | 'views' | 'rl', name: string): string {
    return `${this.keyPrefix}${kind}:${name}`;
  }

  private async readRecord(id: string): Promise<ShareRecord | null> {
    if (!ID_RE.test(id)) return null;
    return this.redis.get<ShareRecord>(this.key('rec', id));
  }

  private async writeRecord(record: ShareRecord): Promise<void> {
    await this.redis.set(this.key('rec', record.id), { ...record, views: 0 });
  }

  async create(input: ShareCreateInput): Promise<{ record: ShareRecord; editToken: string }> {
    if (input.kind !== 'public' && input.kind !== 'pitch') throw new Error('bad-kind');

    let slug: string | null = null;
    if (input.kind === 'pitch') {
      slug = normalizeSlug(input.slug ?? '');
      if (!validSlug(slug)) throw new Error('slug-invalid');
      if (!(await this.slugAvailable(slug))) throw new Error('slug-taken');
    }

    const now = new Date().toISOString();
    const editToken = nanoid(24);
    const secret: Secret = { h: hashToken(editToken) };

    // Claim an id: SET NX on the record; a collision (one in 2.8e12) retries.
    let record: ShareRecord;
    for (;;) {
      const id = newId();
      record = {
        id,
        slug: slug ?? id,
        kind: input.kind,
        forName: input.forName ?? null,
        design: input.design,
        look: input.look ?? null,
        assets: { og: null, card: null, square: null },
        createdAt: now,
        updatedAt: now,
        views: 0,
      };
      const claimed = await this.redis.set(this.key('rec', id), record, { nx: true });
      if (claimed === 'OK') break;
    }
    await this.redis.set(this.key('secret', record.id), secret);

    if (slug) {
      const claimed = await this.redis.set(this.key('slug', slug), record.id, { nx: true });
      if (claimed !== 'OK') {
        // Lost a race for the slug; the record has no link, so drop it.
        await this.redis.del(this.key('rec', record.id), this.key('secret', record.id));
        throw new Error('slug-taken');
      }
    }
    return { record, editToken };
  }

  async get(idOrSlug: string): Promise<ShareRecord | null> {
    let id: string | null = ID_RE.test(idOrSlug) ? idOrSlug : null;
    if (id) {
      const found = await this.withViews(id);
      if (found) return found;
    }
    if (!validSlug(idOrSlug)) return null;
    id = await this.redis.get<string>(this.key('slug', idOrSlug));
    return id ? this.withViews(id) : null;
  }

  private async withViews(id: string): Promise<ShareRecord | null> {
    const [record, views] = await this.redis.mget<[ShareRecord | null, number | null]>(
      this.key('rec', id),
      this.key('views', id),
    );
    if (!record) return null;
    return { ...record, views: views ?? 0 };
  }

  async update(id: string, patch: SharePatch): Promise<ShareRecord | null> {
    const record = await this.readRecord(id);
    if (!record) return null;
    const before = fileUrlsOf(record);
    if (patch.design) record.design = { ...record.design, ...patch.design };
    if (patch.forName !== undefined) record.forName = patch.forName;
    if (patch.look !== undefined) record.look = patch.look;
    if (patch.assets) {
      for (const [role, url] of Object.entries(patch.assets)) {
        if (url !== undefined) record.assets[role as keyof ShareRecord['assets']] = url;
      }
    }
    record.updatedAt = new Date().toISOString();
    await this.writeRecord(record);
    // The files this publish replaced, if they were ours. Only now: until the
    // record pointed elsewhere, the public page was still showing them.
    const after = new Set(fileUrlsOf(record));
    for (const url of before) {
      if (!after.has(url) && isBlobUrl(url)) del(url).catch(() => {});
    }
    return this.withViews(id);
  }

  async verifyEditToken(id: string, token: string): Promise<boolean> {
    if (!ID_RE.test(id) || !token) return false;
    const secret = await this.redis.get<Secret>(this.key('secret', id));
    if (!secret?.h) return false;
    const a = Buffer.from(secret.h, 'hex');
    const b = Buffer.from(hashToken(token), 'hex');
    return a.length === b.length && timingSafeEqual(a, b);
  }

  async slugAvailable(slug: string): Promise<boolean> {
    if (!validSlug(slug)) return false;
    // A public share's slug is its id; keep the two namespaces from colliding.
    const taken = await this.redis.exists(this.key('slug', slug), this.key('rec', slug));
    return taken === 0;
  }

  async putFile(id: string, role: ShareFileRole, data: ArrayBuffer, contentType: string): Promise<string> {
    const types = SHARE_FILE_TYPES[role];
    if (!types || !types.includes(contentType)) throw new Error('bad-type');
    if (data.byteLength > MAX_BYTES[role]) throw new Error('too-large');
    if (!(await this.readRecord(id))) throw new Error('not-found');

    // Stamped, so a new file never overwrites the one the record still
    // shows; `update` deletes the old one once the record moves on.
    const stamp = Date.now().toString(36);
    const pathname = `${this.blobPrefix}/${id}/${role}-${stamp}.${extensionFor(contentType)}`;
    const blob = await put(pathname, Buffer.from(data), {
      access: 'public',
      contentType,
      addRandomSuffix: false,
      cacheControlMaxAge: 31536000,
    });
    return blob.url;
  }

  async recordView(id: string): Promise<number> {
    if (!ID_RE.test(id)) throw new Error('not-found');
    return this.redis.incr(this.key('views', id));
  }

  async allow(bucket: string, limit: number, windowSeconds: number): Promise<boolean> {
    const key = this.key('rl', bucket);
    const count = await this.redis.incr(key);
    if (count === 1) await this.redis.expire(key, windowSeconds);
    return count <= limit;
  }
}

/** Every file URL a record points at: its stills and its brand images. */
function fileUrlsOf(record: ShareRecord): string[] {
  const urls = [record.assets.og, record.assets.card, record.assets.square];
  urls.push(record.design.logoUrl, record.design.backgroundUrl);
  return urls.filter((u): u is string => typeof u === 'string');
}

function isBlobUrl(url: string): boolean {
  return /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//.test(url);
}

let instance: VercelStore | null = null;

export function vercelStore(): ShareStore {
  if (!instance) instance = new VercelStore();
  return instance;
}
