/* The browser's side of a share: make the record, render and upload the
   pictures, attach the video when it's done, and remember the maker's edit
   tokens so a card they come back to is still theirs. */

import type { CardExporter, ExportPose } from '@/components/CardStage/export/exportRenderer';
import { prepareTemplate, type Palette } from '@/components/CardStage/export/compose';
import { renderStill, type StillFormat } from '@/components/CardStage/export/stills';
import type { CardDesign } from '@/data/design';
import type { ShareAssets, ShareCreateInput, ShareFileRole, SharePatch, ShareRecord } from './types';

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

async function uploadFile(id: string, editToken: string, role: ShareFileRole, blob: Blob): Promise<ShareRecord> {
  const r = await api<{ url: string; record: ShareRecord }>(
    `/api/shares/${encodeURIComponent(id)}/files?role=${role}`,
    {
      method: 'POST',
      headers: { 'content-type': blob.type, 'x-edit-token': editToken },
      body: blob,
    },
  );
  return r.record;
}

async function patchShare(id: string, editToken: string, patch: SharePatch): Promise<ShareRecord> {
  const r = await api<{ record: ShareRecord }>(`/api/shares/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', 'x-edit-token': editToken },
    body: JSON.stringify(patch),
  });
  return r.record;
}

/** An uploaded logo or art lives in this page as an object URL; the share
 *  needs the file. */
async function blobOf(url: string): Promise<Blob | null> {
  if (!url.startsWith('blob:') && !url.startsWith('data:')) return null;
  try {
    return await (await fetch(url)).blob();
  } catch {
    return null;
  }
}

export interface CreateShareOptions {
  exporter: CardExporter;
  design: CardDesign;
  kind: ShareCreateInput['kind'];
  slug?: string;
  forName?: string | null;
  /** The template's colors, and the card's color for its tuple. */
  palette: Palette;
  cardColor: string;
  /** How the card is held in the stills. */
  pose: ExportPose;
  onProgress?: (p: ShareProgress) => void;
  /** Update this share instead of making a new one. */
  existing?: { id: string; editToken: string; url: string };
}

/** The stills a share carries, and what they are for. */
const STILL_ROLES: Array<[StillFormat, ShareFileRole]> = [
  ['post', 'og'],
  ['square', 'square'],
];

/**
 * Make (or update) a share: the record first, so the link exists within a
 * second; then the link preview still, the others, and any uploaded brand
 * files. The spin video is attached separately (`attachVideo`), since it
 * takes a while.
 */
export async function createShare(opts: CreateShareOptions): Promise<ShareHandle> {
  const { exporter, design, onProgress } = opts;
  onProgress?.({ stage: 'record' });
  let id: string;
  let editToken: string;
  let url: string;
  let record: ShareRecord;
  if (opts.existing) {
    ({ id, editToken, url } = opts.existing);
    record = await patchShare(id, editToken, { design, forName: opts.forName ?? undefined });
  } else {
    const made = await api<{ record: ShareRecord; editToken: string; url: string }>(
      '/api/shares',
      json({ design, kind: opts.kind, slug: opts.slug, forName: opts.forName ?? null } satisfies ShareCreateInput),
    );
    ({ record, editToken, url } = made);
    id = record.id;
  }

  // The brand's files, so the design loads anywhere.
  for (const [key, role] of [
    ['logoUrl', 'logo'],
    ['backgroundUrl', 'art'],
  ] as Array<[keyof CardDesign, ShareFileRole]>) {
    const v = design[key];
    if (typeof v !== 'string') continue;
    const blob = await blobOf(v);
    if (blob) {
      onProgress?.({ stage: 'upload', detail: role });
      record = await uploadFile(id, editToken, role, blob);
    }
  }

  // The link preview first: it is what the link shows.
  await prepareTemplate();
  for (const [format, role] of STILL_ROLES) {
    onProgress?.({ stage: 'render', detail: format });
    const blob = await renderStill(exporter, {
      format,
      palette: opts.palette,
      cardColor: opts.cardColor,
      pose: opts.pose,
    });
    onProgress?.({ stage: 'upload', detail: format });
    record = await uploadFile(id, editToken, role, blob);
  }
  onProgress?.({ stage: 'done' });
  const handle = { record, editToken, url };
  rememberShare(handle);
  return handle;
}

export async function attachVideo(handle: ShareHandle, video: Blob): Promise<ShareRecord> {
  const record = await uploadFile(handle.record.id, handle.editToken, 'video', video);
  rememberShare({ ...handle, record });
  return record;
}

export async function clearAsset(handle: ShareHandle, key: keyof ShareAssets): Promise<ShareRecord> {
  return patchShare(handle.record.id, handle.editToken, { assets: { [key]: null } });
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
