import styles from './DebitCard.module.scss';

/** Figma 2143:36184 — debit card behind the wallet sheet (gradient TBD). */
export function DebitCard() {
  return (
    <div className={styles.card} aria-hidden>
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
    </div>
  );
}
