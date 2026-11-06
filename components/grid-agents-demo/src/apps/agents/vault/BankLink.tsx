import { useEffect, useState } from 'react';
import { AnimatePresence, motion, type Transition } from 'motion/react';
import { IconBank } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconBank';
import { IconCheckmark1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckmark1';
import { IconChevronLeft } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronLeft';
import { IconChevronRight } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronRight';
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossMedium';
import { IconLoadingCircle } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconLoadingCircle';
import { IconMagnifyingGlass } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconMagnifyingGlass';
import { Flag } from '@/apps/shared/Flag';
import { BANK_ACCOUNT_SCHEMAS } from '@/data/bankAccountFields.generated';
import { BANK_COUNTRIES, currencyFor, type BankCountry } from '@/data/bankCountries';
import { FUNDING_POPULAR, fieldLabel } from '@/data/bankSamples';
import type { AgentAsk, AskState, Message } from '../conversation';
import { bankFor, linkBank, linkedBank, type LinkedBank } from '../linkedBank';
import { askButtons } from '../parts';
import { AppSheet } from '../sheet';
import styles from './BankLink.module.scss';

/*
 * Linking a bank to top up, as the Global Accounts playground adds one (grid-wallet-demo AddBankSheet): pick the
 * bank's country from a searchable list, each row naming its local rail, then confirm the account details, which
 * come filled in with that country's fields from the API spec. Link bank saves it and the agent requests the top-up.
 */

const SHEET_IN: Transition = { duration: 0.45, ease: [0.3, 0.7, 0.2, 1] };
const STEP: Transition = { duration: 0.35, ease: [0.2, 0.8, 0.2, 1] };
const LINK_MS = 900;
const ALL = [...BANK_COUNTRIES].sort((a, b) => a.name.localeCompare(b.name));
/** Steps push like iOS navigation: forward slides in from the right, back from the left. */
const SLIDE = {
  enter: (back: boolean) => ({ x: back ? '-30%' : '100%', opacity: back ? 0 : 1 }),
  center: { x: 0, opacity: 1 },
  exit: (back: boolean) => ({ x: back ? '100%' : '-30%', opacity: back ? 1 : 0 }),
};

function CountryRow({ country, onPick }: { country: BankCountry; onPick: (c: BankCountry) => void }) {
  return (
    <button type="button" className={styles.row} onClick={() => onPick(country)}>
      <Flag code={country.code} size={32} className={styles.flag} />
      <span className={styles.rowText}>
        <span className={styles.rowTitle}>{country.name}</span>
        <span className={styles.rowSub}>
          {country.rail} · {currencyFor(country)}
        </span>
      </span>
      <IconChevronRight size={18} className={styles.chevron} />
    </button>
  );
}

function Field({ label, value, flag }: { label: string; value: string; flag?: string }) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldText}>
        <span className={styles.fieldLabel}>{label}</span>
        <span className={styles.fieldValue}>
          {flag && <Flag code={flag} size={18} />}
          {value}
        </span>
      </span>
      <span className={styles.edit}>Edit</span>
    </div>
  );
}

/** The two steps and the link: lives in a sheet (useBankLink) or a page (Instinct's Safari). */
export function BankLinkFlow({
  wallet,
  onLinked,
  onClose,
  className,
}: {
  wallet: string;
  onLinked: (bank: LinkedBank) => void;
  onClose?: () => void;
  /** A host page's palette: it can set --bank-surface, --bank-fill, --bank-muted, --bank-line, --bank-cta, --bank-cta-text. */
  className?: string;
}) {
  const [bank, setBank] = useState<LinkedBank | null>(null);
  const [back, setBack] = useState(false);
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState<'form' | 'linking' | 'linked'>('form');
  useEffect(() => {
    if (stage !== 'linking' || !bank) return;
    const t = window.setTimeout(() => setStage('linked'), LINK_MS);
    return () => window.clearTimeout(t);
  }, [stage, bank]);
  useEffect(() => {
    if (stage !== 'linked' || !bank) return;
    const t = window.setTimeout(() => onLinked(bank), 650);
    return () => window.clearTimeout(t);
  }, [stage, bank, onLinked]);

  const q = query.trim().toLowerCase();
  const results = ALL.filter((c) => c.name.toLowerCase().includes(q) || currencyFor(c).toLowerCase().includes(q) || c.rail.toLowerCase().includes(q));
  const pick = (c: BankCountry) => {
    setBack(false);
    setBank(bankFor(c));
  };
  const step = bank ? 'details' : 'country';
  const slide = { custom: back, variants: SLIDE, initial: 'enter', animate: 'center', exit: 'exit' };

  return (
    <div className={`${styles.flow} ${className ?? ''}`}>
      <header className={styles.bar}>
        {step === 'details' ? (
          <button
            type="button"
            className={styles.barButton}
            aria-label="Back"
            disabled={stage !== 'form'}
            onClick={() => {
              setBack(true);
              setBank(null);
            }}
          >
            <IconChevronLeft size={22} />
          </button>
        ) : (
          onClose && (
            <button type="button" className={styles.barButton} aria-label="Close" onClick={onClose}>
              <IconCrossMedium size={22} />
            </button>
          )
        )}
      </header>
      <div className={styles.steps}>
        <AnimatePresence initial={false} custom={back}>
          {step === 'country' ? (
            <motion.div key="country" className={styles.step} {...slide} transition={STEP}>
              <div className={styles.scroll}>
                <span className={styles.tile}>
                  <IconBank size={24} />
                </span>
                <h2 className={styles.title}>Link a bank</h2>
                <p className={styles.sub}>
                  Top up your {wallet} from a bank in any of {BANK_COUNTRIES.length} countries, over its local rails.
                </p>
                <label className={styles.search}>
                  <IconMagnifyingGlass size={18} className={styles.searchIcon} />
                  <input
                    className={styles.searchInput}
                    value={query}
                    placeholder="Search country or currency"
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                {q ? (
                  <>
                    <p className={styles.section}>Results</p>
                    {results.map((c) => (
                      <CountryRow key={c.code} country={c} onPick={pick} />
                    ))}
                  </>
                ) : (
                  <>
                    <p className={styles.section}>Popular</p>
                    {FUNDING_POPULAR.map((c) => (
                      <CountryRow key={c.code} country={c} onPick={pick} />
                    ))}
                    <p className={styles.section}>All countries</p>
                    {ALL.map((c) => (
                      <CountryRow key={c.code} country={c} onPick={pick} />
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          ) : (
            bank && (
              <motion.div key="details" className={styles.step} {...slide} transition={STEP}>
                <div className={styles.scroll}>
                  <h2 className={styles.title}>Your {bank.country.name === 'United States' ? 'US' : bank.country.name} bank</h2>
                  <p className={styles.sub}>
                    Top-ups arrive over {bank.country.rail} in {bank.currency} and land in your {wallet}.
                  </p>
                  <div className={styles.fields}>
                    <Field label="Country" value={bank.country.name} flag={bank.country.code} />
                    <Field label="Bank" value={bank.bankName} />
                    <Field label="Account holder" value={bank.holder} />
                    {BANK_ACCOUNT_SCHEMAS[bank.country.accountType].fields
                      .filter((f) => f.key !== 'region' && f.key !== 'bankName')
                      .map((f) => (
                        <Field key={f.key} label={fieldLabel(f.key)} value={bank.values[f.key] ?? ''} />
                      ))}
                  </div>
                </div>
                <div className={styles.cta}>
                  <button
                    type="button"
                    className={styles.link}
                    disabled={stage !== 'form'}
                    data-stage={stage}
                    onClick={() => {
                      linkBank(bank);
                      setStage('linking');
                    }}
                  >
                    {stage === 'form' && `Link ${bank.bankName}`}
                    {stage === 'linking' && <IconLoadingCircle size={22} className={styles.spin} />}
                    {stage === 'linked' && (
                      <>
                        <IconCheckmark1 size={20} /> Linked
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** A skin's bank flow: `open(id, ask)` from its bank ask, and the sheet to render in its screen. */
export function useBankLink({
  wallet,
  messages,
  onAllow,
  onDeny,
}: {
  wallet: string;
  messages: Message[];
  onAllow: () => void;
  onDeny: () => void;
}) {
  const [ask, setAsk] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const live = ask !== null && messages.some((m) => m.kind === 'ask' && m.id === ask && m.state === 'open');
  useEffect(() => {
    if (open && !live) setOpen(false);
  }, [open, live]);
  return {
    open: (id: number) => {
      setAsk(id);
      setOpen(true);
    },
    sheet: (
      <AppSheet open={open} present={SHEET_IN} dim={0.3} className={styles.panel} onDismiss={() => setOpen(false)}>
        <div className={styles.sheet}>
          <BankLinkFlow
            key={ask ?? 0}
            wallet={wallet}
            onClose={() => {
              setOpen(false);
              onDeny();
            }}
            onLinked={() => {
              setOpen(false);
              onAllow();
            }}
          />
        </div>
      </AppSheet>
    ),
  };
}

/** The bank ask in the thread: where it can come from, and Link bank (which opens the flow above). */
export function VaultBankAsk({
  ask,
  state,
  onOpen,
  onDeny,
  className,
}: {
  ask: AgentAsk;
  state: AskState;
  onOpen: () => void;
  onDeny: () => void;
  className?: string;
}) {
  const b = askButtons(ask, state);
  return (
    <div className={`${styles.ask} ${className ?? ''}`}>
      <span className={styles.askFlags} aria-hidden>
        {FUNDING_POPULAR.slice(0, 6).map((c) => (
          <Flag key={c.code} code={c.code} size={28} />
        ))}
      </span>
      <strong className={styles.askTitle}>{state === 'done' ? `${linkedBank().bankName} •••• ${linkedBank().last4} linked` : ask.title}</strong>
      <span className={styles.askNote}>
        Banks in {BANK_COUNTRIES.length} countries, over local rails like ACH, SEPA, PIX, SPEI and UPI.
      </span>
      {!b.settled && (
        <span className={styles.askActions}>
          <button type="button" className={styles.askDeny} disabled={b.pressing} onClick={onDeny}>
            {b.denyLabel}
          </button>
          <button type="button" className={styles.askAdd} disabled={b.pressing} onClick={onOpen} data-opens-sheet>
            {ask.allow ?? 'Link bank'}
          </button>
        </span>
      )}
      {state === 'denied' && <span className={styles.askNote}>{b.denyLabel}</span>}
    </div>
  );
}
