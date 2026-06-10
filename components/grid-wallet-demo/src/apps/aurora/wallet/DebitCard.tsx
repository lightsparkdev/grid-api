import clsx from 'clsx';
import { AuroraBackground } from '@/apps/shared/AuroraBackground';
import styles from './DebitCard.module.scss';

interface DebitCardProps {
  interactive?: boolean;
  onOpen?: () => void;
}

/** Figma 2143:36184 — debit card behind the wallet sheet. */
export function DebitCard({ interactive = true, onOpen }: DebitCardProps) {
  return (
    <button
      type="button"
      className={clsx(styles.card, !interactive && styles.cardStatic)}
      aria-label="View debit card"
      disabled={!interactive}
      onClick={onOpen}
    >
      <AuroraBackground showRadialGradient={false} className={styles.aurora} />
      <div className={styles.top}>
        <span className={styles.primary}>Get your free debit card</span>
        <span className={styles.secondary}>Spend locally</span>
      </div>
      <div className={styles.bottom}>
        <span className={styles.primary}>•••• 8972</span>
        <div className={styles.brand}>
          <span className={styles.secondary}>DEBIT</span>
          <img
            className={styles.visa}
            src="/assets/VisaLogo.svg"
            alt=""
            width={62}
            height={20}
            aria-hidden
            draggable={false}
          />
        </div>
      </div>
    </button>
  );
}
