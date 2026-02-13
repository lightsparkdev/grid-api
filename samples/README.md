# Grid API Samples

Sample applications demonstrating the Grid API payout flow — creating a customer, linking a bank account, creating a quote, and simulating funding in the sandbox.

## Structure

```
samples/
├── frontend/   # Shared React frontend (works with any backend)
└── kotlin/     # Kotlin (Ktor) backend using the Grid Kotlin SDK
```

## Quick Start

See the [Kotlin backend README](kotlin/README.md) for setup instructions.

## Adding a New Language Backend

Each backend must implement the same API contract:

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/customers` | Create a customer |
| POST | `/api/customers/{id}/external-accounts` | Create an external account |
| POST | `/api/quotes` | Create a quote |
| POST | `/api/sandbox/send-funds` | Simulate sandbox funding |
| POST | `/api/webhooks` | Receive webhook events from Grid |
| GET  | `/api/sse` | Stream webhook events to the frontend via SSE |

The backend should run on port `8080`. The frontend proxies `/api` requests to `http://localhost:8080`.
