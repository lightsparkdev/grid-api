'use client';

import { useEffect, useState } from 'react';
import styles from './SquareFlag.module.scss';

/** code → circle-mask-stripped SVG markup (fetched once per flag). */
const cache = new Map<string, string>();

/**
 * SQUARE country flag. The vendored circle-flags gate their full-bleed square
 * art behind a `<mask><circle/></mask>` — served via <img> we can't reach it,
 * so this fetches the SVG text, HIDES the circle mask (drops the `mask=`
 * reference), and inlines the result. The marketplace clips it into its 40px
 * squircle tiles.
 */
export function SquareFlag({ code, className }: { code: string; className?: string }) {
  const [svg, setSvg] = useState<string | null>(() => cache.get(code) ?? null);

  useEffect(() => {
    if (cache.has(code)) {
      setSvg(cache.get(code)!);
      return;
    }
    let alive = true;
    fetch(`/assets/flags/${code}.svg`)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((text) => {
        const square = text.replace(/\smask="url\(#[^"]+\)"/, '');
        cache.set(code, square);
        if (alive) setSvg(square);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [code]);

  return (
    <span
      className={[styles.flag, className].filter(Boolean).join(' ')}
      aria-hidden
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    />
  );
}
