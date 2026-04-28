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

const SANDBOX_SIGNATURE = 'sandbox-valid-signature'

// Step 7: Authenticate with the registered passkey and sign payloadToSign.
//   1. Generate ephemeral P-256 client key pair (for HPKE recipient).
//   2. POST /challenge with clientPublicKey — Grid bakes it into the session
//      creation payload and returns a Grid-issued WebAuthn challenge.
//   3. navigator.credentials.get(challenge) → WebAuthn assertion.
//   4. POST /verify with the assertion (no clientPublicKey on /verify) →
//      Grid returns encryptedSessionSigningKey sealed to clientPublicKey.
//   5. HPKE-decrypt the session signing key with the client private key.
//      DHKEM(P-256, HKDF-SHA256) + HKDF-SHA256 + AES-256-GCM, base58check
//      wire format with a 33-byte compressed encapsulated key prefix.
//   6. ECDSA-sign payloadToSign bytes with the session key, DER-encode.
//   In sandbox the encryptedSessionSigningKey is a stub — decrypt fails, so
//   we fall back to the sandbox magic 'sandbox-valid-signature'.
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
      const keyPair = (await crypto.subtle.generateKey(
        { name: 'ECDH', namedCurve: 'P-256' },
        false,
        ['deriveBits'],
      )) as CryptoKeyPair
      const rawPublicKey = new Uint8Array(
        await crypto.subtle.exportKey('raw', keyPair.publicKey),
      )
      const clientPublicKey = bytesToHex(rawPublicKey)

      const challenge = await apiPost<{ challenge: string; requestId: string }>(
        `/api/auth/credentials/${encodeURIComponent(authMethodId)}/challenge`,
        { clientPublicKey },
      )

      const assertion = (await navigator.credentials.get({
        publicKey: {
          challenge: base64urlToBytes(challenge.challenge),
          userVerification: 'required',
          timeout: 60_000,
        },
      })) as PublicKeyCredential | null
      if (!assertion) throw new Error('No assertion returned from authenticator')
      const ar = assertion.response as AuthenticatorAssertionResponse

      // Sandbox doesn't validate real WebAuthn signatures yet — it only accepts
      // the literal "sandbox-valid-passkey-signature". The OS biometric prompt
      // still runs above; we just substitute the signature on the wire.
      // Production: replace with bytesToBase64url(new Uint8Array(ar.signature)).
      const verify = await apiPost<{ encryptedSessionSigningKey?: string }>(
        `/api/auth/credentials/${encodeURIComponent(authMethodId)}/verify`,
        {
          assertion: {
            credentialId: assertion.id,
            clientDataJson: bytesToBase64url(new Uint8Array(ar.clientDataJSON)),
            authenticatorData: bytesToBase64url(new Uint8Array(ar.authenticatorData)),
            signature: 'sandbox-valid-passkey-signature',
            userHandle: ar.userHandle
              ? bytesToBase64url(new Uint8Array(ar.userHandle))
              : undefined,
          },
        },
        { 'Request-Id': challenge.requestId },
      )

      let signature: string
      let mode: 'production' | 'sandbox-fallback' = 'production'
      try {
        const sessionKey = await decryptSessionSigningKey(
          keyPair.privateKey,
          verify.encryptedSessionSigningKey ?? '',
        )
        signature = signPayload(sessionKey, payloadToSign)
      } catch {
        mode = 'sandbox-fallback'
        signature = SANDBOX_SIGNATURE
      }

      setResponse(JSON.stringify({ mode, signature, verify }, null, 2))
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
        WebAuthn assertion, verifies, HPKE-decrypts the session signing key, and ECDSA-signs the
        payload. In sandbox the decrypt fails (the response is a stub) so the step falls back to
        the sandbox magic signature.
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

async function decryptSessionSigningKey(
  recipientPrivateKey: CryptoKey,
  encryptedSessionSigningKey: string,
): Promise<Uint8Array> {
  if (!encryptedSessionSigningKey) throw new Error('No encrypted session signing key returned')
  const payload = bs58check.decode(encryptedSessionSigningKey)
  const enc = payload.slice(0, 33)
  const ciphertext = payload.slice(33)
  const suite = new CipherSuite({
    kem: new DhkemP256HkdfSha256(),
    kdf: new HkdfSha256(),
    aead: new Aes256Gcm(),
  })
  const recipient = await suite.createRecipientContext({
    recipientKey: recipientPrivateKey,
    enc,
  })
  const plaintext = await recipient.open(ciphertext)
  return new Uint8Array(plaintext)
}

function signPayload(sessionPrivateKey: Uint8Array, payloadToSign: string): string {
  const msg = new TextEncoder().encode(payloadToSign)
  const sig = p256.sign(msg, sessionPrivateKey, { format: 'der' })
  return bytesToBase64(sig as Uint8Array)
}

function base64urlToBytes(s: string): ArrayBuffer {
  const pad = '='.repeat((4 - (s.length % 4)) % 4)
  const b64 = (s + pad).replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b64)
  const buf = new ArrayBuffer(bin.length)
  const view = new Uint8Array(buf)
  for (let i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i)
  return buf
}

function bytesToBase64url(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}
