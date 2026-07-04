# Building a skin (agent guide)

The wallet demo is **share the brain, not the face**. The app's logic and data
live once, shared; each persona ("skin") owns its entire UI. You can build or
restyle a skin freely without touching — or breaking — any other skin (Aurora is
shipped; treat it as untouchable unless you're explicitly changing Aurora).

Aurora (`apps/aurora/`) is the reference skin ("skin zero"). The **creator** skin
(`apps/creator/`, brand "Glitch") and the **social** skin (`apps/social/`, brand
"Z" — flat, no glass, Geist type, custom 3D metal card) are worked examples of
fully custom skins. Copy from them.

**Naming — code is the category, brand is data.** Name a skin's code by its stable
*category*: folder `apps/creator/`, components `CreatorWalletScreen`, `id: 'creator'`,
token `[data-app='creator']`. The mutable brand name is a **data value** —
`export const BRAND = 'Glitch'` in the skin's `config.ts`, read by every face (auth
copy, OTP sheet, card line) and the registry `label`. Re-branding is then a one-line
edit; never bake a brand name into a filename or identifier. (Aurora keeps its
`aurora` code id for historical reasons — it predates this rule.)

## The one rule

**A per-skin file is presentational only.** The brains arrive as props — the
wallet screen gets `home` (the `useWalletHome` surface) and `money` (the
`useMoneySheet` surface) — it reads them and renders. It must NOT re-implement
balance math, FX/fees, API calls, card issuance, tap-to-pay, or bank/address
data — all of that is the shared brain.

## State lives ABOVE the skin (switching platforms = a reskin)

The brains are instantiated once in `SignInFlow`'s **`WalletHost`**, which stays
mounted across skin switches — only the skin's view component swaps beneath it
(with a blur crossfade, keyed on `skinId`). That means balance, activity, saved
banks/recipients, and even the mid-flow sheet step all survive a platform
switch; the host unmounts on Reset / return-to-sign-in, which is what clears a
session. Consequences for skin authors:

- **Never call `useWalletHome` / `useMoneySheet` in a skin.** Consume the
  `home` / `money` props. A skin-local hook instance would fork the state and
  die on switch.
- Per-skin brain OPTIONS (e.g. social's in-sheet success screen) go in the
  registry: `walletOptions: { transferSuccessScreen: true }` on the skin's
  `APP_SKINS` entry — the host reads them from the active skin.
- Your faces must render sanely from ANY brain state, because the user can
  switch onto your skin mid-flow (sheet open at any step). Gate derived
  "sub-sheet open" flags on the brain's `sheetOpen` — see the `confirmOpen`
  gating in `social/wallet/AddMoneySheet.tsx` for the canonical example.

## Layers

```
src/apps/
  shared/
    wallet/         # THE BRAIN (no JSX): useWalletHome() (home), useMoneySheet()
                    #   (add/withdraw/send/receive flow), activity builders,
                    #   moneySheet.ts (flow data/config: MODES, networks, helpers),
                    #   format.ts (formatUsdCents/truncateAddress/typedToCents),
                    #   types.ts (MoneySheetMode, TransferActivity, …) — the
                    #   canonical shared contract.
    BottomSheet/    # MECHANIC: sheet rise/scrim/portal (skin-blind). Reuse as-is.
    PasskeySheet/   # SYSTEM CHROME: the iOS passkey dialog — shared, iOS colors
                    #   pinned, takes appName. Not skinnable (it's an OS sheet).
    TapToPayStatus/ # SYSTEM CHROME: the iOS "Hold Near Reader" contactless status —
                    #   shared so tap-to-pay behaves identically across skins. Each
                    #   skin only positions it within its own card-detail layout.
    AppShell, glass, icons, FaceIdAuth, Toast, useStaggerReveal, …  # primitives
  aurora/           # reference skin (skin zero). Its wallet/ holds the FACES:
                    #   AddMoneySheet, SendReceiveSheet, CardHomeContent,
                    #   CardIssuanceContent, DebitCard,
                    #   WalletCardDetailHeader, WalletListSection/Card/Item, Flag.
  creator/          # full worked example (brand "Glitch"): owns every face (auth, overlays,
                    #   home, + all flow faces) — each a thin view over the brains.
  social/           # full worked example (brand "Z"): flat/no-glass design language,
                    #   Geist type, per-app central icons (icons.ts), animated action
                    #   glyphs (MoneyActionIcons), and the r3f 3D metal card (wallet/card3d/).
  <yourskin>/       # your skin lives here
  skins.ts          # persona -> skin registry (AuthScreen / WalletScreen / overlays / walletOptions)
  SignInFlow.tsx    # shared auth <-> wallet handoff + WalletHost (hosts the brains
                    #   above the skin boundary + the skin-switch crossfade; don't fork)
  types.ts          # SkinAuthScreenProps / SkinWalletScreenProps contracts
data/, lib/, hooks/ # shared data + logic (apiCalls, bankCountries, cryptoAddresses, useWalletDemoLogic, FX, …)
```

- **Edit freely:** everything in `apps/<yourskin>/`.
- **Do NOT edit to change one skin:** `apps/shared/**`, `data/`, `lib/`, `hooks/`
  (shared by all skins), and `apps/aurora/**` (the shipped app). To change a skin,
  edit that skin's folder.

## What the `home` prop gives you (consume, never rebuild)

State/derived: `cardView`, `issued`, `tapPhase`, `transactions`, `sheetMode`,
`sheetOpen`, `sheetConfirming`, `sendReceiveOpen`, `toast`, `availableCents`,
`earningsTodayCents`, `weeklyBars`, `weeklySpentCents`, `homeActivity`,
`apyPercent`, `isOpen`, `isIssuance`, `showFullAurora`, `cardCentered`, `isTap`.

Setters/handlers: `setCardView`, `setSheetOpen`, `setSendReceiveOpen`,
`setTapPhase`, `setToast`, `showToast`, `openSheet`, `startSend`, `startReceive`,
`openCard`, `startTapToPay`, `finishTransfer`, `confirmTransfer`,
`handleReceivePayment`.

The `money` prop is the full `MoneySheet` surface (step machine, keypad, saved
banks/recipients, FX + confirm rows, country picker, `dismiss`) — pass it to your
`AddMoneySheet` face as `m`. The quote/save-toast callback wiring lives in
`WalletHost`, not in your skin.

Shared contract (from `@/apps/shared/wallet`): `formatUsdCents`, `truncateAddress`,
`typedToCents`, and the data-shape types (`MoneySheetMode`, `TransferActivity`,
`ReceivedPayment`, `WalletListItemData`, `WalletItemAvatar`).

Your `WalletScreen` implements `SkinWalletScreenProps`; your `AuthScreen`
implements `SkinAuthScreenProps` (both in `apps/types.ts`).

## Sheets & flows: the face is yours, the brain isn't

A flow's **brain** (step machine, validation, FX, API callbacks) is shared; its
**face** (the sheet UI) is per-skin. Add money is fully split: the `money` prop
(a `MoneySheet`) is the brain, and Aurora's / creator's / social's
`wallet/AddMoneySheet.tsx` are thin views over it, each taking it as an
`m: MoneySheet` prop. `BottomSheet` (rise/scrim) is a shared mechanic.

To give your skin its own sheet:

- **Fork the face** — copy `apps/aurora/wallet/AddMoneySheet.tsx` (+ its
  `.module.scss`) into `apps/<skin>/wallet/`, point `WalletScreen` at it, and
  restyle freely (the creator skin flattened the frosted search pill into a solid one;
  social went fully flat with its own two-sheet confirm + success flow). The face
  carries **no logic** — it renders the `m` prop, so flow changes happen once.
- **Reuse Aurora's face** — `import { AddMoneySheet } from '@/apps/aurora/wallet/AddMoneySheet'`
  when Aurora's look is fine.

Do **not** add props/tokens to a shared sheet to reskin it — fork the face.

> The rest of the flows are already brain/face-split a different way: their brains
> live in `useWalletHome` (card issuance, tap-to-pay, send/receive triggers) and the
> components (SendReceiveSheet, the card flow, the activity list) are thin faces.
> Fork them straight into `apps/<skin>/wallet/` and restyle — no extraction needed.
> The creator skin does exactly this: it owns every flow face.

## iOS system sheets are shared, not skinned

Some surfaces are OS chrome, not your app's UI — the **passkey sheet**
(`apps/shared/PasskeySheet`) is the example. iOS renders these identically in every
app, so they live in `shared/` as a **mechanic**: one component with its colors
pinned to canonical iOS (it re-asserts `ios-colors.tokens` so a skin's `--ios-tint` /
brand can't bleed in), and the only per-app input is `appName` (passed from the
registry `label`). Don't fork it per skin. `AuthSheet` (email/phone OTP) is the
opposite — that's *your* branded auth UI, so it stays a per-skin face.

## Add a new skin (step by step)

`creator` (brand "Glitch") and `social` (brand "Z") are built convention
examples. `marketplace` is registered but token-only (brand "Bazaar" lives as
the registry `label` until it gets a `config.ts`). `ondemand`/`messaging` are
use-case tiles only (add the persona in step 1 first).

1. **Persona wiring:**
   - `data/flow.ts` — add the id to the `Persona` union.
   - `data/configure.ts` — give the matching `USE_CASES` entry a `persona`, and set
     `built: true` when the skin is ready (`false` shows "coming soon").
2. **Tokens** — `apps/<skin>/skin.scss` with
   `@mixin tokens { &[data-app='<id>'] { --app-*, --ios-font-family, … } }`, then
   `@use` + `@include <skin>-skin.tokens;` in `apps/shared/AppShell/AppShell.module.scss`.
   This retints the shared shell/glass for free.
3. **Auth** — `apps/<skin>/<Skin>AuthScreen.tsx` implementing `SkinAuthScreenProps`.
   Reusable auth blocks (marquee, brand header, CTA list) can live in `apps/<skin>/blocks/`.
4. **Wallet** — `apps/<skin>/wallet/<Skin>WalletScreen.tsx` implementing
   `SkinWalletScreenProps`. Start from `creator/wallet/CreatorWalletScreen.tsx` (custom
   home) or `social/wallet/SocialWalletScreen.tsx` (flat design language),
   destructure `props.home` / `props.money`, render your layout + the flow faces
   (reused or copied — pass `m={money}` to your AddMoneySheet).
5. **Register** — add the entry to `APP_SKINS` in `apps/skins.ts`
   (`{ id, persona, label, fontFamily, AuthScreen, WalletScreen }`, plus an optional
   `AuthSheet` to own the branded OTP overlay — omit it to fall back to Aurora's —
   and optional `walletOptions` for brain behavior like `transferSuccessScreen`) and
   the id to `AppSkinId`. `DemoPhone` routes by persona automatically; a skin with no
   `AuthScreen`/`WalletScreen` stays dark ("coming soon"). (The passkey sheet is shared
   system chrome — not registered per skin.)

## Design conventions (learned building Z)

- **8pt grid + iOS type ramp.** Spacing in 4/8-multiples; text styles map to the
  iOS Dynamic Type ramp (`ios-text-*` mixins). When a designer says "add 4px",
  it's usually literal — apply it exactly, don't re-round.
- **Squircle corners** via `useSquircleClip` (clip-path — works in Safari), same
  pattern as Aurora's card buttons. Hover/press feel: slight grow on hover,
  slightly more on press (see `PRESS`/`CARD_HOVER`/`CARD_PRESS` in social).
- **Per-skin icon set:** a skin's `icons.ts` re-exports its central-icons variant
  (Z uses `@central-icons-react/round-outlined-radius-2-stroke-2`) so stroke/radius
  stay consistent app-wide. Don't hand-draw icons; ask for the asset.
- **Skins can ban shared aesthetics** — Z is flat with NO glass anywhere; its
  faces use solid fills and `variant="flat"` toasts. Respect a skin's design
  constraints over the shared components' defaults.

## Run + verify

- Dev server: `npm run dev` (port 4000). The playground left rail picks the persona.
- Typecheck: `./node_modules/.bin/tsc --noEmit`. Baseline has 4 pre-existing errors
  (`cornerShape`×2 in `AppShell`, `superellipse` in `LiquidGlass`, a TS2367 in
  social's `CardIssuanceSheet`) — ignore those; add none.
- The build uses `ignoreBuildErrors: true`; the dev-server compile is the real signal.
- Verify ALL built skins after a shared change (Aurora, Glitch, Z): they must look
  identical to before, and your skin must still work. Also verify a mid-flow skin
  switch INTO your skin renders sanely.
- Playwright tips (headless verification): `?theme=dark` forces dark; the phone is
  `locator('[class*=phone]').first()`; sidebar is `getByRole('complementary')`;
  CTAs rendered through `TextMorph` have per-character accessible names — click
  them via a wrapper class (e.g. `[class*=ctaWrap] button`), not by name.

## Gotchas

- Selecting a use-case switches the rendered persona (`useWalletDemoLogic` keeps
  `useCase` + `persona` in sync) — only personas in the `Persona` union work.
  Switching PRESERVES wallet state by design (see "State lives above the skin").
- Passkey sign-in needs real WebAuthn (won't auto-confirm in headless browsers);
  use the left-rail flow jumps (Deposit, Issue card, Tap to pay) to reach the
  wallet for testing.
- `--font-family-inter` isn't loaded on this branch; the creator skin's `skin.scss`
  references it and falls back to the SF Pro stack. Load Inter (or change the token)
  for the intended type. (Z loads Geist through `next/font` → `--font-family-geist`.)

## Pointers

- Branch: `pat/wallet-demo-skins` (off the launched `origin/main`).
- Copy-from templates: `apps/aurora/` (baseline glass), `apps/creator/` (custom
  home + auth), `apps/social/` (flat design language, two-sheet money flow,
  custom auth marquee, 3D card flow).
