'use client';

import React from 'react';
import { StatementDocument } from '@/components/StatementDocument';
import { statementColorProperties } from '@/statement/brand';
import type { StatementModel } from '@/statement/types';
import styles from './StatementScreen.module.scss';

export function StatementScreen({
  statement,
  lifecycle,
}: {
  statement: StatementModel;
  lifecycle: 'in-progress' | 'statement';
}) {
  return (
    <main
      className={styles.screen}
      style={statementColorProperties(statement.brand.colors)}
      aria-label="Statement app preview"
    >
      <header className={styles.hero}>
        {statement.brand.logo.kind === 'image' ? (
          <img src={statement.brand.logo.src} alt={statement.brand.logo.alt} />
        ) : null}
        <span>{statement.brand.companyName || 'Your company'}</span>
        <strong>{lifecycle === 'statement' ? 'Monthly statement' : 'Current cycle'}</strong>
        {lifecycle === 'statement' ? <small>{statement.period.range}</small> : null}
      </header>
      {lifecycle === 'statement' ? (
        <div className={styles.scroller}>
          <StatementDocument statement={statement} width="narrow" />
        </div>
      ) : (
        <section className={styles.activity} aria-label="Current statement cycle">
          <strong>Activity</strong>
          <p>Statement arrives Oct 1</p>
        </section>
      )}
    </main>
  );
}
