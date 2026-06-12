'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useAnimate, useReducedMotion } from 'motion/react';
import { IconEmail1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconEmail1';
import { IconLoadingCircle } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconLoadingCircle';
import { BottomSheet } from '@/apps/shared/BottomSheet';
import { useScreenOverlay } from '@/apps/shared/AppShell/ScreenOverlayContext';
import { GlassNotification } from '@/apps/shared/GlassNotification';
import {
  GlassSymbolButton,
  GlassTextButton,
  headerGlassBrightness,
  SHEET_GLASS,
} from '@/apps/shared/glass';
import { SfSymbol } from '@/apps/shared/icons';
import { useThemeMode } from '@/hooks/useThemeMode';
import { easeOutSnappy, motionTransition } from '@/lib/easing';
import styles from './EmailSheet.module.scss';

const CODE_LENGTH = 6;
/** The demo's one-time code — what the notification autofills. */
const DEMO_CODE = '123456';
/** Code step settles, then the notification swoops in. */
const NOTIFICATION_DELAY_MS = 1000;
/** Autofill cadence: one digit per beat, submit shortly after the last. */
const FILL_STEP_MS = 60;
const FILL_SUBMIT_MS = 350;

// Step bodies cross blur-fade in place, BOTTOM-anchored (the sheet hangs off
// the screen bottom, so the bottom edge is the fixed one — content stays put
// while only the sheet's top edge moves with the height tween). The CTA lives
// OUTSIDE the steps and never animates.
const STEP_TRANSITION = motionTransition(easeOutSnappy, 0.3);
const HEIGHT_TRANSITION = motionTransition(easeOutSnappy, 0.35);
const STEP_HIDDEN = { opacity: 0, filter: 'blur(8px)' };
const STEP_SHOWN = { opacity: 1, filter: 'blur(0px)' };
// The amount-entry error shake (Swift ShakeEffect, tightened). 
const SHAKE = { x: [0, 8, -8, 8, 0] };
const SHAKE_OPTS = { duration: 0.28, ease: 'linear' as const };

/** "playground@lightspark.com" → "pl•••@lightspark.com". */
function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!domain) return email;
  return `${user.slice(0, 2)}•••@${domain}`;
}

interface EmailSheetProps {
  open: boolean;
  /** Email submitted, code prompt not live yet — Continue shows a spinner. */
  sending?: boolean;
  /** Code prompt live — the sheet pushes to the verification step. */
  codeActive?: boolean;
  onSubmit: (email: string) => void;
  onSubmitCode?: (code: string) => void;
  /** X past the first step — steps back instead of dismissing. */
  onBack?: () => void;
  onCancel?: () => void;
}

/**
 * Floating (inset) email auth sheet — two steps under one persistent header
 * (icon tile + glass X): email entry → verification code, pushed left like
 * the money sheet's steps so the flow reads as one continuous surface.
 */
export function EmailSheet({
  open,
  sending = false,
  codeActive = false,
  onSubmit,
  onSubmitCode,
  onBack,
  onCancel,
}: EmailSheetProps) {
  const theme = useThemeMode();
  const reduceMotion = useReducedMotion();

  // The DISPLAYED step only follows the live prompts while the sheet is open —
  // when the flow completes, codeActive flips off mid-dismiss, and without the
  // hold the sheet would swap steps and re-tween its height while sliding out
  // (a visible stall). State resets on REOPEN instead (money sheet pattern).
  const liveStep: 'email' | 'code' = codeActive ? 'code' : 'email';
  const [step, setStep] = useState(liveStep);
  if (open && step !== liveStep) setStep(liveStep);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open && !codeActive) setStep('email');
  }

  // The steps host tweens its height to the ACTIVE step's natural height (the
  // callback ref measures it as it mounts) while the contents cross-fade.
  const [stepHeight, setStepHeight] = useState<number | null>(null);
  const measureStep = (el: HTMLDivElement | null) => {
    if (el) setStepHeight(el.offsetHeight);
  };

  // Prefilled so Continue is live on open — one tap through the demo.
  const [email, setEmail] = useState('playground@lightspark.com');
  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
  // Continue is always active (the amount-entry pattern): invalid input
  // errors out with a shake on the field instead of a disabled button.
  const [emailScope, animateEmail] = useAnimate<HTMLDivElement>();
  const submit = () => {
    if (sending) return;
    if (valid) {
      onSubmit(email.trim());
    } else if (!reduceMotion && emailScope.current) {
      animateEmail(emailScope.current, SHAKE, SHAKE_OPTS);
    }
  };

  // Focus WITHOUT scrolling — the `autoFocus` attribute scroll-into-views while
  // the sheet is still translated below the screen edge, which scrolls the
  // clipped phone screen up and shoves the whole layout off.
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open && step === 'email') inputRef.current?.focus({ preventScroll: true });
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
  const handleCode = (raw: string) => {
    setCode(raw.replace(/\D/g, '').slice(0, CODE_LENGTH));
  };
  const [codeScope, animateCells] = useAnimate<HTMLDivElement>();
  const submitCode = () => {
    if (code.length === CODE_LENGTH) {
      onSubmitCode?.(code);
    } else if (!reduceMotion && codeScope.current) {
      animateCells(codeScope.current, SHAKE, SHAKE_OPTS);
    }
  };

  // The "Mail" notification — swoops in a beat after the code step lands;
  // tapping it dismisses, types the code in digit by digit, and submits.
  const overlayEl = useScreenOverlay();
  const [notifOn, setNotifOn] = useState(false);
  const notifTimer = useRef(0);
  const fillTimers = useRef<number[]>([]);
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
    },
    [],
  );
  const autofill = () => {
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
        () => onSubmitCode?.(DEMO_CODE),
        (CODE_LENGTH - 1) * FILL_STEP_MS + FILL_SUBMIT_MS,
      ),
    );
  };
  const notification = (
    <GlassNotification
      show={notifOn}
      icon="/assets/auth/mail-app-icon.webp"
      title="Aurora"
      body={`Your one-time code is ${DEMO_CODE.slice(0, 3)}-${DEMO_CODE.slice(3)}`}
      onTap={autofill}
    />
  );

  return (
    <BottomSheet
      open={open}
      onDismiss={onCancel ?? (() => {})}
      inset={16}
      topRadius={40}
      // Same float-sheet treatment as the send/receive picker.
      glass={{ ...SHEET_GLASS, tint: 'var(--float-sheet-tint)' }}
    >
      {/* Persistent header: the activity-row icon tile top-left (email glyph),
          glass X top-right — steps push beneath it. */}
      <div className={styles.header}>
        <span className={styles.tile} aria-hidden>
          <IconEmail1 size={24} />
        </span>
      </div>
      {/* Corner-pinned (16px) independent of the tile's header padding. */}
      <span className={styles.close}>
        <GlassSymbolButton
          aria-label={step === 'code' ? 'Back' : 'Close'}
          size={40}
          type="button"
          glass={{ brightness: headerGlassBrightness(theme) }}
          // Past the first step the X steps BACK (code → email); the scrim
          // still dismisses the whole flow.
          onClick={step === 'code' ? (onBack ?? onCancel) : onCancel}
        >
          <SfSymbol name="xmark" size={14} />
        </GlassSymbolButton>
      </span>

      {/* Single-cell grid: steps overlap and cross blur-fade while the host's
          height tweens to the arriving step. */}
      <motion.div
        className={styles.steps}
        initial={false}
        animate={{ height: stepHeight ?? 'auto' }}
        transition={reduceMotion ? { duration: 0 } : HEIGHT_TRANSITION}
      >
        <AnimatePresence initial={false}>
          {step === 'email' ? (
            <motion.div
              key="email"
              ref={measureStep}
              className={styles.step}
              initial={STEP_HIDDEN}
              animate={STEP_SHOWN}
              exit={STEP_HIDDEN}
              transition={STEP_TRANSITION}
            >
              <h2 className={styles.heading}>Continue with email</h2>
              <p className={styles.sub}>
                Enter your email and we&rsquo;ll send you a one-time code to log in
              </p>
              <div className={styles.cardContainer} ref={emailScope}>
                <div className={styles.card}>
                  <input
                    ref={inputRef}
                    className={styles.input}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
              <h2 className={styles.heading}>Verification code</h2>
                <p className={styles.sub}>
                  Enter the 6-digit code we sent to {maskEmail(email.trim())}.{' '}
                  <button type="button" className={styles.resend}>
                    Resend
                  </button>
                </p>
                {/* Six display cells (3 — 3) over one hidden input — taps focus
                    it, the active cell carries the focus ring. */}
                <div
                  ref={codeScope}
                  className={styles.codeContainer}
                  onClick={() => codeRef.current?.focus({ preventScroll: true })}
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
                      <span
                        className={styles.codeCell}
                        data-active={i === Math.min(code.length, CODE_LENGTH - 1) || undefined}
                      >
                        {code[i] ?? ''}
                      </span>
                    </Fragment>
                  ))}
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ONE persistent CTA — never animates; only its handler follows the
          step (and the sending spinner swaps in during the gap). */}
      <div className={styles.actions}>
        <GlassTextButton
          variant="primary"
          onClick={step === 'email' ? submit : submitCode}
        >
          {sending ? (
            <span className={styles.spinner} aria-label="Sending">
              <IconLoadingCircle size={20} />
            </span>
          ) : (
            'Continue'
          )}
        </GlassTextButton>
      </div>

      {/* Above the status bar via AppShell's overlay layer (the Face ID /
          toast slot); falls back to an in-sheet layer outside an AppShell. */}
      {overlayEl ? createPortal(notification, overlayEl) : notification}
    </BottomSheet>
  );
}
