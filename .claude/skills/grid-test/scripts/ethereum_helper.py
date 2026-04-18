#!/usr/bin/env python3
"""Ethereum L1 CLI for Grid USDC testing.

Supports both Ethereum Sepolia testnet (default) and Ethereum mainnet (--mainnet flag).

Subcommands:
  wallet-address              Print public address of loaded key
  eth-balance [--address]     Print ETH balance
  usdc-balance [--address]    Print USDC balance (raw + human-readable)
  send-usdc --to --amount     Send USDC (amount in micro-USDC, 6 decimals)
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
        "rpc": "https://ethereum-sepolia-rpc.publicnode.com",
        "chain_id": 11155111,
        "usdc_contract": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
        "cred_key": "ethereumTestnetPrivateKey",
        "name": "Ethereum Sepolia",
        "priority_fee_gwei": 1.5,
    },
    "mainnet": {
        "rpc": "https://ethereum-rpc.publicnode.com",
        "chain_id": 1,
        "usdc_contract": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        "cred_key": "ethereumMainnetPrivateKey",
        "name": "Ethereum Mainnet",
        "priority_fee_gwei": 1.5,
    },
}

USDC_DECIMALS = 6

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


def get_usdc_contract(w3):
    return w3.eth.contract(address=Web3.to_checksum_address(NET["usdc_contract"]), abi=ERC20_ABI)


def cmd_wallet_address(args):
    acct = load_account()
    print(json.dumps({"address": acct.address}))


def cmd_eth_balance(args):
    w3 = get_web3()
    if args.address:
        address = Web3.to_checksum_address(args.address)
    else:
        acct = load_account()
        address = acct.address
    balance_wei = w3.eth.get_balance(address)
    print(json.dumps({
        "address": address,
        "wei": balance_wei,
        "eth": float(Web3.from_wei(balance_wei, "ether")),
    }))


def cmd_usdc_balance(args):
    w3 = get_web3()
    usdc = get_usdc_contract(w3)
    if args.address:
        address = Web3.to_checksum_address(args.address)
    else:
        acct = load_account()
        address = acct.address
    raw = usdc.functions.balanceOf(address).call()
    print(json.dumps({
        "address": address,
        "contract": NET["usdc_contract"],
        "raw": raw,
        "amount": raw / (10 ** USDC_DECIMALS),
        "ui_amount": f"{raw / (10 ** USDC_DECIMALS):.6f}",
    }))


def cmd_send_usdc(args):
    acct = load_account()
    w3 = get_web3()
    usdc = get_usdc_contract(w3)
    recipient = Web3.to_checksum_address(args.to)
    amount = int(args.amount)

    nonce = w3.eth.get_transaction_count(acct.address)

    tx = usdc.functions.transfer(recipient, amount).build_transaction({
        "chainId": NET["chain_id"],
        "from": acct.address,
        "nonce": nonce,
        "gas": 100_000,
        "maxFeePerGas": w3.eth.gas_price * 2,
        "maxPriorityFeePerGas": w3.to_wei(NET["priority_fee_gwei"], "gwei"),
    })

    signed = acct.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    tx_hash_hex = tx_hash.hex()

    print(json.dumps({"status": "sent", "tx_hash": tx_hash_hex, "message": "Waiting for confirmation..."}))

    for _ in range(90):
        time.sleep(2)
        try:
            receipt = w3.eth.get_transaction_receipt(tx_hash)
            if receipt is not None:
                if receipt["status"] == 1:
                    print(json.dumps({"status": "confirmed", "tx_hash": tx_hash_hex, "block": receipt["blockNumber"]}))
                    return
                else:
                    print(json.dumps({"status": "failed", "tx_hash": tx_hash_hex, "receipt_status": receipt["status"]}))
                    sys.exit(1)
        except Exception:
            pass

    print(json.dumps({"status": "timeout", "tx_hash": tx_hash_hex, "message": "Transaction sent but confirmation timed out."}))
    sys.exit(1)


def main():
    global NET

    parser = argparse.ArgumentParser(description="Ethereum L1 helper for Grid USDC testing")
    parser.add_argument("--mainnet", action="store_true", help="Use Ethereum mainnet instead of Sepolia testnet")
    sub = parser.add_subparsers(dest="command")
    sub.required = True

    sub.add_parser("wallet-address", help="Print public address of loaded key")

    eth_bal = sub.add_parser("eth-balance", help="Print ETH balance")
    eth_bal.add_argument("--address", help="Address to check (default: own wallet)")

    usdc_bal = sub.add_parser("usdc-balance", help="Print USDC balance")
    usdc_bal.add_argument("--address", help="Address to check (default: own wallet)")

    send = sub.add_parser("send-usdc", help="Send USDC")
    send.add_argument("--to", required=True, help="Recipient address (0x...)")
    send.add_argument("--amount", required=True, help="Amount in micro-USDC (6 decimals)")

    args = parser.parse_args()
    NET = NETWORKS["mainnet"] if args.mainnet else NETWORKS["testnet"]

    dispatch = {
        "wallet-address": cmd_wallet_address,
        "eth-balance": cmd_eth_balance,
        "usdc-balance": cmd_usdc_balance,
        "send-usdc": cmd_send_usdc,
    }
    dispatch[args.command](args)


if __name__ == "__main__":
    main()
