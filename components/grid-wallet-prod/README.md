# Grid Wallet Prod

Live production demo of the **Grid Global Accounts** wallet lifecycle, forked from
[`components/grid-wallet-demo`](../grid-wallet-demo) (the scripted variant embedded in the Grid
docs). Same stack and design system: Next.js 14 + React 18 + TypeScript, SCSS modules,
`@lightsparkdev/origin` tokens + text-style mixins, `@central-icons-react` icons, `motion`.

Differences from the demo:

- No config sidebar — the layout is the phone plus the API panel.
- Sign-in is **passkey only**; the use case is pinned to **Fintech**.
- (Phase 2, planned) API calls run against the **Grid production API** with production keys and
  move real funds; the panel shows the real requests.

## Develop

```bash
npm install --ignore-scripts   # --ignore-scripts avoids a central-icons license postinstall
npm run dev                    # http://localhost:4001 (grid-wallet-demo keeps 4000)
```
