'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useAnimate, useReducedMotion } from 'motion/react';
import type { AuthMethod } from '@/data/flow';
import type { SkinAuthScreenProps } from '@/apps/types';
import { useScreenOverlay } from '@/apps/shared/AppShell/ScreenOverlayContext';
import { GlassNotification } from '@/apps/shared/GlassNotification';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { SquircleFocusHalo } from '@/apps/shared/SquircleFocusHalo';
import { easeOutQuick, easeOutSnappy, motionTransition } from '@/lib/easing';
import { formatUsPhone } from '@/lib/phoneFormat';
import { PlainInput } from './blocks/PlainInput';
import { stashAuthValue, takeAuthValue } from './authValue';
import {
  IconArrowLeft,
  IconArrowRight,
  IconGoogle,
  IconApple,
  IconPasskeys,
  IconEmail2,
  type OndemandIcon,
} from './icons';
import { BRAND, ONDEMAND_AUTH } from './config';
import styles from './OndemandAuthScreen.module.scss';

/** Grey CTA rows under the "or" rule (IMG_0669), in reference order. */
const ROW_ORDER: AuthMethod[] = ['apple', 'oauth', 'email_otp', 'passkey'];
const ROW_ICONS: Partial<Record<AuthMethod, OndemandIcon>> = {
  apple: IconApple,
  oauth: IconGoogle,
  email_otp: IconEmail2,
  passkey: IconPasskeys,
};
const ROW_LABELS: Partial<Record<AuthMethod, string>> = {
  apple: 'Continue with Apple',
  oauth: 'Continue with Google',
  email_otp: 'Continue with Email',
  passkey: 'Continue with a passkey',
};

const CODE_LENGTH = 6;
const DEMO_CODE = '123456';
const DEMO_EMAIL = 'demo@lightspark.com';
const DEMO_PHONE = '(415) 555-0132';
/** Focusing the empty field "autofills" the demo value after a beat — the
 *  one-tap demo path. */
const PREFILL_DELAY_MS = 350;
const NOTIFICATION_DELAY_MS = 1000;
const FILL_STEP_MS = 25;
const FILL_SUBMIT_MS = 350;
const CODE_SUBMIT_MS = 350;

// Full-screen iOS nav push between the auth steps.
const STEP_TRANSITION = motionTransition(easeOutSnappy, 0.35);
type NavDir = { back: boolean; reduceMotion: boolean };
const stepVariants = {
  enter: ({ back, reduceMotion }: NavDir) =>
    reduceMotion ? { x: 0, opacity: 1 } : { x: back ? '-100%' : '100%', opacity: 1 },
  center: { x: 0, opacity: 1 },
  exit: ({ back, reduceMotion }: NavDir) =>
    reduceMotion ? { opacity: 0 } : { x: back ? '100%' : '-100%', opacity: 0 },
};

// Method toggles: rows pop in/out and the column reflows.
const TOGGLE = motionTransition(easeOutSnappy, 0.32);
const PRESS = motionTransition([0.22, 1, 0.36, 1], 0.28);
const ROW_HIDDEN = { height: 0, marginBottom: 0, opacity: 0, filter: 'blur(6px)' };
const ROW_SHOWN = { height: 50, marginBottom: 12, opacity: 1, filter: 'blur(0px)' };
const FORM_HIDDEN = { height: 0, marginBottom: 0, opacity: 0, filter: 'blur(6px)' };
const FORM_SHOWN = { height: 118, marginBottom: 4, opacity: 1, filter: 'blur(0px)' };
const OR_HIDDEN = { height: 0, marginBottom: 0, opacity: 0, filter: 'blur(6px)' };
const OR_SHOWN = { height: 20, marginBottom: 16, opacity: 1, filter: 'blur(0px)' };

// Dismiss: content blur-fades out; the "Signing you in…" beat fades in.
const CONTENT_OUT = motionTransition(easeOutQuick, 0.5);
const CAPTION_DELAY_MS = 500;
const CAPTION_IN = motionTransition(easeOutQuick, 0.35);
const CAPTION_OUT = motionTransition(easeOutQuick, 0.28);
const CAPTION_HIDDEN = { opacity: 0, y: 10, filter: 'blur(8px)' };
const CAPTION_REST = { opacity: 1, y: 0, filter: 'blur(0px)' };

const SHAKE = { x: [0, 8, -8, 8, 0] };
const SHAKE_OPTS = { duration: 0.28, ease: 'linear' as const };

function looksLikePhone(v: string): boolean {
  return v.trim().length > 0 && /^[\d\s()+.-]*$/.test(v);
}

const NOTIFICATIONS = {
  email: {
    icon: '/assets/auth/mail-app-icon.webp',
    badge: undefined as string | undefined,
    title: BRAND,
    body: `Your one-time code is ${DEMO_CODE.slice(0, 3)}-${DEMO_CODE.slice(3)}`,
    bodyLines: 1,
  },
  phone: {
    icon: '/assets/auth/generic-contact.svg',
    badge: '/assets/auth/messages-app-icon.webp',
    title: '22395',
    body: `Your ${BRAND} verification code is: ${DEMO_CODE}. This code will expire in 10 minutes.`,
    bodyLines: 2,
  },
};

/** Black full-width CTA (IMG_0669 Continue) — h50, r8 smoothed. */
function BlackCta({
  children,
  disabled,
  onClick,
}: {
  children: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const clip = useSquircleClip<HTMLButtonElement>({ figmaRadii: 8 });
  return (
    <button
      type="button"
      className={styles.blackCta}
      ref={clip.ref}
      style={clip.style}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/** Grey "Continue with …" row (IMG_0669) — h50, r8 smoothed, glyph + label. */
function MethodRow({
  method,
  disabled,
  onClick,
}: {
  method: AuthMethod;
  disabled: boolean;
  onClick: () => void;
}) {
  const clip = useSquircleClip<HTMLButtonElement>({ figmaRadii: 8 });
  const Icon = ROW_ICONS[method];
  if (!Icon) return null;
  return (
    <motion.div
      key={method}
      className={styles.rowSlot}
      layout
      initial={ROW_HIDDEN}
      animate={ROW_SHOWN}
      exit={ROW_HIDDEN}
      transition={TOGGLE}
    >
      <button
        type="button"
        className={styles.methodRow}
        ref={clip.ref}
        style={clip.style}
        disabled={disabled}
        onClick={onClick}
      >
        <Icon size={20} />
        <span>{ROW_LABELS[method]}</span>
      </button>
    </motion.div>
  );
}

/** Bottom-pinned nav footer (IMG_0693): grey back circle + black Next pill. */
function StepFooter({
  onBack,
  onNext,
  nextDisabled,
}: {
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
}) {
  return (
    <div className={styles.stepFooter}>
      <button type="button" className={styles.backCircle} aria-label="Back" onClick={onBack}>
        <IconArrowLeft size={22} />
      </button>
      <button
        type="button"
        className={styles.nextPill}
        disabled={nextDisabled}
        onClick={onNext}
      >
        Next
        <IconArrowRight size={18} />
      </button>
    </div>
  );
}

/**
 * Ondemand sign-in — full-screen Uber-style surfaces (IMG_0669/0693/0672).
 * Three steps push horizontally INSIDE the auth screen (the marketplace
 * inlineAuthFlow pattern): landing (phone + method rows) → email entry →
 * verification code. Flat, white, no glass — the only glass is the shared
 * iOS notification (system chrome).
 */
export function OndemandAuthScreen({
  busy,
  methods,
  dismissed = false,
  leaving = false,
  onSignIn,
  authFlow,
}: SkinAuthScreenProps) {
  const reduceMotion = useReducedMotion();
  // The OTP flow arrives as a prop (registry `inlineAuthFlow`) — same render
  // clock as `dismissed`, so the step logic below is race-free derivation.
  const flow = authFlow;

  const emailOn = methods.includes('email_otp');
  const phoneOn = methods.includes('sms');
  const rows = ROW_ORDER.filter((m) => methods.includes(m));

  // ── Entry values ──────────────────────────────────────────────────────────
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const validPhone = phoneOn && looksLikePhone(phone) && phone.replace(/\D/g, '').length === 10;
  const validEmail = emailOn && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());

  const prefillTimer = useRef(0);
  const prefill = (setter: (v: string) => void, demo: string, current: string) => {
    if (current.length > 0) return;
    window.clearTimeout(prefillTimer.current);
    prefillTimer.current = window.setTimeout(() => setter(demo), PREFILL_DELAY_MS);
  };
  useEffect(() => () => window.clearTimeout(prefillTimer.current), []);

  // ── Steps: landing ⇄ email ⇄ code (full-screen pushes) ────────────────────
  // The code step is a pure derivation from the flow (shows while sending or
  // prompting, and HOLDS after a successful submit through the dismissal).
  // The email step is a local latch — it exists before the flow arms.
  const [back, setBack] = useState(false);
  const navDir: NavDir = { back, reduceMotion: !!reduceMotion };
  const [emailMode, setEmailMode] = useState(false);
  const [code, setCode] = useState('');
  const submitted = useRef(false);
  const step: 'landing' | 'email' | 'code' =
    (flow && (flow.sending || flow.codeActive)) || (submitted.current && !flow?.open)
      ? 'code'
      : emailMode
        ? 'email'
        : 'landing';

  // The flow's entry step is invisible in this skin: when it arms, submit the
  // stashed value immediately — the visible beat is the push to the code
  // screen once the send starts. No stash (a backed-out or switched-in flow)
  // just leaves the current step showing.
  useEffect(() => {
    if (!flow?.open || flow.codeActive || flow.sending) return;
    const stashed = takeAuthValue();
    if (stashed != null) {
      setBack(false);
      flow.onSubmit(stashed);
    }
  }, [flow]);

  const [phoneScope, animatePhone] = useAnimate<HTMLDivElement>();
  const [emailScope, animateEmail] = useAnimate<HTMLDivElement>();

  const entryArmed = Boolean(flow?.open && !flow.codeActive && !flow.sending);
  const controlsDisabled = Boolean(busy) || dismissed;
  const formDisabled = dismissed || (Boolean(busy) && !entryArmed);

  const submitPhone = () => {
    if (formDisabled) return;
    if (!validPhone) {
      if (!reduceMotion && phoneScope.current) animatePhone(phoneScope.current, SHAKE, SHAKE_OPTS);
      return;
    }
    const clean = phone.trim();
    setBack(false);
    if (entryArmed) {
      flow?.onSubmit(clean);
    } else {
      stashAuthValue(clean);
      onSignIn('sms');
    }
  };

  const submitEmail = () => {
    if (formDisabled) return;
    if (!validEmail) {
      if (!reduceMotion && emailScope.current) animateEmail(emailScope.current, SHAKE, SHAKE_OPTS);
      return;
    }
    const clean = email.trim();
    setBack(false);
    if (entryArmed) {
      flow?.onSubmit(clean);
    } else {
      stashAuthValue(clean);
      onSignIn('email_otp');
    }
  };

  const openEmail = () => {
    if (controlsDisabled && !entryArmed) return;
    setBack(false);
    setEmailMode(true);
  };

  const backFromEmail = () => {
    setBack(true);
    setEmailMode(false);
    // A flow parked at the (invisible) entry step is abandoned with the screen.
    if (entryArmed) flow?.onCancel?.();
  };

  const backFromCode = () => {
    setBack(true);
    setCode('');
    // Email codes return to the email screen; SMS codes to the landing.
    setEmailMode(flow?.method === 'email');
    if (flow?.codeActive) flow.onBack?.();
    else flow?.onCancel?.();
  };

  // ── Verification code ─────────────────────────────────────────────────────
  const codeRef = useRef<HTMLInputElement>(null);
  const fillTimers = useRef<number[]>([]);
  useEffect(() => {
    if (step === 'code' && flow?.codeActive) {
      submitted.current = false;
      codeRef.current?.focus({ preventScroll: true });
    }
  }, [step, flow?.codeActive]);
  useEffect(() => {
    if (step !== 'code') setCode('');
  }, [step]);
  useEffect(
    () => () => {
      for (const t of fillTimers.current) window.clearTimeout(t);
    },
    [],
  );

  // A full code auto-submits after a settle beat.
  const finishCode = (c: string) => {
    if (submitted.current) return;
    submitted.current = true;
    if (reduceMotion) {
      flow?.onSubmitCode?.(c);
      return;
    }
    fillTimers.current.push(window.setTimeout(() => flow?.onSubmitCode?.(c), CODE_SUBMIT_MS));
  };
  const handleCode = (raw: string) => {
    if (submitted.current) return;
    for (const t of fillTimers.current) window.clearTimeout(t);
    const next = raw.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(next);
    if (next.length === CODE_LENGTH) finishCode(next);
  };
  const autofill = () => {
    if (submitted.current || !flow?.codeActive) return;
    setNotifOn(false);
    if (reduceMotion) {
      setCode(DEMO_CODE);
      finishCode(DEMO_CODE);
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

  // ── The iOS notification (system glass — allowed) ─────────────────────────
  const overlayEl = useScreenOverlay();
  const [notifOn, setNotifOn] = useState(false);
  const notifTimer = useRef(0);
  const codeArmed = Boolean(flow?.open && flow.codeActive) && !dismissed;
  useEffect(() => {
    window.clearTimeout(notifTimer.current);
    if (codeArmed) {
      notifTimer.current = window.setTimeout(() => setNotifOn(true), NOTIFICATION_DELAY_MS);
    } else {
      setNotifOn(false);
    }
    return () => window.clearTimeout(notifTimer.current);
  }, [codeArmed]);

  const method = flow?.method ?? 'email';
  const notifCfg = NOTIFICATIONS[method];
  // The typed value is THIS skin's local state — a mid-flow skin switch lands
  // on the code step without it. Fall back to the method's demo default.
  const codeRecipient =
    method === 'phone'
      ? phone.replace(/\D/g, '').length === 10
        ? phone.trim()
        : DEMO_PHONE
      : email.includes('@')
        ? email.trim()
        : DEMO_EMAIL;
  const codeTitle =
    method === 'phone'
      ? `Enter the ${CODE_LENGTH}-digit code sent via SMS at ${codeRecipient}.`
      : `Enter the ${CODE_LENGTH}-digit code sent to ${codeRecipient}.`;
  const codeChangeLabel =
    method === 'phone' ? 'Changed your mobile number?' : 'Changed your email address?';

  const notification = (
    <GlassNotification
      show={notifOn}
      icon={notifCfg.icon}
      badge={notifCfg.badge}
      title={notifCfg.title}
      body={notifCfg.body}
      bodyLines={notifCfg.bodyLines}
      onTap={autofill}
    />
  );

  // Hard mount-gate for the "Signing you in…" beat.
  const [captionOn, setCaptionOn] = useState(false);
  useEffect(() => {
    if (!dismissed) {
      setCaptionOn(false);
      return;
    }
    const t = window.setTimeout(() => setCaptionOn(true), CAPTION_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [dismissed]);

  return (
    <div className={styles.root}>
      <motion.div
        className={styles.content}
        initial={false}
        animate={{
          opacity: dismissed ? 0 : 1,
          filter: dismissed ? 'blur(12px)' : 'blur(0px)',
        }}
        transition={CONTENT_OUT}
        style={{ pointerEvents: dismissed ? 'none' : 'auto' }}
      >
        <AnimatePresence initial={false} custom={navDir}>
          {step === 'landing' ? (
            <motion.div
              key="landing"
              className={styles.step}
              custom={navDir}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={STEP_TRANSITION}
            >
              <div className={styles.landing}>
                <img
                  className={styles.appIcon}
                  src="/assets/app-icon-ondemand.png"
                  alt=""
                  draggable={false}
                />
                <h1 className={styles.landingTitle}>{ONDEMAND_AUTH.heading}</h1>

                <AnimatePresence initial={false}>
                  {phoneOn && (
                    <motion.div
                      key="phoneForm"
                      className={styles.phoneForm}
                      initial={FORM_HIDDEN}
                      animate={FORM_SHOWN}
                      exit={FORM_HIDDEN}
                      transition={TOGGLE}
                    >
                      <div className={styles.phoneFormInner} ref={phoneScope}>
                        <PlainInput
                          value={phone}
                          onChange={(raw) =>
                            setPhone(looksLikePhone(raw) ? formatUsPhone(raw) : raw)
                          }
                          placeholder="(201) 555-0123"
                          onEnter={submitPhone}
                          onFocus={() => prefill(setPhone, DEMO_PHONE, phone)}
                          disabled={formDisabled}
                          inputProps={{ type: 'text', inputMode: 'tel', autoComplete: 'tel' }}
                        />
                        <BlackCta disabled={formDisabled} onClick={submitPhone}>
                          Continue
                        </BlackCta>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence initial={false}>
                  {phoneOn && rows.length > 0 && (
                    <motion.div
                      key="or"
                      className={styles.orRow}
                      aria-hidden
                      initial={OR_HIDDEN}
                      animate={OR_SHOWN}
                      exit={OR_HIDDEN}
                      transition={TOGGLE}
                    >
                      <span className={styles.orLine} />
                      <span className={styles.orText}>or</span>
                      <span className={styles.orLine} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className={styles.rows}>
                  <AnimatePresence initial={false} mode="popLayout">
                    {rows.map((m) => (
                      <MethodRow
                        key={m}
                        method={m}
                        disabled={controlsDisabled && !entryArmed}
                        onClick={() => (m === 'email_otp' ? openEmail() : onSignIn(m))}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ) : step === 'email' ? (
            <motion.div
              key="email"
              className={styles.step}
              custom={navDir}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={STEP_TRANSITION}
            >
              <div className={styles.push}>
                <h1 className={styles.pushTitle}>What&rsquo;s your email address?</h1>
                <div className={styles.fieldBlock} ref={emailScope}>
                  <span className={styles.fieldLabel}>Email</span>
                  <PlainInput
                    value={email}
                    onChange={setEmail}
                    placeholder="name@example.com"
                    onEnter={submitEmail}
                    onFocus={() => prefill(setEmail, DEMO_EMAIL, email)}
                    disabled={formDisabled}
                    inputProps={{ type: 'text', inputMode: 'email', autoComplete: 'email' }}
                  />
                </div>
                <StepFooter onBack={backFromEmail} onNext={submitEmail} nextDisabled={formDisabled} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="code"
              className={styles.step}
              custom={navDir}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={STEP_TRANSITION}
            >
              <div className={styles.push}>
                <h1 className={styles.pushTitle}>{codeTitle}</h1>
                <button type="button" className={styles.changeLink} onClick={backFromCode}>
                  {codeChangeLabel}
                </button>
                <CodeBoxes
                  code={code}
                  inputRef={codeRef}
                  disabled={!flow?.codeActive || submitted.current}
                  onChange={handleCode}
                  onTap={autofill}
                />
                <StepFooter
                  onBack={backFromCode}
                  onNext={() => code.length === CODE_LENGTH && finishCode(code)}
                  nextDisabled={code.length < CODE_LENGTH}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {dismissed && captionOn && !leaving && (
          <motion.div
            key="creating"
            className={styles.creatingSlot}
            initial={CAPTION_HIDDEN}
            animate={CAPTION_REST}
            exit={{ ...CAPTION_HIDDEN, transition: CAPTION_OUT }}
            transition={CAPTION_IN}
          >
            <img
              className={styles.creatingIcon}
              src="/assets/app-icon-ondemand.png"
              alt=""
              draggable={false}
            />
            <span className={styles.creatingLabel}>{ONDEMAND_AUTH.creating}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {overlayEl ? createPortal(notification, overlayEl) : notification}
    </div>
  );
}

/** Six individual code boxes (IMG_0672): active = white + 2px black border,
 *  the rest grey. One hidden input drives them. */
function CodeBoxes({
  code,
  inputRef,
  disabled,
  onChange,
  onTap,
}: {
  code: string;
  inputRef: React.RefObject<HTMLInputElement>;
  disabled: boolean;
  onChange: (raw: string) => void;
  onTap: () => void;
}) {
  return (
    <div
      className={styles.codeRow}
      onClick={() => {
        onTap();
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
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
      {Array.from({ length: CODE_LENGTH }, (_, i) => (
        <CodeBox
          key={i}
          char={code[i]}
          active={i === Math.min(code.length, CODE_LENGTH - 1) && !disabled}
        />
      ))}
    </div>
  );
}

/** One code box — squircle clip for the fill, the 2px active border as an SVG
 *  halo stroke (clip-path eats box borders; the Glitch/Z construction). */
function CodeBox({ char, active }: { char?: string; active: boolean }) {
  const clip = useSquircleClip<HTMLSpanElement>({ figmaRadii: 8 });
  return (
    <span className={styles.codeBox} data-active={active || undefined}>
      <span ref={clip.ref} style={clip.style} className={styles.codeBoxFill}>
        {char ?? ''}
      </span>
      <SquircleFocusHalo
        path={clip.path}
        width={clip.width}
        height={clip.height}
        className={styles.codeBoxHalo}
      />
    </span>
  );
}
