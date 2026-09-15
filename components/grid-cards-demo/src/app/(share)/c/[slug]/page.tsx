import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { shareStore } from '@/lib/share/store';
import { absoluteAssetUrl, playgroundUrl, shareUrl, xIntentUrl } from '@/lib/share/urls';
import type { ShareRecord } from '@/lib/share/types';
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

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
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
  // Full URLs: Next resolves images against metadataBase but not videos,
  // and the page may be served through another host's proxy.
  const og = record.assets.og && absoluteAssetUrl(record.assets.og);
  const video = record.assets.video && absoluteAssetUrl(record.assets.video);
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: shareUrl(record.slug),
      type: 'website',
      images: og ? [{ url: og, width: 2400, height: 1256 }] : [],
      videos: video ? [{ url: video, type: 'video/mp4', width: 1920, height: 1080 }] : undefined,
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

  const programName = programNameOf(record);
  const pitch = record.kind === 'pitch';
  const { design } = record;
  const assets = {
    og: record.assets.og && absoluteAssetUrl(record.assets.og),
    card: record.assets.card && absoluteAssetUrl(record.assets.card),
    video: record.assets.video && absoluteAssetUrl(record.assets.video),
  };
  const brand = programName || 'Your brand';
  const openHref = playgroundUrl(record.id, editing ? edit : null);

  return (
    <main className={styles.page}>
      <p className={styles.eyebrow}>{pitch && record.forName ? `A card for ${record.forName}` : 'Designed on Grid'}</p>
      <h1 className={styles.headline}>{pitch ? 'Here\u2019s what your card could look like.' : brand}</h1>

      <figure className={styles.figure}>
        {assets.video ? (
          <video className={styles.hero} autoPlay muted loop playsInline poster={assets.og ?? undefined}>
            <source src={assets.video} type="video/mp4" />
          </video>
        ) : assets.og ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.hero} src={assets.og} alt={`${brand} card`} />
        ) : (
          <div className={`${styles.hero} ${styles.placeholder}`}>Rendering…</div>
        )}
        <figcaption className={styles.caption}>
          {capitalize(design.material)} · {capitalize(design.finish)}
        </figcaption>
      </figure>

      <div className={styles.actions}>
        <a className={styles.primary} href={openHref}>
          Open in the playground
        </a>
        {pitch ? (
          <a className={styles.secondary} href="https://www.lightspark.com/contact">
            Talk to us
          </a>
        ) : (
          <a
            className={styles.secondary}
            href={xIntentUrl(`I designed the ${brand} card on @lightspark Grid`, shareUrl(record.slug))}
            target="_blank"
            rel="noopener"
          >
            Post to X
          </a>
        )}
        {assets.card && (
          <a className={styles.tertiary} href={assets.card} download>
            Download image
          </a>
        )}
        {assets.video && (
          <a className={styles.tertiary} href={assets.video} download>
            Download video
          </a>
        )}
      </div>

      {editing && (
        <aside className={styles.editPanel}>
          <p className={styles.views}>Views: {record.views}</p>
          <p>This is your edit link. Keep it: anyone with it can change this card.</p>
          <a className={styles.tertiary} href={playgroundUrl(record.id, edit)}>
            Edit in the playground
          </a>
        </aside>
      )}

      <footer className={styles.footer}>
        <a href="https://docs.lightspark.com/cards">Lightspark Grid · Cards</a>
      </footer>
    </main>
  );
}
