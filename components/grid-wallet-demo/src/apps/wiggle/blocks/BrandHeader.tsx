import clsx from 'clsx';
import styles from './BrandHeader.module.scss';

interface BrandHeaderProps {
  logoSrc: string;
  /** Headline, e.g. "Join Wiggle". */
  name: string;
  /** Subhead, e.g. "Watch anything live". */
  tagline: string;
  className?: string;
}

/** Logo + headline + subhead. Inherits text color from its container so it
 *  works on a brand wash or a themed surface. */
export function BrandHeader({ logoSrc, name, tagline, className }: BrandHeaderProps) {
  return (
    <div className={clsx(styles.header, className)}>
      <div className={styles.row}>
        <img className={styles.logo} src={logoSrc} alt="" aria-hidden draggable={false} />
        <span className={styles.name}>{name}</span>
      </div>
      <span className={styles.tagline}>{tagline}</span>
    </div>
  );
}
