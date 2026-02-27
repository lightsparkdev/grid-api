import styles from './EmptyCanvas.module.scss';

export function EmptyCanvas() {
  return (
    <div className={styles.canvas}>
      <span className={styles.coords}>(0, 0, 0)</span>
    </div>
  );
}
