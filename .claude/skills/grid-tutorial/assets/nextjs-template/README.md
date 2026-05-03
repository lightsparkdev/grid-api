# Grid demo

A minimal Next.js demo of the Grid API. Scaffolded by the `grid-tutorial` skill — but
fully self-contained, so you can come back to it weeks later without the skill loaded.

## What it does

A single page that walks an end-to-end Grid payout in 8 steps:

1. Create a customer
2. Generate a hosted KYC link
3. List the customer's auto-provisioned internal accounts
4. Fund the source account via the sandbox faucet
5. Register an external destination account
6. Create a locked-rate quote
7. Execute the quote
8. Poll the resulting transaction to completion

Each step calls a Next.js API route (under `app/api/`), which calls Grid via the
`@lightsparkdev/grid` SDK from `lib/grid.ts`. The Grid API key never leaves the server.

## Setup

Requires Node 20 or 22.

```bash
cp .env.local.example .env.local
# edit .env.local — paste your sandbox GRID_CLIENT_ID and GRID_CLIENT_SECRET
npm install
npm run dev
```

Open `http://localhost:3000`.

## Where things live

```
app/
  page.tsx            One-page UI; one button per step.
  layout.tsx          App shell.
  globals.css         Minimal styles.
  api/
    config/           GET /config — connectivity sanity check.
    customers/        POST /customers (and /kyc-link sub-route).
    internal-accounts/  GET /customers/internal-accounts.
    sandbox-fund/     POST /sandbox/internal-accounts/{id}/fund.
    external-accounts/  POST /customers/external-accounts.
    quotes/           POST /quotes (and /execute sub-route).
    transactions/     GET /transactions/{id}.
lib/
  grid.ts             Constructs the Grid SDK client from env vars.
```

## Next steps

- Add a webhook receiver: see `references/webhooks-followup.md` in the skill.
- Switch to production: replace the sandbox creds with prod creds. Same base URL.
- Try the other flow (Global Accounts): re-run the skill, pick "Global Accounts".
- Read the published docs: <https://grid.lightspark.com/>.

## Share the skill that built this

Teammates can install the same `grid-tutorial` skill in one command:

```bash
npx skills add lightsparkdev/grid-api --skill grid-tutorial -g -a claude-code
```

Then in Claude Code: *"walk me through Grid"* or *"I want to try Grid for the first time"*.

To install both Grid skills (this tutorial + the curl-based `grid-api` skill for one-off API calls):

```bash
npx skills add lightsparkdev/grid-api --skill '*' -g -a claude-code
```

## License

MIT — this is starter code; modify freely.
