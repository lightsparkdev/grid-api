import styles from './SectionDivider.module.scss';

interface SectionDividerProps {
  label: string;
}

/** Label + horizontal rule — matches Flow Builder funding-model divider pattern. */
export function SectionDivider({ label }: SectionDividerProps) {
  return (
    <div className={styles.divider}>
      <span className={styles.label}>{label}</span>
      <div className={styles.line} />
    </div>
  );
}
