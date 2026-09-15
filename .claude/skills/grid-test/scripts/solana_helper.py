#!/usr/bin/env python3
"""Solana CLI for Grid USDC testing.

Supports both devnet (default) and mainnet (--mainnet flag).

Subcommands:
  wallet-address              Print public key of loaded keypair
  sol-balance [--address]     Print SOL balance
  usdc-balance [--address]    Print USDC balance (raw + human-readable)
  send-usdc --to --amount     Send USDC (amount in micro-USDC)
  airdrop-sol [--amount]      Request devnet SOL airdrop (devnet only)
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path

try:
    import base58
    from solders.keypair import Keypair
    from solders.pubkey import Pubkey
    from solders.system_program import ID as SYS_PROGRAM_ID
    from solders.transaction import Transaction
    from solders.message import Message
    from solders.instruction import Instruction, AccountMeta
    from solders.hash import Hash
    from solana.rpc.api import Client
    from solana.rpc.commitment import Confirmed, Finalized
    from solana.rpc.types import TxOpts
    import struct
except ImportError as e:
    print(json.dumps({"error": "Missing dependencies. Install with: pip3 install solders solana base58", "detail": str(e)}))
    sys.exit(1)

NETWORKS = {
    "devnet": {
        "rpc": "https://api.devnet.solana.com",
        "usdc_mint": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
        "cred_key": "solanaDevnetPrivateKey",
    },
    "mainnet": {
        "rpc": "https://api.mainnet-beta.solana.com",
        "usdc_mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "cred_key": "solanaMainnetPrivateKey",
    },
}

TOKEN_PROGRAM_ID = Pubkey.from_string("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
ASSOCIATED_TOKEN_PROGRAM_ID = Pubkey.from_string("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
USDC_DECIMALS = 6

NET = None  # set in main()


def load_keypair(creds_path=None):
    creds_path = creds_path or os.path.expanduser("~/.grid-credentials")
    with open(creds_path) as f:
        creds = json.load(f)
    secret_key = creds.get(NET["cred_key"])
    if not secret_key:
        print(json.dumps({"error": f"{NET['cred_key']} not found in ~/.grid-credentials"}))
        sys.exit(1)
    raw = base58.b58decode(secret_key)
    if len(raw) == 32:
        return Keypair.from_seed(raw)
    return Keypair.from_bytes(raw)


def get_client():
    return Client(NET["rpc"])


def get_ata(owner, mint):
    seeds = [bytes(owner), bytes(TOKEN_PROGRAM_ID), bytes(mint)]
    ata, _bump = Pubkey.find_program_address(seeds, ASSOCIATED_TOKEN_PROGRAM_ID)
    return ata


def get_token_balance(client, address, mint_str):
    mint = Pubkey.from_string(mint_str)
    ata = get_ata(address, mint)
    try:
        resp = client.get_token_account_balance(ata)
    except Exception:
        return 0, "0"
    if resp.value is None:
        return 0, "0"
    return int(resp.value.amount), resp.value.ui_amount_string


def cmd_wallet_address(args):
    kp = load_keypair()
    print(json.dumps({"address": str(kp.pubkey())}))


def cmd_sol_balance(args):
    client = get_client()
    if args.address:
        pubkey = Pubkey.from_string(args.address)
    else:
        kp = load_keypair()
        pubkey = kp.pubkey()
    resp = client.get_balance(pubkey, commitment=Confirmed)
    lamports = resp.value
    print(json.dumps({
        "address": str(pubkey),
        "lamports": lamports,
        "sol": lamports / 1e9
    }))


def cmd_usdc_balance(args):
    client = get_client()
    mint_str = args.mint or NET["usdc_mint"]
    if args.address:
        pubkey = Pubkey.from_string(args.address)
    else:
        kp = load_keypair()
        pubkey = kp.pubkey()
    raw_amount, ui_amount = get_token_balance(client, pubkey, mint_str)
    print(json.dumps({
        "address": str(pubkey),
        "mint": mint_str,
        "raw": raw_amount,
        "amount": raw_amount / (10 ** USDC_DECIMALS),
        "ui_amount": ui_amount
    }))


def cmd_send_usdc(args):
    kp = load_keypair()
    client = get_client()
    mint_str = args.mint or NET["usdc_mint"]
    mint = Pubkey.from_string(mint_str)
    recipient = Pubkey.from_string(args.to)
    amount = int(args.amount)

    sender_ata = get_ata(kp.pubkey(), mint)
    recipient_ata = get_ata(recipient, mint)

    instructions = []

    recipient_ata_info = client.get_account_info(recipient_ata)
    if recipient_ata_info.value is None:
        create_ata_ix = Instruction(
            program_id=ASSOCIATED_TOKEN_PROGRAM_ID,
            accounts=[
                AccountMeta(pubkey=kp.pubkey(), is_signer=True, is_writable=True),
                AccountMeta(pubkey=recipient_ata, is_signer=False, is_writable=True),
                AccountMeta(pubkey=recipient, is_signer=False, is_writable=False),
                AccountMeta(pubkey=mint, is_signer=False, is_writable=False),
                AccountMeta(pubkey=SYS_PROGRAM_ID, is_signer=False, is_writable=False),
                AccountMeta(pubkey=TOKEN_PROGRAM_ID, is_signer=False, is_writable=False),
            ],
            data=bytes(),
        )
        instructions.append(create_ata_ix)

    transfer_data = bytearray([12])
    transfer_data.extend(struct.pack("<Q", amount))
    transfer_data.append(USDC_DECIMALS)

    transfer_ix = Instruction(
        program_id=TOKEN_PROGRAM_ID,
        accounts=[
            AccountMeta(pubkey=sender_ata, is_signer=False, is_writable=True),
            AccountMeta(pubkey=mint, is_signer=False, is_writable=False),
            AccountMeta(pubkey=recipient_ata, is_signer=False, is_writable=True),
            AccountMeta(pubkey=kp.pubkey(), is_signer=True, is_writable=False),
        ],
        data=bytes(transfer_data),
    )
    instructions.append(transfer_ix)

    recent_blockhash_resp = client.get_latest_blockhash(commitment=Confirmed)
    blockhash = recent_blockhash_resp.value.blockhash

    msg = Message.new_with_blockhash(instructions, kp.pubkey(), blockhash)
    tx = Transaction.new_unsigned(msg)
    tx.sign([kp], blockhash)

    resp = client.send_transaction(tx, opts=TxOpts(skip_preflight=False, preflight_commitment=Confirmed))
    sig = str(resp.value)

    print(json.dumps({"status": "sent", "signature": sig, "message": "Waiting for confirmation..."}))

    for _ in range(30):
        time.sleep(2)
        status_resp = client.get_signature_statuses([resp.value])
        if status_resp.value and status_resp.value[0] is not None:
            stat = status_resp.value[0]
            if stat.err is not None:
                print(json.dumps({"status": "failed", "signature": sig, "error": str(stat.err)}))
                sys.exit(1)
            if stat.confirmation_status is not None:
                conf = str(stat.confirmation_status)
                if conf in ("confirmed", "finalized", "TransactionConfirmationStatus.Confirmed", "TransactionConfirmationStatus.Finalized"):
                    print(json.dumps({"status": "confirmed", "signature": sig, "confirmation": conf}))
                    return

    print(json.dumps({"status": "timeout", "signature": sig, "message": "Transaction sent but confirmation timed out. Check explorer."}))
    sys.exit(1)


def cmd_airdrop_sol(args):
    if NET is NETWORKS["mainnet"]:
        print(json.dumps({"error": "Airdrop is only available on devnet"}))
        sys.exit(1)
    kp = load_keypair()
    client = get_client()
    lamports = int(args.amount)
    try:
        resp = client.request_airdrop(kp.pubkey(), lamports, commitment=Confirmed)
    except Exception as e:
        print(json.dumps({"status": "error", "error": str(e), "message": "Airdrop request failed. Devnet faucet may be rate-limited. Try again later or use a smaller amount."}))
        sys.exit(1)
    sig = str(resp.value)
    print(json.dumps({"status": "requested", "signature": sig, "lamports": lamports}))

    for _ in range(15):
        time.sleep(2)
        status_resp = client.get_signature_statuses([resp.value])
        if status_resp.value and status_resp.value[0] is not None:
            stat = status_resp.value[0]
            if stat.confirmation_status is not None:
                conf = str(stat.confirmation_status)
                if conf in ("confirmed", "finalized", "TransactionConfirmationStatus.Confirmed", "TransactionConfirmationStatus.Finalized"):
                    print(json.dumps({"status": "confirmed", "signature": sig}))
                    return

    print(json.dumps({"status": "timeout", "signature": sig, "message": "Airdrop requested but confirmation timed out."}))


def main():
    global NET

    parser = argparse.ArgumentParser(description="Solana helper for Grid USDC testing")
    parser.add_argument("--mainnet", action="store_true", help="Use mainnet instead of devnet")
    sub = parser.add_subparsers(dest="command")
    sub.required = True

    sub.add_parser("wallet-address", help="Print public key of loaded keypair")

    sol_bal = sub.add_parser("sol-balance", help="Print SOL balance")
    sol_bal.add_argument("--address", help="Address to check (default: own wallet)")

    usdc_bal = sub.add_parser("usdc-balance", help="Print USDC balance")
    usdc_bal.add_argument("--address", help="Address to check (default: own wallet)")
    usdc_bal.add_argument("--mint", help="Token mint address (default: network USDC)")

    send = sub.add_parser("send-usdc", help="Send USDC")
    send.add_argument("--to", required=True, help="Recipient address")
    send.add_argument("--amount", required=True, help="Amount in micro-USDC (6 decimals)")
    send.add_argument("--mint", help="Token mint address (default: network USDC)")

    airdrop = sub.add_parser("airdrop-sol", help="Request devnet SOL airdrop")
    airdrop.add_argument("--amount", default="1000000000", help="Lamports to request (default: 1 SOL = 1000000000)")

    args = parser.parse_args()
    NET = NETWORKS["mainnet"] if args.mainnet else NETWORKS["devnet"]

    dispatch = {
        "wallet-address": cmd_wallet_address,
        "sol-balance": cmd_sol_balance,
        "usdc-balance": cmd_usdc_balance,
        "send-usdc": cmd_send_usdc,
        "airdrop-sol": cmd_airdrop_sol,
    }
    dispatch[args.command](args)


if __name__ == "__main__":
    main()
