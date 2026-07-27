# Grid Wallet Prod

Live demo of the **Grid Global Accounts** wallet lifecycle, running against the real Grid API,
forked from [`components/grid-wallet-demo`](../grid-wallet-demo) (the scripted variant embedded in
the Grid docs). Same stack and design system: Next.js 14 + React 18 + TypeScript, SCSS modules,
`@lightsparkdev/origin` tokens + text-style mixins, `@central-icons-react` icons, `motion`.

Differences from the demo:

- No config sidebar — the layout is the phone plus the API panel.
- The use case is pinned to **Fintech**, and the bank corridors to the **US + euro area**
  (ACH/wire/RTP and SEPA — the two rails this wallet settles).
- Calls are **real**. The panel shows only traffic that actually happened: the request and response
  of every call to Grid, plus webhooks Grid delivered. A flow with no client call behind it (card
  issuance, tap to pay) logs nothing rather than inventing a request.

## Auth

Sign-in leads with the credential a Global Account is actually born with — `EMAIL_OTP`, with the
entry step prefilled from that credential's own `nickname`. A passkey is added **later**, from the
wallet, as its own signed action (one device ceremony, authorized by the live session). Once this
device has registered a passkey the sign-in button says so, and the passkey carries subsequent
sign-ins.

Passkeys are device-bound: one listed on the account but registered on another device is ignored
here, because `navigator.credentials.get` in this browser could never satisfy it.

A session lasts 15 minutes. Inside it, no re-authentication — each signed action (a cash-out)
stamps the quote's `payloadToSign` with the session key. Past it, the next signed action
re-authenticates in place.

## Money in

Two shapes, and the API only supports each one way:

- **Push** — a country's deposit instructions, read off the customer's own fiat account
  (`GET /customers/internal-accounts`): account number, routing number, the rails they settle on,
  and the reference that credits the deposit. The EUR block is a marked placeholder
  (`src/data/placeholderDeposit.ts`) until the customer has an EUR internal account; the read
  already returns one section per fiat account, so a real one appears with no code change.
- **Pull** — "add an account", which quotes from the registered `ExternalAccount`. Grid rejects
  `POST /quotes/{id}/execute` for such a quote ("funds must be pushed to Lightspark from the source
  account"), so the quote is created and left pending until the payment lands. Amounts here are in
  USD cents, not the wallet's USDB micro-units.
- **Crypto** — USDC on Base / Solana / Ethereum: pick a network, enter an amount, and the screen
  shows the real Grid-provisioned deposit address for that chain.

Arrival is reported by **webhook**, not by tapping: `INCOMING_PAYMENT.COMPLETED` drives the toast
and the Activity row, and the balance is re-read from the API.

## Webhooks

`POST /api/webhooks` verifies `X-Grid-Signature` against `GRID_WEBHOOK_PUBKEY` (SHA256/ECDSA over
the raw body, P-256 SPKI PEM). Grid sends `{"v":"1","s":"<base64>"}`; a bare base64 header is also
accepted, per the docs. Verified deliveries are **pushed** to the panel over SSE
(`GET /api/webhooks/stream`) — nothing polls.

To receive real deliveries locally, tunnel the port and register the URL with your platform:

```bash
ngrok http 4001    # then register https://<id>.ngrok-free.app/api/webhooks
```

## Develop

```bash
cp .env.example .env.local     # then fill in the values (see below)
npm install --ignore-scripts   # --ignore-scripts avoids a central-icons license postinstall
npm run dev                    # http://localhost:4001 (grid-wallet-demo keeps 4000)
npm test                       # vitest
```

`NEXT_PUBLIC_GRID_SANDBOX=true` gates the sandbox-only "simulate funding" button in the API panel.
`NEXT_PUBLIC_*` is inlined at **build** time, so a production build must omit it.

There's also a `Dockerfile` (`output: 'standalone'`, port 4001):

```bash
docker build -t grid-wallet-prod --build-arg NEXT_PUBLIC_GRID_SANDBOX=true .
docker run --rm -p 4001:4001 --env-file .env.local grid-wallet-prod
```

## Sandbox notes

- The magic OTP is `000000`. Sandbox **skips email delivery** — the code the phone "receives" is
  simulated; the HPKE encryption and signature verification around it are real.
- `POST /sandbox/send` stands in for a customer pushing funds to a pending quote. That's what the
  panel's "Simulate funding" button calls when a pull quote is waiting.
- A direct sandbox fund of the wallet itself (`POST /sandbox/internal-accounts/{id}/fund`) only
  mints **book** balance with no on-chain USDB, which is why the balance hero shows available with
  the account total beneath — the two diverge in sandbox. The instructions-screen stand-in funds the
  platform's USD account and on-ramps from it instead.
- Any fee Grid's on-ramp charges comes straight out of the real quote (observed anywhere from $0 to
  ~$0.20 on a $5–$20 add across sandbox runs), so the balance credit can land at or slightly under
  the amount you added — that's real fee behavior, not a bug.
