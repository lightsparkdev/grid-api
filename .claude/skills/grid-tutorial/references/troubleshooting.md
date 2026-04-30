# Troubleshooting

Common failure modes during the tutorial and how to handle them. Read this any time
something breaks before you go fishing in the OpenAPI spec.

## 401 Unauthorized

**Symptom:** Any API call returns `401`. Often happens immediately after pasting creds.

**Causes & fixes:**

1. Secret was truncated when copied (the dashboard shows it once — easy to miss the trailing characters).
2. `.env.local` not picked up — Next.js only reads it at server startup. Restart `npm run dev`.
3. Used the wrong env vars (e.g., `GRID_API_TOKEN_ID` instead of `GRID_CLIENT_ID`). The template uses `GRID_CLIENT_ID` / `GRID_CLIENT_SECRET`.
4. Mixed sandbox creds with prod base URL or vice-versa. Same URL works for both, but the credential pair must match the environment they were created in.

Quick verification:

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" "$GRID_BASE_URL/config" -o /dev/null -w "%{http_code}\n"
```

`200` → creds work. `401` → fix above. `000`/timeout → network issue.

## 400 Bad Request on `POST /quotes`

**Symptom:** Quote creation rejected.

**Common causes:**

1. **Missing `currency` in the destination object.** Even though the external account already declares its currency, the quote body needs it explicitly. Most common Payouts step 6 error.
2. `lockedCurrencyAmount` not in smallest units (cents/sats). `100` for USD = $1.00, not $100.
3. `lockedCurrencySide` typo'd — must be `"SENDING"` or `"RECEIVING"`, exact case.
4. Internal account doesn't have enough balance. Check via `GET /customers/internal-accounts` after step 4.

## `QUOTE_EXPIRED` on execute

**Symptom:** `POST /quotes/{id}/execute` returns 4xx with `code: "QUOTE_EXPIRED"`.

**Fix:** Quotes live ~5 minutes. Re-run step 6 (create a new quote) and step 7 quickly.

If the user was reading explanations slowly between steps 6 and 7, this is normal —
no need to apologize for it; just re-run.

## Customer status stuck on `PENDING`

**Symptom:** Tutorial step 2 (KYC) never flips the customer to `ACTIVE`.

**Fixes:**

1. Confirm the user actually opened the hosted KYC URL and walked through the form. The link is single-use; if dismissed, generate a new one with `GET /customers/kyc-link`.
2. Sandbox occasionally takes 10-30 seconds to flip status. Refresh `GET /customers/{id}` a few times.
3. If still pending, the platform config might require manual approval — check the dashboard's verifications panel.

## `INSUFFICIENT_BALANCE`

**Symptom:** Step 7 (execute) fails with insufficient balance even though step 4 funded the account.

**Causes:**

1. Quote source was the wrong internal account. Each customer has a per-currency account; make sure the source ID matches the *funded* one.
2. Step 4 hit a sandbox failure path because the CLABE/destination has a "fail" suffix. Double-check the response body of step 4.

## `POST /sandbox/internal-accounts/.../fund` returns 404

**Symptom:** Sandbox funding endpoint not found.

**Cause:** The credentials are pointing at production, not sandbox. Sandbox endpoints don't exist in prod. Verify with `GET /config` — the response shape and contents differ between envs (sandbox typically has a `sandbox: true` flag or includes test currencies).

## `EADDRINUSE` on `npm run dev`

**Symptom:** "Port 3000 is already in use."

**Fixes:**

1. Find the process: `lsof -ti:3000 | xargs kill -9` (kills it).
2. Or use a different port: `PORT=3001 npm run dev`.

## Node version errors during `npm install`

**Symptom:** `engine "node"` warnings or hard failures.

**Cause:** Node 25+ isn't supported by the template (matches the repo's CLAUDE.md note for the same reason — Mintlify breaks too). Use Node 20 or 22:

```bash
brew install node@22
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
```

## Browser shows the old version after edits

**Symptom:** Edited a route, but the browser still hits the old code.

**Fix:** Next.js dev hot-reloads automatically — but only if `npm run dev` is still
running and the file is inside the project. Hard refresh the browser (`Cmd+Shift+R`).
If still stuck, restart `npm run dev`.

## CORS / fetch errors from the browser

**Symptom:** Browser console shows CORS errors when the page tries to call API routes.

**Cause:** This shouldn't happen because the page and API routes share the same
origin. If it does, the user is probably hitting the API routes from a different port
or origin. Confirm they're at `http://localhost:3000` and not `http://0.0.0.0:3000` or similar.

## When in doubt — read the response body

Every Grid error includes a `code` and `message` in the JSON body. Don't just look at
the HTTP status — log the body:

```ts
catch (err: unknown) {
  if (err instanceof Error) console.error(err.message);
  else console.error(JSON.stringify(err));
}
```

The SDK's error classes also expose `.code`, `.message`, and the raw HTTP response —
useful for distinguishing transient (retry) from permanent (fix input) errors.

## Escalation

If none of the above helps:

1. Re-fetch the OpenAPI spec — endpoint shapes can drift between SDK versions: `https://raw.githubusercontent.com/lightsparkdev/grid-api/refs/heads/main/openapi.yaml`.
2. Check the published docs for that endpoint at `https://grid.lightspark.com/api-reference/`.
3. Ask the user to share the full failing curl or SDK call (with the secret redacted), and reproduce against the sibling `grid-api` skill's curl examples to isolate whether the bug is in the demo template or the user's input.
