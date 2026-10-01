# Grid API TypeScript Sample

A sample application demonstrating the Grid API payout flow using the [Grid TypeScript SDK](https://www.npmjs.com/package/@lightsparkdev/grid).

## What It Does

This sample walks through a complete payout:

1. **Create Customer** — Register an individual customer on the platform
2. **Create External Account** — Link a USD bank account to the customer
3. **Create Quote** — Get a real-time quote for USDC to USD conversion
4. **Sandbox Fund** — Simulate funding to complete the transaction

Webhook events are streamed to the frontend in real time via Server-Sent Events (SSE).

## Prerequisites

- **Node.js 18+**
- **Grid API sandbox credentials** (Reach out to your contact at lightspark or sales@lightspark.com to get them)

## Setup

1. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

2. Fill in your credentials in `.env`:

   ```bash
   GRID_API_TOKEN_ID=your_api_token_id
   GRID_API_CLIENT_SECRET=your_api_client_secret
   ```

## Running

### Option 1: Single command (recommended)

Builds the frontend, then starts the server:

```bash
cd samples/typescript
npm install
npm start
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

### Option 2: Separate dev servers (for frontend development)

If you're iterating on the frontend, run them separately for hot reload:

**Terminal 1 — Backend (port 8080):**

```bash
cd samples/typescript
npm install
npm run dev
```

**Terminal 2 — Frontend (port 5173):**

```bash
cd samples/frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. The Vite dev server proxies `/api` requests to the backend.

## Webhook Setup

To receive webhooks locally, expose your backend with a tunnel:

```bash
ngrok http 8080
```

Then configure the webhook URL in your [Grid dashboard](https://app.lightspark.com) as:

```
https://<your-ngrok-id>.ngrok.io/api/webhooks
```

## Architecture

```
Browser (React)  →  Vite Dev Server (:5173)  →  Express Backend (:8080)  →  Grid API
                         proxy /api                 Grid TypeScript SDK
                                                         ↑
                                              Grid Webhooks (POST)
                                                         ↓
                                              SSE stream → Browser
```

The backend is a thin proxy — it holds your API credentials and translates JSON requests into Grid SDK calls. The frontend handles the step-by-step wizard flow.

## Sample Requests

Grid API calls are in `src/routes/`:

| File | Description |
|------|-------------|
| [`customers.ts`](src/routes/customers.ts) | Create a customer via `client.customers.create()` |
| [`externalAccounts.ts`](src/routes/externalAccounts.ts) | Link a bank account via `client.customers.externalAccounts.create()` |
| [`quotes.ts`](src/routes/quotes.ts) | Create and execute a quote via `client.quotes.create()` / `client.quotes.execute()` |
| [`sandbox.ts`](src/routes/sandbox.ts) | Simulate funding via `client.sandbox.sendFunds()` |
| [`webhooks.ts`](src/routes/webhooks.ts) | Receive incoming webhooks |

Client initialization is in [`gridClient.ts`](src/gridClient.ts).
