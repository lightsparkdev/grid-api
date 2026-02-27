'use client';

import { Badge, Button } from '@lightsparkdev/origin';
import styles from './SelectionSummary.module.scss';

export interface Selection {
  type: 'fiat' | 'crypto';
  currency: string;
  rail: string;
}

type SelectionSummaryProps = {
  label: string;
  onReset: () => void;
} & (
  | { selection: Selection; value?: never }
  | { value: string; selection?: never }
);

export function SelectionSummary({ label, selection, value, onReset }: SelectionSummaryProps) {
  return (
    <div className={`${styles.wrapper} ${selection ? styles.selectionCard : ''}`}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <Button variant="ghost" size="compact" onClick={onReset}>
          Change
        </Button>
      </div>
      {selection ? (
        <div className={styles.detail}>
          <span className={styles.currency}>{selection.currency}</span>
          <div className={styles.meta}>
            <Badge variant={selection.type === 'fiat' ? 'blue' : 'purple'} vibrant>
              {selection.type === 'fiat' ? 'Fiat' : 'Crypto'}
            </Badge>
            <span className={styles.rail}>
              {selection.rail ? `via ${selection.rail}` : 'Grid Account'}
            </span>
          </div>
        </div>
      ) : (
        <span className={styles.value}>{value}</span>
      )}
    </div>
  );
}
