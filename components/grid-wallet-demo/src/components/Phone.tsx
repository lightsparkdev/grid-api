'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import clsx from 'clsx';
import type { AuthMethod, Persona, PhoneState } from '@/data/flow';
import { authCta } from '@/data/flow';
import type { WalletEntry, WalletTransferMode } from '@/apps/aurora/wallet';
import type { ExternalAccountInput, ReceivePaymentInfo, TransferDest } from '@/data/apiCalls';
import {
  APPLE_CLIENT_ID,
  appleRedirectUri,
  GOOGLE_CLIENT_ID,
  loadAppleAuth,
  loadGis,
} from '@/lib/auth';
import { formatUsPhone } from '@/lib/phoneFormat';
import type { ActionId, WalletState } from '@/data/actions';
import {
  PHONE_FIT_PAD_BLOCK,
  PHONE_FIT_PAD_INLINE,
} from '@/apps/shared/AppShell/usePhoneFitScale';
import styles from './Phone.module.scss';

export const PHONE_BRAND: Record<Persona, { name: string; tag: string }> = {
  fintech: { name: 'Aurora', tag: 'Your money, everywhere' },
  social: { name: 'Pulse', tag: 'Get paid to post' },
  marketplace: { name: 'Bazaar', tag: 'Buy and sell anywhere' },
};

const DEVICE_W = 300;
const DEVICE_H = 614;

function useFitScale() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const compute = () => {
      const availW = el.clientWidth - PHONE_FIT_PAD_INLINE * 2;
      const availH = el.clientHeight - PHONE_FIT_PAD_BLOCK * 2;
      const s = Math.min(1, availW / DEVICE_W, availH / DEVICE_H);
      setScale(s > 0 ? s : 1);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { wrapRef, scale };
}

export interface PhoneProps {
  phone: PhoneState;
  wallet: WalletState;
  persona: Persona;
  method: AuthMethod;
  /** Method chosen on swag auth buttons (falls back to `method`). */
  signInMethod?: AuthMethod;
  onAction: (id: ActionId) => void;
  /** `popup` = a real provider popup already opened inside the tap gesture
   *  (the aurora Google/Apple CTAs) — the sign-in flow awaits it. */
  onSignInWithMethod?: (method: AuthMethod, popup?: Promise<string>) => void;
  busy: boolean;
  /** A provider popup is pending — aurora suppresses its busy look so the
   *  phone stays exactly as it is while the popup is open. */
  popupWait?: boolean;
  passkey?: { active: boolean; onConfirm: () => void; onCancel: () => void };
  faceId?: { active: boolean; onDone: () => void };
  otp?: {
    active: boolean;
    onSubmit: (code: string) => void;
    onCancel?: () => void;
    onBack?: () => void;
  };
  email?: { active: boolean; onSubmit: (email: string) => void; onCancel?: () => void };
  /** Phone-number entry (the SMS flow's first step) — mirrors `email`. */
  phoneEntry?: { active: boolean; onSubmit: (number: string) => void; onCancel?: () => void };
  google?: { nonce: string | null; onCredential: (idToken: string) => void };
  apple?: { nonce: string | null; onCredential: (idToken: string) => void };
  amount?: {
    config: { title: string; cta: string; source: string; sub: string; defaultDollars: number } | null;
    onSubmit: (dollars: number) => void;
    onCancel: () => void;
  };
  /** Auth methods selected in Configure — drives which aurora auth CTAs show. */
  methods?: AuthMethod[];
  /** Jump command for the aurora wallet (sidebar → provision + open a flow). */
  walletEntry?: WalletEntry;
  /** Skip the sign-in intro hold for fast-forward jumps. */
  skipIntro?: boolean;
  /** Aurora wallet events bubbled up so the demo logs the matching Grid calls. */
  onQuoteCreate?: (mode: WalletTransferMode, cents: number, dest?: TransferDest) => void;
  onLinkExternalAccount?: (input: ExternalAccountInput, label: string) => void;
  onTransferExecute?: (mode: WalletTransferMode, cents: number) => void;
  onCardIssued?: () => void;
  onTapToPay?: (cents: number, merchant: string) => void;
  onReceivePayment?: (info: ReceivePaymentInfo) => void;
}

export default function Phone({
  phone,
  wallet,
  persona,
  method,
  onAction,
  busy,
  otp,
  email,
  phoneEntry,
  google,
  apple,
  amount,
}: PhoneProps) {
  const brand = PHONE_BRAND[persona];
  const { wrapRef, scale } = useFitScale();
  const act = (id: ActionId) => {
    if (!busy) onAction(id);
  };
  return (
    <div className={styles.deviceWrap} ref={wrapRef}>
      <div className={styles.device} style={{ transform: `scale(${scale})` }}>
        <div className={styles.island} />
        <div className={styles.screen}>
          <StatusBar />
          <div className={styles.screenBody}>
            <AnimatePresence mode="wait">
              <motion.div
                key={
                  email?.active
                    ? 'email-entry'
                    : phoneEntry?.active
                      ? 'phone-entry'
                      : otp?.active
                        ? 'otp-entry'
                        : google?.nonce
                          ? 'google-signin'
                          : apple?.nonce
                            ? 'apple-signin'
                            : amount?.config
                              ? 'amount-entry'
                              : phone.screen + phone.balance + String(phone.cardActivated)
                }
                className={styles.screenInner}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                {email?.active ? (
                  <EmailEntryScreen brand={brand} onSubmit={email.onSubmit} />
                ) : phoneEntry?.active ? (
                  <PhoneEntryScreen brand={brand} onSubmit={phoneEntry.onSubmit} />
                ) : otp?.active ? (
                  <OtpEntryScreen onSubmit={otp.onSubmit} />
                ) : google?.nonce ? (
                  <GoogleSignInScreen nonce={google.nonce} onCredential={google.onCredential} />
                ) : apple?.nonce ? (
                  <AppleSignInScreen nonce={apple.nonce} onCredential={apple.onCredential} />
                ) : amount?.config ? (
                  <AmountEntryScreen
                    config={amount.config}
                    onSubmit={amount.onSubmit}
                    onCancel={amount.onCancel}
                  />
                ) : (
                  render(phone, wallet, brand, method, act, busy)
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className={styles.homeIndicator}>
            <span />
          </div>
        </div>
      </div>
    </div>
  );
}

function render(
  phone: PhoneState,
  wallet: WalletState,
  brand: { name: string; tag: string },
  method: AuthMethod,
  act: (id: ActionId) => void,
  busy: boolean,
) {
  switch (phone.screen) {
    case 'auth':
      return <AuthScreen brand={brand} method={method} act={act} busy={busy} />;
    case 'creating':
      return <CreatingScreen brand={brand} note={phone.note} />;
    case 'credential':
      return <CredentialScreen method={method} />;
    case 'addmoney':
      return <AmountScreen title="Add money" amount="$5,000.00" cta="Confirm" source="Bank account" sub="•••• 3872 · Instant" />;
    case 'withdraw':
      return <AmountScreen title="Withdraw" amount="$200.00" cta="Confirm" source="Bank account" sub="•••• 3872 · Instant" />;
    case 'send':
      return <AmountScreen title="Send" amount="$250.00" cta="Send" source="$leo@grid.app" sub="UMA address · Instant" />;
    case 'card-reveal':
      return <CardReveal brand={brand} />;
    case 'tap':
      return <TapScreen activated={phone.cardActivated} />;
    default:
      return <WalletScreen phone={phone} wallet={wallet} brand={brand} act={act} busy={busy} />;
  }
}

/* ----------------------------- Auth ----------------------------- */
function AuthScreen({
  brand,
  method,
  act,
  busy,
}: {
  brand: { name: string; tag: string };
  method: AuthMethod;
  act: (id: ActionId) => void;
  busy: boolean;
}) {
  return (
    <div className={styles.authScreen}>
      <div className={styles.authTop}>
        <div className={styles.brandMark}>{brand.name.charAt(0)}</div>
        <div className={styles.brandName}>{brand.name}</div>
        <div className={styles.brandTag}>{brand.tag}</div>
      </div>
      <div className={styles.authBottom}>
        <button className={styles.btnFill} onClick={() => act('create')} disabled={busy}>
          <AuthGlyph method={method} />
          {authCta(method)}
        </button>
        <div className={styles.authFine}>
          Global account · powered by <strong>Grid</strong>
        </div>
      </div>
    </div>
  );
}

export function CreatingScreen({ brand, note }: { brand: { name: string; tag: string }; note?: string }) {
  return (
    <div className={styles.centerScreen}>
      <div className={styles.brandMark}>{brand.name.charAt(0)}</div>
      <div className={styles.spinner} />
      <div className={styles.centerNote}>{note ?? 'Setting up your account…'}</div>
    </div>
  );
}

export function CredentialScreen({ method }: { method: AuthMethod }) {
  const isOtp = method === 'email_otp' || method === 'sms';
  return (
    <div className={styles.centerScreen}>
      <div className={styles.bioSheet}>
        {method === 'passkey' && (
          <>
            <FaceId />
            <div className={styles.bioTitle}>Create passkey?</div>
            <div className={styles.bioSub}>Use Face ID or Touch ID to sign in</div>
          </>
        )}
        {method === 'oauth' && (
          <>
            <GoogleG large />
            <div className={styles.bioTitle}>Continue as Ava</div>
            <div className={styles.bioSub}>ava@example.com</div>
          </>
        )}
        {method === 'apple' && (
          <>
            <Apple large />
            <div className={styles.bioTitle}>Continue with Apple</div>
            <div className={styles.bioSub}>ava@icloud.com</div>
          </>
        )}
        {isOtp && (
          <>
            <div className={styles.bioTitle}>Enter the code</div>
            <div className={styles.bioSub}>
              {method === 'sms' ? 'Sent to +1 415 ••• 0148' : 'Sent to ava@example.com'}
            </div>
            <div className={styles.otpRow}>
              {['1', '2', '3', '4', '5', '6'].map((d, i) => (
                <span key={i} className={styles.otpBox}>
                  {d}
                </span>
              ))}
            </div>
          </>
        )}
        <button className={clsx(styles.btnFill, styles.btnCompact)}>{isOtp ? 'Verify' : 'Confirm'}</button>
      </div>
    </div>
  );
}

/** Email entry — the user types the address their OTP is "sent" to. */
export function EmailEntryScreen({
  brand,
  onSubmit,
}: {
  brand: { name: string; tag: string };
  onSubmit: (email: string) => void;
}) {
  const [email, setEmail] = useState('');
  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
  const submit = () => {
    if (valid) onSubmit(email.trim());
  };
  return (
    <div className={styles.centerScreen}>
      <div className={styles.bioSheet}>
        <div className={styles.brandMark}>{brand.name.charAt(0)}</div>
        <div className={styles.bioTitle}>Sign in to {brand.name}</div>
        <div className={styles.bioSub}>Enter your email to get a code</div>
        <input
          value={email}
          type="email"
          inputMode="email"
          autoFocus
          placeholder="you@example.com"
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          style={{
            width: '210px',
            textAlign: 'center',
            fontSize: 16,
            padding: '11px 12px',
            borderRadius: 12,
            border: '1px solid var(--p-separator)',
            background: 'var(--p-surface-2)',
            color: 'var(--p-text)',
            outline: 'none',
            caretColor: 'var(--p-accent)',
          }}
        />
        <button className={clsx(styles.btnFill, styles.btnCompact)} disabled={!valid} onClick={submit}>
          Continue
        </button>
      </div>
    </div>
  );
}

/** Phone-number entry — the SMS flow's mirror of EmailEntryScreen. */
export function PhoneEntryScreen({
  brand,
  onSubmit,
}: {
  brand: { name: string; tag: string };
  onSubmit: (number: string) => void;
}) {
  const [number, setNumber] = useState('');
  const valid = number.replace(/\D/g, '').length === 10;
  const submit = () => {
    if (valid) onSubmit(number);
  };
  return (
    <div className={styles.centerScreen}>
      <div className={styles.bioSheet}>
        <div className={styles.brandMark}>{brand.name.charAt(0)}</div>
        <div className={styles.bioTitle}>Sign in to {brand.name}</div>
        <div className={styles.bioSub}>Enter your number to get a code</div>
        <input
          value={number}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          autoFocus
          placeholder="(555) 555-0123"
          onChange={(e) => setNumber(formatUsPhone(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          style={{
            width: '210px',
            textAlign: 'center',
            fontSize: 16,
            padding: '11px 12px',
            borderRadius: 12,
            border: '1px solid var(--p-separator)',
            background: 'var(--p-surface-2)',
            color: 'var(--p-text)',
            outline: 'none',
            caretColor: 'var(--p-accent)',
          }}
        />
        <button className={clsx(styles.btnFill, styles.btnCompact)} disabled={!valid} onClick={submit}>
          Continue
        </button>
      </div>
    </div>
  );
}

/** Interactive OTP entry — pauses the flow until the user submits a code. */
export function OtpEntryScreen({ onSubmit }: { onSubmit: (code: string) => void }) {
  const [code, setCode] = useState('');
  const submitted = useRef(false);
  const fire = (c: string) => {
    if (c.length === 6 && !submitted.current) {
      submitted.current = true;
      onSubmit(c);
    }
  };
  return (
    <div className={styles.centerScreen}>
      <div className={styles.bioSheet}>
        <div className={styles.bioTitle}>Enter the code</div>
        <div className={styles.bioSub}>Sent to your email</div>
        <div className={styles.bioSub}>Sandbox code is 000000</div>
        <input
          value={code}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          autoFocus
          placeholder="000000"
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '').slice(0, 6);
            setCode(v);
            if (v.length === 6) setTimeout(() => fire(v), 0);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') fire(code);
          }}
          style={{
            width: '170px',
            textAlign: 'center',
            letterSpacing: '0.42em',
            fontSize: '22px',
            fontVariantNumeric: 'tabular-nums',
            padding: '12px 14px',
            borderRadius: '14px',
            border: '1px solid var(--p-separator)',
            background: 'var(--p-surface-2)',
            color: 'var(--p-text)',
            outline: 'none',
            caretColor: 'var(--p-accent)',
          }}
        />
        <button className={clsx(styles.btnFill, styles.btnCompact)} onClick={() => fire(code)}>
          Verify
        </button>
      </div>
    </div>
  );
}

/** Renders Google's official Sign-in button and resolves with the id_token. */
export function GoogleSignInScreen({
  nonce,
  onCredential,
}: {
  nonce: string;
  onCredential: (idToken: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fired = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadGis()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        const google = (window as any).google;
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          nonce,
          callback: (resp: { credential?: string }) => {
            if (resp?.credential && !fired.current) {
              fired.current = true;
              onCredential(resp.credential);
            }
          },
        });
        google.accounts.id.renderButton(containerRef.current, {
          theme: 'filled_blue',
          size: 'large',
          type: 'standard',
          text: 'continue_with',
          shape: 'pill',
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [nonce, onCredential]);

  return (
    <div className={styles.centerScreen}>
      <div className={styles.bioSheet}>
        <GoogleG large />
        <div className={styles.bioTitle}>Continue with Google</div>
        <div className={styles.bioSub}>Choose your Google account</div>
        <div
          ref={containerRef}
          style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
        />
      </div>
    </div>
  );
}

/** Launches Sign in with Apple JS and resolves with the id_token. */
export function AppleSignInScreen({
  nonce,
  onCredential,
}: {
  nonce: string;
  onCredential: (idToken: string) => void;
}) {
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fired = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadAppleAuth()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) setError('Apple sign-in is unavailable.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = async () => {
    if (!ready || fired.current || busy) return;
    setBusy(true);
    setError(null);
    try {
      const AppleID = (window as any).AppleID;
      AppleID.auth.init({
        clientId: APPLE_CLIENT_ID,
        scope: 'name email',
        redirectURI: appleRedirectUri(),
        state: `grid-demo-${nonce.slice(0, 16)}`,
        nonce,
        usePopup: true,
      });
      const response = await AppleID.auth.signIn();
      const idToken = response?.authorization?.id_token;
      if (!idToken) throw new Error('Apple did not return an identity token.');
      fired.current = true;
      onCredential(idToken);
    } catch (e: any) {
      setError(e?.error || e?.message || 'Apple sign-in was cancelled.');
      setBusy(false);
    }
  };

  return (
    <div className={styles.centerScreen}>
      <div className={styles.bioSheet}>
        <Apple large />
        <div className={styles.bioTitle}>Continue with Apple</div>
        <div className={styles.bioSub}>Use your Apple Account</div>
        <button
          className={clsx(styles.btnFill, styles.appleSigninButton)}
          disabled={!ready || busy}
          onClick={signIn}
        >
          <Apple />
          {busy ? 'Waiting for Apple…' : 'Continue with Apple'}
        </button>
        {error && <div className={styles.authError}>{error}</div>}
      </div>
    </div>
  );
}

function AuthGlyph({ method }: { method: AuthMethod }) {
  if (method === 'oauth') return <GoogleG />;
  if (method === 'apple') return <Apple />;
  if (method === 'passkey') return <KeyIcon />;
  if (method === 'sms') return <PhoneIcon />;
  return <MailIcon />;
}

/* ----------------------------- Wallet (bread) ----------------------------- */
function WalletScreen({
  phone,
  wallet,
  brand,
  act,
  busy,
}: {
  phone: PhoneState;
  wallet: WalletState;
  brand: { name: string; tag: string };
  act: (id: ActionId) => void;
  busy: boolean;
}) {
  const hasFunds = wallet.balanceCents > 0;
  return (
    <div className={styles.wallet}>
      <div className={styles.walletNav}>
        <span className={styles.walletBrand}>{brand.name}</span>
        <span className={styles.avatar}>A</span>
      </div>

      <div className={styles.balanceBlock}>
        <div className={styles.balanceLabel}>Total Balance</div>
        <div className={styles.balanceValue}>
          <Balance value={phone.balance} />
        </div>
        {hasFunds && (
          <div className={styles.changeRow}>
            <span className={styles.deltaUp}>+ {phone.balance}</span>
            <span className={styles.deltaChip}>Today</span>
          </div>
        )}
        <BarChart active={hasFunds} />
      </div>

      <div className={styles.actionRow}>
        <Action icon={<Plus />} label="Add" onClick={() => act('add')} disabled={busy} />
        <Action icon={<SendGlyph />} label="Send" onClick={() => act('send')} disabled={busy || !hasFunds} />
        <Action icon={<ArrowDown />} label="Cash out" onClick={() => act('withdraw')} disabled={busy || !hasFunds} />
      </div>

      {wallet.hasCard ? (
        <button className={styles.cardHero} onClick={() => act('tap')} disabled={busy}>
          <VisaCard mark={brand.name.charAt(0)} />
          <span className={styles.cardHint}>Tap to pay →</span>
        </button>
      ) : (
        <button className={styles.issueCard} onClick={() => act('card')} disabled={busy}>
          <span className={styles.issueIcon}>
            <CardIcon />
          </span>
          <span className={styles.issueText}>
            <span className={styles.issueTitle}>Get a card</span>
            <span className={styles.issueSub}>Spend your balance anywhere</span>
          </span>
          <Chevron />
        </button>
      )}

      <div className={styles.activityHeader}>Activity</div>
      {phone.activity.length === 0 ? (
        <div className={styles.emptyActivity}>
          <div className={styles.emptyTitle}>Nothing here yet</div>
          <div className={styles.emptySub}>Add money to get started</div>
        </div>
      ) : (
        <div className={styles.txList}>
          {phone.activity.map((t, i) => (
            <div className={styles.txItem} key={i}>
              <span className={styles.txIcon}>
                {t.kind === 'coffee' ? <Coffee /> : t.kind === 'send' ? <SendGlyph /> : t.kind === 'card' ? <CardIcon /> : <Bank />}
              </span>
              <span className={styles.txDetails}>
                <span className={styles.txName}>{t.name}</span>
                <span className={styles.txSub}>{t.sub}</span>
              </span>
              <span className={clsx(styles.txAmount, t.positive && styles.pos)}>{t.amount}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AmountScreen({
  title,
  amount,
  cta,
  source,
  sub,
}: {
  title: string;
  amount: string;
  cta: string;
  source: string;
  sub: string;
}) {
  return (
    <div className={styles.amountScreen}>
      <div className={styles.amountNav}>
        <span className={styles.navClose}>✕</span>
        <span className={styles.amountTitle}>{title}</span>
        <span style={{ width: 18 }} />
      </div>
      <div className={styles.amountBig}>
        <Balance value={amount} large />
      </div>
      <div className={styles.sourceRow}>
        <span className={styles.srcIcon}>
          <Bank />
        </span>
        <span className={styles.txDetails}>
          <span className={styles.txName}>{source}</span>
          <span className={styles.txSub}>{sub}</span>
        </span>
        <Chevron />
      </div>
      <div className={styles.flexSpacer} />
      <button className={styles.btnFill}>{cta}</button>
    </div>
  );
}

/** Editable amount entry — the user types an amount and presses the button. */
export function AmountEntryScreen({
  config,
  onSubmit,
  onCancel,
}: {
  config: { title: string; cta: string; source: string; sub: string; defaultDollars: number };
  onSubmit: (dollars: number) => void;
  onCancel: () => void;
}) {
  const [val, setVal] = useState(String(config.defaultDollars));
  const dollars = Math.max(0, parseFloat(val) || 0);
  return (
    <div className={styles.amountScreen}>
      <div className={styles.amountNav}>
        <span className={styles.navClose} onClick={onCancel} style={{ cursor: 'pointer' }}>
          ✕
        </span>
        <span className={styles.amountTitle}>{config.title}</span>
        <span style={{ width: 18 }} />
      </div>
      <div className={styles.amountBig}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 44, fontWeight: 600 }}>$</span>
          <input
            value={val}
            inputMode="decimal"
            autoFocus
            onChange={(e) => setVal(e.target.value.replace(/[^0-9.]/g, ''))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && dollars > 0) onSubmit(dollars);
            }}
            style={{
              width: `${Math.max(2, val.length + 1)}ch`,
              maxWidth: 190,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: 'inherit',
              fontSize: 44,
              fontWeight: 600,
              caretColor: 'var(--p-accent)',
            }}
          />
        </div>
      </div>
      <div className={styles.sourceRow}>
        <span className={styles.srcIcon}>
          <Bank />
        </span>
        <span className={styles.txDetails}>
          <span className={styles.txName}>{config.source}</span>
          <span className={styles.txSub}>{config.sub}</span>
        </span>
        <Chevron />
      </div>
      <div className={styles.flexSpacer} />
      <button
        className={styles.btnFill}
        disabled={dollars <= 0}
        onClick={() => dollars > 0 && onSubmit(dollars)}
      >
        {config.cta}
      </button>
    </div>
  );
}

function TapScreen({ activated }: { activated: boolean }) {
  return (
    <div className={styles.tapScreen}>
      <VisaCard />
      {activated ? (
        <>
          <div className={styles.doneCircle}>
            <Check big />
          </div>
          <div className={styles.tapLabel}>Done · $7.32</div>
        </>
      ) : (
        <>
          <div className={styles.readerCircle}>
            <Contactless />
          </div>
          <div className={styles.tapLabel}>Hold near reader</div>
        </>
      )}
    </div>
  );
}

function VisaCard({ mark = 'A' }: { mark?: string }) {
  return (
    <div className={styles.visaCard}>
      <span className={styles.visaGlow} />
      <span className={styles.visaSheen} />
      <div className={styles.visaTop}>
        <span className={styles.visaKind}>Debit</span>
        <span className={styles.visaMark}>{mark}</span>
      </div>
      <div className={styles.visaChip}>
        <span />
        <span />
        <span />
      </div>
      <div className={styles.visaBottom}>
        <span className={styles.visaNum}>•••• 8972</span>
        <span className={styles.visaLogo}>VISA</span>
      </div>
    </div>
  );
}

function CardReveal({ brand }: { brand: { name: string } }) {
  return (
    <div className={styles.reveal}>
      <motion.span
        className={styles.revealBeam}
        initial={{ opacity: 0, scaleY: 0.3 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      <motion.div
        className={styles.revealCard}
        initial={{ y: 80, scale: 0.8, opacity: 0, rotateX: 22 }}
        animate={{ y: 0, scale: 1, opacity: 1, rotateX: 0 }}
        transition={{ duration: 1.15, ease: [0.2, 0.8, 0.2, 1], delay: 0.12 }}
      >
        <VisaCard mark={brand.name.charAt(0)} />
      </motion.div>
      <motion.div
        className={styles.revealLabel}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.95, duration: 0.5 }}
      >
        Your card is ready
      </motion.div>
    </div>
  );
}

function Balance({ value, large }: { value: string; large?: boolean }) {
  const [whole, cents] = value.split('.');
  return (
    <span className={clsx(styles.bal, large && styles.balLarge)}>
      {whole}
      {cents && <span className={styles.balCents}>.{cents}</span>}
    </span>
  );
}

// Bread-style sparkline behind the balance.
const BAR_HEIGHTS = [
  30, 34, 28, 40, 36, 46, 38, 52, 44, 58, 50, 62, 48, 66, 56, 70, 60, 74, 64, 80, 70, 86, 76, 92,
];
function BarChart({ active }: { active: boolean }) {
  return (
    <div className={styles.chart} aria-hidden>
      {BAR_HEIGHTS.map((h, i) => (
        <span
          key={i}
          className={clsx(styles.bar, active && i >= BAR_HEIGHTS.length - 6 && styles.barHot)}
          style={{ height: `${active ? h : 22}%` }}
        />
      ))}
    </div>
  );
}

function Action({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button className={styles.action} onClick={onClick} disabled={disabled}>
      <span className={styles.actionIcon}>{icon}</span>
      <span className={styles.actionLabel}>{label}</span>
    </button>
  );
}

function StatusBar() {
  return (
    <div className={styles.statusBar}>
      <span className={styles.time}>9:41</span>
      <span className={styles.statusIcons}>
        <Signal />
        <Wifi />
        <Battery />
      </span>
    </div>
  );
}

/* ----------------------------- Icons ----------------------------- */
const s = (p: React.SVGProps<SVGSVGElement>) => ({
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...p,
});

const Plus = () => (
  <svg {...s({ width: 22, height: 22 })}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const SendGlyph = () => (
  <svg {...s({ width: 20, height: 20 })}>
    <path d="M7 17L17 7M9 7h8v8" />
  </svg>
);
const ArrowDown = () => (
  <svg {...s({ width: 22, height: 22 })}>
    <path d="M12 5v14M5 12l7 7 7-7" />
  </svg>
);
const CardIcon = () => (
  <svg {...s({ width: 20, height: 20 })}>
    <rect x="2" y="5" width="20" height="14" rx="2.5" />
    <path d="M2 10h20" />
  </svg>
);
const Bank = () => (
  <svg {...s({ width: 18, height: 18 })}>
    <path d="M3 10l9-6 9 6M5 10v8m4-8v8m6-8v8m4-8v8M3 21h18" />
  </svg>
);
const Coffee = () => (
  <svg {...s({ width: 18, height: 18 })}>
    <path d="M4 9h13v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9zM17 10h2a2 2 0 0 1 0 4h-2M7 4v2M11 4v2M15 4v2" />
  </svg>
);
const Chevron = () => (
  <svg {...s({ width: 18, height: 18, stroke: 'var(--p-text-3)' })}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);
const Check = ({ big }: { big?: boolean }) => (
  <svg {...s({ width: big ? 38 : 20, height: big ? 38 : 20, stroke: big ? '#fff' : 'var(--p-green)' })}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const KeyIcon = () => (
  <svg {...s({ width: 18, height: 18 })}>
    <circle cx="8" cy="8" r="5" />
    <path d="M11.5 11.5L20 20M16 16l2 2M14 18l2 2" />
  </svg>
);
const MailIcon = () => (
  <svg {...s({ width: 18, height: 18 })}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);
const PhoneIcon = () => (
  <svg {...s({ width: 18, height: 18 })}>
    <rect x="7" y="2" width="10" height="20" rx="2.5" />
    <path d="M11 18h2" />
  </svg>
);
const Apple = ({ large }: { large?: boolean }) => (
  <svg width={large ? 38 : 16} height={large ? 38 : 16} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.4 12.9c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.8-3.5.8s-1.8-.8-3-.8c-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.7 1.1 8.9.7 1.1 1.6 2.3 2.8 2.2 1.1 0 1.5-.7 2.9-.7s1.7.7 2.9.7 2-1.1 2.7-2.1c.9-1.2 1.2-2.4 1.2-2.5 0 0-2.3-.9-2.3-3.5zM14.2 6.3c.6-.8 1-1.8.9-2.9-.9 0-2 .6-2.6 1.3-.6.7-1.1 1.7-1 2.7 1 .1 2-.4 2.7-1.1z" />
  </svg>
);
const Contactless = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--p-green)" strokeWidth="2" strokeLinecap="round">
    <path d="M8 6a8 8 0 0 1 0 12M12 4a11 11 0 0 1 0 16M4 8a5 5 0 0 1 0 8" />
  </svg>
);
const FaceId = () => (
  <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="var(--p-green)" strokeWidth="1.6" strokeLinecap="round">
    <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
    <path d="M9 10v1M15 10v1M12 9v4l-1 1M9.5 15.5c1.5 1 3.5 1 5 0" />
  </svg>
);
const GoogleG = ({ large }: { large?: boolean }) => (
  <svg width={large ? 38 : 18} height={large ? 38 : 18} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2-1.9 3.3-4.7 3.3-7.8z" />
    <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2v2.8A11 11 0 0 0 12 23z" />
    <path fill="#FBBC05" d="M5.7 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2a11 11 0 0 0 0 9.8l3.7-2.8z" />
    <path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.2 1.6l3.1-3.1A11 11 0 0 0 2 7.1l3.7 2.8C6.6 7.4 9.1 5.4 12 5.4z" />
  </svg>
);
const Signal = () => (
  <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
    <rect x="0" y="7" width="3" height="4" rx="1" />
    <rect x="4.5" y="5" width="3" height="6" rx="1" />
    <rect x="9" y="3" width="3" height="8" rx="1" />
    <rect x="13.5" y="0" width="3" height="11" rx="1" />
  </svg>
);
const Wifi = () => (
  <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor">
    <path d="M8 11l2.3-2.9a3 3 0 0 0-4.6 0L8 11zM8 4.5a6.5 6.5 0 0 1 4.7 2l1.3-1.6a8.5 8.5 0 0 0-12 0L3.3 6.5A6.5 6.5 0 0 1 8 4.5z" />
  </svg>
);
const Battery = () => (
  <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
    <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="currentColor" opacity="0.4" />
    <rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor" />
    <rect x="23" y="4" width="1.5" height="4" rx="0.75" fill="currentColor" opacity="0.4" />
  </svg>
);
