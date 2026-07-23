# Grid docs: crypto refund destination + real-time fee assessment

## Context
From a Slack thread debugging the Dolafy USDC→USD sub-cent underfunding: two doc
gaps surfaced. (1) When a real-time (JIT) funded quote is funded with **crypto**,
a refund credits the customer's internal crypto account balance — it is *not*
returned to the source wallet (Grid can't assume the sending wallet belongs to the
customer). (2) There is no doc explaining how the variable fee is assessed for
sender-locked vs. receiver-locked quotes, which is what produced the "extra"
0.00005 USDC (`send = received / (1 − fee)`).

## Approach
Two small, additive MDX edits in the existing concept pages — no new pages, no
nav changes.

1. **Refund destination** → add a subsection to
   `platform-overview/core-concepts/transaction-lifecycle.mdx`, right after the
   existing `## Refund Object` section. Explains that the refund *destination*
   depends on how the quote was funded, and calls out crypto real-time funding
   explicitly (credits internal balance; reusable via `/transfer-out` or a new
   quote).

2. **Fee assessment** → add a `### How the variable fee is applied` subsection to
   the existing `## Fees` section in
   `platform-overview/core-concepts/quote-system.mdx`, tying into the adjacent
   "Locked Currency Side" content. Documents both formulas with the $50 @ 10 bps
   worked example the user provided.

Alternative considered: a standalone "Fees" page. Rejected — the Quote System
page already owns fee docs and the locked-side context lives there, so keeping it
inline avoids duplication (per the repo's content-strategy guidance).

## Changes

### 1. platform-overview/core-concepts/transaction-lifecycle.mdx
- **What**: New `### Refund destination` subsection appended to the `## Refund
  Object` section (after the JSON example, ~line 182).
- **Why**: Document the crypto-funded refund behavior confirmed in the thread.
- **Code sketch**:
  ```mdx
  ### Refund destination

  Where a refund lands depends on how the transaction was funded:

  - **Prefunded / internal account** — the amount is credited back to the source
    internal account balance.
  - **Real-time (JIT) funding via an instant fiat rail** (RTP, PIX, SEPA Instant,
    etc.) — the refund is returned to the originating funding instrument.
  - **Real-time (JIT) funding via crypto** (USDC, BTC) — the refunded amount is
    credited to the customer's **internal crypto account balance for that asset**.
    It is **not** returned to the wallet the funds came from.

  <Note>
    Crypto deposits are not refunded to the source wallet because Grid cannot
    verify that the sending wallet belongs to your customer — the funds may have
    originated from an exchange or a third-party address. The credited internal
    balance can be reused: spend it with a new quote, or withdraw it with
    [`/transfer-out`](/platform-overview/core-concepts/transaction-lifecycle#transfer-out-internal-external).
  </Note>
  ```

### 2. platform-overview/core-concepts/quote-system.mdx
- **What**: New `### How the variable fee is applied` subsection inside `## Fees`,
  after the rate-details `<Note>` (~line 351).
- **Why**: No existing doc explains sender- vs receiver-locked fee math; this is
  the source of the "fee looks like it's charged on the fee" confusion.
- **Code sketch**:
  ```mdx
  ### How the variable fee is applied

  The variable fee (`gridApiVariableFeeRate`) is always assessed as a fraction of
  the **sending** amount. How that plays out depends on which side of the quote
  you lock (see [Locked Currency Side](#locked-currency-side)).

  **Sending amount locked** (`lockedCurrencySide: "SENDING"`) — the fee is taken
  out of the amount you send, and the recipient gets the remainder:

  ```text
  received = send − send × fee
  ```

  Send $50 at a 10 bps (0.10%, `fee = 0.001`) rate:
  `received = 50 − 50 × 0.001 = 49.95`.

  **Receiving amount locked** (`lockedCurrencySide: "RECEIVING"`) — Grid solves for
  the send amount that nets the exact received amount *after* the same fee:

  ```text
  send = received / (1 − fee)
  ```

  Receive $50 at 10 bps: `send = 50 / 0.999 = 50.05005005…`.

  <Note>
    Receiver-locked quotes divide by `(1 − fee)` rather than adding `received × fee`
    so that locking the receiving side is never cheaper than locking the sending
    side for the same rate. Solving `send × (1 − fee) = received` for `send` keeps
    the effective fee rate identical across both locked sides.
  </Note>

  For cross-currency quotes the exchange rate is applied on top of this: the fee is
  taken on the sending currency, then the net amount is converted at the quoted
  rate. Same-currency examples (e.g. USDC → USD at 1:1) show the fee in isolation.
  ```

## Verification
- [ ] `cd /repos/grid-api && make lint-markdown` passes (or the mint openapi/lint
      subset relevant to MDX)
- [ ] `cd mintlify && mint dev` renders both pages without MDX/acorn errors
      (Note components and code fences parse)
- [ ] Anchor links resolve (`#transfer-out-internal-external`, `#locked-currency-side`)
- [ ] Numbers re-derived: 10 bps = 0.001; 50 − 50×0.001 = 49.95; 50/0.999 = 50.05005005…

## Risks
- Fee wording is nuanced — the thread showed the team debating whether the
  receiver-locked formula "charges a fee on the fee." The doc states the actual
  behavior (`send = received / (1 − fee)`) and the rationale, but the reviewer
  should confirm the framing matches how they want to explain it to partners.
- Anchor slug for transfer-out heading (`### Transfer-Out (Internal → External)`)
  — verify Mintlify's generated slug matches the link before merge.
