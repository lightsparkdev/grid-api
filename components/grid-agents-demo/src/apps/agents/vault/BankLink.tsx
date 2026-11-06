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
import { BANK_REACH, currencyFor, type BankCountry } from '@/data/bankCountries';
import type { AgentAsk, AskState, Message } from '../conversation';
import type { LinkedBank } from '../linkedBank';
import { askButtons } from '../parts';
import { GlassButton } from '../glass';
import { AppSheet } from '../sheet';
import { SheetDisc } from '../SheetPage';
import { APP_ICONS, opensPlaid, usePlaidLink } from './PlaidLink';
import { useAskSheet } from './useAskSheet';
import { BANK_ALL, BANK_POPULAR, bankDoneLabel, bankFields, countryShort, payeeBlurb, useBankPicker } from './useBankPicker';
import { cardFields, cardLabel, useCardEntry } from './useCardEntry';
import styles from './BankLink.module.scss';

/*
 * The neutral bank flow (Your app): grid-wallet-demo's Add bank screen. The country list, then the prefilled
 * account; Link bank saves it and the agent requests the top-up.
 */

const SHEET_IN: Transition = { duration: 0.45, ease: [0.3, 0.7, 0.2, 1] };
/** The button turns iOS green once it's done. */
const LINKED = '#34c759';
const STEP: Transition = { duration: 0.35, ease: [0.2, 0.8, 0.2, 1] };
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
  payee,
  home,
  onLinked,
  onClose,
  className,
}: {
  wallet: string;
  /** Someone else's bank, to pay them: the flow opens on it. */
  payee?: AgentAsk['recipient'];
  /** The person's own bank: the country they said, to open on. */
  home?: string;
  onLinked: (bank: LinkedBank) => void;
  onClose?: () => void;
  /** A host page's palette: it can set --bank-surface, --bank-fill, --bank-muted, --bank-line, --bank-cta, --bank-cta-text. */
  className?: string;
}) {
  const picker = useBankPicker(onLinked, payee, home);
  const { bank, back, query, setQuery, results, stage, pick } = picker;
  const step = bank ? 'details' : 'country';
  const slide = { custom: back, variants: SLIDE, initial: 'enter', animate: 'center', exit: 'exit' };

  return (
    <div className={`${styles.flow} ${className ?? ''}`}>
      <header className={styles.bar}>
        {step === 'details' && !payee ? (
          <SheetDisc label="Back" disabled={picker.busy} onClick={picker.unpick}>
            <IconChevronLeft size={22} />
          </SheetDisc>
        ) : (
          onClose && (
            <SheetDisc label="Close" onClick={onClose}>
              <IconCrossMedium size={22} />
            </SheetDisc>
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
                  Move money between your {wallet} and a bank in {BANK_REACH} countries, over its local rails.
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
                {results ? (
                  <>
                    <p className={styles.section}>Results</p>
                    {results.map((c) => (
                      <CountryRow key={c.code} country={c} onPick={pick} />
                    ))}
                  </>
                ) : (
                  <>
                    <p className={styles.section}>Popular</p>
                    {BANK_POPULAR.map((c) => (
                      <CountryRow key={c.code} country={c} onPick={pick} />
                    ))}
                    <p className={styles.section}>All countries</p>
                    {BANK_ALL.map((c) => (
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
                  <h2 className={styles.title}>{payee ? `${payee.first}’s bank` : `Your ${countryShort(bank.country)} bank`}</h2>
                  <p className={styles.sub}>
                    {payee
                      ? `${payeeBlurb(bank, payee.first)} Your agent pays by account.`
                      : `Money moves over ${bank.country.rail} in ${bank.currency}, in and out of your ${wallet}.`}
                  </p>
                  <div className={styles.fields}>
                    {bankFields(bank).map((f) => (
                      <Field key={f.key} label={f.label} value={f.value} flag={f.flag} />
                    ))}
                  </div>
                </div>
                <div className={styles.cta}>
                  <GlassButton
                    label={payee ? 'Save' : `Link ${bank.bankName}`}
                    tint={stage === 'linked' ? LINKED : 'var(--bank-cta)'}
                    ink={stage === 'linked' ? '#fff' : 'var(--bank-cta-text)'}
                    height={52}
                    size={370}
                    onClick={picker.busy ? undefined : picker.link}
                  >
                    {stage === 'form' && (payee ? 'Save' : `Link ${bank.bankName}`)}
                    {stage === 'linking' && <IconLoadingCircle size={22} className={styles.spin} />}
                    {stage === 'linked' && (
                      <>
                        <IconCheckmark1 size={20} /> {payee ? 'Saved' : 'Linked'}
                      </>
                    )}
                  </GlassButton>
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
  const shown = messages.find((m): m is Extract<Message, { kind: 'ask' }> => m.kind === 'ask' && m.id === ask);
  useEffect(() => {
    if (open && !live) setOpen(false);
  }, [open, live]);
  const showForm = (id: number) => {
    setAsk(id);
    setOpen(true);
  };
  const plaid = usePlaidLink({ app: 'Your app', icon: APP_ICONS.yourapp, messages, onLinked: onAllow, onManual: showForm });
  return {
    // Your own bank goes through Plaid; someone else's, or one Plaid doesn't have, through the form.
    open: (id: number) => {
      const m = messages.find((x): x is Extract<Message, { kind: 'ask' }> => x.kind === 'ask' && x.id === id);
      if (m && opensPlaid(m.ask)) plaid.open(id, m.ask);
      else showForm(id);
    },
    sheet: (
      <>
        <AppSheet open={open} present={SHEET_IN} dim={0.3} className={styles.panel} onDismiss={() => setOpen(false)}>
          <div className={styles.sheet}>
            <BankLinkFlow
              key={ask ?? 0}
              wallet={wallet}
              payee={shown?.ask.recipient}
              home={shown?.ask.home}
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
        {plaid.overlay}
      </>
    ),
  };
}

/** The neutral card form: the card's details, filled in, and Save card. */
function CardForm({ ask, onSaved, onClose }: { ask: AgentAsk; onSaved: () => void; onClose: () => void }) {
  const entry = useCardEntry(onSaved);
  return (
    <div className={styles.flow}>
      <header className={styles.bar}>
        <SheetDisc label="Close" disabled={entry.busy} onClick={onClose}>
          <IconCrossMedium size={22} />
        </SheetDisc>
      </header>
      <div className={styles.scroll}>
        <h2 className={styles.title}>Add a card</h2>
        <p className={styles.sub}>Save it once and your agent can pay with it.</p>
        <div className={styles.fields}>
          {cardFields(ask).map((f) => (
            <Field key={f.key} label={f.label} value={f.value} />
          ))}
        </div>
      </div>
      <div className={styles.cta}>
        <GlassButton
          label={ask.allow ?? 'Save card'}
          tint={entry.stage === 'saved' ? LINKED : 'var(--bank-cta)'}
          ink={entry.stage === 'saved' ? '#fff' : 'var(--bank-cta-text)'}
          height={52}
          size={370}
          onClick={entry.busy ? undefined : entry.save}
        >
          {entry.stage === 'form' && (ask.allow ?? 'Save card')}
          {entry.stage === 'saving' && <IconLoadingCircle size={22} className={styles.spin} />}
          {entry.stage === 'saved' && (
            <>
              <IconCheckmark1 size={20} /> Saved
            </>
          )}
        </GlassButton>
      </div>
    </div>
  );
}

/** A skin's neutral card flow: `open(id, ask)` from its card ask, and the sheet to render in its screen. */
export function useCardSheet({ messages, onAllow }: { messages: Message[]; onAllow: () => void }) {
  const sheet = useAskSheet(messages);
  return {
    open: sheet.show,
    sheet: (
      <AppSheet open={sheet.open} present={SHEET_IN} dim={0.3} className={styles.panel} onDismiss={sheet.hide}>
        <div className={styles.sheet}>
          {sheet.ask && (
            <CardForm
              key={sheet.id}
              ask={sheet.ask}
              onClose={sheet.hide}
              onSaved={() => {
                sheet.hide();
                onAllow();
              }}
            />
          )}
        </div>
      </AppSheet>
    ),
  };
}

/** The card ask in the thread: the card, what it's for, and Add card (which opens the form above). */
export function VaultCardAsk({
  ask,
  state,
  onOpen,
  onDeny,
}: {
  ask: AgentAsk;
  state: AskState;
  onOpen: () => void;
  onDeny: () => void;
}) {
  const b = askButtons(ask, state);
  return (
    <div className={styles.ask}>
      <span className={styles.cardMark} aria-hidden>
        <i />
      </span>
      <strong className={styles.askTitle}>{state === 'done' ? `${cardLabel(ask)} saved` : ask.title}</strong>
      <span className={styles.askNote}>Remove it any time in Settings.</span>
      {!b.settled && (
        <span className={styles.askActions}>
          <button type="button" className={styles.askDeny} disabled={b.pressing} onClick={onDeny}>
            {b.denyLabel}
          </button>
          <button type="button" className={styles.askAdd} disabled={b.pressing} onClick={onOpen} data-opens-sheet>
            Add card
          </button>
        </span>
      )}
      {state === 'denied' && <span className={styles.askNote}>{b.denyLabel}</span>}
    </div>
  );
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
        {ask.recipient ? (
          <Flag code={ask.recipient.country} size={28} />
        ) : (
          BANK_POPULAR.slice(0, 6).map((c) => <Flag key={c.code} code={c.code} size={28} />)
        )}
      </span>
      <strong className={styles.askTitle}>{state === 'done' ? bankDoneLabel(ask) : ask.title}</strong>
      <span className={styles.askNote}>
        {ask.recipient
          ? `Add it once and your agent can pay ${ask.recipient.first} whenever you ask.`
          : `Banks in ${BANK_REACH} countries, over local rails like ACH, SEPA, PIX, SPEI and UPI.`}
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
