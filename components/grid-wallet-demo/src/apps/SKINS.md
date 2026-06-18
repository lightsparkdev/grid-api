# Building a skin (agent guide)

The wallet demo is **share the brain, not the face**. The app's logic and data
live once, shared; each persona ("skin") owns its entire UI. You can build or
restyle a skin freely without touching — or breaking — any other skin (Aurora is
shipped; treat it as untouchable unless you're explicitly changing Aurora).

Aurora (`apps/aurora/`) is the reference skin ("skin zero"). The **creator** skin
(`apps/creator/`, brand "Glitch") is a worked example of a fully custom skin. Copy
from them.

**Naming — code is the category, brand is data.** Name a skin's code by its stable
*category*: folder `apps/creator/`, components `CreatorWalletScreen`, `id: 'creator'`,
token `[data-app='creator']`. The mutable brand name is a **data value** —
`export const BRAND = 'Glitch'` in the skin's `config.ts`, read by every face (auth
copy, OTP sheet, card line) and the registry `label`. Re-branding is then a one-line
edit; never bake a brand name into a filename or identifier. (Aurora keeps its
`aurora` code id for historical reasons — it predates this rule.)

## The one rule

**A per-skin file is presentational only.** It calls `useWalletHome()`, reads the
shared data, and renders. It must NOT re-implement balance math, FX/fees, API
calls, card issuance, tap-to-pay, or bank/address data — all of that is the shared
brain.

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
    AppShell, glass, icons, FaceIdAuth, GlassToast, useStaggerReveal, …  # primitives
  aurora/           # reference skin (skin zero). Its wallet/ holds the FACES:
                    #   AddMoneySheet, SendReceiveSheet, CardHomeContent,
                    #   CardIssuanceContent, DebitCard, TapToPayStatus,
                    #   WalletCardDetailHeader, WalletListSection/Card/Item, Flag.
  creator/          # full worked example (brand "Glitch"): owns every face (auth, overlays,
                    #   home, + all flow faces) — each a thin view over the brains.
  <yourskin>/       # your skin lives here
  skins.ts          # persona -> skin registry (AuthScreen / WalletScreen / overlays)
  SignInFlow.tsx    # shared auth <-> wallet handoff (generic; don't fork)
  types.ts          # SkinAuthScreenProps / SkinWalletScreenProps contracts
data/, lib/, hooks/ # shared data + logic (apiCalls, bankCountries, cryptoAddresses, useWalletDemoLogic, FX, …)
```

- **Edit freely:** everything in `apps/<yourskin>/`.
- **Do NOT edit to change one skin:** `apps/shared/**`, `data/`, `lib/`, `hooks/`
  (shared by all skins), and `apps/aurora/**` (the shipped app). To change a skin,
  edit that skin's folder.

## What `useWalletHome()` gives you (consume, never rebuild)

State/derived: `cardView`, `issued`, `tapPhase`, `transactions`, `sheetMode`,
`sheetOpen`, `sheetConfirming`, `sendReceiveOpen`, `toast`, `availableCents`,
`earningsTodayCents`, `weeklyBars`, `weeklySpentCents`, `homeActivity`,
`apyPercent`, `isOpen`, `isIssuance`, `showFullAurora`, `cardCentered`, `isTap`.

Setters/handlers: `setCardView`, `setSheetOpen`, `setSendReceiveOpen`,
`setTapPhase`, `setToast`, `showToast`, `openSheet`, `startSend`, `startReceive`,
`openCard`, `startTapToPay`, `finishTransfer`, `confirmTransfer`,
`handleReceivePayment`.

Shared contract (from `@/apps/shared/wallet`): `formatUsdCents`, `truncateAddress`,
`typedToCents`, and the data-shape types (`MoneySheetMode`, `TransferActivity`,
`ReceivedPayment`, `WalletListItemData`, `WalletItemAvatar`).

Your `WalletScreen` implements `SkinWalletScreenProps`; your `AuthScreen`
implements `SkinAuthScreenProps` (both in `apps/types.ts`).

## Sheets & flows: the face is yours, the brain isn't

A flow's **brain** (step machine, validation, FX, API callbacks) is a shared hook;
its **face** (the sheet UI) is per-skin. Add money is fully split: `useMoneySheet()`
(in `apps/shared/wallet`) is the brain, and both Aurora's and the creator skin's
`wallet/AddMoneySheet.tsx` are thin views over it. `BottomSheet` (rise/scrim) is a
shared mechanic.

To give your skin its own sheet:

- **Fork the face** — copy `apps/aurora/wallet/AddMoneySheet.tsx` (+ its
  `.module.scss`) into `apps/<skin>/wallet/`, point `WalletScreen` at it, and
  restyle freely (the creator skin flattened the frosted search pill into a solid one, for
  example). Because the face is a thin view over `useMoneySheet`, the copy carries
  **no logic** — the brain stays single-source, so flow changes happen once.
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

`creator` (built; brand "Glitch") is the convention example. `social` and
`marketplace` are registered too (token-only so far; brands "Pulse"/"Bazaar" live as
the registry `label` until those skins get a `config.ts`). `ondemand`/`messaging` are
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
   home) or `aurora/wallet/AuroraWalletScreen.tsx` (baseline), call
   `useWalletHome(props)`, render your layout + the flow faces (reused or copied).
5. **Register** — add the entry to `APP_SKINS` in `apps/skins.ts`
   (`{ id, persona, label, fontFamily, AuthScreen, WalletScreen }`, plus an optional
   `AuthSheet` to own the branded OTP overlay — omit it to fall back to Aurora's) and
   the id to `AppSkinId`. `DemoPhone` routes by persona automatically; a skin with no
   `AuthScreen`/`WalletScreen` stays dark ("coming soon"). (The passkey sheet is shared
   system chrome — not registered per skin.)

## Run + verify

- Dev server: `npm run dev` (port 4000). The playground left rail picks the persona.
- Typecheck: `npx tsc --noEmit`. Baseline has 3 pre-existing errors (`cornerShape`×2
  in `AppShell`, `superellipse` in `LiquidGlass`) — ignore those; add none.
- The build uses `ignoreBuildErrors: true`; the dev-server compile is the real signal.
- Verify both skins after a shared change: Aurora (Financial app) must look
  identical to before, and your skin must still work.

## Gotchas

- Selecting a use-case switches the rendered persona (`useWalletDemoLogic` keeps
  `useCase` + `persona` in sync) — only personas in the `Persona` union work.
- Passkey sign-in needs real WebAuthn (won't auto-confirm in headless browsers);
  use the left-rail flow jumps (Add money, Issue a card, Tap to pay) to reach the
  wallet for testing.
- `--font-family-inter` isn't loaded on this branch; the creator skin's `skin.scss`
  references it and falls back to the SF Pro stack. Load Inter (or change the token)
  for the intended type.

## Pointers

- Branch: `pat/wallet-demo-skins` (off the launched `origin/main`).
- Copy-from templates: `apps/aurora/` (baseline) and `apps/creator/` (custom home + auth).
