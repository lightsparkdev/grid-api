# Grid Wallet Demo — design handoff

A first, working pass at an **interactive Global Accounts demo** for the Grid docs — the
neobank/wallet analog of the Flow Builder. It's built to be perfected by design, not shipped as-is.

This doc is the context dump: what it is, how it's wired, every design decision + where the
inspiration came from, what's faked, and the specific places that want a designer's eye.

---

## What it is

An embedded, clickable demo that lives at **`docs.lightspark.com/global-accounts/demo`**
("See it live", directly under *Introduction*). A visitor:

1. Picks a **use case** (Fintech/Neobank live; Social + Marketplace stubbed "Soon").
2. Picks a **sign-in method** (Passkey / Google / Apple / Email / Phone).
3. **Drives a real wallet on a phone** — create account, add money, send, cash out, issue a card,
   tap to pay — in any valid order.
4. Watches the **exact Grid API calls** fire in a panel beside the phone, in sync.

Goal: a sales- and developer-facing "this is how easy it is" artifact. The phone is the magic;
the API panel is the proof.

---

## How it's wired (mirrors the Flow Builder exactly)

The Flow Builder (`components/grid-visualizer` → `grid-flow-builder.vercel.app`) is a standalone
Next.js app that the docs page embeds in an `<iframe>` with light/dark theme sync over
`postMessage`. **This app is the same pattern, same shell, same design system.**

- **Stack:** Next.js 14 (App Router), React 18, TypeScript, SCSS modules.
- **Design system:** `@lightsparkdev/origin` tokens + text-style mixins — identical to
  `grid-visualizer`. Same `sidebar (475px) + right panel`, same `Header`/`Footer`, same
  `EmptyCanvas` dotted background, same `CodePanel`-style numbered code blocks with GitHub-style
  syntax highlighting, squircle corners.
- **Icons:** `@central-icons-react/round-outlined-radius-3-stroke-1.5` (the variant the
  `central-icons.mdc` cursor rule mandates).
- **Embed contract:** `?embed=true` hides the standalone chrome; `?theme=light|dark` sets initial
  theme; child posts `theme-request` on load, parent replies + pushes `theme-sync` on toggle.
  Copied verbatim from `flow-builder.mdx`.

### Docs integration (3 files in `mintlify/`)
- `global-accounts/demo.mdx` — the page (`mode: "custom"`), an iframe + theme-sync component, a
  `#wallet-demo-container` wrapper. **Auto-targets `localhost:4000` when the docs run locally**,
  else `https://grid-wallet-demo.vercel.app`.
- `docs.json` — nav entry `"global-accounts/demo"` under Overview (after `index`), plus the
  chrome-hide `<style>` for `#wallet-demo-container` (mirrors the flow-builder rules).
- `style.css` — full-bleed iframe sizing for `#wallet-demo-container` (copied from the
  `#flow-builder-container` block).

---

## Where things live

```
components/grid-wallet-demo/
├── src/app/
│   ├── page.tsx            # Orchestrator: state machine + action runner (timers/frames)
│   ├── page.module.scss    # Layout: sidebar + right panel (canvas + API dock)
│   ├── globals.scss        # Origin token imports + the phone (--p-*) palette
│   └── layout.tsx          # embed/theme bootstrap script
├── src/components/
│   ├── Header.tsx          # "Global Accounts" title + description (Origin)
│   ├── Footer.tsx          # theme toggle + (0,0,0) coords + links — copied from grid-visualizer
│   ├── LightsparkWordmark.tsx / GridWordmark.tsx
│   ├── Sidebar.tsx         # use-case cards, sign-in chips, "Explore actions" disclosure
│   ├── Phone.tsx           # the whole iPhone mock + all screens + the icon set  ← most of the design
│   ├── Phone.module.scss   # phone styling (bread-derived)                       ← most of the design
│   └── ApiSteps.tsx        # the CodePanel-style live API log
├── src/hooks/useTheme.ts   # theme + postMessage contract
├── src/data/
│   ├── flow.ts             # types, auth methods, credential API-call shapes
│   └── actions.ts          # the playground model: actions, wallet state, API calls per action
└── README.md / HANDOFF.md
```

**90% of the design lives in `Phone.tsx` + `Phone.module.scss`.** Sidebar/canvas/API panel are
already Origin-faithful; the phone is where craft pays off.

---

## Design decisions + sources

- **Sidebar / canvas / API panel** = 1:1 with the Flow Builder (Origin). Use-case + action cards
  reuse the `InputCard` treatment (icon box + label + hint), shrunk so more verticals fit. Actions
  are hidden behind an "Explore actions" disclosure that extends downward (sidebar is top-aligned
  so it doesn't reflow).
- **The phone wallet ("Aurora")** is adapted from the **`bread` neobank app**
  (`/Users/leo/Coding/sparkapp/react-native-app`). Tokens taken from its `theme.ts`: black bg,
  `#141414` cards, `#22C55E` green, iOS type scale, 26px continuous radii. The balance block
  ("Total Balance" + 42px rounded number + green "Today" delta chip + bar-chart sparkline) mirrors
  bread's `WalletBalanceCard`.
- **The card** is a Robinhood-style **dark glass/metal** card with a blue glow beam, diagonal
  sheen, metallic chip, embossed monogram — `backdrop-blur`, no plastic gradient.
- **Card issuing** is a cinematic **reveal**: the card rises/scales in from below over a blue
  light beam, "Your card is ready" fades in, then it settles into the wallet.
- **Interactivity:** you drive everything by **clicking the phone itself** (Continue with X → Add →
  Send → Get a card → Tap to pay). Sidebar action cards mirror the same handlers. Actions
  enable/disable on prerequisites (Send/Cash out are dead until funded) and "done" actions check.
- **iPhone frame:** titanium bezel + side buttons + screen inset (reads as a device, not a
  template). The device auto-scales to fit any canvas height.

---

## What's faked / scripted (important)

This is a **scripted happy path**, exactly like the Flow Builder generates calls without executing
them. Nothing hits a real sandbox.

- API calls in the right panel are **illustrative** (realistic shapes/paths/bodies from the example
  app + Implementation Overview, but static). If we want them *live* against sandbox, that's a
  follow-up — see `src/data/actions.ts` where each action's `calls[]` are defined.
- Auth credential screens (OTP boxes, Face ID, Google/Apple sheets) **auto-play** — they animate
  and advance; the 6-digit entry isn't really interactive.
- Numbers are fixed: Add = $5,000, Send = $250, Withdraw = $200, Coffee = $7.32.
- Personas Social/Marketplace are **"Soon"** stubs (branding only: `BRAND` in `Phone.tsx`).

---

## Run it

```bash
cd components/grid-wallet-demo
npm install --ignore-scripts      # --ignore-scripts avoids a central-icons license postinstall
npm run dev                        # http://localhost:4000  (port is pinned)
#   light/dark embed preview:
#   http://localhost:4000/?embed=true&theme=light   (and &theme=dark)
```

Preview the **docs page** locally (optional): run the app on :4000, then `make mint` in
`grid-api/mintlify` (needs Node 22 + Mintlify 4.2.284). The page auto-points at `localhost:4000`.
Honestly, `localhost:4000` *is* the real experience — the docs page is just a frame around it.

---

## Deployment (one-time, not done yet)

The iframe points at `grid-wallet-demo.vercel.app`. Someone with Vercel access needs to create a
project from `components/grid-wallet-demo` (root dir set accordingly), build `npm run build`,
install with `--ignore-scripts` (same workaround grid-visualizer uses for the icon license). The
docs page goes live the moment that deploy exists. If a different URL is preferred, change one
string in `mintlify/global-accounts/demo.mdx`.

---

## Where a designer should focus (my wishlist for you)

1. **The phone, screen by screen** — `Phone.tsx` / `Phone.module.scss`. Spacing, type, the balance
   block, the action row, the activity rows. Closer bread parity (e.g. the 2×2 asset grid, real
   delta/chart treatment).
2. **The card art** — monogram, "Debit" label, glow/sheen intensity, maybe a per-persona colorway.
   Optional parallax/tilt on hover, pulsing glow.
3. **The reveal** — timing/easing of the rise + beam, the "ready" copy, a subtle haptic-style flash.
4. **Auth credential screens** — make them feel native per method (the Face ID / Google / Apple /
   OTP sheets are functional but basic).
5. **Per-persona theming** — when Social/Marketplace go live, each should reskin the phone (brand
   mark, accent, copy) — wiring is in `BRAND` (Phone.tsx) + `PERSONAS` (Sidebar.tsx).
6. **Empty/edge states**, motion polish on screen transitions, and light-mode review (docs default
   is light).

Open questions for product/eng: do we want the API calls **live against sandbox**? Do we keep the
fixed demo amounts or let the user pick? Which personas next (messaging, creator economy)?
