'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AuthMethod, Persona, ScreenId, ApiCall } from '@/data/flow';
import type { WalletListItemData } from '@/apps/shared/wallet/types';
import { primaryAuthMethod } from '@/data/configure';
import {
  initialCompleted,
  initialWallet,
  phoneFromState,
  type ActionId,
  type CompletedFlows,
  type WalletState,
} from '@/data/actions';
import type {
  ExternalAccountInput,
  ReceivePaymentInfo,
  TransferDest,
} from '@/data/apiCalls';
import { oauthNonce } from '@/lib/auth';
import {
  signIn as gridSignIn,
  addPasskey as gridAddPasskey,
  hasPasskey,
  deviceHasPasskey,
  ensureSession,
  clearSession,
  getAccount,
} from '@/lib/gridSession';
import { envelopeToApiCall } from '@/lib/gridEntry';
import {
  fetchBalance,
  fetchBalanceCents,
  fetchActivity,
  fetchDepositInstructions,
  fetchExternalAccounts,
  fetchFiatBalance,
  transactionToRow,
  type DepositInstructions,
  type RawTransaction,
} from '@/lib/gridReads';
import {
  realtimeFundingQuoteBodyFor,
  SANDBOX_FUNDING_CURRENCY,
  sandboxSendForQuote,
  sweepQuoteBodyFor,
} from '@/lib/gridFunding';
import {
  ensureExternalAccount,
  createQuote,
  executeQuote,
  executeQuoteUnsigned,
  pollTransaction,
  quoteBodyFor,
  pullQuoteBodyFor,
  isCompletionStatus,
} from '@/lib/gridTransfer';
import type { WalletEntry, WalletTransferMode } from '@/apps/aurora/wallet';
import { savedBankFromExternalAccount, type SavedBank } from '@/apps/shared/wallet';
import type { Entry } from '@/components/ApiPanel/types';
import { PLACEHOLDER_EUR_DEPOSIT } from '@/data/placeholderDeposit';
import { IS_SANDBOX, SANDBOX_DEPOSIT_CENTS } from '@/lib/gridEnv';
import { useWebhookStream } from '@/hooks/useWebhookStream';
import type { EntryAction } from '@/components/ApiPanel/types';

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
  loadedActivity?: WalletListItemData[];
}

const SESSION_MS = 15 * 60 * 1000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Sign-in's calls still share one group (so they stay together and animate as a
// batch) but carry NO label — the panel draws no divider for it. Every other
// flow keeps its heading.
const SIGN_IN_GROUP = '';

// Production demo: use case pinned to Fintech, and the sign-in CTA advertises
// the credential `gridSession.signIn` will actually use. A Global Account is born
// with only EMAIL_OTP, so a fresh device says "Continue with email"; once THIS
// device has registered a passkey (added later from the wallet), the button says
// passkey — the label must never promise one credential and run another.
const FIRST_RUN_METHODS: AuthMethod[] = ['email_otp'];
const RETURNING_METHODS: AuthMethod[] = ['passkey'];

/**
 * Demo interaction logic — preserved for phase 2 UI wiring.
 * Returns the full surface area Phone / ApiPanel expect.
 */
export function useWalletDemoLogic() {
  const persona: Persona = 'fintech';
  // Starts on the first-run label and flips after mount: `deviceHasPasskey`
  // reads localStorage, which the server render can't see, so deciding during
  // render would mismatch on hydration.
  const [methods, setMethods] = useState<AuthMethod[]>(FIRST_RUN_METHODS);
  useEffect(() => {
    if (deviceHasPasskey()) setMethods(RETURNING_METHODS);
  }, []);
  const method = useMemo(() => primaryAuthMethod(methods), [methods]);
  const [wallet, setWallet] = useState<WalletState>(initialWallet);
  // Sticky sidebar checkmarks — "have you ever run this flow". Separate from
  // `wallet` so replaying "Sign in" (which resets the session wallet) keeps them;
  // only Reset wipes them.
  const [completed, setCompleted] = useState<CompletedFlows>(initialCompleted);
  // Starts empty and only ever holds real traffic (proxy envelopes + delivered
  // webhooks) plus the sandbox action card, which is visibly not a request.
  const [entries, setEntries] = useState<Entry[]>([]);
  const [transient, setTransient] = useState<Transient | null>(null);
  const [running, setRunning] = useState(false);

  const [signInMethod, setSignInMethod] = useState<AuthMethod | null>(null);
  const [passkeyActive, setPasskeyActive] = useState(false);
  const [faceIdActive, setFaceIdActive] = useState(false);
  const [otpActive, setOtpActive] = useState(false);
  const [emailActive, setEmailActive] = useState(false);
  // The address the live EMAIL_OTP credential is tied to (discovered from the
  // credential's nickname) — prefills the entry step instead of a placeholder.
  const [emailPrefill, setEmailPrefill] = useState<string | null>(null);
  // No PASSKEY credential on the account yet — the wallet shows the "add a
  // passkey" nudge until one exists.
  const [passkeyAdded, setPasskeyAdded] = useState(false);
  // Toast the wallet should show, bumped by an arrival webhook (the brain owns
  // the toast surface, so it rides a nonce down like the other one-shots).
  const [walletToast, setWalletToast] = useState<{ nonce: number; text: string } | null>(null);
  // Terminal outcome of the outbound transfer the phone is showing as pending —
  // from the execute + transaction poll, or from an OUTGOING_PAYMENT webhook.
  const [transferOutcome, setTransferOutcome] = useState<{ nonce: number; ok: boolean } | null>(
    null,
  );
  const reportTransfer = useCallback((ok: boolean) => {
    setTransferOutcome((prev) => ({ nonce: (prev?.nonce ?? 0) + 1, ok }));
  }, []);
  // Accounts Grid already holds for this customer — the saved-banks list starts
  // from these rather than from an empty session.
  const [storedBanks, setStoredBanks] = useState<SavedBank[]>([]);
  // The USDB account's total balance — shown under the available headline, which
  // stays on what a transfer could actually move.
  const [totalCents, setTotalCents] = useState(0);
  // Real deposit details for the customer's fiat account (Add money → Bank
  // transfer shows these); null until sign-in has read them.
  const [depositInstructions, setDepositInstructions] = useState<DepositInstructions | null>(null);
  // Bumped when the panel's "Simulate funding" button runs — the wallet brain
  // watches it and drives the same money path a confirmed add would.
  const [simulateDeposit, setSimulateDeposit] = useState<{
    nonce: number;
    cents: number;
    last4: string;
  } | null>(null);
  // Keys of action cards already offered, so re-viewing the screen doesn't stack
  // duplicates in the feed.
  const depositActionKey = useRef<string | null>(null);
  // A quote sourced from the customer's external account, waiting to be pushed.
  const pendingPullQuote = useRef<{
    quoteId: string;
    transactionId: string | null;
    cents: number;
  } | null>(null);
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
  // Does the live OTP prompt have an entry step behind it (sign-in), or is it a
  // bare re-auth (ensureSession)? Decides whether the sheet's top control can
  // step BACK or only cancel.
  const otpHasEntryStep = useRef(false);
  const emailPrompt = useRef<{ resolve: (e: string) => void; reject: (e: Error) => void } | null>(null);
  const phonePrompt = useRef<{ resolve: (n: string) => void; reject: (e: Error) => void } | null>(null);
  const googlePrompt = useRef<{ resolve: (t: string) => void; reject: (e: Error) => void } | null>(null);
  const applePrompt = useRef<{ resolve: (t: string) => void; reject: (e: Error) => void } | null>(null);

  /** Arms the email-entry step. `onFile` (the EMAIL_OTP credential's nickname)
   *  prefills the field — Grid mails the code to that address whatever is typed,
   *  so the prefill is what keeps the step honest. */
  const promptEmail = useCallback((onFile?: string | null): Promise<string> => {
    if (onFile) setEmailPrefill(onFile);
    otpHasEntryStep.current = true;
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
  /** OTP step → back to the entry step (gridSession's collectOtp re-prompts and
   *  issues a fresh challenge). */
  const backOtp = useCallback(() => {
    // Only the sign-in flow arms an entry step. A mid-transfer re-auth
    // (ensureSession) prompts for the code alone, with no entry step to go back
    // to — treat the sheet's top control as a plain cancel there, or the user is
    // left on a dead entry screen with no prompt in flight.
    if (!otpHasEntryStep.current) {
      cancelOtp();
      return;
    }
    setOtpActive(false);
    // Re-arm the entry step IN THE SAME RENDER: the loop's re-prompt arrives a
    // beat later, and without this the sheet's `open` (entry || otp) blips false
    // for a frame — the dismiss animation starts and the sheet visibly jumps as
    // it recovers.
    setEmailActive(true);
    const p = otpPrompt.current;
    otpPrompt.current = null;
    p?.reject(new Error('back'));
  }, [cancelOtp]);

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

  /**
   * SANDBOX ONLY: the user is looking at a country's deposit details, and no real
   * wire is coming. Offer the stand-in as a card IN THE REQUEST LIST — the panel
   * is where the demo's seams belong, and the button is what produces the fund →
   * quote → execute traffic right below it. One card per visit to the screen.
   */
  const onDepositView = useCallback(
    (view: { label: string; currency: string; cents?: number } | null) => {
      if (!IS_SANDBOX || !view) return;
      const key = `deposit-${view.label}-${view.cents ?? ''}`;
      if (depositActionKey.current === key) return;
      depositActionKey.current = key;
      const baseTime = Date.now();
      setEntries((prev) => [
        ...prev,
        {
          method: 'POST',
          path: '/sandbox/send',
          title: 'Simulate an inbound transfer',
          note:
            `No real ${view.currency} transfer is going to arrive in sandbox. Stand in for one with a real-time funding quote, settled the way a pushed wire would be — the calls appear below.` +
            (view.currency === SANDBOX_FUNDING_CURRENCY
              ? ''
              : ` This platform only has ${SANDBOX_FUNDING_CURRENCY} real-time funding enabled, so the stand-in arrives as ${SANDBOX_FUNDING_CURRENCY}.`),
          simulateCents: view.cents,
          status: '200',
          action: 'simulate-funding' as EntryAction,
          actionLabel: 'Simulate funding',
          key: `action-${baseTime}`,
          createdAt: baseTime,
          groupId: `action-${baseTime}`,
          groupLabel: TRANSFER_LABEL.add,
        },
      ]);
    },
    [],
  );

  /** The action card's button: hand the wallet brain the same job a confirmed
   *  add does, and mark the card done so it can't double-fund. */
  const onPanelAction = useCallback(
    (action: EntryAction) => {
      if (action !== 'simulate-funding') return;
      // A pull quote is waiting on a push: fund THAT quote (Grid's own sandbox
      // affordance) rather than running the platform on-ramp.
      const pull = pendingPullQuote.current;
      if (pull) {
        pendingPullQuote.current = null;
        setEntries((prev) =>
          prev.map((e) => (e.action === 'simulate-funding' ? { ...e, actionDone: true } : e)),
        );
        const gid = newGroupId();
        void (async () => {
          try {
            const res = await sandboxSendForQuote(
              pull.quoteId,
              'USD',
              pull.cents,
              logEnvelope(TRANSFER_LABEL.add, gid),
            );
            if (!res.ok) throw new Error(`sandbox send failed: ${res.status}`);
            let status: string | null = null;
            if (pull.transactionId) {
              status = await pollTransaction(pull.transactionId, logEnvelope(TRANSFER_LABEL.add, gid));
            }
            await refreshLedger(TRANSFER_LABEL.add, gid);
            if (isCompletionStatus(200, status)) setCompleted((c) => ({ ...c, add: true }));
            // If the funds landed as USD in the fiat account rather than as USDB,
            // convert them straight away — the phone's balance IS the wallet.
            await sweepUsdToWallet(gid);
          } catch (e) {
            console.error('[grid-demo] simulate push', e);
          }
        })();
        return;
      }
      setEntries((prev) => {
        // Crypto deposits state their amount on the address screen; the bank
        // instructions don't ask for one, so those fall back to the fixed amount.
        const pending = prev.find((e) => e.action === 'simulate-funding' && !e.actionDone);
        setSimulateDeposit((prevSim) => ({
          nonce: (prevSim?.nonce ?? 0) + 1,
          cents: pending?.simulateCents ?? SANDBOX_DEPOSIT_CENTS,
          last4: depositInstructions?.last4 ?? '',
        }));
        return prev.map((e) => (e.action === 'simulate-funding' ? { ...e, actionDone: true } : e));
      });
    },
    [depositInstructions],
  );

  // Real webhooks, pushed over SSE the moment Grid delivers them (ngrok →
  // /api/webhooks → verified → stream). They land in the feed as inbound calls,
  // which is what they are: Grid → your endpoint.
  useWebhookStream(
    useCallback(
      (event) => {
        // A completed inbound payment is how the wallet learns money ARRIVED —
        // not the tap that requested it. Grid's payload `data` is a transaction
        // in the same shape the Activity list already reads, so the row, the
        // toast and the balance re-read all come from the delivery itself.
        const data = event.data as RawTransaction | undefined;
        const completed = event.type?.endsWith('.COMPLETED') && data?.status === 'COMPLETED';
        const credit = data?.direction ? data.direction === 'CREDIT' : data?.type === 'INCOMING';
        // Outbound: Grid's OUTGOING_PAYMENT.* is the authoritative word on a
        // transfer the phone is showing as pending. settleTransfer is idempotent,
        // so whichever arrives first — this or the poll — wins.
        if (event.type?.startsWith('OUTGOING_PAYMENT.') && data) {
          if (data.status === 'COMPLETED') reportTransfer(true);
          else if (['FAILED', 'REJECTED', 'REFUNDED', 'EXPIRED'].includes(data.status)) {
            reportTransfer(false);
          }
        }
        // USD landing in the fiat account is money that hasn't reached the wallet
        // yet: convert it. The sweep re-reads the real balance, so a duplicate or
        // out-of-order delivery can't move the same dollars twice.
        if (completed && credit && data?.receivedAmount?.currency.code === 'USD') {
          void sweepUsdToWallet(newGroupId());
        }
        if (completed && data && credit) {
          const row = transactionToRow(data, getAccount()?.accountId);
          setWallet((w) => ({
            ...w,
            activity: [row, ...w.activity.filter((r) => r.id !== row.id)],
          }));
          setWalletToast((t) => ({ nonce: (t?.nonce ?? 0) + 1, text: `${row.amount} added to balance` }));
          setCompleted((c) => ({ ...c, add: true }));
          void refreshLedger(TRANSFER_LABEL.add, newGroupId()).catch((e) =>
            console.error('[grid-demo] webhook ledger refresh', e),
          );
        }
        pushCalls(
          [
            {
              method: 'POST',
              path: '/api/webhooks',
              title: event.type ? `Webhook · ${event.type}` : 'Webhook received',
              inbound: true,
              status: '200',
              resBody: { ok: true },
              realStatus: 200,
              reqBody: {
                ...(event.id ? { id: event.id } : {}),
                ...(event.type ? { type: event.type } : {}),
                ...(event.timestamp ? { timestamp: event.timestamp } : {}),
                ...(event.data !== undefined ? { data: event.data } : {}),
              },
            },
          ],
          'Webhook',
        );
      },
      [pushCalls],
    ),
  );

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
  // Same guard for the add-passkey action (a second tap must not open a second
  // WebAuthn registration dialog).
  const addPasskeyInFlight = useRef(false);

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
      if (m === 'email_otp' || m === 'passkey') {
        // A sign-in is already live (e.g. a second tap landed before `running`
        // re-rendered) — never start a second WebAuthn ceremony on top of it.
        if (signInInFlight.current) return;
        signInInFlight.current = true;
        try {
          const gid = newGroupId();
          // Real Grid sign-in on whatever credential the account has: EMAIL_OTP
          // until a passkey has been added, the passkey challenge/verify after.
          // Every call is logged truthfully.
          const s = await gridSignIn({
            log: logEnvelope(SIGN_IN_GROUP, gid),
            // The aurora sheet's entry step, prefilled with the email on file.
            promptEmail,
            // The aurora OTP sheet collects the code; sandbox magic code is 000000.
            promptOtp,
            // Play the iOS Face ID animation around the WebAuthn assertion.
            onFaceId: () => playFaceId(),
          });
          setPasskeyAdded(s.via === 'passkey' || hasPasskey());
          // Load the real book balance, history, and the fiat account's deposit
          // details (what Add money → Bank transfer shows) into the same group.
          const [walletBalance, activity, deposit, externalAccounts] = await Promise.all([
            fetchBalance(logEnvelope(SIGN_IN_GROUP, gid)),
            fetchActivity(logEnvelope(SIGN_IN_GROUP, gid), s.accountId),
            fetchDepositInstructions(logEnvelope(SIGN_IN_GROUP, gid)),
            fetchExternalAccounts(logEnvelope(SIGN_IN_GROUP, gid)),
          ]);
          session.current.loadedBalanceCents = walletBalance.spendableCents;
          setTotalCents(walletBalance.totalCents);
          session.current.loadedActivity = activity;
          // Grid gives us the real USD section; the euro one is a stand-in until
          // the customer has an EUR internal account (see placeholderDeposit).
          setDepositInstructions(
            deposit && { ...deposit, sections: [...deposit.sections, PLACEHOLDER_EUR_DEPOSIT] },
          );
          // Rows Grid can actually quote against; anything unmappable is dropped
          // rather than shown as a bank the flows would fail on.
          setStoredBanks(
            externalAccounts
              .map((a) => savedBankFromExternalAccount(a))
              .filter((b): b is SavedBank => b !== null),
          );
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
        // between the ceremony finishing and the wallet flip's intro. No call is
        // logged: this demo has no live OAuth credential path, so there is no
        // real request to show.
        await sleep(400);
      } else {
        throw new Error(`Sign-in method "${m}" is not available.`);
      }
      startSession();
    },
    [
      method,
      promptEmail,
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
        // No client-side quote call to log here — the real on-ramp envelopes
        // (fund → quote → execute → poll) are logged in onTransferExecute,
        // into this same group (transferGroup.current, set above).
        transferFundingCurrency.current = dest?.kind === 'bank' ? dest.currency : null;
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
      })().catch((e) => {
        // The quote never came back, so there is nothing to execute: clear the
        // pending row rather than let it read as a completed transfer.
        reportTransfer(false);
        console.error('[grid-demo] create quote', e);
      });
    },
    [pushCalls, logEnvelope],
  );

  // Linking a recipient (a bank account or a crypto address) — its own group,
  // logged the moment "Add bank account" / "Add recipient" is confirmed. Real
  // POST /customers/external-accounts (reused, not recreated, per destination
  // for the rest of the session).
  /**
   * Money that arrives by bank transfer lands as USD in the customer's fiat
   * account, not in the USDB wallet the phone shows. Convert it the moment it
   * lands: quote the customer's own USD account into their wallet and execute it
   * (no wallet signature — the wallet is the destination, not the source).
   *
   * Reads the real balance rather than trusting an amount from elsewhere, so it is
   * safe to call speculatively: nothing there means nothing to do. Guarded against
   * overlapping runs so two triggers (the arrival webhook and the simulated
   * funding) can't quote the same dollars twice.
   */
  const sweepInFlight = useRef(false);
  const sweepUsdToWallet = useCallback(
    async (groupId: string) => {
      if (sweepInFlight.current) return;
      const acct = getAccount();
      if (!acct) return;
      sweepInFlight.current = true;
      const log = logEnvelope(TRANSFER_LABEL.add, groupId);
      try {
        const fiat = await fetchFiatBalance(log);
        if (!fiat || fiat.cents <= 0) return;
        const idem = crypto.randomUUID();
        const quote = await createQuote(
          sweepQuoteBodyFor(fiat.accountId, acct.accountId, fiat.cents),
          log,
          idem,
        );
        const execEnv = await executeQuoteUnsigned(quote.quoteId, log, idem);
        if (execEnv.response.status !== 200) {
          throw new Error(`sweep execute failed: ${execEnv.response.status}`);
        }
        const status = quote.transactionId ? await pollTransaction(quote.transactionId, log) : null;
        await refreshLedger(TRANSFER_LABEL.add, groupId);
        if (isCompletionStatus(200, status)) setCompleted((c) => ({ ...c, add: true }));
      } catch (e) {
        // Truthful failure: the USD stays in the fiat account and the panel has
        // every envelope. Nothing is faked on the phone.
        console.error('[grid-demo] usd → usdb sweep', e);
      } finally {
        sweepInFlight.current = false;
      }
    },
    // refreshBalance is declared below (same TDZ pattern as the transfer paths).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [logEnvelope],
  );

  /** A stored account was picked in the sheet: quote against ITS id (no create). */
  const onSelectStoredBank = useCallback((externalAccountId: string | null) => {
    if (externalAccountId) pendingExternalAccountId.current = externalAccountId;
  }, []);

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
    (
      mode: WalletTransferMode,
      cents: number,
      onAddSettled?: () => void,
      opts?: { simulated?: boolean },
    ) => {
      const gid = transferGroup.current ?? newGroupId();
      transferGroup.current = null;
      if (mode === 'add') {
        transferFundingCurrency.current = null;
        const acct = getAccount();
        // The user linked their OWN bank account for this add: the quote sources
        // from THAT account, and Grid will not let us pull it — the money has to
        // be pushed. So create the quote and stop; a real wire (or, in sandbox,
        // the panel's simulate button → POST /sandbox/send) settles it.
        const externalAccountId = !opts?.simulated ? pendingExternalAccountId.current : null;
        if (acct && externalAccountId) {
          void (async () => {
            try {
              const idem = crypto.randomUUID();
              const quote = await createQuote(
                pullQuoteBodyFor(externalAccountId, acct.accountId, cents),
                logEnvelope(TRANSFER_LABEL[mode], gid),
                idem,
              );
              // Nothing has arrived yet — release the optimistic bump so the
              // balance keeps telling the truth while the transfer is pending.
              onAddSettled?.();
              pendingPullQuote.current = { quoteId: quote.quoteId, transactionId: quote.transactionId, cents };
              if (IS_SANDBOX) {
                // Offer the push as an action card, tied to THIS quote.
                const baseTime = Date.now();
                setEntries((prev) => [
                  // Supersede any un-run stand-in from the instructions screen:
                  // the user picked the pull path, so THIS quote is what a push
                  // would fund, and two live buttons would be ambiguous.
                  ...prev.filter((e) => !(e.action === 'simulate-funding' && !e.actionDone)),
                  {
                    method: 'POST',
                    path: '/sandbox/send',
                    title: 'Simulate the incoming transfer',
                    note: `Grid can't pull from an external account — the quote stays PENDING until funds are pushed. Sandbox stands in for that push.`,
                    status: '200',
                    action: 'simulate-funding' as EntryAction,
                    actionLabel: 'Simulate funding',
                    simulateCents: cents,
                    key: `action-pull-${baseTime}`,
                    createdAt: baseTime,
                    groupId: gid,
                    groupLabel: TRANSFER_LABEL[mode],
                  },
                ]);
              }
            } catch (e) {
              console.error('[grid-demo] pull quote', e);
              onAddSettled?.();
            }
          })();
          return;
        }
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
            // The stand-in for a real inbound transfer is a REAL-TIME FUNDING
            // quote settled with `POST /sandbox/send` — the same settlement a
            // pushed wire gets. Two earlier approaches were wrong:
            //   - `POST /sandbox/internal-accounts/{id}/fund` on the customer's
            //     own wallet mints BOOK balance only, so later outbound quotes
            //     fail with INSUFFICIENT_FUNDS.
            //   - funding the PLATFORM's USD account and on-ramping from it does
            //     land spendable balance, but the transaction belongs to the
            //     platform, so it never shows up in the customer's
            //     `GET /transactions` — the arrival was missing from the phone's
            //     activity list even though the balance moved.
            try {
              const idem = crypto.randomUUID();
              const quote = await createQuote(
                realtimeFundingQuoteBodyFor(acct.accountId, cents),
                logEnvelope(TRANSFER_LABEL[mode], gid),
                idem,
              );
              const res = await sandboxSendForQuote(
                quote.quoteId,
                SANDBOX_FUNDING_CURRENCY,
                cents,
                logEnvelope(TRANSFER_LABEL[mode], gid),
              );
              if (res.ok) {
                // Settled server-side; poll the transaction to a terminal status
                // rather than assuming the 200 means the money landed.
                const transactionStatus = quote.transactionId
                  ? await pollTransaction(quote.transactionId, logEnvelope(TRANSFER_LABEL[mode], gid))
                  : null;
                if (isCompletionStatus(200, transactionStatus)) {
                  setCompleted((c) => ({ ...c, add: true }));
                } else {
                  // Real, truthful outcome: the send was accepted but the
                  // transaction never confirmed COMPLETED (or there was no
                  // transactionId to track). Every envelope is in the panel, so
                  // don't fabricate the checkmark.
                  console.error(
                    '[grid-demo]',
                    new Error(`funding did not complete: transaction ${transactionStatus ?? 'untracked'}`),
                  );
                }
                try {
                  await refreshLedger(TRANSFER_LABEL[mode], gid); // real balance + history
                } catch (e) {
                  // One retry after a short delay before giving up — a
                  // transient read failure right after a real, successful
                  // fund shouldn't leave the panel stuck on a stale balance
                  // if a second try would have landed fine.
                  await sleep(REFRESH_RETRY_DELAY_MS);
                  try {
                    await refreshLedger(TRANSFER_LABEL[mode], gid);
                  } catch (e2) {
                    // Both reads failed: truthful log, no fabricated balance.
                    // `onAddSettled` below still fires — the optimistic bump must
                    // not outlive the flow either way — so the display will
                    // under-count this add's real money until some LATER balance
                    // change (another flow, or a fresh sign-in) catches it up.
                    console.error('[grid-demo]', e2);
                  }
                }
                // Settle THIS add's bump now, in the SAME continuation as the
                // refresh above (whether it landed or exhausted its retry) — same
                // React batch as refreshLedger's setWallet, so `balance` and
                // `deltaCents` move together with no intermediate frame where both
                // count (the bug a concurrent second add's still-pending bump
                // would otherwise hit).
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
                console.error('[grid-demo]', new Error(`sandbox send failed: ${res.status}`));
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
            // A bare re-auth: the code sheet comes up with no entry step behind it.
            otpHasEntryStep.current = false;
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
              let transactionStatus: string | null = null;
              if (pq.transactionId) {
                // Polls to a terminal status (COMPLETED expected in sandbox,
                // 60–180s) — a status-polling loop, not an auth retry.
                transactionStatus = await pollTransaction(
                  pq.transactionId,
                  logEnvelope(TRANSFER_LABEL[mode], gid),
                );
              }
              // Outbound: refresh BEFORE reporting success, so the server's own row
              // is present when the phone drops its local pending one.
              await refreshLedger(TRANSFER_LABEL[mode], gid);
              if (isCompletionStatus(execEnv.response.status, transactionStatus)) {
                setCompleted((c) => ({ ...c, [mode]: true }));
                reportTransfer(true);
              } else {
                // FAILED/REJECTED/REFUNDED/EXPIRED, still PROCESSING at the
                // poll deadline, or no transactionId to track — a real,
                // truthful outcome. The panel already logged every envelope;
                // don't fabricate the checkmark, and tell the phone so the
                // pending row comes back OFF rather than standing as a transfer
                // that never happened.
                reportTransfer(false);
                console.error(
                  '[grid-demo]',
                  new Error(`transfer did not complete: transaction ${transactionStatus ?? 'untracked'}`),
                );
              }
            } else {
              // Real error (e.g. insufficient funds, an expired quote). The
              // panel already logged the truthful error via logEnvelope; the
              // phone drops the pending row and keeps the balance as it was.
              reportTransfer(false);
              console.warn('[grid-demo] execute failed', execEnv.response.status);
            }
          } catch (e) {
            reportTransfer(false);
            console.error('[grid-demo] execute', e);
          }
        })();
      } else {
        // Nothing to execute — most often the quote itself failed, which is
        // exactly the case that used to leave a "Withdrawn from balance" row.
        reportTransfer(false);
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
      const b = await fetchBalance(logEnvelope(groupLabel, groupId));
      setWallet((w) => ({ ...w, balanceCents: b.spendableCents }));
      setTotalCents(b.totalCents);
    },
    [logEnvelope],
  );

  /**
   * Money moved: re-read the balance AND the history. The Activity row for a
   * completed transfer comes from `GET /transactions` — the real ledger — so it
   * appears whether or not a webhook reached this machine. Without this, a
   * simulated ACH pull moved the balance while the list stayed as it was at
   * sign-in (webhooks are the only other row source, and they need a tunnel).
   */
  const refreshLedger = useCallback(
    async (groupLabel: string, groupId: string) => {
      const log = logEnvelope(groupLabel, groupId);
      const walletAccountId = getAccount()?.accountId;
      const [balance, activity] = await Promise.all([
        fetchBalance(log),
        fetchActivity(log, walletAccountId),
      ]);
      setWallet((w) => ({ ...w, balanceCents: balance.spendableCents, activity }));
      setTotalCents(balance.totalCents);
    },
    [logEnvelope],
  );

  /**
   * "Add a passkey", from inside the wallet — the docs' bootstrap order: the
   * EMAIL_OTP session that got you in is what authorizes the new credential
   * (POST /auth/credentials 202 → stamped retry → 201), and the passkey then
   * mints the session that replaces it. Every call is real and logged; the
   * nudge disappears only if it actually succeeded.
   */
  const onAddPasskey = useCallback(() => {
    if (addPasskeyInFlight.current) return;
    addPasskeyInFlight.current = true;
    const gid = newGroupId();
    void (async () => {
      try {
        // A lapsed session re-auths inside addPasskey — no entry step there.
        otpHasEntryStep.current = false;
        await gridAddPasskey({
          log: logEnvelope('Add a passkey', gid),
          promptOtp,
          onFaceId: () => playFaceId(),
        });
        setPasskeyAdded(true);
        // The next sign-in on this device is a passkey one; the CTA must say so.
        setMethods(RETURNING_METHODS);
      } catch (e) {
        // Cancelled at the system dialog, or a real failure — the panel already
        // logged whatever went out; the nudge stays so it can be retried.
        if ((e as Error)?.message !== 'cancelled') console.error('[grid-demo] add passkey', e);
      } finally {
        addPasskeyInFlight.current = false;
      }
    })();
  }, [logEnvelope, promptOtp, playFaceId]);

  /** Card issuance is on-phone only (no /cards call is made) — nothing to log. */
  const onCardIssued = useCallback(() => {
    setWallet((w) => ({ ...w, hasCard: true }));
    setCompleted((c) => ({ ...c, card: true }));
  }, []);

  const onTapToPay = useCallback(
    (cents: number, merchant: string) => {
      // On-phone only: no card authorization call exists in this demo.
      setWallet((w) => ({
        ...w,
        cardActivated: true,
        balanceCents: Math.max(0, w.balanceCents - cents),
      }));
      setCompleted((c) => ({ ...c, tap: true }));
    },
    [],
  );

  /**
   * A payment "landed" in the Receive flow. This is a demo-side event with NO
   * client call behind it, so it logs NOTHING: the panel only ever shows real
   * traffic. A genuine inbound payment shows up as the webhook Grid delivers to
   * /api/webhooks (streamed into the panel above) — it used to also synthesize a
   * POST to a fictional https://your-app.com/webhooks/grid, which read as a real
   * request and wasn't one.
   */
  const onReceivePayment = useCallback((info: ReceivePaymentInfo) => {
    const isAdd = info.intent === 'add';
    setWallet((w) => ({ ...w, balanceCents: w.balanceCents + info.amountCents }));
    setCompleted((c) => ({ ...c, [isAdd ? 'add' : 'receive']: true }));
  }, []);

  // "Sign in again" — drop back to the auth screen to replay the flow. Resets
  // the session wallet to fresh, but KEEPS the API log and the sidebar
  // checkmarks (completed flows) — only "Reset" wipes those.
  const returnToSignIn = useCallback(() => {
    setMethods(deviceHasPasskey() ? RETURNING_METHODS : FIRST_RUN_METHODS);
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
    emailPrefill,
    submitEmail,
    cancelEmail,
    passkeyAdded,
    onAddPasskey,
    depositInstructions,
    totalCents,
    walletToast,
    transferOutcome,
    storedBanks,
    onSelectStoredBank,
    onDepositView,
    onPanelAction,
    simulateDeposit,
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
