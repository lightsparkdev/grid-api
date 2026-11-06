import { useState, type ReactNode } from 'react';
import { IconChevronRight } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronRight';
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossMedium';
import { IconLoadingCircle } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconLoadingCircle';
import { Flag } from '@/apps/shared/Flag';
import type { BankCountry } from '@/data/bankCountries';
import type { AgentAsk, Message } from '../conversation';
import { GlassPill } from '../glass';
import { PageSheet, SheetDisc, SheetPage, SheetSteps } from '../SheetPage';
import { useAskSheet } from '../vault/useAskSheet';
import { BANK_ALL, BANK_INSTANT, BANK_POPULAR, bankFields, payeeBlurb, railLine, useBankPicker, type BankPicker } from '../vault/useBankPicker';
import styles from './GrokBank.module.scss';

/*
 * Grok Bot's bank sheet, in the style of its Vault (IMG_1922–1925): the title in the bar between glass discs,
 * pill tabs with counts, one white card of rows each ending in a chevron, gray help under it and search
 * floating at the foot. The account opens like its Add a card form (Cancel, the title, a blue Done, gray fields).
 */

type Tab = 'all' | 'popular' | 'instant';
const TABS: { id: Tab; label: string; list: BankCountry[] }[] = [
  { id: 'all', label: 'All', list: BANK_ALL },
  { id: 'popular', label: 'Popular', list: BANK_POPULAR },
  { id: 'instant', label: 'Instant', list: BANK_INSTANT },
];

function Row({ country, onPick }: { country: BankCountry; onPick: (c: BankCountry) => void }) {
  return (
    <button type="button" className={styles.row} onClick={() => onPick(country)}>
      <Flag code={country.code} size={22} className={styles.flag} />
      <span className={styles.rowText}>
        <span className={styles.rowName}>{country.name}</span>
        <span className={styles.rowSub}>{railLine(country)}</span>
      </span>
      <IconChevronRight size={16} className={styles.chevron} />
    </button>
  );
}

function ListPage({ picker, onClose }: { picker: BankPicker; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('popular');
  const list = picker.results ?? TABS.find((t) => t.id === tab)!.list;
  return (
    <SheetPage
      title="Select country"
      leading={
        <SheetDisc label="Close" onClick={onClose}>
          <IconCrossMedium size={22} />
        </SheetDisc>
      }
      search={{ at: 'bottom', placeholder: 'Search countries', value: picker.query, onChange: picker.setQuery }}
    >
      {!picker.results && (
        <div className={styles.tabs} role="tablist">
          {TABS.map((t) => (
            <button key={t.id} type="button" role="tab" className={styles.tab} aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
              {t.label} <span>{t.list.length}</span>
            </button>
          ))}
        </div>
      )}
      {list.length > 0 && (
        <div className={styles.card}>
          {list.map((c) => (
            <Row key={c.code} country={c} onPick={picker.pick} />
          ))}
        </div>
      )}
      <p className={styles.help}>
        {list.length
          ? 'Grok Bot never sees your bank login. It can top up your Bot balance from it only when you ask.'
          : `No banks in “${picker.query}” yet.`}
      </p>
    </SheetPage>
  );
}

/** Cancel and Done as the form sheet draws them: 42.67pt glass pills, Done in blue. */
function BarPill({ label, blue, disabled, onClick, children }: { label: string; blue?: boolean; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className={`${styles.barPill} ${blue ? styles.barDone : ''}`} aria-label={label} disabled={disabled} onClick={onClick}>
      <GlassPill radius={21.33} tone={blue ? 'blue' : undefined} tint={blue ? undefined : 'var(--gb-pill)'}>
        <span className={styles.barLabel}>{children}</span>
      </GlassPill>
    </button>
  );
}

function DetailsPage({ picker, onClose }: { picker: BankPicker; onClose: () => void }) {
  const bank = picker.bank!;
  return (
    <SheetPage
      title={picker.payee ? `${picker.payee.first}’s bank` : bank.bankName}
      leading={
        <BarPill label="Cancel" disabled={picker.busy} onClick={picker.payee ? onClose : picker.unpick}>
          Cancel
        </BarPill>
      }
      trailing={
        <BarPill label="Done" blue disabled={picker.busy} onClick={picker.link}>
          {picker.stage === 'form' ? 'Done' : <IconLoadingCircle size={18} className={styles.spin} />}
        </BarPill>
      }
    >
      <div className={styles.fields}>
        {bankFields(bank).map((f) => (
          <label key={f.key} className={styles.field}>
            <span>{f.label}</span>
            <span className={styles.input}>
              {f.flag && <Flag code={f.flag} size={18} />}
              {f.value}
            </span>
          </label>
        ))}
      </div>
      <p className={styles.help}>
        {picker.payee
          ? `${payeeBlurb(bank, picker.payee.first)} Your Bot pays by account and never sees these numbers.`
          : `Top-ups arrive over ${railLine(bank.country).replace(' · ', ' in ')} and land in your Bot balance.`}
      </p>
    </SheetPage>
  );
}

function BankFlow({ payee, onLinked, onClose }: { payee?: AgentAsk['recipient']; onLinked: () => void; onClose: () => void }) {
  const picker = useBankPicker(onLinked, payee);
  return (
    <SheetSteps step={picker.bank ? 'details' : 'list'} back={picker.back}>
      {picker.bank ? <DetailsPage picker={picker} onClose={onClose} /> : <ListPage picker={picker} onClose={onClose} />}
    </SheetSteps>
  );
}

/** Grok's bank flow: the form card's Continue opens it; closing leaves the card waiting. */
export function useGrokBank({ messages, onAllow }: { messages: Message[]; onAllow: () => void }) {
  const sheet = useAskSheet(messages);
  return {
    open: (id: number, ask: AgentAsk) => sheet.show(id, ask),
    sheet: (
      <PageSheet open={sheet.open} className={styles.theme} onDismiss={sheet.hide}>
        <BankFlow
          key={sheet.id}
          payee={sheet.ask?.recipient}
          onClose={sheet.hide}
          onLinked={() => {
            sheet.hide();
            onAllow();
          }}
        />
      </PageSheet>
    ),
  };
}
