import type { ReactNode } from 'react';
import { IconBank } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconBank';
import { IconCheckmark1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckmark1';
import { IconChevronLeft } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronLeft';
import { IconCreditCard1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCreditCard1';
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossMedium';
import { IconLoadingCircle } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconLoadingCircle';
import { IconSortArrowUpDown } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconSortArrowUpDown';
import { Flag } from '@/apps/shared/Flag';
import { BankMark } from '../BankMark';
import { BANK_REACH, currencyFor, type BankCountry } from '@/data/bankCountries';
import type { AgentAsk, AskState, Message } from '../conversation';
import { linkedBank } from '../linkedBank';
import { recipientNamed } from '../recipients';
import { GlassPill, PressButton } from '../glass';
import { PageSheet, SheetDisc, SheetPage, SheetSteps } from '../SheetPage';
import { APP_ICONS, opensPlaid, usePlaidLink } from '../vault/PlaidLink';
import { useAskSheet } from '../vault/useAskSheet';
import { BANK_ALL, BANK_POPULAR, bankFields, payeeBlurb, popularity, railBlurb, useBankPicker, type BankPicker } from '../vault/useBankPicker';
import { cardFields, cardLabel, useCardEntry } from '../vault/useCardEntry';
import styles from './DuetVault.module.scss';

/*
 * Duet's bank and card, as the Claude app draws its settings (IMG_1930–1937): a connector card in the thread like
 * "Connector discovery"; the bank list as its Connectors browse (one card per country, its rank, a black Connect,
 * a line about it, search floating at the foot); the account as its Profile page (label, then value, in a white
 * group) saved with the check disc.
 */

/** The connector card in the thread: the tile, what it connects and a line, and a black Connect. */
export function DuetConnector({ ask, state, onOpen }: { ask: AgentAsk; state: AskState; onOpen: () => void }) {
  const done = state === 'done';
  const pending = state === 'pressing' || state === 'authing';
  const payee = ask.recipient;
  const saved = payee ? recipientNamed(payee.name) : undefined;
  const name = payee ? `${payee.first}’s bank` : ask.bank ? 'Bank account' : 'Credit or debit card';
  const line = payee
    ? done && saved
      ? `${saved.bank.bankName} •••• ${saved.bank.last4} is saved. Duet pays it by account.`
      : `Add it once and Duet can pay ${payee.first} whenever you ask.`
    : done
      ? ask.bank
        ? `${linkedBank().bankName} •••• ${linkedBank().last4} is connected.`
        : `${cardLabel(ask)} is saved to your vault.`
      : ask.bank
        ? `Move money between your Duet balance and a bank in ${BANK_REACH} countries.`
        : 'Save a card once and Duet can top up from it when you ask.';
  const action = payee ? (done ? 'Saved' : pending ? 'Saving…' : 'Add') : done ? 'Connected' : pending ? 'Connecting…' : 'Connect';
  return (
    <div className={styles.connector} data-state={state}>
      <span className={styles.connectorHead}>
        <span className={styles.tile}>
          {payee ? <Flag code={payee.country} size={20} /> : ask.bank ? <IconBank size={18} /> : <IconCreditCard1 size={18} />}
        </span>
        <strong>{name}</strong>
        <button type="button" className={styles.connect} disabled={state !== 'open'} onClick={onOpen} data-opens-sheet>
          {state === 'denied' ? (ask.denied ?? 'Not now') : action}
        </button>
      </span>
      <span className={styles.connectorLine}>{line}</span>
    </div>
  );
}

function CountryCard({ country, onPick }: { country: BankCountry; onPick: (c: BankCountry) => void }) {
  return (
    // The whole card opens the country, as Connect does.
    <div className={styles.card} onClick={() => onPick(country)}>
      <span className={styles.cardHead}>
        <span className={styles.tile}>
          <Flag code={country.code} size={20} />
        </span>
        <span className={styles.cardName}>
          <strong>{country.name}</strong>
          <small>{popularity(country) ?? currencyFor(country)}</small>
        </span>
        <span className={styles.connect}>Connect</span>
      </span>
      <span className={styles.cardLine}>{railBlurb(country)}</span>
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <h3 className={styles.label}>{children}</h3>;
}

function ListPage({ picker, onClose }: { picker: BankPicker; onClose: () => void }) {
  return (
    <SheetPage
      title="Select country"
      leading={
        <SheetDisc label="Close" onClick={onClose}>
          <IconCrossMedium size={22} />
        </SheetDisc>
      }
      trailing={
        <SheetDisc label="Sort">
          <IconSortArrowUpDown size={20} />
        </SheetDisc>
      }
      search={{ at: 'bottom', placeholder: 'Search', value: picker.query, onChange: picker.setQuery }}
    >
      <div className={styles.cards}>
        {picker.results ? (
          <>
            {picker.results.map((c) => (
              <CountryCard key={c.code} country={c} onPick={picker.pick} />
            ))}
            {!picker.results.length && <p className={styles.foot}>No banks in “{picker.query}” yet.</p>}
          </>
        ) : (
          <>
            <Label>Popular</Label>
            {BANK_POPULAR.map((c) => (
              <CountryCard key={c.code} country={c} onPick={picker.pick} />
            ))}
            <Label>All countries</Label>
            {BANK_ALL.map((c) => (
              <CountryCard key={c.code} country={c} onPick={picker.pick} />
            ))}
          </>
        )}
      </div>
    </SheetPage>
  );
}

/** Profile's group: the label in its column, the value beside it. */
function Rows({ rows }: { rows: { key: string; label: string; value: string; flag?: string }[] }) {
  return (
    <div className={styles.group}>
      {rows.map((f) => (
        <div key={f.key} className={styles.row}>
          <span className={styles.rowLabel}>{f.label}</span>
          <span className={styles.rowValue}>
            {f.flag && <Flag code={f.flag} size={18} />}
            {f.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/** The check disc that saves, dark once there's something to save (IMG_1931). */
function SaveDisc({ stage, onClick }: { stage: 'form' | 'busy' | 'done'; onClick: () => void }) {
  return (
    <PressButton label="Save" className={styles.saveDisc} onClick={stage === 'form' ? onClick : undefined}>
      <GlassPill radius={22} tint="var(--dv-ink)">
        <span className={styles.saveInk}>
          {stage === 'busy' ? <IconLoadingCircle size={20} className={styles.spin} /> : <IconCheckmark1 size={22} />}
        </span>
      </GlassPill>
    </PressButton>
  );
}

function Hero({ children }: { children: ReactNode }) {
  return (
    <div className={styles.hero}>
      <span className={styles.avatar}>{children}</span>
    </div>
  );
}

function BankPages({ picker, onClose }: { picker: BankPicker; onClose: () => void }) {
  const { bank } = picker;
  return (
    <SheetSteps step={bank ? 'details' : 'list'} back={picker.back}>
      {bank ? (
        <SheetPage
          title={picker.payee ? `${picker.payee.first}’s bank` : bank.bankName}
          leading={
            picker.payee ? (
              <SheetDisc label="Close" onClick={onClose} disabled={picker.busy}>
                <IconCrossMedium size={22} />
              </SheetDisc>
            ) : (
              <SheetDisc label="Back" onClick={picker.unpick} disabled={picker.busy}>
                <IconChevronLeft size={22} />
              </SheetDisc>
            )
          }
          trailing={<SaveDisc stage={picker.stage === 'form' ? 'form' : picker.stage === 'linking' ? 'busy' : 'done'} onClick={picker.link} />}
        >
          <div className={styles.hero}>
            <BankMark bank={bank.bankName} country={bank.country.code} size={80} />
          </div>
          <Rows rows={bankFields(bank)} />
          <p className={styles.foot}>
            {picker.payee
              ? `${payeeBlurb(bank, picker.payee.first)} Duet pays by account and never sees these numbers.`
              : `Money moves over ${bank.country.rail} in ${bank.currency}, in and out of your balance. Duet only moves it when you ask.`}
          </p>
        </SheetPage>
      ) : (
        <ListPage picker={picker} onClose={onClose} />
      )}
    </SheetSteps>
  );
}

function BankFlow({ payee, home, onLinked, onClose }: { payee?: AgentAsk['recipient']; home?: string; onLinked: () => void; onClose: () => void }) {
  const picker = useBankPicker(onLinked, payee, home);
  return <BankPages picker={picker} onClose={onClose} />;
}

/** Duet's bank flow: Connect on its card opens the browse; closing leaves the card waiting. */
export function useDuetBank({ messages, onAllow }: { messages: Message[]; onAllow: () => void }) {
  const sheet = useAskSheet(messages);
  const plaid = usePlaidLink({ app: 'Duet', icon: APP_ICONS.duet, messages, onLinked: onAllow, onManual: sheet.show });
  return {
    // Your own bank goes through Plaid; someone else's, or one Plaid doesn't have, through the browse.
    open: (id: number, ask: AgentAsk) => (opensPlaid(ask) ? plaid.open(id, ask) : sheet.show(id, ask)),
    sheet: (
      <>
        <PageSheet open={sheet.open} className={styles.theme} onDismiss={sheet.hide}>
          <BankFlow
            key={sheet.id}
            payee={sheet.ask?.recipient}
            home={sheet.ask?.home}
            onClose={sheet.hide}
            onLinked={() => {
              sheet.hide();
              onAllow();
            }}
          />
        </PageSheet>
        {plaid.overlay}
      </>
    ),
  };
}

function CardPage({ ask, onSaved, onClose }: { ask: AgentAsk; onSaved: () => void; onClose: () => void }) {
  const entry = useCardEntry(onSaved);
  return (
    <SheetPage
      title="Add card"
      leading={
        <SheetDisc label="Close" onClick={onClose} disabled={entry.busy}>
          <IconCrossMedium size={22} />
        </SheetDisc>
      }
      trailing={<SaveDisc stage={entry.stage === 'form' ? 'form' : entry.stage === 'saving' ? 'busy' : 'done'} onClick={entry.save} />}
    >
      <Hero>
        <IconCreditCard1 size={36} />
      </Hero>
      <Rows rows={cardFields(ask)} />
      <p className={styles.foot}>Saved to your vault. Duet can pay with it but never sees the number.</p>
    </SheetPage>
  );
}

/** Duet's card flow: the card as a Profile-style page. */
export function useDuetCard({ messages, onAllow }: { messages: Message[]; onAllow: () => void }) {
  const sheet = useAskSheet(messages);
  return {
    open: sheet.show,
    sheet: (
      <PageSheet open={sheet.open} className={styles.theme} onDismiss={sheet.hide}>
        {sheet.ask && (
          <CardPage
            key={sheet.id}
            ask={sheet.ask}
            onClose={sheet.hide}
            onSaved={() => {
              sheet.hide();
              onAllow();
            }}
          />
        )}
      </PageSheet>
    ),
  };
}
