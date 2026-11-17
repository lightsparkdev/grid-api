import type { SVGProps } from 'react';
import clsx from 'clsx';
import { SF_SYMBOL_PATHS, type SfSymbolName } from './sfSymbolPaths';
import styles from './SfSymbol.module.scss';

interface SfSymbolProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: SfSymbolName;
  /** Symbol size in px — matches Figma SF Symbol point size. */
  size?: number;
}

/** SF Symbol outline at a given size (paths exported from system fonts). */
export function SfSymbol({ name, size = 24, className, ...props }: SfSymbolProps) {
  const glyph = SF_SYMBOL_PATHS[name];

  return (
    <svg
      className={clsx(styles.symbol, className)}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden
      {...props}
    >
      <path
        d={glyph.d}
        transform={glyph.transform}
        fill="currentColor"
      />
    </svg>
  );
}
