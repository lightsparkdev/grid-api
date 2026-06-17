# Building a skin (agent guide)

The wallet demo is **share the brain, not the face**. The app's logic and data
live once, shared; each persona ("skin") owns its entire UI. You can build or
restyle a skin freely without touching — or breaking — any other skin (Aurora is
shipped; treat it as untouchable unless you're explicitly changing Aurora).

Aurora (`apps/aurora/`) is the reference skin ("skin zero"). Wiggle
(`apps/wiggle/`) is a worked example of a fully custom skin. Copy from them.

## The one rule

**A per-skin file is presentational only.** It calls `useWalletHome()`, reads the
shared data, and renders. It must NOT re-implement balance math, FX/fees, API
calls, card issuance, tap-to-pay, or bank/address data — all of that is the shared
brain.

## Layers

```
src/apps/
  shared/
    wallet/         # THE BRAIN (no JSX): useWalletHome(), activity builders,
                    #   format.ts (formatUsdCents/truncateAddress/typedToCents),
                    #   types.ts (MoneySheetMode, TransferActivity, ReceivedPayment,
                    #   WalletListItemData, …) — the canonical shared contract.
    BottomSheet/    # MECHANIC: sheet rise/scrim/portal (skin-blind). Reuse as-is.
    AppShell, glass, icons, FaceIdAuth, GlassToast, AuroraBackground, useStaggerReveal, …  # primitives
  aurora/           # reference skin (skin zero). Its wallet/ holds the FACES:
                    #   AddMoneySheet, SendReceiveSheet, CardHomeContent,
                    #   CardIssuanceContent, DebitCard, TapToPayStatus,
                    #   WalletCardDetailHeader, WalletListSection/Card/Item, Flag.
  wiggle/           # example custom skin (own auth + home; reuses Aurora's sheets)
  <yourskin>/       # your skin lives here
  skins.ts          # persona -> skin registry (AuthScreen / WalletScreen)
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

The flow UI (AddMoneySheet, SendReceiveSheet, the card flow, list rows) is a
**face**, and faces are per-skin. The `BottomSheet` rise/scrim mechanic and the
brain/data behind a flow are shared. So for a flow you have two choices:

- **Reuse Aurora's face** — `import { AddMoneySheet } from '@/apps/aurora/wallet/AddMoneySheet'`
  (and friends). Fastest; the sheet looks like Aurora's. Wiggle does this today.
- **Own the face** — copy the sheet file from `apps/aurora/wallet/` into
  `apps/<skin>/wallet/` and restyle it freely (flat instead of frosted, different
  layout, your own buttons). It keeps calling the same shared handlers/data.

Do **not** add props/tokens to Aurora's sheet to make it configurable for another
skin — copy it and edit the copy. Duplicated view code is the accepted trade for
unfettered per-skin freedom.

## Add a new skin (step by step)

`creator`→Wiggle, `social`→`pulse`, `marketplace`→`bazaar` personas exist;
`ondemand`/`messaging` are use-case tiles only (add the persona in step 1 first).

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
   `SkinWalletScreenProps`. Start from `wiggle/wallet/WiggleWalletScreen.tsx` (custom
   home) or `aurora/wallet/AuroraWalletScreen.tsx` (baseline), call
   `useWalletHome(props)`, render your layout + the flow faces (reused or copied).
5. **Register** — add the entry to `APP_SKINS` in `apps/skins.ts`
   (`{ id, persona, label, fontFamily, AuthScreen, WalletScreen }`) and the id to
   `AppSkinId`. `DemoPhone` routes by persona automatically; a skin with no
   `AuthScreen`/`WalletScreen` stays dark ("coming soon").

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
- `--font-family-inter` isn't loaded on this branch; Wiggle's `skin.scss` references
  it and falls back to the SF Pro stack. Load Inter (or change the token) for the
  intended Wiggle type.

## Pointers

- Branch: `pat/wallet-demo-skins` (off the launched `origin/main`).
- Copy-from templates: `apps/aurora/` (baseline) and `apps/wiggle/` (custom home + auth).
