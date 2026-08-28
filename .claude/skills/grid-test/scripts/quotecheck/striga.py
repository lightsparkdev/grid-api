"""Signed Striga client, read-only.

Mirrors StrigaClient._build_headers in
webdev/sparkcore/sparkcore/services/striga_client.py: timestamp-based HMAC over
an MD5 of the compact request body, with the /api/v1 prefix excluded from the
signed path.

Only endpoints that read are exposed here. Nothing in this module moves money or
mutates configuration.
"""

from __future__ import annotations

import hashlib
import hmac
import json
import time
import urllib.error
import urllib.request
from decimal import Decimal
from typing import Any

ENV_URL = {
    "PROD": "https://api.striga.com/v0/",
    "SANDBOX": "https://www.sandbox.striga.com/api/v1/",
}

# webdev's STRIGA_PROVIDER_UNIT_MULTIPLIER (grid/striga_payload_parsing.py).
# Grid's minor unit divided by this gives Striga's. USDC is the one that bites:
# grid counts micro-USDC, Striga counts cents, so any USDC amount Striga has to
# act on must be a multiple of 10_000.
PROVIDER_UNIT_MULTIPLIER = {"EUR": 1, "BITCOIN": 1, "USDC": 10_000}


class StrigaError(RuntimeError):
    pass


class StrigaClient:
    def __init__(self, api_key: str, api_secret: str, application_id: str, env: str):
        if env not in ENV_URL:
            raise StrigaError(f"Unknown Striga environment: {env}")
        self.base = ENV_URL[env]
        self.api_key = api_key
        self.api_secret = api_secret
        self.application_id = application_id

    def call(self, method: str, path: str, body: dict[str, Any] | None = None):
        body = body if body is not None else {}
        signed_path = path if path.startswith("/") else "/" + path
        timestamp = str(int(time.time_ns() // 1_000_000))
        body_string = json.dumps(body, separators=(",", ":"), ensure_ascii=False)
        md5_hash = hashlib.md5(body_string.encode("utf-8")).hexdigest()
        signature = hmac.new(
            self.api_secret.encode("utf-8"),
            (timestamp + method.upper() + signed_path + md5_hash).encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        request = urllib.request.Request(
            self.base + path.lstrip("/"),
            data=body_string.encode("utf-8"),
            method=method.upper(),
            headers={
                "Authorization": f"HMAC {timestamp}:{signature}",
                "api-key": self.api_key,
                "Content-Type": "application/json",
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                return response.status, json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            raw = exc.read().decode("utf-8")
            try:
                return exc.code, json.loads(raw)
            except json.JSONDecodeError:
                return exc.code, raw

    def trade_rates(self) -> dict[str, dict[str, str]]:
        status, payload = self.call("POST", "trade/rates")
        if status != 200:
            raise StrigaError(f"trade/rates returned {status}: {payload}")
        return payload

    def corporate_accounts(self) -> dict[str, dict[str, Any]]:
        """Corporate accounts keyed by currency.

        Note the path: `POST /corporate/wallets`, per Striga's docs and
        lspeu-core's router. webdev's gen_get_all_corporate_accounts posts
        `wallets/corporate/get/all` instead, which 404s (see AT-6334).
        """
        status, payload = self.call(
            "POST", "corporate/wallets", {"applicationId": self.application_id}
        )
        if status != 200:
            raise StrigaError(f"corporate/wallets returned {status}: {payload}")
        accounts: dict[str, dict[str, Any]] = {}
        for wallet in payload.get("wallets", []):
            for currency, account in wallet.get("accounts", {}).items():
                accounts[currency] = account
        return accounts

    def fee_config(self) -> dict[str, Any]:
        """The application's configured fee schedule. Overrides are capped at
        these values per component, so a zero here means no fee is collectable.
        """
        status, payload = self.call(
            "POST", "corporate/config/fees", {"applicationId": self.application_id}
        )
        if status != 200:
            raise StrigaError(f"corporate/config/fees returned {status}: {payload}")
        return payload

    def corporate_statement(
        self, account_id: str, start_ms: int, end_ms: int, page: int = 1, limit: int = 100
    ) -> dict[str, Any]:
        status, payload = self.call(
            "POST",
            "corporate/account/statement",
            {
                "applicationId": self.application_id,
                "accountId": account_id,
                "startDate": start_ms,
                "endDate": end_ms,
                "page": page,
                "limit": limit,
            },
        )
        if status != 200:
            raise StrigaError(f"corporate statement returned {status}: {payload}")
        return payload


# Grid reads USDC->EUR off the USDCEUR pair's SELL side and EUR->USDC off its BUY
# side (_STRIGA_EXCHANGE_TRADE_MAP in striga_grid_switch.py). Striga publishes
# each pair in exactly one orientation, so the reverse direction inverts.
TRADE_PAIR = {
    ("USDC", "EUR"): ("USDCEUR", "sell", False),
    ("EUR", "USDC"): ("USDCEUR", "buy", True),
}

MINOR_EXPONENT = {"EUR": 2, "USDC": 6, "BITCOIN": 8}


def striga_minor_rate(rates: dict, source: str, destination: str) -> Decimal | None:
    """Striga's published rate for a corridor, expressed the way grid does:
    destination minor units per source minor unit."""
    entry = TRADE_PAIR.get((source, destination))
    if entry is None:
        return None
    ticker, side, invert = entry
    pair = rates.get(ticker)
    if pair is None or side not in pair:
        return None
    major = Decimal(str(pair[side]))
    if major == 0:
        return None
    if invert:
        major = Decimal(1) / major
    exponent = MINOR_EXPONENT[destination] - MINOR_EXPONENT[source]
    return major * (Decimal(10) ** exponent)


def published_rate_noise_bps(rates: dict, source: str, destination: str):
    """Half a tick of the published rate, in bps.

    Striga quotes each pair to a fixed number of decimals (2 in sandbox), so any
    spread measured against it carries at least this much error. Comparing a
    50 bps spread against a rate good to 60 bps tells you nothing.
    """
    entry = TRADE_PAIR.get((source, destination))
    if entry is None:
        return None
    ticker, side, _invert = entry
    pair = rates.get(ticker)
    if pair is None or side not in pair:
        return None
    quoted = Decimal(str(pair[side]))
    if quoted == 0:
        return None
    decimals = -quoted.as_tuple().exponent
    half_tick = (Decimal(10) ** -decimals) / 2
    return half_tick / quoted * 10000
