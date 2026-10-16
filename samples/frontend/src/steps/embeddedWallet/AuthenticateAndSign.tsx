import { useState } from 'react'
import { p256 } from '@noble/curves/nist.js'
import ResponsePanel from '../../components/ResponsePanel'
import { apiPost } from '../../lib/api'

interface Props {
  authMethodId: string | null
  payloadToSign: string | null
  onComplete: (response: { signature: string }) => void
  disabled: boolean
}

// Step 7: Authenticate with the registered passkey and sign payloadToSign.
//
// Sandbox verifies every step the same way production does:
//   1. Generate a P-256 client key pair. Its private key becomes the session
//      signing key once the session is issued.
//   2. POST /challenge with the compressed public key as clientPublicKey —
//      Grid bakes it into the session-creation payload and returns a
//      Grid-issued WebAuthn challenge.
//   3. navigator.credentials.get(challenge) → WebAuthn assertion.
//   4. POST /verify with the assertion (no clientPublicKey on /verify).
//   5. Build a Grid wallet signature over payloadToSign with the client
//      private key and pass the base64url stamp to step 8 as
//      Grid-Wallet-Signature.
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
      // 1. Client keypair. Only the public key leaves the device.
      const sessionPrivateKey = p256.utils.randomSecretKey()
      const clientPublicKey = bytesToHex(p256.getPublicKey(sessionPrivateKey, true))

      // 2. Ask Grid for an authentication challenge bound to this public key.
      const challenge = await apiPost<{ challenge: string; requestId: string }>(
        `/api/auth/credentials/${encodeURIComponent(authMethodId)}/challenge`,
        { clientPublicKey },
      )

      // 3. WebAuthn assertion against the Grid-issued challenge. The challenge
      //    is a lowercase hex string; UTF-8 encode it exactly as returned.
      const assertion = (await navigator.credentials.get({
        publicKey: {
          challenge: new TextEncoder().encode(challenge.challenge),
          userVerification: 'required',
          timeout: 60_000,
        },
      })) as PublicKeyCredential | null
      if (!assertion) throw new Error('No assertion returned from authenticator')
      const ar = assertion.response as AuthenticatorAssertionResponse

      // 4. Verify the assertion with Grid.
      const verify = await apiPost<unknown>(
        `/api/auth/credentials/${encodeURIComponent(authMethodId)}/verify`,
        {
          assertion: {
            credentialId: assertion.id,
            clientDataJson: bytesToBase64url(new Uint8Array(ar.clientDataJSON)),
            authenticatorData: bytesToBase64url(new Uint8Array(ar.authenticatorData)),
            signature: bytesToBase64url(new Uint8Array(ar.signature)),
            userHandle: ar.userHandle
              ? bytesToBase64url(new Uint8Array(ar.userHandle))
              : undefined,
          },
        },
        { 'Request-Id': challenge.requestId },
      )

      // 5. Sign payloadToSign with the session signing key.
      const signature = signPayload(sessionPrivateKey, payloadToSign)

      setResponse(JSON.stringify({ signature, verify }, null, 2))
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
        WebAuthn assertion, verifies, then signs the payload with the keypair's private key.
        Sandbox checks each signature the same way production does.
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

// Build the signature expected by Grid-Wallet-Signature.
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
