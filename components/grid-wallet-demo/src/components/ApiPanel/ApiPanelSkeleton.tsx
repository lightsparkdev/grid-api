import clsx from 'clsx';
import styles from './ApiPanelSkeleton.module.scss';

interface SkeletonStep {
  titleWidth?: string;
  descriptionWidth?: string;
}

const SKELETON_STEPS: SkeletonStep[] = [
  { titleWidth: '38%', descriptionWidth: '72%' },
  { titleWidth: '44%', descriptionWidth: '58%' },
  { titleWidth: '36%', descriptionWidth: '64%' },
  { titleWidth: '48%', descriptionWidth: '52%' },
  { titleWidth: '40%', descriptionWidth: '66%' },
  { titleWidth: '42%', descriptionWidth: '60%' },
];

export function ApiPanelSkeleton() {
  return (
    <div className={styles.list} aria-hidden>
      <div className={styles.steps}>
        {SKELETON_STEPS.map((step, i) => (
          <div key={i} className={styles.step}>
            <div className={styles.stepHeader}>
              <div className={clsx(styles.bone, styles.badge)} />
              <div className={styles.stepLabels}>
                <div
                  className={clsx(styles.bone, styles.title)}
                  style={step.titleWidth ? { width: step.titleWidth } : undefined}
                />
                <div
                  className={clsx(styles.bone, styles.description)}
                  style={step.descriptionWidth ? { width: step.descriptionWidth } : undefined}
                />
              </div>
            </div>
            <div className={styles.stepContent}>
              <div className={styles.stepLineCol}>
                {i < SKELETON_STEPS.length - 1 ? <div className={styles.stepLine} /> : null}
              </div>
              <div className={styles.stepCodeCol}>
                <div className={clsx(styles.bone, styles.endpoint)} />
                <div className={styles.codeBlock}>
                  <div className={clsx(styles.bone, styles.codeToolbar)} />
                  <div className={styles.codeBody} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
