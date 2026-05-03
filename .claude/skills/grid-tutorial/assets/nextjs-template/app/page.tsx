"use client";

import { useEffect, useState } from "react";

type StepResult = { status?: number; body?: unknown; error?: string };

const STORAGE_KEY = "grid-demo-state";

type DemoState = {
  platformCustomerId: string;
  customerId: string;
  internalAccountId: string;
  externalAccountId: string;
  quoteId: string;
  transactionId: string;
};

const emptyState: DemoState = {
  platformCustomerId: "",
  customerId: "",
  internalAccountId: "",
  externalAccountId: "",
  quoteId: "",
  transactionId: "",
};

function useDemoState() {
  const [state, setState] = useState<DemoState>(emptyState);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setState({ ...emptyState, ...JSON.parse(raw) });
      } catch {}
    }
  }, []);

  const update = (patch: Partial<DemoState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(emptyState);
  };

  return { state, update, reset };
}

function Step({
  n,
  title,
  endpoint,
  children,
  result,
}: {
  n: number;
  title: string;
  endpoint: string;
  children: React.ReactNode;
  result?: StepResult;
}) {
  return (
    <section className="step">
      <header>
        <div>
          <div className="title">Step {n} — {title}</div>
          <div className="endpoint">{endpoint}</div>
        </div>
      </header>
      {children}
      {result && (
        <>
          {result.error && <div className="error">{result.error}</div>}
          {result.body !== undefined && (
            <pre>{JSON.stringify(result.body, null, 2)}</pre>
          )}
        </>
      )}
    </section>
  );
}

async function call(path: string, init?: RequestInit): Promise<StepResult> {
  try {
    const res = await fetch(path, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
    const body = await res.json().catch(() => ({}));
    return res.ok
      ? { status: res.status, body }
      : { status: res.status, body, error: `HTTP ${res.status}` };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export default function Home() {
  const { state, update, reset } = useDemoState();
  const [results, setResults] = useState<Record<string, StepResult>>({});

  // Form state for sub-fields the UI needs to collect.
  const [fullName, setFullName] = useState("Ada Lovelace");
  const [clabe, setClabe] = useState("002010000000000001");
  const [sendCents, setSendCents] = useState(50000);

  const setResult = (key: string, value: StepResult) =>
    setResults((prev) => ({ ...prev, [key]: value }));

  return (
    <main>
      <h1>Grid demo</h1>
      <p className="lede">
        Walk through the Payouts happy path. Each step calls a Next.js API route
        in <code>app/api/</code>, which proxies to Grid via <code>lib/grid.ts</code>.
      </p>

      <Step n={0} title="Sanity check creds" endpoint="GET /config" result={results.config}>
        <button onClick={async () => setResult("config", await call("/api/config"))}>
          Run
        </button>
      </Step>

      <Step n={1} title="Create customer" endpoint="POST /customers" result={results.customer}>
        <label>Full name</label>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <button
          style={{ marginTop: 10 }}
          onClick={async () => {
            const platformCustomerId = `tutorial-${Date.now()}`;
            const r = await call("/api/customers", {
              method: "POST",
              body: JSON.stringify({
                platformCustomerId,
                customerType: "INDIVIDUAL",
                region: "US",
                email: `${platformCustomerId}@example.com`,
                fullName,
                birthDate: "1990-01-15",
                nationality: "US",
              }),
            });
            const id = (r.body as { id?: string } | undefined)?.id;
            if (id) update({ platformCustomerId, customerId: id });
            setResult("customer", r);
          }}
        >
          Run
        </button>
      </Step>

      <Step n={2} title="Hosted KYC link" endpoint="GET /customers/kyc-link" result={results.kyc}>
        <button
          disabled={!state.platformCustomerId}
          onClick={async () => {
            const r = await call(
              `/api/customers/kyc-link?platformCustomerId=${encodeURIComponent(state.platformCustomerId)}&redirectUri=${encodeURIComponent("http://localhost:3000")}`,
            );
            setResult("kyc", r);
          }}
        >
          {state.platformCustomerId ? "Get KYC link" : "Run step 1 first"}
        </button>
      </Step>

      <Step n={3} title="List internal accounts" endpoint="GET /customers/internal-accounts" result={results.accounts}>
        <button
          disabled={!state.customerId}
          onClick={async () => {
            const r = await call(`/api/internal-accounts?customerId=${encodeURIComponent(state.customerId)}`);
            const usd = (r.body as { data?: Array<{ id?: string; currency?: { code?: string } }> } | undefined)?.data?.find(
              (a) => a.currency?.code === "USD",
            );
            if (usd?.id) update({ internalAccountId: usd.id });
            setResult("accounts", r);
          }}
        >
          {state.customerId ? "Run" : "Run step 1 first"}
        </button>
      </Step>

      <Step n={4} title="Fund the USD account" endpoint="POST /sandbox/internal-accounts/{id}/fund" result={results.fund}>
        <button
          disabled={!state.internalAccountId}
          onClick={async () => {
            const r = await call("/api/sandbox-fund", {
              method: "POST",
              body: JSON.stringify({ accountId: state.internalAccountId, amount: 100000 }),
            });
            setResult("fund", r);
          }}
        >
          {state.internalAccountId ? "Fund $1,000" : "Run step 3 first"}
        </button>
      </Step>

      <Step n={5} title="Add MXN external account" endpoint="POST /customers/external-accounts" result={results.external}>
        <label>CLABE (18 digits, ends in 001 for sandbox-success)</label>
        <input value={clabe} onChange={(e) => setClabe(e.target.value)} />
        <button
          style={{ marginTop: 10 }}
          disabled={!state.customerId}
          onClick={async () => {
            const r = await call("/api/external-accounts", {
              method: "POST",
              body: JSON.stringify({
                customerId: state.customerId,
                currency: "MXN",
                accountInfo: {
                  accountType: "MXN_ACCOUNT",
                  paymentRails: ["SPEI"],
                  clabeNumber: clabe,
                  beneficiary: {
                    beneficiaryType: "INDIVIDUAL",
                    fullName: "Beneficiary Demo",
                    birthDate: "1990-01-15",
                    nationality: "MX",
                  },
                },
              }),
            });
            const id = (r.body as { id?: string } | undefined)?.id;
            if (id) update({ externalAccountId: id });
            setResult("external", r);
          }}
        >
          {state.customerId ? "Run" : "Run step 1 first"}
        </button>
      </Step>

      <Step n={6} title="Create quote" endpoint="POST /quotes" result={results.quote}>
        <label>Sending amount (USD cents)</label>
        <input
          type="number"
          value={sendCents}
          onChange={(e) => setSendCents(Number(e.target.value) || 0)}
        />
        <button
          style={{ marginTop: 10 }}
          disabled={!state.internalAccountId || !state.externalAccountId}
          onClick={async () => {
            const r = await call("/api/quotes", {
              method: "POST",
              body: JSON.stringify({
                source: { sourceType: "ACCOUNT", accountId: state.internalAccountId },
                destination: {
                  destinationType: "ACCOUNT",
                  accountId: state.externalAccountId,
                  currency: "MXN",
                },
                lockedCurrencyAmount: sendCents,
                lockedCurrencySide: "SENDING",
              }),
            });
            const id = (r.body as { id?: string } | undefined)?.id;
            if (id) update({ quoteId: id });
            setResult("quote", r);
          }}
        >
          {state.internalAccountId && state.externalAccountId ? "Run" : "Run steps 3–5 first"}
        </button>
      </Step>

      <Step n={7} title="Execute quote" endpoint="POST /quotes/{id}/execute" result={results.execute}>
        <button
          disabled={!state.quoteId}
          onClick={async () => {
            const r = await call("/api/quotes/execute", {
              method: "POST",
              body: JSON.stringify({ quoteId: state.quoteId }),
            });
            const txId = (r.body as { transactionId?: string } | undefined)?.transactionId;
            if (txId) update({ transactionId: txId });
            setResult("execute", r);
          }}
        >
          {state.quoteId ? "Run" : "Run step 6 first"}
        </button>
      </Step>

      <Step n={8} title="Poll transaction" endpoint="GET /transactions/{id}" result={results.transaction}>
        <button
          disabled={!state.transactionId}
          onClick={async () => {
            const r = await call(`/api/transactions?id=${encodeURIComponent(state.transactionId)}`);
            setResult("transaction", r);
          }}
        >
          {state.transactionId ? "Refresh" : "Run step 7 first"}
        </button>
      </Step>

      <section style={{ marginTop: 24 }}>
        <button onClick={reset} style={{ background: "#666" }}>Reset state</button>
      </section>
    </main>
  );
}
