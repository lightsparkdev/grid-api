#!/usr/bin/env node
/**
 * Embedded-wallet signing helpers for the Grid offramp flow.
 *
 * Four primitives that aren't expressible in plain curl. Everything else
 * (create customer, on-ramp quote, register OTP, offramp quote, execute)
 * is a regular HTTP call — see scripts/README.md for the full walkthrough.
 *
 * Subcommands:
 *
 *   gen-keypair
 *       Generate an ephemeral P-256 keypair (TEK). Prints JSON with `pubHex`
 *       and `privHex`. The public key is encrypted inside the OTP bundle
 *       for EMAIL_OTP verification; the private key becomes the session
 *       signing key after successful verify.
 *
 *   encrypt-otp <otpEncryptionTargetBundle> <pubHex> <otpCode>
 *       HPKE-encrypt `{otp_code, public_key}` under the target bundle
 *       returned by `POST /auth/credentials/{id}/challenge`. Prints the
 *       `encryptedOtpBundle` JSON to pass on
 *       `POST /auth/credentials/{id}/verify`.
 *
 *   decrypt-bundle <bundle> <privHex>
 *       HPKE-open the `encryptedSessionSigningKey` returned by PASSKEY/OAUTH
 *       `POST /auth/credentials/{id}/verify`. (EMAIL_OTP does not return
 *       this field — the TEK private key IS the session signing key.)
 *       Prints the session API private key as hex.
 *
 *   stamp <sessionPrivHex> <payload>
 *       Build a Turnkey API stamp over a `payloadToSign`. Prints the value
 *       to drop into the `Grid-Wallet-Signature` header on
 *       `POST /quotes/{id}/execute` or EMAIL_OTP verify signed retry.
 *
 * For long arguments, pass `-` to read from stdin:
 *
 *   cat bundle.txt | embedded-wallet-sign decrypt-bundle - $PRIV_HEX
 */

"use strict";

const { generateKeyPairSync, createPublicKey } = require("node:crypto");
const { decryptCredentialBundle, hpkeEncrypt, formatHpkeBuf } = require("@turnkey/crypto");
const { ApiKeyStamper } = require("@turnkey/api-key-stamper");

function readArg(value) {
  if (value !== "-") return value;
  return require("node:fs").readFileSync(0, "utf8").trim();
}

function jwkB64ToHex(b64url) {
  return Buffer.from(b64url, "base64url").toString("hex");
}

function genKeypair() {
  const { publicKey, privateKey } = generateKeyPairSync("ec", {
    namedCurve: "prime256v1",
  });
  const privJwk = privateKey.export({ format: "jwk" });
  const pubJwk = publicKey.export({ format: "jwk" });
  // Uncompressed SEC1: 0x04 || X || Y
  const pubHex =
    "04" + jwkB64ToHex(pubJwk.x) + jwkB64ToHex(pubJwk.y);
  const privHex = jwkB64ToHex(privJwk.d);
  return { pubHex, privHex };
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function encryptOtp(otpEncryptionTargetBundle, pubHex, otpCode) {
  // Extract targetPublic from the signed bundle
  const { data } = JSON.parse(otpEncryptionTargetBundle);
  const dataJson = Buffer.from(data, "hex").toString("utf8");
  const { targetPublic } = JSON.parse(dataJson);

  // HPKE-encrypt {otp_code, public_key} to the target
  const plainText = JSON.stringify({ otp_code: otpCode, public_key: pubHex });
  const plainTextBuf = Buffer.from(plainText, "utf8");
  const targetKeyBuf = hexToBytes(targetPublic);

  const encryptedBuf = hpkeEncrypt({ plainTextBuf, targetKeyBuf });
  return formatHpkeBuf(encryptedBuf);
}

function privHexToCompressedPubHex(privHex) {
  // Build a JWK from the private key, then re-derive the public point in
  // compressed SEC1 form (the format the Turnkey stamp expects).
  const dB64 = Buffer.from(privHex, "hex").toString("base64url");
  // We need x/y to construct a JWK key object, but we only have d.
  // Use noble curves transitively from @turnkey/crypto.
  const { p256 } = require("@noble/curves/p256");
  const compressed = p256.getPublicKey(privHex, true); // Uint8Array
  return Buffer.from(compressed).toString("hex");
}

async function main() {
  const [, , cmd, ...rest] = process.argv;
  switch (cmd) {
    case "gen-keypair": {
      const out = genKeypair();
      process.stdout.write(JSON.stringify(out, null, 2) + "\n");
      return;
    }
    case "encrypt-otp": {
      const [targetArg, pubArg, otpArg] = rest;
      if (!targetArg || !pubArg || !otpArg) usage(1);
      const targetBundle = readArg(targetArg);
      const pubHex = readArg(pubArg);
      const otpCode = readArg(otpArg);
      const encBundle = encryptOtp(targetBundle, pubHex, otpCode);
      process.stdout.write(JSON.stringify(encBundle) + "\n");
      return;
    }
    case "decrypt-bundle": {
      const [bundleArg, privArg] = rest;
      if (!bundleArg || !privArg) usage(1);
      const bundle = readArg(bundleArg);
      const privHex = readArg(privArg);
      const sessionPrivHex = await decryptCredentialBundle(bundle, privHex);
      process.stdout.write(sessionPrivHex + "\n");
      return;
    }
    case "stamp": {
      const [sessArg, payloadArg] = rest;
      if (!sessArg || !payloadArg) usage(1);
      const sessionPrivHex = readArg(sessArg);
      const payload = readArg(payloadArg);
      const sessionPubHex = privHexToCompressedPubHex(sessionPrivHex);
      const stamper = new ApiKeyStamper({
        apiPublicKey: sessionPubHex,
        apiPrivateKey: sessionPrivHex,
      });
      const { stampHeaderValue } = await stamper.stamp(payload);
      process.stdout.write(stampHeaderValue + "\n");
      return;
    }
    case "--help":
    case "-h":
    case undefined:
      usage(0);
      return;
    default:
      console.error(`Unknown command: ${cmd}`);
      usage(1);
  }
}

function usage(code) {
  const msg = [
    "embedded-wallet-sign — signing helpers for the Grid offramp flow",
    "",
    "Subcommands:",
    "  gen-keypair                                       Generate ephemeral P-256 keypair (TEK)",
    "  encrypt-otp <targetBundle> <pubHex> <otpCode>     HPKE-encrypt OTP for EMAIL_OTP verify",
    "  decrypt-bundle <bundle> <privHex>                 HPKE-open the session signing key (PASSKEY/OAUTH)",
    "  stamp <sessionPrivHex> <payload>                  Build a Grid-Wallet-Signature stamp",
    "",
    "Use - in place of any argument to read it from stdin.",
  ].join("\n");
  (code === 0 ? process.stdout : process.stderr).write(msg + "\n");
  process.exit(code);
}

main().catch((err) => {
  console.error(err.stack || String(err));
  process.exit(1);
});
