import { Disclaimer } from '@/components/Disclaimer/Disclaimer';
import { GridLogoMark } from '@/components/GridWordmark';
import styles from './PlaygroundIntro.module.scss';

/** The brands-are-mockups line under the intro: on localhost only, held back from the live site for now. */
const SHOW_DISCLAIMER = process.env.NODE_ENV === 'development';

export function PlaygroundIntro() {
  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <div className={styles.titleRow}>
          <GridLogoMark className={styles.logo} />
          <span className={styles.titlePrimary}>Agent Accounts</span>
        </div>
        <span className={styles.titleSecondary}>Playground</span>
      </div>
      <p className={styles.body}>Give an agent an account and watch the exact API calls fire as you go</p>
      {SHOW_DISCLAIMER && <Disclaimer />}
    </section>
  );
}
