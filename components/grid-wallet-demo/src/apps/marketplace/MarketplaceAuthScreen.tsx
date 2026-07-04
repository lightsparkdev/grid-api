'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useAnimate, useReducedMotion } from 'motion/react';
import type { AuthMethod } from '@/data/flow';
import type { SkinAuthScreenProps } from '@/apps/types';
import {
  SheetPresentationProvider,
  PresentationStage,
  useRegisterSheet,
} from '@/apps/shared/SheetPresentation';
import { useScreenOverlay } from '@/apps/shared/AppShell/ScreenOverlayContext';
import { GlassNotification } from '@/apps/shared/GlassNotification';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { SquircleFocusHalo } from '@/apps/shared/SquircleFocusHalo';
import { figmaSquircleRadius } from '@/apps/shared/figmaSquircleRadius';
import { easeOutQuick, easeOutSnappy, motionTransition } from '@/lib/easing';
import { formatUsPhone, maskUsPhone } from '@/lib/phoneFormat';
import { EARNINGS_APY_PERCENT } from '@/apps/shared/wallet';
import { MarketplaceHomeContent } from './wallet/HomeBlocks';
import { MarketplaceTabBar } from './blocks/MarketplaceTabBar';
import { FloatingLabelInput } from './blocks/FloatingLabelInput';
import { MarketplaceLogo } from './MarketplaceLogo';
import { useAuthFlow, stashAuthValue, takeAuthValue } from './authFlow';
import {
  IconCrossMedium,
  IconArrowLeft,
  IconGoogle,
  IconApple,
  IconPasskeys,
  type MarketplaceIcon,
} from './icons';
import { BRAND, MARKETPLACE_AUTH, MARKETPLACE_SHEET_DURATION } from './config';
import styles from './MarketplaceAuthScreen.module.scss';

/** Square tiles, in order: Google, Apple, Passkey (Figma 2375:11754 + spec). */
const SQUARE_ORDER: AuthMethod[] = ['oauth', 'apple', 'passkey'];
const SQUARE_ICONS: Partial<Record<AuthMethod, MarketplaceIcon>> = {
  oauth: IconGoogle,
  apple: IconApple,
  passkey: IconPasskeys,
};
const SQUARE_LABELS: Partial<Record<AuthMethod, string>> = {
  oauth: 'Continue with Google',
  apple: 'Continue with Apple',
  passkey: 'Continue with a passkey',
};

const CODE_LENGTH = 6;
const DEMO_CODE = '123456';
const DEMO_EMAIL = 'demo@lightspark.com';
const DEMO_PHONE = '(415) 555-0132';
/** Focusing the empty field "autofills" the demo value after a beat, so the
 *  floating label glides up first, then the value lands — one-tap demo path. */
const PREFILL_DELAY_MS = 350;
const NOTIFICATION_DELAY_MS = 1000;
const FILL_STEP_MS = 25;
const FILL_SUBMIT_MS = 350;
const CODE_SUBMIT_MS = 350;

// Aurora-style nav push between the sign-in content and the confirm screen.
const STEP_TRANSITION = motionTransition(easeOutSnappy, 0.35);
type NavDir = { back: boolean; reduceMotion: boolean };
const stepVariants = {
  enter: ({ back, reduceMotion }: NavDir) =>
    reduceMotion ? { x: 0, opacity: 1 } : { x: back ? '-100%' : '100%', opacity: 1 },
  center: { x: 0, opacity: 1 },
  exit: ({ back, reduceMotion }: NavDir) =>
    reduceMotion ? { opacity: 0 } : { x: back ? '100%' : '-100%', opacity: 0 },
};

// Method toggles (Z's recipe): squares pop in/out with popLayout reflow; the
// input/divider/squares rows collapse their height when a group empties.
const TOGGLE = motionTransition(easeOutSnappy, 0.32);
const PRESS = motionTransition([0.22, 1, 0.36, 1], 0.28);
const SQUARE_HOVER = 66 / 62;
const SQUARE_PRESS = 70 / 62;
const PILL_HOVER = 1.02;
const PILL_PRESS = 1.04;
const SQUARE_HIDDEN = { opacity: 0, scale: 0.5, filter: 'blur(6px)' };
const SQUARE_SHOWN = { opacity: 1, scale: 1, filter: 'blur(0px)' };
const FORM_HIDDEN = { height: 0, marginBottom: 0, opacity: 0, filter: 'blur(6px)' };
const FORM_SHOWN = { height: 128, marginBottom: 16, opacity: 1, filter: 'blur(0px)' };
const OR_HIDDEN = { height: 0, marginBottom: 0, opacity: 0, filter: 'blur(6px)' };
const OR_SHOWN = { height: 19, marginBottom: 16, opacity: 1, filter: 'blur(0px)' };
const SQUARES_HIDDEN = { height: 0, opacity: 0, filter: 'blur(6px)' };
const SQUARES_SHOWN = { height: 62, opacity: 1, filter: 'blur(0px)' };

// Dismiss: content blur-fades out; the "Creating your account…" beat fades in.
const CONTENT_OUT = motionTransition(easeOutQuick, 0.5);
const CAPTION_DELAY_MS = 500;
const CAPTION_IN = motionTransition(easeOutQuick, 0.35);
const CAPTION_OUT = motionTransition(easeOutQuick, 0.28);
const CAPTION_HIDDEN = { opacity: 0, y: 10, filter: 'blur(8px)' };
const CAPTION_REST = { opacity: 1, y: 0, filter: 'blur(0px)' };

const SHAKE = { x: [0, 8, -8, 8, 0] };
const SHAKE_OPTS = { duration: 0.28, ease: 'linear' as const };

/** "patcapulong@gmail.com" → "p•••g@gmail.com" (the reference photo's mask). */
function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!domain || user.length < 2) return email;
  return `${user[0]}\u2022\u2022\u2022${user[user.length - 1]}@${domain}`;
}

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

/** Registers the permanent auth sheet with the presentation stage (must live
 *  under the provider, beside the stage). */
function SheetPresenter({ on }: { on: boolean }) {
  useRegisterSheet(on);
  return null;
}

function SquareButton({
  method,
  disabled,
  onClick,
}: {
  method: AuthMethod;
  disabled: boolean;
  onClick: () => void;
}) {
  const clip = useSquircleClip<HTMLButtonElement>({ figmaRadii: 12 });
  const Icon = SQUARE_ICONS[method];
  if (!Icon) return null;
  return (
    <motion.button
      key={method}
      type="button"
      className={styles.square}
      layout="position"
      initial={SQUARE_HIDDEN}
      animate={SQUARE_SHOWN}
      exit={SQUARE_HIDDEN}
      transition={TOGGLE}
      whileHover={disabled ? undefined : { scale: SQUARE_HOVER, transition: PRESS }}
      whileTap={disabled ? undefined : { scale: SQUARE_PRESS, transition: PRESS }}
      disabled={disabled}
      onClick={onClick}
      aria-label={SQUARE_LABELS[method]}
    >
      <span ref={clip.ref} style={clip.style} className={styles.squareFill}>
        <Icon size={24} />
      </span>
      <SquircleFocusHalo
        path={clip.path}
        width={clip.width}
        height={clip.height}
        className={styles.squareHalo}
      />
    </motion.button>
  );
}

/** The Continue CTA (Figma 2375:11749) — h50, r13, brand red. */
function ContinueButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  const clip = useSquircleClip<HTMLButtonElement>({ figmaRadii: 13 });
  return (
    <motion.button
      type="button"
      className={styles.continueBtn}
      ref={clip.ref}
      style={clip.style}
      disabled={disabled}
      onClick={onClick}
      whileHover={disabled ? undefined : { scale: PILL_HOVER, transition: PRESS }}
      whileTap={disabled ? undefined : { scale: PILL_PRESS, transition: PRESS }}
    >
      Continue
    </motion.button>
  );
}

/** "Try another way" grey pill pinned to the confirm screen's bottom. */
function TryAnotherWay({ onClick }: { onClick?: () => void }) {
  const clip = useSquircleClip<HTMLButtonElement>({ figmaRadii: 12 });
  return (
    <motion.button
      type="button"
      className={styles.tryAnother}
      ref={clip.ref}
      style={clip.style}
      onClick={onClick}
      whileHover={{ scale: PILL_HOVER, transition: PRESS }}
      whileTap={{ scale: PILL_PRESS, transition: PRESS }}
    >
      Try another way
    </motion.button>
  );
}

/**
 * Marketplace sign-in — an iOS pageSheet permanently presented over the zeroed
 * Wallet home (Figma 2375:11741). The sheet slides up on mount while the shared
 * PresentationStage scales the home back (the Glitch stacked-sheet mechanic).
 * The X is a no-op; the email/phone confirm screen (IMG_0614) pushes in from
 * the right INSIDE the sheet, Aurora-style. Flat — no glass except the shared
 * iOS notification.
 */
export function MarketplaceAuthScreen({
  busy,
  methods,
  dismissed = false,
  leaving = false,
  onSignIn,
}: SkinAuthScreenProps) {
  const reduceMotion = useReducedMotion();
  const flow = useAuthFlow();

  // The sheet is ALREADY presented on arrival (no slide-up on load — you land
  // on the login sheet, wallet receded behind it); it only animates for the
  // post-sign-in dismissal below.
  const [sheetOn, setSheetOn] = useState(true);

  // After the "Creating your account…" beat has had its moment, DISMISS the
  // sheet (slide down, stage un-scales, scrim fades) so the wallet layout is
  // already on screen when the shared auth → wallet swap fires — the swap then
  // lands on a matching screen instead of crossfading the sheet away. Timed so
  // the 0.5s dismissal finishes inside SignInFlow's 2.3s intro hold.
  useEffect(() => {
    if (!dismissed) return;
    const t = window.setTimeout(() => setSheetOn(false), 1700);
    return () => window.clearTimeout(t);
  }, [dismissed]);

  // Top corners match Aurora's wallet-sheet radius (Figma 40, squircle-scaled).
  const sheetClip = useSquircleClip<HTMLDivElement>({ figmaRadii: [40, 40, 0, 0] });

  const emailOn = methods.includes('email_otp');
  const phoneOn = methods.includes('sms');
  const hasForm = emailOn || phoneOn;
  const squares = SQUARE_ORDER.filter((m) => methods.includes(m));
  const inputLabel =
    emailOn && phoneOn ? 'Phone number or email' : phoneOn ? 'Phone number' : 'Email';

  // ── Entry value ───────────────────────────────────────────────────────────
  const [value, setValue] = useState('');
  const phoneish = phoneOn && (!emailOn || looksLikePhone(value));
  const handleChange = (raw: string) => setValue(phoneish && looksLikePhone(raw) ? formatUsPhone(raw) : raw);
  const validEmail = emailOn && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim());
  const validPhone = phoneOn && looksLikePhone(value) && value.replace(/\D/g, '').length === 10;
  const detected: AuthMethod | null = validPhone ? 'sms' : validEmail ? 'email_otp' : null;

  const prefillTimer = useRef(0);
  const handleFocus = () => {
    if (value.length > 0) return;
    window.clearTimeout(prefillTimer.current);
    prefillTimer.current = window.setTimeout(
      () => setValue((v) => (v.length === 0 ? (emailOn ? DEMO_EMAIL : DEMO_PHONE) : v)),
      PREFILL_DELAY_MS,
    );
  };
  useEffect(() => () => window.clearTimeout(prefillTimer.current), []);

  // ── Steps: entry ⇄ confirm (push) ─────────────────────────────────────────
  // `confirm` goes up when we hand the value to the flow; the flow's own
  // sending/codeActive keep it up (and cover a mid-flow skin switch).
  const [confirm, setConfirm] = useState(false);
  const step: 'entry' | 'code' =
    confirm || flow?.sending || flow?.codeActive ? 'code' : 'entry';
  const [back, setBack] = useState(false);
  const navDir: NavDir = { back, reduceMotion: !!reduceMotion };

  // A REMOUNTED screen (mid-flow skin switch) lands on the code step via the
  // flow alone — latch `confirm` so the post-verify choreography (which holds
  // the confirm screen through `dismissed`) matches a native run; without it,
  // the flow closing a beat before the dismissal reaches us flips the step to
  // entry mid-blur (a phantom push). `back` guards the moment right after a
  // Back press, when the store still shows the stale code step.
  useEffect(() => {
    if ((flow?.codeActive || flow?.sending) && !confirm && !back) setConfirm(true);
  }, [flow, confirm, back]);

  // The entry step is invisible in this skin: when the flow arms it, submit the
  // stashed value immediately — the visible beat is the push to the confirm
  // screen, which already happened on Continue. An armed entry with NO stash
  // means something backed the flow out (e.g. a skin switch mid-OTP) — slide
  // back to entry.
  useEffect(() => {
    if (!flow?.open || flow.codeActive || flow.sending) return;
    const stashed = takeAuthValue();
    if (stashed != null) {
      setBack(false);
      setConfirm(true);
      flow.onSubmit(stashed);
    } else if (confirm) {
      setBack(true);
      setConfirm(false);
      setCode('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flow]);

  // Flow closed by a cancel/reset → land back on entry. On SUCCESS the demo
  // logic also closes the flow, then breathes ~400ms before the wallet flip
  // raises `dismissed` — `submitted` marks that close as success so the
  // confirm screen holds through the gap and the dismissal blur plays over it,
  // not over a phantom push back to entry.
  useEffect(() => {
    if (!flow?.open && !dismissed && confirm && !submitted.current) {
      setConfirm(false);
      setCode('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flow?.open, dismissed]);

  const [entryScope, animateEntry] = useAnimate<HTMLDivElement>();
  const submitEntry = () => {
    if (dismissed || (busy && !(flow?.open && !flow.codeActive))) return;
    if (!detected) {
      if (!reduceMotion && entryScope.current) animateEntry(entryScope.current, SHAKE, SHAKE_OPTS);
      return;
    }
    const clean = value.trim();
    setBack(false);
    if (flow?.open && !flow.codeActive) {
      // Re-armed entry (the user came Back) — feed the waiting flow directly.
      setConfirm(true);
      flow.onSubmit(clean);
    } else {
      stashAuthValue(clean);
      onSignIn(detected);
    }
  };

  const goBack = () => {
    setBack(true);
    setConfirm(false);
    setCode('');
    if (flow?.codeActive) flow.onBack?.();
    else flow?.onCancel?.();
  };

  // ── Verification code ─────────────────────────────────────────────────────
  const [code, setCode] = useState('');
  const codeRef = useRef<HTMLInputElement>(null);
  const fillTimers = useRef<number[]>([]);
  const submitted = useRef(false);
  useEffect(() => {
    if (step === 'code' && flow?.codeActive) {
      submitted.current = false;
      codeRef.current?.focus({ preventScroll: true });
    }
  }, [step, flow?.codeActive]);
  useEffect(
    () => () => {
      for (const t of fillTimers.current) window.clearTimeout(t);
    },
    [],
  );

  // A full code auto-submits after a settle beat (no CTA on this screen).
  const finishCode = (c: string) => {
    if (submitted.current) return;
    submitted.current = true;
    if (reduceMotion) {
      flow?.onSubmitCode?.(c);
      return;
    }
    fillTimers.current.push(
      window.setTimeout(() => flow?.onSubmitCode?.(c), CODE_SUBMIT_MS),
    );
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
  // on the code step without it (the shared contracts don't carry the entry
  // value). Fall back to the method's demo default, which is what the other
  // skins prefill, so the recipient line never reads "sent a code to .".
  const maskSource =
    method === 'phone'
      ? value.replace(/\D/g, '').length === 10
        ? value.trim()
        : DEMO_PHONE
      : value.includes('@')
        ? value.trim()
        : DEMO_EMAIL;
  const masked = method === 'phone' ? maskUsPhone(maskSource) : maskEmail(maskSource);

  // No refraction copy: this app's surface is flat, so a copied backdrop gives
  // the lens nothing to bend (an all-white copy reads opaque on light). The
  // notification's frost path samples the REAL screen instead.
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

  // Hard mount-gate for the "Creating your account…" beat.
  const [captionOn, setCaptionOn] = useState(false);
  useEffect(() => {
    if (!dismissed) {
      setCaptionOn(false);
      return;
    }
    const t = window.setTimeout(() => setCaptionOn(true), CAPTION_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [dismissed]);

  const controlsDisabled = Boolean(busy) || dismissed;
  // After a Back, the session keeps running while the flow waits at the (invisible)
  // entry step — `busy` stays true, but the input + Continue ARE that entry step,
  // so they must stay live to feed it.
  const entryArmed = Boolean(flow?.open && !flow.codeActive && !flow.sending);
  const formDisabled = dismissed || (Boolean(busy) && !entryArmed);

  return (
    <div className={styles.root}>
      <SheetPresentationProvider>
        <PresentationStage
          className={styles.stage}
          offset={62}
          duration={MARKETPLACE_SHEET_DURATION}
          // The receded wallet card matches the sheet's 40px corners (visually
          // smaller once the card scales to 0.92, like iOS).
          radius={figmaSquircleRadius(40)}
        >
          {/* The zeroed wallet behind the sign-in — never interactive, never
              readable once the sheet is up (pointer events off in CSS). */}
          <div className={styles.backdropHome} aria-hidden>
            <MarketplaceHomeContent
              balanceCents={0}
              apyPercent={EARNINGS_APY_PERCENT}
              rewardsMonthCents={0}
            />
            <MarketplaceTabBar />
          </div>
        </PresentationStage>
        <SheetPresenter on={sheetOn} />

        {/* The presentation scrim — in the shared system this comes from
            BottomSheet; this permanent skin-local sheet carries its own,
            on the same --sheet-scrim token. */}
        <motion.div
          className={styles.scrim}
          aria-hidden
          initial={false}
          animate={{ opacity: sheetOn ? 1 : 0 }}
          transition={{ duration: MARKETPLACE_SHEET_DURATION, ease: 'easeOut' }}
        />

        <motion.div
          className={styles.sheetLayer}
          initial={false}
          animate={{ y: sheetOn ? 0 : '110%' }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : motionTransition(easeOutSnappy, MARKETPLACE_SHEET_DURATION)
          }
        >
          <div ref={sheetClip.ref} style={sheetClip.style} className={styles.sheet}>
            <motion.div
              className={styles.sheetInner}
              initial={false}
              animate={{
                opacity: dismissed ? 0 : 1,
                filter: dismissed ? 'blur(12px)' : 'blur(0px)',
              }}
              transition={CONTENT_OUT}
              style={{ pointerEvents: dismissed ? 'none' : 'auto' }}
            >
              <div className={styles.sheetHeader}>
                <span className={styles.headerSlot}>
                  <AnimatePresence initial={false}>
                    {step === 'code' && (
                      <motion.button
                        key="back"
                        type="button"
                        className={styles.headerBtn}
                        aria-label="Back"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={motionTransition(easeOutQuick, 0.2)}
                        onClick={goBack}
                      >
                        <IconArrowLeft size={24} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </span>
                {/* The X is deliberately a no-op — sign-in can't be dismissed. */}
                <button type="button" className={styles.headerBtn} aria-label="Close">
                  <IconCrossMedium size={24} />
                </button>
              </div>

              <div className={styles.steps}>
                <AnimatePresence initial={false} custom={navDir}>
                  {step === 'entry' ? (
                    <motion.div
                      key="entry"
                      className={styles.step}
                      custom={navDir}
                      variants={stepVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={STEP_TRANSITION}
                    >
                      <div className={styles.entryContent}>
                        <MarketplaceLogo size={78} className={styles.logo} />
                        <div className={styles.entryBlock}>
                          <h1 className={styles.heading}>{MARKETPLACE_AUTH.heading}</h1>
                          <div className={styles.cluster}>
                            <AnimatePresence initial={false}>
                              {hasForm && (
                                <motion.div
                                  key="form"
                                  className={styles.formRow}
                                  initial={FORM_HIDDEN}
                                  animate={FORM_SHOWN}
                                  exit={FORM_HIDDEN}
                                  transition={TOGGLE}
                                >
                                  <div className={styles.formInner} ref={entryScope}>
                                    <FloatingLabelInput
                                      label={inputLabel}
                                      value={value}
                                      onChange={handleChange}
                                      onEnter={submitEntry}
                                      onFocus={handleFocus}
                                      disabled={formDisabled}
                                      inputProps={{
                                        type: 'text',
                                        inputMode: emailOn ? 'email' : 'tel',
                                        autoComplete: emailOn ? 'email' : 'tel',
                                      }}
                                    />
                                    <ContinueButton disabled={formDisabled} onClick={submitEntry} />
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <AnimatePresence initial={false}>
                              {hasForm && squares.length > 0 && (
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

                            <AnimatePresence initial={false}>
                              {squares.length > 0 && (
                                <motion.div
                                  key="squares"
                                  className={styles.squares}
                                  initial={SQUARES_HIDDEN}
                                  animate={SQUARES_SHOWN}
                                  exit={SQUARES_HIDDEN}
                                  transition={TOGGLE}
                                >
                                  <AnimatePresence initial={false} mode="popLayout">
                                    {squares.map((m) => (
                                      <SquareButton
                                        key={m}
                                        method={m}
                                        disabled={controlsDisabled}
                                        onClick={() => onSignIn(m)}
                                      />
                                    ))}
                                  </AnimatePresence>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
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
                      <div className={styles.confirmContent}>
                        <h1 className={styles.confirmTitle}>Confirm it&rsquo;s you</h1>
                        <p className={styles.confirmSub}>We sent a code to {masked}.</p>
                        <CodeField
                          code={code}
                          inputRef={codeRef}
                          disabled={!flow?.codeActive || submitted.current}
                          onChange={handleCode}
                          onTap={autofill}
                        />
                        <p className={styles.resendRow}>
                          Didn&rsquo;t get it?{' '}
                          <button type="button" className={styles.resendLink}>
                            Send a new code
                          </button>
                        </p>
                        <div className={styles.confirmSpacer} />
                        <TryAnotherWay onClick={goBack} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
                  <MarketplaceLogo size={64} />
                  <span className={styles.creatingLabel}>{MARKETPLACE_AUTH.creating}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </SheetPresentationProvider>

      {overlayEl ? createPortal(notification, overlayEl) : notification}
    </div>
  );
}

/** One bordered rounded field holding six dash → digit slots (IMG_0614). */
function CodeField({
  code,
  inputRef,
  disabled,
  onChange,
  onTap,
}: {
  code: string;
  inputRef: RefObject<HTMLInputElement>;
  disabled: boolean;
  onChange: (raw: string) => void;
  onTap: () => void;
}) {
  const clip = useSquircleClip<HTMLDivElement>({ figmaRadii: 12 });
  return (
    <div
      className={styles.codeShell}
      onClick={() => {
        onTap();
        inputRef.current?.focus({ preventScroll: true });
      }}
    >
      <div ref={clip.ref} style={clip.style} className={styles.codeClip}>
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
          <span
            key={i}
            className={styles.codeSlot}
            data-filled={code[i] !== undefined || undefined}
            data-active={(i === Math.min(code.length, CODE_LENGTH - 1) && !disabled) || undefined}
          >
            {code[i] ?? '\u2013'}
          </span>
        ))}
      </div>
      <SquircleFocusHalo
        path={clip.path}
        width={clip.width}
        height={clip.height}
        className={styles.codeHalo}
      />
    </div>
  );
}
