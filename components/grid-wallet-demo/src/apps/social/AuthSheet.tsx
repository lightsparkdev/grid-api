'use client';

import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useAnimate, useReducedMotion } from 'motion/react';
import { IconLoadingCircle } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconLoadingCircle';
import { BottomSheet } from '@/apps/shared/BottomSheet';
import { ContentAreaButton } from '@/apps/shared/ContentAreaButton';
import { useScreenOverlay } from '@/apps/shared/AppShell/ScreenOverlayContext';
import { PhoneStatusBar } from '@/apps/shared/AppShell/PhoneStatusBar';
import {
  GlassNotification,
  NOTIFICATION_INSET_PX,
  NOTIFICATION_TOP_PX,
} from '@/apps/shared/GlassNotification';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { SquircleFocusHalo } from '@/apps/shared/SquircleFocusHalo';
import { SfSymbol } from '@/apps/shared/icons';
import { easeOutSnappy, motionTransition } from '@/lib/easing';
import { SheetHeader } from './blocks/SheetHeader';
import { SOCIAL_FLAT_SHEET } from './glass-presets';
import { IconCrossMedium, IconChevronLeftMedium } from './icons';
import { BRAND } from './config';
import { formatUsPhone, maskUsPhone } from '@/lib/phoneFormat';
import styles from './AuthSheet.module.scss';

const CODE_LENGTH = 6;
/** The demo's one-time code — what the notification autofills. */
const DEMO_CODE = '123456';
const NOTIFICATION_DELAY_MS = 1000;
const FILL_STEP_MS = 25;
const FILL_SUBMIT_MS = 350;
const VERIFY_MS = 500;
const CHECK_MS = 500;

const STEP_TRANSITION = motionTransition(easeOutSnappy, 0.3);
const HEIGHT_TRANSITION = motionTransition(easeOutSnappy, 0.35);
const SWAP_TRANSITION = motionTransition(easeOutSnappy, 0.35);
const STEP_HIDDEN = { opacity: 0, filter: 'blur(8px)' };
const STEP_SHOWN = { opacity: 1, filter: 'blur(0px)' };
const SHAKE = { x: [0, 8, -8, 8, 0] };
const SHAKE_OPTS = { duration: 0.28, ease: 'linear' as const };

/** OTP digit cell — squircle clip-path for Safari (corner-shape fallback is circular). */
function AuthCodeCell({ active, children }: { active?: boolean; children: ReactNode }) {
  const clip = useSquircleClip<HTMLSpanElement>({ figmaRadii: 14 });
  return (
    <span className={styles.codeCellShell} data-active={active || undefined}>
      <SquircleFocusHalo
        path={clip.path}
        width={clip.width}
        height={clip.height}
        className={styles.codeCellHalo}
      />
      <span ref={clip.ref} style={clip.style} className={styles.codeCell}>
        {children}
      </span>
    </span>
  );
}

/** "playground@lightspark.com" → "pl•••@lightspark.com". */
function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!domain) return email;
  return `${user.slice(0, 2)}•••@${domain}`;
}

export type AuthSheetMethod = 'email' | 'phone';

interface MethodConfig {
  heading: string;
  sub: string;
  input: Pick<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'inputMode' | 'autoComplete' | 'placeholder'
  >;
  prefill: string;
  format: (raw: string) => string;
  validate: (value: string) => boolean;
  mask: (value: string) => string;
  notification: {
    icon: string;
    badge?: string;
    title: string;
    body: string;
    bodyLines: number;
  };
}

const METHODS: Record<AuthSheetMethod, MethodConfig> = {
  email: {
    heading: 'Continue with email',
    sub: 'Enter your email and we\u2019ll send you a one-time code to log in',
    input: {
      type: 'email',
      inputMode: 'email',
      autoComplete: 'email',
      placeholder: 'you@example.com',
    },
    prefill: 'demo@lightspark.com',
    format: (raw) => raw,
    validate: (value) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim()),
    mask: maskEmail,
    notification: {
      icon: '/assets/auth/mail-app-icon.webp',
      title: BRAND,
      body: `Your one-time code is ${DEMO_CODE.slice(0, 3)}-${DEMO_CODE.slice(3)}`,
      bodyLines: 1,
    },
  },
  phone: {
    heading: 'Continue with phone',
    sub: 'Enter your number and we\u2019ll send you a one-time code to log in',
    input: {
      type: 'tel',
      inputMode: 'tel',
      autoComplete: 'tel',
      placeholder: '(555) 555-0123',
    },
    prefill: '(415) 555-0132',
    format: formatUsPhone,
    validate: (value) => value.replace(/\D/g, '').length === 10,
    mask: maskUsPhone,
    notification: {
      icon: '/assets/auth/generic-contact.svg',
      badge: '/assets/auth/messages-app-icon.webp',
      title: '22395',
      body: `Your ${BRAND} verification code is: ${DEMO_CODE}. This code will expire in 10 minutes. Don\u2019t share this code with anyone.`,
      bodyLines: 2,
    },
  },
};

interface AuthSheetProps {
  method?: AuthSheetMethod;
  open: boolean;
  sending?: boolean;
  codeActive?: boolean;
  onSubmit: (value: string) => void;
  onSubmitCode?: (code: string) => void;
  onBack?: () => void;
  onCancel?: () => void;
}

/**
 * Z (social) auth sheet — flat, full-bleed, NO glass. A SheetHeader (back/close
 * left, centered title, hairline bottom border) over two pushed steps:
 * email/phone entry → verification code. Forked from Glitch's AuthSheet onto the
 * shared OTP logic; only the chrome (header pattern, flat surface, Z tokens) is
 * Z's own.
 */
export function AuthSheet({
  method = 'email',
  open,
  sending = false,
  codeActive = false,
  onSubmit,
  onSubmitCode,
  onBack,
  onCancel,
}: AuthSheetProps) {
  const reduceMotion = useReducedMotion();
  const cfg = METHODS[method];

  const [stepHeight, setStepHeight] = useState<number | null>(null);
  const [phase, setPhase] = useState<'idle' | 'verifying' | 'done'>('idle');
  const phaseTimers = useRef<number[]>([]);

  const liveStep: 'entry' | 'code' = codeActive ? 'code' : 'entry';
  const [step, setStep] = useState(liveStep);
  if (open && step !== liveStep) setStep(liveStep);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open && !codeActive) setStep('entry');
    if (open) setPhase('idle');
  }

  const stepRef = useRef<HTMLDivElement | null>(null);
  const measureStep = (el: HTMLDivElement | null) => {
    if (!el) return;
    stepRef.current = el;
    requestAnimationFrame(() => {
      if (stepRef.current === el) setStepHeight(el.offsetHeight);
    });
  };

  const [value, setValue] = useState(cfg.prefill);
  const [prevMethod, setPrevMethod] = useState(method);
  if (method !== prevMethod) {
    setPrevMethod(method);
    setValue(cfg.prefill);
  }
  const valid = cfg.validate(value);
  const [entryScope, animateEntry] = useAnimate<HTMLDivElement>();
  const submit = () => {
    if (sending) return;
    if (valid) {
      onSubmit(value.trim());
    } else if (!reduceMotion && entryScope.current) {
      animateEntry(entryScope.current, SHAKE, SHAKE_OPTS);
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open && step === 'entry') inputRef.current?.focus({ preventScroll: true });
  }, [open, step]);

  const [code, setCode] = useState('');
  useEffect(() => {
    if (open && !codeActive) setCode('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const codeRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open && step === 'code') codeRef.current?.focus({ preventScroll: true });
  }, [open, step]);
  const fillTimers = useRef<number[]>([]);
  const handleCode = (raw: string) => {
    if (phase !== 'idle') return;
    for (const t of fillTimers.current) window.clearTimeout(t);
    setCode(raw.replace(/\D/g, '').slice(0, CODE_LENGTH));
  };
  const finishCode = (c: string) => {
    if (reduceMotion) {
      onSubmitCode?.(c);
      return;
    }
    setPhase('verifying');
    phaseTimers.current = [
      window.setTimeout(() => setPhase('done'), VERIFY_MS),
      window.setTimeout(() => onSubmitCode?.(c), VERIFY_MS + CHECK_MS),
    ];
  };
  const [codeScope, animateCells] = useAnimate<HTMLDivElement>();
  const submitCode = () => {
    if (phase !== 'idle') return;
    if (code.length === CODE_LENGTH) {
      finishCode(code);
    } else if (!reduceMotion && codeScope.current) {
      animateCells(codeScope.current, SHAKE, SHAKE_OPTS);
    }
  };

  const overlayEl = useScreenOverlay();
  const [notifOn, setNotifOn] = useState(false);
  const notifTimer = useRef(0);
  useEffect(() => {
    window.clearTimeout(notifTimer.current);
    if (open && step === 'code') {
      notifTimer.current = window.setTimeout(() => setNotifOn(true), NOTIFICATION_DELAY_MS);
    } else {
      setNotifOn(false);
    }
    return () => window.clearTimeout(notifTimer.current);
  }, [open, step]);
  useEffect(
    () => () => {
      for (const t of fillTimers.current) window.clearTimeout(t);
      for (const t of phaseTimers.current) window.clearTimeout(t);
    },
    [],
  );
  const autofill = () => {
    if (phase !== 'idle') return;
    setNotifOn(false);
    if (reduceMotion) {
      setCode(DEMO_CODE);
      onSubmitCode?.(DEMO_CODE);
      return;
    }
    for (const t of fillTimers.current) window.clearTimeout(t);
    fillTimers.current = DEMO_CODE.split('').map((_, i) =>
      window.setTimeout(() => setCode(DEMO_CODE.slice(0, i + 1)), i * FILL_STEP_MS),
    );
    fillTimers.current.push(
      window.setTimeout(
        () => finishCode(DEMO_CODE),
        (CODE_LENGTH - 1) * FILL_STEP_MS + FILL_SUBMIT_MS,
      ),
    );
  };

  // The notification's refraction backdrop — Z's flat app surface + the status
  // bar (no brand wash; behind the banner is the solid app background).
  const COPY_BLEED = 48;
  const refractionCopy = (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: -COPY_BLEED,
        overflow: 'hidden',
        contain: 'layout paint',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: COPY_BLEED - NOTIFICATION_TOP_PX,
          left: COPY_BLEED - NOTIFICATION_INSET_PX,
          width: 402,
          height: 874,
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'var(--app-bg)' }} />
        <PhoneStatusBar tone="default" />
      </div>
    </div>
  );
  const notification = (
    <GlassNotification
      show={notifOn}
      icon={cfg.notification.icon}
      badge={cfg.notification.badge}
      title={cfg.notification.title}
      body={cfg.notification.body}
      bodyLines={cfg.notification.bodyLines}
      backdropNode={refractionCopy}
      onTap={autofill}
    />
  );

  const headerBusy = phase !== 'idle';
  const onHeaderLeft = headerBusy
    ? undefined
    : step === 'code'
      ? (onBack ?? onCancel)
      : onCancel;

  return (
    <>
      <BottomSheet
        open={open}
        onDismiss={phase === 'idle' ? (onCancel ?? (() => {})) : () => {}}
        glass={SOCIAL_FLAT_SHEET}
        topRadius={32}
      >
        <SheetHeader
          title={step === 'entry' ? cfg.heading : 'Verification code'}
          left={{
            icon: step === 'code' ? <IconChevronLeftMedium size={24} /> : <IconCrossMedium size={24} />,
            onClick: onHeaderLeft,
            ariaLabel: step === 'code' ? 'Back' : 'Close',
          }}
        />

        <motion.div
          className={styles.steps}
          initial={false}
          animate={{ height: stepHeight ?? 'auto' }}
          transition={reduceMotion ? { duration: 0 } : HEIGHT_TRANSITION}
        >
          <AnimatePresence initial={false}>
            {step === 'entry' ? (
              <motion.div
                key="entry"
                ref={measureStep}
                className={styles.step}
                initial={STEP_HIDDEN}
                animate={STEP_SHOWN}
                exit={STEP_HIDDEN}
                transition={STEP_TRANSITION}
              >
                <p className={styles.sub}>{cfg.sub}</p>
                <div className={styles.cardContainer} ref={entryScope}>
                  <div className={styles.card}>
                    <input
                      ref={inputRef}
                      className={styles.input}
                      {...cfg.input}
                      value={value}
                      onChange={(e) => setValue(cfg.format(e.target.value))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') submit();
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="code"
                ref={measureStep}
                className={styles.step}
                initial={STEP_HIDDEN}
                animate={STEP_SHOWN}
                exit={STEP_HIDDEN}
                transition={STEP_TRANSITION}
              >
                <p className={styles.sub}>
                  Enter the 6-digit code we sent to {cfg.mask(value.trim())}.{' '}
                  <button type="button" className={styles.resend}>
                    Resend
                  </button>
                </p>
                <div
                  ref={codeScope}
                  className={styles.codeContainer}
                  onClick={() => {
                    autofill();
                    codeRef.current?.focus({ preventScroll: true });
                  }}
                >
                  <input
                    ref={codeRef}
                    className={styles.codeInput}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    aria-label="Verification code"
                    value={code}
                    onChange={(e) => handleCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') submitCode();
                    }}
                  />
                  {Array.from({ length: CODE_LENGTH }, (_, i) => (
                    <Fragment key={i}>
                      {i === CODE_LENGTH / 2 && <span className={styles.codeDash} aria-hidden />}
                      <AuthCodeCell active={i === Math.min(code.length, CODE_LENGTH - 1) || undefined}>
                        {code[i] ?? ''}
                      </AuthCodeCell>
                    </Fragment>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className={styles.actions}>
          <ContentAreaButton
            variant="filled"
            className={styles.cta}
            onClick={step === 'entry' ? submit : submitCode}
          >
            <span className={styles.ctaSwap}>
              <AnimatePresence initial={false}>
                {phase === 'done' ? (
                  <motion.span
                    key="check"
                    className={styles.ctaItem}
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={reduceMotion ? { duration: 0 } : SWAP_TRANSITION}
                    aria-label="Verified"
                  >
                    <SfSymbol name="checkmark" size={20} />
                  </motion.span>
                ) : sending || phase === 'verifying' ? (
                  <motion.span
                    key="spinner"
                    className={styles.ctaItem}
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={reduceMotion ? { duration: 0 } : SWAP_TRANSITION}
                  >
                    <span className={styles.spinner} aria-label={sending ? 'Sending' : 'Verifying'}>
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
                    Continue
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </ContentAreaButton>
        </div>
      </BottomSheet>
      {overlayEl ? createPortal(notification, overlayEl) : notification}
    </>
  );
}
