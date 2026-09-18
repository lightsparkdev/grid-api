# Document how to find approximate sending limits before quoting

## Context

The Sending Payments docs go straight from "pick a destination" to `POST /quotes`. Nothing
tells an integrator how to discover the min/max a corridor accepts, so the first signal that
an amount is out of range is a `400 AMOUNT_OUT_OF_RANGE` / `TRANSACTION_SIZE_LIMIT_EXCEEDED`
on the quote. Both bounds are already exposed pre-quote — by `GET /exchange-rates` and by the
two receiver lookup endpoints — but neither is mentioned on any sending page.

## Approach

Add one shared snippet, `mintlify/snippets/sending/limits.mdx`, covering both discovery
paths, and import it from the two "Sending Payments" pages (Global P2P and Payouts & B2B).
A snippet rather than duplicated prose is what `mintlify/CLAUDE.md` and the existing
`snippets/sending/` layout call for — `sending-payments.mdx` is already nothing but snippet
imports.

The snippet frames the two endpoints by what the caller knows at the time:

- **No recipient yet / corridor shopping** → `GET /exchange-rates`, which returns
  `minSendingAmount` / `maxSendingAmount` per corridor in the source currency's minor units.
- **A specific recipient** → `GET /receiver/uma/{addr}` or
  `GET /receiver/external-account/{accountId}`, whose `supportedCurrencies[]` entries carry
  receiver-denominated `min`/`max` plus the optional sender-denominated
  `minSendingAmount`/`maxSendingAmount`, and whose `lookupId` feeds the quote.

Two accuracy points the schemas force and the prose must carry:

1. These are **estimates**. `CurrencyPreference.estimatedExchangeRate` says so explicitly, and
   the sender-denominated bounds repeat the "subject to change when calling the quotes
   endpoint" caveat. Only `POST /quotes` locks anything. The page must not read as a
   guarantee — hence "approximate limits".
2. `minSendingAmount`/`maxSendingAmount` on `CurrencyPreference` are **optional** ("Omitted
   when the sending-side bound cannot be resolved"), so the snippet must show the fallback:
   convert `min`/`max` through `estimatedExchangeRate` and treat the result as looser.

Also worth stating: per-transaction bounds are not the only limit. Passing the corridor
bound can still hit `DAILY_VOLUME_LIMIT_EXCEEDED` (429) at quote time — one line pointing at
the existing error-handling page, not a re-explanation.

Alternative considered and rejected: a new standalone "Limits" page under Core concepts.
That splits the answer away from the flow that needs it, and there isn't enough material for
a page — the endpoints are already in the API reference.

## Relevant Knowledge

- grid-api internal links are root-relative (94 occurrences vs 2 using `../`) — use
  `/global-p2p/...`, not relative paths.
- Existing pages escape `$` in UMA addresses as `\$` inside code blocks.
- Docs-only change: no OpenAPI edits, so no `make build` rebundle is required. `make lint`
  still applies.
- Open PR #874 (`app/claude`, Aug 28) already syncs `snippets/sending/uma.mdx` to the #868
  schema — it adds `sendingCurrency` and the sender-denominated bounds to that one response
  example. This plan does **not** touch `uma.mdx`, so the two do not conflict; the new
  snippet carries its own example.

## Changes

### 1. mintlify/snippets/sending/limits.mdx (new)

- **What**: New shared snippet, `## Checking limits before you quote`, with two subsections.
- **Why**: Both sending pages need the same content; `snippets/sending/` is where the other
  sending sections already live.
- **Code sketch**:

  ```mdx
  ## Checking limits before you quote

  Every corridor has a minimum and a maximum it will accept. You can read both before
  you create a quote, so an out-of-range amount surfaces in your UI rather than as a
  `400 AMOUNT_OUT_OF_RANGE` on `POST /quotes`.

  Which endpoint you use depends on what you know:

  | You know | Use | Bounds you get |
  | --- | --- | --- |
  | A currency corridor | `GET /exchange-rates` | `minSendingAmount` / `maxSendingAmount`, in the source currency |
  | A specific recipient | `GET /receiver/uma/{address}` or `GET /receiver/external-account/{accountId}` | Per-currency `min` / `max`, plus sending-side bounds when Grid can resolve them |

  <Warning>
    These bounds are estimates, priced off a cached rate that refreshes about every five
    minutes. Only `POST /quotes` locks a rate and a final amount — treat what you read here
    as a pre-flight check, not a guarantee.
  </Warning>

  ### Across a corridor

  ```bash
  curl -X GET 'https://api.lightspark.com/grid/2025-10-13/exchange-rates?sourceCurrency=USD&destinationCurrency=INR' \
    -u "$GRID_CLIENT_ID:$GRID_CLIENT_SECRET"
  ```

  ```json Success (200 OK)
  {
    "data": [
      {
        "sourceCurrency": { "code": "USD", "name": "US Dollar", "symbol": "$", "decimals": 2 },
        "sendingAmount": 10000,
        "minSendingAmount": 100,
        "maxSendingAmount": 10000000,
        "destinationCurrency": { "code": "INR", "name": "Indian Rupee", "symbol": "₹", "decimals": 2 },
        "destinationPaymentRail": "UPI",
        "receivingAmount": 825000,
        "exchangeRate": 0.012121,
        "fees": { "fixed": 100, "total": 150 },
        "updatedAt": "2025-02-05T12:00:00Z"
      }
    ]
  }
  ```

  `minSendingAmount` and `maxSendingAmount` are in the smallest unit of `sourceCurrency` —
  here, $1.00 to $100,000.00. Omit `destinationCurrency` to get every corridor available
  from a source currency, each with its own bounds, which is what you want when you're
  populating a currency picker.

  <Tip>
    Pass `sendingAmount` to price a specific amount. `fees.total` varies with the amount
    sent, so the default (`10000`) is only representative.
  </Tip>

  ### For a specific recipient

  [lookup curl + response — see below]

  <Info>
    `minSendingAmount` and `maxSendingAmount` are omitted when Grid can't resolve a
    sending-side bound for that currency. Fall back to converting `min` and `max` with
    `estimatedExchangeRate`, and treat the result as approximate — the true sending bound
    can be tighter than the converted receiving bound.
  </Info>

  Reuse the `lookupId` on the quote…

  <Note>
    Clearing the per-transaction bounds doesn't guarantee the quote succeeds. Cumulative
    limits are enforced at quote time and surface as `DAILY_VOLUME_LIMIT_EXCEEDED` (429).
    See [Error handling](/global-p2p/sending-receiving-payments/error-handling).
  </Note>
  ```

  The recipient example uses `GET /receiver/external-account/{accountId}?customerId=…&sendingCurrency=USD`
  with a response shaped to `ReceiverExternalAccountLookupResponse`: `sendingCurrency`,
  `accountId`, `lookupId`, and a `supportedCurrencies` array showing one entry with the
  sender-denominated pair present and one with it absent, so the fallback paragraph has
  something concrete to point at. Both lookup endpoints share `ReceiverLookupResponse`, so
  one example plus a sentence naming the UMA variant covers both.

### 2. mintlify/global-p2p/sending-receiving-payments/sending-payments.mdx

- **What**: Import the new snippet and render it after the "Choosing the right method"
  list, before `<SendToAccount />`.
- **Why**: Limits are a pre-flight step — they belong before the per-destination flows, not
  appended after the UMA section.
- **Code sketch**:

  ```mdx
  import CheckingLimits from '/snippets/sending/limits.mdx'

  <CheckingLimits />

  import SendToAccount from '/snippets/sending/accounts.mdx'
  ```

### 3. mintlify/payouts-and-b2b/payment-flow/send-payment.mdx

- **What**: Import the same snippet and render it after the "Prerequisites" section, before
  `## Send a payment`.
- **Why**: Same content, same pre-flight position. This page doesn't currently import from
  `snippets/sending/`, but it has the identical gap, and duplicating the prose is what
  `mintlify/CLAUDE.md` tells us not to do.

## Verification

- [ ] `make lint` passes (redocly + markdown; no OpenAPI change so no rebundle)
- [ ] Every field in both JSON examples exists in the schema with matching types:
      `ExchangeRate.yaml`, `ExchangeRateFees.yaml`, `ReceiverLookupResponse.yaml`,
      `ReceiverExternalAccountLookupResponse.yaml`, `CurrencyPreference.yaml`
- [ ] Arithmetic in the prose matches the example numbers (100 minor units = $1.00,
      10000000 = $100,000.00; the converted fallback figures are consistent with the
      stated `estimatedExchangeRate`)
- [ ] `mint dev` renders both pages, snippet included, with no MDX parse error
      (mintlify pinned to 4.2.284, node 20/22)
- [ ] Internal links are root-relative and resolve to real pages
- [ ] `bolt-screenshot` on both rendered pages, attached to the PR

## Risks

- The sandbox isn't exercised here, so the example responses are schema-derived rather than
  captured from a live call. Every field is checked against the schema, but the specific
  numbers are illustrative — same convention as the surrounding pages.
- `DAILY_VOLUME_LIMIT_EXCEEDED` and `TRANSACTION_SIZE_LIMIT_EXCEEDED` are documented in
  `snippets/error-handling.mdx`; the new snippet links there rather than restating them, so
  the two stay consistent.
