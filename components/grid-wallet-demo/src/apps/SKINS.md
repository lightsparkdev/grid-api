# Building a skin (agent guide)

The wallet demo is **logic-shared, UI-per-skin**. App logic lives once in shared
hooks; each persona ("skin") owns its entire view. You can build or restyle a
skin's UI freely without touching — or breaking — any other skin.

Aurora (`apps/aurora/`) is the reference skin ("skin zero"). Wiggle
(`apps/wiggle/`) is a worked example of a fully custom skin. Copy from them.

## The one rule

**A per-skin file is presentational only.** It consumes `useWalletHome()` and the
shared flows, then renders. It must NOT re-implement balance math, FX/fees, API
calls, card issuance, tap-to-pay, or bank/address data — all of that is shared.

## Layers

```
src/apps/
  shared/
    wallet/         # HEADLESS LOGIC (no JSX) — useWalletHome(), activity builders, types
    wallet-flows/   # SHARED modal/overlay UI — sheets, card flow, list rows (token-themed)
    AppShell, BottomSheet, glass, icons, FaceIdAuth, GlassToast, AuroraBackground, ...  # primitives
  aurora/           # reference skin (skin zero)
  wiggle/           # example custom skin
  <yourskin>/       # your skin lives here
  skins.ts          # persona -> skin registry
  SignInFlow.tsx    # shared auth <-> wallet handoff (don't fork)
  types.ts          # SkinAuthScreenProps / SkinWalletScreenProps contracts
data/, lib/, hooks/ # shared data + logic (apiCalls, bankCountries, cryptoAddresses, useWalletDemoLogic, FX, ...)
```

- **Edit freely:** everything in `apps/<yourskin>/`.
- **Do NOT edit to change one skin:** `apps/shared/**`, `data/`, `lib/`, `hooks/` (shared by all skins). Recolor via tokens; fork a flow only if you need a structurally different one.

## What `useWalletHome()` gives you (consume, never rebuild)

State/derived: `cardView`, `issued`, `tapPhase`, `transactions`, `sheetMode`,
`sheetOpen`, `sheetConfirming`, `sendReceiveOpen`, `toast`, `availableCents`,
`earningsTodayCents`, `weeklyBars`, `weeklySpentCents`, `homeActivity`,
`apyPercent`, `isOpen`, `isIssuance`, `showFullAurora`, `cardCentered`, `isTap`.

Setters/handlers: `setCardView`, `setSheetOpen`, `setSendReceiveOpen`,
`setTapPhase`, `setToast`, `showToast`, `openSheet`, `startSend`, `startReceive`,
`openCard`, `startTapToPay`, `finishTransfer`, `confirmTransfer`,
`handleReceivePayment`.

Shared flow components (from `@/apps/shared/wallet-flows`): `AddMoneySheet`,
`SendReceiveSheet`, `DebitCard`, `IntroContent`/`ReadyContent`/`CreatingCaption`,
`CardHomeContent`, `TapToPayStatus`, `WalletCardDetailHeader`, `WalletListSection`,
`Flag`, plus `formatUsdCents` / `truncateAddress`.

Your `WalletScreen` implements `SkinWalletScreenProps`; your `AuthScreen`
implements `SkinAuthScreenProps` (both in `apps/types.ts`).

## Add a new skin (step by step)

For Wiggle this was the `creator` persona. `social`/`marketplace` personas already
exist (empty `pulse`/`bazaar` stubs); `ondemand`/`messaging` need the persona added
(steps 1) — they are use-case tiles only today.

1. **Persona wiring** (skip the parts that already exist):
   - `data/flow.ts` — add the id to the `Persona` union.
   - `data/configure.ts` — give the matching `USE_CASES` entry a `persona`.
   - `components/Phone.tsx` — add a `PHONE_BRAND[persona]` `{ name, tag }`.
2. **Tokens** — `apps/<skin>/skin.scss` with `@mixin tokens { &[data-app='<id>'] { --app-*, --ios-font-family, ... } }`; then `@use` + `@include <skin>-skin.tokens;` in `apps/shared/AppShell/AppShell.module.scss`. This retints the shared flows for free.
3. **Auth** — `apps/<skin>/<Skin>AuthScreen.tsx` implementing `SkinAuthScreenProps`. Reusable auth blocks (marquee, brand header, CTA list) can live in `apps/<skin>/blocks/`.
4. **Wallet** — `apps/<skin>/wallet/<Skin>WalletScreen.tsx` implementing `SkinWalletScreenProps`. Start by copying `aurora/wallet/AuroraWalletScreen.tsx` (or `wiggle/wallet/WiggleWalletScreen.tsx` for a custom home), call `useWalletHome(props)`, render your layout + the shared flows.
5. **Register** — add the entry to `APP_SKINS` in `apps/skins.ts` (`{ id, persona, label, fontFamily, AuthScreen, WalletScreen }`) and the id to `AppSkinId`. That's the only wiring — `DemoPhone` routes by persona automatically.

## Run + verify

- Dev server: `npm run dev` (port 4000). The playground left rail picks the persona.
- Typecheck: `npx tsc --noEmit`. Baseline has 3 pre-existing errors (`cornerShape`×2 in `AppShell`, `superellipse` in `LiquidGlass`) — ignore those; add none.
- The build uses `ignoreBuildErrors: true`; the dev server compile is the real signal.

## Gotchas

- Selecting a use-case switches the rendered persona (`useWalletDemoLogic` keeps `useCase` + `persona` in sync) — only personas that exist in `Persona` work.
- Passkey sign-in needs real WebAuthn (won't auto-confirm in headless browsers); use the left-rail flow jumps (Add money, Issue a card, Tap to pay) to reach the wallet for testing.
- A skin with no `AuthScreen`/`WalletScreen` in `APP_SKINS` falls back to a blank phone — that's expected for unimplemented stubs.

## Useful pointers for a fresh chat

- Branch: `pat/per-skin-wallet` (off `d05d5ae`).
- Styling reference for Wiggle: commit `954a3be` on `pat/creator-platform-skin` (`git show 954a3be:components/grid-wallet-demo/src/apps/...`).
- Copy-from templates: `apps/aurora/` (baseline) and `apps/wiggle/` (custom home + auth).
