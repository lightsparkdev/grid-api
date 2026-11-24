#!/usr/bin/env python3
"""Plasma chain CLI for Grid USDT testing.

Supports both Plasma testnet (default) and Plasma mainnet (--mainnet flag).

Plasma carries USDT only — Grid's PaymentPlasmaWalletInfo declares
`assetType: [USDT]`, so unlike ethereum_helper.py there is no USDC path here.
The mainnet token is branded USD0 (symbol `USDT0`) but is the USDT Grid indexes
for the PLASMA network.

Subcommands:
  wallet-address              Print public address of loaded key
  xpl-balance [--address]     Print XPL balance
  usdt-balance [--address]    Print USDT balance (raw + human-readable)
  send-usdt --to --amount     Send USDT (amount in micro-USDT, 6 decimals)
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path

try:
    from web3 import Web3
    from eth_account import Account
except ImportError as e:
    print(json.dumps({"error": "Missing dependencies. Install with: pip3 install web3", "detail": str(e)}))
    sys.exit(1)

NETWORKS = {
    "testnet": {
        "rpc": "https://testnet-rpc.plasma.to",
        "chain_id": 9746,
        "usdt_contract": "0x502012b361AebCE43b26Ec812B74D9a51dB4D412",
        "cred_key": "plasmaTestnetPrivateKey",
        "name": "Plasma Testnet",
        "priority_fee_gwei": 1,
    },
    "mainnet": {
        "rpc": "https://rpc.plasma.to",
        "chain_id": 9745,
        "usdt_contract": "0xb8ce59fc3717ada4c02eadf9682a9e934f625ebb",
        "cred_key": "plasmaMainnetPrivateKey",
        "name": "Plasma Mainnet",
        "priority_fee_gwei": 1,
    },
}

USDT_DECIMALS = 6

ERC20_ABI = [
    {
        "constant": True,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function",
    },
    {
        "constant": False,
        "inputs": [
            {"name": "_to", "type": "address"},
            {"name": "_value", "type": "uint256"},
        ],
        "name": "transfer",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function",
    },
]

NET = None  # set in main()


def load_account(creds_path=None):
    creds_path = creds_path or os.path.expanduser("~/.grid-credentials")
    with open(creds_path) as f:
        creds = json.load(f)
    private_key = creds.get(NET["cred_key"])
    if not private_key:
        print(json.dumps({"error": f"{NET['cred_key']} not found in ~/.grid-credentials"}))
        sys.exit(1)
    if not private_key.startswith("0x"):
        private_key = "0x" + private_key
    return Account.from_key(private_key)


def get_web3():
    w3 = Web3(Web3.HTTPProvider(NET["rpc"]))
    if not w3.is_connected():
        print(json.dumps({"error": f"Failed to connect to {NET['name']} RPC", "rpc": NET["rpc"]}))
        sys.exit(1)
    return w3


def token_address():
    contract = NET["usdt_contract"]
    if not contract:
        print(json.dumps({
            "error": f"No USDT contract configured for {NET['name']}",
            "detail": "Set NETWORKS['testnet']['usdt_contract'] in plasma_helper.py to the address Grid indexes for PLASMA on testnet, or run against mainnet with --mainnet.",
        }))
        sys.exit(1)
    return contract


def get_usdt_contract(w3):
    return w3.eth.contract(address=Web3.to_checksum_address(token_address()), abi=ERC20_ABI)


def resolve_address(args):
    if args.address:
        return Web3.to_checksum_address(args.address)
    return load_account().address


def cmd_wallet_address(args):
    acct = load_account()
    print(json.dumps({"address": acct.address}))


def cmd_xpl_balance(args):
    w3 = get_web3()
    address = resolve_address(args)
    balance_wei = w3.eth.get_balance(address)
    print(json.dumps({
        "address": address,
        "wei": balance_wei,
        "xpl": float(Web3.from_wei(balance_wei, "ether")),
    }))


def cmd_usdt_balance(args):
    w3 = get_web3()
    usdt = get_usdt_contract(w3)
    address = resolve_address(args)
    raw = usdt.functions.balanceOf(address).call()
    print(json.dumps({
        "address": address,
        "asset": "USDT",
        "contract": token_address(),
        "raw": raw,
        "amount": raw / (10 ** USDT_DECIMALS),
        "ui_amount": f"{raw / (10 ** USDT_DECIMALS):.6f}",
    }))


def cmd_send_usdt(args):
    acct = load_account()
    w3 = get_web3()
    usdt = get_usdt_contract(w3)
    recipient = Web3.to_checksum_address(args.to)
    amount = int(args.amount)

    nonce = w3.eth.get_transaction_count(acct.address)

    # maxFeePerGas must never fall below maxPriorityFeePerGas, or the node
    # rejects the tx outright. Deriving it from the block's base fee keeps
    # that true even when base fee is far below the priority tip, which is
    # routine on low-fee chains during quiet periods.
    priority_fee = w3.to_wei(NET["priority_fee_gwei"], "gwei")
    base_fee = w3.eth.get_block("latest").get("baseFeePerGas") or w3.eth.gas_price
    max_fee = base_fee * 2 + priority_fee

    tx = usdt.functions.transfer(recipient, amount).build_transaction({
        "chainId": NET["chain_id"],
        "from": acct.address,
        "nonce": nonce,
        "gas": 100_000,
        "maxFeePerGas": max_fee,
        "maxPriorityFeePerGas": priority_fee,
    })

    signed = acct.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    tx_hash_hex = tx_hash.hex()

    print(json.dumps({"status": "sent", "asset": "USDT", "tx_hash": tx_hash_hex, "message": "Waiting for confirmation..."}))

    for _ in range(90):
        time.sleep(2)
        try:
            receipt = w3.eth.get_transaction_receipt(tx_hash)
            if receipt is not None:
                if receipt["status"] == 1:
                    print(json.dumps({"status": "confirmed", "asset": "USDT", "tx_hash": tx_hash_hex, "block": receipt["blockNumber"]}))
                    return
                else:
                    print(json.dumps({"status": "failed", "asset": "USDT", "tx_hash": tx_hash_hex, "receipt_status": receipt["status"]}))
                    sys.exit(1)
        except Exception:
            pass

    print(json.dumps({"status": "timeout", "asset": "USDT", "tx_hash": tx_hash_hex, "message": "Transaction sent but confirmation timed out."}))
    sys.exit(1)


def main():
    global NET

    parser = argparse.ArgumentParser(description="Plasma chain helper for Grid USDT testing")
    parser.add_argument("--mainnet", action="store_true", help="Use Plasma mainnet instead of testnet")
    sub = parser.add_subparsers(dest="command")
    sub.required = True

    sub.add_parser("wallet-address", help="Print public address of loaded key")

    xpl_bal = sub.add_parser("xpl-balance", help="Print XPL balance")
    xpl_bal.add_argument("--address", help="Address to check (default: own wallet)")

    usdt_bal = sub.add_parser("usdt-balance", help="Print USDT balance")
    usdt_bal.add_argument("--address", help="Address to check (default: own wallet)")

    send = sub.add_parser("send-usdt", help="Send USDT")
    send.add_argument("--to", required=True, help="Recipient address (0x...)")
    send.add_argument("--amount", required=True, help="Amount in micro-USDT (6 decimals)")

    args = parser.parse_args()
    NET = NETWORKS["mainnet"] if args.mainnet else NETWORKS["testnet"]

    dispatch = {
        "wallet-address": cmd_wallet_address,
        "xpl-balance": cmd_xpl_balance,
        "usdt-balance": cmd_usdt_balance,
        "send-usdt": cmd_send_usdt,
    }
    dispatch[args.command](args)


if __name__ == "__main__":
    main()
