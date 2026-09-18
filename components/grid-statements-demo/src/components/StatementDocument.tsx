import React from 'react';
import { LEGAL, calculateTotals, formatMoney, statementRows } from '@/statement/fixtures';
import { statementColorProperties } from '@/statement/brand';
import type { PreviewWidth, StatementModel } from '@/statement/types';
import styles from './StatementDocument.module.css';

interface StatementDocumentProps {
  statement: StatementModel;
  width: PreviewWidth;
}

export function StatementDocument({ statement, width }: StatementDocumentProps) {
  const totals = calculateTotals(statement);
  const rows = statementRows(statement);
  const details = [
    ['Statement period', statement.period.range],
    ['Issued', statement.period.issued],
    ['Account holder', statement.account.holder],
    ['Account type', statement.account.type],
    ['Account number', statement.account.number],
  ];

  return (
    <article
      className={styles.document}
      data-preview-width={width}
      style={statementColorProperties(statement.brand.colors)}
    >
      <header className={styles.masthead}>
        <div className={styles.brand}>
          {statement.brand.logo.kind === 'image' ? (
            <img
              src={statement.brand.logo.src}
              alt={`${statement.brand.companyName || 'Company'} logo`}
            />
          ) : (
            statement.brand.companyName
          )}
        </div>
        <strong>Monthly statement</strong>
      </header>

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
                <span className={styles.terminal}>{transaction.terminal}</span>
              ) : null}
            </span>
            <span className={styles.amount}>
              {formatMoney(transaction.amountCents, true)}
              {'disputable' in transaction && transaction.disputable ? (
                <span className={styles.flag} data-flag="disputable">
                  *
                </span>
              ) : null}
            </span>
          </div>
        ))}
        <div className={styles.feeTotal}>
          <strong>Total fees for period</strong>
          <span>{formatMoney(totals.totalFeesCents)}</span>
        </div>
        {statement.variant === 'consumer' ? (
          <div className={styles.flagKey}>* See below in case of errors or questions</div>
        ) : null}
      </section>

      <footer className={styles.footer}>
        <p>
          Direct inquiries to: <strong>{LEGAL.phone}</strong> or {LEGAL.address}.
        </p>

        {statement.variant === 'consumer' ? (
          <section className={styles.notice}>
            <div className={styles.label}>
              In Case of Errors or Questions About Your Electronic Transfers
              <span>*</span>
            </div>
            {LEGAL.notice.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p className={styles.window}>
              Report errors within 60 days of the statement date ({statement.period.issued}).
            </p>
          </section>
        ) : null}

        <p>{LEGAL.provider}</p>

        <div className={styles.colophon}>
          <div>
            <strong>Lightspark Payments, LLC</strong>
            <span>NMLS ID 2429193</span>
          </div>
          <span>{LEGAL.address}</span>
          <div className={styles.contact}>
            <span>www.lightspark.com</span>
            <span>{LEGAL.phone}</span>
          </div>
        </div>
      </footer>
    </article>
  );
}

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
