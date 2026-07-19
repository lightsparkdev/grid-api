# Add cards and auth domains to the Grid CLI

## Context
Follow-up to the CLI drift work (#702) and contact verification (#703). The requester asked to "tackle cards and auth next" — two of the whole-domain gaps from the audit. This adds `grid cards …` and `grid auth …` commands, stacked on the existing branches (shared test harness, no index.ts conflicts).

## Approach
Two stacked PRs on top of #703:
1. **cards** (`cli/src/commands/cards.ts`) — full surface (5 commands).
2. **auth** (`cli/src/commands/auth.ts`) — a **read-focused MVP** (6 commands).

Both register in `cli/src/index.ts` and follow the exact existing command pattern (`registerXCommand`, commander options, `client.get/post/patch/delete`, `outputResponse`) with vitest boundary tests (stub `fetch`, assert the request) like the rest of the suite.

### Key scope decision — auth
Every mutating auth operation **except two** is a signed-retry flow: the first unsigned call returns `202` with a `payloadToSign`, and completion requires a `Grid-Wallet-Signature` header (a Turnkey API-key stamp built from a client-held P-256 key) + `Request-Id`. The CLI can neither build those stamps (that lives in `scripts/embedded-wallet-sign.js` via `@turnkey/*` + HPKE) nor send the headers (`client.ts` has no per-call header support). Passkey flows additionally need WebAuthn. So the auth MVP ships only what genuinely completes from a flag CLI:

**Auth MVP (SUPPORT):** `credentials list`, `credentials challenge <id>` (OTP resend — plain unsigned POST), `delegated-keys list`, `delegated-keys get <id>`, `delegated-keys revoke <id>` (the one revoke Grid signs with its own custodied key → single unsigned DELETE), `sessions list`.

**Deferred to a Phase 2 (OUT OF SCOPE here):** `credentials create/revoke/verify`, `delegated-keys create`, `sessions revoke/refresh`. These need (a) `client.ts` extended to send `Grid-Wallet-Signature`/`Request-Id` headers and (b) a Turnkey/HPKE signing helper. Called out in the PR; not built now.

Cards has one analogous limitation: `cards update` uses the same 202 signed-retry pattern, so the unsigned PATCH surfaces the challenge JSON (same behavior as the existing `quotes execute` / `accounts export`). We still ship `cards update` (freeze/unfreeze/replace-sources/close all express through `state`/`fundingSources`) and note the gap.

## Changes

### PR 1 — cards

#### 1. `cli/src/commands/cards.ts` (new)
- **What**: `registerCardsCommand(program, getClient)` with:
  - `cards list` → GET `/cards`; filters `--cardholder-id`, `--account-id`, `--platform-card-id`, `--state`, `-l/--limit`, `--cursor`, `--sort` (→ `sortOrder`); `PaginatedResponse<Card>`.
  - `cards get <cardId>` → GET `/cards/{id}`.
  - `cards create` → POST `/cards`; required `--cardholder-id`, `--funding-sources` (comma list → `fundingSources[]`); `--form` (default `VIRTUAL`), `--platform-card-id`.
  - `cards update <cardId>` → PATCH `/cards/{id}`; `--state` (ACTIVE|FROZEN|CLOSED), `--funding-sources`. Validate ≥1 provided and reject `--state CLOSED` + `--funding-sources` together.
  - `cards reveal <cardId>` → POST `/cards/{id}/reveal` (no body); prints the short-lived `panEmbedUrl` (description notes it's a bearer secret to render in an iframe, not stored). No `delete` subcommand (close = `update --state CLOSED`).
- **Why**: cards is a full new product area with no CLI coverage.

#### 2. `cli/src/index.ts`
- **What**: dynamic-import + register `registerCardsCommand` alongside the others.

#### 3. `cli/test/cards.test.ts` (new)
- Boundary tests: create body shape, list query params, update variants (freeze/replace/close), update validation guard, reveal path.

### PR 2 — auth (stacked on cards)

#### 4. `cli/src/commands/auth.ts` (new)
- **What**: `registerAuthCommand` with nested groups:
  - `auth credentials list` → GET `/auth/credentials`, required `--account-id`.
  - `auth credentials challenge <id>` → POST `/auth/credentials/{id}/challenge` (empty body; OTP resend).
  - `auth delegated-keys list` → GET `/auth/delegated-keys`; `--account-id` / `--funding-source-id` (≥1 required).
  - `auth delegated-keys get <id>` → GET `/auth/delegated-keys/{id}`.
  - `auth delegated-keys revoke <id>` → DELETE `/auth/delegated-keys/{id}` with `-y/--yes` + confirm.
  - `auth sessions list` → GET `/auth/sessions`, required `--account-id`.
  - List responses are `{ data: T[] }` (not paginated) — declare a small `AuthListResponse<T>`.
- **Why**: gives the full auth read surface + the two genuinely-completable mutations.

#### 5. `cli/src/index.ts`
- **What**: register `registerAuthCommand`.

#### 6. `cli/test/auth.test.ts` (new)
- Boundary tests for each of the 6 commands (method/path/query/body).

#### 7. `cli/README.md`
- **What**: document the new `cards` and `auth` command groups, incl. the reveal/update and auth-MVP limitations.

## Verification
- [ ] `cd cli && npm run build` — clean strict compile.
- [ ] `npm test` — new cards + auth boundary tests pass alongside the existing 34.
- [ ] Spot-check a built request body against the corresponding `openapi/components/schemas/{cards,auth}/**` schema.

## Risks
- Auth MVP intentionally omits the signed-retry/crypto commands. If the requester wants those, it's a larger Phase 2 (client header support + Turnkey/HPKE signing) — flagged, not built.
- `cards update` / signed ops surface the 202 challenge rather than the final object — consistent with existing CLI behavior; documented.
