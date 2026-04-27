#!/usr/bin/env python3
"""Embedded Wallet client-side crypto helper for Grid testing.

Implements the cryptographic operations a real Embedded Wallet client device
performs, so tests can drive the auth + signing flow from the command line:

  - HPKE (RFC 9180, DHKEM-P256/HKDF-SHA256/AES-256-GCM) decrypt of the
    encryptedSessionSigningKey returned by POST /auth/credentials/{id}/verify.
  - ECDSA-P256-SHA256 DER+base64 signing of `payloadToSign` strings (the
    Grid-Wallet-Signature header value).

Subcommands:
  generate-client-keypair   Generate a fresh P-256 client key pair. Writes the
                            private key PEM to <out>/client_private.pem and
                            prints {public_key_hex, private_key_path}.
  decrypt-session-key       Decrypt encryptedSessionSigningKey (base58check,
                            HPKE-Base / DHKEM-P256-HKDF-SHA256 / AES-256-GCM).
                            Writes the 32-byte P-256 scalar to <out>/session_signing_key.bin
                            and prints {session_key_path}.
  sign-payload              Sign payloadToSign byte-for-byte with the session
                            signing key. Prints {signature} (base64 DER ECDSA).
"""

import argparse
import base64
import json
import os
import sys

try:
    import base58
    from cryptography.hazmat.backends import default_backend
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import ec
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    from cryptography.hazmat.primitives.hmac import HMAC
    from cryptography.hazmat.primitives.kdf.hkdf import HKDFExpand
except ImportError as e:
    print(json.dumps({
        "error": "Missing dependencies. Install with: pip3 install cryptography base58",
        "detail": str(e),
    }))
    sys.exit(1)

# HPKE suite identifiers (RFC 9180). Per the Grid docs and JS SDK example
# (`@hpke/dhkem-p256` → DHKEM(P-256, HKDF-SHA256), KEM_ID 0x0010), the curve
# should be P-256. In practice, the encryptedSessionSigningKey wire format
# returned by the dev API does not validate as a P-256 compressed point —
# this is a known Grid server bug; see references/test-catalog.md.
# `--curve` and `--kem-id` flags allow overriding per attempt.
DEFAULT_CURVE = "secp256r1"
DEFAULT_KEM_ID_HEX = "0010"
KDF_ID_HEX = "0001"   # HKDF-SHA256
AEAD_ID_HEX = "0002"  # AES-256-GCM

# AES-256-GCM constants
AEAD_KEY_LEN = 32
AEAD_NONCE_LEN = 12

KEM_SECRET_LEN = 32  # both P-256 and secp256k1 produce 32-byte shared secrets


def get_curve(name: str):
    return {
        "secp256k1": ec.SECP256K1(),
        "secp256r1": ec.SECP256R1(),
        "p-256": ec.SECP256R1(),
        "p256": ec.SECP256R1(),
    }[name.lower()]


def make_suite_ids(kem_id_hex: str):
    kem_suite_id = b"KEM" + bytes.fromhex(kem_id_hex)
    hpke_suite_id = (
        b"HPKE"
        + bytes.fromhex(kem_id_hex)
        + bytes.fromhex(KDF_ID_HEX)
        + bytes.fromhex(AEAD_ID_HEX)
    )
    return kem_suite_id, hpke_suite_id


def hkdf_extract(salt: bytes, ikm: bytes) -> bytes:
    h = HMAC(salt, hashes.SHA256(), backend=default_backend())
    h.update(ikm)
    return h.finalize()


def hkdf_expand(prk: bytes, info: bytes, length: int) -> bytes:
    return HKDFExpand(
        algorithm=hashes.SHA256(),
        length=length,
        info=info,
        backend=default_backend(),
    ).derive(prk)


def labeled_extract(salt: bytes, label: bytes, ikm: bytes, suite_id: bytes) -> bytes:
    return hkdf_extract(salt, b"HPKE-v1" + suite_id + label + ikm)


def labeled_expand(prk: bytes, label: bytes, info: bytes, length: int, suite_id: bytes) -> bytes:
    labeled_info = length.to_bytes(2, "big") + b"HPKE-v1" + suite_id + label + info
    return hkdf_expand(prk, labeled_info, length)


def deserialize_public_key(data: bytes, curve):
    return ec.EllipticCurvePublicKey.from_encoded_point(curve, data)


def serialize_public_key_compressed(pk) -> bytes:
    return pk.public_bytes(
        encoding=serialization.Encoding.X962,
        format=serialization.PublicFormat.CompressedPoint,
    )


def dhkem_decap(enc: bytes, sk, curve, kem_suite_id: bytes) -> bytes:
    """DHKEM decapsulation. Returns the 32-byte shared secret."""
    pk_e = deserialize_public_key(enc, curve)
    dh = sk.exchange(ec.ECDH(), pk_e)
    pk_r_compressed = serialize_public_key_compressed(sk.public_key())
    kem_context = enc + pk_r_compressed
    eae_prk = labeled_extract(b"", b"eae_prk", dh, kem_suite_id)
    shared_secret = labeled_expand(eae_prk, b"shared_secret", kem_context, KEM_SECRET_LEN, kem_suite_id)
    return shared_secret


def hpke_key_schedule_base(shared_secret: bytes, hpke_suite_id: bytes, info: bytes = b""):
    """HPKE Base mode key schedule. Returns (key, base_nonce)."""
    psk_id_hash = labeled_extract(b"", b"psk_id_hash", b"", hpke_suite_id)
    info_hash = labeled_extract(b"", b"info_hash", info, hpke_suite_id)
    key_schedule_context = bytes([0x00]) + psk_id_hash + info_hash  # mode_base = 0x00
    secret = labeled_extract(shared_secret, b"secret", b"", hpke_suite_id)
    key = labeled_expand(secret, b"key", key_schedule_context, AEAD_KEY_LEN, hpke_suite_id)
    base_nonce = labeled_expand(secret, b"base_nonce", key_schedule_context, AEAD_NONCE_LEN, hpke_suite_id)
    return key, base_nonce


def hpke_open_base(enc: bytes, sk, ciphertext: bytes, curve, kem_id_hex: str,
                   info: bytes = b"", aad: bytes = b"") -> bytes:
    """HPKE Base mode open. Decrypts a single message (seq=0)."""
    kem_suite_id, hpke_suite_id = make_suite_ids(kem_id_hex)
    shared_secret = dhkem_decap(enc, sk, curve, kem_suite_id)
    key, base_nonce = hpke_key_schedule_base(shared_secret, hpke_suite_id, info)
    return AESGCM(key).decrypt(base_nonce, ciphertext, aad)


def cmd_generate_client_keypair(args):
    curve = get_curve(args.curve)
    sk = ec.generate_private_key(curve, default_backend())
    pk_uncompressed = sk.public_key().public_bytes(
        encoding=serialization.Encoding.X962,
        format=serialization.PublicFormat.UncompressedPoint,
    )
    sk_pem = sk.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode("utf-8")

    os.makedirs(args.output_dir, exist_ok=True)
    sk_path = os.path.join(args.output_dir, "client_private.pem")
    with open(sk_path, "w") as f:
        f.write(sk_pem)
    os.chmod(sk_path, 0o600)
    print(json.dumps({
        "public_key_hex": pk_uncompressed.hex(),
        "private_key_path": sk_path,
        "curve": args.curve,
    }))


def cmd_decrypt_session_key(args):
    curve = get_curve(args.curve)
    with open(args.private_key_path, "rb") as f:
        sk = serialization.load_pem_private_key(f.read(), password=None, backend=default_backend())

    try:
        payload = base58.b58decode_check(args.encrypted_key)
    except ValueError as e:
        print(json.dumps({"error": "base58check decode failed", "detail": str(e)}))
        sys.exit(1)

    if len(payload) <= 33 + 16:
        print(json.dumps({"error": f"payload too short: {len(payload)} bytes"}))
        sys.exit(1)

    enc = payload[:33]
    ciphertext = payload[33:]

    try:
        plaintext = hpke_open_base(enc, sk, ciphertext, curve, args.kem_id)
    except Exception as e:
        print(json.dumps({"error": "HPKE open failed", "detail": str(e)}))
        sys.exit(1)

    if len(plaintext) != 32:
        print(json.dumps({"error": f"unexpected session key length: {len(plaintext)}"}))
        sys.exit(1)

    os.makedirs(args.output_dir, exist_ok=True)
    session_path = os.path.join(args.output_dir, "session_signing_key.bin")
    with open(session_path, "wb") as f:
        f.write(plaintext)
    os.chmod(session_path, 0o600)
    print(json.dumps({"session_key_path": session_path, "length": 32}))


def cmd_decrypt_debug(args):
    """Try multiple KEM_IDs to find which one Grid uses. Useful for diagnosing
    HPKE open failures when the curve is correct but the suite_id is unknown."""
    curve = get_curve(args.curve)
    with open(args.private_key_path, "rb") as f:
        sk = serialization.load_pem_private_key(f.read(), password=None, backend=default_backend())

    try:
        payload = base58.b58decode_check(args.encrypted_key)
    except ValueError as e:
        print(json.dumps({"error": "base58check decode failed", "detail": str(e)}))
        sys.exit(1)

    enc = payload[:33]
    ciphertext = payload[33:]

    candidates = args.kem_ids.split(",") if args.kem_ids else [
        "0010", "0011", "0012", "0013", "0014", "0015", "0016",
        "0020", "0021", "0030", "0031",
        "FE10", "FE11", "FE12", "FE13", "FE16",
        "FF00", "FFFF",
    ]

    results = []
    for kem_id in candidates:
        try:
            plaintext = hpke_open_base(enc, sk, ciphertext, curve, kem_id)
            results.append({"kem_id": kem_id, "success": True, "plaintext_hex": plaintext.hex()})
            break
        except Exception as e:
            results.append({"kem_id": kem_id, "success": False, "error": str(e)[:80]})

    print(json.dumps({"results": results}, indent=2))


def cmd_sign_payload(args):
    curve = get_curve(args.curve)
    with open(args.session_key_path, "rb") as f:
        scalar_bytes = f.read()

    if len(scalar_bytes) != 32:
        print(json.dumps({"error": f"invalid session key length: {len(scalar_bytes)}"}))
        sys.exit(1)

    sk = ec.derive_private_key(int.from_bytes(scalar_bytes, "big"), curve, default_backend())

    if args.payload_file:
        with open(args.payload_file, "rb") as f:
            payload_bytes = f.read()
    elif args.payload is not None:
        payload_bytes = args.payload.encode("utf-8")
    else:
        print(json.dumps({"error": "must provide --payload or --payload-file"}))
        sys.exit(1)

    signature_der = sk.sign(payload_bytes, ec.ECDSA(hashes.SHA256()))
    print(json.dumps({"signature": base64.b64encode(signature_der).decode("ascii")}))


def main():
    parser = argparse.ArgumentParser(description="Embedded Wallet client crypto helper")
    sub = parser.add_subparsers(dest="command")
    sub.required = True

    p1 = sub.add_parser("generate-client-keypair", help="Generate ECC client key pair")
    p1.add_argument("--output-dir", required=True, help="Directory to write client_private.pem")
    p1.add_argument("--curve", default=DEFAULT_CURVE, help="Curve name (secp256k1, secp256r1)")

    p2 = sub.add_parser("decrypt-session-key", help="Decrypt encryptedSessionSigningKey")
    p2.add_argument("--encrypted-key", required=True, help="encryptedSessionSigningKey (base58check)")
    p2.add_argument("--private-key-path", required=True, help="Path to client private key PEM")
    p2.add_argument("--output-dir", required=True, help="Directory to write session_signing_key.bin")
    p2.add_argument("--curve", default=DEFAULT_CURVE)
    p2.add_argument("--kem-id", default=DEFAULT_KEM_ID_HEX, help="HPKE KEM ID hex (default 0013)")

    p2b = sub.add_parser("decrypt-debug", help="Try multiple KEM IDs to find Grid's HPKE suite")
    p2b.add_argument("--encrypted-key", required=True)
    p2b.add_argument("--private-key-path", required=True)
    p2b.add_argument("--curve", default=DEFAULT_CURVE)
    p2b.add_argument("--kem-ids", default="", help="Comma-separated hex KEM IDs to try")

    p3 = sub.add_parser("sign-payload", help="Sign payloadToSign with session signing key")
    p3.add_argument("--payload", help="payloadToSign string (sign UTF-8 bytes byte-for-byte)")
    p3.add_argument("--payload-file", help="File containing the raw payloadToSign bytes")
    p3.add_argument("--session-key-path", required=True, help="Path to 32-byte session signing key")
    p3.add_argument("--curve", default=DEFAULT_CURVE)

    args = parser.parse_args()
    {
        "generate-client-keypair": cmd_generate_client_keypair,
        "decrypt-session-key": cmd_decrypt_session_key,
        "decrypt-debug": cmd_decrypt_debug,
        "sign-payload": cmd_sign_payload,
    }[args.command](args)


if __name__ == "__main__":
    main()
