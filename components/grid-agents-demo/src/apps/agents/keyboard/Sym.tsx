import type { CSSProperties } from 'react';
import { SYMBOLS, type SymbolName, type SymbolWeight } from './symbols';

export type { SymbolName, SymbolWeight };

interface SymProps {
  name: SymbolName;
  /** `.font(.system(size:))` point size. */
  size: number;
  weight?: SymbolWeight;
  /** Fixed layout box (SwiftUI `.frame(width:height:)`); the glyph centres in it. */
  box?: number | [number, number];
  className?: string;
  style?: CSSProperties;
}

/** An SF Symbol drawn at the size SwiftUI draws `Image(systemName:)` at a
 *  given font size: the glyph's own bounds, centred in `box` when given. */
export function Sym({ name, size, weight = 'regular', box, className, style }: SymProps) {
  const byWeight = SYMBOLS[name];
  const entry = byWeight[weight] ?? byWeight.regular ?? Object.values(byWeight)[0];
  if (!entry) return null;
  const [d, x, y, w, h] = entry;
  const k = size / 24;
  const glyph = (
    <svg
      viewBox={`${x} ${y} ${w} ${h}`}
      width={w * k}
      height={h * k}
      aria-hidden
      style={box ? undefined : { display: 'block', flexShrink: 0, ...style }}
      className={box ? undefined : className}
    >
      <path d={d} fill="currentColor" />
    </svg>
  );
  if (!box) return glyph;
  const [bw, bh] = typeof box === 'number' ? [box, box] : box;
  return (
    <span
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: bw,
        height: bh,
        flexShrink: 0,
        ...style,
      }}
    >
      {glyph}
    </span>
  );
}
