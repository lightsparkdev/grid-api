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

  const brandMark = Array.from(statement.brand.companyName.trim())[0] ?? '';

  return (
    <div className={styles.duoStage} data-preview-shell="desktop">
      <AppShell device="duo-landscape" externalGlass>
        <div className={styles.duoScreen} style={statementColorProperties(statement.brand.colors)}>
          {phase === 'loading' ? (
            <LoadingPreview />
          ) : (
            <div className={styles.desktopApp} data-statement-frame>
              <header className={styles.desktopHeader} data-statement-header>
                <span className={styles.brandMark} data-statement-brand-mark aria-hidden>
                  {statement.brand.logo.kind === 'image' ? (
                    <img src={statement.brand.logo.src} alt="" />
                  ) : (
                    brandMark
                  )}
                </span>
                <span className={styles.companyName} data-statement-brand-name>
                  {statement.brand.companyName}
                </span>
              </header>
              <div className={styles.desktopBody} data-statement-layout>
                <aside className={styles.sidebar} data-statement-sidebar aria-hidden>
                  <span className={styles.placeholder} data-statement-placeholder />
                  <span className={styles.placeholder} data-statement-placeholder />
                  <span className={styles.placeholder} data-statement-placeholder />
                </aside>
                <div className={styles.duoScroller} data-statement-main data-statement-scroll>
                  <StatementDocument statement={statement} width="full" showMasthead />
                </div>
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
