import styles from './AppShell.module.scss';

function Signal() {
  return (
    <svg width="19" height="12" viewBox="0 0 17 11" fill="currentColor" aria-hidden>
      <rect x="0" y="7" width="3" height="4" rx="1" />
      <rect x="4.5" y="5" width="3" height="6" rx="1" />
      <rect x="9" y="3" width="3" height="8" rx="1" />
      <rect x="13.5" y="0" width="3" height="11" rx="1" />
    </svg>
  );
}

function Wifi() {
  return (
    <svg width="17" height="12" viewBox="0 0 16 11" fill="currentColor" aria-hidden>
      <path d="M8 11l2.3-2.9a3 3 0 0 0-4.6 0L8 11zM8 4.5a6.5 6.5 0 0 1 4.7 2l1.3-1.6a8.5 8.5 0 0 0-12 0L3.3 6.5A6.5 6.5 0 0 1 8 4.5z" />
    </svg>
  );
}

function Battery() {
  return (
    <svg width="27" height="13" viewBox="0 0 25 12" fill="none" aria-hidden>
      <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="currentColor" opacity="0.4" />
      <rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor" />
      <rect x="23" y="4" width="1.5" height="4" rx="0.75" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

export function PhoneStatusBar() {
  return (
    <div className={styles.statusBar}>
      <span className={styles.time}>9:41</span>
      <span className={styles.statusIcons}>
        <Signal />
        <Wifi />
        <Battery />
      </span>
    </div>
  );
}
