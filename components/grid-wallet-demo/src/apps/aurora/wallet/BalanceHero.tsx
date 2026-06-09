import styles from './BalanceHero.module.scss';

interface BalanceHeroProps {
  /** Formatted USD, e.g. "$5,000.00". */
  balance: string;
}

function splitBalance(value: string): { whole: string; decimals: string | null } {
  const dot = value.indexOf('.');
  if (dot === -1) return { whole: value, decimals: null };
  return { whole: value.slice(0, dot), decimals: value.slice(dot) };
}

/** Figma 90:13445 — total balance hero (label + SF Pro Rounded amount). */
export function BalanceHero({ balance }: BalanceHeroProps) {
  const { whole, decimals } = splitBalance(balance);

  return (
    <section className={styles.hero} aria-label="Total balance">
      <p className={styles.label}>Total balance</p>
      <p className={styles.amount}>
        <span className={styles.whole}>{whole}</span>
        {decimals ? <span className={styles.decimals}>{decimals}</span> : null}
      </p>
    </section>
  );
}
