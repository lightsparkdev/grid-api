'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import type { AuthMethod, Persona, ScreenId, ApiCall, Tx } from '@/data/flow';
import { primaryAuthMethod } from '@/data/configure';
import {
  initialCompleted,
  initialWallet,
  phoneFromState,
  type ActionId,
  type CompletedFlows,
  type WalletState,
} from '@/data/actions';
import {
  cardCalls,
  oauthVerifyCall,
  otpRequestCall,
  otpVerifyCalls,
  receivePaymentCalls,
  tapCalls,
  transferQuoteCall,
  type ExternalAccountInput,
  type ReceivePaymentInfo,
  type TransferDest,
} from '@/data/apiCalls';
import { oauthNonce } from '@/lib/auth';
import { signIn as gridSignIn, ensureSession, clearSession, getAccount } from '@/lib/gridSession';
import { envelopeToApiCall } from '@/lib/gridEntry';
import { fetchBalanceCents, fetchActivity } from '@/lib/gridReads';
import { resolvePlatformUsdAccountId, sandboxFundPlatform, onRampQuoteBodyFor } from '@/lib/gridFunding';
import {
  ensureExternalAccount,
  createQuote,
  executeQuote,
  executeQuoteUnsigned,
  pollTransaction,
  quoteBodyFor,
} from '@/lib/gridTransfer';
import type { WalletEntry, WalletTransferMode } from '@/apps/aurora/wallet';
import type { Entry } from '@/components/ApiPanel/types';
import { SEED_API_PANEL, seedApiEntries } from '@/data/apiPanelSeed';

const TRANSFER_LABEL: Record<WalletTransferMode, string> = {
  add: 'Add money',
  withdraw: 'Withdraw',
  send: 'Send payment',
};

const newGroupId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/** Silent funding applied when a jumped-to flow needs a balance and there's none. */
const FAST_FORWARD_FUND_CENTS = 500_000;

/** A transfer's transaction settles a beat after execute, so calls land 1-by-1. */
const SETTLE_DELAY_MS = 650;

/** After a successful sandbox fund, one retry delay before giving up on the
 *  balance re-read (the money already landed either way — see onTransferExecute). */
const REFRESH_RETRY_DELAY_MS = 600;

interface Transient {
  screen: ScreenId;
  note?: string;
  activated?: boolean;
}

interface Session {
  method?: AuthMethod;
  email?: string;
  phone?: string;
  expiresAt?: number;
  loadedBalanceCents?: number;
  loadedActivity?: Tx[];
}

const SESSION_MS = 15 * 60 * 1000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Production demo: use case pinned to Fintech, sign-in pinned to passkey.
const PROD_AUTH_METHODS: AuthMethod[] = ['passkey'];

/**
 * Demo interaction logic — preserved for phase 2 UI wiring.
 * Returns the full surface area Phone / ApiPanel expect.
 */
export function useWalletDemoLogic() {
  const persona: Persona = 'fintech';
  const methods = PROD_AUTH_METHODS;
  const method = useMemo(() => primaryAuthMethod(methods), [methods]);
  const [wallet, setWallet] = useState<WalletState>(initialWallet);
  // Sticky sidebar checkmarks — "have you ever run this flow". Separate from
  // `wallet` so replaying "Sign in" (which resets the session wallet) keeps them;
  // only Reset wipes them.
  const [completed, setCompleted] = useState<CompletedFlows>(initialCompleted);
  const [entries, setEntries] = useState<Entry[]>(() =>
    SEED_API_PANEL ? seedApiEntries() : [],
  );
  const [transient, setTransient] = useState<Transient | null>(null);
  const [running, setRunning] = useState(false);

  const [signInMethod, setSignInMethod] = useState<AuthMethod | null>(null);
  const [passkeyActive, setPasskeyActive] = useState(false);
  const [faceIdActive, setFaceIdActive] = useState(false);
  const [otpActive, setOtpActive] = useState(false);
  const [emailActive, setEmailActive] = useState(false);
  const [phoneActive, setPhoneActive] = useState(false);
  const [gNonce, setGNonce] = useState<string | null>(null);
  const [aNonce, setANonce] = useState<string | null>(null);
  // A REAL provider popup is pending (aurora's Airbnb-model sign-in) — the
  // auth screen must NOT show a busy state while it's open (the phone stays
  // exactly as it is; `running` still guards re-entry underneath).
  const [popupWait, setPopupWait] = useState(false);

  // A jump command for the live Aurora wallet (provision + open a flow out of
  // order). Bumping its nonce makes the wallet apply it once.
  const [walletEntry, setWalletEntry] = useState<WalletEntry | undefined>(undefined);
  // Skip the sign-in intro hold when a fast-forward jump signs you in silently.
  const [skipIntro, setSkipIntro] = useState(false);
  // The in-flight transfer's group id — its create-quote and execute calls
  // stream into one API-panel group.
  const transferGroup = useRef<string | null>(null);
  const transferFundingCurrency = useRef<string | null>(null);
  // The most recently linked ExternalAccount id (real, from ensureExternalAccount) —
  // set once onLinkExternalAccount's real call resolves, consumed by the next
  // outbound onQuoteCreate. Only meaningful for withdraw/send.
  const pendingExternalAccountId = useRef<string | null>(null);
  // The just-created real quote (withdraw/send) — stashed here between
  // onQuoteCreate (create-quote beat) and onTransferExecute (Face ID confirm).
  const pendingQuote = useRef<{
    quoteId: string;
    payloadToSign: string | null;
    transactionId: string | null;
    idem: string;
  } | null>(null);
  // Pending "transaction settled" pushes (so execute and the GET land 1-by-1);
  // cleared on reset so a late push can't re-add a row to a wiped panel.
  const settleTimers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const session = useRef<Session>({});
  const passkeyPrompt = useRef<{ resolve: () => void; reject: (e: Error) => void } | null>(null);
  const faceIdPrompt = useRef<{ resolve: () => void; timer: ReturnType<typeof setTimeout> } | null>(
    null,
  );
  const otpPrompt = useRef<{ resolve: (c: string) => void; reject: (e: Error) => void } | null>(null);
  const emailPrompt = useRef<{ resolve: (e: string) => void; reject: (e: Error) => void } | null>(null);
  const phonePrompt = useRef<{ resolve: (n: string) => void; reject: (e: Error) => void } | null>(null);
  const googlePrompt = useRef<{ resolve: (t: string) => void; reject: (e: Error) => void } | null>(null);
  const applePrompt = useRef<{ resolve: (t: string) => void; reject: (e: Error) => void } | null>(null);

  const promptEmail = useCallback((): Promise<string> => {
    setEmailActive(true);
    return new Promise((resolve, reject) => (emailPrompt.current = { resolve, reject }));
  }, []);
  const submitEmail = useCallback((email: string) => {
    setEmailActive(false);
    const p = emailPrompt.current;
    emailPrompt.current = null;
    p?.resolve(email);
  }, []);
  const cancelEmail = useCallback(() => {
    setEmailActive(false);
    const p = emailPrompt.current;
    emailPrompt.current = null;
    p?.reject(new Error('cancelled'));
  }, []);
  const promptPhone = useCallback((): Promise<string> => {
    setPhoneActive(true);
    return new Promise((resolve, reject) => (phonePrompt.current = { resolve, reject }));
  }, []);
  const submitPhone = useCallback((number: string) => {
    setPhoneActive(false);
    const p = phonePrompt.current;
    phonePrompt.current = null;
    p?.resolve(number);
  }, []);
  const cancelPhone = useCallback(() => {
    setPhoneActive(false);
    const p = phonePrompt.current;
    phonePrompt.current = null;
    p?.reject(new Error('cancelled'));
  }, []);
  const cancelOtp = useCallback(() => {
    setOtpActive(false);
    const p = otpPrompt.current;
    otpPrompt.current = null;
    p?.reject(new Error('cancelled'));
  }, []);
  /** OTP step → back to the entry step (authenticate's OTP loop re-prompts). */
  const backOtp = useCallback(() => {
    // The live passkey bootstrap has no entry step to go back to — its OTP
    // prompt comes straight from gridSession.emailOtpAuth, which has no 'back'
    // retry loop (unlike the scripted email/sms methods below). Treat the
    // sheet's top control as a plain cancel here: reject 'cancelled' (which
    // signInWithMethod's catch already swallows silently) and do NOT arm the
    // email sheet, or the user is left on a dead entry screen with no prompt
    // in flight.
    if ((session.current.method ?? method) === 'passkey') {
      cancelOtp();
      return;
    }
    setOtpActive(false);
    // Re-arm the ACTIVE method's entry step IN THE SAME RENDER: the loop's
    // re-prompt arrives a beat later, and without this the sheet's `open`
    // (entry || otp) blips false for a frame — the dismiss animation starts
    // and the sheet visibly jumps as it recovers.
    if ((session.current.method ?? method) === 'sms') setPhoneActive(true);
    else setEmailActive(true);
    const p = otpPrompt.current;
    otpPrompt.current = null;
    p?.reject(new Error('back'));
  }, [method, cancelOtp]);

  const confirmPasskey = useCallback(() => {
    // Leave the sheet up — it stays through the credential ceremony (the passcode /
    // system passkey dialog) and only dismisses once that resolves, in the passkey
    // branch of `authenticate`.
    const p = passkeyPrompt.current;
    passkeyPrompt.current = null;
    p?.resolve();
  }, []);
  const cancelPasskey = useCallback(() => {
    setPasskeyActive(false);
    const p = passkeyPrompt.current;
    passkeyPrompt.current = null;
    p?.reject(new Error('cancelled'));
  }, []);

  const finishFaceId = useCallback(() => {
    const p = faceIdPrompt.current;
    faceIdPrompt.current = null;
    if (p) clearTimeout(p.timer);
    setFaceIdActive(false);
    p?.resolve();
  }, []);
  // Plays the iOS Face ID animation in the phone and resolves once it has run its
  // full course (the FaceIdAuth overlay calls finishFaceId on exit). A safety
  // timeout guarantees sign-in never hangs if the overlay is interrupted before it
  // can report done — otherwise `running` would stay true and lock every button.
  const playFaceId = useCallback((): Promise<void> => {
    setFaceIdActive(true);
    return new Promise((resolve) => {
      const timer = setTimeout(finishFaceId, 6000);
      faceIdPrompt.current = { resolve, timer };
    });
  }, [finishFaceId]);

  const promptOtp = useCallback((): Promise<string> => {
    setOtpActive(true);
    return new Promise((resolve, reject) => (otpPrompt.current = { resolve, reject }));
  }, []);
  const submitOtp = useCallback((code: string) => {
    setOtpActive(false);
    const p = otpPrompt.current;
    otpPrompt.current = null;
    p?.resolve(code);
  }, []);

  const promptGoogle = useCallback((nonce: string): Promise<string> => {
    setGNonce(nonce);
    return new Promise((resolve, reject) => (googlePrompt.current = { resolve, reject }));
  }, []);
  const submitGoogle = useCallback((token: string) => {
    setGNonce(null);
    const p = googlePrompt.current;
    googlePrompt.current = null;
    p?.resolve(token);
  }, []);

  const promptApple = useCallback((nonce: string): Promise<string> => {
    setANonce(nonce);
    return new Promise((resolve, reject) => (applePrompt.current = { resolve, reject }));
  }, []);
  const submitApple = useCallback((token: string) => {
    setANonce(null);
    const p = applePrompt.current;
    applePrompt.current = null;
    p?.resolve(token);
  }, []);

  const pushCalls = useCallback((calls: ApiCall[], groupLabel: string, groupId?: string) => {
    if (!calls?.length) return;
    const gid = groupId ?? newGroupId();
    const baseTime = Date.now();
    setEntries((prev) => [
      ...prev,
      ...calls.map((c, i) => ({
        ...c,
        key: `${baseTime}-${i}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: baseTime + i,
        groupId: gid,
        groupLabel,
      })),
    ]);
  }, []);

  // Turns each real Grid {request,response} envelope into a panel entry within
  // a named group, as the live sign-in flow fires its calls.
  const logEnvelope = useCallback(
    (groupLabel: string, groupId: string) => (env: import('@/lib/gridClient').GridEnvelope) => {
      pushCalls([envelopeToApiCall(env)], groupLabel, groupId);
    },
    [pushCalls],
  );

  // Guards the live sign-in call (gridSignIn) against concurrent invocation: a
  // second tap landing before `running` has re-rendered would otherwise fire a
  // second WebAuthn ceremony on top of the first (double passkey prompts).
  const signInInFlight = useRef(false);

  const startSession = useCallback(() => {
    session.current.expiresAt = Date.now() + SESSION_MS;
  }, []);

  const authenticate = useCallback(
    /**
     * `popup` is a REAL provider popup already opened by the CTA's tap
     * handler (popup blockers require the window to open inside the user
     * gesture, so the loop can't open it after an await). When absent,
     * oauth/apple fall back to the classic full-screen prompt with the
     * provider's own widget.
     */
    async (firstTime: boolean, popup?: Promise<string>) => {
      const m = session.current.method ?? method;
      if (m === 'email_otp' || m === 'sms') {
        // ONE loop for both OTP methods — only the entry prompt and the
        // session field differ. The OTP step can come BACK to the entry step
        // (the sheet's X): the prompt rejects with 'back' and the loop
        // re-prompts the entry.
        const field = m === 'sms' ? ('phone' as const) : ('email' as const);
        const promptEntry = m === 'sms' ? promptPhone : promptEmail;
        // Request + verify stream into ONE "Sign in" group as they actually fire.
        const gid = newGroupId();
        let needEntry = firstTime;
        for (;;) {
          if (needEntry || !session.current[field]) {
            session.current[field] = await promptEntry();
          }
          // Submitting the phone/email fires the OTP request right away.
          pushCalls([otpRequestCall(m, session.current[field])], 'Sign in', gid);
          setTransient({ screen: 'creating', note: 'Sending you a code…' });
          await sleep(600);
          try {
            await promptOtp();
            break;
          } catch (e) {
            if ((e as Error)?.message !== 'back') throw e;
            setTransient(null);
            needEntry = true;
          }
        }
        // Code accepted → verify fires; then let the sheet's dismiss VISIBLY
        // finish (transient clears first so the auth screen is back underneath
        // the departing sheet) before the wallet flip starts the intro.
        pushCalls(otpVerifyCalls(m), 'Sign in', gid);
        setTransient(null);
        await sleep(400);
      } else if (m === 'passkey') {
        // A sign-in is already live (e.g. a second tap landed before `running`
        // re-rendered) — never start a second WebAuthn ceremony on top of it.
        if (signInInFlight.current) return;
        signInInFlight.current = true;
        try {
          const gid = newGroupId();
          // Real Grid sign-in: first run bootstraps via EMAIL_OTP + registers a
          // passkey; returning runs the passkey challenge/verify. Every call is
          // logged truthfully.
          await gridSignIn({
            log: logEnvelope('Sign in', gid),
            // The aurora OTP sheet collects the code; sandbox magic code is 000000.
            promptOtp,
            // Play the iOS Face ID animation around the WebAuthn assertion.
            onFaceId: () => playFaceId(),
          });
          // Load the real book balance + activity into the same "Sign in" group.
          const [balanceCents, activity] = await Promise.all([
            fetchBalanceCents(logEnvelope('Sign in', gid)),
            fetchActivity(logEnvelope('Sign in', gid)),
          ]);
          session.current.loadedBalanceCents = balanceCents;
          session.current.loadedActivity = activity;
        } finally {
          signInInFlight.current = false;
        }
      } else if (m === 'oauth' || m === 'apple') {
        if (popup) {
          // The popup is already open — the phone stays untouched until it
          // resolves (cancel rejects 'cancelled' and nothing here ran).
          await popup;
        } else {
          const prompt = m === 'apple' ? promptApple : promptGoogle;
          await prompt(await oauthNonce());
        }
        // The same post-resolve beat as the OTP sheet's dismiss: a breath
        // between the ceremony finishing and the wallet flip's intro.
        await sleep(400);
        pushCalls([oauthVerifyCall(m)], 'Sign in');
      } else {
        throw new Error(`Sign-in method "${m}" is not available.`);
      }
      startSession();
    },
    [
      method,
      promptEmail,
      promptPhone,
      promptOtp,
      promptGoogle,
      promptApple,
      playFaceId,
      pushCalls,
      startSession,
      logEnvelope,
      gridSignIn,
    ],
  );

  const signInWithMethod = useCallback(
    async (m: AuthMethod, popup?: Promise<string>) => {
      if (running) {
        // A flow is already live (e.g. its popup is open) — swallow the
        // stray popup promise so the rejection doesn't go unhandled.
        popup?.catch(() => {});
        return;
      }
      setRunning(true);
      // A manual sign-in plays the full intro and starts clean — drop any stale
      // fast-forward jump/skip from a prior session.
      setSkipIntro(false);
      setWalletEntry(undefined);
      // The popup wait must not read as busy on the auth screen — the phone
      // stays exactly as it is while the real provider popup is up.
      if (popup) setPopupWait(true);
      try {
        session.current = { method: m };
        setSignInMethod(m);
        await authenticate(true, popup);
        setWallet((w) => ({
          ...w,
          created: true,
          balanceCents: session.current.loadedBalanceCents ?? 0,
          activity: session.current.loadedActivity ?? [],
        }));
        setCompleted((c) => ({ ...c, signIn: true }));
        setTransient(null);
      } catch (e: unknown) {
        if ((e as Error)?.message !== 'cancelled') console.error('[grid-demo]', e);
        setTransient(null);
      } finally {
        setPopupWait(false);
        setRunning(false);
      }
    },
    [running, authenticate],
  );

  // The live Aurora wallet owns its own UI + displayed balance; it reports each
  // step up so we log the matching Grid calls and keep a mirror of wallet state
  // for the sidebar's availability/done gating. A transfer is two beats: the
  // create-quote (amount committed) opens a group; the execute (Face ID) streams
  // into that same group and moves the balance.
  const onQuoteCreate = useCallback(
    (mode: WalletTransferMode, cents: number, dest?: TransferDest) => {
      const gid = newGroupId();
      transferGroup.current = gid;
      if (mode === 'add') {
        // Add money's pay-in quote is still the scripted log (Task 7/8 only
        // wired the real sandbox-fund + balance-refresh, not this call).
        transferFundingCurrency.current = dest?.kind === 'bank' ? dest.currency : null;
        pushCalls([transferQuoteCall(mode, cents, dest)], TRANSFER_LABEL[mode], gid);
        return;
      }
      // Outbound (withdraw/send): a REAL POST /quotes, source = the embedded
      // wallet, destination = the ExternalAccount linked moments earlier.
      transferFundingCurrency.current = null;
      const acct = getAccount();
      if (!acct) return;
      void (async () => {
        const destCurrency = dest?.currency ?? 'USD';
        // The external account was created on link (onLinkExternalAccount);
        // resolve its id from that ref. If the user picked a saved recipient
        // from an earlier session without re-linking this session, this can
        // be stale/null — see the task report's known-limitation note.
        const externalAccountId = pendingExternalAccountId.current;
        if (!externalAccountId) return;
        const idem = crypto.randomUUID();
        const quote = await createQuote(
          quoteBodyFor(acct.accountId, externalAccountId, cents, destCurrency),
          logEnvelope(TRANSFER_LABEL[mode], gid),
          idem,
        );
        pendingQuote.current = {
          quoteId: quote.quoteId,
          payloadToSign: quote.payloadToSign,
          transactionId: quote.transactionId,
          idem,
        };
      })().catch((e) => console.error('[grid-demo] create quote', e));
    },
    [pushCalls, logEnvelope],
  );

  // Linking a recipient (a bank account or a crypto address) — its own group,
  // logged the moment "Add bank account" / "Add recipient" is confirmed. Real
  // POST /customers/external-accounts (reused, not recreated, per destination
  // for the rest of the session).
  const onLinkExternalAccount = useCallback(
    (input: ExternalAccountInput, label: string) => {
      const gid = newGroupId();
      void ensureExternalAccount(input, logEnvelope(label, gid))
        .then((id) => {
          pendingExternalAccountId.current = id;
        })
        .catch((e) => console.error('[grid-demo] link external account', e));
    },
    [logEnvelope],
  );

  const onTransferExecute = useCallback(
    (mode: WalletTransferMode, cents: number, onAddSettled?: () => void) => {
      const gid = transferGroup.current ?? newGroupId();
      transferGroup.current = null;
      if (mode === 'add') {
        transferFundingCurrency.current = null;
        const acct = getAccount();
        if (acct) {
          void (async () => {
            // Any failure here (a non-200/403 fund response, a failed/errored
            // quote or execute, or a thrown exception anywhere along the
            // chain — network error, bad JSON, etc.) must not become an
            // unhandled rejection or leave `completed.add` set INCORRECTLY.
            // Every envelope is logged inside the helpers below before any of
            // them can throw; there's no dedicated busy/running state on this
            // path to unstick (the sheet already closed synchronously in
            // finishTransfer). It also must not leave the phone showing
            // phantom money forever OR double-counted alongside a concurrent
            // add: EVERY terminal outcome for THIS add — success (after the
            // balance re-read lands or exhausts its retry) or failure (else /
            // catch / 403) — calls `onAddSettled` exactly once, undoing this
            // add's own optimistic bump by exactly its own cents.
            //
            // `POST /sandbox/internal-accounts/{id}/fund` only mints BOOK
            // balance — a direct fund of the customer's own wallet leaves it
            // with no on-chain USDB, so any later outbound quote fails with
            // INSUFFICIENT_FUNDS. The real on-ramp (fund the platform's USD
            // account, then quote+execute platform -> customer wallet) is the
            // only way "Add money" lands real, spendable balance.
            try {
              const platformId = await resolvePlatformUsdAccountId(
                logEnvelope(TRANSFER_LABEL[mode], gid),
              );
              const res = await sandboxFundPlatform(
                platformId,
                cents,
                logEnvelope(TRANSFER_LABEL[mode], gid),
              );
              if (res.ok) {
                const idem = crypto.randomUUID();
                const quote = await createQuote(
                  onRampQuoteBodyFor(platformId, acct.accountId, cents),
                  logEnvelope(TRANSFER_LABEL[mode], gid),
                  idem,
                );
                const execEnv = await executeQuoteUnsigned(
                  quote.quoteId,
                  logEnvelope(TRANSFER_LABEL[mode], gid),
                  idem,
                );
                if (execEnv.response.status === 200 && quote.transactionId) {
                  // Polls to a terminal status (COMPLETED expected — the
                  // platform-sourced on-ramp settles fast in sandbox).
                  await pollTransaction(quote.transactionId, logEnvelope(TRANSFER_LABEL[mode], gid));
                }
                // The fund + on-ramp succeeded server-side — the add DID
                // happen, so `completed.add` reflects that regardless of
                // whether the balance re-read below succeeds.
                setCompleted((c) => ({ ...c, add: true }));
                try {
                  await refreshBalance(TRANSFER_LABEL[mode], gid); // real GET /customers/internal-accounts
                } catch (e) {
                  // One retry after a short delay before giving up — a
                  // transient read failure right after a real, successful
                  // fund shouldn't leave the panel stuck on a stale balance
                  // if a second try would have landed fine.
                  await sleep(REFRESH_RETRY_DELAY_MS);
                  try {
                    await refreshBalance(TRANSFER_LABEL[mode], gid);
                  } catch (e2) {
                    // Both reads failed: truthful log, no fabricated
                    // balance. `onAddSettled` below still fires — the
                    // optimistic bump must not outlive the flow either way —
                    // so the display will under-count this add's real money
                    // until some LATER balance change (another flow, or a
                    // fresh sign-in) catches it up. That's the truthful
                    // choice, not a bug: we don't know the exact new total,
                    // so we stop pretending we do.
                    console.error('[grid-demo]', e2);
                  }
                }
                // Settle THIS add's bump now, in the SAME continuation as
                // the refresh above (whether it landed or exhausted its
                // retry) — same React batch as refreshBalance's setWallet,
                // so `balance` and `deltaCents` move together with no
                // intermediate frame where both count (the bug a concurrent
                // second add's still-pending bump would otherwise hit).
                onAddSettled?.();
              } else if (res.status === 403) {
                // Production keys: sandbox fund is forbidden — no real money
                // moved. Keep the sidebar checkmark (the flow WAS attempted)
                // truthful, but settle (roll back) the phone's optimistic
                // bump: this is the EXPECTED path once this demo runs on
                // production keys, so it must not leave a permanent phantom
                // balance.
                setCompleted((c) => ({ ...c, add: true }));
                onAddSettled?.();
              } else {
                console.error('[grid-demo]', new Error(`sandbox fund failed: ${res.status}`));
                onAddSettled?.();
              }
            } catch (e) {
              console.error('[grid-demo]', e);
              onAddSettled?.();
            }
          })();
        }
        return;
      }
      // Outbound (withdraw | send): stamp the quote's payloadToSign, execute
      // it for real, then poll the transaction to a terminal status. The
      // sheet has already closed optimistically (finishTransfer, above this
      // callback) — no balance changes here; `refreshBalance` below (once the
      // transaction settles) is the sole source of truth for the new balance.
      transferFundingCurrency.current = null;
      const pq = pendingQuote.current;
      pendingQuote.current = null;
      const acct = getAccount();
      if (acct && pq?.payloadToSign) {
        void (async () => {
          try {
            const priv = await ensureSession({
              log: logEnvelope(TRANSFER_LABEL[mode], gid),
              promptOtp,
              onFaceId: () => playFaceId(),
            });
            const execEnv = await executeQuote(
              pq.quoteId,
              pq.payloadToSign!,
              priv,
              logEnvelope(TRANSFER_LABEL[mode], gid),
              pq.idem,
            );
            if (execEnv.response.status === 200) {
              if (pq.transactionId) {
                // Polls to a terminal status (COMPLETED expected in sandbox,
                // 60–180s) — a status-polling loop, not an auth retry.
                await pollTransaction(pq.transactionId, logEnvelope(TRANSFER_LABEL[mode], gid));
              }
              await refreshBalance(TRANSFER_LABEL[mode], gid); // real GET /customers/internal-accounts
              setCompleted((c) => ({ ...c, [mode]: true }));
            } else {
              // Real error (e.g. insufficient funds, an expired quote). The
              // panel already logged the truthful error via logEnvelope; the
              // phone recovers with no balance change and no checkmark.
              console.warn('[grid-demo] execute failed', execEnv.response.status);
            }
          } catch (e) {
            console.error('[grid-demo] execute', e);
          }
        })();
      } else {
        console.warn('[grid-demo] no pending quote/payload for outbound transfer');
      }
    },
    // `refreshBalance` is referenced inside the async body above but
    // deliberately omitted here: it's declared further down in this same
    // component (below `onTransferExecute`), so naming it in this array would
    // read it before its `const` initializer runs (TDZ) at render time. The
    // closure inside the callback body only reads it once invoked, well after
    // the component has finished rendering, so this is safe — same pattern
    // already used by the 'add' branch above.
    [logEnvelope],
  );

  // Re-pull the real book balance after a money movement (used by Tasks 7-8).
  const refreshBalance = useCallback(
    async (groupLabel: string, groupId: string) => {
      const cents = await fetchBalanceCents(logEnvelope(groupLabel, groupId));
      setWallet((w) => ({ ...w, balanceCents: cents }));
    },
    [logEnvelope],
  );

  const onCardIssued = useCallback(() => {
    pushCalls(cardCalls(), 'Issue a card');
    setWallet((w) => ({ ...w, hasCard: true }));
    setCompleted((c) => ({ ...c, card: true }));
  }, [pushCalls]);

  const onTapToPay = useCallback(
    (cents: number, merchant: string) => {
      pushCalls(tapCalls(merchant, cents), 'Tap to pay');
      setWallet((w) => ({
        ...w,
        cardActivated: true,
        balanceCents: Math.max(0, w.balanceCents - cents),
      }));
      setCompleted((c) => ({ ...c, tap: true }));
    },
    [pushCalls],
  );

  // A payment landed (Receive flow): no client call to make — Grid POSTs the
  // inbound webhook, then we read the transaction. The webhook lands now and the
  // GET a beat later (same 1-by-1 cadence as a transfer's settle).
  const onReceivePayment = useCallback(
    (info: ReceivePaymentInfo) => {
      // Add-from-crypto is the same inbound webhook, just grouped + checked as the
      // Add flow (you topped up your own balance) rather than Receive.
      const isAdd = info.intent === 'add';
      const label = isAdd ? 'Add money' : 'Receive payment';
      const gid = newGroupId();
      const [webhookCall, ...rest] = receivePaymentCalls(info);
      pushCalls([webhookCall], label, gid);
      if (rest.length) {
        const timer = setTimeout(() => {
          settleTimers.current.delete(timer);
          pushCalls(rest, label, gid);
        }, SETTLE_DELAY_MS);
        settleTimers.current.add(timer);
      }
      setWallet((w) => ({ ...w, balanceCents: w.balanceCents + info.amountCents }));
      setCompleted((c) => ({ ...c, [isAdd ? 'add' : 'receive']: true }));
    },
    [pushCalls],
  );

  // "Sign in again" — drop back to the auth screen to replay the flow. Resets
  // the session wallet to fresh, but KEEPS the API log and the sidebar
  // checkmarks (completed flows) — only "Reset" wipes those.
  const returnToSignIn = useCallback(() => {
    for (const p of [passkeyPrompt, otpPrompt, emailPrompt, phonePrompt, googlePrompt, applePrompt]) {
      p.current?.reject(new Error('cancelled'));
      p.current = null;
    }
    if (faceIdPrompt.current) {
      clearTimeout(faceIdPrompt.current.timer);
      faceIdPrompt.current.resolve();
      faceIdPrompt.current = null;
    }
    session.current = {};
    clearSession();
    transferGroup.current = null;
    transferFundingCurrency.current = null;
    settleTimers.current.forEach((t) => clearTimeout(t));
    settleTimers.current.clear();
    setWallet(initialWallet);
    setTransient(null);
    setSignInMethod(null);
    setPasskeyActive(false);
    setFaceIdActive(false);
    setOtpActive(false);
    setEmailActive(false);
    setPhoneActive(false);
    setGNonce(null);
    setANonce(null);
    setPopupWait(false);
    setWalletEntry(undefined);
    setSkipIntro(false);
    setRunning(false);
  }, []);

  const handleAction = useCallback(
    (id: ActionId) => {
      if (running) return;
      // "Sign in" is the one flow you watch, not skip — replay the auth screen.
      if (id === 'create') {
        returnToSignIn();
        return;
      }
      // Fast-forward: silently satisfy whatever this flow needs (sign in, funds,
      // a card) so it works from any starting point — no linear track. This is
      // STATE only — no API calls are logged for the provisioning (just like the
      // phone skips the sign-in animation), and it earns no checkmark. Each flow
      // logs only its own calls, and is checked, when the user actually runs it.
      let next = wallet;
      const provision: { issued?: boolean; fundCents?: number } = {};

      if (!next.created) {
        next = { ...next, created: true };
        setSignInMethod(method);
        setSkipIntro(true); // cold jump — land on the wallet without the hold
      }
      const needsFunds = id === 'send' || id === 'withdraw' || id === 'tap';
      if (needsFunds && next.balanceCents <= 0) {
        next = { ...next, balanceCents: FAST_FORWARD_FUND_CENTS };
        provision.fundCents = FAST_FORWARD_FUND_CENTS;
      }
      if (id === 'tap' && !next.hasCard) {
        next = { ...next, hasCard: true };
        provision.issued = true;
      }

      if (next !== wallet) setWallet(next);
      setWalletEntry({
        nonce: Date.now(),
        provision:
          provision.issued || provision.fundCents !== undefined ? provision : undefined,
        open: id,
      });
    },
    [running, wallet, method, returnToSignIn, pushCalls],
  );

  const reset = useCallback(() => {
    for (const p of [passkeyPrompt, otpPrompt, emailPrompt, phonePrompt, googlePrompt, applePrompt]) {
      p.current?.reject(new Error('cancelled'));
      p.current = null;
    }
    if (faceIdPrompt.current) {
      clearTimeout(faceIdPrompt.current.timer);
      faceIdPrompt.current.resolve();
      faceIdPrompt.current = null;
    }
    session.current = {};
    clearSession();
    transferGroup.current = null;
    transferFundingCurrency.current = null;
    settleTimers.current.forEach((t) => clearTimeout(t));
    settleTimers.current.clear();
    setWallet(initialWallet);
    setCompleted(initialCompleted);
    setEntries([]);
    setTransient(null);
    setSignInMethod(null);
    setPasskeyActive(false);
    setFaceIdActive(false);
    setOtpActive(false);
    setEmailActive(false);
    setPhoneActive(false);
    setGNonce(null);
    setANonce(null);
    setPopupWait(false);
    setWalletEntry(undefined);
    setSkipIntro(false);
    setRunning(false);
  }, []);

  const base = phoneFromState(wallet);
  const phone = transient
    ? {
        ...base,
        screen: transient.screen,
        note: transient.note,
        cardActivated: transient.activated ?? base.cardActivated,
      }
    : base;

  return {
    persona,
    methods,
    method,
    wallet,
    completed,
    entries,
    running,
    handleAction,
    signInWithMethod,
    signInMethod,
    reset,
    phone,
    passkeyActive,
    confirmPasskey,
    cancelPasskey,
    faceIdActive,
    finishFaceId,
    otpActive,
    submitOtp,
    cancelOtp,
    backOtp,
    emailActive,
    submitEmail,
    cancelEmail,
    phoneActive,
    submitPhone,
    cancelPhone,
    gNonce,
    submitGoogle,
    aNonce,
    submitApple,
    popupWait,
    walletEntry,
    skipIntro,
    onQuoteCreate,
    onLinkExternalAccount,
    onTransferExecute,
    onCardIssued,
    onTapToPay,
    onReceivePayment,
    refreshBalance,
  };
}
