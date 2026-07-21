import clsx from 'clsx';
import { SectionDivider } from '@/components/SectionDivider/SectionDivider';
import styles from './ApiPanelSkeleton.module.scss';

interface CodeLine {
  width: number;
  indent?: 0 | 1 | 2;
}

interface SkeletonEntry {
  titleWidth: string;
  codeLines: CodeLine[];
}

interface SkeletonGroup {
  label: string;
  entries: SkeletonEntry[];
}

const SKELETON_GROUPS: SkeletonGroup[] = [
  {
    label: 'Sign in',
    entries: [
      {
        titleWidth: '46%',
        codeLines: [
          { width: 0.18 },
          { width: 0.62, indent: 1 },
          { width: 0.54, indent: 1 },
          { width: 0.48, indent: 1 },
          { width: 0.58, indent: 1 },
          { width: 0.44, indent: 1 },
          { width: 0.36, indent: 1 },
          { width: 0.52, indent: 1 },
          { width: 0.14 },
        ],
      },
    ],
  },
  {
    label: 'Add money',
    entries: [
      {
        titleWidth: '38%',
        codeLines: [
          { width: 0.2 },
          { width: 0.68, indent: 1 },
          { width: 0.56, indent: 1 },
          { width: 0.72, indent: 1 },
          { width: 0.5, indent: 1 },
          { width: 0.64, indent: 1 },
          { width: 0.46, indent: 1 },
          { width: 0.58, indent: 1 },
          { width: 0.42, indent: 1 },
          { width: 0.36, indent: 1 },
          { width: 0.16 },
        ],
      },
      {
        titleWidth: '36%',
        codeLines: [
          { width: 0.22 },
          { width: 0.6, indent: 1 },
          { width: 0.54, indent: 1 },
          { width: 0.48, indent: 1 },
          { width: 0.66, indent: 1 },
          { width: 0.4, indent: 1 },
          { width: 0.52, indent: 1 },
          { width: 0.18 },
        ],
      },
      {
        titleWidth: '40%',
        codeLines: [
          { width: 0.2 },
          { width: 0.58, indent: 1 },
          { width: 0.5, indent: 1 },
          { width: 0.44, indent: 1 },
          { width: 0.62, indent: 1 },
          { width: 0.38, indent: 1 },
          { width: 0.14 },
        ],
      },
    ],
  },
  {
    label: 'Send payment',
    entries: [
      {
        titleWidth: '36%',
        codeLines: [
          { width: 0.2 },
          { width: 0.64, indent: 1 },
          { width: 0.56, indent: 1 },
          { width: 0.7, indent: 1 },
          { width: 0.48, indent: 1 },
          { width: 0.6, indent: 1 },
          { width: 0.44, indent: 1 },
          { width: 0.52, indent: 1 },
          { width: 0.16 },
        ],
      },
      {
        titleWidth: '38%',
        codeLines: [
          { width: 0.22 },
          { width: 0.58, indent: 1 },
          { width: 0.66, indent: 1 },
          { width: 0.5, indent: 1 },
          { width: 0.54, indent: 1 },
          { width: 0.42, indent: 1 },
          { width: 0.48, indent: 1 },
          { width: 0.34, indent: 1 },
          { width: 0.18 },
        ],
      },
      {
        titleWidth: '34%',
        codeLines: [
          { width: 0.2 },
          { width: 0.52, indent: 1 },
          { width: 0.46, indent: 1 },
          { width: 0.58, indent: 1 },
          { width: 0.4, indent: 1 },
          { width: 0.14 },
        ],
      },
    ],
  },
];

export function ApiPanelSkeleton() {
  return (
    <div className={styles.list} aria-hidden>
      <div className={styles.feed}>
        {SKELETON_GROUPS.map((group, groupIndex) => (
          <div key={groupIndex} className={styles.group}>
            <SectionDivider label={group.label} showFlowIcon />
            <div className={styles.groupEntries}>
              {group.entries.map((entry, entryIndex) => (
                <div key={entryIndex} className={styles.feedEntry}>
                  <div className={styles.callCard}>
                    <div className={styles.entryHeader}>
                      <div
                        className={clsx(styles.bone, styles.entryTitle)}
                        style={{ width: entry.titleWidth }}
                      />
                      <div className={clsx(styles.bone, styles.timestamp)} />
                    </div>
                    <div className={styles.endpointBlock}>
                      <div className={styles.endpointScroll}>
                        <div className={clsx(styles.bone, styles.methodBadge)} />
                        <div className={styles.endpointPath}>
                          <div
                            className={clsx(styles.bone, styles.pathLine)}
                            style={{ width: '88%' }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className={styles.codeBlock}>
                      {/* Mirrors the real CodeTabs at rest: Request (active,
                          hairline on its trailing edge) then Response — small
                          text-line bones centered in each tab cell. */}
                      <div className={styles.codeBlockToolbar}>
                        <div className={styles.tabGroup}>
                          <div className={clsx(styles.tab, styles.tabActive)}>
                            <div className={clsx(styles.bone, styles.tabLabel)} style={{ width: 48 }} />
                          </div>
                          <div className={styles.tab}>
                            <div className={clsx(styles.bone, styles.tabLabel)} style={{ width: 58 }} />
                          </div>
                        </div>
                      </div>
                      <div className={styles.codeBody}>
                        {entry.codeLines.map((line, lineIndex) => (
                          <div
                            key={lineIndex}
                            className={clsx(
                              styles.bone,
                              styles.codeLine,
                              line.indent === 1 && styles.codeLineIndent1,
                              line.indent === 2 && styles.codeLineIndent2,
                            )}
                            style={{ width: `${line.width * 100}%` }}
                          />
                        ))}
                      </div>
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
