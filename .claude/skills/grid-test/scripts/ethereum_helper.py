#!/usr/bin/env python3
"""Ethereum L1 CLI for Grid USDC and USDT testing.

Supports both Ethereum Sepolia testnet (default) and Ethereum mainnet (--mainnet flag).

Subcommands:
  wallet-address              Print public address of loaded key
  eth-balance [--address]     Print ETH balance
  usdc-balance [--address]    Print USDC balance (raw + human-readable)
  usdt-balance [--address]    Print USDT balance (raw + human-readable)
  send-usdc --to --amount     Send USDC (amount in micro-USDC, 6 decimals)
  send-usdt --to --amount     Send USDT (amount in micro-USDT, 6 decimals)
  sign-message --message      Sign a message (EIP-191, 0x-hex signature)
  gen-keypair                 Print a fresh throwaway keypair (address + private key)
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
    from eth_account.messages import encode_defunct
except ImportError as e:
    print(json.dumps({"error": "Missing dependencies. Install with: pip3 install web3", "detail": str(e)}))
    sys.exit(1)

NETWORKS = {
    "testnet": {
        "rpc": "https://ethereum-sepolia-rpc.publicnode.com",
        "chain_id": 11155111,
        "tokens": {
            "usdc": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
            "usdt": "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0",
        },
        "cred_key": "ethereumTestnetPrivateKey",
        "name": "Ethereum Sepolia",
        "priority_fee_gwei": 1.5,
    },
    "mainnet": {
        "rpc": "https://ethereum-rpc.publicnode.com",
        "chain_id": 1,
        "tokens": {
            "usdc": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            "usdt": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        },
        "cred_key": "ethereumMainnetPrivateKey",
        "name": "Ethereum Mainnet",
        "priority_fee_gwei": 1.5,
    },
}

TOKEN_DECIMALS = 6

# Mainnet USDT's transfer() returns nothing rather than a bool, but web3 only
# encodes calldata when building a signed transaction, so this ABI serves both.
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


def read_message(args):
    """The exact bytes to sign.

    Grid's ownership challenge is matched character-for-character by the
    provider, so --message-file exists to keep a shell out of the round trip.
    Only a trailing newline is stripped: the file is the message, not a line of
    text about it.
    """
    if args.message_file:
        raw = Path(args.message_file).read_text(encoding="utf-8")
        return raw[:-1] if raw.endswith("\n") else raw
    return args.message


def resolve_account(args):
    """The funded wallet by default, or a throwaway passed on the command line.

    Travel Rule negative cases need a key that is deliberately not the one the
    wallet was registered under, and throwaway wallets never belong in
    ~/.grid-credentials.
    """
    key = getattr(args, "private_key", None)
    if not key:
        return load_account()
    return Account.from_key(key if key.startswith("0x") else "0x" + key)


def cmd_gen_keypair(args):
    account = Account.create()
    print(json.dumps({
        "address": account.address,
        "privateKey": "0x" + bytes(account.key).hex(),
    }))


def cmd_sign_message(args):
    account = resolve_account(args)
    message = read_message(args)
    # encode_defunct applies the EIP-191 personal_sign prefix, which is what
    # every EVM wallet signs and what the verifier rebuilds.
    signed = Account.sign_message(encode_defunct(text=message), private_key=account.key)
    print(json.dumps({
        "address": account.address,
        "message": message,
        "signature": "0x" + bytes(signed.signature).hex(),
    }))


def get_web3():
    w3 = Web3(Web3.HTTPProvider(NET["rpc"]))
    if not w3.is_connected():
        print(json.dumps({"error": f"Failed to connect to {NET['name']} RPC", "rpc": NET["rpc"]}))
        sys.exit(1)
    return w3


def token_address(asset):
    return NET["tokens"][asset]


def get_token_contract(w3, asset):
    return w3.eth.contract(address=Web3.to_checksum_address(token_address(asset)), abi=ERC20_ABI)


def resolve_address(args):
    if args.address:
        return Web3.to_checksum_address(args.address)
    return load_account().address


def cmd_wallet_address(args):
    acct = load_account()
    print(json.dumps({"address": acct.address}))


def cmd_eth_balance(args):
    w3 = get_web3()
    address = resolve_address(args)
    balance_wei = w3.eth.get_balance(address)
    print(json.dumps({
        "address": address,
        "wei": balance_wei,
        "eth": float(Web3.from_wei(balance_wei, "ether")),
    }))


def cmd_token_balance(asset):
    def run(args):
        w3 = get_web3()
        token = get_token_contract(w3, asset)
        address = resolve_address(args)
        raw = token.functions.balanceOf(address).call()
        print(json.dumps({
            "address": address,
            "asset": asset.upper(),
            "contract": token_address(asset),
            "raw": raw,
            "amount": raw / (10 ** TOKEN_DECIMALS),
            "ui_amount": f"{raw / (10 ** TOKEN_DECIMALS):.6f}",
        }))
    return run


def cmd_send_token(asset):
    def run(args):
        acct = load_account()
        w3 = get_web3()
        token = get_token_contract(w3, asset)
        recipient = Web3.to_checksum_address(args.to)
        amount = int(args.amount)

        nonce = w3.eth.get_transaction_count(acct.address)

        # maxFeePerGas must never fall below maxPriorityFeePerGas, or the node
        # rejects the tx outright. Deriving it from the block's base fee keeps
        # that true even when base fee is far below the priority tip, which is
        # routine on mainnet during quiet periods.
        priority_fee = w3.to_wei(NET["priority_fee_gwei"], "gwei")
        base_fee = w3.eth.get_block("latest").get("baseFeePerGas") or w3.eth.gas_price
        max_fee = base_fee * 2 + priority_fee

        tx = token.functions.transfer(recipient, amount).build_transaction({
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

        print(json.dumps({"status": "sent", "asset": asset.upper(), "tx_hash": tx_hash_hex, "message": "Waiting for confirmation..."}))

        for _ in range(90):
            time.sleep(2)
            try:
                receipt = w3.eth.get_transaction_receipt(tx_hash)
                if receipt is not None:
                    if receipt["status"] == 1:
                        print(json.dumps({"status": "confirmed", "asset": asset.upper(), "tx_hash": tx_hash_hex, "block": receipt["blockNumber"]}))
                        return
                    else:
                        print(json.dumps({"status": "failed", "asset": asset.upper(), "tx_hash": tx_hash_hex, "receipt_status": receipt["status"]}))
                        sys.exit(1)
            except Exception:
                pass

        print(json.dumps({"status": "timeout", "asset": asset.upper(), "tx_hash": tx_hash_hex, "message": "Transaction sent but confirmation timed out."}))
        sys.exit(1)
    return run


def main():
    global NET

    parser = argparse.ArgumentParser(description="Ethereum L1 helper for Grid USDC/USDT testing")
    parser.add_argument("--mainnet", action="store_true", help="Use Ethereum mainnet instead of Sepolia testnet")
    sub = parser.add_subparsers(dest="command")
    sub.required = True

    sub.add_parser("wallet-address", help="Print public address of loaded key")

    sign = sub.add_parser("sign-message", help="Sign a message with the wallet key")
    sign_src = sign.add_mutually_exclusive_group(required=True)
    sign_src.add_argument("--message", help="Exact message text to sign")
    sign_src.add_argument("--message-file", help="File whose contents are the message")
    sign.add_argument("--private-key", help="Sign with this hex key instead of the funded wallet")

    sub.add_parser("gen-keypair", help="Print a fresh throwaway keypair")

    eth_bal = sub.add_parser("eth-balance", help="Print ETH balance")
    eth_bal.add_argument("--address", help="Address to check (default: own wallet)")

    dispatch = {
        "wallet-address": cmd_wallet_address,
        "eth-balance": cmd_eth_balance,
        "sign-message": cmd_sign_message,
        "gen-keypair": cmd_gen_keypair,
    }

    for asset in ("usdc", "usdt"):
        upper = asset.upper()

        bal = sub.add_parser(f"{asset}-balance", help=f"Print {upper} balance")
        bal.add_argument("--address", help="Address to check (default: own wallet)")
        dispatch[f"{asset}-balance"] = cmd_token_balance(asset)

        send = sub.add_parser(f"send-{asset}", help=f"Send {upper}")
        send.add_argument("--to", required=True, help="Recipient address (0x...)")
        send.add_argument("--amount", required=True, help=f"Amount in micro-{upper} (6 decimals)")
        dispatch[f"send-{asset}"] = cmd_send_token(asset)

    args = parser.parse_args()
    NET = NETWORKS["mainnet"] if args.mainnet else NETWORKS["testnet"]

    dispatch[args.command](args)


if __name__ == "__main__":
    main()
