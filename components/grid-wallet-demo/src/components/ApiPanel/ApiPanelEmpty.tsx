import { IconPinch } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPinch';
import styles from './ApiPanelEmpty.module.scss';

export function ApiPanelEmpty() {
  return (
    <div className={styles.empty}>
      <span className={styles.iconBox} aria-hidden>
        <IconPinch size={24} />
      </span>
      <div className={styles.copy}>
        <p className={styles.title}>No API calls yet</p>
        <p className={styles.description}>
          Run a flow in the app and each request will appear here.
        </p>
      </div>
    </div>
  );
}
