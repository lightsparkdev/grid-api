import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { shareStore } from '@/lib/share/store';
import { shareBrand, shareDescription, shareTitle } from '@/lib/share/copy';
import { absoluteAssetUrl, playgroundOrigin, playgroundUrl, shareUrl } from '@/lib/share/urls';
import { ShareCard } from './ShareCard';
import { UnfurlPreview } from './UnfurlPreview';
import styles from './page.module.scss';

/* The public share page: `/c/{slug}`, proxied from lightspark.com/card/{slug}.
   Reads the store on every request; the assets may land after the record. */

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}

/** Link-preview fetchers and the like, whose opens aren't views. */
const CRAWLER_RE =
  /bot|crawl|spider|slurp|facebookexternalhit|twitterbot|slackbot|discordbot|whatsapp|telegrambot|linkedinbot|pinterest|embedly|quora|vkshare|redditbot|applebot|iframely|skypeuripreview|preview/i;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/** Mobile Safari's bars take the page's own surface (share.scss's), so the
 *  page runs under them in one color. */
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f8f7' },
    { media: '(prefers-color-scheme: dark)', color: '#111111' },
  ],
};

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const record = await shareStore().get(params.slug);
  if (!record) return {};
  const title = shareTitle(shareBrand(record.design.programName));
  const description = shareDescription(record);
  // A full URL: the page may be served through another host's proxy.
  const og = record.assets.og && absoluteAssetUrl(record.assets.og);
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: shareUrl(record.slug),
      type: 'website',
      images: og ? [{ url: og, width: 2400, height: 1256 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: og ? [og] : [],
    },
    robots: record.kind === 'pitch' ? { index: false, follow: false } : undefined,
  };
}

export default async function SharePage({ params, searchParams }: Props) {
  const store = shareStore();
  const record = await store.get(params.slug);
  if (!record) notFound();

  const edit = first(searchParams.edit);
  const editing = edit ? await store.verifyEditToken(record.id, edit) : false;
  const preview = first(searchParams.preview) === 'unfurl';

  if (preview) return <UnfurlPreview record={record} />;

  if (!editing) {
    const ua = headers().get('user-agent') ?? '';
    if (!CRAWLER_RE.test(ua)) store.recordView(record.id).catch(() => {});
  }

  const pitch = record.kind === 'pitch';
  const { design } = record;
  const brand = shareBrand(record.design.programName);
  // Their own card in the playground (the maker's edit token rides along),
  // and a blank one.
  const viewHref = playgroundUrl(record.id, editing ? edit : null);
  const designHref = playgroundOrigin();

  return (
    <main className={styles.page}>
      <ShareCard
        design={design}
        brand={brand}
        pitch={shareDescription(record).replace(/\.$/, '')}
        actions={
          <>
            <a className={styles.secondary} href={viewHref}>
              View in Playground
            </a>
            {pitch ? (
              <a className={styles.primary} href="https://www.lightspark.com/contact">
                Talk to us
              </a>
            ) : (
              <a className={styles.primary} href={designHref}>
                Design yours
              </a>
            )}
          </>
        }
        alt={`${brand} card`}
      />
    </main>
  );
}
