"""Grid REST client, scoped to what the quote-math checks need.

create_quote leaves the quote unexecuted; quotes expire on their own, so a run
of this harness moves no funds.
"""

from __future__ import annotations

import base64
import json
import urllib.error
import urllib.request
from typing import Any


class GridError(RuntimeError):
    pass


class GridClient:
    def __init__(self, token_id: str, client_secret: str, base_url: str):
        self.base_url = base_url.rstrip("/")
        auth = base64.b64encode(f"{token_id}:{client_secret}".encode()).decode()
        self.auth_header = f"Basic {auth}"

    def _request(self, method: str, path: str, body: dict[str, Any] | None = None):
        data = json.dumps(body).encode("utf-8") if body is not None else None
        request = urllib.request.Request(
            self.base_url + path,
            data=data,
            method=method,
            headers={
                "Authorization": self.auth_header,
                "Content-Type": "application/json",
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                return response.status, json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            raw = exc.read().decode("utf-8")
            try:
                return exc.code, json.loads(raw)
            except json.JSONDecodeError:
                return exc.code, raw

    def config(self) -> dict[str, Any]:
        status, payload = self._request("GET", "/config")
        if status != 200:
            raise GridError(f"GET /config returned {status}: {payload}")
        return payload

    def internal_accounts(self, customer_id: str) -> list[dict[str, Any]]:
        status, payload = self._request(
            "GET", f"/customers/internal-accounts?customerId={customer_id}&limit=100"
        )
        if status != 200:
            raise GridError(f"internal-accounts returned {status}: {payload}")
        return payload.get("data", [])

    def platform_internal_accounts(self) -> list[dict[str, Any]]:
        status, payload = self._request("GET", "/platform/internal-accounts")
        if status != 200:
            raise GridError(f"platform internal-accounts returned {status}: {payload}")
        return payload.get("data", [])

    def exchange_rate(self, source: str, destination: str, sending_amount: int):
        status, payload = self._request(
            "GET",
            f"/exchange-rates?sourceCurrency={source}"
            f"&destinationCurrency={destination}&sendingAmount={sending_amount}",
        )
        if status != 200:
            return None, payload
        rows = payload.get("data", [])
        return (rows[0] if rows else None), payload

    def get_quote(self, quote_id: str):
        status, payload = self._request("GET", f"/quotes/{quote_id}")
        if status != 200:
            raise GridError(f"GET /quotes/{quote_id} returned {status}: {payload}")
        return payload

    def authorize_quote(self, quote_id: str, code: str):
        """Satisfy one SCA challenge. The server resolves the active challenge
        from the quote itself, so only the proof is sent."""
        status, payload = self._request(
            "POST", f"/quotes/{quote_id}/authorize", {"code": code}
        )
        if status not in (200, 201):
            return None, payload
        return payload, None

    def create_quote(
        self,
        source_account_id: str,
        destination_account_id: str,
        locked_side: str,
        locked_amount: int,
    ):
        """Create an account-funded quote. Returns (quote, error). The quote is
        never executed and expires on its own."""
        status, payload = self._request(
            "POST",
            "/quotes",
            {
                "source": {
                    "sourceType": "ACCOUNT",
                    "accountId": source_account_id,
                },
                "destination": {
                    "destinationType": "ACCOUNT",
                    "accountId": destination_account_id,
                },
                "lockedCurrencySide": locked_side,
                "lockedCurrencyAmount": locked_amount,
                "purposeOfPayment": "GOODS_OR_SERVICES",
            },
        )
        if status not in (200, 201) or not isinstance(payload, dict) or "id" not in payload:
            return None, payload
        return payload, None
