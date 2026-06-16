'use client';

import clsx from 'clsx';
import styles from './Marquee.module.scss';

interface MarqueeProps {
  /** Rows of words; each row auto-scrolls, alternating direction. */
  rows: string[][];
  className?: string;
  /** Enable hover highlights on individual words (e.g. category names). */
  interactive?: boolean;
}

/** Decorative auto-scrolling word marquee behind a skin's auth hero
 *  (Figma 2375:10338). Each row is two identical groups so the -50% translate
 *  loops seamlessly. Pauses under prefers-reduced-motion (see scss). */
export function Marquee({ rows, className, interactive }: MarqueeProps) {
  return (
    <div
      className={clsx(styles.marquee, interactive && styles.interactive, className)}
      aria-hidden
    >
      {rows.map((words, i) => (
        <div key={i} className={styles.row}>
          <div
            className={clsx(styles.track, i % 2 === 1 && styles.reverse)}
            style={{ ['--marquee-dur' as string]: `${48 + i * 12}s` }}
          >
            <span className={styles.group}>
              {words.map((w, j) => (
                <span key={j} className={styles.word}>
                  {w}
                </span>
              ))}
            </span>
            <span className={styles.group}>
              {words.map((w, j) => (
                <span key={j} className={styles.word}>
                  {w}
                </span>
              ))}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
