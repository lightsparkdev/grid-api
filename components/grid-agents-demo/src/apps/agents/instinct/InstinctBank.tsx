import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { IconChevronRight } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronRight';
import { IconMagnifyingGlass } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconMagnifyingGlass';
import { Flag } from '@/apps/shared/Flag';
import { BANK_REACH, type BankCountry } from '@/data/bankCountries';
import type { LinkedBank } from '../linkedBank';
import type { AgentAsk } from '../conversation';
import { BANK_ALL, BANK_POPULAR, bankFields, payeeBlurb, railLine, useBankPicker } from '../vault/useBankPicker';
import styles from './InstinctSafari.module.scss';

/*
 * app.instinct.com's own chrome (IMG_1926–1929): a 52pt bar under the status bar with the light serif wordmark,
 * × or ≡ on the left and an outlined Save on the right; bold serif headings over a black rule; hairline rows;
 * forms as "Add login" draws them, a 15pt label over each beige field.
 */

export function SiteBar({ left, onLeft, save }: { left: 'menu' | 'close'; onLeft?: () => void; save?: { enabled: boolean; label?: string; onClick: () => void } }) {
  return (
    <header className={styles.siteBar}>
      <button type="button" className={styles.siteLeft} aria-label={left === 'menu' ? 'Menu' : 'Close'} onClick={onLeft}>
        {left === 'menu' ? (
          <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden>
            <path d="M0 1h16M0 6h16M0 11h16" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden>
            <path d="M1 1l11 11M12 1L1 12" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        )}
      </button>
      <span className={styles.wordmark}>Instinct</span>
      {save && (
        <button type="button" className={styles.save} disabled={!save.enabled} onClick={save.onClick}>
          {save.label ?? 'Save'}
        </button>
      )}
    </header>
  );
}

/** A form field as Add login draws it: the label over a beige box. */
export function SiteField({ label, value, flag, icon }: { label: string; value: string; flag?: string; icon?: ReactNode }) {
  return (
    <label className={styles.siteField}>
      <span className={styles.siteLabel}>
        {icon}
        {label}
      </span>
      <span className={styles.siteInput}>
        {flag && <Flag code={flag} size={18} />}
        {value}
      </span>
    </label>
  );
}

/** A page's heading over its black rule, or (sub) a smaller heading for a group of rows under it. */
function Section({ title, sub, children }: { title: string; sub?: boolean; children: ReactNode }) {
  return (
    <section className={sub ? styles.siteSubsection : styles.siteSection}>
      {sub ? <h3 className={styles.siteSubheading}>{title}</h3> : <h2 className={styles.siteHeading}>{title}</h2>}
      {children}
    </section>
  );
}

function Row({ country, onPick }: { country: BankCountry; onPick: (c: BankCountry) => void }) {
  return (
    <button type="button" className={styles.siteRow} onClick={() => onPick(country)}>
      <span className={styles.siteTile}>
        <Flag code={country.code} size={20} />
      </span>
      <span className={styles.siteRowText}>
        <b>{country.name}</b>
        <small>{railLine(country)}</small>
      </span>
      <IconChevronRight size={16} className={styles.siteChevron} />
    </button>
  );
}

const SWAP = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.18 } };

/** Linking a bank on app.instinct.com: the list, then the account as an "Add bank" form. */
export function InstinctBank({
  payee,
  home,
  onLinked,
  onClose,
}: {
  /** Someone else's bank, to pay them: the page opens on it. */
  payee?: AgentAsk['recipient'];
  /** The person's own bank: the country they said, to open on. */
  home?: string;
  onLinked: (bank: LinkedBank) => void;
  onClose: () => void;
}) {
  const picker = useBankPicker(onLinked, payee, home);
  const { bank } = picker;
  return (
    <AnimatePresence mode="wait" initial={false}>
      {bank ? (
        <motion.div key="details" className={styles.sitePage} {...SWAP}>
          <SiteBar left="close" onLeft={picker.busy ? undefined : payee ? onClose : picker.unpick} save={{ enabled: !picker.busy, onClick: picker.link }} />
          <main className={styles.siteScroll}>
            <h1 className={styles.siteTitle}>{payee ? `${payee.first}’s bank` : 'Add bank'}</h1>
            <div className={styles.siteFields}>
              {bankFields(bank).map((f) => (
                <SiteField key={f.key} label={f.label} value={f.value} flag={f.flag} />
              ))}
            </div>
            <p className={styles.siteNote}>
              {payee
                ? `${payeeBlurb(bank, payee.first)} Instinct pays by account.`
                : `Money moves over ${railLine(bank.country).replace(' · ', ' in ')}, in and out of your Instinct balance. Instinct only moves it when you ask.`}
            </p>
            <button type="button" className={styles.black} data-pressing={picker.busy || undefined} disabled={picker.busy} onClick={picker.link}>
              {picker.stage === 'form' ? (payee ? 'Save' : `Save ${bank.bankName}`) : picker.stage === 'linking' ? 'Saving…' : 'Saved'}
            </button>
          </main>
        </motion.div>
      ) : (
        <motion.div key="list" className={styles.sitePage} {...SWAP}>
          <SiteBar left="menu" />
          <main className={styles.siteScroll}>
            <Section title="Select country">
              <p className={styles.siteLead}>
                Where your bank is. Instinct can move money to and from banks in {BANK_REACH} countries.
              </p>
              <label className={styles.siteSearch}>
                <IconMagnifyingGlass size={16} />
                <input value={picker.query} placeholder="Search country or currency" onChange={(e) => picker.setQuery(e.target.value)} />
              </label>
            </Section>
            {picker.results ? (
              <Section title="Results" sub>
                {picker.results.map((c) => (
                  <Row key={c.code} country={c} onPick={picker.pick} />
                ))}
                {!picker.results.length && <p className={styles.siteEmpty}>No banks in “{picker.query}” yet</p>}
              </Section>
            ) : (
              <>
                <Section title="Popular" sub>
                  {BANK_POPULAR.map((c) => (
                    <Row key={c.code} country={c} onPick={picker.pick} />
                  ))}
                </Section>
                <Section title="All countries" sub>
                  {BANK_ALL.map((c) => (
                    <Row key={c.code} country={c} onPick={picker.pick} />
                  ))}
                </Section>
              </>
            )}
          </main>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
