'use client';

import clsx from 'clsx';
import { ContentAreaButton } from '@/apps/shared/ContentAreaButton';
import { formatUsdCents, type CardControls, type SpendLimits } from '@/apps/shared/card';
import NumericText from '@/components/NumericText';
import styles from './LimitsContent.module.scss';

const PER_TXN_STEPS = [null, 2_500, 5_000, 7_500, 10_000, 25_000] as const;
const PER_DAY_STEPS = [null, 5_000, 10_000, 25_000, 50_000, 100_000] as const;

function LimitPicker({
  label,
  hint,
  steps,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  steps: readonly (number | null)[];
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <div className={styles.block}>
      <div className={styles.head}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>
          {value === null ? 'No cap' : <NumericText value={value / 100} format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }} />}
        </span>
      </div>
      <div className={styles.steps} role="radiogroup" aria-label={label}>
        {steps.map((s) => (
          <button
            key={String(s)}
            type="button"
            role="radio"
            aria-checked={value === s}
            className={clsx(styles.step, value === s && styles.stepOn)}
            onClick={() => onChange(s)}
          >
            {s === null ? 'Off' : `$${s / 100}`}
          </button>
        ))}
      </div>
      <p className={styles.hint}>{hint}</p>
    </div>
  );
}

/**
 * Spending Limits, pushed over the card home like Card Numbers. The draft
 * lives in the controls (seeded by `openLimits`) so the Limits flow can pick
 * the steps the way the cardholder would; Save applies it and pops the page.
 */
export function LimitsContent({ card }: { card: CardControls }) {
  const { limitsDraft: draft, setLimitsDraft: setDraft } = card;
  const dirty =
    draft.perTransactionCents !== card.limits.perTransactionCents || draft.perDayCents !== card.limits.perDayCents;
  return (
    <div className={styles.root}>
      <LimitPicker
        label="Per purchase"
        hint="maxSpendPerTransaction — a single authorization can't exceed this."
        steps={PER_TXN_STEPS}
        value={draft.perTransactionCents}
        onChange={(v) => setDraft((d: SpendLimits) => ({ ...d, perTransactionCents: v }))}
      />
      <LimitPicker
        label="Per day"
        hint={`maxSpendPerDay — resets at 00:00 UTC. Spent today: ${formatUsdCents(card.dailyUsedCents)}. Refunds don't restore capacity.`}
        steps={PER_DAY_STEPS}
        value={draft.perDayCents}
        onChange={(v) => setDraft((d: SpendLimits) => ({ ...d, perDayCents: v }))}
      />
      <div className={styles.actions}>
        <ContentAreaButton
          type="button"
          variant="filled"
          disabled={!dirty}
          onClick={() => {
            card.saveLimits(draft);
            card.popPage();
          }}
        >
          Save limits
        </ContentAreaButton>
      </div>
    </div>
  );
}
