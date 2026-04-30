# Credentials & environment setup

This is a reference file for **Phase 2** of the tutorial. It explains how to obtain
sandbox credentials and where to put them so the demo app can authenticate.

## What Grid auth looks like

Grid uses **HTTP Basic Auth**. There is no OAuth, no JWT, no refresh tokens. You get
two strings from the dashboard — a token ID and a client secret — and you send them
on every request as `Authorization: Basic base64(id:secret)`.

The `@lightsparkdev/grid` SDK takes them as `username` and `password`:

```ts
import LightsparkGrid from "@lightsparkdev/grid";

const client = new LightsparkGrid({
  username: process.env.GRID_CLIENT_ID,
  password: process.env.GRID_CLIENT_SECRET,
});
```

## Required environment variables

The demo template reads three env vars from `.env.local`:

| Var | Example | Notes |
| --- | --- | --- |
| `GRID_CLIENT_ID` | `ApiTokenId:0195...` | The token ID from the Grid dashboard. Public-ish. |
| `GRID_CLIENT_SECRET` | `2SKx...` | The secret. Treat like a password. Never in the browser. |
| `GRID_BASE_URL` | `https://api.lightspark.com/grid/2025-10-13` | Same URL for sandbox and prod — the credentials determine which. |

These are the same names the sibling `grid-api` skill uses, so users with that skill
already configured can reuse `~/.grid-credentials`.

## Step-by-step: getting sandbox credentials

1. **Sign in** to the Grid dashboard at `https://app.lightspark.com/grid/dashboard`
   (or the sandbox dashboard if the user has a separate sandbox account).
2. **Switch to Sandbox** — top-right environment switcher.
3. **API tokens** → **Create token**. Give it a name like "tutorial".
4. **Copy both values immediately** — the secret is shown once. If lost, create a new token.
5. **Paste into the demo's `.env.local`** (created from `.env.local.example` during scaffold).

If the user already has `~/.grid-credentials` from the `grid-api` skill, read it:

```bash
GRID_CLIENT_ID=$(jq -r '.clientId // .apiTokenId' ~/.grid-credentials)
GRID_CLIENT_SECRET=$(jq -r '.clientSecret // .apiClientSecret' ~/.grid-credentials)
GRID_BASE_URL=$(jq -r '.baseUrl // "https://api.lightspark.com/grid/2025-10-13"' ~/.grid-credentials)
```

Then echo them into `.env.local` (use `cat <<EOF > .env.local` rather than `echo` to
avoid escaping issues, and don't print the secret to the terminal).

## Sanity check

Before scaffolding more, confirm the creds work end-to-end:

```bash
curl -s -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET" "$GRID_BASE_URL/config" | jq .
```

A successful response looks like:

```json
{
  "supportedCurrencies": [...],
  "platformCustomerId": "...",
  "umaDomain": "..."
}
```

If you get a `401`, the credentials are wrong — re-check that you copied both halves
and that the secret didn't get truncated. If you get a connection error, check that
`GRID_BASE_URL` is reachable.

## Security guardrails to teach the user

These are non-negotiable and worth saying out loud while you scaffold:

1. **The secret never goes in the browser.** It lives in `.env.local` (gitignored) and
   is read only inside Next.js API routes. The user's React components must never
   import it directly.
2. **Don't commit `.env.local`.** The template's `.gitignore` already excludes it, but
   confirm.
3. **Sandbox credentials are not safe to share.** They can move test funds and create
   test customers — small blast radius, but still.
4. **Rotation is cheap.** If they leak a secret, just create a new token in the dashboard
   and revoke the old one (`DELETE /tokens/{tokenId}`). No downtime.

## Pointer

Authoritative auth spec: <https://grid.lightspark.com/api-reference/authentication>
(append `.md` to the URL for an LLM-friendly version, or read locally at
`mintlify/api-reference/authentication.mdx` if you're inside a clone of the
[grid-api](https://github.com/lightsparkdev/grid-api) repo).
