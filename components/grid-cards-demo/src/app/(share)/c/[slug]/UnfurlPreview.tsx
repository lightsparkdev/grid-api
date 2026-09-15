import type { ShareRecord } from '@/lib/share/types';
import { shareUrl } from '@/lib/share/urls';
import styles from './UnfurlPreview.module.scss';

/* Dev view (`?preview=unfurl`): the share link as X, Slack and iMessage draw
   it, mocked in CSS around the real OG image. */

interface Props {
  record: ShareRecord;
}

function Missing({ label }: { label: string }) {
  return <div className={styles.missing}>{label}</div>;
}

export function UnfurlPreview({ record }: Props) {
  const programName = record.design.programName.trim() || 'Your brand';
  const title = `${programName} card, designed on Grid`;
  const description =
    record.kind === 'pitch' && record.forName
      ? `A card for ${record.forName}, issued on Lightspark Grid.`
      : 'Design a card and watch the Grid API calls fire as you go.';
  const { og } = record.assets;

  return (
    <main className={styles.page}>
      <div className={styles.toolbar}>
        <span>Unfurl preview</span>
        <a href={`/c/${encodeURIComponent(record.slug)}`}>Back to the share page</a>
      </div>

      <section className={styles.section}>
        <p className={styles.label}>X</p>
        <article className={styles.x}>
          <div className={styles.xAvatar} />
          <div className={styles.xBody}>
            <p className={styles.xMeta}>
              <strong>Lightspark</strong> <span>@lightspark · now</span>
            </p>
            <p className={styles.xText}>I designed the {programName} card on @lightspark Grid</p>
            <div className={styles.xCard}>
              {og ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={og} alt="" />
              ) : (
                <Missing label="No OG image" />
              )}
              <span className={styles.xDomain}>lightspark.com</span>
            </div>
          </div>
        </article>
      </section>

      <section className={styles.section}>
        <p className={styles.label}>Slack</p>
        <article className={styles.slack}>
          <div className={styles.slackAvatar} />
          <div className={styles.slackBody}>
            <p className={styles.slackMeta}>
              <strong>Lightspark</strong> <span>11:42 PM</span>
            </p>
            <p className={styles.slackText}>{shareUrl(record.slug)}</p>
            <div className={styles.slackUnfurl}>
              <p className={styles.slackTitle}>{title}</p>
              <p className={styles.slackDesc}>{description}</p>
              <div className={styles.slackImage}>
                {og ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={og} alt="" />
                ) : (
                  <Missing label="No OG image" />
                )}
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className={styles.section}>
        <p className={styles.label}>iMessage</p>
        <article className={styles.imessage}>
          <div className={styles.imessageMedia}>
            {og ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={og} alt="" />
            ) : (
              <Missing label="No image" />
            )}
          </div>
          <div className={styles.imessageCaption}>
            <p className={styles.imessageTitle}>{title}</p>
            <p className={styles.imessageDomain}>lightspark.com</p>
          </div>
        </article>
      </section>
    </main>
  );
}
