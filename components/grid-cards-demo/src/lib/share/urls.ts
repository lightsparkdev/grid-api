/* The links a share travels under. Safe on the client and the server. */

/** Where share pages are served from, without a trailing slash. In production
 *  the website proxies `lightspark.com/card/{slug}` to this app's `/c/{slug}`;
 *  locally the app serves them itself. */
export function shareOrigin(): string {
  const env = process.env.NEXT_PUBLIC_SHARE_ORIGIN;
  if (env) return env.replace(/\/$/, '');
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return `${window.location.origin}/c`;
  }
  if (process.env.NODE_ENV === 'development') return 'http://localhost:4002/c';
  return 'https://lightspark.com/card';
}

/** Where this app itself is served from (its files, its API), without a
 *  trailing slash. The share page can be served through another host's
 *  proxy, so anything it points at is made absolute against this. */
export function appOrigin(): string {
  const env = process.env.NEXT_PUBLIC_APP_ORIGIN;
  if (env) return env.replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  if (process.env.NODE_ENV === 'development') return 'http://localhost:4002';
  return 'https://grid-cards-demo.vercel.app';
}

/** A stored file's URL made absolute (the store may hand out root-relative
 *  paths; the crawlers and a proxied page need full URLs). */
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

/** Where the playground opens a shared design. The docs page embeds the app
 *  and forwards `c` (and `edit`) into the iframe. Locally, the app itself. */
export function playgroundUrl(id: string, editToken?: string | null): string {
  const env = process.env.NEXT_PUBLIC_PLAYGROUND_ORIGIN;
  const base =
    env ??
    (typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? window.location.origin
      : process.env.NODE_ENV === 'development'
        ? 'http://localhost:4002'
        : 'https://docs.lightspark.com/cards/demo');
  const q = new URLSearchParams({ c: id });
  if (editToken) q.set('edit', editToken);
  return `${base.replace(/\/$/, '')}/?${q.toString()}`;
}

/** The X composer, prefilled. Media can't be attached this way; the link's
 *  card carries the image. */
export function xIntentUrl(text: string, url: string): string {
  const q = new URLSearchParams({ text, url });
  return `https://x.com/intent/post?${q.toString()}`;
}
