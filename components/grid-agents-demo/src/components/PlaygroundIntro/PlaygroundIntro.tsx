import styles from './PlaygroundIntro.module.scss';

export function PlaygroundIntro() {
  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <div className={styles.titleRow}>
          <span className={styles.titlePrimary}>Agent Accounts</span>
        </div>
        <span className={styles.titleSecondary}>Playground</span>
      </div>
      <p className={styles.body}>Give an agent an account and watch the exact API calls fire as you go</p>
    </section>
  );
}
