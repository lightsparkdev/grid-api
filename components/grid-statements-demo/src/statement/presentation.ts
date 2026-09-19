import type { StatementModel, StatementPeriod } from './types';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export function statementMonth(period: StatementPeriod): string {
  const match = /^(\d{4})-(\d{2})$/.exec(period.id);
  const monthIndex = match ? Number(match[2]) - 1 : -1;
  if (monthIndex < 0 || monthIndex >= MONTH_NAMES.length) {
    throw new Error(`Invalid statement period: ${period.id}`);
  }
  return MONTH_NAMES[monthIndex];
}

export function statementTitle(period: StatementPeriod): string {
  return `${statementMonth(period)} statement`;
}

export function statementFileStem(statement: StatementModel): string {
  const companySlug =
    statement.brand.companyName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'company';
  return `${companySlug}-${statementMonth(statement.period).toLowerCase()}-statement`;
}
