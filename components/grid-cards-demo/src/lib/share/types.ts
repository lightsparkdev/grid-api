/* A shared card: the design as the visitor left it, the renders the browser
   made of it, and the link they travel under. One record per share, keyed by
   an id; a team share also has a slug (`/card/acme`) and an edit token. */

import type { CardDesign } from '@/data/design';

/** Public: anyone's card, shared from the playground. Pitch: made by the team
 *  for a customer; unlisted (noindex), with a headline for them. */
export type ShareKind = 'public' | 'pitch';

/** What the browser rendered and uploaded. URLs are absolute or root-relative
 *  and publicly fetchable (the crawlers read them). */
export interface ShareAssets {
  /** The link preview still, 1.91:1 (2400 × 1256). */
  og: string | null;
  /** The card alone on transparency, 3840 wide. */
  card: string | null;
  /** The square post, 1:1. */
  square: string | null;
}

/** How the stills were staged: the surface the card sat on and how it was
 *  held. The share page puts the live card on the same surface, at the same
 *  angle, so the picture and the card are one thing. */
export interface ShareLook {
  /** The surface's color, `#rrggbb`. */
  surface: string;
  pose: { rotX: number; rotY: number };
}

export interface ShareRecord {
  id: string;
  /** The path segment the share lives under. Equals `id` for a public share. */
  slug: string;
  kind: ShareKind;
  /** A pitch's customer, for its headline. */
  forName: string | null;
  /** The design, with any uploaded logo or art pointing at stored files. */
  design: CardDesign;
  /** Absent on shares made before it was recorded. */
  look?: ShareLook | null;
  assets: ShareAssets;
  /** ISO timestamps. */
  createdAt: string;
  updatedAt: string;
  /** Human opens of the share page (crawlers and the editor's own visits excluded). */
  views: number;
}

/** What the client sends to make a share. */
export interface ShareCreateInput {
  design: CardDesign;
  kind: ShareKind;
  /** Wanted slug (pitch only). */
  slug?: string;
  forName?: string | null;
  look?: ShareLook | null;
}

/** What the client publishes after creation, with the edit token: the
 *  design and the files' URLs together, in one write. Every URL must be a
 *  file of ours (the upload route's). */
export interface SharePatch {
  design?: CardDesign;
  assets?: Partial<ShareAssets>;
  forName?: string | null;
  look?: ShareLook | null;
}

/** The public shape of a record, minus nothing: the record holds no secrets
 *  (the edit token is stored hashed, outside it). */
export type SharePublic = ShareRecord;

export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/;
/** Words a slug may not be: routes and the like. */
export const SLUG_RESERVED = new Set(['api', 'c', 'card', 'cards', 'new', 'edit', 'admin', 'team', 'assets', 'fonts']);

export function normalizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export function validSlug(slug: string): boolean {
  return SLUG_RE.test(slug) && !SLUG_RESERVED.has(slug);
}

/** File names a share stores, by role. The extension follows the content type. */
export type ShareFileRole = 'og' | 'card' | 'square' | 'logo' | 'art';

/** Upload size caps by role, bytes. The stills are WebP at 2400 across (a
 *  few hundred KB); a logo or art is shrunk to 2048 across and WebP by the
 *  client before it is sent, so anything near these is not ours. Uploads go
 *  through a route handler, which Vercel caps at 4.5 MB a body. The spin
 *  video is not uploaded: the visitor saves it, the share carries none. */
const MB = 1024 * 1024;
export const MAX_BYTES: Record<ShareFileRole, number> = {
  og: 4 * MB,
  card: 4 * MB,
  square: 4 * MB,
  logo: 4 * MB,
  art: 4 * MB,
};
export const SHARE_FILE_TYPES: Record<ShareFileRole, string[]> = {
  og: ['image/png', 'image/webp', 'image/jpeg'],
  card: ['image/png'],
  square: ['image/png', 'image/webp', 'image/jpeg'],
  logo: ['image/svg+xml', 'image/png', 'image/webp'],
  art: ['image/svg+xml', 'image/png', 'image/webp', 'image/jpeg'],
};

export function extensionFor(contentType: string): string {
  switch (contentType) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/jpeg':
      return 'jpg';
    case 'image/svg+xml':
      return 'svg';
    default:
      return 'bin';
  }
}
