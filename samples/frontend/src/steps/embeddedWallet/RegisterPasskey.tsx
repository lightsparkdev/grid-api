import { useState } from 'react'
import ResponsePanel from '../../components/ResponsePanel'
import { apiPost } from '../../lib/api'

interface Props {
  walletAccountId: string | null
  customerId: string | null
  onComplete: (response: { authMethodId: string }) => void
  disabled: boolean
}

const SANDBOX_MODE = (import.meta.env.VITE_SANDBOX_PASSKEY ?? '1') !== '0'
const SANDBOX_WALLET_SIGNATURE = 'sandbox-valid-signature'

// Backend mints a WebAuthn challenge, client runs navigator.credentials.create(),
// client posts the attestation back, and Grid may require a signed retry before
// returning the new auth method.
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
      const reg = await apiPost<{
        challenge: string
        rp: PublicKeyCredentialRpEntity
        user: { id: string; name: string; displayName: string }
      }>('/api/auth/credentials/registration-challenge', {
        accountId: walletAccountId,
        customerId,
        rpId: window.location.hostname,
      })

      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge: base64urlToBytes(reg.challenge),
          rp: reg.rp,
          user: {
            ...reg.user,
            id: base64urlToBytes(reg.user.id),
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
      const transports =
        (att as AuthenticatorAttestationResponse & { getTransports?: () => string[] })
          .getTransports?.() ?? []

      const createBody = {
        accountId: walletAccountId,
        challenge: reg.challenge,
        nickname: 'Grid Global Account passkey',
        attestation: {
          credentialId: credential.id,
          clientDataJson: bytesToBase64url(new Uint8Array(att.clientDataJSON)),
          attestationObject: bytesToBase64url(new Uint8Array(att.attestationObject)),
          transports,
        },
      }

      let data = await apiPost<Record<string, unknown>>('/api/auth/credentials', createBody)
      if (typeof data.payloadToSign === 'string' && typeof data.requestId === 'string') {
        const signature = registrationSignature(data.payloadToSign)
        data = await apiPost<Record<string, unknown>>('/api/auth/credentials', createBody, {
          'Grid-Wallet-Signature': signature,
          'Request-Id': data.requestId,
        })
      }

      setResponse(JSON.stringify(data, null, 2))
      const authMethodId = (data.id ?? data.authMethodId) as string | undefined
      if (!authMethodId) throw new Error('No auth method id in response')
      onComplete({ authMethodId })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p className="text-sm text-gray-400 mb-2">
        Register a passkey on this device to authorize future Grid Global Account actions.
      </p>
      <p className="text-xs text-yellow-300/80 mb-3">
        Your browser will prompt for a biometric. WebAuthn requires HTTPS or localhost.
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

function registrationSignature(payloadToSign: string): string {
  const configured = import.meta.env.VITE_REGISTRATION_GRID_WALLET_SIGNATURE
  if (configured) return configured
  if (SANDBOX_MODE) return SANDBOX_WALLET_SIGNATURE
  throw new Error(
    `Passkey registration requires a signed retry for payloadToSign: ${payloadToSign}`,
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
