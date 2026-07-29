'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { authCta, type AuthMethod } from '@/data/flow';
import { ContentAreaButton } from '@/apps/shared/ContentAreaButton';
import { AUTH_METHOD_ICONS, AUTH_METHOD_ORDER } from '@/apps/shared/authMethodIcons';
import { IconBubbleAnnotation3, IconLoadingCircle } from './icons';
import { useScreenOverlay } from '@/apps/shared/AppShell/ScreenOverlayContext';
import { PhoneStatusBar } from '@/apps/shared/AppShell/PhoneStatusBar';
import {
  GlassNotification,
  NOTIFICATION_INSET_PX,
  NOTIFICATION_TOP_PX,
} from '@/apps/shared/GlassNotification';
import { easeOutQuick, easeOutSnappy, motionTransition } from '@/lib/easing';
import { BANK_COUNTRIES, type BankCountry } from '@/data/bankCountries';
import type { SkinAuthScreenProps } from '@/apps/types';
import { WelcomeDoodle } from './blocks/WelcomeDoodle';
import {
  AUTH_METHODS,
  CodePage,
  CountryPage,
  EntryPage,
  type AuthPageMethod,
} from './AuthFlowPages';
import { dialCodeFor } from './dialCodes';
import { BRAND, MESSAGING_AUTH } from './config';
import styles from './MessagingAuthScreen.module.scss';

/* Dismiss: the whole welcome composition blur-fades out (the creator/ondemand
   grammar — no sleeve glide; the doodle is the hero, not a logo), then the
   creating caption fades in centered and the flow swaps screens. */
const CONTENT_OUT = motionTransition(easeOutQuick, 0.5);
const CONTENT_OUT_FAST = motionTransition(easeOutQuick, 0.15);
const CAPTION_DELAY_MS = 500;
const CAPTION_IN = motionTransition(easeOutQuick, 0.35);
const CAPTION_OUT = motionTransition(easeOutQuick, 0.28);
const CAPTION_HIDDEN = { opacity: 0, y: 10, filter: 'blur(8px)' };
const CAPTION_REST = { opacity: 1, y: 0, filter: 'blur(0px)' };

/* iOS nav push: pages slide in from the right while the screen beneath
   parallax-shifts left under a dim scrim (the marketplace clock). */
const PUSH_DURATION = 0.4;
const PUSH_PARALLAX = 120;
const PUSH_TRANSITION = motionTransition(easeOutSnappy, PUSH_DURATION);

/** Code step settles, then the notification swoops in. */
const NOTIFICATION_DELAY_MS = 1000;

/* Pushed pages leave two ways: backing out slides them off right (the nav
   pop), but a SUCCESSFUL sign-in blur-fades them in place — the flow is done,
   there's nothing to pop back to. The choice is read at exit time via
   AnimatePresence's `custom`. The TOP page (the code step) carries the
   visible fade; pages UNDER it vanish fast — they sit at the parallax offset,
   and a slow fade would read as ghost content hanging on the left. */
const PAGE_EXIT_VARIANTS = {
  exit: (fade: boolean) =>
    fade
      ? { opacity: 0, filter: 'blur(12px)', transition: CONTENT_OUT }
      : { x: '100%', transition: PUSH_TRANSITION },
};
const UNDER_PAGE_EXIT_VARIANTS = {
  exit: (fade: boolean) =>
    fade
      ? { opacity: 0, filter: 'blur(12px)', transition: CONTENT_OUT_FAST }
      : { x: '100%', transition: PUSH_TRANSITION },
};

/* Toggling an auth method in the Configure panel adds/removes its CTA —
   collapse the real height (+ the 12px gap) so the column reflows per frame. */
const CTA_TOGGLE = motionTransition(easeOutSnappy, 0.32);
const CTA_COLLAPSED = { height: 0, opacity: 0, marginBottom: 0, filter: 'blur(8px)' };
const CTA_SHOWN = { height: 'auto' as const, opacity: 1, marginBottom: 12, filter: 'blur(0px)' };

const US = BANK_COUNTRIES.find((c) => c.code === 'us') ?? BANK_COUNTRIES[0];

function AuthCta({
  method,
  primary,
  busy,
  dismissed,
  onSignIn,
}: {
  method: AuthMethod;
  primary: boolean;
  busy?: boolean;
  dismissed: boolean;
  onSignIn: (method: AuthMethod) => void;
}) {
  const Icon = AUTH_METHOD_ICONS[method];
  return (
    <motion.div
      className={styles.action}
      initial={CTA_COLLAPSED}
      animate={CTA_SHOWN}
      exit={CTA_COLLAPSED}
      transition={CTA_TOGGLE}
    >
      <ContentAreaButton
        variant={primary ? 'filled' : 'quaternary'}
        icon={<Icon size={24} />}
        disabled={busy || dismissed}
        onClick={() => onSignIn(method)}
      >
        {authCta(method)}
      </ContentAreaButton>
    </motion.div>
  );
}

/** ChatsApp auth — the WhatsApp welcome screen (IMG_0702) with the phone /
 *  email flows INLINE: full-screen iOS nav pushes (entry → country picker /
 *  verification code) instead of sheets. The flow arrives as the `authFlow`
 *  prop (`inlineAuthFlow: true` in the registry). */
export function MessagingAuthScreen({
  busy,
  methods: selectedMethods,
  dismissed = false,
  leaving = false,
  onSignIn,
  authFlow,
}: SkinAuthScreenProps) {
  const reduceMotion = useReducedMotion();
  // Honor the picker selection, in the ChatsApp order: phone leads (the green
  // primary — WhatsApp is phone-first), email under it, then the rest in the
  // canonical order.
  const methodOrder: AuthMethod[] = [
    'sms',
    'email_otp',
    ...AUTH_METHOD_ORDER.filter((id) => id !== 'sms' && id !== 'email_otp'),
  ];
  const methods = methodOrder.filter((id) => selectedMethods.includes(id));

  const method: AuthPageMethod = authFlow?.method ?? 'email';
  const cfg = AUTH_METHODS[method];
  const flowOpen = Boolean(authFlow?.open);
  const codeOpen = Boolean(authFlow?.codeActive);

  // Entry value — prefilled per method so Next is one tap; follows the method
  // when it changes (email prefill must not leak into the phone page).
  const [value, setValue] = useState(cfg.prefill);
  const [prevMethod, setPrevMethod] = useState(method);
  if (method !== prevMethod) {
    setPrevMethod(method);
    setValue(cfg.prefill);
  }

  // Country selector — skin-local (the demo corridor stays the US number;
  // the pick retints the row + dial code). Resets with the flow.
  const [country, setCountry] = useState<BankCountry>(US);
  const [countryOpen, setCountryOpen] = useState(false);
  // Set the instant the code submits — BEFORE the flow closes — so the pages
  // resolve their exit as the success fade, not the nav pop. (`dismissed`
  // lands a beat too late for this; the demo passes through the creating
  // stretch first.)
  const [completed, setCompleted] = useState(false);
  const [prevFlowOpen, setPrevFlowOpen] = useState(flowOpen);
  if (flowOpen !== prevFlowOpen) {
    setPrevFlowOpen(flowOpen);
    if (!flowOpen) setCountryOpen(false);
    if (flowOpen) setCompleted(false);
  }

  // Hard mount-gate for the caption: it does not EXIST until the content has
  // cleared, so it can never be seen early regardless of render timing.
  const [captionOn, setCaptionOn] = useState(false);
  useEffect(() => {
    if (!dismissed) {
      setCaptionOn(false);
      return;
    }
    const t = window.setTimeout(() => setCaptionOn(true), CAPTION_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [dismissed]);

  // The code-delivery notification (Mail / Messages) — swoops in a beat after
  // the code page lands; tapping it runs the code page's autofill.
  const overlayEl = useScreenOverlay();
  const [notifOn, setNotifOn] = useState(false);
  const notifTimer = useRef(0);
  const autofillRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    window.clearTimeout(notifTimer.current);
    if (codeOpen) {
      notifTimer.current = window.setTimeout(() => setNotifOn(true), NOTIFICATION_DELAY_MS);
    } else {
      setNotifOn(false);
    }
    return () => window.clearTimeout(notifTimer.current);
  }, [codeOpen]);

  // The notification's refraction copy — what's behind the capsule at the top
  // of the screen: the flat page background + the real status bar. WINDOWED to
  // the lens + the glass's 48px sampling bleed (WebKit's source-size ceiling).
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
        <PhoneStatusBar />
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
      onTap={() => {
        setNotifOn(false);
        autofillRef.current?.();
      }}
    />
  );

  // A pushed page sits over the entry page (fixed z-stack, scrims slotted
  // between — the marketplace in-page step stack).
  const overEntry = countryOpen || codeOpen;

  return (
    <div className={styles.root}>
      {/* Welcome — the base of the nav stack; parallax-shifts left while a
          page is pushed. A COMPLETED flow keeps it pinned (and fades it out
          below): nothing on screen moves through the success exit. */}
      <motion.div
        className={styles.underlay}
        initial={false}
        animate={{ x: (flowOpen || completed) && !reduceMotion ? -PUSH_PARALLAX : 0 }}
        transition={PUSH_TRANSITION}
      >
        <motion.div
          className={styles.content}
          initial={false}
          animate={{
            opacity: dismissed || completed ? 0 : 1,
            filter: dismissed || completed ? 'blur(12px)' : 'blur(0px)',
          }}
          // On a completed flow the welcome hides FAST — it's behind the
          // still-fading OTP page, and it's sitting at the pinned parallax
          // offset, so it must be gone before that offset could read.
          transition={completed ? CONTENT_OUT_FAST : CONTENT_OUT}
          style={{ pointerEvents: dismissed || completed || flowOpen ? 'none' : 'auto' }}
        >
          <div className={styles.hero}>
            <WelcomeDoodle className={styles.doodle} />
          </div>

          <div className={styles.copy}>
            <h1 className={styles.title}>{MESSAGING_AUTH.welcome}</h1>
            <p className={styles.legal}>
              Read our <span className={styles.legalLink}>Privacy Policy</span>. Tap
              &ldquo;Continue&rdquo; to accept the {BRAND}{' '}
              <span className={styles.legalLink}>Terms of Service</span>.
            </p>
          </div>

          <div className={styles.actions}>
            <AnimatePresence initial={false}>
              {methods.map((m, i) => (
                <AuthCta
                  key={m}
                  method={m}
                  primary={i === 0}
                  busy={busy}
                  dismissed={dismissed}
                  onSignIn={onSignIn}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      {/* "Signing you in..." — in after the content clears; out FIRST when
          the hold ends, before the screen reveal. OUTSIDE the underlay so the
          pinned parallax offset can't shift it off center. */}
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
            {/* Skin-local caption (Aurora's CreatingCaption is white-on-aurora
                — invisible on this paper-white page): the ChatsApp glyph over
                the spinner + label. */}
            <div className={styles.creatingGroup} role="status">
              <span className={styles.creatingLogo} aria-hidden>
                <IconBubbleAnnotation3 size={64} />
              </span>
              <span className={styles.creatingRow}>
                <span className={styles.creatingSpinner} aria-hidden>
                  <IconLoadingCircle size={16} />
                </span>
                <span className={styles.creatingText}>{MESSAGING_AUTH.creating}</span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The pushed flow — fixed z-indices with scrims slotted between levels
          (SKINS.md in-page step stack). `custom` feeds the exit-time choice:
          a completed sign-in fades the pages out instead of popping them. */}
      <AnimatePresence initial={false} custom={reduceMotion || completed}>
        {flowOpen && (
          <motion.div
            key="scrim-entry"
            className={styles.pushScrim}
            style={{ zIndex: 1 }}
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={PUSH_TRANSITION}
          />
        )}
        {flowOpen && (
          <motion.div
            key="page-entry"
            className={styles.pushPage}
            style={{ zIndex: 2 }}
            variants={UNDER_PAGE_EXIT_VARIANTS}
            initial={reduceMotion ? { opacity: 0 } : { x: '100%' }}
            animate={
              reduceMotion
                ? { opacity: 1 }
                : { x: overEntry ? -PUSH_PARALLAX : 0 }
            }
            exit="exit"
            transition={PUSH_TRANSITION}
          >
            <EntryPage
              method={method}
              country={country}
              value={value}
              sending={Boolean(authFlow?.sending)}
              onChange={setValue}
              onSubmit={() => authFlow?.onSubmit(value.trim())}
              onOpenCountry={() => setCountryOpen(true)}
              onBack={authFlow?.onCancel}
            />
          </motion.div>
        )}
        {flowOpen && overEntry && (
          <motion.div
            key="scrim-over-entry"
            className={styles.pushScrim}
            style={{ zIndex: 3 }}
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={PUSH_TRANSITION}
          />
        )}
        {flowOpen && countryOpen && !codeOpen && (
          <motion.div
            key="page-country"
            className={styles.pushPage}
            style={{ zIndex: 4 }}
            initial={reduceMotion ? { opacity: 0 } : { x: '100%' }}
            animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { x: '100%' }}
            transition={PUSH_TRANSITION}
          >
            <CountryPage
              selectedCode={country.code}
              onPick={(c) => {
                setCountry(c);
                setCountryOpen(false);
              }}
              onBack={() => setCountryOpen(false)}
            />
          </motion.div>
        )}
        {flowOpen && codeOpen && (
          <motion.div
            key="page-code"
            className={styles.pushPage}
            style={{ zIndex: 4 }}
            variants={PAGE_EXIT_VARIANTS}
            initial={reduceMotion ? { opacity: 0 } : { x: '100%' }}
            animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
            exit="exit"
            transition={PUSH_TRANSITION}
          >
            <CodePage
              method={method}
              // The FULL destination label (Mobbin): dial code + number for
              // phone, the address itself for email.
              destination={
                method === 'phone'
                  ? `${dialCodeFor(country.code)} ${value.trim()}`
                  : value.trim()
              }
              onSubmitCode={(code) => {
                setCompleted(true);
                authFlow?.onSubmitCode?.(code);
              }}
              onBack={authFlow?.onBack ?? authFlow?.onCancel}
              registerAutofill={(fn) => {
                autofillRef.current = fn;
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Above the status bar via AppShell's overlay (Face ID / toast slot). */}
      {overlayEl ? createPortal(notification, overlayEl) : notification}
    </div>
  );
}
