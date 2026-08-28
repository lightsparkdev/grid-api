# quotecheck

Quote-math checks for a Striga-backed Grid platform. Creates quotes across an
amount sweep and both lock sides, fits the fee structure implied by the
responses, and checks it against grid's own arithmetic plus Striga's published
rates and unit granularity.

**Read-only by default.** Quotes are created but never executed, and every Striga
call is a read. Nothing moves funds or changes configuration unless you pass
`--execute`. Quotes expire on their own.

## Running it

```bash
cd .claude/skills/grid-test/scripts/quotecheck
python3 run.py --creds ~/.grid-credentials-dev-striga
python3 run.py --corridor USDC:EUR --json /tmp/qc.json

# MOVES REAL FUNDS: settles one quote per corridor and checks the ledgers
python3 run.py --corridor USDC:EUR --execute
```

Exit code is non-zero if any check fails. Warnings don't fail the run.

Credentials come from the usual `~/.grid-credentials*` file. The Grid keys
(`apiTokenId`, `apiClientSecret`, `baseUrl`) are required; the Striga block is
optional and skips the Striga-side checks when absent:

```json
"strigaApiKey": "...",
"strigaApiSecret": "...",
"strigaApplicationId": "...",
"strigaEnvironment": "SANDBOX"
```

The customer is discovered automatically as the first one holding internal
accounts in both corridor currencies. Override with `--customer-id`.

## What each check means

| Check | What it proves |
|---|---|
| locked side returned exactly | The side you locked comes back unmodified. |
| fee structure is consistent | Fees fit a single `(fixed, variable)` structure across the sweep, residual under one minor unit. Catches a fee that drifts with amount. |
| exchangeRate matches amounts and fees | `exchangeRate` equals `(totalSendingAmount - feesIncluded) / totalReceivingAmount` in major units, the identity the OpenAPI description implies. |
| both lock sides imply the same rate | Sending-locked and receiving-locked quotes price the same corridor identically, within a rounding bound computed from the smallest source amount rather than assumed. |
| platformFeesIncluded is within feesIncluded | The platform's share never exceeds the total. |
| quoted fee is expressible in Striga's minor unit | The fee is a whole number of Striga minor units. Striga counts USDC in cents while grid counts micro-USDC, and `_to_striga_minor_amount` raises rather than truncating, so a fee that fails this can never be passed through as a Striga override. |
| implied spread over Striga's published rate | Grid's net rate against `trade/rates`, with the published rate's own precision reported as the noise floor. Striga quotes to two decimals in sandbox, which is around 60 bps, so this check bounds rather than measures. |
| /exchange-rates agrees with /quotes | The advertised rate matches what a quote actually charges. |
| striga: application fee ceiling allows collecting a fee | Overrides are capped at the application's configured fee per component, so an all-zero schedule means nothing is collectable. |

### Settlement checks (`--execute` only)

These put one quote all the way through and compare three ledgers: the customer's
Grid internal accounts, the platform's Grid internal accounts, and Striga's
corporate accounts.

| Check | What it proves |
|---|---|
| quote executes and reaches a terminal status | The quote settles COMPLETED rather than stalling or failing. SCA challenges are satisfied automatically with the sandbox OTP (`123456`), looping until the quote clears since one send can carry several challenges in sequence. |
| source debited by totalSendingAmount | The customer paid exactly what the quote said. |
| destination credited by totalReceivingAmount | The customer received exactly what the quote said. |
| no other customer balance moved | Nothing settled against an unrelated currency. |
| platform credited by platformFeesIncluded | The platform's Grid balance moved by the fee the quote priced. **This is the AT-6441 detector** — a fee Striga collects but Grid never mirrors fails here. |
| Striga corporate movement matches Grid's platform credit | The provider ledger and the Grid ledger agree on how much fee was taken, converting through `STRIGA_PROVIDER_UNIT_MULTIPLIER`. |
| fees reconcile against the amounts | `platformFeesIncluded` sits within `feesIncluded`. |

## Known findings as of 2026-08-27

Running this against the dev Striga platform reproduces five things worth
knowing before reading a failure as a regression:

1. **Fees aren't expressible in Striga's minor unit.** Every quoted USDC fee
   fails, because grid quotes fees at micro-USDC precision and Striga can only
   act on whole cents. One Striga cent is 50 bps on a 2 USDC send. This is the
   central constraint behind recommending ITEMIZED over ALL_IN for Striga fees
   (webdev PR 32659).
2. **`/exchange-rates` advertises zero fees while `/quotes` charges about 1%.**
   Under ITEMIZED the rates endpoint doesn't account for the Striga switch
   spread, so it quotes a better rate than the quote delivers.
3. **The two lock sides disagree on USDC→EUR by about 0.25 bps**, which is far
   more than source rounding accounts for. EUR→USDC agrees within its bound. Not
   yet explained.
4. **An executed USDC→EUR internal conversion never settles.** Run on
   2026-08-27: `Transaction:01a0448b-a607-b78f-0000-373d5259357f`, sending
   1,300,000 µUSDC for 109 EUR cents, went to `PROCESSING` at 18:46:38 and had
   not moved 15 minutes later. No customer balance changed, no platform balance
   changed, and dev sparkcore logged no error and no Striga swap or webhook
   activity in the window. A send that neither completes nor fails, with no
   ledger movement, is parked rather than slow — most likely a Striga leg that
   was never initiated or a webhook that never arrived. Not yet filed.
5. **Nothing is collectable yet regardless.** Every fee in the dev Striga
   application's schedule is 0 and overrides are capped per component, so
   `platformFeesIncluded` is 0 on every quote and the settlement fee checks pass
   trivially. Raise the ceiling via `PATCH /corporate/fees` before treating a
   passing platform-credit check as meaningful.

Separately: setting `fee_model = ALL_IN` on a Striga platform currency makes
every `POST /quotes` return 500, because the Striga switch raises
`NotImplementedError` on the quote adjustment ALL_IN produces. Corridor fee
contracts are inert under ITEMIZED, so they don't show up in these numbers.

## Layout

- `grid.py` — Grid REST client, quote creation and account lookup
- `striga.py` — signed Striga client, read-only, plus rate and unit helpers
- `quotemath.py` — grid's MARKDOWN quote arithmetic and the fee-structure fit
- `settlement.py` — balance snapshots, quote execution, transaction polling (`--execute` only)
- `run.py` — sweeps, checks, report
