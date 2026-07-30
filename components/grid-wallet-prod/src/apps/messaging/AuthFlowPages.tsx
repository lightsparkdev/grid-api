'use client';

import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import { motion, useAnimate, useReducedMotion } from 'motion/react';
import { AnimatePresence } from 'motion/react';
import { IconMagnifyingGlass } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconMagnifyingGlass';
import { FrostPanel } from '@/components/liquid-glass';
import { SfSymbol } from '@/apps/shared/icons';
import { useThemeMode } from '@/hooks/useThemeMode';
import { easeOutSnappy, motionTransition } from '@/lib/easing';
import { formatUsPhone } from '@/lib/phoneFormat';
import { BANK_COUNTRIES, type BankCountry } from '@/data/bankCountries';
import { IconLoadingCircle } from './icons';
import { GlassCircleButton } from './blocks/GlassCircleButton';
import { GlassCta } from './blocks/GlassCta';
import { dialCodeFor } from './dialCodes';
import { BRAND } from './config';
import styles from './AuthFlowPages.module.scss';

export const CODE_LENGTH = 6;
/** The demo's one-time code — what the notification autofills. */
export const DEMO_CODE = '123456';
/** Autofill cadence: one digit per beat, submit shortly after the last. */
const FILL_STEP_MS = 25;
const FILL_SUBMIT_MS = 350;
/** A manually-completed code auto-submits after this settle (no CTA — the
 *  WhatsApp pattern: the screen advances itself). */
const AUTO_SUBMIT_MS = 450;

const SWAP_TRANSITION = motionTransition(easeOutSnappy, 0.35);
// The amount-entry error shake (Swift ShakeEffect, tightened).
const SHAKE = { x: [0, 8, -8, 8, 0] };
const SHAKE_OPTS = { duration: 0.28, ease: 'linear' as const };

export type AuthPageMethod = 'email' | 'phone';

interface MethodConfig {
  heading: string;
  sub: (learnMore: ReactNode) => ReactNode;
  input: Pick<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'inputMode' | 'autoComplete' | 'placeholder'
  >;
  /** The phone entry shows the grouped country row + dial-code prefix. */
  phoneChrome?: boolean;
  prefill: string;
  format: (raw: string) => string;
  validate: (value: string) => boolean;
  /** Code-step copy: the verify title + the destination line. */
  verifyTitle: string;
  sentVia: string;
  notification: {
    icon: string;
    badge?: string;
    title: string;
    body: string;
    bodyLines: number;
  };
}

export const AUTH_METHODS: Record<AuthPageMethod, MethodConfig> = {
  email: {
    heading: 'Enter your email address',
    sub: (learnMore) => (
      <>
        {BRAND} will send a one-time code to verify your account. {learnMore}
      </>
    ),
    input: {
      type: 'email',
      inputMode: 'email',
      autoComplete: 'email',
      placeholder: 'you@example.com',
    },
    prefill: 'demo@lightspark.com',
    format: (raw) => raw,
    validate: (value) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim()),
    verifyTitle: 'Verify your email address',
    sentVia: 'by email to',
    notification: {
      icon: '/assets/auth/mail-app-icon.webp',
      title: BRAND,
      body: `Your one-time code is ${DEMO_CODE.slice(0, 3)}-${DEMO_CODE.slice(3)}`,
      bodyLines: 1,
    },
  },
  phone: {
    heading: 'Enter your phone number',
    sub: (learnMore) => (
      <>
        {BRAND} will verify your account and may send account-related SMS
        messages. {learnMore}
      </>
    ),
    input: {
      type: 'tel',
      inputMode: 'tel',
      autoComplete: 'tel',
      placeholder: '(555) 555-0123',
    },
    phoneChrome: true,
    prefill: '(415) 555-0132',
    format: formatUsPhone,
    validate: (value) => value.replace(/\D/g, '').length === 10,
    verifyTitle: 'Verify your phone number',
    sentVia: 'by SMS to',
    notification: {
      icon: '/assets/auth/generic-contact.svg',
      badge: '/assets/auth/messages-app-icon.webp',
      title: '22395',
      body: `Your ${BRAND} verification code is: ${DEMO_CODE}. This code will expire in 10 minutes. Don\u2019t share this code with anyone.`,
      bodyLines: 2,
    },
  },
};

/** Plain iOS nav back chevron (the Mobbin OTP screen's) — not glass. */
function BackButton({ onClick, label = 'Back' }: { onClick?: () => void; label?: string }) {
  return (
    <button type="button" className={styles.backBtn} aria-label={label} onClick={onClick}>
      <SfSymbol name="chevron.left" size={20} />
    </button>
  );
}

/* ── Entry page (phone / email) ───────────────────────────────────────────── */

export function EntryPage({
  method,
  country,
  value,
  sending,
  onChange,
  onSubmit,
  onOpenCountry,
  onBack,
}: {
  method: AuthPageMethod;
  country: BankCountry;
  value: string;
  sending: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onOpenCountry: () => void;
  onBack?: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const cfg = AUTH_METHODS[method];
  const valid = cfg.validate(value);

  // Next is always active (the amount-entry pattern): invalid input errors
  // out with a shake on the field instead of a disabled button.
  const [entryScope, animateEntry] = useAnimate<HTMLDivElement>();
  const submit = () => {
    if (sending) return;
    if (valid) {
      onSubmit();
    } else if (!reduceMotion && entryScope.current) {
      animateEntry(entryScope.current, SHAKE, SHAKE_OPTS);
    }
  };

  // Focus WITHOUT scrolling (autoFocus scroll-into-views mid-push).
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.pageBar}>
        <BackButton onClick={onBack} />
        <span className={styles.barTrailing}>
          <GlassCircleButton size={40} aria-label="More options">
            <SfSymbol name="ellipsis" size={17} />
          </GlassCircleButton>
        </span>
      </div>

      <h2 className={styles.heading}>{cfg.heading}</h2>
      <p className={styles.sub}>
        {cfg.sub(<span className={styles.learnMore}>Learn more</span>)}
      </p>

      <div className={styles.groupContainer} ref={entryScope}>
        <div className={styles.group}>
          {cfg.phoneChrome && (
            <>
              <button type="button" className={styles.countryRow} onClick={onOpenCountry}>
                <span className={styles.countryName}>{country.name}</span>
                <SfSymbol className={styles.countryChevron} name="chevron.right" size={14} />
              </button>
              <span className={styles.groupDivider} aria-hidden />
            </>
          )}
          <div className={styles.inputRow}>
            {cfg.phoneChrome && (
              <span className={styles.dialCode}>{dialCodeFor(country.code)}</span>
            )}
            <input
              ref={inputRef}
              className={styles.input}
              {...cfg.input}
              value={value}
              onChange={(e) => onChange(cfg.format(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit();
              }}
            />
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <GlassCta onClick={submit}>
          <span className={styles.ctaSwap}>
            <AnimatePresence initial={false}>
              {sending ? (
                <motion.span
                  key="spinner"
                  className={styles.ctaItem}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={reduceMotion ? { duration: 0 } : SWAP_TRANSITION}
                >
                  <span className={styles.spinner} aria-label="Sending">
                    <IconLoadingCircle size={20} />
                  </span>
                </motion.span>
              ) : (
                <motion.span
                  key="label"
                  className={styles.ctaItem}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={reduceMotion ? { duration: 0 } : SWAP_TRANSITION}
                >
                  Next
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </GlassCta>
      </div>
    </div>
  );
}

/* ── Country selector page (IMG_0711 — no flags, name + dial code) ────────── */

function CountrySection({
  label,
  countries,
  selectedCode,
  onPick,
}: {
  label?: string;
  countries: BankCountry[];
  selectedCode: string;
  onPick: (c: BankCountry) => void;
}) {
  if (countries.length === 0) return null;
  return (
    <>
      {label && <p className={styles.sectionLabel}>{label}</p>}
      <div className={styles.countryCard}>
        {countries.map((c, i) => (
          <button
            key={c.code}
            type="button"
            className={styles.countryPickRow}
            onClick={() => onPick(c)}
          >
            <span
              className={clsx(
                styles.countryPickContent,
                i < countries.length - 1 && styles.countryPickBordered,
              )}
            >
              <span className={styles.countryPickName}>{c.name}</span>
              <span className={styles.countryPickDial}>{dialCodeFor(c.code)}</span>
              {c.code === selectedCode && (
                <SfSymbol name="checkmark" size={14} className={styles.countryPickCheck} />
              )}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

/** Progressive top blur (the money-flow country picker's recipe) — the list
 *  scrolls UP under the pinned title + frost search pill. */
function TopFade() {
  return (
    <div className={styles.topFade} aria-hidden>
      <div className={clsx(styles.fadeBlur, styles.fadeBlurStrong)} />
      <div className={clsx(styles.fadeBlur, styles.fadeBlurMid)} />
      <div className={clsx(styles.fadeBlur, styles.fadeBlurSoft)} />
    </div>
  );
}

export function CountryPage({
  selectedCode,
  onPick,
  onBack,
}: {
  selectedCode: string;
  onPick: (c: BankCountry) => void;
  onBack: () => void;
}) {
  const theme = useThemeMode();
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const all = useMemo(
    () => [...BANK_COUNTRIES].sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );
  const popular = useMemo(
    () =>
      BANK_COUNTRIES.filter((c) => c.popularRank).sort(
        (a, b) => (a.popularRank ?? 99) - (b.popularRank ?? 99),
      ),
    [],
  );
  const filtered = q
    ? all.filter(
        (c) => c.name.toLowerCase().includes(q) || dialCodeFor(c.code).includes(q),
      )
    : null;

  return (
    <div className={clsx(styles.page, styles.countryPage)}>
      <div className={styles.scroll}>
        {filtered ? (
          <CountrySection countries={filtered} selectedCode={selectedCode} onPick={onPick} />
        ) : (
          <>
            <CountrySection
              label="Popular"
              countries={popular}
              selectedCode={selectedCode}
              onPick={onPick}
            />
            <CountrySection
              label="All countries"
              countries={all}
              selectedCode={selectedCode}
              onPick={onPick}
            />
          </>
        )}
      </div>

      <TopFade />
      {/* Pinned chrome above the blur: bar + frost search pill. */}
      <div className={styles.pinnedBar}>
        <BackButton onClick={onBack} />
        <span className={styles.pinnedTitle}>Your country</span>
      </div>
      <div className={styles.searchPill}>
        <FrostPanel
          radius={22}
          cornerSmoothing={0}
          tint="var(--msg-search-pill-tint)"
          tintBlur={4}
          edge="none"
          specular={{
            rotation: 45,
            glowStrength: 0.06,
            glowSpread: 0.5,
            glowExponent: 1.5,
            edgeStrength: 1,
            edgeWidth: theme === 'dark' ? 1 : 2,
            edgeExponent: 1.5,
            strength: theme === 'dark' ? 1 : 1.6,
          }}
        >
          <div className={styles.searchRow}>
            <IconMagnifyingGlass size={20} className={styles.searchIcon} aria-hidden />
            <input
              className={styles.searchInput}
              type="text"
              inputMode="search"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search countries"
            />
          </div>
        </FrostPanel>
      </div>
    </div>
  );
}

/* ── Verification code page (Mobbin: dashes, no borders, auto-submit) ─────── */

export function CodePage({
  method,
  destination,
  onSubmitCode,
  onBack,
  /** The notification's autofill runs through here so the page can also offer
   *  the "Didn't receive..." shortcut. */
  registerAutofill,
}: {
  method: AuthPageMethod;
  destination: string;
  onSubmitCode: (code: string) => void;
  onBack?: () => void;
  registerAutofill?: (fn: () => void) => void;
}) {
  const reduceMotion = useReducedMotion();
  const cfg = AUTH_METHODS[method];

  const [code, setCode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  // One shared timer set: autofill digit beats + the auto-submit settle.
  const timers = useRef<number[]>([]);
  const submitted = useRef(false);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const finish = (c: string) => {
    if (submitted.current) return;
    submitted.current = true;
    onSubmitCode(c);
  };

  // Complete codes auto-submit (no CTA — the screen advances itself).
  const handleCode = (raw: string) => {
    timers.current.forEach((t) => window.clearTimeout(t));
    const next = raw.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(next);
    if (next.length === CODE_LENGTH) {
      timers.current = [
        window.setTimeout(() => finish(next), reduceMotion ? 0 : AUTO_SUBMIT_MS),
      ];
    }
  };

  const autofill = () => {
    if (submitted.current) return;
    if (reduceMotion) {
      setCode(DEMO_CODE);
      finish(DEMO_CODE);
      return;
    }
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = DEMO_CODE.split('').map((_, i) =>
      window.setTimeout(() => setCode(DEMO_CODE.slice(0, i + 1)), i * FILL_STEP_MS),
    );
    timers.current.push(
      window.setTimeout(
        () => finish(DEMO_CODE),
        (CODE_LENGTH - 1) * FILL_STEP_MS + FILL_SUBMIT_MS,
      ),
    );
  };
  // Expose the fill to the parent (the notification taps into the same beats).
  useEffect(() => {
    registerAutofill?.(autofill);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [cellsScope] = useAnimate<HTMLDivElement>();

  return (
    <div className={styles.page}>
      <div className={styles.pageBar}>
        <BackButton onClick={onBack} />
      </div>

      <h2 className={styles.heading}>{cfg.verifyTitle}</h2>
      {/* The FULL destination, emphasized (Mobbin) — not privacy-masked. */}
      <p className={styles.sub}>
        Enter the 6-digit code we sent {cfg.sentVia}{' '}
        <span className={styles.subStrong}>{destination}</span>.
      </p>

      {/* Six borderless slots (3 — 3): a dash at rest, the digit once typed.
          One hidden input carries focus/typing; tapping runs the autofill. */}
      <div
        ref={cellsScope}
        className={styles.codeRow}
        onClick={() => {
          autofill();
          inputRef.current?.focus({ preventScroll: true });
        }}
      >
        <input
          ref={inputRef}
          className={styles.codeInput}
          inputMode="numeric"
          autoComplete="one-time-code"
          aria-label="Verification code"
          value={code}
          onChange={(e) => handleCode(e.target.value)}
        />
        {Array.from({ length: CODE_LENGTH }, (_, i) => (
          <Fragment key={i}>
            {i === CODE_LENGTH / 2 && <span className={styles.codeGap} aria-hidden />}
            <span className={styles.codeSlot} data-filled={code[i] != null || undefined}>
              {code[i] != null ? (
                <span className={styles.codeDigit}>{code[i]}</span>
              ) : (
                <span className={styles.codeDash} aria-hidden />
              )}
            </span>
          </Fragment>
        ))}
      </div>

      <button type="button" className={styles.resendLink} onClick={autofill}>
        Didn&rsquo;t receive a verification code?
      </button>
    </div>
  );
}
