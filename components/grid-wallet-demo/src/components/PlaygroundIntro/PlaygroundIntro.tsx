import { GridLogoMark } from '@/components/GridWordmark';
import styles from './PlaygroundIntro.module.scss';

export function PlaygroundIntro() {
  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <div className={styles.titleRow}>
          <GridLogoMark className={styles.logo} />
          <span className={styles.titlePrimary}>Global Accounts</span>
        </div>
        <span className={styles.titleSecondary}>Playground</span>
      </div>
      <p className={styles.body}>
        Create a Grid Global Account and watch the exact API calls fire as you go.
      </p>
    </section>
  );
}
