import styles from './Disclaimer.module.scss';

/** The agent apps borrow real brands, so the playground says they're mockups, and that the agents themselves run on
 *  a small model. */
export function Disclaimer() {
  return (
    <p className={styles.line}>
      Illustrative only: no partnership or endorsement implied. All trademarks belong to their owners. The agents in
      this demo are running on a small model, so they can make mistakes.
    </p>
  );
}
