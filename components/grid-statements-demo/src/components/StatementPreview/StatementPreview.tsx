'use client';

import React from 'react';
import { IconLoadingCircle } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconLoadingCircle';
import { AppShell } from '@/apps/shared/AppShell';
import { StatementDocument } from '@/components/StatementDocument';
import { StatementScreen } from '@/components/StatementScreen/StatementScreen';
import { statementColorProperties } from '@/statement/brand';
import type { PreviewMode, PreviewPhase } from '@/statement/lifecycle';
import type { StatementModel } from '@/statement/types';
import styles from './StatementPreview.module.scss';

interface StatementPreviewProps {
  mode: PreviewMode;
  phase: PreviewPhase;
  statement: StatementModel;
}

export function StatementPreview({ mode, phase, statement }: StatementPreviewProps) {
  if (mode === 'mobile') {
    return (
      <div className={styles.mobile} data-preview-shell="mobile">
        <AppShell externalGlass>
          <StatementScreen statement={statement} loading={phase === 'loading'} />
        </AppShell>
      </div>
    );
  }

  return (
    <div className={styles.duoStage} data-preview-shell="desktop">
      <AppShell device="duo-landscape" externalGlass>
        <div
          className={styles.duoScreen}
          style={statementColorProperties(statement.brand.colors)}
        >
          {phase === 'loading' ? (
            <LoadingPreview />
          ) : (
            <div className={styles.desktopApp}>
              <header className={styles.desktopBar}>
                <span className={styles.windowControls} aria-hidden>
                  <i />
                  <i />
                  <i />
                </span>
                <strong>Statements</strong>
              </header>
              <div className={styles.duoScroller}>
                <StatementDocument statement={statement} width="full" showMasthead />
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </div>
  );
}

function LoadingPreview() {
  return (
    <div className={styles.loading} role="status" aria-label="Loading statement">
      <IconLoadingCircle size={20} aria-hidden />
    </div>
  );
}
