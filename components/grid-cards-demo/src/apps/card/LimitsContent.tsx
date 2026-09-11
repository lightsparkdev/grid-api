'use client';

import clsx from 'clsx';
import { ContentAreaButton } from '@/apps/shared/ContentAreaButton';
import { InlineWheelPicker, type WheelOption } from '@/apps/shared/InlineWheelPicker';
import type { CardControls, LimitsRow, SpendLimits } from '@/apps/shared/card';
import styles from './LimitsContent.module.scss';

/** A cap in cents, or null for none. */
type Cap = number | null;

const capLabel = (c: Cap) => (c === null ? 'Off' : `$${c / 100}`);
const asOptions = (steps: readonly Cap[]): WheelOption<Cap>[] => steps.map((s) => ({ value: s, label: capLabel(s) }));

export const PER_TXN_OPTIONS = asOptions([null, 2_500, 5_000, 7_500, 10_000, 25_000]);
export const PER_DAY_OPTIONS = asOptions([null, 5_000, 10_000, 25_000, 50_000, 100_000]);

/** One setting: its row, and its wheel open beneath it. */
function LimitRow({
  label,
  value,
  options,
  open,
  onToggle,
  onChange,
}: {
  label: string;
  value: Cap;
  options: WheelOption<Cap>[];
  open: boolean;
  onToggle: () => void;
  onChange: (v: Cap) => void;
}) {
  return (
    <div className={styles.setting}>
      <button type="button" className={styles.row} onClick={onToggle} aria-expanded={open}>
        <span className={styles.label}>{label}</span>
        <span className={clsx(styles.pill, open && styles.pillOpen)}>{capLabel(value)}</span>
      </button>
      <InlineWheelPicker options={options} value={value} onChange={onChange} open={open} aria-label={label} />
    </div>
  );
}

/**
 * Spending limits, pushed over the card home. Two settings in a grouped
 * card, each a row with its value in a pill; a tap opens that row's wheel and
 * closes the other, the card reflowing as one motion (Apple Cash's Auto
 * Reload). The draft lives in the controls (seeded by `openLimits`) so the
 * Limits flow can open rows and pick the way the cardholder would; Save
 * applies it and pops the page.
 */
export function LimitsContent({ card }: { card: CardControls }) {
  const { limitsDraft: draft, setLimitsDraft: setDraft, limitsRow: openRow, setLimitsRow } = card;
  const dirty =
    draft.perTransactionCents !== card.limits.perTransactionCents || draft.perDayCents !== card.limits.perDayCents;
  const toggle = (row: LimitsRow) => setLimitsRow(openRow === row ? null : row);
  return (
    <div className={styles.root}>
      <div className={styles.group}>
        <LimitRow
          label="Per purchase"
          value={draft.perTransactionCents}
          options={PER_TXN_OPTIONS}
          open={openRow === 'perTransaction'}
          onToggle={() => toggle('perTransaction')}
          onChange={(v) => setDraft((d: SpendLimits) => ({ ...d, perTransactionCents: v }))}
        />
        <LimitRow
          label="Per day"
          value={draft.perDayCents}
          options={PER_DAY_OPTIONS}
          open={openRow === 'perDay'}
          onToggle={() => toggle('perDay')}
          onChange={(v) => setDraft((d: SpendLimits) => ({ ...d, perDayCents: v }))}
        />
      </div>
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
