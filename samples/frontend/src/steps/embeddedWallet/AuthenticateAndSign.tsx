import { useState } from 'react'
import { Aes256Gcm, CipherSuite, DhkemP256HkdfSha256, HkdfSha256 } from '@hpke/core'
import { p256 } from '@noble/curves/nist.js'
import bs58check from 'bs58check'
import ResponsePanel from '../../components/ResponsePanel'
import { apiPost } from '../../lib/api'

interface Props {
  authMethodId: string | null
  payloadToSign: string | null
  onComplete: (response: { signature: string }) => void
  disabled: boolean
}

// Toggle between sandbox and production paths. Sandbox accepts magic values
// for the WebAuthn assertion signature ("sandbox-valid-passkey-signature")
// and the wallet signature header ("sandbox-valid-signature"); production
// runs the real WebAuthn assertion + HPKE decrypt + ECDSA sign chain.
//
// Set VITE_SANDBOX_PASSKEY=0 in .env to exercise the production path against
// a sandbox that supports real signatures, or against production credentials.
const SANDBOX_MODE = (import.meta.env.VITE_SANDBOX_PASSKEY ?? '1') !== '0'

const SANDBOX_PASSKEY_SIGNATURE = 'sandbox-valid-passkey-signature'
const SANDBOX_WALLET_SIGNATURE = 'sandbox-valid-signature'
const TURNKEY_HPKE_INFO = new TextEncoder().encode('turnkey_hpke')

// Step 7: Authenticate with the registered passkey and sign payloadToSign.
//
// Production flow:
//   1. Generate ephemeral P-256 client key pair (HPKE recipient key).
//   2. POST /challenge with clientPublicKey — Grid bakes it into the
//      session-creation payload and returns a Grid-issued WebAuthn challenge.
//   3. navigator.credentials.get(challenge) → WebAuthn assertion.
//   4. POST /verify with the assertion (no clientPublicKey on /verify) →
//      Grid returns encryptedSessionSigningKey sealed to clientPublicKey.
//   5. HPKE-decrypt the session signing key with the client private key
//      (DHKEM-P256 / HKDF-SHA256 / AES-256-GCM, base58check wire format).
//   6. Build a Turnkey API-key stamp over payloadToSign with the session key
//      and pass the base64url stamp to step 8 as Grid-Wallet-Signature.
//
// Sandbox flow (this is what runs by default):
//   - Step 3 still triggers the real OS biometric prompt.
//   - Step 4's wire signature is the magic value sandbox-valid-passkey-signature.
//   - Step 5 is skipped (the encryptedSessionSigningKey is a stub in sandbox).
//   - Step 6 returns the magic value sandbox-valid-signature for step 8.
export default function AuthenticateAndSign({
  authMethodId,
  payloadToSign,
  onComplete,
  disabled,
}: Props) {
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!authMethodId || !payloadToSign) return
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      // 1. Ephemeral keypair. Private key is non-extractable; only the public
      //    key leaves the device.
      const keyPair = (await crypto.subtle.generateKey(
        { name: 'ECDH', namedCurve: 'P-256' },
        false,
        ['deriveBits'],
      )) as CryptoKeyPair
      const rawPublicKey = new Uint8Array(
        await crypto.subtle.exportKey('raw', keyPair.publicKey),
      )
      const clientPublicKey = bytesToHex(rawPublicKey)

      // 2. Ask Grid for an authentication challenge sealed to this public key.
      const challenge = await apiPost<{ challenge: string; requestId: string }>(
        `/api/auth/credentials/${encodeURIComponent(authMethodId)}/challenge`,
        { clientPublicKey },
      )

      // 3. WebAuthn assertion against the Grid-issued challenge. The OS shows
      //    its biometric prompt regardless of whether we send the real
      //    signature or the sandbox magic value below.
      const assertion = (await navigator.credentials.get({
        publicKey: {
          challenge: new TextEncoder().encode(challenge.challenge),
          userVerification: 'required',
          timeout: 60_000,
        },
      })) as PublicKeyCredential | null
      if (!assertion) throw new Error('No assertion returned from authenticator')
      const ar = assertion.response as AuthenticatorAssertionResponse

      // 4. Verify with Grid. In sandbox, swap the real WebAuthn signature for
      //    the magic value Grid will accept.
      const wireSignature = SANDBOX_MODE
        ? SANDBOX_PASSKEY_SIGNATURE
        : bytesToBase64url(new Uint8Array(ar.signature))

      const verify = await apiPost<{ encryptedSessionSigningKey?: string }>(
        `/api/auth/credentials/${encodeURIComponent(authMethodId)}/verify`,
        {
          assertion: {
            credentialId: assertion.id,
            clientDataJson: bytesToBase64url(new Uint8Array(ar.clientDataJSON)),
            authenticatorData: bytesToBase64url(new Uint8Array(ar.authenticatorData)),
            signature: wireSignature,
            userHandle: ar.userHandle
              ? bytesToBase64url(new Uint8Array(ar.userHandle))
              : undefined,
          },
        },
        { 'Request-Id': challenge.requestId },
      )

      // 5 + 6. Decrypt the session signing key and sign payloadToSign. In
      //        sandbox the encryptedSessionSigningKey is a stub, so we skip
      //        the crypto and use the magic wallet-signature header value.
      let signature: string
      if (SANDBOX_MODE) {
        signature = SANDBOX_WALLET_SIGNATURE
      } else {
        const sessionKey = await decryptSessionSigningKey(
          keyPair.privateKey,
          rawPublicKey,
          verify.encryptedSessionSigningKey ?? '',
        )
        signature = signPayload(sessionKey, payloadToSign)
      }

      setResponse(
        JSON.stringify(
          { mode: SANDBOX_MODE ? 'sandbox' : 'production', signature, verify },
          null,
          2,
        ),
      )
      onComplete({ signature })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p className="text-sm text-gray-400 mb-2">
        Authenticate with the registered passkey and sign the withdrawal payload.
      </p>
      <p className="text-xs text-gray-500 mb-3">
        Generates a P-256 keypair, sends the public key on <code>/challenge</code>, runs the
        WebAuthn assertion, and verifies. In <strong>sandbox mode</strong> ({SANDBOX_MODE
          ? 'on'
          : 'off'}) the wire signatures use Grid's magic values; turn it off via{' '}
        <code>VITE_SANDBOX_PASSKEY=0</code> to exercise the real HPKE decrypt + ECDSA sign chain.
      </p>
      <button
        onClick={submit}
        disabled={disabled || loading || !authMethodId || !payloadToSign}
        className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded text-sm font-medium"
      >
        {loading ? 'Signing...' : 'Authenticate & Sign'}
      </button>
      <ResponsePanel response={response} error={error} />
    </div>
  )
}

// HPKE-decrypt the encrypted session signing key returned by /verify.
// Wire format (base58check-decoded): 33-byte compressed encapsulated public
// key || ciphertext || 16-byte AES-256-GCM auth tag.
async function decryptSessionSigningKey(
  recipientPrivateKey: CryptoKey,
  recipientPublicKey: Uint8Array,
  encryptedSessionSigningKey: string,
): Promise<Uint8Array> {
  if (!encryptedSessionSigningKey) throw new Error('No encrypted session signing key returned')
  const payload = bs58check.decode(encryptedSessionSigningKey)
  if (payload.length < 33 + 16) {
    throw new Error(`encryptedSessionSigningKey too short: ${payload.length} bytes`)
  }
  const compressedEnc = payload.slice(0, 33)
  const enc = p256.Point.fromHex(bytesToHex(compressedEnc)).toBytes(false)
  const ciphertext = payload.slice(33)
  const aad = concatBytes(enc, recipientPublicKey)
  const suite = new CipherSuite({
    kem: new DhkemP256HkdfSha256(),
    kdf: new HkdfSha256(),
    aead: new Aes256Gcm(),
  })
  const recipient = await suite.createRecipientContext({
    recipientKey: recipientPrivateKey,
    enc,
    info: TURNKEY_HPKE_INFO,
  })
  const plaintext = await recipient.open(ciphertext, aad)
  return new Uint8Array(plaintext)
}

// Build the Turnkey API-key stamp expected by Grid-Wallet-Signature.
function signPayload(sessionPrivateKey: Uint8Array, payloadToSign: string): string {
  const msg = new TextEncoder().encode(payloadToSign)
  const sig = p256.sign(msg, sessionPrivateKey, { format: 'der' })
  const stamp = JSON.stringify({
    publicKey: bytesToHex(p256.getPublicKey(sessionPrivateKey, true)),
    scheme: 'SIGNATURE_SCHEME_TK_API_P256',
    signature: bytesToHex(sig as Uint8Array),
  })
  return bytesToBase64url(new TextEncoder().encode(stamp))
}

function bytesToBase64url(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

function concatBytes(...chunks: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(chunks.reduce((len, chunk) => len + chunk.length, 0))
  let offset = 0
  for (const chunk of chunks) {
    out.set(chunk, offset)
    offset += chunk.length
  }
  return out
}
