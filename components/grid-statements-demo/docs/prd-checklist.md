# Periodic statement checklist

- [x] The consumer statement lists all balance-moving activity and reconciles opening balance, closing balance, and fees.
- [x] Each transaction shows its date, type, counterparty, and amount.
- [x] The card purchase shows `Blue Bottle Coffee · Los Angeles, CA` on one line.
- [x] The API sample carries `merchant.city`, `merchant.state`, and `merchant.country`.
- [x] Covered EFT amounts have inline superscript markers. The key and legal heading use the same marker.
- [x] The complete error-resolution notice uses sentence case and the Secondary text token.
- [x] The notice has an intro, a three-item hanging-indent list, a closing paragraph, the 60-day line, and the Lead Bank/program manager line.
- [x] Secondary text passes the existing 4.5:1 contrast gate against the primary background.
- [x] The commercial statement has no Reg E marker, terminal location, or error-resolution notice.
- [x] PDF and offline HTML exports stay on one page and contain no browser header or footer.

## Open items (not for public docs)

The following items are planned or open. None of them exist in the API today.

- A statement endpoint. There is no API to list, fetch, or download a rendered statement.
- A webhook when a statement is issued.
- Opening and closing balance snapshots at period boundaries. `balance` on the internal account is the current balance only.
- Delivery confirmation for a statement. The product requirements plan to reuse the receipt confirmation endpoint. It accepts a transaction ID, not a statement, so it cannot confirm a statement today.
- The availability window after cycle close, in business days.
- Legal review of two items: whether the prepaid-account disclosures in 12 CFR 1005.18 apply, including fee totals for the prior month and year to date, and whether commercial statements need any error-reporting language.
- The periodic statements guide is held. The unpublished draft and its hold reasons are in [statements-guide-draft.md](./statements-guide-draft.md).
