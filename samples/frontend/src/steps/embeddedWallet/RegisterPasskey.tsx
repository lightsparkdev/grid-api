import { useState } from 'react'
import ResponsePanel from '../../components/ResponsePanel'
import { apiPost } from '../../lib/api'

interface Props {
  walletAccountId: string | null
  customerId: string | null
  onComplete: (response: { authMethodId: string }) => void
  disabled: boolean
}

// Backend route TODO: POST /api/auth/credentials
// Two-phase: client gets a registration challenge, runs navigator.credentials.create(),
// then posts the WebAuthn attestation to the backend, which forwards to Grid.
// See https://grid.lightspark.com/payouts-and-b2b/embedded-wallets/authentication
export default function RegisterPasskey({
  walletAccountId,
  customerId,
  onComplete,
  disabled,
}: Props) {
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!walletAccountId || !customerId) return
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      // Step 1: ask backend for a registration challenge from Grid.
      const challenge = await apiPost<{
        challenge: string
        rp: PublicKeyCredentialRpEntity
        user: { id: string; name: string; displayName: string }
      }>('/api/auth/credentials/registration-challenge', {
        accountId: walletAccountId,
        customerId,
      })

      // Step 2: invoke the platform authenticator.
      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge: base64urlToBytes(challenge.challenge),
          rp: challenge.rp,
          user: {
            ...challenge.user,
            id: base64urlToBytes(challenge.user.id),
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 },   // ES256
            { type: 'public-key', alg: -257 }, // RS256
          ],
          authenticatorSelection: { userVerification: 'required' },
          timeout: 60_000,
        },
      })) as PublicKeyCredential | null

      if (!credential) throw new Error('No credential returned from authenticator')

      const att = credential.response as AuthenticatorAttestationResponse

      // Step 3: send the attestation to the backend → Grid.
      const data = await apiPost<{ authMethodId: string }>('/api/auth/credentials', {
        accountId: walletAccountId,
        credentialId: credential.id,
        clientDataJSON: bytesToBase64url(new Uint8Array(att.clientDataJSON)),
        attestationObject: bytesToBase64url(new Uint8Array(att.attestationObject)),
      })

      setResponse(JSON.stringify(data, null, 2))
      onComplete(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p className="text-sm text-gray-400 mb-2">
        Register a passkey on this device to authorize future withdrawals.
      </p>
      <p className="text-xs text-yellow-300/80 mb-3">
        Requires a backend that proxies <code>POST /auth/credentials</code> and a registration
        challenge endpoint. WebAuthn requires HTTPS or localhost.
      </p>
      <button
        onClick={submit}
        disabled={disabled || loading || !walletAccountId}
        className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded text-sm font-medium"
      >
        {loading ? 'Registering...' : 'Register Passkey'}
      </button>
      <ResponsePanel response={response} error={error} />
    </div>
  )
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
