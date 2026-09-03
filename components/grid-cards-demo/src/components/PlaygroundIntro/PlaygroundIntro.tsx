import { GridLogoMark } from '@/components/GridWordmark';
import styles from './PlaygroundIntro.module.scss';

export function PlaygroundIntro() {
  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <div className={styles.titleRow}>
          {/* Cards has no product mark of its own; the Grid symbol (same one
              as the docs header and Flow Builder) follows text color. */}
          <GridLogoMark className={styles.logo} />
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
