import { useState, type ReactNode } from 'react';
import type { Transition } from 'motion/react';
import { IconBank } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconBank';
import { IconCheckCircle2 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckCircle2';
import { IconCheckmark1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckmark1';
import { IconChevronLeft } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronLeft';
import { IconCoin1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCoin1';
import { IconCreditCard1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCreditCard1';
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossMedium';
import { IconLightning } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconLightning';
import { IconLoadingCircle } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconLoadingCircle';
import { IconPlusMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPlusMedium';
import { Flag } from '@/apps/shared/Flag';
import { BANK_REACH, type BankCountry } from '@/data/bankCountries';
import type { AgentAsk, ChipGlyph, Message } from '../conversation';
import { PageSheet, SheetDisc, SheetPage, SheetSteps } from '../SheetPage';
import { AppSheet } from '../sheet';
import { useAskSheet } from '../vault/useAskSheet';
import { BANK_ALL, BANK_POPULAR, bankFields, railLine, useBankPicker, type BankPicker } from '../vault/useBankPicker';
import { cardFields, useCardEntry } from '../vault/useCardEntry';
import styles from './DotVault.module.scss';

/*
 * Dots' bank and card sheets, from its own settings (IMG_1892–1903): the "Set up texting" card to start, the
 * Plugins list (an inline title over glass, "Popular ›" sections of 48pt tiles, search floating at the foot) and
 * the Add phone number form (white boxes, the label inside above the value, a black capsule).
 */

const GLYPHS: Record<ChipGlyph, typeof IconBank> = {
  card: IconCreditCard1,
  bank: IconBank,
  coin: IconCoin1,
  bolt: IconLightning,
  check: IconCheckCircle2,
};

/** Dots' line glyphs, in the pill's blue (IMG_1891: 20pt). */
export function DotGlyph({ glyph, size = 20 }: { glyph: ChipGlyph; size?: number }) {
  const Glyph = GLYPHS[glyph];
  return <Glyph size={size} className={styles.glyph} />;
}

function CountryRow({ country, onPick }: { country: BankCountry; onPick: (c: BankCountry) => void }) {
  return (
    <button type="button" className={styles.row} onClick={() => onPick(country)}>
      <span className={styles.tile}>
        <Flag code={country.code} size={30} />
      </span>
      <span className={styles.rowText}>
        <span className={styles.rowTitle}>{country.name}</span>
        <span className={styles.rowSub}>{railLine(country)}</span>
      </span>
      <IconPlusMedium size={22} className={styles.rowEnd} />
    </button>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>
        {title}
        <span className={styles.sectionChevron} />
      </h3>
      {children}
    </section>
  );
}

/** The Add phone number box: the label inside, above the value. */
function Box({ label, value, flag }: { label: string; value: string; flag?: string }) {
  return (
    <div className={styles.box}>
      <span className={styles.boxLabel}>{label}</span>
      <span className={styles.boxValue}>
        {flag && <Flag code={flag} size={18} />}
        {value}
      </span>
    </div>
  );
}

function Capsule({ busy, done, onClick, children }: { busy: boolean; done: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className={styles.capsule} disabled={busy} data-done={done || undefined} onClick={onClick}>
      {done ? (
        <>
          <IconCheckmark1 size={20} /> {children}
        </>
      ) : busy ? (
        <IconLoadingCircle size={22} className={styles.spin} />
      ) : (
        children
      )}
    </button>
  );
}

function BankPages({ picker, onClose }: { picker: BankPicker; onClose: () => void }) {
  const { bank } = picker;
  return (
    <SheetSteps step={bank ? 'details' : 'list'} back={picker.back}>
      {bank ? (
        <SheetPage
          title="Add bank"
          leading={
            <SheetDisc label="Back" onClick={picker.unpick} disabled={picker.busy}>
              <IconChevronLeft size={22} />
            </SheetDisc>
          }
          footer={
            <Capsule busy={picker.busy} done={picker.stage === 'linked'} onClick={picker.link}>
              {picker.stage === 'linked' ? 'Linked' : `Link ${bank.bankName}`}
            </Capsule>
          }
        >
          <div className={styles.boxes}>
            {bankFields(bank).map((f) => (
              <Box key={f.key} label={f.label} value={f.value} flag={f.flag} />
            ))}
          </div>
          <p className={styles.fine}>
            Top-ups arrive over {bank.country.rail} in {bank.currency} and land in your Dots balance. Your dot only tops
            up when you ask it to. You can remove this bank any time in <u>Settings</u>.
          </p>
        </SheetPage>
      ) : (
        <SheetPage
          title="Select country"
          leading={
            <SheetDisc label="Close" onClick={onClose}>
              <IconCrossMedium size={22} />
            </SheetDisc>
          }
          search={{ at: 'bottom', placeholder: 'Search countries', value: picker.query, onChange: picker.setQuery }}
        >
          {picker.results ? (
            <Section title="Results">
              {picker.results.map((c) => (
                <CountryRow key={c.code} country={c} onPick={picker.pick} />
              ))}
              {!picker.results.length && <p className={styles.empty}>No banks in “{picker.query}” yet.</p>}
            </Section>
          ) : (
            <>
              <Section title="Popular">
                {BANK_POPULAR.map((c) => (
                  <CountryRow key={c.code} country={c} onPick={picker.pick} />
                ))}
              </Section>
              <Section title="All countries">
                {BANK_ALL.map((c) => (
                  <CountryRow key={c.code} country={c} onPick={picker.pick} />
                ))}
              </Section>
            </>
          )}
        </SheetPage>
      )}
    </SheetSteps>
  );
}

function BankFlow({ onLinked, onClose }: { onLinked: () => void; onClose: () => void }) {
  const picker = useBankPicker(onLinked);
  return <BankPages picker={picker} onClose={onClose} />;
}

/** The Set up texting card (IMG_1892): the tile, the title, a line, the black button and Not now. */
function Intro({ onStart, onNotNow }: { onStart: () => void; onNotNow: () => void }) {
  return (
    <div className={styles.intro}>
      <span className={styles.introTile}>
        <IconBank size={30} />
      </span>
      <strong className={styles.introTitle}>Link a bank</strong>
      <p className={styles.introSub}>Top up your Dots balance from a bank in {BANK_REACH} countries.</p>
      <button type="button" className={styles.introStart} onClick={onStart}>
        Get started
      </button>
      <button type="button" className={styles.introNotNow} onClick={onNotNow}>
        Not now
      </button>
    </div>
  );
}

/** Dots' bank flow: `open(id, ask)` from its pill, and the sheets to render in its screen. */
export function useDotBank({ messages, present, onAllow, onDeny }: { messages: Message[]; present: Transition; onAllow: () => void; onDeny: () => void }) {
  const sheet = useAskSheet(messages);
  const [listed, setListed] = useState(false);
  return {
    open: (id: number, ask: AgentAsk) => {
      setListed(false);
      sheet.show(id, ask);
    },
    sheet: (
      <>
        <AppSheet open={sheet.open && !listed} present={present} className={styles.introPanel} onDismiss={sheet.hide}>
          <Intro
            onStart={() => setListed(true)}
            onNotNow={() => {
              sheet.hide();
              onDeny();
            }}
          />
        </AppSheet>
        <PageSheet open={sheet.open && listed} present={present} className={styles.theme} onDismiss={sheet.hide}>
          <BankFlow
            key={sheet.id}
            onClose={sheet.hide}
            onLinked={() => {
              sheet.hide();
              onAllow();
            }}
          />
        </PageSheet>
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
      footer={
        <Capsule busy={entry.busy} done={entry.stage === 'saved'} onClick={entry.save}>
          {entry.stage === 'saved' ? 'Saved' : (ask.allow ?? 'Save card')}
        </Capsule>
      }
    >
      <div className={styles.boxes}>
        {cardFields(ask).map((f) => (
          <Box key={f.key} label={f.label} value={f.value} />
        ))}
      </div>
      <p className={styles.fine}>
        Your card is saved to your Dots vault. Your dot can pay with it at checkout, but never sees the number.
      </p>
    </SheetPage>
  );
}

/** Dots' card flow: the Add card page, filled in. Closing it leaves the pill waiting in the thread. */
export function useDotCard({ messages, present, onAllow }: { messages: Message[]; present: Transition; onAllow: () => void }) {
  const sheet = useAskSheet(messages);
  return {
    open: sheet.show,
    sheet: (
      <PageSheet open={sheet.open} present={present} className={styles.theme} onDismiss={sheet.hide}>
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
