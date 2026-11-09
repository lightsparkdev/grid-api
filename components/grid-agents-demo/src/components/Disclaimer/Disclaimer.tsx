import styles from './Disclaimer.module.scss';

/** The agent apps borrow real brands, so the playground says they're mockups, and that the agents themselves are
 *  stand-ins on a small model. */
export function Disclaimer() {
  return (
    <p className={styles.line}>
      Illustrative only: no partnership or endorsement implied. All trademarks belong to their owners. The agents in
      this demo are stand-ins running on a small, fast model, so they can make mistakes. Explore the flows below, or
      type directly in chat.
    </p>
  );
}
