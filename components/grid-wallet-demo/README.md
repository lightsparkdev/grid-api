# Grid Wallet Demo

Interactive demo of the **Grid Global Accounts** wallet lifecycle, embedded in the Grid docs
(`docs.lightspark.com/global-accounts/demo`). Built as a sibling to `components/grid-visualizer`
(the flow builder) and shares its design system and embed contract:

- **Next.js 14 + React 18 + TypeScript**, SCSS modules
- **`@lightsparkdev/origin`** design tokens + text-style mixins (same as the flow builder)
- **`@central-icons-react`** (round-outlined, radius-3, stroke-1.5) for chrome icons
- **`motion`** for transitions
- Same `sidebar (475px) + right panel` layout, GitHub-style syntax-highlighted code blocks,
  and squircle corners as `grid-visualizer`

The docs page loads it in an `<iframe>` with light/dark theme sync over `postMessage`, exactly
like `/flow-builder`. The iPhone mock is a self-contained iOS preview (adapted from the keynote
phone screens) and keeps its own iOS palette.

A visitor picks a use case (Fintech / Neobank to start) and an auth method (Passkey / OAuth /
Apple / Email OTP), then steps through: create customer → register credential → open account → add
money → see balance → withdraw → issue card → tap to pay. The right panel shows the exact Grid API
calls firing at each step.

## Develop

```bash
npm install
npm run dev          # runs on a fixed port: http://localhost:4000
# embed/theme preview:
#   http://localhost:4000/?embed=true&theme=light
#   http://localhost:4000/?embed=true&theme=dark
```

Google and Apple sign-in use real hosted popups for the ceremony. Google defaults to the checked-in
public web client ID, so local sign-in works without an env file. Apple defaults to the existing
Services ID `com.lightspark` with return URL `https://grid-wallet-demo.vercel.app/`; override with
`NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_APPLE_CLIENT_ID`, and `NEXT_PUBLIC_APPLE_REDIRECT_URI`
if the provider configuration changes.

The port is pinned to **4000** so the docs page can reliably embed the local app while you preview
the Grid docs with `make mint` (the docs page auto-targets `localhost:4000` when served locally).

## Deploy

Deploy to Vercel as its own project (same as `grid-flow-builder`). The docs page iframes the
deployed URL (default `https://grid-wallet-demo.vercel.app`). If the URL differs, update the
`src` in `mintlify/global-accounts/demo.mdx`.

## Embed contract

- `?embed=true` → hides nothing extra here but sets `data-embed` for future use.
- `?theme=light|dark` → initial theme.
- Parent ↔ iframe `postMessage`: child posts `{ type: 'theme-request' }` on load; parent replies
  and pushes `{ type: 'theme-sync', theme }` on toggle. Identical to `flow-builder.mdx`.

## Scope

Fintech / Neobank is live. Social and Marketplace personas are stubbed ("Soon") for a future pass.
The flow is a scripted happy path (like the flow builder) — it does not call a live sandbox.
