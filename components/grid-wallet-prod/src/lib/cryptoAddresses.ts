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

/* ── Detection ─────────────────────────────────────────────────────────────────
   Which chains a PASTED address could belong to. Decodes with the same
   primitives used above rather than matching on shape alone, so a mistyped or
   truncated address is rejected instead of accepted and then failing at Grid.

   An EVM address is genuinely ambiguous — the same 20 bytes are valid on
   Ethereum and Base — so this returns a LIST and the caller asks which chain. */

function isEvmAddress(value: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(value);
}

function isSolanaAddress(value: string): boolean {
  try {
    return base58.decode(value).length === 32;
  } catch {
    return false;
  }
}

function isTronAddress(value: string): boolean {
  try {
    const bytes = tronBase58Check.decode(value);
    return bytes.length === 21 && bytes[0] === 0x41;
  } catch {
    return false;
  }
}

function isSparkAddress(value: string): boolean {
  try {
    const { prefix } = bech32m.decode(value as `${string}1${string}`, 200);
    // Mainnet is `spark`; the sandbox/regtest prefix is `sparkrt`.
    return prefix === 'spark' || prefix === 'sparkrt';
  } catch {
    return false;
  }
}

function isBtcAddress(value: string): boolean {
  try {
    const { prefix } = bech32.decode(value as `${string}1${string}`, 200);
    if (prefix === 'bc') return true;
  } catch {
    /* not bech32 — try legacy below */
  }
  try {
    const bytes = tronBase58Check.decode(value); // same base58check construction
    return bytes.length === 21 && (bytes[0] === 0x00 || bytes[0] === 0x05);
  } catch {
    return false;
  }
}

/**
 * Network ids (matching the wallet's chain list) a pasted address is valid for.
 * Empty means it isn't an address this wallet can pay. More than one means the
 * encoding can't tell the chains apart — ask the user.
 */
export function detectAddressNetworks(address: string): string[] {
  const value = address.trim();
  if (!value) return [];
  if (isEvmAddress(value)) return ['ethereum', 'base'];
  if (isTronAddress(value)) return ['tron'];
  if (isSparkAddress(value)) return ['spark'];
  if (isBtcAddress(value)) return ['btc'];
  if (isSolanaAddress(value)) return ['solana'];
  return [];
}
