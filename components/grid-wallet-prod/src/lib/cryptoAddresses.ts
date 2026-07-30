/* ============================================================
   Real, validator-passing crypto addresses for the wallet demo.
   Each chain uses its actual encoding so a copied address survives a
   paste into a real wallet: on-curve keys (Solana ed25519, Spark
   secp256k1) and valid checksums (EVM EIP-55, Tron base58check,
   Bitcoin / Spark bech32(m)). The keys are random throwaways — no
   funds, no real owners; nothing is ever broadcast.
   ============================================================ */

import { ed25519 } from '@noble/curves/ed25519.js';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { keccak_256 } from '@noble/hashes/sha3.js';
import { base58, base58check, bech32, bech32m } from '@scure/base';

const tronBase58Check = base58check(sha256);

function randomBytes(n: number): Uint8Array {
  const out = new Uint8Array(n);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(out);
  else for (let i = 0; i < n; i++) out[i] = Math.floor(Math.random() * 256);
  return out;
}

function toHex(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += bytes[i].toString(16).padStart(2, '0');
  return s;
}

/** Prefix `bytes` with `head` without spreading a typed array (target-safe). */
function withHead(head: number[], bytes: Uint8Array): Uint8Array {
  const out = new Uint8Array(head.length + bytes.length);
  out.set(head, 0);
  out.set(bytes, head.length);
  return out;
}

/** Real on-curve Solana address — base58 of an ed25519 public key (32 bytes). */
export function randomSolanaAddress(): string {
  return base58.encode(ed25519.getPublicKey(ed25519.utils.randomSecretKey()));
}

/** EIP-55 checksummed EVM address (Ethereum / Base): keccak of the lowercase hex
 *  decides each letter's case. */
function randomEvmAddress(): string {
  const hex = toHex(randomBytes(20));
  const hash = toHex(keccak_256(new TextEncoder().encode(hex)));
  let out = '';
  for (let i = 0; i < 40; i++) {
    out += Number.parseInt(hash[i], 16) >= 8 ? hex[i].toUpperCase() : hex[i];
  }
  return `0x${out}`;
}

/** Tron base58check address (0x41 version byte + 20-byte payload + checksum). */
function randomTronAddress(): string {
  return tronBase58Check.encode(withHead([0x41], randomBytes(20)));
}

/** Bitcoin native SegWit address (bech32, P2WPKH v0). */
function randomBtcAddress(): string {
  return bech32.encode('bc', [0, ...bech32.toWords(randomBytes(20))]);
}

/** Spark address — bech32m of a protobuf-wrapped 33-byte compressed secp256k1
 *  pubkey (field tag 0x0a, length 0x21), per the Spark addressing spec. */
function randomSparkAddress(): string {
  const pubkey = secp256k1.getPublicKey(secp256k1.utils.randomSecretKey(), true);
  return bech32m.encode('spark', bech32m.toWords(withHead([0x0a, 0x21], pubkey)));
}

/** A valid random address on the given network — used for the demo's pasted
 *  recipient and the "received from" sender shown in activity. */
export function randomNetworkAddress(network: string): string {
  switch (network) {
    case 'Ethereum':
    case 'Base':
      return randomEvmAddress();
    case 'Tron':
      return randomTronAddress();
    case 'Bitcoin':
      return randomBtcAddress();
    case 'Spark':
      return randomSparkAddress();
    default:
      return randomSolanaAddress(); // Solana
  }
}
