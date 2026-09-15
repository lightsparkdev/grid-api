'use client';

import { useCallback, useEffect, useState } from 'react';
import styles from './page.module.scss';

const OPTIONS = [
  {
    id: 'now',
    src: '/hand-preview/now.png',
    label: 'Now',
    title: 'Card alone',
    blurb: 'The share still today. Template, 3D card, any pose, spin video.',
    pose: 'Any pose, including free-turn',
    video: 'Spin works',
    effort: 'Already shipped',
  },
  {
    id: 'present',
    src: '/hand-preview/apple-present.png',
    label: 'Present',
    title: 'Generated hand, Apple present',
    blurb: 'Same language as the iPhone Duo hero: wrap light, idealized skin, product facing you, fingers on the short edges. We generate the hand ourselves instead of buying a library. For real, this would be a still overlay around the 3D card — or a 3D mesh derived from it.',
    pose: 'Locks to this grip',
    video: 'Off, unless the hand is 3D too',
    effort: 'Generate (or shoot) a hand we own, then sandwich',
  },
  {
    id: 'wrap',
    src: '/hand-preview/apple-wrap.png',
    label: 'Wrap',
    title: 'Generated hand, Apple wrap',
    blurb: 'The Duo back-of-phone grip mapped onto the card: hand behind, fingertips over the top edge. Fingers in front of the card is the whole point of a two-layer composite.',
    pose: 'Locks to this grip',
    video: 'Off, unless the hand is 3D too',
    effort: 'Same sandwich, different pose',
  },
  {
    id: 'portrait',
    src: '/hand-preview/apple-portrait.png',
    label: 'Portrait',
    title: 'Generated hand, iPhone grip',
    blurb: 'The Duo shot with a portrait card. Closest 1:1 to what Apple is doing. Our cards already have a portrait orientation, so this is a legal pose, not a new product.',
    pose: 'Locks to portrait + this grip',
    video: 'Off, unless the hand is 3D too',
    effort: 'Same as Present',
  },
  {
    id: 'template',
    src: '/hand-preview/apple-template.png',
    label: 'In template',
    title: 'Generated hand, on the share square',
    blurb: 'The Apple hand dropped into the existing Lightspark template. Honest test of whether the chrome (rules, logomark, type) still wants to be there once a hand shows up. Apple themselves would drop the chrome and go full white.',
    pose: 'Locks to this grip',
    video: 'Off',
    effort: 'Same sandwich, current compose.ts',
  },
] as const;

type OptionId = (typeof OPTIONS)[number]['id'];

export function HandPreview() {
  const [id, setId] = useState<OptionId>('present');
  const current = OPTIONS.find((o) => o.id === id) ?? OPTIONS[1];

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= OPTIONS.length) setId(OPTIONS[n - 1].id);
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const i = OPTIONS.findIndex((o) => o.id === id);
        const next = e.key === 'ArrowRight' ? (i + 1) % OPTIONS.length : (i - 1 + OPTIONS.length) % OPTIONS.length;
        setId(OPTIONS[next].id);
      }
    },
    [id],
  );

  useEffect(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onKey]);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.kicker}>Throwaway · generated hands · not in Share</p>
        <h1>Our own hands, Apple-style</h1>
        <p className={styles.lede}>
          Same white card, generated hands in the Duo lighting. The card here is a stand-in — a
          real still would keep the 3D export and only composite the hand.
        </p>
      </header>

      <div className={styles.stage}>
        <figure className={styles.hero}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.src} alt={current.title} />
        </figure>
        <aside className={styles.meta}>
          <h2>{current.title}</h2>
          <p>{current.blurb}</p>
          <dl>
            <div>
              <dt>Pose</dt>
              <dd>{current.pose}</dd>
            </div>
            <div>
              <dt>Video</dt>
              <dd>{current.video}</dd>
            </div>
            <div>
              <dt>Effort</dt>
              <dd>{current.effort}</dd>
            </div>
          </dl>
        </aside>
      </div>

      <nav className={styles.thumbs} aria-label="Treatments">
        {OPTIONS.map((o, i) => (
          <button
            key={o.id}
            type="button"
            className={styles.thumb}
            data-active={o.id === id}
            onClick={() => setId(o.id)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={o.src} alt="" />
            <span>
              <em>{i + 1}</em>
              {o.label}
            </span>
          </button>
        ))}
      </nav>
    </main>
  );
}
