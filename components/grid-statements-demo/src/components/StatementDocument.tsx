import React, { forwardRef } from 'react';
import { LEGAL, calculateTotals, formatMoney, statementRows } from '@/statement/fixtures';
import { statementColorProperties } from '@/statement/brand';
import { statementTitle } from '@/statement/presentation';
import type { PreviewWidth, StatementModel } from '@/statement/types';
import styles from './StatementDocument.module.css';

export type DocumentSurface = 'card' | 'bleed';

interface StatementDocumentProps {
  statement: StatementModel;
  width: PreviewWidth;
  showMasthead: boolean;
  surface?: DocumentSurface;
}

export const StatementDocument = forwardRef<HTMLElement, StatementDocumentProps>(
  function StatementDocument(
    { statement, width, showMasthead, surface = 'card' },
    ref,
  ) {
    const totals = calculateTotals(statement);
    const rows = statementRows(statement);
    const hasDisputableRows = rows.some((row) => row.disputable);
    const details = [
      ['Statement period', statement.period.range],
      ['Issued', statement.period.issued],
      ['Account holder', statement.account.holder],
      ['Account type', statement.account.type],
      ['Account number', statement.account.number],
    ];

    return (
      <article
        ref={ref}
        className={styles.document}
        data-preview-width={width}
        data-surface={surface}
        style={statementColorProperties(statement.brand.colors)}
      >
      {showMasthead ? (
        <header className={styles.masthead}>
          <div className={styles.brand}>
            {statement.brand.logo.kind === 'image' ? (
              <img
                src={statement.brand.logo.src}
                alt={statement.brand.logo.alt}
              />
            ) : (
              statement.brand.companyName
            )}
          </div>
          <strong>{statementTitle(statement.period)}</strong>
        </header>
      ) : null}

      <section className={styles.definitionSection}>
        {details.map(([label, value]) => (
          <DefinitionRow key={label} label={label} value={value} />
        ))}
        <DefinitionRow
          label="Opening balance"
          value={<MoneyWithCurrency cents={statement.openingBalanceCents} />}
        />
        <DefinitionRow
          label="Closing balance"
          value={<MoneyWithCurrency cents={totals.closingBalanceCents} />}
        />
      </section>

      <section className={styles.ledger}>
        <div className={styles.ledgerHeading}>
          <span>Transactions</span>
          <span>Amount</span>
        </div>
        {rows.map((transaction) => (
          <div className={styles.transaction} key={transaction.id}>
            <span className={styles.date}>
              {statement.period.transactionMonth}/{transaction.day}
            </span>
            <span className={styles.description}>
              <span className={styles.type}>{transaction.type}</span>
              <span className={styles.party}>{transaction.party}</span>
              {'terminal' in transaction && transaction.terminal ? (
                <span className={styles.terminal}> · {transaction.terminal}</span>
              ) : null}
            </span>
            <span className={styles.amount}>
              <span data-amount-value>{formatMoney(transaction.amountCents, true)}</span>
              {'disputable' in transaction && transaction.disputable ? (
                <sup className={styles.flag} data-flag="disputable">
                  *
                </sup>
              ) : null}
            </span>
          </div>
        ))}
        <div className={styles.feeTotal}>
          <strong>Total fees for period</strong>
          <span>{formatMoney(totals.totalFeesCents)}</span>
        </div>
        {hasDisputableRows ? (
          <div className={styles.flagKey}>* See below in case of errors or questions</div>
        ) : null}
      </section>

      <footer className={styles.footer} data-footer-hairline>
        {statement.variant === 'consumer' ? (
          <section className={styles.notice}>
            <div className={styles.label}>
              In case of errors or questions about your electronic transfers
              {hasDisputableRows ? <sup className={styles.legalFlag}>*</sup> : null}
            </div>
            <p>{LEGAL.notice.intro}</p>
            <ol>
              {LEGAL.notice.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p>{LEGAL.notice.closing}</p>
            <p className={styles.window}>
              Report errors within 60 days of the statement date ({statement.period.issued}).
            </p>
          </section>
        ) : null}

        <p
          className={
            statement.variant === 'consumer'
              ? `${styles.provider} ${styles.providerDivider}`
              : styles.provider
          }
          data-footer-hairline={
            statement.variant === 'consumer' ? true : undefined
          }
        >
          {LEGAL.provider}
        </p>
      </footer>
      </article>
    );
  },
);

function DefinitionRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className={styles.definitionRow}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function MoneyWithCurrency({ cents }: { cents: number }) {
  return (
    <>
      {formatMoney(cents)}
      <span className={styles.currency}>USD</span>
    </>
  );
}
