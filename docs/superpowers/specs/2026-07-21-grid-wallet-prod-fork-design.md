# Grid Wallet Prod — Phase 1: fork the demo, remove the config sidebar

**Date:** 2026-07-21
**Status:** Approved (approach A)

## Goal

Fork `components/grid-wallet-demo` into `components/grid-wallet-prod`, the starting point for a
**live production demo**: real Grid API requests, real funds, production keys, with the API-call
panel still visible beside the phone.

This spec covers **Phase 1 only**: the fork, removing the left config sidebar, and hardcoding
passkey sign-in. Wiring the scripted calls in `src/data/actions.ts` to the real Grid production
API is **Phase 2** and gets its own spec — real funds means auth, key handling, error states, and
irreversibility all need a dedicated design pass.

## Decisions

- **Location:** `components/grid-wallet-prod` (sibling of the demo; its own Vercel project later).
- **Dev port:** 4001, so the demo (pinned to 4000) and prod fork run side by side.
- **Sidebar removal:** remove cleanly (approach A) — delete usage and component files, don't gate
  behind a flag.
- **Sign-in:** hardcoded to passkey; use case pinned to Fintech.
- **Original demo untouched:** no changes to `components/grid-wallet-demo` or the docs iframe
  that embeds it.

## Changes

### 1. Fork

Copy `components/grid-wallet-demo` → `components/grid-wallet-prod`, excluding `node_modules`,
`.next`, and build artifacts. In the fork:

- `package.json`: rename package to `grid-wallet-prod`; dev/start scripts use port 4001.
- `README.md`: retitle for the production demo; note the demo remains the docs-embedded variant.

### 2. Remove the left nav (config sidebar)

In the fork's `src/app/page.tsx`:

- Delete the `configCol` div and the `ConfigurePanel` import/usage.
- Delete the mobile `configure ⇄ playground` view switching that only existed because of the
  sidebar: `mobileView` state, `goPlayground`/`goConfigure`, `onConfigureAction`, the back pill,
  the "Explore playground" button, the progressive-blur tray, the scroll-hide effect, and the
  popstate handler. Mobile renders the playground directly.
- Keep `useWalletDemoLogic` fully intact — the phone already drives every action through it.

In `src/app/page.module.scss`: drop the config column from the layout so it becomes
`phone (appCol) + resize handle + API panel (apiCol)`; remove styles for the deleted mobile
chrome; keep the stacked ⇄ wide breakpoint behavior for the two remaining columns.

Delete `src/components/ConfigurePanel/` from the fork.

### 3. Hardcode passkey + Fintech

In the fork's `useWalletDemoLogic`: pin `useCase` to Fintech and `methods` to `['passkey']`
(remove or no-op the setters the sidebar used). The phone's sign-in screen then offers only
"Continue with Passkey".

Google/Apple/Email/Phone auth screens stay in `Phone.tsx` but are unreachable. They get pruned in
Phase 2 when real auth lands, so the phone file isn't churned twice.

### 4. Unchanged for now

Header, footer, theme sync/embed contract, all phone visuals, and the API panel (still fed by the
scripted `entries` until Phase 2).

## Verification

- `npm install --ignore-scripts && npm run dev` in the fork serves on :4001.
- No config sidebar at any viewport; phone + API panel lay out correctly wide and stacked.
- Sign-in screen shows only passkey; the full flow (create account → add money → send → cash out →
  issue card → tap to pay) still runs from the phone, with API calls appearing in the panel.
- `npm run build` passes with no references to the deleted `ConfigurePanel`.
- The original demo still runs unmodified on :4000.

## Out of scope (Phase 2+)

- Live Grid production API integration (real requests, real funds, production key handling).
- Real passkey/WebAuthn ceremony.
- Pruning unused auth screens and demo-only code paths from `Phone.tsx`.
- Vercel project + deployment for the prod app.
