'use client';

import React, { useState } from 'react';
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
  const [scrolled, setScrolled] = useState(false);
  const elevated = !loading && scrolled;

  return (
    <main
      className={styles.screen}
      style={statementColorProperties(statement.brand.colors)}
      aria-label="Statement app preview"
    >
      <header
        className={styles.hero}
        data-statement-header
        data-scrolled={elevated || undefined}
      >
        <span className={styles.logo}>
          {statement.brand.logo.kind === 'image' ? (
            <img src={statement.brand.logo.src} alt={statement.brand.logo.alt} />
          ) : (
            statement.brand.companyName
          )}
        </span>
        <h1>{statementTitle(statement.period)}</h1>
      </header>
      {loading ? (
        <div className={styles.loading} role="status" aria-label="Loading statement">
          <IconLoadingCircle size={20} aria-hidden />
        </div>
      ) : (
        <div
          className={styles.scroller}
          data-statement-scroll
          onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 0)}
        >
          <StatementDocument
            statement={statement}
            width="narrow"
            showMasthead={false}
            surface="bleed"
          />
        </div>
      )}
    </main>
  );
}
