# Grid Cards Playground

Interactive demo of the Grid Cards lifecycle, embedded in the Grid docs at
`docs.lightspark.com/cards/demo`. Forked from `components/grid-wallet-demo` (the Global
Accounts playground) and shares its chrome, design system, and embed contract:

- Next.js 14 + React 18 + TypeScript, SCSS modules
- `@lightsparkdev/origin` design tokens and text-style mixins
- `@central-icons-react` (round-outlined, radius-3, stroke-1.5) for chrome icons
- `motion` for transitions
- Config panel, glass phone stage, and API panel laid out identically to the wallet demo

A visitor picks a platform skin ("Your brand" is the default and the only customizable one),
then drives card flows on the phone: issue, reveal, add to Apple Wallet, spend, freeze,
limits, refund, close. The API panel shows the Grid calls and webhooks for each flow, with
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

Google and Apple sign-in use real hosted popups. Apple's return URL defaults to
`https://grid-cards-demo.vercel.app/`; override with `NEXT_PUBLIC_GOOGLE_CLIENT_ID`,
`NEXT_PUBLIC_APPLE_CLIENT_ID`, and `NEXT_PUBLIC_APPLE_REDIRECT_URI` if the provider
configuration changes. For local Apple testing, follow the `dev:apple` setup in
`components/grid-wallet-demo/README.md` with the hostname `grid-cards-demo-local.lightspark.com`.

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
physical cards and PIN are not in the API yet. Card flows other than issue and spend are
listed in the picker but disabled until they land.

## Chrome files shared with the wallet demo

Keep these byte-identical to `components/grid-wallet-demo` so fixes port with `cp`:
`src/app/page.tsx`, `src/app/page.module.scss`, `src/lib/layout.ts`,
`src/styles/breakpoints.scss`, `src/components/{ConfigurePanel,AppPanel,ApiPanel,PanelHeader,
ColumnResizeHandle,DotGridCanvas,SectionDivider,UseCasePicker,liquid-glass,glass-gl}`,
`src/components/ThemeSync.tsx`, `src/hooks/{useTheme,useThemeMode,useColumnResize}.ts`,
`src/lib/{groupApiEntries.ts,easing.ts}`.
