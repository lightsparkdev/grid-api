# Grid API Sample Application Design

## Overview

A sample application demonstrating the Grid API payout flow using the Grid Kotlin SDK. Consists of a shared Vite/React frontend and a Kotlin (Ktor) backend. The frontend is reusable with future backend implementations in other languages.

## Architecture

**Approach:** Thin backend proxy. The Kotlin backend holds API credentials, translates frontend JSON requests into Grid SDK builder calls, and returns raw JSON responses. The frontend orchestrates the step-by-step wizard flow. Webhooks stream from backend to frontend via SSE.

## Directory Structure

```
samples/
├── frontend/                     # Shared Vite + React + Tailwind frontend
│   ├── package.json
│   ├── vite.config.ts            # Proxies /api → localhost:8080
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx               # Wizard flow + webhook panel
│       ├── components/
│       │   ├── StepWizard.tsx    # Step container with progress indicator
│       │   ├── JsonEditor.tsx    # Editable JSON textarea
│       │   ├── ResponsePanel.tsx # Shows API response JSON
│       │   └── WebhookStream.tsx # SSE-connected live webhook feed
│       ├── steps/
│       │   ├── CreateCustomer.tsx
│       │   ├── CreateExternalAccount.tsx
│       │   ├── CreateQuote.tsx
│       │   ├── ExecuteQuote.tsx
│       │   └── SandboxFund.tsx
│       └── lib/
│           └── api.ts            # fetch wrappers for /api/* endpoints
│
├── kotlin/                       # Kotlin backend sample
│   ├── README.md
│   ├── .env.example
│   ├── build.gradle.kts
│   ├── settings.gradle.kts
│   ├── gradle.properties
│   ├── gradlew / gradlew.bat
│   └── src/main/kotlin/com/grid/sample/
│       ├── Application.kt
│       ├── Config.kt
│       ├── GridClientBuilder.kt
│       ├── Routing.kt
│       ├── WebhookStream.kt
│       ├── JsonUtils.kt
│       └── routes/
│           ├── Customers.kt
│           ├── ExternalAccounts.kt
│           ├── Quotes.kt
│           ├── Sandbox.kt
│           ├── Webhooks.kt
│           └── Sse.kt
│
└── README.md
```

## API Contract

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/customers` | Create an individual customer |
| `POST` | `/api/customers/{customerId}/external-accounts` | Create a USD external bank account |
| `POST` | `/api/quotes` | Create a quote (USDC internal → USD external) |
| `POST` | `/api/quotes/{quoteId}/execute` | Execute the quote to initiate payment |
| `POST` | `/api/sandbox/send-funds` | Simulate funding for the quote |
| `POST` | `/api/webhooks` | Receives webhooks from Grid (not called by frontend) |
| `GET`  | `/api/sse` | SSE stream of webhook events to frontend |

## Step-by-Step Flow

### Step 1 — Create Customer

```json
// POST /api/customers
{
  "customerType": "INDIVIDUAL",
  "platformCustomerId": "sample-customer-001"
}
// Response includes `id` → used in Step 2
```

### Step 2 — Create External Account

```json
// POST /api/customers/{customerId}/external-accounts
{
  "currency": "USD",
  "accountInfo": {
    "accountType": "CHECKING",
    "routingNumber": "021000021",
    "accountNumber": "123456789"
  }
}
// Response includes `id` → used in Step 3
```

### Step 3 — Create Quote

```json
// POST /api/quotes
{
  "source": { "internalAccountId": "<platform USDC internal account>" },
  "destination": { "externalAccountId": "<from step 2>" },
  "lockedCurrencyAmount": 1000,
  "lockedCurrencySide": "SENDING"
}
// Response includes `quoteId` → used in Steps 4 and 5
```

### Step 4 — Execute Quote

```json
// POST /api/quotes/{quoteId}/execute
// No body needed
// Response: updated quote with status change
```

### Step 5 — Sandbox Fund

```json
// POST /api/sandbox/send-funds
{
  "quoteId": "<from step 3>"
}
// Response: sandbox funding confirmation
```

## Frontend Design

### Layout

Two-panel layout:

- **Left (60%):** Step wizard with vertical stepper. Active step shows editable JSON textarea and submit button. Response panel below. Completed steps collapse to summary. Future steps grayed out.
- **Right (40%):** Webhook stream panel. SSE connection on page load with auto-reconnect. Newest events at top. Each shows timestamp, event type badge, expandable raw JSON.

### Tech Stack

React 18, TypeScript, Vite 5, Tailwind CSS 4. No component libraries.

### Data Flow Between Steps

The frontend auto-populates IDs from previous responses into the next step's JSON template. Users can edit any value before submitting.

## Backend Design (Kotlin)

### Server

Ktor 3.x with Netty engine. CORS enabled for all origins. SSE plugin installed.

### Request Handling Pattern

Each route handler:
1. Receives raw JSON string from request body
2. Parses with Jackson into `JsonNode`
3. Builds Grid SDK params using builder pattern
4. Calls Grid SDK
5. Returns SDK response as JSON

### Key Components

- **`Config.kt`** — Loads `GRID_API_TOKEN_ID`, `GRID_API_CLIENT_SECRET`, `GRID_WEBHOOK_PUBLIC_KEY` from `.env` or system env vars via dotenv-kotlin
- **`GridClientBuilder.kt`** — Lazy singleton `GridOkHttpClient`
- **`WebhookStream.kt`** — `MutableSharedFlow<String>(replay = 10)` for broadcasting webhook events
- **`Webhooks.kt`** — Verifies P-256 ECDSA signature via `X-Grid-Signature` header, broadcasts to `WebhookStream`
- **`Sse.kt`** — Collects from `WebhookStream.eventFlow`, sends as `ServerSentEvent`. Heartbeat endpoint for keep-alive.

### Dependencies

- Grid Kotlin SDK (published Maven artifact from `com.grid:grid-kotlin`)
- Ktor 3.x (server-core, server-netty, server-cors, server-sse, server-content-negotiation)
- Jackson (kotlin module)
- dotenv-kotlin
- Logback

### Error Handling

Minimal. SDK exceptions caught and returned as JSON with appropriate HTTP status.

## README Structure

### `samples/README.md`

Overview of the sample apps, directory structure, links to sub-READMEs.

### `samples/kotlin/README.md`

1. Overview of what the sample demonstrates
2. Prerequisites: Java 21+, Node.js 18+, Grid API sandbox credentials
3. Setup: copy `.env.example`, fill in credentials
4. Running: two terminals (backend `./gradlew run` on :8080, frontend `npm run dev` on :5173)
5. Webhook setup: ngrok for local dev, configure webhook URL in Grid dashboard
6. Walkthrough of each wizard step

### `samples/frontend/README.md`

How to run, how to configure proxy target for different backends.
