/* The links a share travels under. Safe on the client and the server.

   Three hosts are in play: this app (a Vercel deployment; in production,
   `cards.lightspark.com`), the docs that embed it, and, on a preview
   deployment, the docs' matching Mintlify preview. Explicit env vars win;
   otherwise each is worked out from where the code is running. */

function trimSlash(url: string): string {
  return url.replace(/\/$/, '');
}

/** The branch a preview deployment was built from, as it appears in hostnames
 *  (`pat/cards-share` → `pat-cards-share`). Null off Vercel or in production. */
function previewBranch(): string | null {
  if (process.env.VERCEL_ENV !== 'preview') return null;
  const ref = process.env.VERCEL_GIT_COMMIT_REF;
  if (!ref) return null;
  return ref.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** Where this deployment answers, from the server's point of view. Vercel
 *  names each deployment; a preview's branch alias is the stable one. */
function deploymentOrigin(): string | null {
  const env = process.env.VERCEL_ENV;
  if (env === 'production' && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  const host = process.env.VERCEL_BRANCH_URL ?? process.env.VERCEL_URL;
  return host ? `https://${host}` : null;
}

/** Where this app itself is served from (its files, its API), without a
 *  trailing slash. */
export function appOrigin(): string {
  const env = process.env.NEXT_PUBLIC_APP_ORIGIN;
  if (env) return trimSlash(env);
  if (typeof window !== 'undefined') return window.location.origin;
  if (process.env.NODE_ENV === 'development') return 'http://localhost:4002';
  return deploymentOrigin() ?? 'https://grid-cards-demo.vercel.app';
}

/** Where share pages are served from, without a trailing slash: this app's
 *  `/c`. In production that is `cards.lightspark.com/c`, set explicitly. */
export function shareOrigin(): string {
  const env = process.env.NEXT_PUBLIC_SHARE_ORIGIN;
  if (env) return trimSlash(env);
  return `${appOrigin()}/c`;
}

/** A stored file's URL made absolute (the local store hands out root-relative
 *  paths; the crawlers need full URLs). */
export function absoluteAssetUrl(url: string): string {
  return url.startsWith('/') ? `${appOrigin()}${url}` : url;
}

/** The link to a share. */
export function shareUrl(slug: string): string {
  return `${shareOrigin()}/${encodeURIComponent(slug)}`;
}

/** The maker's link: the share page with the edit token, which unlocks
 *  editing and the view count. */
export function shareEditUrl(slug: string, editToken: string): string {
  return `${shareUrl(slug)}?edit=${encodeURIComponent(editToken)}`;
}

/** The docs page that embeds the playground, without a trailing slash. A
 *  preview deployment points at the docs' preview of the same branch, so a
 *  staging link lands on staging docs. Locally, the app itself. */
export function playgroundOrigin(): string {
  const env = process.env.NEXT_PUBLIC_PLAYGROUND_ORIGIN;
  if (env) return trimSlash(env);
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') return window.location.origin;
  if (process.env.NODE_ENV === 'development') return 'http://localhost:4002';
  const branch = previewBranch();
  if (branch) return `https://ramps-${branch}.mintlify.site/cards/demo`;
  return 'https://docs.lightspark.com/cards/demo';
}

/** Where the playground opens a shared design. The docs page forwards `c`
 *  (and `edit`) into the iframe. */
export function playgroundUrl(id: string, editToken?: string | null): string {
  const q = new URLSearchParams({ c: id });
  if (editToken) q.set('edit', editToken);
  return `${playgroundOrigin()}?${q.toString()}`;
}

/** The X composer, prefilled. Media can't be attached this way; the link's
 *  card carries the image. */
export function xIntentUrl(text: string, url: string): string {
  const q = new URLSearchParams({ text, url });
  return `https://x.com/intent/post?${q.toString()}`;
}
