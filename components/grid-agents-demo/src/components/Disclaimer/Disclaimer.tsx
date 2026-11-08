import styles from './Disclaimer.module.scss';

/** The agent apps borrow real brands, so the playground says they're mockups. */
export function Disclaimer() {
  return (
    <p className={styles.line}>
      Illustrative only: no partnership or endorsement implied.
      <br />
      All trademarks belong to their owners.
    </p>
  );
}
