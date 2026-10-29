#!/usr/bin/env python3
"""Tron chain CLI for Grid USDT testing.

Supports both Shasta testnet (default) and Tron mainnet (--mainnet flag).

Subcommands:
  wallet-address              Print public address of loaded key
  trx-balance [--address]     Print TRX balance
  usdt-balance [--address]    Print USDT balance (raw + human-readable)
  send-usdt --to --amount     Send USDT (amount in micro-USDT, 6 decimals)
"""

import argparse
import json
import os
import sys
import time

try:
    from tronpy import Tron
    from tronpy.keys import PrivateKey
    from tronpy.providers import HTTPProvider
except ImportError as e:
    print(json.dumps({"error": "Missing dependencies. Install with: pip3 install tronpy", "detail": str(e)}))
    sys.exit(1)

NETWORKS = {
    "testnet": {
        "network": "shasta",
        "endpoint": "https://api.shasta.trongrid.io",
        "usdt_contract": "TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs",
        "cred_key": "tronTestnetPrivateKey",
        "name": "Tron Shasta",
    },
    "mainnet": {
        "network": "mainnet",
        "endpoint": "https://api.trongrid.io",
        "usdt_contract": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
        "cred_key": "tronMainnetPrivateKey",
        "name": "Tron Mainnet",
    },
}

USDT_DECIMALS = 6
SUN_PER_TRX = 1_000_000

NET = None  # set in main()


def load_priv_key(creds_path=None):
    creds_path = creds_path or os.path.expanduser("~/.grid-credentials")
    with open(creds_path) as f:
        creds = json.load(f)
    hex_key = creds.get(NET["cred_key"])
    if not hex_key:
        print(json.dumps({"error": f"{NET['cred_key']} not found in ~/.grid-credentials"}))
        sys.exit(1)
    if hex_key.startswith("0x"):
        hex_key = hex_key[2:]
    return PrivateKey(bytes.fromhex(hex_key))


def get_trongrid_api_key(creds_path=None):
    if os.environ.get("TRONGRID_API_KEY"):
        return os.environ["TRONGRID_API_KEY"]
    creds_path = creds_path or os.path.expanduser("~/.grid-credentials")
    try:
        with open(creds_path) as f:
            return json.load(f).get("trongridApiKey")
    except (OSError, ValueError):
        return None


def get_client():
    # The public TronGrid endpoint rate-limits unauthenticated traffic; a free
    # API key (TRONGRID_API_KEY env or trongridApiKey in ~/.grid-credentials)
    # lifts the limit.
    api_key = get_trongrid_api_key()
    provider = HTTPProvider(NET["endpoint"], api_key=api_key) if api_key else HTTPProvider(NET["endpoint"])
    return Tron(provider=provider, network=NET["network"])


def get_address():
    return load_priv_key().public_key.to_base58check_address()


def cmd_wallet_address(args):
    print(json.dumps({"address": get_address()}))


def cmd_trx_balance(args):
    client = get_client()
    address = args.address or get_address()
    try:
        sun = client.get_account_balance(address)
        trx = float(sun)
        sun_int = int(round(trx * SUN_PER_TRX))
    except Exception as e:
        sun_int = 0
        trx = 0.0
    print(json.dumps({
        "address": address,
        "sun": sun_int,
        "trx": trx,
    }))


def cmd_usdt_balance(args):
    client = get_client()
    address = args.address or get_address()
    contract = client.get_contract(NET["usdt_contract"])
    try:
        raw = contract.functions.balanceOf(address)
    except Exception:
        raw = 0
    print(json.dumps({
        "address": address,
        "contract": NET["usdt_contract"],
        "raw": raw,
        "amount": raw / (10 ** USDT_DECIMALS),
        "ui_amount": f"{raw / (10 ** USDT_DECIMALS):.6f}",
    }))


def cmd_send_usdt(args):
    priv = load_priv_key()
    sender = priv.public_key.to_base58check_address()
    client = get_client()
    contract = client.get_contract(NET["usdt_contract"])
    recipient = args.to
    amount = int(args.amount)

    txn = (
        contract.functions.transfer(recipient, amount)
        .with_owner(sender)
        .fee_limit(100_000_000)
        .build()
        .sign(priv)
    )
    result = txn.broadcast()
    tx_id = result.get("txid") or txn.txid

    print(json.dumps({"status": "sent", "tx_id": tx_id, "message": "Waiting for confirmation..."}))

    for _ in range(60):
        time.sleep(2)
        try:
            info = client.get_transaction_info(tx_id)
        except Exception:
            info = None
        if info and info.get("blockNumber"):
            result_code = info.get("receipt", {}).get("result") or info.get("result")
            if result_code in (None, "SUCCESS"):
                print(json.dumps({"status": "confirmed", "tx_id": tx_id, "block": info.get("blockNumber")}))
                return
            print(json.dumps({"status": "failed", "tx_id": tx_id, "result": result_code, "info": info}))
            sys.exit(1)

    print(json.dumps({"status": "timeout", "tx_id": tx_id, "message": "Transaction sent but confirmation timed out."}))
    sys.exit(1)


def main():
    global NET

    parser = argparse.ArgumentParser(description="Tron chain helper for Grid USDT testing")
    parser.add_argument("--mainnet", action="store_true", help="Use Tron mainnet instead of Shasta testnet")
    sub = parser.add_subparsers(dest="command")
    sub.required = True

    sub.add_parser("wallet-address", help="Print public address of loaded key")

    trx_bal = sub.add_parser("trx-balance", help="Print TRX balance")
    trx_bal.add_argument("--address", help="Address to check (default: own wallet)")

    usdt_bal = sub.add_parser("usdt-balance", help="Print USDT balance")
    usdt_bal.add_argument("--address", help="Address to check (default: own wallet)")

    send = sub.add_parser("send-usdt", help="Send USDT")
    send.add_argument("--to", required=True, help="Recipient address (T...)")
    send.add_argument("--amount", required=True, help="Amount in micro-USDT (6 decimals)")

    args = parser.parse_args()
    NET = NETWORKS["mainnet"] if args.mainnet else NETWORKS["testnet"]

    dispatch = {
        "wallet-address": cmd_wallet_address,
        "trx-balance": cmd_trx_balance,
        "usdt-balance": cmd_usdt_balance,
        "send-usdt": cmd_send_usdt,
    }
    dispatch[args.command](args)


if __name__ == "__main__":
    main()
