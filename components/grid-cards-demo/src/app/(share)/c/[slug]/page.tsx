import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { shareStore } from '@/lib/share/store';
import { absoluteAssetUrl, playgroundOrigin, playgroundUrl, shareUrl } from '@/lib/share/urls';
import type { ShareRecord } from '@/lib/share/types';
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

function programNameOf(record: ShareRecord): string {
  return record.design.programName.trim();
}

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const record = await shareStore().get(params.slug);
  if (!record) return {};
  const programName = programNameOf(record);
  const title = `${programName || 'Your brand'} card, designed on Grid`;
  const description =
    record.kind === 'pitch' && record.forName
      ? `A card for ${record.forName}, issued on Lightspark Grid.`
      : 'Design a card and watch the Grid API calls fire as you go.';
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
  const brand = programNameOf(record) || 'Your brand';
  // Their own card in the playground (the maker's edit token rides along),
  // and a blank one.
  const viewHref = playgroundUrl(record.id, editing ? edit : null);
  const designHref = playgroundOrigin();

  return (
    <main className={styles.page}>
      <h1 className={styles.srOnly}>{pitch && record.forName ? `A card for ${record.forName}` : `${brand} card`}</h1>
      <ShareCard design={design} look={record.look} alt={`${brand} card`}>
        <div className={styles.actions}>
          {pitch ? (
            <a className={styles.primary} href="https://www.lightspark.com/contact">
              Talk to us
            </a>
          ) : (
            <a className={styles.primary} href={designHref}>
              Design your card
            </a>
          )}
          <a className={styles.secondary} href={viewHref}>
            View in Playground
          </a>
        </div>
      </ShareCard>
    </main>
  );
}
