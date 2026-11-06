import { useState, type ReactNode } from 'react';
import { IconBank } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconBank';
import { IconCheckmark1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckmark1';
import { IconChevronLeft } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronLeft';
import { IconChevronRight } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronRight';
import { IconCreditCard1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCreditCard1';
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossMedium';
import { IconEyeOpen } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconEyeOpen';
import { IconGlobe2 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconGlobe2';
import { IconLoadingCircle } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconLoadingCircle';
import { IconPlusMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPlusMedium';
import { IconSettingsSliderHor } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconSettingsSliderHor';
import { IconWallet1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconWallet1';
import { Flag } from '@/apps/shared/Flag';
import { BankMark } from '../BankMark';
import { BANK_REACH, type BankCountry } from '@/data/bankCountries';
import type { AgentAsk, AskState, Message, PayTo } from '../conversation';
import { hasLinkedBank, linkedBank } from '../linkedBank';
import { GlassButton } from '../glass';
import { PageSheet, SheetDisc, SheetPage, SheetSteps } from '../SheetPage';
import { AppSheet } from '../sheet';
import { APP_ICONS, opensPlaid, usePlaidLink } from '../vault/PlaidLink';
import { useAskSheet } from '../vault/useAskSheet';
import { recipientNamed } from '../recipients';
import { BANK_ALL, BANK_POPULAR, bankFields, payeeBlurb, railBlurb, railLine, useBankPicker, type BankPicker } from '../vault/useBankPicker';
import { cardFields, cardLabel, useCardEntry } from '../vault/useCardEntry';
import styles from './MuseConnect.module.scss';

/*
 * Muse's connectors, from its Plaid recording (Nov 5, 18:17 and 18:18) and Settings (IMG_1907–1918):
 * - In the thread, a connector card: the tile, its name over "Connector", and Connect, which reads Connected once done.
 * - Connect opens the permission sheet (three plain promises, a blue Connect and Cancel), then the list in a page
 *   sheet: the large title, search pinned at the top, Available and Connected, Featured, then grouped lists.
 * - The account opens as a Wallet page: the tile, a centered title and a line, the details grouped, a blue Connect.
 */

const SHEET_IN = { duration: 0.45, ease: [0.3, 0.7, 0.2, 1] } as const;
/** Muse's blue, the middle of its button's gradient, as the glass's tint. */
const BLUE = '#2a62e3';

/** The connector card in the thread (recording 18:17, 9s at 3x): ~238pt in the bubble gray, a 35pt dark tile. */
export function ConnectorCard({ ask, state, pos, onOpen }: { ask: AgentAsk; state: AskState; pos?: string; onOpen: () => void }) {
  const done = state === 'done';
  const payee = ask.recipient;
  const saved = payee ? recipientNamed(payee.name) : undefined;
  const name = payee ? `${payee.first}’s bank` : ask.bank ? 'Bank account' : 'Credit or debit card';
  const sub = payee
    ? done && saved
      ? `${saved.bank.bankName} •••• ${saved.bank.last4}`
      : 'To pay them'
    : done
      ? ask.bank
        ? `${linkedBank().bankName} •••• ${linkedBank().last4}`
        : cardLabel(ask)
      : ask.bank
        ? 'Connector'
        : 'Vault';
  return (
    <div className={styles.card} data-state={state} data-pos={pos}>
      <span className={styles.cardHead}>
        {done && payee && saved ? (
          <BankMark bank={saved.bank.bankName} country={saved.bank.country.code} size={35} />
        ) : done && ask.bank && !payee ? (
          <BankMark bank={linkedBank().bankName} country={linkedBank().country.code} size={35} />
        ) : (
          <span className={styles.cardTile}>
            {payee ? <Flag code={payee.country} size={24} /> : ask.bank ? <IconBank size={20} /> : <IconCreditCard1 size={20} />}
          </span>
        )}
        <span className={styles.cardText}>
          <strong>{name}</strong>
          <small>{sub}</small>
        </span>
      </span>
      <button type="button" className={styles.cardButton} disabled={state !== 'open'} onClick={onOpen} data-opens-sheet>
        {payee
          ? done
            ? 'Added'
            : state === 'denied'
              ? (ask.denied ?? 'Not now')
              : state === 'pressing'
                ? 'Adding…'
                : 'Add'
          : done
            ? 'Connected'
            : state === 'denied'
              ? (ask.denied ?? 'Not now')
              : state === 'pressing' || state === 'authing'
                ? 'Connecting…'
                : 'Connect'}
      </button>
    </div>
  );
}

/** The permission sheet (recording 18:17, 15s): a grabber, the tile, three promises, the fine print, Connect. */
function Permission({ onConnect, onCancel }: { onConnect: () => void; onCancel: () => void }) {
  return (
    <div className={styles.perm}>
      <span className={styles.grabber} />
      <span className={styles.permTile}>
        <IconBank size={22} />
      </span>
      <strong className={styles.permTitle}>Bank account</strong>
      <p className={styles.permSub}>Securely link a bank to move money in and out of your Muse balance</p>
      <ul className={styles.promises}>
        <li>
          <IconGlobe2 size={16} />
          <span>
            <b>Banks in {BANK_REACH} countries</b>
            Muse links your account over its local rail, like ACH, SEPA, PIX, SPEI or UPI.
          </span>
        </li>
        <li>
          <IconSettingsSliderHor size={16} />
          <span>
            <b>You choose what Muse can do</b>
            By default, Muse asks before moving anything above your limit. Disconnect at any time in Settings.
          </span>
        </li>
        <li>
          <IconEyeOpen size={16} />
          <span>
            <b>Keep an eye on things</b>
            Every transfer shows up in your Muse balance activity.
          </span>
        </li>
      </ul>
      <p className={styles.permFine}>You can manage this connection in Settings.</p>
      <GlassButton label="Connect" tint={BLUE} ink="#fff" height={46} size={340} className={styles.permConnect} onClick={onConnect}>
        Connect
      </GlassButton>
      <button type="button" className={styles.cancel} onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}

function ListRow({ country, onPick }: { country: BankCountry; onPick: (c: BankCountry) => void }) {
  return (
    <button type="button" className={styles.row} onClick={() => onPick(country)}>
      <span className={styles.rowTile}>
        <Flag code={country.code} size={22} />
      </span>
      <span className={styles.rowName}>{country.name}</span>
      <span className={styles.rowAction}>Connect</span>
    </button>
  );
}

function Group({ title, all, children }: { title: string; all?: boolean; children: ReactNode }) {
  return (
    <section className={styles.group}>
      <header className={styles.groupHead}>
        <h3>{title}</h3>
        {all && (
          <span className={styles.seeAll}>
            See all <IconChevronRight size={14} />
          </span>
        )}
      </header>
      <div className={styles.list}>{children}</div>
    </section>
  );
}

function ListPage({ picker, onClose }: { picker: BankPicker; onClose: () => void }) {
  const [tab, setTab] = useState<'available' | 'connected'>('available');
  return (
    <SheetPage
      title="Select country"
      large
      leading={
        <SheetDisc label="Close" onClick={onClose}>
          <IconCrossMedium size={22} />
        </SheetDisc>
      }
      search={{ at: 'top', placeholder: 'Search countries', value: picker.query, onChange: picker.setQuery }}
    >
      {picker.results ? (
        <Group title="Results">
          {picker.results.map((c) => (
            <ListRow key={c.code} country={c} onPick={picker.pick} />
          ))}
          {!picker.results.length && <p className={styles.empty}>No banks in “{picker.query}” yet.</p>}
        </Group>
      ) : (
        <>
          <div className={styles.tabs} role="tablist">
            {(['available', 'connected'] as const).map((t) => (
              <button key={t} type="button" role="tab" className={styles.tab} aria-selected={tab === t} onClick={() => setTab(t)}>
                {t === 'available' ? 'Available' : 'Connected'}
              </button>
            ))}
          </div>
          {tab === 'connected' ? (
            hasLinkedBank() ? (
              <Group title="Connected">
                <button type="button" className={styles.row}>
                  <BankMark bank={linkedBank().bankName} country={linkedBank().country.code} size={32} />
                  <span className={styles.rowName}>
                    {linkedBank().bankName} •••• {linkedBank().last4}
                  </span>
                  <span className={styles.rowAction}>View</span>
                </button>
              </Group>
            ) : (
              <p className={styles.empty}>No banks connected yet. Connect one to move money in and out of your Muse balance.</p>
            )
          ) : (
            <>
              <Group title="Featured">
                {BANK_POPULAR.slice(0, 3).map((c) => (
                  <button key={c.code} type="button" className={styles.featured} onClick={() => picker.pick(c)}>
                    <span className={styles.featuredText}>
                      <strong>{c.name}</strong>
                      <small>{railBlurb(c)}</small>
                    </span>
                    <span className={styles.featuredArt}>
                      <Flag code={c.code} size={44} />
                    </span>
                  </button>
                ))}
              </Group>
              <Group title="Popular" all>
                {BANK_POPULAR.slice(3).map((c) => (
                  <ListRow key={c.code} country={c} onPick={picker.pick} />
                ))}
              </Group>
              <Group title="All countries">
                {BANK_ALL.map((c) => (
                  <ListRow key={c.code} country={c} onPick={picker.pick} />
                ))}
              </Group>
            </>
          )}
        </>
      )}
    </SheetPage>
  );
}

/** The Wallet page's header (IMG_1911): a tile, the centered title, a line. */
/** `bare` art (a bank's own icon) is its own tile. */
function Hero({ art, title, sub, bare }: { art: ReactNode; title: string; sub: string; bare?: boolean }) {
  return (
    <div className={styles.hero}>
      {bare ? art : <span className={styles.heroTile}>{art}</span>}
      <strong className={styles.heroTitle}>{title}</strong>
      <p className={styles.heroSub}>{sub}</p>
    </div>
  );
}

function Details({ rows }: { rows: { key: string; label: string; value: string; flag?: string }[] }) {
  return (
    <div className={`${styles.list} ${styles.details}`}>
      {rows.map((f) => (
        <div key={f.key} className={styles.detail}>
          <span className={styles.detailLabel}>{f.label}</span>
          <span className={styles.detailValue}>
            {f.flag && <Flag code={f.flag} size={18} />}
            {f.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function BlueButton({
  busy,
  done,
  label,
  doneLabel = 'Connected',
  onClick,
}: {
  busy: boolean;
  done: boolean;
  label: string;
  doneLabel?: string;
  onClick: () => void;
}) {
  return (
    <GlassButton label={label} tint={BLUE} ink="#fff" height={46} size={370} onClick={busy ? undefined : onClick}>
      {done ? (
        <>
          <IconCheckmark1 size={18} /> {doneLabel}
        </>
      ) : busy ? (
        <IconLoadingCircle size={20} className={styles.spin} />
      ) : (
        label
      )}
    </GlassButton>
  );
}

function BankPages({ picker, onClose }: { picker: BankPicker; onClose: () => void }) {
  const { bank } = picker;
  return (
    <SheetSteps step={bank ? 'details' : 'list'} back={picker.back}>
      {bank ? (
        picker.payee ? (
          <SheetPage
            title={`${picker.payee.first}’s bank`}
            heading={
              <Hero
                bare
                art={<BankMark bank={bank.bankName} country={bank.country.code} size={56} />}
                title={`${picker.payee.first}’s bank`}
                sub={payeeBlurb(bank, picker.payee.first)}
              />
            }
            leading={
              <SheetDisc label="Close" onClick={onClose} disabled={picker.busy}>
                <IconCrossMedium size={22} />
              </SheetDisc>
            }
            footer={<BlueButton busy={picker.busy} done={picker.stage === 'linked'} label="Save" doneLabel="Saved" onClick={picker.link} />}
          >
            <Details rows={bankFields(bank)} />
            <p className={styles.note}>Muse pays {picker.payee.first} by account. Remove them at any time in Settings.</p>
          </SheetPage>
        ) : (
          <SheetPage
            title={bank.bankName}
            heading={
              <Hero
                bare
                art={<BankMark bank={bank.bankName} country={bank.country.code} size={56} />}
                title={bank.bankName}
                sub={`Money moves over ${railLine(bank.country).replace(' · ', ' in ')}, in and out of your Muse balance.`}
              />
            }
            leading={
              <SheetDisc label="Back" onClick={picker.unpick} disabled={picker.busy}>
                <IconChevronLeft size={22} />
              </SheetDisc>
            }
            footer={<BlueButton busy={picker.busy} done={picker.stage === 'linked'} label="Connect" onClick={picker.link} />}
          >
            <Details rows={bankFields(bank)} />
            <p className={styles.note}>Muse only moves money with this account when you ask. Disconnect at any time in Settings.</p>
          </SheetPage>
        )
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

/**
 * Muse's bank flow: the permission sheet, then Plaid for your own bank (recording 18:17), or the list for someone
 * else's or a bank Plaid doesn't have. Cancel or a swipe leaves the card waiting.
 */
export function useMuseBank({ messages, onAllow }: { messages: Message[]; onAllow: () => void }) {
  const sheet = useAskSheet(messages);
  const [listed, setListed] = useState(false);
  const plaid = usePlaidLink({
    app: 'Muse',
    icon: APP_ICONS.muse,
    messages,
    onLinked: onAllow,
    onManual: (id, ask) => {
      setListed(true);
      sheet.show(id, ask);
    },
  });
  return {
    open: (id: number, ask: AgentAsk) => {
      setListed(!!ask.recipient);
      sheet.show(id, ask);
    },
    sheet: (
      <>
        <AppSheet open={sheet.open && !listed} present={SHEET_IN} dim={0.3} className={styles.permPanel} onDismiss={sheet.hide}>
          <Permission
            onConnect={() => {
              if (sheet.ask && !opensPlaid(sheet.ask)) return setListed(true);
              sheet.hide();
              if (sheet.ask) plaid.open(sheet.id, sheet.ask);
            }}
            onCancel={sheet.hide}
          />
        </AppSheet>
        <PageSheet open={sheet.open && listed} className={styles.theme} onDismiss={sheet.hide}>
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
      title="Add a card"
      heading={<Hero art={<IconCreditCard1 size={26} />} title="Add a card" sub="Securely save a card for Muse to pay with." />}
      leading={
        <SheetDisc label="Close" onClick={onClose} disabled={entry.busy}>
          <IconCrossMedium size={22} />
        </SheetDisc>
      }
      footer={
        <GlassButton label="Add" tint={BLUE} ink="#fff" height={46} size={370} onClick={entry.busy ? undefined : entry.save}>
          {entry.stage === 'saved' ? (
            <>
              <IconCheckmark1 size={18} /> Added
            </>
          ) : entry.busy ? (
            <IconLoadingCircle size={20} className={styles.spin} />
          ) : (
            'Add'
          )}
        </GlassButton>
      }
    >
      <Details rows={cardFields(ask)} />
      <p className={styles.note}>Muse will only see the last four digits of your card. Remove it at any time in Settings.</p>
    </SheetPage>
  );
}

/** Muse's card flow: the Add a card page, as its Wallet adds a payment method. */
export function useMuseCard({ messages, onAllow }: { messages: Message[]; onAllow: () => void }) {
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

/** Meta Pay's Pay with: the saved card and the Muse balance (short of the total, it offers Add money), then Cancel. */
function PayWith({ pay, onPick, onClose }: { pay: NonNullable<AgentAsk['pay']>; onPick: (to: PayTo) => void; onClose: () => void }) {
  return (
    <div className={styles.perm}>
      <span className={styles.grabber} />
      <strong className={styles.payTitle}>Pay with</strong>
      <div className={styles.payList}>
        <button type="button" className={styles.payOption} onClick={() => onPick('card')}>
          <span className={styles.payTile}>
            <IconCreditCard1 size={20} />
          </span>
          <span className={styles.payText}>
            <b>{pay.card}</b>
            <small>Saved card · Expires 09/29</small>
          </span>
          {pay.by === 'card' && <IconCheckmark1 size={20} className={styles.payCheck} />}
        </button>
        <button type="button" className={styles.payOption} disabled={!pay.enough} onClick={() => onPick('balance')}>
          <span className={styles.payTile}>
            <IconWallet1 size={20} />
          </span>
          <span className={styles.payText}>
            <b>{pay.wallet}</b>
            <small>{pay.enough ? `${pay.balance} available` : `${pay.balance} available · not enough for this`}</small>
          </span>
          {pay.by === 'balance' && <IconCheckmark1 size={20} className={styles.payCheck} />}
        </button>
      </div>
      {!pay.enough && (
        <button type="button" className={styles.payAdd} onClick={() => onPick('topup')}>
          <IconPlusMedium size={18} />
          Add money to {pay.wallet}
        </button>
      )}
      <button type="button" className={styles.cancel} onClick={onClose}>
        Cancel
      </button>
    </div>
  );
}

/** The checkout's Pay with row opens this; picking another way hands it back to the agent (`onSwap`). */
export function useMusePayWith({ messages, onSwap }: { messages: Message[]; onSwap: (to: PayTo) => void }) {
  const sheet = useAskSheet(messages);
  const pay = sheet.ask?.pay;
  return {
    open: sheet.show,
    sheet: (
      <AppSheet open={sheet.open && !!pay} present={SHEET_IN} dim={0.3} className={styles.permPanel} onDismiss={sheet.hide}>
        {pay && (
          <PayWith
            pay={pay}
            onClose={sheet.hide}
            onPick={(to) => {
              sheet.hide();
              if (to !== pay.by) onSwap(to);
            }}
          />
        )}
      </AppSheet>
    ),
  };
}
