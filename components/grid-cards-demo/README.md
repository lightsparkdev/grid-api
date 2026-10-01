# Lightspark Cards Playground

Interactive demo of the Grid Cards lifecycle, embedded in the Grid docs at
`docs.lightspark.com/cards/demo`. Forked from `components/grid-wallet-demo` (the Global
Accounts playground) and shares its chrome, design system, and embed contract:

- Next.js 14 + React 18 + TypeScript, SCSS modules
- `@lightsparkdev/origin` design tokens and text-style mixins
- `@central-icons-react` (round-outlined, radius-3, stroke-1.5) for chrome icons
- `motion` for transitions
- Config panel, glass phone stage, and API panel laid out identically to the wallet demo

A visitor designs a card (name, color, finish, logo) and drives card flows on the phone:
issue, reveal, add to Apple Wallet, spend, freeze, limits, refund, close. There is one
generic app UI; the design tints it. There are no platform skins and no sign-in. The API panel shows the Grid calls and webhooks for each flow, with
request and response bodies that follow the OpenAPI schemas in
`openapi/components/schemas/cards/`.

## Develop

```bash
npm install --ignore-scripts
npm run dev          # fixed port: http://localhost:4002
# embed/theme preview:
#   http://localhost:4002/?embed=true&theme=light
#   http://localhost:4002/?embed=true&theme=dark
```

The port is pinned to 4002 (4000 is the wallet demo) so the docs page can embed the local app
while you preview the docs with `make mint`. The docs page targets `localhost:4002` when served
locally.

### Share

Share (under the card) parks the card in a frame on the stage, renders it to a still in the browser, and
makes a link whose preview is that card; Save video renders a spin the visitor keeps. The Style
row's Hand puts the real card in one of five photographed hands (a Skin row picks; see
`scripts/hand-assets.py` to add one from a masked photo). Locally, shares are written to `.shares/` (gitignored) and served
by the app itself: the link is `http://localhost:4002/c/{slug}`, and `?preview=unfurl` on it mocks
the X, Slack, and iMessage previews. The team layer ("For a customer") is always unlocked in dev;
in production it needs `SHARE_TEAM_KEY` and a visit to `/api/team?key=…`. Dev hook:
`__cardExport.still('post', 'dark')` opens a still; `__cardExport.video('dark')` downloads the spin.
Smoke test: with the dev server up, `node scripts/share-smoke.mjs [chromium|webkit]` drives every
share flow and fails on console errors, 404s, a card off its slot, a hand swap with an empty frame,
or an empty export. See the 2026-09-15 entry in `APPROACH.md`.

## Deploy

Deploy to Vercel as its own project. `vercel.json` sets an `ignoreCommand` so a commit only
triggers a build if it touches this directory. The docs page iframes the deployed URL
(`https://grid-cards-demo.vercel.app`). If the URL differs, update
`mintlify/snippets/cards/cards-demo-embed.mdx`.

## Embed contract

- `?embed=true` sets `data-embed`.
- `?theme=light|dark` sets the initial theme.
- `?nav=<px>` passes the docs sidebar width so the API column paints at its real default.
- Parent and iframe exchange `theme-sync`, `theme-request`, `nav-sync`, and `nav-request`
  over `postMessage`. Same contract as the wallet demo.

## Scope

Scripted happy path, like the wallet demo. It does not call a live sandbox. Virtual cards only;
physical cards and PIN are not in the API yet.

## Chrome files shared with the wallet demo

Keep these byte-identical to `components/grid-wallet-demo` so fixes port with `cp`:
`src/app/page.tsx`, `src/app/page.module.scss`, `src/lib/layout.ts`,
`src/styles/breakpoints.scss`, `src/components/{ConfigurePanel,AppPanel,PanelHeader,
ColumnResizeHandle,DotGridCanvas,SectionDivider,liquid-glass,glass-gl}`,
`src/components/ThemeSync.tsx`, `src/hooks/{useTheme,useThemeMode,useColumnResize}.ts`,
`src/lib/{groupApiEntries.ts,easing.ts}`.

`src/components/ApiPanel` and `src/lib/apiCodeFormat.tsx` have diverged: webhook rows here
render as the API reference lists them (`WEBHOOK card-status-change`, a Payload tab with the
JSON Grid delivered, a Response tab with your 2xx) instead of as a curl the client would run.
Port that to the wallet demo before treating the two as identical again.
