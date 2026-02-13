# Grid API Kotlin Sample

A sample application demonstrating the Grid API payout flow using the [Grid Kotlin SDK](https://github.com/lightsparkdev/grid-kotlin-sdk).

## What It Does

This sample walks through a complete payout:

1. **Create Customer** — Register an individual customer on the platform
2. **Create External Account** — Link a USD bank account to the customer
3. **Create Quote** — Get a real-time quote for USDC to USD conversion
4. **Sandbox Fund** — Simulate funding to complete the transaction

Webhook events are streamed to the frontend in real time via Server-Sent Events (SSE).

## Prerequisites

- **Java 21+**
- **Node.js 18+** (for the frontend)
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
   GRID_WEBHOOK_PUBLIC_KEY=your_webhook_public_key
   ```

## Running

### Option 1: Single command (recommended)

The Gradle build automatically installs frontend dependencies, builds the React app, and serves it from the backend:

```bash
cd samples/kotlin
./gradlew run
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

### Option 2: Separate dev servers (for frontend development)

If you're iterating on the frontend, run them separately for hot reload:

**Terminal 1 — Backend (port 8080):**

```bash
cd samples/kotlin
./gradlew run
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
Browser (React)  →  Vite Dev Server (:5173)  →  Ktor Backend (:8080)  →  Grid API
                         proxy /api                 Grid Kotlin SDK
                                                         ↑
                                              Grid Webhooks (POST)
                                                         ↓
                                              SSE stream → Browser
```

The backend is a thin proxy — it holds your API credentials and translates JSON requests into Grid SDK calls. The frontend handles the step-by-step wizard flow.

## Sample Requests

Grid API calls are in `src/main/kotlin/com/grid/sample/routes/`:

| File | Description |
|------|-------------|
| [`Customers.kt`](src/main/kotlin/com/grid/sample/routes/Customers.kt) | Create a customer via `clients.customers().create()` |
| [`ExternalAccounts.kt`](src/main/kotlin/com/grid/sample/routes/ExternalAccounts.kt) | Link a bank account via `client.customers().externalAccounts().create()` |
| [`Quotes.kt`](src/main/kotlin/com/grid/sample/routes/Quotes.kt) | Create a quote via `client.quotes().create()` |
| [`Sandbox.kt`](src/main/kotlin/com/grid/sample/routes/Sandbox.kt) | Simulate funding via `client.sandbox().sendFunds()` |
| [`Webhooks.kt`](src/main/kotlin/com/grid/sample/routes/Webhooks.kt) | Parse incoming webhooks via `client.webhooks().unwrap()` |

Client initialization is in [`GridClientBuilder.kt`](src/main/kotlin/com/grid/sample/GridClientBuilder.kt).
