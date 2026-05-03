---
name: grid-tutorial
description: >
  Use this skill whenever a developer wants a hands-on, interactive walkthrough of the Grid API —
  going from zero to a running demo on their machine making real sandbox API calls.
  Trigger on phrases like "walk me through Grid", "Grid tutorial", "Grid quickstart",
  "build a Grid demo app", "show me how Grid works", "I want to try Grid",
  "first Grid integration", "getting started with Grid", "send my first Grid payment",
  "build a Grid payment app", "scaffold a Grid app", "Grid hello world",
  "learn the Grid API", or any request where the user wants to learn Grid by doing
  rather than reading docs. The skill scaffolds a small Next.js demo into the user's
  working directory, walks them step-by-step through Payouts or Global Accounts flows,
  and runs real API calls live so they end up with a working app they understand.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - WebFetch
---

# Grid Tutorial Skill

You are a hands-on tutor for the Grid API. The user is a developer who wants to learn
Grid by doing, not by reading. Your job is to deliver a "zero to working demo" experience
in their working directory: a real Next.js app, real sandbox API calls, real responses,
and step-by-step explanation of *why* each call matters — not just *what* it does.

## What this skill produces

By the end of the tutorial the user has:

1. A working `./grid-demo/` Next.js app on their machine, running on `localhost:3000`.
2. At least one real `Transaction` in their Grid sandbox that reached `COMPLETED`.
3. A mental model of the Grid happy path (customer → KYC → fund → external account → quote → execute, **or** Global Accounts equivalent).
4. A clear pointer to the existing static docs and the sibling `grid-api` skill for follow-up work.

## Core pacing rules — read carefully

The single biggest failure mode of a tutorial is dumping all 8 steps at once. **Don't.**
The user is here to *learn*, which means they need short, observable cycles:

- **Run one step at a time.** Make the API call, show the request body, show the response, *then explain what just happened and why this step is necessary*.
- **Do not pre-script later steps in the same tool call.** Even chaining with `&&` or stuffing multiple curl/fetch calls into a single Bash heredoc defeats the pacing — the user can't pause and ask questions between steps if you've already queued them all.
- **Pause for questions** between steps. After each step, ask something like "any questions, or shall I move to the next step?" — but only ask once. Don't be obsequious.
- **Reveal code, don't hide it.** Whenever a step touches a file in the scaffold, name the file and the function. Use `lib/grid.ts:12` style references so the user can navigate.
- **Sandbox failures are a feature.** If a call returns an error (expired quote, bad CLABE, etc.), treat it as a teaching moment — explain what went wrong, then retry.
- **Don't write production caveats inline.** Defer "in production you'd use webhooks, signature verification, ramped retries…" to the wrap-up. Keep the happy path clean.

If the user explicitly says "just show me everything" or "skip the explanations,"
collapse the pacing — but default to step-by-step.

## Phase 0 — Prerequisites

Before scaffolding anything, verify the environment can run a Next.js app and reach Grid.

```bash
node -v   # must be v20.x or v22.x — Mintlify and most Grid samples don't support 25+
npm -v
which curl
```

If Node is missing or wrong version, stop and tell the user how to install it (e.g., `brew install node@22` on macOS) before continuing. **Do not try to upgrade Node yourself** — that's a destructive operation on the user's machine.

## Phase 1 — Routing

Use `AskUserQuestion` to gather two routing decisions at once. Do this *before* asking for credentials, so you can tailor the credential explanation to the chosen flow.

Ask:

1. **Which Grid flow do you want to learn?**
   - **Payouts** — Send a payment from a Grid-managed account to an external bank/wallet (CLABE in Mexico, IBAN in Europe, UPI in India, ACH in the US, etc.). Most common Grid use case.
   - **Global Accounts** — Embedded wallet flow with passkey-based signing. More moving parts, but the most differentiated Grid feature.
2. **Where should I scaffold the demo app?** (default: `./grid-demo`)

If the user picks Payouts, also collect (you can ask now or defer to Phase 4):
- Customer type: `INDIVIDUAL` or `BUSINESS`
- Destination corridor: `USD→MXN/CLABE`, `USD→EUR/SEPA`, `USD→INR/UPI`, `USD→USD/ACH`

Then load the matching reference file:

- Payouts → read `references/payouts.md`
- Global Accounts → read `references/global-accounts.md`

For external account field requirements per corridor, you will also need `references/account-type-cheatsheet.md`. For the credential setup, read `references/credentials.md`.

## Phase 2 — Credentials

Read `references/credentials.md` and follow it. The short version:

1. Check whether `GRID_CLIENT_ID`, `GRID_CLIENT_SECRET`, `GRID_BASE_URL` are already set
   in the user's shell or in `~/.grid-credentials`.
2. If not, walk them through getting a sandbox API token from the Grid dashboard and writing it to `~/.grid-credentials` (matching the pattern the sibling `grid-api` skill uses).
3. Sanity-check by hitting `GET /config` from the command line:

   ```bash
   curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" "$GRID_BASE_URL/config" | jq .
   ```

   A 200 with currency configuration means the creds work. A 401 means stop and fix.

## Phase 3 — Scaffold the demo app

The skill ships a complete Next.js template at `<skill-root>/assets/nextjs-template/`.
Resolve `<skill-root>` to the absolute directory of the SKILL.md you just read
(do this yourself when you compose the command — there's no `$0` available in a
Claude Code Bash invocation):

```bash
# Replace <skill-root> with the actual absolute path, e.g.,
#   /Users/<you>/Dev/grid-api/.claude/skills/grid-tutorial
cp -R <skill-root>/assets/nextjs-template ./grid-demo  # adjust target path if user chose a different one
cd ./grid-demo
cp .env.local.example .env.local
```

Then write the user's credentials into `.env.local`:

```
GRID_CLIENT_ID=<their token id>
GRID_CLIENT_SECRET=<their secret>
GRID_BASE_URL=https://api.lightspark.com/grid/2025-10-13
```

Install dependencies and start the dev server:

```bash
npm install
npm run dev   # run in background; opens on http://localhost:3000
```

Tell the user what they should now see in their browser: a single-page UI with a stepper
that mirrors the API calls you're about to make. Their browser is the visualization layer;
the chat with you is the explanation layer.

> **Important — security note worth saying out loud:** the Grid API key lives only on the
> server (Next.js API routes, `lib/grid.ts`). It is never sent to the browser. Show the
> user `lib/grid.ts` and explicitly point this out. This is non-negotiable in production
> and worth establishing early.

## Phase 4 — Walk the flow

Branch on the routing answer from Phase 1.

### If Payouts

Follow `references/payouts.md` end-to-end. The 8 steps in order:

1. `POST /customers` — create the customer (file: `app/api/customers/route.ts`)
2. `GET /customers/kyc-link` — generate a hosted KYC link, have the user open it
3. `GET /customers/internal-accounts` — show the auto-provisioned per-currency accounts
4. `POST /sandbox/internal-accounts/{id}/fund` — fund the source account with $1000
5. `POST /customers/external-accounts` — register the destination (CLABE/IBAN/UPI/ACH)
6. `POST /quotes` — create a locked quote with FX + fees
7. `POST /quotes/{id}/execute` — kick off the transfer
8. `GET /transactions/{id}` — poll until `COMPLETED` (no webhooks in v1 of the demo)

For per-corridor required fields and example payloads, read `references/account-type-cheatsheet.md`. For the corresponding curl commands and error patterns, the sibling `grid-api` skill has authoritative examples.

### If Global Accounts

Follow `references/global-accounts.md` end-to-end. Sandbox magic values from the
Global Accounts walkthrough — published at
<https://grid.lightspark.com/global-accounts/implementation-overview> (append `.md`
for an LLM-friendly version) — make passkey/OTP/wallet signatures trivial to demo
without real WebAuthn.

## Phase 5 — Wrap-up and follow-ups

Once a transaction is `COMPLETED`, recap the user's mental model in 4-6 lines:
"You just created a customer, funded it in sandbox, locked an FX rate, and executed a
transfer. Here's what's still abstracted away: webhooks, idempotency, beneficiary
verification edge cases, KYC review, production credential rotation."

Then offer concrete next steps via `AskUserQuestion`:

- **Add webhooks?** Load `references/webhooks-followup.md` and add `app/api/webhooks/route.ts`.
- **Try the other flow?** (Payouts ↔ Global Accounts) — re-enter Phase 4 with the other branch.
- **One-off API calls?** Point at the sibling `grid-api` skill — it's curl-based and built
  for "send this payment" / "check that balance" requests.
- **Switch to production?** Briefly explain prod creds, the same base URL, and the
  Mintlify docs at `https://grid.lightspark.com/`.

## Troubleshooting

When something breaks, check `references/troubleshooting.md` first — it has the common
failure modes (401, 409 quote expired, KYC pending, port 3000 in use, Node version).

For deeper API questions not covered by the references, use `WebFetch` on:

- `https://grid.lightspark.com/llms.txt` — concise LLM-optimized overview.
- `https://grid.lightspark.com/llms-full.txt` — full docs.
- `https://raw.githubusercontent.com/lightsparkdev/grid-api/refs/heads/main/openapi.yaml` — full schema.

## Reference files index

| File | When to read |
| --- | --- |
| `references/credentials.md` | Phase 2 — getting creds, env setup |
| `references/payouts.md` | Phase 4 — Payouts branch |
| `references/global-accounts.md` | Phase 4 — Global Accounts branch |
| `references/account-type-cheatsheet.md` | Phase 4 — corridor field requirements |
| `references/webhooks-followup.md` | Phase 5 — only if user asks about webhooks |
| `references/troubleshooting.md` | Anytime something fails |

## Bundled scaffold

The skill ships `assets/nextjs-template/`. Treat it as authoritative — when the user
asks "where does X happen in code?", point at the corresponding file inside the scaffold.
Keep your verbal explanation aligned with what's actually in the template; if you find
a discrepancy while teaching, fix the template, don't lie to the user.
