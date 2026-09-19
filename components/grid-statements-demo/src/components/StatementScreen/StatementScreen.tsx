'use client';

import React from 'react';
import { IconLoadingCircle } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconLoadingCircle';
import { StatementDocument } from '@/components/StatementDocument';
import { statementColorProperties } from '@/statement/brand';
import { statementTitle } from '@/statement/presentation';
import type { StatementModel } from '@/statement/types';
import styles from './StatementScreen.module.scss';

export function StatementScreen({
  statement,
  loading,
}: {
  statement: StatementModel;
  loading: boolean;
}) {
  return (
    <main
      className={styles.screen}
      style={statementColorProperties(statement.brand.colors)}
      aria-label="Statement app preview"
    >
      <header className={styles.hero}>
        <h1>{statementTitle(statement.period)}</h1>
      </header>
      {loading ? (
        <div className={styles.loading} role="status" aria-label="Loading statement">
          <IconLoadingCircle size={20} aria-hidden />
        </div>
      ) : (
        <div className={styles.scroller}>
          <StatementDocument statement={statement} width="narrow" showMasthead={false} />
        </div>
      )}
    </main>
  );
}
