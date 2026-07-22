# KYC Onboarding Sample Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "KYC Onboarding" flow to the Grid API sample app demonstrating the hosted KYC link: create customer → generate hosted link → track `kycStatus` via polling and webhooks.

**Architecture:** Two thin proxy routes are added to the Kotlin (Ktor) backend that call the Grid Kotlin SDK (`getKycLink`, `retrieve`). The React frontend gains a three-step wizard flow reusing the existing `StepWizard`/`JsonEditor`/`ResponsePanel` components; the existing `WebhookStream` panel already surfaces `CUSTOMER.KYC_*` events.

**Tech Stack:** Kotlin + Ktor + `com.lightspark.grid:lightspark-grid-kotlin:1.7.1` (backend); React 18 + TypeScript + Vite + Tailwind (frontend).

**Spec:** `docs/superpowers/specs/2026-07-21-kyc-sample-flow-design.md`

## Global Constraints

- All work happens in the worktree `/Users/pengying/Src/grid-api/.worktrees/kyc-sample-flow` on branch `kyc-sample-flow` (Graphite-tracked, parent `main`). All paths below are relative to the worktree root.
- Commits: stage files **individually by name** (never `git add -A`/`.`), commit with `gt modify --commit -m "<msg>"` (Graphite repo; keeps everything on this one branch). End every commit message with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Backend e2e tests hit the real Grid sandbox and require env vars `GRID_CLIENT_ID`, `GRID_CLIENT_SECRET`, `GRID_WEBHOOK_PUBKEY`. If they are not set in your shell, check the main clone's `samples/kotlin` run configuration or ask the user — do not fabricate values. If credentials are unavailable, `./gradlew build -x test` (compile only) is the fallback verification and the test run must be flagged as skipped in your report.
- SDK naming gotcha: `CustomerGetKycLinkParams.Builder.platformCustomerId(...)` fills the `{customerId}` **path segment** of `POST /customers/{customerId}/kyc-link` despite its name. Pass the Grid customer ID (e.g. `Customer:0195...`) to it.
- The frontend build (`npm run build`) runs `tsc -b` — it is the type-check gate. `node_modules` may be missing in the worktree; run `npm install` in `samples/frontend` first if so.

---

### Task 1: Backend routes — generate KYC link + retrieve customer

**Files:**
- Modify: `samples/kotlin/src/main/kotlin/com/grid/sample/routes/Customers.kt`
- Test: `samples/kotlin/src/test/kotlin/com/grid/sample/EndToEndTest.kt`

**Interfaces:**
- Consumes: existing helpers `GridClientBuilder.client`, `JsonUtils`, `Log`, `optText` (all already imported or importable in `Customers.kt`).
- Produces (relied on by Tasks 2–3):
  - `POST /api/customers/{customerId}/kyc-link` — body `{ "redirectUri"?: string }`; 201 with Grid's `CustomerGetKycLinkResponse` JSON (`kycUrl`, `expiresAt`, `provider`, `token?`); errors as `{"error": "..."}` with 500.
  - `GET /api/customers/{customerId}` — 200 with the full customer JSON incl. `kycStatus`; errors as `{"error": "..."}` with 500.

- [ ] **Step 1: Write the failing test**

Append to `EndToEndTest.kt` (inside the `EndToEndTest` class, after the existing tests):

```kotlin
    @Test
    fun `generate KYC link and retrieve customer`() = testApplication {
        configureApp()

        // Step 1: Create customer
        val customerResponse = client.post("/api/customers") {
            contentType(ContentType.Application.Json)
            setBody("""
                {
                    "platformCustomerId": "test_kyc_${System.currentTimeMillis()}",
                    "customerType": "INDIVIDUAL",
                    "fullName": "Kyc Test User",
                    "nationality": "US",
                    "birthDate": "1990-01-01",
                    "address": {
                        "country": "US",
                        "line1": "123 Test St",
                        "postalCode": "10001",
                        "city": "New York",
                        "state": "NY"
                    }
                }
            """)
        }
        assertEquals(HttpStatusCode.Created, customerResponse.status)
        val customerId = parseJson(customerResponse.bodyAsText()).get("id").asText()

        // Step 2: Generate a hosted KYC link
        val linkResponse = client.post("/api/customers/$customerId/kyc-link") {
            contentType(ContentType.Application.Json)
            setBody("""{"redirectUri": "http://localhost:5173/onboarding-complete"}""")
        }
        assertEquals(HttpStatusCode.Created, linkResponse.status)
        val link = parseJson(linkResponse.bodyAsText())
        assertNotNull(link.get("kycUrl")?.asText(), "Response should include kycUrl")
        assertNotNull(link.get("expiresAt")?.asText(), "Response should include expiresAt")

        // Step 3: Retrieve the customer and check kycStatus is present
        val getResponse = client.get("/api/customers/$customerId")
        assertEquals(HttpStatusCode.OK, getResponse.status)
        val fetched = parseJson(getResponse.bodyAsText())
        assertEquals(customerId, fetched.get("id")?.asText())
        assertNotNull(fetched.get("kycStatus")?.asText(), "Customer should include kycStatus")
    }
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
cd samples/kotlin && ./gradlew test --tests "*generate KYC*"
```
Expected: FAIL — the kyc-link POST returns 404 (route not registered), so the `assertEquals(HttpStatusCode.Created, linkResponse.status)` assertion fails with `expected: 201 Created, actual: 404 Not Found`. (Customer creation itself should succeed; if it fails with an auth error, the sandbox env vars are missing — see Global Constraints.)

- [ ] **Step 3: Implement the routes**

In `Customers.kt`, add one import (alphabetical position after the existing `customers` imports):

```kotlin
import com.lightspark.grid.models.customers.CustomerGetKycLinkParams
```

Then add the two handlers inside the existing `route("/api/customers") { ... }` block, after the existing `post { ... }` handler:

```kotlin
        get("/{customerId}") {
            try {
                val customerId = call.parameters["customerId"]
                    ?: return@get call.respondText(
                        """{"error": "customerId is required"}""",
                        ContentType.Application.Json,
                        HttpStatusCode.BadRequest
                    )

                Log.gridRequest("customers.retrieve", customerId)
                val customer = GridClientBuilder.client.customers().retrieve(customerId)
                val responseJson = JsonUtils.prettyPrint(customer)
                Log.gridResponse("customers.retrieve", responseJson)

                call.respondText(responseJson, ContentType.Application.Json, HttpStatusCode.OK)
            } catch (e: Exception) {
                Log.gridError("customers.retrieve", e)
                call.respondText(
                    """{"error": "${e.message}"}""",
                    ContentType.Application.Json,
                    HttpStatusCode.InternalServerError
                )
            }
        }

        post("/{customerId}/kyc-link") {
            try {
                val customerId = call.parameters["customerId"]
                    ?: return@post call.respondText(
                        """{"error": "customerId is required"}""",
                        ContentType.Application.Json,
                        HttpStatusCode.BadRequest
                    )

                val body = call.receiveText()
                Log.incoming("POST", "/api/customers/$customerId/kyc-link", body)
                val json = if (body.isBlank()) {
                    JsonUtils.mapper.createObjectNode()
                } else {
                    JsonUtils.mapper.readTree(body)
                }

                val params = CustomerGetKycLinkParams.builder()
                    // Fills the {customerId} path segment (SDK names it platformCustomerId).
                    .platformCustomerId(customerId)
                    .apply {
                        json.optText("redirectUri")?.let { redirectUri(it) }
                    }
                    .build()

                Log.gridRequest("customers.getKycLink", customerId)
                val link = GridClientBuilder.client.customers().getKycLink(params)
                val responseJson = JsonUtils.prettyPrint(link)
                Log.gridResponse("customers.getKycLink", responseJson)

                call.respondText(responseJson, ContentType.Application.Json, HttpStatusCode.Created)
            } catch (e: Exception) {
                Log.gridError("customers.getKycLink", e)
                call.respondText(
                    """{"error": "${e.message}"}""",
                    ContentType.Application.Json,
                    HttpStatusCode.InternalServerError
                )
            }
        }
```

Note: `customers().retrieve(customerId)` is the SDK's string-overload (`retrieve(String, RequestOptions = none)`); no params object needed.

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
cd samples/kotlin && ./gradlew test --tests "*generate KYC*"
```
Expected: `BUILD SUCCESSFUL`, 1 test passed.

- [ ] **Step 5: Commit**

```bash
cd /Users/pengying/Src/grid-api/.worktrees/kyc-sample-flow
git add samples/kotlin/src/main/kotlin/com/grid/sample/routes/Customers.kt samples/kotlin/src/test/kotlin/com/grid/sample/EndToEndTest.kt
gt modify --commit -m "feat(samples): add kyc-link and get-customer backend routes

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Frontend step — Generate KYC Link

**Files:**
- Create: `samples/frontend/src/steps/CreateKycLink.tsx`

**Interfaces:**
- Consumes: `apiPost` from `src/lib/api.ts`; `JsonEditor`, `ResponsePanel` components; backend route from Task 1.
- Produces: `export default function CreateKycLink({ customerId, disabled, onComplete }: Props)` where `Props = { customerId: string | null; disabled: boolean; onComplete: (response: Record<string, unknown>) => void }`. Calls `onComplete` with the kyc-link response JSON on every successful generation. Used by Task 4.

- [ ] **Step 1: Write the component**

Create `samples/frontend/src/steps/CreateKycLink.tsx`:

```tsx
import { useState } from 'react'
import JsonEditor from '../components/JsonEditor'
import ResponsePanel from '../components/ResponsePanel'
import { apiPost } from '../lib/api'

const DEFAULT_BODY = JSON.stringify({
  redirectUri: 'http://localhost:5173/onboarding-complete',
}, null, 2)

interface Props {
  customerId: string | null
  disabled: boolean
  onComplete: (response: Record<string, unknown>) => void
}

export default function CreateKycLink({ customerId, disabled, onComplete }: Props) {
  const [body, setBody] = useState(DEFAULT_BODY)
  const [response, setResponse] = useState<string | null>(null)
  const [kycUrl, setKycUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)
    setKycUrl(null)
    try {
      const data = await apiPost<Record<string, unknown>>(
        `/api/customers/${customerId}/kyc-link`,
        JSON.parse(body),
      )
      setResponse(JSON.stringify(data, null, 2))
      setKycUrl(data.kycUrl as string)
      onComplete(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p className="text-sm text-gray-400 mb-2">
        Generate a single-use hosted verification link for this customer. Each link expires —
        re-run this step to mint a fresh one.
      </p>
      <JsonEditor value={body} onChange={setBody} disabled={disabled || loading} />
      <button
        onClick={submit}
        disabled={disabled || loading}
        className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded text-sm font-medium"
      >
        {loading ? 'Generating...' : 'Generate KYC Link'}
      </button>
      {kycUrl && (
        <p className="mt-3 text-sm">
          <a
            href={kycUrl}
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:text-blue-300 underline break-all"
          >
            Open hosted KYC flow ↗
          </a>
        </p>
      )}
      <ResponsePanel response={response} error={error} />
    </div>
  )
}
```

- [ ] **Step 2: Verify it type-checks**

Run:
```bash
cd samples/frontend && npm run build
```
Expected: `tsc -b` and `vite build` succeed. (`CreateKycLink` is not imported anywhere yet — that's fine; it only needs to compile.)

- [ ] **Step 3: Commit**

```bash
cd /Users/pengying/Src/grid-api/.worktrees/kyc-sample-flow
git add samples/frontend/src/steps/CreateKycLink.tsx
gt modify --commit -m "feat(samples): add Generate KYC Link step component

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Frontend step — Track KYC Status

**Files:**
- Create: `samples/frontend/src/steps/CheckKycStatus.tsx`

**Interfaces:**
- Consumes: `apiGet` from `src/lib/api.ts`; `ResponsePanel`; backend GET route from Task 1.
- Produces: `export default function CheckKycStatus({ customerId, disabled, onComplete }: Props)` with the same `Props` shape as Task 2. Calls `onComplete` exactly once, the first time a terminal `kycStatus` (`APPROVED` or `REJECTED`) is observed. Used by Task 4.

- [ ] **Step 1: Write the component**

Create `samples/frontend/src/steps/CheckKycStatus.tsx`:

```tsx
import { useState } from 'react'
import ResponsePanel from '../components/ResponsePanel'
import { apiGet } from '../lib/api'

const STATUS_STYLES: Record<string, string> = {
  APPROVED: 'bg-green-600/20 border-green-600/40 text-green-300',
  PENDING: 'bg-amber-600/20 border-amber-600/40 text-amber-300',
  REJECTED: 'bg-red-600/20 border-red-600/40 text-red-300',
  HOLD: 'bg-red-600/20 border-red-600/40 text-red-300',
  UNVERIFIED: 'bg-gray-600/20 border-gray-600/40 text-gray-300',
}

interface Props {
  customerId: string | null
  disabled: boolean
  onComplete: (response: Record<string, unknown>) => void
}

export default function CheckKycStatus({ customerId, disabled, onComplete }: Props) {
  const [status, setStatus] = useState<string | null>(null)
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiGet<Record<string, unknown>>(`/api/customers/${customerId}`)
      setResponse(JSON.stringify(data, null, 2))
      const kycStatus = data.kycStatus as string | undefined
      setStatus(kycStatus ?? null)
      if (!completed && (kycStatus === 'APPROVED' || kycStatus === 'REJECTED')) {
        setCompleted(true)
        onComplete(data)
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p className="text-sm text-gray-400 mb-2">
        Complete verification in the hosted flow (previous step), then refresh to poll the
        customer&apos;s <code className="text-gray-300">kycStatus</code>. Status changes also
        arrive live as <code className="text-gray-300">CUSTOMER.KYC_*</code> events in the
        webhook panel below.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={refresh}
          disabled={disabled || loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded text-sm font-medium"
        >
          {loading ? 'Refreshing...' : 'Refresh Status'}
        </button>
        {status && (
          <span
            className={`px-3 py-1 rounded border text-xs font-semibold tracking-wide ${
              STATUS_STYLES[status] ?? STATUS_STYLES.UNVERIFIED
            }`}
          >
            {status}
          </span>
        )}
      </div>
      <ResponsePanel response={response} error={error} />
    </div>
  )
}
```

- [ ] **Step 2: Verify it type-checks**

Run:
```bash
cd samples/frontend && npm run build
```
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
cd /Users/pengying/Src/grid-api/.worktrees/kyc-sample-flow
git add samples/frontend/src/steps/CheckKycStatus.tsx
gt modify --commit -m "feat(samples): add Track KYC Status step component

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Wire up the KYC Onboarding flow

**Files:**
- Create: `samples/frontend/src/flows/KycOnboardingFlow.tsx`
- Modify: `samples/frontend/src/components/Sidebar.tsx` (FlowKey union at line 1, FLOWS array)
- Modify: `samples/frontend/src/App.tsx` (imports, FLOW_META, render switch)

**Interfaces:**
- Consumes: `CreateCustomer` (existing), `CreateKycLink` (Task 2), `CheckKycStatus` (Task 3), `StepWizard` (existing: takes `steps: { title, summary, content }[]` and `activeStep`).
- Produces: sidebar flow key `'kyc-onboarding'`.

- [ ] **Step 1: Write the flow component**

Create `samples/frontend/src/flows/KycOnboardingFlow.tsx`. Note the deliberate `disabled` gating: steps 2 and 3 stay enabled once reached (`activeStep < n` rather than `!==`), so a user can regenerate an expired link or re-poll status at any time.

```tsx
import { useState } from 'react'
import StepWizard from '../components/StepWizard'
import CreateCustomer from '../steps/CreateCustomer'
import CreateKycLink from '../steps/CreateKycLink'
import CheckKycStatus from '../steps/CheckKycStatus'

export default function KycOnboardingFlow() {
  const [activeStep, setActiveStep] = useState(0)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [kycLinkGenerated, setKycLinkGenerated] = useState(false)
  const [finalStatus, setFinalStatus] = useState<string | null>(null)

  const steps = [
    {
      title: '1. Create Customer',
      summary: customerId ? `ID: ${customerId}` : null,
      content: (
        <CreateCustomer
          disabled={activeStep !== 0}
          onComplete={(data) => {
            setCustomerId(data.id as string)
            setActiveStep(1)
          }}
        />
      ),
    },
    {
      title: '2. Generate KYC Link',
      summary: kycLinkGenerated ? 'Link generated' : null,
      content: (
        <CreateKycLink
          customerId={customerId}
          disabled={activeStep < 1}
          onComplete={() => {
            setKycLinkGenerated(true)
            setActiveStep((s) => Math.max(s, 2))
          }}
        />
      ),
    },
    {
      title: '3. Track KYC Status',
      summary: finalStatus ? `Status: ${finalStatus}` : null,
      content: (
        <CheckKycStatus
          customerId={customerId}
          disabled={activeStep < 2}
          onComplete={(data) => {
            setFinalStatus(data.kycStatus as string)
          }}
        />
      ),
    },
  ]

  return <StepWizard steps={steps} activeStep={activeStep} />
}
```

- [ ] **Step 2: Register the flow in the sidebar**

In `samples/frontend/src/components/Sidebar.tsx`:

Change line 1 to:
```tsx
export type FlowKey = 'payout' | 'usdc-payout' | 'exchange-rates' | 'embedded-wallet' | 'kyc-onboarding'
```

Add to the `FLOWS` array, after the `payout` entry (payouts context — KYC precedes payouts logically):
```tsx
  {
    key: 'kyc-onboarding',
    label: 'KYC Onboarding',
    description: "Verify a customer's identity with a hosted KYC link",
  },
```

- [ ] **Step 3: Register the flow in App.tsx**

In `samples/frontend/src/App.tsx`:

Add the import after the `PayoutFlow` import:
```tsx
import KycOnboardingFlow from './flows/KycOnboardingFlow'
```

Add to `FLOW_META` (after the `payout` entry):
```tsx
  'kyc-onboarding': {
    title: 'KYC Onboarding',
    subtitle: "Verify a customer's identity with a hosted KYC link",
  },
```

Add to the render switch in `<main>` (after the `payout` line):
```tsx
          {activeFlow === 'kyc-onboarding' && <KycOnboardingFlow key="kyc-onboarding" />}
```

- [ ] **Step 4: Verify build**

Run:
```bash
cd samples/frontend && npm run build
```
Expected: build succeeds. (TypeScript's exhaustive `Record<FlowKey, ...>` on `FLOW_META` is the safety net — if the new key were missing there, `tsc` would fail.)

- [ ] **Step 5: Commit**

```bash
cd /Users/pengying/Src/grid-api/.worktrees/kyc-sample-flow
git add samples/frontend/src/flows/KycOnboardingFlow.tsx samples/frontend/src/components/Sidebar.tsx samples/frontend/src/App.tsx
gt modify --commit -m "feat(samples): add KYC Onboarding flow to sample frontend

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: README contract table + full verification

**Files:**
- Modify: `samples/README.md` (API contract table)

**Interfaces:**
- Consumes: routes from Task 1.
- Produces: documentation only.

- [ ] **Step 1: Update the API contract table**

In `samples/README.md`, add two rows to the "Adding a New Language Backend" table, after the `POST /api/customers` row:

```markdown
| GET  | `/api/customers/{id}` | Get a customer (incl. `kycStatus`) |
| POST | `/api/customers/{id}/kyc-link` | Generate a hosted KYC link |
```

- [ ] **Step 2: Full verification**

Run both builds from the worktree root:
```bash
cd samples/kotlin && ./gradlew build
cd ../frontend && npm run build
```
Expected: both succeed. `./gradlew build` runs the e2e tests — if sandbox credentials are unavailable, run `./gradlew build -x test` and flag it (see Global Constraints).

- [ ] **Step 3: Commit**

```bash
cd /Users/pengying/Src/grid-api/.worktrees/kyc-sample-flow
git add samples/README.md
gt modify --commit -m "docs(samples): document kyc-link and get-customer endpoints in API contract

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Manual acceptance check (after all tasks)

Not automatable — walk once by hand:

1. `cd samples/kotlin && ./gradlew run` (backend on :8080) and `cd samples/frontend && npm run dev` (frontend on :5173).
2. Select **KYC Onboarding** in the sidebar; create the default customer.
3. Generate the KYC link; click it — the hosted (sandbox SUMSUB) flow opens in a new tab.
4. Refresh status in step 3 — badge shows `PENDING`; complete or abandon the hosted flow and observe badge/webhook updates (`CUSTOMER.KYC_*` in the WebhookStream panel).
