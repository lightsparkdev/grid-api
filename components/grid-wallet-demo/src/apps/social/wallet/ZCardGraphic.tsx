import { ZLogo } from '../ZLogo';
import styles from './ZCardGraphic.module.scss';

/** Placeholder graphic for the "Z Card" tile — a tilted metallic card peeking up
 *  from the bottom-right with a faint Z, standing in for a real card render. */
export function ZCardGraphic() {
  return (
    <div className={styles.graphic} aria-hidden>
      <div className={styles.card}>
        <ZLogo size={40} className={styles.mark} />
      </div>
    </div>
  );
}
