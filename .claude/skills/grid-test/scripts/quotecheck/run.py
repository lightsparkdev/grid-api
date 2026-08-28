#!/usr/bin/env python3
"""Quote-math checks for a Striga-backed Grid platform.

Creates quotes across an amount sweep and both lock sides, fits the fee
structure implied by the responses, and checks it against grid's own arithmetic
and against Striga's published rates and unit granularity.

Read-only by default: quotes are created and left to expire, and every Striga
call is a read. `--execute` settles one quote per corridor and MOVES REAL FUNDS.

    python3 run.py --creds ~/.grid-credentials-dev-striga
    python3 run.py --corridor USDC:EUR --json report.json
    python3 run.py --corridor USDC:EUR --execute      # moves funds
"""

from __future__ import annotations

import argparse
import json
import sys
from decimal import Decimal
from pathlib import Path

from grid import GridClient
from quotemath import (
    MINOR_EXPONENT,
    fit_fee_structure,
    reported_exchange_rate,
    striga_representable,
)
from settlement import execute_quote, poll_transaction, satisfy_sca, take_snapshot
from striga import (
    PROVIDER_UNIT_MULTIPLIER,
    StrigaClient,
    published_rate_noise_bps,
    striga_minor_rate,
)

# Sweeps are chosen to sit above each corridor's minimum while staying small.
# Quotes cost nothing, but the minimum moves with the FX rate, so the low end
# has some headroom.
SWEEPS = {
    ("USDC", "EUR"): {
        "SENDING": [1_300_000, 1_500_000, 2_000_000, 3_000_000, 5_000_000, 8_000_000],
        "RECEIVING": [110, 150, 200, 300, 500, 800],
    },
    ("EUR", "USDC"): {
        "SENDING": [1_000, 1_500, 2_000, 3_000, 5_000, 10_000],
        "RECEIVING": [1_000_000, 2_000_000, 3_000_000, 5_000_000, 10_000_000],
    },
}


class Check:
    def __init__(self, name: str):
        self.name = name
        self.status = "PASS"
        self.details: list[str] = []

    def fail(self, detail: str) -> None:
        self.status = "FAIL"
        self.details.append(detail)

    def warn(self, detail: str) -> None:
        if self.status == "PASS":
            self.status = "WARN"
        self.details.append(detail)

    def note(self, detail: str) -> None:
        self.details.append(detail)


def load_credentials(path: Path) -> dict:
    return json.loads(path.read_text())


def discover_accounts(grid: GridClient, customer_id: str | None):
    """Find a customer holding both corridor currencies as internal accounts."""
    status, payload = grid._request("GET", "/customers?limit=50")
    if status != 200:
        raise SystemExit(f"Could not list customers: {payload}")
    candidates = (
        [{"id": customer_id}] if customer_id else payload.get("data", [])
    )
    for customer in candidates:
        accounts = grid.internal_accounts(customer["id"])
        by_currency = {
            a["balance"]["currency"]["code"]: a["id"]
            for a in accounts
            if a.get("balance", {}).get("currency", {}).get("code")
        }
        if "USDC" in by_currency and "EUR" in by_currency:
            return customer["id"], by_currency
    raise SystemExit(
        "No customer found with both USDC and EUR internal accounts. "
        "Pass --customer-id explicitly."
    )


def collect(grid: GridClient, accounts: dict, corridor, lock_side, amounts):
    source, destination = corridor
    rows = []
    for amount in amounts:
        quote, error = grid.create_quote(
            accounts[source], accounts[destination], lock_side, amount
        )
        if quote is None:
            rows.append({"requested": amount, "error": error})
            continue
        rows.append(
            {
                "requested": amount,
                "sending": quote["totalSendingAmount"],
                "receiving": quote["totalReceivingAmount"],
                "fees": quote["feesIncluded"],
                "platformFees": quote.get("platformFeesIncluded"),
                "exchangeRate": quote.get("exchangeRate"),
                "rateDetails": quote.get("rateDetails"),
            }
        )
    return rows


def check_locked_side(corridor, lock_side, rows) -> Check:
    check = Check(f"{corridor[0]}->{corridor[1]} {lock_side}: locked side returned exactly")
    key = "sending" if lock_side == "SENDING" else "receiving"
    for row in rows:
        if "error" in row:
            continue
        if row[key] != row["requested"]:
            check.fail(
                f"requested {lock_side.lower()}={row['requested']} but quote "
                f"returned {row[key]}"
            )
    return check


def check_fee_fit(corridor, lock_side, rows) -> tuple[Check, object]:
    source, destination = corridor
    check = Check(f"{source}->{destination} {lock_side}: fee structure is consistent")
    observations = [
        (row["sending"], row["fees"]) for row in rows if "error" not in row
    ]
    fit = fit_fee_structure(observations)
    if fit is None:
        check.fail("not enough successful quotes to fit a fee structure")
        return check, None
    check.note(
        f"implied fixed={fit.fixed:.4f} {source} minor units, "
        f"variable={fit.variable * 10000:.4f} bps, "
        f"max residual={fit.max_residual:.4f} over {fit.points} points"
    )
    if fit.max_residual >= 1:
        check.fail(
            f"fee is not a consistent (fixed, variable) structure across the "
            f"sweep: residual {fit.max_residual:.4f} minor units exceeds 1"
        )
    return check, fit


def check_lock_side_agreement(corridor, fits, receiving_rows) -> Check:
    source, _destination = corridor
    check = Check(f"{source}->{corridor[1]}: both lock sides imply the same rate")
    sending_fit, receiving_fit = fits.get("SENDING"), fits.get("RECEIVING")
    if not sending_fit or not receiving_fit:
        check.warn("one lock side produced no fit; skipped")
        return check
    delta_bps = abs(sending_fit.variable - receiving_fit.variable) * 10000
    check.note(
        f"SENDING {sending_fit.variable * 10000:.4f} bps vs "
        f"RECEIVING {receiving_fit.variable * 10000:.4f} bps, "
        f"delta {delta_bps:.4f} bps"
    )
    # A receiving-locked quote solves for the source and rounds it to the source
    # currency's minor unit, so the fitted rate carries an error bar set by the
    # smallest source amount in the sweep. Anything past that bound is a real
    # difference in how the two directions price, not rounding.
    sources = [r["sending"] for r in receiving_rows if "error" not in r]
    if not sources:
        check.warn("no receiving-locked quotes to bound the rounding error")
        return check
    bound_bps = Decimal("0.5") / Decimal(min(sources)) * 10000
    check.note(
        f"source rounding on the smallest receiving-locked quote "
        f"(send={min(sources)} {source} minor) explains up to {bound_bps:.4f} bps"
    )
    if delta_bps > bound_bps:
        check.warn(
            f"delta of {delta_bps:.4f} bps exceeds the {bound_bps:.4f} bps that "
            f"source rounding accounts for, so the two lock sides are not "
            f"applying the same rate to the same base"
        )
    return check


def check_exchange_rate_identity(corridor, lock_side, rows) -> Check:
    source, destination = corridor
    check = Check(
        f"{source}->{destination} {lock_side}: exchangeRate matches amounts and fees"
    )
    for row in rows:
        if "error" in row or row.get("exchangeRate") is None:
            continue
        computed = reported_exchange_rate(
            row["sending"], row["receiving"], row["fees"], source, destination
        )
        if computed is None:
            continue
        reported = Decimal(str(row["exchangeRate"]))
        if reported == 0:
            continue
        relative = abs(computed - reported) / reported
        if relative > Decimal("1e-9"):
            check.fail(
                f"send={row['sending']} recv={row['receiving']} fees={row['fees']}: "
                f"reported {reported} but (send-fees)/recv is {computed}"
            )
    return check


def check_platform_fees(corridor, rows) -> Check:
    source, destination = corridor
    check = Check(f"{source}->{destination}: platformFeesIncluded is within feesIncluded")
    for row in rows:
        if "error" in row:
            continue
        platform = row.get("platformFees")
        if platform is None:
            check.warn("platformFeesIncluded absent from the response")
            continue
        if platform > row["fees"]:
            check.fail(
                f"platformFeesIncluded={platform} exceeds feesIncluded={row['fees']}"
            )
    return check


def check_striga_representable(corridor, rows) -> Check:
    source, destination = corridor
    multiplier = PROVIDER_UNIT_MULTIPLIER.get(source, 1)
    check = Check(
        f"{source}->{destination}: quoted fee is expressible in Striga's minor unit"
    )
    if multiplier <= 1:
        check.note(f"{source} shares a minor unit with Striga; nothing to check")
        return check
    unrepresentable = []
    for row in rows:
        if "error" in row:
            continue
        if not striga_representable(row["fees"], source, multiplier):
            unrepresentable.append((row["sending"], row["fees"]))
    check.note(
        f"Striga counts {source} in units of {multiplier} grid minor units "
        f"(_to_striga_minor_amount raises on a remainder)"
    )
    if unrepresentable:
        sample = ", ".join(
            f"fee={fee} on send={send} ({Decimal(fee) / multiplier:.4f} Striga units)"
            for send, fee in unrepresentable[:3]
        )
        check.fail(
            f"{len(unrepresentable)}/{len([r for r in rows if 'error' not in r])} "
            f"quoted fees cannot be passed to Striga as an override: {sample}"
        )
    return check


def check_striga_spread(corridor, rows, rates) -> Check:
    source, destination = corridor
    check = Check(f"{source}->{destination}: implied spread over Striga's published rate")
    published = striga_minor_rate(rates, source, destination)
    if published is None:
        check.warn("no published Striga rate for this pair; skipped")
        return check
    spreads = []
    for row in rows:
        if "error" in row or row["receiving"] == 0:
            continue
        gross = Decimal(row["sending"]) - row["fees"]
        if gross <= 0:
            continue
        effective = Decimal(row["receiving"]) / gross
        spreads.append((published - effective) / published)
    if not spreads:
        check.warn("no usable quotes")
        return check
    low, high = min(spreads) * 10000, max(spreads) * 10000
    check.note(
        f"Striga published {published:.10f} {destination}/{source} minor; "
        f"grid's net rate implies a spread of {low:.2f} to {high:.2f} bps"
    )
    # Striga publishes each pair to a fixed number of decimals (2 in sandbox),
    # so the published rate carries its own error bar. Half a tick on the major
    # rate is the floor below which a spread measurement means nothing.
    noise_bps = published_rate_noise_bps(rates, source, destination)
    if noise_bps is not None:
        check.note(
            f"published rate is quoted to {noise_bps:.0f} bps of precision, "
            f"which is the noise floor for this comparison"
        )
        if high - low > noise_bps:
            check.warn(
                f"spread varies by {high - low:.2f} bps across the sweep, wider "
                f"than the {noise_bps:.0f} bps the published rate's precision explains"
            )
    elif high - low > 25:
        check.warn(f"spread varies by {high - low:.2f} bps across the sweep")
    return check


def check_rates_vs_quotes(grid, corridor, rows) -> Check:
    source, destination = corridor
    check = Check(f"{source}->{destination}: /exchange-rates agrees with /quotes")
    sample = next((r for r in rows if "error" not in r), None)
    if sample is None:
        check.warn("no successful quote to compare against")
        return check
    row, raw = grid.exchange_rate(source, destination, sample["sending"])
    if row is None:
        check.warn(f"/exchange-rates could not price this corridor: {raw}")
        return check
    rate_fees = row.get("fees", {}).get("total")
    check.note(
        f"send={sample['sending']}: /quotes fees={sample['fees']} recv={sample['receiving']}, "
        f"/exchange-rates fees={rate_fees} recv={row.get('receivingAmount')}"
    )
    if rate_fees != sample["fees"]:
        check.fail(
            f"fee disagreement: /quotes charges {sample['fees']} but "
            f"/exchange-rates advertises {rate_fees}"
        )
    return check


def check_striga_fee_ceiling(striga) -> Check:
    """Striga caps a per-transaction fee override at the application's configured
    fee, per component. A zero ceiling means no fee is collectable at all, which
    is a prerequisite for the AT-5915 Phase 1 work rather than a code problem.
    """
    check = Check("striga: application fee ceiling allows collecting a fee")
    try:
        config = striga.fee_config()
    except Exception as exc:  # noqa: BLE001 - surfaced, not swallowed
        check.warn(f"could not read corporate/config/fees: {exc}")
        return check
    non_zero = []

    def walk(node, path=""):
        if isinstance(node, dict):
            for key, value in node.items():
                walk(value, f"{path}.{key}" if path else key)
        elif isinstance(node, (int, float)) and node:
            non_zero.append(f"{path}={node}")

    walk(config)
    if non_zero:
        check.note(f"non-zero ceiling entries: {', '.join(non_zero[:6])}")
    else:
        check.warn(
            "every fee in the application's schedule is 0, so any non-zero "
            "override would be rejected; the ceiling has to be raised via "
            "PATCH /corporate/fees before fees can be collected"
        )
    return check


def run_settlement(
    grid, striga, customer_id, accounts, corridor, amount, settle_timeout=300
) -> list[Check]:
    """Put one quote all the way through and assert the ledgers agree.

    MOVES REAL FUNDS. Only reached under --execute.
    """
    source, destination = corridor
    label = f"{source}->{destination} settlement"
    checks: list[Check] = []

    setup = Check(f"{label}: quote executes and reaches a terminal status")
    before = take_snapshot(grid, striga, customer_id)

    available = before.customer.get(source, 0)
    if available < amount:
        setup.fail(
            f"source account holds {available} {source} minor units, needs {amount}; "
            f"fund it before running --execute"
        )
        return [setup]

    quote, error = grid.create_quote(
        accounts[source], accounts[destination], "SENDING", amount
    )
    if quote is None:
        setup.fail(f"quote failed: {error}")
        return [setup]

    executed, exec_error = execute_quote(grid, quote["id"])
    if executed is None:
        setup.fail(f"execute failed: {exec_error}")
        return [setup]
    if executed.get("status") == "PENDING_AUTHORIZATION":
        # Striga sandbox accepts a fixed OTP, and one send can carry several
        # challenges in sequence, so this loops until the quote clears.
        authorized, sca_error, rounds = satisfy_sca(grid, quote["id"])
        if authorized is None:
            setup.fail(f"SCA authorization failed: {sca_error}")
            return [setup]
        setup.note(
            f"satisfied {rounds} SCA challenge(s) with the sandbox OTP; "
            f"quote is now {authorized.get('status')}"
        )

    transaction, timed_out = poll_transaction(
        grid, quote["transactionId"], timeout_s=settle_timeout
    )
    final_status = (transaction or {}).get("status")
    if timed_out:
        after = take_snapshot(grid, striga, customer_id)
        moved = {
            code: amount
            for code, amount in before.delta(after).customer.items()
            if amount != 0
        }
        setup.fail(
            f"{quote['transactionId']} sat at {final_status} for {settle_timeout}s "
            f"without settling. Customer balances moved: {moved or 'nothing'}. "
            f"A send that neither completes nor fails, with no ledger movement, is "
            f"parked rather than slow - check for a Striga swap or webhook that "
            f"never arrived."
        )
        return [setup]
    if final_status != "COMPLETED":
        setup.fail(f"transaction reached {final_status}, not COMPLETED")
        return [setup]
    setup.note(f"quote {quote['id']} settled COMPLETED")
    checks.append(setup)

    after = take_snapshot(grid, striga, customer_id)
    delta = before.delta(after)
    sending, receiving = quote["totalSendingAmount"], quote["totalReceivingAmount"]
    fees, platform_fees = quote["feesIncluded"], quote.get("platformFeesIncluded") or 0

    debit = Check(f"{label}: source debited by totalSendingAmount")
    observed = -delta.customer.get(source, 0)
    debit.note(f"expected {sending} {source}, observed {observed}")
    if observed != sending:
        debit.fail(f"source moved by {observed}, quote said {sending}")
    checks.append(debit)

    credit = Check(f"{label}: destination credited by totalReceivingAmount")
    observed = delta.customer.get(destination, 0)
    credit.note(f"expected {receiving} {destination}, observed {observed}")
    if observed != receiving:
        credit.fail(f"destination moved by {observed}, quote said {receiving}")
    checks.append(credit)

    untouched = Check(f"{label}: no other customer balance moved")
    strays = {
        code: moved
        for code, moved in delta.customer.items()
        if moved != 0 and code not in (source, destination)
    }
    if strays:
        untouched.fail(f"unexpected movement: {strays}")
    checks.append(untouched)

    platform = Check(f"{label}: platform credited by platformFeesIncluded")
    observed = delta.platform.get(source, 0)
    platform.note(
        f"quote priced platformFeesIncluded={platform_fees} {source}; "
        f"platform account moved {observed}"
    )
    if observed != platform_fees:
        platform.fail(
            f"platform account moved {observed}, quote priced {platform_fees}. "
            f"A non-zero fee that never reaches the platform's Grid balance is AT-6441."
        )
    checks.append(platform)

    if striga is not None and "__error__" not in delta.striga_corporate:
        mirror = Check(f"{label}: Striga corporate movement matches Grid's platform credit")
        multiplier = PROVIDER_UNIT_MULTIPLIER.get(source, 1)
        striga_delta = delta.striga_corporate.get(source, 0)
        in_grid_units = striga_delta * multiplier
        mirror.note(
            f"Striga corporate {source} moved {striga_delta} (Striga minor) "
            f"= {in_grid_units} grid minor; Grid platform account moved "
            f"{delta.platform.get(source, 0)}"
        )
        if in_grid_units != delta.platform.get(source, 0):
            mirror.fail(
                f"Striga collected {in_grid_units} but Grid credited "
                f"{delta.platform.get(source, 0)} - the two ledgers disagree"
            )
        checks.append(mirror)

    total = Check(f"{label}: fees reconcile against the amounts")
    total.note(
        f"feesIncluded={fees}, of which platform={platform_fees}, "
        f"rest is corridor/provider"
    )
    if platform_fees > fees:
        total.fail(f"platformFeesIncluded {platform_fees} exceeds feesIncluded {fees}")
    checks.append(total)

    return checks


def render(checks: list[Check]) -> int:
    width = max(len(c.name) for c in checks) if checks else 10
    print()
    print("=" * (width + 8))
    for check in checks:
        print(f"{check.status:<4} {check.name}")
        for detail in check.details:
            print(f"       {detail}")
    print("=" * (width + 8))
    failed = [c for c in checks if c.status == "FAIL"]
    warned = [c for c in checks if c.status == "WARN"]
    print(
        f"{len(checks) - len(failed) - len(warned)} passed, "
        f"{len(warned)} warned, {len(failed)} failed"
    )
    return 1 if failed else 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--creds", default="~/.grid-credentials-dev-striga")
    parser.add_argument("--customer-id", default=None)
    parser.add_argument(
        "--corridor",
        action="append",
        help="restrict to a corridor, e.g. USDC:EUR (repeatable)",
    )
    parser.add_argument("--json", default=None, help="write raw observations here")
    parser.add_argument(
        "--execute",
        action="store_true",
        help="MOVES REAL FUNDS: settle one quote per corridor and check the ledgers",
    )
    parser.add_argument(
        "--settle-timeout",
        type=int,
        default=300,
        help="seconds to wait for an executed quote to reach a terminal status",
    )
    args = parser.parse_args()

    credentials = load_credentials(Path(args.creds).expanduser())
    grid = GridClient(
        credentials["apiTokenId"],
        credentials["apiClientSecret"],
        credentials.get("baseUrl", "https://api.lightspark.com/grid/2025-10-13"),
    )

    striga = None
    if credentials.get("strigaApiKey"):
        striga = StrigaClient(
            credentials["strigaApiKey"],
            credentials["strigaApiSecret"],
            credentials["strigaApplicationId"],
            credentials.get("strigaEnvironment", "SANDBOX"),
        )

    corridors = list(SWEEPS)
    if args.corridor:
        wanted = {tuple(c.split(":")) for c in args.corridor}
        corridors = [c for c in corridors if c in wanted]

    customer_id, accounts = discover_accounts(grid, args.customer_id)
    print(f"customer   {customer_id}")
    for currency, account_id in sorted(accounts.items()):
        print(f"  {currency:<5} {account_id}")

    rates = {}
    if striga:
        try:
            rates = striga.trade_rates()
            print(f"striga     {len(rates)} published pairs")
        except Exception as exc:  # noqa: BLE001 - reported, not swallowed
            print(f"striga     rate lookup failed: {exc}")

    checks: list[Check] = []
    observations = {}
    for corridor in corridors:
        fits = {}
        all_rows = []
        for lock_side, amounts in SWEEPS[corridor].items():
            print(f"quoting    {corridor[0]}->{corridor[1]} {lock_side} "
                  f"({len(amounts)} amounts)")
            rows = collect(grid, accounts, corridor, lock_side, amounts)
            observations[f"{corridor[0]}->{corridor[1]}:{lock_side}"] = rows
            all_rows.extend(rows)
            errors = [r for r in rows if "error" in r]
            if errors:
                failure = Check(
                    f"{corridor[0]}->{corridor[1]} {lock_side}: all quotes priced"
                )
                failure.fail(
                    f"{len(errors)}/{len(rows)} quotes failed, first: {errors[0]['error']}"
                )
                checks.append(failure)
            checks.append(check_locked_side(corridor, lock_side, rows))
            fee_check, fit = check_fee_fit(corridor, lock_side, rows)
            checks.append(fee_check)
            if fit:
                fits[lock_side] = fit
            checks.append(check_exchange_rate_identity(corridor, lock_side, rows))
        checks.append(
            check_lock_side_agreement(
                corridor,
                fits,
                observations.get(f"{corridor[0]}->{corridor[1]}:RECEIVING", []),
            )
        )
        checks.append(check_platform_fees(corridor, all_rows))
        checks.append(check_striga_representable(corridor, all_rows))
        if rates:
            checks.append(check_striga_spread(corridor, all_rows, rates))
        checks.append(check_rates_vs_quotes(grid, corridor, all_rows))

    if args.execute:
        for corridor in corridors:
            amount = SWEEPS[corridor]["SENDING"][0]
            print(
                f"executing  {corridor[0]}->{corridor[1]} SENDING {amount} "
                f"(MOVES REAL FUNDS)"
            )
            checks.extend(
                run_settlement(
                    grid,
                    striga,
                    customer_id,
                    accounts,
                    corridor,
                    amount,
                    settle_timeout=args.settle_timeout,
                )
            )

    if striga:
        checks.append(check_striga_fee_ceiling(striga))

    if args.json:
        Path(args.json).write_text(json.dumps(observations, indent=2, default=str))
        print(f"\nraw observations written to {args.json}")

    return render(checks)


if __name__ == "__main__":
    sys.exit(main())
