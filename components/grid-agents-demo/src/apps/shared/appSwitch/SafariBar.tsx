import type { ReactNode } from 'react';
import { SAFARI_GLYPHS } from './safariGlyphs';
import styles from './SafariBar.module.scss';

function Glyph({ name, size }: { name: keyof typeof SAFARI_GLYPHS; size: number }) {
  const [d, x, y, w, h] = SAFARI_GLYPHS[name];
  const k = size / 24;
  return (
    <svg viewBox={`${x} ${y} ${w} ${h}`} width={w * k} height={h * k} aria-hidden>
      <path d={d} fill="currentColor" />
    </svg>
  );
}

/** iOS 26 Safari's page menu (a private symbol): three bars, the last at 0.68 length. */
function PageMenu() {
  return (
    <svg width="16.5" height="12.25" viewBox="0 0 16.5 12.25" aria-hidden>
      <rect x="0" y="0" width="16.5" height="1.85" rx="0.925" fill="currentColor" />
      <rect x="0" y="5.2" width="16.5" height="1.85" rx="0.925" fill="currentColor" />
      <rect x="0" y="10.4" width="11.2" height="1.85" rx="0.925" fill="currentColor" />
    </svg>
  );
}

function Piece({ className, children }: { className: string; children: ReactNode }) {
  return <div className={`${styles.glass} ${className}`}>{children}</div>;
}

/**
 * iOS 26 Safari's bottom toolbar at rest, ported from the GoFundMe demo (measured from Pat's iPhone): three grey
 * glass pieces 48pt tall, 792pt down (Back, the address pill with the page menu, domain and reload, Tabs), 33pt from
 * the edges with 8pt between, white glyphs.
 */
export function SafariBar({ host }: { host: string }) {
  return (
    <div className={styles.bar} aria-hidden>
      <Piece className={styles.back}>
        <Glyph name="chevron.left" size={21} />
      </Piece>
      <Piece className={styles.pill}>
        <span className={styles.menu}>
          <PageMenu />
        </span>
        <span className={styles.host}>{host}</span>
        <span className={styles.reload}>
          <Glyph name="arrow.clockwise" size={17} />
        </span>
      </Piece>
      <Piece className={styles.tabs}>
        <Glyph name="square.on.square" size={20} />
      </Piece>
    </div>
  );
}
