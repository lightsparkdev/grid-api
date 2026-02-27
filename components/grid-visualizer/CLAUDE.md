# Grid Visualizer

## Product Overview

Grid Visualizer is an interactive tool that helps integrators understand and get started with the Lightspark Grid API. It walks users through configuring a payment flow — source, destination, funding model, audience — and generates a visual flow diagram plus API call sequences.

**Core insight**: Composable money-movement APIs like Grid are extremely hard to consume because they must expose everything. Grid Visualizer short-circuits this by asking the right questions and surfacing only what the user cares about. Specify your exact use case, get back a tailored list of API calls.

## Audience

- **Integrators/developers** evaluating Grid or learning the API
- **Sales team** for demo conversations showing how easy integration is
- **Existing customers** exploring new payment flows and capabilities

## Entry Points

- **Docs site**: grid.lightspark.com
- **Marketing site**: lightspark.com/grid
- **Direct links** shared in sales conversations
- Currently deployed at: https://grid-visualizer-opal.vercel.app/

## Tech Stack

- **Next.js** 14 (App Router) / **React** 18 / **TypeScript** 5
- **SCSS** with CSS Modules for component scoping
- **@lightsparkdev/origin** — Lightspark's design system (local vendor package at `vendor/origin/`)
- **@xyflow/react** — Flow diagram visualization
- **motion** — Animations
- **react-syntax-highlighter** — Code display (oneDark theme)
- **match-sorter** — Fuzzy search for currency search
- **@tanstack/react-table**, **@base-ui/react**, **ajv**, **clsx**
- Deployed on **Vercel** with `--ignore-scripts` workaround for icon license issues

## Design System

Uses Lightspark **Origin** (`vendor/origin/`). Tokens imported via SCSS in `src/app/globals.scss`.

**Tokens in use:**
- Colors: `--text-primary`, `--text-secondary`, `--text-tertiary`, `--surface-primary`, `--surface-secondary`
- Spacing: `--spacing-sm`, `--spacing-md`, `--spacing-lg`, `--spacing-xl`, `--spacing-3xl`
- Border radius: `--corner-radius-md`
- Typography: `--font-family-sans`, `--font-weight-book`
- Mixins: `@include headline`, `@include body`, `@include body-sm`, `@include label`

**Color coding:** Blue for fiat flows, purple for crypto flows.

## Architecture

### State Machine

The wizard uses a **useReducer** state machine in `src/app/page.tsx`. Single source of truth for all wizard state.

**State shape:**
```typescript
interface State {
  step: Step;
  sourceType: 'fiat' | 'crypto' | null;
  sourceCurrency: string | null;
  sourceRails: string[] | null;
  source: Selection | null;
  destType: 'fiat' | 'crypto' | null;
  destCurrency: string | null;
  destRails: string[] | null;
  destination: Selection | null;
  destAccount: 'external' | 'internal' | null;
  funding: 'pre-funded' | 'jit' | null;
  audience: 'human' | 'agent' | null;
}
```

**Actions:** `SET_SOURCE_TYPE`, `SET_SOURCE_CURRENCY`, `SET_SOURCE_RAIL`, `SET_DEST_TYPE`, `SET_DEST_CURRENCY`, `SET_DEST_RAIL`, `SET_DEST_ACCOUNT`, `SET_FUNDING`, `SET_AUDIENCE`, `RESET_SOURCE`, `RESET_DEST`, `RESET_FUNDING`, `RESET_ALL`

### Smart Flow Logic

- Automatically skips rail selection if only one rail/network is available
- `dest-account` step only shown for single-switch scenarios (not fiat-to-fiat cross-currency)
- `funding` step skipped for internal same-currency transfers
- Two-switch logic: fiat-to-fiat cross-currency always requires external account

## Key Directories

```
src/
├── app/
│   ├── page.tsx              # Main wizard (useReducer state machine)
│   ├── layout.tsx            # Root layout with metadata
│   ├── globals.scss          # Global styles, imports Origin tokens
│   └── page.module.scss      # Page-specific styles
├── components/
│   ├── TypeSelector/         # Fiat vs Crypto card selection
│   ├── CardSelector/         # Generic card-based option selector
│   ├── CurrencySearch/       # Fiat currency search with fuzzy matching
│   ├── OptionSelector/       # Pill-based option selector
│   ├── SelectionSummary/     # Summary cards showing current selections
│   ├── FlowVisualization/    # Flow diagram (@xyflow/react)
│   │   └── CustomNode.tsx    # Custom node styling
│   └── OutputDisplay/        # API code generation and display
├── data/
│   ├── currencies.ts         # 12 fiat currencies with payment rails
│   └── crypto.ts             # 3 crypto assets (BTC, USDC, USDT) with networks
└── stubs/
    └── central-icons.js      # Icon package stub (license workaround)
vendor/
└── origin/                   # Lightspark Origin design system
refs/                         # Internal reference screenshots (gitignored)
```

## UX Flow

### 9 steps across 4 step groups:

**Group 1 — Set up the source**
1. **source-type**: Fiat or Crypto (`TypeSelector`)
2. **source-detail**: Currency/asset selection (`CurrencySearch` for fiat, `OptionSelector` for crypto)
3. **source-rail**: Rail/network selection — skipped if only one option (`OptionSelector`)

**Group 2 — Set up the destination**
4. **dest-type**: Fiat or Crypto (`TypeSelector`)
5. **dest-detail**: Currency/asset selection (excludes source currency/asset if same type)
6. **dest-account**: External or Internal account — conditional (`CardSelector`)
7. **dest-rail**: Rail/network selection — conditional (`OptionSelector`)

**Group 3 — Choose funding model**
8. **funding**: Pre-funded or Just-in-time — skipped for internal same-currency (`CardSelector`)

**Group 4 — Choose output format**
9. **audience**: Human (curl commands) or AI Agent (structured JSON) (`CardSelector`)
10. **output**: Flow diagram + generated API code sequences

## Code Conventions

- **Components**: PascalCase directories with `Component.tsx` + `Component.module.scss`
- **CSS Modules**: imported as `styles`, used as `styles.className`
- **Actions**: SCREAMING_SNAKE_CASE
- **Step names**: kebab-case (`source-type`, `dest-detail`)
- **Conditional classes**: `clsx` utility
- **Type safety**: Union types for steps, discriminated unions for actions
- **Always use design tokens** for spacing, colors, borders, typography — never hardcode values unless explicitly given a one-off value by the designer

### Icons

**Never hand-draw SVG paths.** Always use the central icon library directly.

Import icons from `@central-icons-react/round-outlined-radius-0-stroke-1.5` (the default variant):

```tsx
import { IconChevronBottom } from '@central-icons-react/round-outlined-radius-0-stroke-1.5/IconChevronBottom';

<IconChevronBottom size={12} />
```

Props: `size` (number, default 24), `color` (string, default `currentColor`).

The icon registry at `vendor/origin/src/components/Icon/icon-registry.ts` lists all available icon names. You can also use Origin's `CentralIcon` wrapper: `<CentralIcon name="IconChevronBottom" size={12} />`.

## Design Principles

These guide every design and implementation decision. When in doubt, refer back here.

1. **Utility first, showcase as a byproduct.** The tool is most impressive when it's most useful. A developer who gets working curl commands in 30 seconds IS the demo. Don't optimize for spectacle at the cost of speed.

2. **Every screen should have one job.** If a screen is doing two things (e.g. choosing AND previewing), it's doing too much. Identify the single job and cut everything that doesn't serve it.

3. **The right panel earns its space.** It starts minimal and gets richer as the user invests choices. Don't front-load it with content the user hasn't committed to yet. The build-up IS the payoff.

4. **Reduce decisions, don't add them.** Before adding any element, ask: does this help the user decide faster, or does it give them another thing to evaluate? Preset flows = fewer decisions (good). Preset previews = more decisions (bad — now they're comparing instead of picking).

5. **The output is the product.** Everything before the output screen is a funnel. Optimize for getting there, not for making the journey scenic.

## Design Direction

Split layout with left panel (wizard controls) and right panel (live preview canvas). Figma-first workflow — mock up in Figma, review, then implement.

**Start screen**: Preset flow cards (fastest path) above manual fiat/crypto builder (escape hatch). Right panel is minimal — a seed node, not a preview. The screen's one job: get the user into a flow.

**Mid-flow**: Left panel shows breadcrumb progress + summary of prior choices (editable) + current step question. Right panel builds up with connected nodes as choices are made. Pending nodes shown as dashed outlines.

**Output screen**: The payoff. Flow summary bar + numbered API steps with syntax-highlighted code blocks on the left. Complete flow diagram on the right. Actions: copy, edit flow, open in dashboard.

**Visual polish** (in progress): Flags for currencies, icons for assets/rails, smooth transitions via motion library.

**Parked ideas** (revisit after core flow is polished):
- Natural language input field backed by LLM — feasible (constrained output space, single API call to parse intent into wizard state), but core flow comes first
- Searchable/filterable presets as a lighter alternative to NL input

## Grid API Source of Truth

The Grid API docs and OpenAPI spec are at `/Users/patcapulong/Development/Projects/Grid Docs/mintlify`. The OpenAPI spec is the definitive source for account types, endpoints, and request/response schemas.

### Key API Facts

- **Base URL**: `https://api.lightspark.com/grid/2025-10-13`
- **Auth**: HTTP Basic Auth (`client_id:client_secret`)
- **Rails are NOT user-selectable** — Grid auto-routes based on currency, country, amount
- **JIT funding only works with instant rails** (RTP, FedNow, SEPA Instant, PIX, SPEI, UPI, Faster Payments, PayNow, FAST, all crypto). ACH, Wire, generic Bank Transfer are NOT JIT-eligible.

### Supported Account Types (ExternalAccountType enum)

Fiat: `US_ACCOUNT`, `CLABE`, `PIX`, `IBAN`, `UPI`, `NGN_ACCOUNT`, `CAD_ACCOUNT`, `GBP_ACCOUNT`, `PHP_ACCOUNT`, `SGD_ACCOUNT`
BTC: `SPARK_WALLET`, `LIGHTNING`
Stablecoins: `SOLANA_WALLET` (USDC), `TRON_WALLET` (USDT), `POLYGON_WALLET` (USDC), `BASE_WALLET` (USDC)

### Key Endpoints

- `POST /customers` — Create customer
- `POST /customers/external-accounts` — Register external account
- `GET /customers/internal-accounts` — List customer internal accounts
- `GET /platform/internal-accounts` — List platform internal accounts
- `POST /quotes` — Create cross-currency transfer quote
- `POST /quotes/{quoteId}/execute` — Execute quote
- `POST /transfer-out` — Same-currency internal → external
- `POST /transfer-in` — Same-currency external → internal

### Quote Request Shape

```json
{
  "source": { "sourceType": "ACCOUNT" | "REALTIME_FUNDING", ... },
  "destination": { "destinationType": "ACCOUNT" | "EXTERNAL_ACCOUNT_DETAILS" | "UMA_ADDRESS", ... },
  "lockedCurrencySide": "SENDING" | "RECEIVING",
  "lockedCurrencyAmount": 10000
}
```

### Sync Automation

Grid Docs repo has a nightly GitHub Action (`docs-sync.yml`) that uses `anthropics/claude-code-action@v1` to detect OpenAPI changes and auto-create PRs. We plan to create a similar workflow for this tool.

## Plans

- **UI redesign plan**: `/Users/patcapulong/.claude/plans/validated-wobbling-dragon.md`
- **Make it real plan**: `/Users/patcapulong/.claude/plans/make-it-real.md`
- **Pre-migration checklist**: `TODO-before-migration.md` (OG images, metadata, etc.)

## Open Questions

- **Mobile responsiveness**: Strategy TBD

### TODO: Questions for Victor

These block accuracy of generated code and flow diagrams. Once answered, updates are small (data arrays + enum values).

1. **Crypto source region — why does Grid need it?**
   - When crypto is source, we ask "Where's your USDC?" and show a region picker. The region determines which Grid Switch the user is assigned to (e.g., USD Grid Switch vs EUR Grid Switch).
   - Is this compliance/KYC, routing optimization, pricing, or all three?
   - Does it affect the actual API calls, or just the internal routing?
   - UX implication: should we block the flow on this, or default to something sensible?

2. **USDB — external or internal only?**
   - USDB is NOT in the `ExternalAccountType` enum in the OpenAPI spec.
   - It appears in internal account funding instructions (`assetType: "USDB"` with `SPARK_WALLET`).
   - Should we keep it in the picker as a full crypto asset, limit it to internal-only flows, or remove it?

3. **Bank Transfer countries — what are the actual `ExternalAccountType` values?**
   - We added 20 currencies from the docs (GHS, KES, ZAR, CNY, IDR, THB, etc.) with best-guess account types (`GHS_ACCOUNT`, `KES_ACCOUNT`, etc.) and generic fields (`accountNumber` + `bankName`).
   - What are the real `ExternalAccountType` enum values for these countries?
   - Do they all use the same generic fields, or do some have country-specific requirements?
   - Are any of these countries on instant rails (would affect JIT eligibility)?
   - Countries added: Ghana, Kenya, South Africa, Botswana, Tanzania, Uganda, Malawi, Zambia, China, Hong Kong, Indonesia, South Korea, Malaysia, Thailand, Vietnam, Sri Lanka, Costa Rica, DR Congo, plus XOF (West Africa) and XAF (Central Africa) regions.

## Team Context

- Victor built the initial tool; Pat (design/UX) is leading design polish
- Team sees this as useful for sales conversations, developer onboarding, and potentially automated docs
- Jeremy has insights on JIT funding rules and internal/external account mechanics
- Grid Docs repo has OpenAPI spec as source of truth + automated sync via Claude Code

## Figma Bridge (MCP)

When building UI from Figma designs, use the figma-bridge MCP server. Tool priority:

1. **build_tree / build_ir** — create entire node hierarchies in one call. Prefer `build_ir` for token efficiency.
2. **patch_tree** — update existing nodes. Only specify changed properties.
3. **figma_execute** — batch 2+ atomic operations with ref chaining. Use `summary: true` for compact results.
4. **figma_help** — discover which action to use via `figma_execute`. Primary action discovery tool.

**Token budget tips:**
- Start with `figma_design_system_summary` (~200 tokens) instead of raw `list_variables` (~5000 tokens).
- Use `figma_file_index` (cached 60s) for name-to-ID resolution instead of repeated `find_variable`/`find_style` calls.
- Use `build_ir` over `build_tree` for 3-5x token savings on node creation.
- Use `batch_get_node_properties` instead of multiple individual calls.
- Pass `summary: true` on `figma_execute` for compact receipts.

**Critical gotchas:**
- Auto-layout resets sizing to HUG — the bridge handles this automatically.
- `clone()` drops variable bindings — the bridge's `copyBoundVariables` re-applies them.
- Font loading is mandatory before text mutations.
- `appendChild` transforms coordinates — set `x`/`y` after, not before.

**Ref chaining:** Assign `ref: "myName"` to capture a result, reference later with `nodeRef`, `parentRef`, etc.

## Special Configuration

- **Icon workaround**: `src/stubs/central-icons.js` stubs out `@central-icons-react` to avoid license issues. Webpack config in `next.config.mjs` does module replacement.
- **Vercel**: `vercel.json` uses `--ignore-scripts` flag
- **Origin transpiling**: `next.config.mjs` configures `transpilePackages` for the vendor Origin package
- **Grid Docs path**: `/Users/patcapulong/Development/Projects/Grid Docs/mintlify`
