'use client';

import { useEffect, useState, type UIEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { fieldLabel, type MoneySheet } from '@/apps/shared/wallet';
import { useRegisterSheet } from '@/apps/shared/SheetPresentation';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { currencyFor, type BankCountry } from '@/data/bankCountries';
import { BANK_ACCOUNT_SCHEMAS } from '@/data/bankAccountFields.generated';
import { easeOutQuick, easeOutSnappy, motionTransition } from '@/lib/easing';
import {
  IconArrowLeft,
  IconCrossMedium,
  IconMagnifyingGlass,
  IconLoadingCircle,
} from '../icons';
import { MARKETPLACE_SHEET_DURATION } from '../config';
import { FlagTile } from '../blocks/FlagTile';
import styles from './AddBankSheet.module.scss';

const SHEET_TRANSITION = motionTransition(easeOutSnappy, MARKETPLACE_SHEET_DURATION);
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

/** Registers the sheet with the presentation stage (must render under the
 *  provider, beside the stage). */
function SheetPresenter({ on }: { on: boolean }) {
  useRegisterSheet(on);
  return null;
}

interface AddBankSheetProps {
  m: MoneySheet;
  /** Presented while the brain sits on the country / bankForm steps. */
  open: boolean;
  /** X tapped on the country step — walk the brain back to the bank list. */
  onDismiss: () => void;
}

/**
 * "Add bank" — an iOS pageSheet over the deposit flow (the auth-sheet
 * mechanic): the nav stack recedes and dims behind a 40px-top-corner card
 * that slides up. Two steps ride the brain: Select country (flat Z-style
 * search pill + square-flag rows, no dividers) → Enter bank details
 * (IMG_0621: label/value rows with Edit links, prefilled samples) with the
 * pinned pink CTA. Saving pops the whole sheet to reveal the new bank row.
 */
export function AddBankSheet({ m, open, onDismiss }: AddBankSheetProps) {
  const reduceMotion = useReducedMotion();
  const step: 'country' | 'bankForm' = m.step === 'bankForm' ? 'bankForm' : 'country';
  const navDir: NavDir = { back: m.back, reduceMotion: !!reduceMotion };

  // Top corners match the auth pageSheet (Aurora's 40, squircle-scaled).
  const sheetClip = useSquircleClip<HTMLDivElement>({ figmaRadii: [40, 40, 0, 0] });

  const title = step === 'bankForm' ? m.titles.bankForm : m.titles.country;
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
      <SheetPresenter on={open} />

      {/* Presentation scrim over the receded nav stack (the shared token). */}
      <motion.div
        className={styles.scrim}
        aria-hidden
        initial={false}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: MARKETPLACE_SHEET_DURATION, ease: 'easeOut' }}
      />

      <motion.div
        className={styles.sheetLayer}
        initial={false}
        animate={{ y: open ? 0 : '110%' }}
        transition={reduceMotion ? { duration: 0 } : SHEET_TRANSITION}
        // Parked off-screen it must not trap clicks/focus or expose its
        // controls to the accessibility tree.
        style={{ pointerEvents: open ? 'auto' : 'none' }}
        aria-hidden={!open}
      >
        <div ref={sheetClip.ref} style={sheetClip.style} className={styles.sheet}>
          {/* On the country step the pinned SEARCH is the bottom of the header
              chrome — the hairline rides it instead (see .searchWrap). */}
          <header
            className={styles.headerBar}
            data-bordered={(scrolled && step === 'bankForm') || undefined}
          >
            <span className={styles.headerSlot}>
              <AnimatePresence initial={false}>
                {step === 'bankForm' && (
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
            <span className={styles.headerSlot}>
              <AnimatePresence initial={false}>
                {step === 'country' && (
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
                )}
              </AnimatePresence>
            </span>
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
                      <div className={styles.searchPill}>
                        <IconMagnifyingGlass size={20} className={styles.searchIcon} aria-hidden />
                        <input
                          className={styles.searchInput}
                          type="text"
                          inputMode="search"
                          placeholder="Search country or currency"
                          value={m.countryQuery}
                          onChange={(e) => m.setCountryQuery(e.target.value)}
                          aria-label="Search countries"
                        />
                      </div>
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
                    {/* IMG_0621 — label over prefilled value, hairlines between
                        rows, underlined Edit links (decorative; the demo's
                        sample values are the point). */}
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
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </>
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
      <FlagTile code={country.code} />
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

/** Full-width pink "Add bank account" (Continue's h50/r13 voice) with the
 *  500ms saving spinner beat. */
function SaveCta({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  const clip = useSquircleClip<HTMLButtonElement>({ figmaRadii: 13 });
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
        'Add bank account'
      )}
    </button>
  );
}
