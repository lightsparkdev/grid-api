import clsx from 'clsx';
import styles from './ApiPanelSkeleton.module.scss';

interface SkeletonGroup {
  labelWidth: string;
  entries: { titleWidth: string }[];
}

const SKELETON_GROUPS: SkeletonGroup[] = [
  {
    labelWidth: '22%',
    entries: [{ titleWidth: '34%' }],
  },
  {
    labelWidth: '28%',
    entries: [
      { titleWidth: '38%' },
      { titleWidth: '36%' },
      { titleWidth: '40%' },
    ],
  },
  {
    labelWidth: '32%',
    entries: [
      { titleWidth: '36%' },
      { titleWidth: '38%' },
      { titleWidth: '34%' },
    ],
  },
  {
    labelWidth: '24%',
    entries: [
      { titleWidth: '36%' },
      { titleWidth: '38%' },
      { titleWidth: '34%' },
    ],
  },
];

export function ApiPanelSkeleton() {
  return (
    <div className={styles.list} aria-hidden>
      <div className={styles.feed}>
        {SKELETON_GROUPS.map((group, groupIndex) => (
          <div key={groupIndex} className={styles.group}>
            <div className={styles.divider}>
              <div
                className={clsx(styles.bone, styles.dividerLabel)}
                style={{ width: group.labelWidth }}
              />
              <div className={clsx(styles.bone, styles.dividerLine)} />
            </div>
            <div className={styles.groupEntries}>
              {group.entries.map((entry, entryIndex) => (
                <div key={entryIndex} className={styles.feedEntry}>
                  <div className={styles.callCard}>
                    <div className={styles.entryHeader}>
                      <div
                        className={clsx(styles.bone, styles.entryTitle)}
                        style={{ width: entry.titleWidth }}
                      />
                      <div className={clsx(styles.bone, styles.timestamp)} style={{ width: '14%' }} />
                    </div>
                    <div className={clsx(styles.bone, styles.endpoint)} />
                    <div className={styles.codeBlock}>
                      <div className={clsx(styles.bone, styles.codeToolbar)} />
                      <div className={styles.codeBody} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
