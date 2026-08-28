"""Balance snapshots and quote execution, for the settlement checks.

Everything here MOVES REAL FUNDS and only runs under `--execute`. The rest of
the harness is read-only.

The shape of a settlement check is always the same: snapshot every balance we
can see, put one quote through, snapshot again, and assert the deltas match what
the quote promised. Three ledgers are in view:

    customer internal accounts   (Grid)   - source debit, destination credit
    platform internal accounts   (Grid)   - where a platform fee should land
    corporate accounts           (Striga) - where Striga actually sweeps fees

A fee that Striga collects but Grid never mirrors shows up as the second and
third disagreeing, which is exactly the AT-6441 gap.
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Any

TERMINAL_STATUSES = {"COMPLETED", "REJECTED", "FAILED", "REFUNDED", "EXPIRED"}


@dataclass
class Snapshot:
    customer: dict[str, int] = field(default_factory=dict)
    platform: dict[str, int] = field(default_factory=dict)
    striga_corporate: dict[str, int] = field(default_factory=dict)

    def delta(self, later: "Snapshot") -> "Snapshot":
        def diff(before: dict[str, int], after: dict[str, int]) -> dict[str, int]:
            keys = set(before) | set(after)
            return {k: after.get(k, 0) - before.get(k, 0) for k in sorted(keys)}

        return Snapshot(
            customer=diff(self.customer, later.customer),
            platform=diff(self.platform, later.platform),
            striga_corporate=diff(self.striga_corporate, later.striga_corporate),
        )


def take_snapshot(grid, striga, customer_id: str) -> Snapshot:
    """Every balance the harness can observe, keyed by currency code.

    Striga's corporate balances stay in Striga's own minor unit here; the caller
    converts when comparing, so the raw provider number is what gets recorded.
    """
    snapshot = Snapshot()
    for account in grid.internal_accounts(customer_id):
        code = account.get("balance", {}).get("currency", {}).get("code")
        if code:
            snapshot.customer[code] = account["balance"]["amount"]
    for account in grid.platform_internal_accounts():
        code = account.get("balance", {}).get("currency", {}).get("code")
        if code:
            snapshot.platform[code] = account["balance"]["amount"]
    if striga is not None:
        try:
            for code, account in striga.corporate_accounts().items():
                amount = account.get("availableBalance", {}).get("amount")
                if amount is not None:
                    snapshot.striga_corporate[code] = int(amount)
        except Exception as exc:  # noqa: BLE001 - recorded, not swallowed
            snapshot.striga_corporate["__error__"] = str(exc)
    return snapshot


def execute_quote(grid, quote_id: str):
    """Execute a quote. Returns (payload, error).

    A customer in an SCA region comes back PENDING_AUTHORIZATION with a
    challenge the harness cannot satisfy headlessly; that is reported as an
    error rather than retried, since the funds have not moved.
    """
    status, payload = grid._request("POST", f"/quotes/{quote_id}/execute", {})
    if status not in (200, 201, 202):
        return None, payload
    return payload, None


SANDBOX_OTP = "123456"


def satisfy_sca(grid, quote_id: str, code: str = SANDBOX_OTP, max_rounds: int = 6):
    """Authorize SCA challenges until the quote leaves PENDING_AUTHORIZATION.

    One operation can carry several challenges in sequence - a cross-currency
    send authorizes the conversion and the payout as two - so this loops on
    status rather than assuming a single authorization releases the transfer.

    Returns (quote, error, rounds).
    """
    rounds = 0
    while rounds < max_rounds:
        quote = grid.get_quote(quote_id)
        if quote.get("status") != "PENDING_AUTHORIZATION":
            return quote, None, rounds
        challenge = quote.get("scaChallenge") or {}
        factor = challenge.get("factor")
        if factor != "SMS_OTP":
            return None, (
                f"challenge {challenge.get('id')} wants factor {factor}; only "
                f"SMS_OTP can be satisfied headlessly"
            ), rounds
        authorized, error = grid.authorize_quote(quote_id, code)
        if authorized is None:
            return None, f"authorize failed on round {rounds + 1}: {error}", rounds
        rounds += 1
    return None, f"still PENDING_AUTHORIZATION after {max_rounds} authorizations", rounds


def poll_transaction(grid, transaction_id: str, timeout_s: int = 300, interval_s: int = 5):
    """Poll until the transaction reaches a terminal status or the deadline.

    Returns (transaction, timed_out). Striga's swap plus its webhook round trip
    is slower than the 120s the older chain tests used, hence the longer default.
    """
    deadline = time.time() + timeout_s
    last: dict[str, Any] | None = None
    while time.time() < deadline:
        status, payload = grid._request("GET", f"/transactions/{transaction_id}")
        if status == 200 and isinstance(payload, dict):
            last = payload
            if payload.get("status") in TERMINAL_STATUSES:
                return payload, False
        time.sleep(interval_s)
    return last, True
