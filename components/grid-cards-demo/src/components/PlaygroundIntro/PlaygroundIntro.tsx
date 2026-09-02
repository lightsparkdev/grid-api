import styles from './PlaygroundIntro.module.scss';

/**
 * Placeholder product mark until Cards has one. Same glyph as the docs'
 * `/images/icons/credit-card1.svg`, inlined so it follows `currentColor`.
 */
function CardsMark() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={styles.logo}
      aria-hidden
    >
      <path d="M2.75 9.75005V16.2461C2.75 17.903 4.09315 19.2461 5.75 19.2461L18.2422 19.2461C19.899 19.2461 21.2422 17.903 21.2422 16.2461L21.2461 9.75005M2.75 9.75005V7.75293C2.75 6.09608 4.09315 4.75293 5.75 4.75293H18.2461C19.9029 4.75293 21.2461 6.09608 21.2461 7.75293V9.75005M2.75 9.75005H21.2461" />
    </svg>
  );
}

export function PlaygroundIntro() {
  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <div className={styles.titleRow}>
          <CardsMark />
          <span className={styles.titlePrimary}>Cards</span>
        </div>
        <span className={styles.titleSecondary}>Playground</span>
      </div>
      <p className={styles.body}>
        Issue a virtual card, add it to Apple Wallet, and watch the exact API calls fire as you go
      </p>
    </section>
  );
}
