'use client';

import { PanelHeader } from '@/components/PanelHeader/PanelHeader';
import { StatementDocument } from '@/components/StatementDocument';
import type { PreviewWidth, StatementModel } from '@/statement/types';
import styles from './StatementPanel.module.scss';

interface StatementPanelProps {
  statement: StatementModel;
  width: PreviewWidth;
  onWidthChange: (width: PreviewWidth) => void;
  onPrint: () => void;
}

export function StatementPanel({
  statement,
  width,
  onWidthChange,
  onPrint,
}: StatementPanelProps) {
  return (
    <section className={styles.panel}>
      <PanelHeader
        icon={
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
            <path
              d="M6 3h9l3 3v15H6V3Zm9 0v4h3M9 11h6M9 15h6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
        title="Statement preview"
        actions={
          <div className={styles.actions}>
            <div className={styles.segmented} role="radiogroup" aria-label="Preview width">
              {(['full', 'narrow'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={width === option}
                  data-active={width === option || undefined}
                  onClick={() => onWidthChange(option)}
                >
                  {option === 'full' ? 'Full' : 'Narrow'}
                </button>
              ))}
            </div>
            <button className={styles.download} type="button" onClick={onPrint}>
              Download PDF
            </button>
          </div>
        }
      />
      <div className={styles.stage}>
        <StatementDocument statement={statement} width={width} />
      </div>
    </section>
  );
}
