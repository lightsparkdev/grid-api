/* The browser's side of a share: make the record, render and upload the
   pictures, and remember the maker's edit tokens so a card they come back
   to is still theirs. */

import type { CardFrameSource, ExportPose } from '@/components/CardStage/export/exportRenderer';
import {
  hexToRgb,
  prepareHand,
  prepareTemplate,
  rgbToHex,
  type Palette,
  type Treatment,
} from '@/components/CardStage/export/compose';
import { renderStill, type StillFormat } from '@/components/CardStage/export/stills';
import type { CardDesign } from '@/data/design';
import type { ShareAssets, ShareCreateInput, ShareFileRole, ShareLook, SharePatch, ShareRecord } from './types';

export interface ShareHandle {
  record: ShareRecord;
  editToken: string;
  url: string;
}

export type ShareStage = 'record' | 'render' | 'upload' | 'done';
export interface ShareProgress {
  stage: ShareStage;
  /** Which picture, while rendering or uploading. */
  detail?: string;
}

class ShareError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
  ) {
    super(code);
  }
}

/** An angle the card was turned to, as the stage counts it (whole turns
 *  accumulate), brought into (-180, 180] and to a hundredth of a degree. */
function wrapDeg(deg: number): number {
  const w = ((((deg + 180) % 360) + 360) % 360) - 180;
  return Math.round((w === -180 ? 180 : w) * 100) / 100;
}

/** Resolves after the next paint. */
const paintFirst = () => new Promise<void>((r) => requestAnimationFrame(() => setTimeout(r, 0)));

async function api<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) {
    let code = `http-${res.status}`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) code = body.error;
    } catch {
      // No body.
    }
    throw new ShareError(code, res.status);
  }
  return (await res.json()) as T;
}

const json = (body: unknown, headers: Record<string, string> = {}): RequestInit => ({
  method: 'POST',
  headers: { 'content-type': 'application/json', ...headers },
  body: JSON.stringify(body),
});

export async function fetchShare(idOrSlug: string): Promise<ShareRecord | null> {
  const res = await fetch(`/api/shares/${encodeURIComponent(idOrSlug)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new ShareError(`http-${res.status}`, res.status);
  return ((await res.json()) as { record: ShareRecord }).record;
}

export async function checkSlug(slug: string): Promise<{ slug: string; available: boolean; valid: boolean }> {
  return api(`/api/shares/slug?slug=${encodeURIComponent(slug)}`, { method: 'GET' });
}

export async function fetchViews(id: string, editToken: string): Promise<number> {
  const r = await api<{ views: number }>(`/api/shares/${encodeURIComponent(id)}/views`, {
    method: 'GET',
    headers: { 'x-edit-token': editToken },
  });
  return r.views;
}

/** Store a file for a share; the URL it is served from. The record is not
 *  changed until `patchShare` publishes it. */
async function uploadFile(id: string, editToken: string, role: ShareFileRole, blob: Blob): Promise<string> {
  const r = await api<{ url: string }>(`/api/shares/${encodeURIComponent(id)}/files?role=${role}`, {
    method: 'POST',
    headers: { 'content-type': blob.type, 'x-edit-token': editToken },
    body: blob,
  });
  return r.url;
}

async function patchShare(id: string, editToken: string, patch: SharePatch): Promise<ShareRecord> {
  const r = await api<{ record: ShareRecord }>(`/api/shares/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', 'x-edit-token': editToken },
    body: JSON.stringify(patch),
  });
  return r.record;
}

/** The file behind a design's image, when the share needs its own copy: an
 *  upload living in this page as an object or data URL, or a stored file
 *  (another share's, when a design opened from a link is shared afresh;
 *  the server keeps only a share's own files). A preset (a root-relative
 *  path) is shared by reference and needs nothing. */
async function blobOf(url: string): Promise<Blob | null> {
  if (url.startsWith('/')) return null;
  try {
    const res = await fetch(url);
    return res.ok ? await res.blob() : null;
  } catch {
    return null;
  }
}

/** Whether a stored file's URL is share `id`'s own (its path carries the
 *  id, in either store), so an update need not upload it again. */
function ownFile(url: string, id: string): boolean {
  return url.includes(`/${id}/`);
}

/** The longest edge a stored raster keeps (the card's face is painted at
 *  2048 across, so nothing finer would show). */
const RASTER_MAX_EDGE = 2048;
const RASTER_QUALITY = 0.9;

/** A raster upload re-encoded for storage: no larger than the face needs,
 *  as WebP (alpha kept). A vector, or anything the browser can't decode, or
 *  a re-encoding that comes out bigger, is stored as it came. */
async function shrinkRaster(blob: Blob): Promise<Blob> {
  if (!/^image\/(png|jpeg|webp)$/.test(blob.type)) return blob;
  try {
    const bitmap = await createImageBitmap(blob);
    const k = Math.min(1, RASTER_MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * k));
    const h = Math.max(1, Math.round(bitmap.height * k));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return blob;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const webp = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/webp', RASTER_QUALITY));
    if (!webp || webp.type !== 'image/webp') return blob;
    return webp.size < blob.size || k < 1 ? webp : blob;
  } catch {
    return blob;
  }
}

export interface CreateShareOptions {
  exporter: CardFrameSource;
  design: CardDesign;
  kind: ShareCreateInput['kind'];
  slug?: string;
  forName?: string | null;
  /** The template's colors. */
  palette: Palette;
  /** The template, or the hand. */
  treatment?: Treatment;
  /** Which hand, with the hand. */
  hand?: string;
  /** How the card is held in the stills. */
  pose: ExportPose;
  onProgress?: (p: ShareProgress) => void;
  /** Update this share instead of making a new one. */
  existing?: { id: string; editToken: string; url: string };
}

/** The stills a share carries, and what they are for. */
const STILL_ROLES: Array<[StillFormat, keyof ShareAssets]> = [
  ['post', 'og'],
  ['square', 'square'],
];

/**
 * Make (or update) a share. A new one gets its record first, so the link
 * exists within a second. Then the files: any uploaded brand images, the
 * link preview still, and the square, each stored without touching the
 * record. One PATCH at the end publishes the design and every file
 * together, so a failure part way leaves the public link as it was (a new
 * one with no picture yet; an updated one showing its previous design and
 * picture), never a new design over an old picture.
 */
export async function createShare(opts: CreateShareOptions): Promise<ShareHandle> {
  const { exporter, design, onProgress } = opts;
  onProgress?.({ stage: 'record' });
  let id: string;
  let editToken: string;
  let url: string;
  // How the stills are staged, so the share page can stage the live card alike.
  const look: ShareLook = {
    surface: rgbToHex(hexToRgb(opts.palette.bg)),
    pose: { rotX: wrapDeg(opts.pose.rotX), rotY: wrapDeg(opts.pose.rotY) },
  };
  if (opts.existing) {
    ({ id, editToken, url } = opts.existing);
  } else {
    const made = await api<{ record: ShareRecord; editToken: string; url: string }>(
      '/api/shares',
      json({
        design,
        kind: opts.kind,
        slug: opts.slug,
        forName: opts.forName ?? null,
        look,
      } satisfies ShareCreateInput),
    );
    ({ editToken, url } = made);
    id = made.record.id;
  }

  // The brand's files, so the design loads anywhere. The design to publish
  // points at this share's own stored copies, not the browser's object URLs
  // or another share's files. A file this share already stored stays.
  const stored: CardDesign = { ...design };
  for (const [key, role] of [
    ['logoUrl', 'logo'],
    ['backgroundUrl', 'art'],
  ] as Array<['logoUrl' | 'backgroundUrl', ShareFileRole]>) {
    const v = design[key];
    if (typeof v !== 'string' || ownFile(v, id)) continue;
    const blob = await blobOf(v);
    if (blob) {
      onProgress?.({ stage: 'upload', detail: role });
      stored[key] = await uploadFile(id, editToken, role, await shrinkRaster(blob));
    }
  }

  // The link preview first: it is what the link shows. Each render is a
  // synchronous frame; a paint is let through before it so the tile's own
  // change (its spinner, its label) is on screen first.
  await prepareTemplate();
  if (opts.treatment === 'hand' && opts.hand) await prepareHand(opts.hand);
  const assets: Partial<ShareAssets> = {};
  for (const [format, role] of STILL_ROLES) {
    onProgress?.({ stage: 'render', detail: format });
    await paintFirst();
    const blob = await renderStill(exporter, {
      format,
      palette: opts.palette,
      pose: opts.pose,
      treatment: opts.treatment,
      hand: opts.hand,
    });
    onProgress?.({ stage: 'upload', detail: format });
    assets[role] = await uploadFile(id, editToken, role, blob);
  }

  // Publish: the design and its files, in one write.
  const record = await patchShare(id, editToken, {
    design: stored,
    assets,
    forName: opts.forName ?? undefined,
    look,
  });
  onProgress?.({ stage: 'done' });
  const handle = { record, editToken, url };
  rememberShare(handle);
  return handle;
}

// ── The maker's own shares ────────────────────────────────────────────────
// Edit tokens are kept in this browser, so the maker opening their own link
// (or the playground with `?c=`) can update it without the edit link.

const STORE_KEY = 'ls-cards-shares';
interface Remembered {
  editToken: string;
  slug: string;
  url: string;
}

function readRemembered(): Record<string, Remembered> {
  if (typeof localStorage === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}') as Record<string, Remembered>;
  } catch {
    return {};
  }
}

export function rememberShare(h: ShareHandle) {
  if (typeof localStorage === 'undefined') return;
  const all = readRemembered();
  all[h.record.id] = { editToken: h.editToken, slug: h.record.slug, url: h.url };
  localStorage.setItem(STORE_KEY, JSON.stringify(all));
}

export function rememberedToken(id: string): string | null {
  return readRemembered()[id]?.editToken ?? null;
}

/** The team layer is unlocked in this browser (the cookie the team route
 *  sets, or a dev build). */
export function teamUnlocked(): boolean {
  if (process.env.NODE_ENV === 'development') return true;
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some((c) => c.trim().startsWith('cards_team_ui='));
}

export { ShareError };
