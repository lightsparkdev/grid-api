import styles from './Header.module.scss';

export function Header() {
  return (
    <div className={styles.section}>
      <div className={styles.heading}>
        <div className={styles.title}>Global Accounts</div>
      </div>
      <div className={styles.description}>
        <p className={styles.body}>
          Create a Global money account and watch the exact API calls fire as you go.
        </p>
      </div>
    </div>
  );
}
