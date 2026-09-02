'use client';

import { useEffect, useState, type UIEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { fieldLabel, receiveFields, type MoneySheet } from '@/apps/shared/wallet';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { SquircleFocusHalo } from '@/apps/shared/SquircleFocusHalo';
import { currencyFor, type BankCountry } from '@/data/bankCountries';
import { BANK_ACCOUNT_SCHEMAS } from '@/data/bankAccountFields.generated';
import { easeOutQuick, easeOutSnappy, motionTransition } from '@/lib/easing';
import {
  IconArrowLeft,
  IconCrossMedium,
  IconMagnifyingGlass,
  IconLoadingCircle,
  IconSquareBehindSquare6,
  IconCheckmark2Small,
} from '../icons';
import { ONDEMAND_SHEET_DURATION } from '../config';
import { CircleFlag } from '../blocks/PlainMarks';
import styles from './AddBankSheet.module.scss';

const SHEET_TRANSITION = motionTransition(easeOutSnappy, ONDEMAND_SHEET_DURATION);
const STEP_TRANSITION = motionTransition(easeOutSnappy, 0.35);
const FADE = motionTransition(easeOutQuick, 0.2);

/** The sheet titles are 26px (vs the page's 32) — they hide sooner. */
const TITLE_COLLAPSE_AT = 36;

// In-sheet steps (country → bank details) push side-by-side, the auth-sheet
// recipe — the sheet itself is already the "on top" layer.
type NavDir = { back: boolean; reduceMotion: boolean };
const stepVariants = {
  enter: ({ back, reduceMotion }: NavDir) =>
    reduceMotion ? { x: 0, opacity: 1 } : { x: back ? '-100%' : '100%', opacity: 1 },
  center: { x: 0, opacity: 1 },
  exit: ({ back, reduceMotion }: NavDir) =>
    reduceMotion ? { opacity: 0 } : { x: back ? '100%' : '-100%', opacity: 0 },
};

interface AddBankSheetProps {
  m: MoneySheet;
  /** Presented while the brain sits on the country / bankForm steps. */
  open: boolean;
  /** X tapped on the country step — walk the brain back to the bank list. */
  onDismiss: () => void;
}

/**
 * "Add bank" — a full-screen SLIDE-UP over the flow (no iOS sheet stacking in
 * this app: the flow beneath sits still behind a dim scrim). Two steps ride
 * the brain: Select country (search pill + circular-flag rows) → Enter bank
 * details (label/value rows with Edit links, prefilled samples) with the
 * pinned CTA. Saving drops the whole screen to reveal the new bank row.
 */
export function AddBankSheet({ m, open, onDismiss }: AddBankSheetProps) {
  const reduceMotion = useReducedMotion();
  const step: 'country' | 'bankForm' | 'fundingDetails' =
    m.step === 'bankForm' ? 'bankForm' : m.step === 'fundingDetails' ? 'fundingDetails' : 'country';
  const navDir: NavDir = { back: m.back, reduceMotion: !!reduceMotion };

  // The funding step titles itself "Receive from {country}" (displayTitle).
  const title =
    step === 'bankForm'
      ? m.titles.bankForm
      : step === 'fundingDetails'
        ? m.displayTitle
        : m.titles.country;
  // Two thresholds: the hairline lands the moment you scroll; the centered bar
  // title waits until the large title is fully under the bar.
  const [scrolled, setScrolled] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    setScrolled(false);
    setCollapsed(false);
  }, [step, open]);
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    setScrolled(top > 0);
    setCollapsed(top >= TITLE_COLLAPSE_AT);
  };

  return (
    <>
      {/* Dim over the flow beneath while this screen is up. */}
      <motion.div
        className={styles.scrim}
        aria-hidden
        initial={false}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: ONDEMAND_SHEET_DURATION, ease: 'easeOut' }}
      />

      <motion.div
        className={styles.sheetLayer}
        initial={false}
        // visibility:hidden once parked — aria-hidden alone leaves the closed
        // sheet's controls TABBABLE, and focusing one scrolls the phone screen.
        animate={
          open
            ? { y: 0, visibility: 'visible' }
            : { y: '110%', transitionEnd: { visibility: 'hidden' } }
        }
        transition={reduceMotion ? { duration: 0 } : SHEET_TRANSITION}
        // Parked off-screen it must not trap clicks/focus or expose its
        // controls to the accessibility tree.
        style={{ pointerEvents: open ? 'auto' : 'none' }}
        aria-hidden={!open}
      >
        <div className={styles.sheet}>
          {/* On the country step the pinned SEARCH is the bottom of the header
              chrome — the hairline rides it instead (see .searchWrap). */}
          <header
            className={styles.headerBar}
            data-bordered={(scrolled && step !== 'country') || undefined}
          >
            {/* Both controls ride the LEFT slot (iOS voice): X dismisses on
                the root step, the arrow pops steps after that. */}
            <span className={styles.headerSlot}>
              <AnimatePresence initial={false} mode="wait">
                {step === 'country' ? (
                  <motion.button
                    key="close"
                    type="button"
                    className={styles.headerBtn}
                    aria-label="Close"
                    onClick={onDismiss}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={FADE}
                  >
                    <IconCrossMedium size={24} />
                  </motion.button>
                ) : (
                  <motion.button
                    key="back"
                    type="button"
                    className={styles.headerBtn}
                    aria-label="Back"
                    onClick={() => m.go('country', true)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={FADE}
                  >
                    <IconArrowLeft size={24} />
                  </motion.button>
                )}
              </AnimatePresence>
            </span>
            <AnimatePresence initial={false}>
              {collapsed && (
                <motion.span
                  key={`bar-title-${step}`}
                  className={styles.barTitle}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={FADE}
                >
                  {title}
                </motion.span>
              )}
            </AnimatePresence>
            {/* Empty twin slot keeps the bar title optically centered. */}
            <span className={styles.headerSlot} aria-hidden />
          </header>

          <div className={styles.steps} key={m.openKey}>
            <AnimatePresence initial={false} custom={navDir}>
              {step === 'country' && (
                <motion.div
                  key="country"
                  className={styles.step}
                  custom={navDir}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={STEP_TRANSITION}
                >
                  <div className={styles.scroll} onScroll={handleScroll}>
                    <h1 className={styles.title}>{m.titles.country}</h1>
                    {/* Flat pill search (the Z picker's) — sticky, so once the
                        title scrolls away it pins under the bar and BECOMES the
                        header's bottom edge (hairline included). */}
                    <div className={styles.searchWrap} data-bordered={scrolled || undefined}>
                      <SearchField
                        value={m.countryQuery}
                        onChange={m.setCountryQuery}
                        placeholder="Search country or currency"
                      />
                    </div>
                    {m.countryQ ? (
                      <>
                        <p className={styles.sectionLabel}>Results</p>
                        {m.filteredCountries.map((c) => (
                          <CountryRow key={c.code} country={c} onSelect={m.pickCountry} />
                        ))}
                      </>
                    ) : (
                      <>
                        <p className={styles.sectionLabel}>Popular</p>
                        {m.popularCountries.map((c) => (
                          <CountryRow key={c.code} country={c} onSelect={m.pickCountry} />
                        ))}
                        <p className={styles.sectionLabel}>All countries</p>
                        {m.allCountries.map((c) => (
                          <CountryRow key={c.code} country={c} onSelect={m.pickCountry} />
                        ))}
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 'bankForm' && m.pickedCountry && (
                <motion.div
                  key="bankForm"
                  className={styles.step}
                  custom={navDir}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={STEP_TRANSITION}
                >
                  <div className={styles.scroll} onScroll={handleScroll}>
                    <h1 className={styles.title}>{m.titles.bankForm}</h1>
                    {/* Label over prefilled value, hairlines running to the
                        right edge, tiny grey Edit pills (IMG_0681's voice —
                        decorative; the demo's sample values are the point). */}
                    <div className={styles.fields}>
                      <FieldRow label="Country" value={m.pickedCountry.name} />
                      <FieldRow label="Account holder" value={m.formBeneficiary} editable />
                      {BANK_ACCOUNT_SCHEMAS[m.pickedCountry.accountType].fields
                        .filter((f) => f.key !== 'region')
                        .map((f) => (
                          <FieldRow
                            key={f.key}
                            label={fieldLabel(f.key)}
                            value={m.formValues[f.key] ?? ''}
                            editable
                          />
                        ))}
                    </div>
                  </div>
                  <div className={styles.ctaWrap}>
                    <SaveCta saving={m.saving} onClick={m.addBank} />
                  </div>
                </motion.div>
              )}

              {/* Receive — the picked country's inbound funding instructions:
                  the bank-details rows with a copy button each, then Share
                  (which also fires the simulated inbound payment). */}
              {step === 'fundingDetails' && m.pickedCountry && (
                <motion.div
                  key="fundingDetails"
                  className={styles.step}
                  custom={navDir}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={STEP_TRANSITION}
                >
                  <div className={styles.scroll} onScroll={handleScroll}>
                    <h1 className={styles.title}>{m.displayTitle}</h1>
                    <div className={styles.fields}>
                      {receiveFields(m.pickedCountry, m.formBeneficiary).map(([label, value]) => {
                        const id = `fd-${label}`;
                        const copied = m.copiedChainId === id;
                        return (
                          <div key={label} className={styles.fieldRow}>
                            <span className={styles.fieldLines}>
                              <span className={styles.fieldLabel}>{label}</span>
                              <span className={styles.fieldValue}>{value}</span>
                            </span>
                            <CopyBtn
                              copied={copied}
                              label={copied ? 'Copied' : `Copy ${label}`}
                              onClick={() => m.copyValue(id, value)}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <p className={styles.fundingNote}>
                      Share these details with anyone paying you
                    </p>
                  </div>
                  <div className={styles.ctaWrap}>
                    <SaveCta label="Share details" saving={false} onClick={m.shareFundingAndReceive} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/** Country search — PlainInput's rounded-rect voice (r8 squircle, grey at
 *  rest, white + 2px black halo focused) with a leading magnifier glyph. */
function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (raw: string) => void;
  placeholder: string;
}) {
  const clip = useSquircleClip<HTMLDivElement>({ figmaRadii: 8 });
  const [focused, setFocused] = useState(false);
  return (
    <div className={styles.searchShell} data-focus={focused || undefined}>
      <div ref={clip.ref} style={clip.style} className={styles.searchPill}>
        <IconMagnifyingGlass size={20} className={styles.searchIcon} aria-hidden />
        <input
          className={styles.searchInput}
          type="text"
          inputMode="search"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-label="Search countries"
        />
      </div>
      <SquircleFocusHalo
        path={clip.path}
        width={clip.width}
        height={clip.height}
        className={styles.searchHalo}
      />
    </div>
  );
}

/** Copy-value icon button — a 32px squircle rect on the secondary fill. */
function CopyBtn({
  copied,
  label,
  onClick,
}: {
  copied: boolean;
  label: string;
  onClick: () => void;
}) {
  const clip = useSquircleClip<HTMLButtonElement>({ figmaRadii: 8 });
  return (
    <button
      type="button"
      ref={clip.ref}
      style={clip.style}
      className={styles.copyBtn}
      aria-label={label}
      onClick={onClick}
    >
      {copied ? <IconCheckmark2Small size={18} /> : <IconSquareBehindSquare6 size={18} />}
    </button>
  );
}

/** Flag tile + name + currency, no dividers (the Select bank row voice). */
function CountryRow({
  country,
  onSelect,
}: {
  country: BankCountry;
  onSelect: (c: BankCountry) => void;
}) {
  return (
    <button type="button" className={styles.row} onClick={() => onSelect(country)}>
      <CircleFlag code={country.code} />
      <span className={styles.rowLines}>
        <span className={styles.rowTitle}>{country.name}</span>
        <span className={styles.rowSub}>{currencyFor(country)}</span>
      </span>
    </button>
  );
}

function FieldRow({
  label,
  value,
  editable = false,
}: {
  label: string;
  value: string;
  editable?: boolean;
}) {
  return (
    <div className={styles.fieldRow}>
      <span className={styles.fieldLines}>
        <span className={styles.fieldLabel}>{label}</span>
        <span className={styles.fieldValue}>{value}</span>
      </span>
      {editable && <span className={styles.fieldEdit}>Edit</span>}
    </div>
  );
}

/** Full-width pink CTA (Continue's h50/r13 voice) with the 500ms saving
 *  spinner beat. */
function SaveCta({
  saving,
  onClick,
  label = 'Add bank account',
}: {
  saving: boolean;
  onClick: () => void;
  label?: string;
}) {
  const clip = useSquircleClip<HTMLButtonElement>({ figmaRadii: 8 });
  return (
    <button
      type="button"
      className={styles.cta}
      ref={clip.ref}
      style={clip.style}
      onClick={onClick}
    >
      {saving ? (
        <span className={styles.spinner} aria-label="Saving">
          <IconLoadingCircle size={20} />
        </span>
      ) : (
        label
      )}
    </button>
  );
}
