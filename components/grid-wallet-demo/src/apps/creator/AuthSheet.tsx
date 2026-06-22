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
import { IconLoadingCircle } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconLoadingCircle';
import { BottomSheet } from '@/apps/shared/BottomSheet';
import { useScreenOverlay } from '@/apps/shared/AppShell/ScreenOverlayContext';
import { PhoneStatusBar } from '@/apps/shared/AppShell/PhoneStatusBar';
import {
  GlassNotification,
  NOTIFICATION_INSET_PX,
  NOTIFICATION_TOP_PX,
} from '@/apps/shared/GlassNotification';
import { PrimaryButton } from './blocks/PrimaryButton';
import { SheetIconButton } from './blocks/SheetIconButton';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { SquircleFocusHalo } from '@/apps/shared/SquircleFocusHalo';
import { IconCrossMedium } from './icons';
import { AUTH_METHOD_ICONS, type AuthMethodIcon } from '@/apps/shared/authMethodIcons';
import { SfSymbol } from '@/apps/shared/icons';
import { easeOutSnappy, motionTransition } from '@/lib/easing';
import { CREATOR_FLAT_SHEET } from './glass-presets';
import { BRAND } from './config';
import { formatUsPhone, maskUsPhone } from '@/lib/phoneFormat';
import styles from './AuthSheet.module.scss';

const CODE_LENGTH = 6;
/** The demo's one-time code — what the notification autofills. */
const DEMO_CODE = '123456';
/** Code step settles, then the notification swoops in. */
const NOTIFICATION_DELAY_MS = 1000;
/** Autofill cadence: one digit per beat, submit shortly after the last. */
const FILL_STEP_MS = 25;
const FILL_SUBMIT_MS = 350;
/** Complete-code choreography: a verifying spinner beat, then a checkmark
 *  beat on the CTA, and only then the actual submit (the sheet's dismiss). */
const VERIFY_MS = 500;
const CHECK_MS = 500;

// Step bodies cross blur-fade in place, BOTTOM-anchored (the sheet hangs off
// the screen bottom, so the bottom edge is the fixed one — content stays put
// while only the sheet's top edge moves with the height tween). The CTA lives
// OUTSIDE the steps and never animates.
const STEP_TRANSITION = motionTransition(easeOutSnappy, 0.3);
const HEIGHT_TRANSITION = motionTransition(easeOutSnappy, 0.35);
// CTA content swaps (Continue ⇄ spinner ⇄ checkmark) — the money sheet's
// glyph-swap language.
const SWAP_TRANSITION = motionTransition(easeOutSnappy, 0.35);
const STEP_HIDDEN = { opacity: 0, filter: 'blur(8px)' };
const STEP_SHOWN = { opacity: 1, filter: 'blur(0px)' };
// The amount-entry error shake (Swift ShakeEffect, tightened).
const SHAKE = { x: [0, 8, -8, 8, 0] };
const SHAKE_OPTS = { duration: 0.28, ease: 'linear' as const };

/** OTP digit cell — squircle clip-path for Safari (corner-shape fallback is circular). */
function AuthCodeCell({ active, children }: { active?: boolean; children: ReactNode }) {
  const clip = useSquircleClip<HTMLSpanElement>({ figmaRadii: 10 });
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
  /** Header tile glyph — the auth method's icon at the shared treatment. */
  Icon: AuthMethodIcon;
  heading: string;
  sub: string;
  /** Step-1 input semantics: keyboard, autofill, placeholder. */
  input: Pick<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'inputMode' | 'autoComplete' | 'placeholder'
  >;
  /** Prefilled so Continue is live on open — one tap through the demo. */
  prefill: string;
  /** Live re-format as the user types (phone groups digits; email passes through). */
  format: (raw: string) => string;
  validate: (value: string) => boolean;
  /** Code-step copy: the destination, privacy-masked. */
  mask: (value: string) => string;
  /** The code-delivery notification (Mail vs Messages look). */
  notification: {
    icon: string;
    /** Sender-avatar badge (the Messages app icon) — SMS only. */
    badge?: string;
    title: string;
    body: string;
    bodyLines: number;
  };
}

/** Per-method copy, input semantics, and notification; the steps, height
 *  choreography, code cells, and CTA are shared (the money sheet's MODES
 *  pattern). */
const METHODS: Record<AuthSheetMethod, MethodConfig> = {
  email: {
    Icon: AUTH_METHOD_ICONS.email_otp,
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
    Icon: AUTH_METHOD_ICONS.sms,
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
      // The iOS Messages SMS look: generic contact avatar + the green
      // Messages app icon badged on its corner, short-code sender.
      icon: '/assets/auth/generic-contact.svg',
      badge: '/assets/auth/messages-app-icon.webp',
      title: '22395',
      body: `Your ${BRAND} verification code is: ${DEMO_CODE}. This code will expire in 10 minutes. Don\u2019t share this code with anyone.`,
      bodyLines: 2,
    },
  },
};

interface AuthSheetProps {
  /** Which entry the first step collects (email address vs phone number). */
  method?: AuthSheetMethod;
  open: boolean;
  /** Entry submitted, code prompt not live yet — Continue shows a spinner. */
  sending?: boolean;
  /** Code prompt live — the sheet pushes to the verification step. */
  codeActive?: boolean;
  onSubmit: (value: string) => void;
  onSubmitCode?: (code: string) => void;
  /** X past the first step — steps back instead of dismissing. */
  onBack?: () => void;
  onCancel?: () => void;
}

/**
 * Full-bleed auth sheet — two steps under one persistent header
 * (icon tile + glass X): email/phone entry → verification code, pushed left
 * like the money sheet's steps so the flow reads as one continuous surface.
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
  const inputClip = useSquircleClip({ figmaRadii: 10 });

  // The DISPLAYED step only follows the live prompts while the sheet is open —
  // when the flow completes, codeActive flips off mid-dismiss, and without the
  // hold the sheet would swap steps and re-tween its height while sliding out
  // (a visible stall). State resets on REOPEN instead (money sheet pattern).
  // The steps host tweens its height to the ACTIVE step's natural height (the
  // callback ref measures it as it mounts) while the contents cross-fade.
  const [stepHeight, setStepHeight] = useState<number | null>(null);

  // Complete-code submit choreography: 'verifying' holds the spinner on the
  // CTA, 'done' swaps it for a checkmark, and only then does onSubmitCode
  // fire (the sheet dismisses on a CTA that has already said "verified").
  // Input is locked for the whole sequence.
  const [phase, setPhase] = useState<'idle' | 'verifying' | 'done'>('idle');
  const phaseTimers = useRef<number[]>([]);

  const liveStep: 'entry' | 'code' = codeActive ? 'code' : 'entry';
  const [step, setStep] = useState(liveStep);
  if (open && step !== liveStep) setStep(liveStep);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open && !codeActive) setStep('entry');
    // Fresh CTA on reopen — the checkmark from a completed run must not
    // greet the next sign-in.
    if (open) setPhase('idle');
  }

  // Measure every step AS IT MOUNTS (sheet open AND each swap — a step-keyed
  // effect misses the open, where the children mount but `step` never changes,
  // leaving the host at un-tweenable 'auto' and the first swap snapping).
  // The setState defers one frame so framer always reads it as a TARGET update
  // (same-commit flushes get folded into its adoption pass and snap).
  const stepRef = useRef<HTMLDivElement | null>(null);
  const measureStep = (el: HTMLDivElement | null) => {
    if (!el) return;
    stepRef.current = el;
    requestAnimationFrame(() => {
      // A stale frame from an already-replaced step must not win.
      if (stepRef.current === el) setStepHeight(el.offsetHeight);
    });
  };

  // Prefilled per method so Continue is live on open — one tap through the
  // demo. The value follows the method when it changes (the sheet stays
  // mounted across method switches, so the email prefill must not leak into
  // the phone step).
  const [value, setValue] = useState(cfg.prefill);
  const [prevMethod, setPrevMethod] = useState(method);
  if (method !== prevMethod) {
    setPrevMethod(method);
    setValue(cfg.prefill);
  }
  const valid = cfg.validate(value);
  // Continue is always active (the amount-entry pattern): invalid input
  // errors out with a shake on the field instead of a disabled button.
  const [entryScope, animateEntry] = useAnimate<HTMLDivElement>();
  const submit = () => {
    if (sending) return;
    if (valid) {
      onSubmit(value.trim());
    } else if (!reduceMotion && entryScope.current) {
      animateEntry(entryScope.current, SHAKE, SHAKE_OPTS);
    }
  };

  // Focus WITHOUT scrolling — the `autoFocus` attribute scroll-into-views while
  // the sheet is still translated below the screen edge, which scrolls the
  // clipped phone screen up and shoves the whole layout off.
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open && step === 'entry') inputRef.current?.focus({ preventScroll: true });
  }, [open, step]);

  // Verification code — one hidden input drives six display cells. The value
  // clears on REOPEN (not on close, which would visibly empty the cells while
  // the sheet is still sliding out).
  const [code, setCode] = useState('');
  useEffect(() => {
    if (open && !codeActive) setCode('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const codeRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open && step === 'code') codeRef.current?.focus({ preventScroll: true });
  }, [open, step]);
  // The autofill's digit beats — shared with handleCode (typing cancels them).
  const fillTimers = useRef<number[]>([]);
  const handleCode = (raw: string) => {
    if (phase !== 'idle') return;
    // Manual typing takes over from a running autofill — cancel its beats
    // (including the staged submit) and let the keys drive.
    for (const t of fillTimers.current) window.clearTimeout(t);
    setCode(raw.replace(/\D/g, '').slice(0, CODE_LENGTH));
  };
  // A complete code doesn't resolve immediately: the CTA spins ('verifying'),
  // lands a checkmark ('done'), and THEN submits — so the sheet leaves on a
  // finished gesture. Reduced motion skips the beats.
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

  // The code-delivery notification (Mail / Messages) — swoops in a beat after
  // the code step lands; tapping it dismisses, types the code in digit by
  // digit, and submits.
  const overlayEl = useScreenOverlay();
  const [notifOn, setNotifOn] = useState(false);
  const notifTimer = useRef(0);
  useEffect(() => {
    window.clearTimeout(notifTimer.current);
    if (open && step === 'code') {
      notifTimer.current = window.setTimeout(
        () => setNotifOn(true),
        NOTIFICATION_DELAY_MS,
      );
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
  // TRUE refraction copy — what's behind the capsule, rebuilt as filterable
  // DOM and anchored to screen coordinates (offset by the capsule's slot):
  // the LIVE CSS aurora replica (Safari won't SVG-filter the WebGL canvas;
  // this paints the same field per frame as a linear-gradient, wrapped in
  // AuroraBackground's root class for the palette tokens + base, with the
  // auth screen's same -80px bleed) and the real status bar component.
  // WINDOWED to the lens + the glass's 48px sampling bleed: WebKit mishandles
  // SVG filters past a source-graphic LAYOUT-size ceiling (the experiment's
  // lesson) — feeding it the whole 402x874 screen renders an empty lens. The
  // screen-aligned copy lives inside the clipped window at the equivalent
  // offset, so alignment is unchanged.
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
        <div style={{ position: 'absolute', inset: 0, background: 'var(--app-wash)' }} />
        <PhoneStatusBar tone="light" />
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

  return (
    <>
    <BottomSheet
      open={open}
      // The scrim can't cancel mid-verify — the staged submit is committed.
      onDismiss={phase === 'idle' ? (onCancel ?? (() => {})) : () => {}}
      glass={CREATOR_FLAT_SHEET}
      // 24px top corners (squircle via FrostPanel clip-path, cross-browser).
      // Scoped here so the shared CREATOR_FLAT_SHEET preset (Send/Receive) is untouched.
      topRadius={24}
    >
      <div className={styles.titleRow}>
        <h2 className={styles.title}>
          {step === 'entry' ? cfg.heading : 'Verification code'}
        </h2>
        <SheetIconButton
          className={styles.closeBtn}
          ghost
          aria-label={step === 'code' ? 'Back' : 'Close'}
          size={40}
          type="button"
          onClick={
            phase === 'idle'
              ? step === 'code'
                ? (onBack ?? onCancel)
                : onCancel
              : undefined
          }
        >
          <IconCrossMedium size={24} />
        </SheetIconButton>
      </div>

      {/* Single-cell grid: steps overlap and cross blur-fade while the host's
          height tweens to the arriving step. */}
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
                <div className={styles.cardShell}>
                  <SquircleFocusHalo
                    path={inputClip.path}
                    width={inputClip.width}
                    height={inputClip.height}
                    className={styles.cardHalo}
                  />
                  <div ref={inputClip.ref} style={inputClip.style} className={styles.card}>
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
                {/* Six display cells (3 — 3) over one hidden input. A tap runs
                    the same autofill as the notification (dismissing it if
                    it's up); the input keeps focus so manual typing still
                    takes over from the fill. */}
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
                      {i === CODE_LENGTH / 2 && (
                        <span className={styles.codeDash} aria-hidden />
                      )}
                      <AuthCodeCell
                        active={i === Math.min(code.length, CODE_LENGTH - 1) || undefined}
                      >
                        {code[i] ?? ''}
                      </AuthCodeCell>
                    </Fragment>
                  ))}
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ONE persistent CTA — only its CONTENT swaps (Continue → spinner →
          checkmark, the money sheet's glyph-swap language) while the button
          itself never animates. The spinner covers both the sending gap and
          the verifying beat; the checkmark holds until the staged submit. */}
      <div className={styles.actions}>
        <PrimaryButton onClick={step === 'entry' ? submit : submitCode}>
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
                  <span
                    className={styles.spinner}
                    aria-label={sending ? 'Sending' : 'Verifying'}
                  >
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
        </PrimaryButton>
      </div>

    </BottomSheet>
      {/* Above the status bar via AppShell's overlay (Face ID / toast slot). A
          SIBLING of the sheet (not a child) so its tuck-up exit plays on dismiss —
          framer cuts a nested AnimatePresence exit when the sheet's own
          AnimatePresence unmounts the subtree. Falls back to an in-sheet layer
          outside an AppShell. */}
      {overlayEl ? createPortal(notification, overlayEl) : notification}
    </>
  );
}
