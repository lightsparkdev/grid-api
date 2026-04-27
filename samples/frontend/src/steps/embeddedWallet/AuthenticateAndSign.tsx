import { useState } from 'react'
import ResponsePanel from '../../components/ResponsePanel'
import { apiPost } from '../../lib/api'

interface Props {
  authMethodId: string | null
  payloadToSign: string | null
  onComplete: (response: { signature: string }) => void
  disabled: boolean
}

// Backend routes TODO:
//   POST /api/auth/credentials/{authMethodId}/challenge → Grid: same path
//   POST /api/auth/credentials/{authMethodId}/verify    → Grid: same path
// Client-side crypto required (NOT yet implemented in this scaffold):
//   1. Generate ephemeral P-256 key pair
//   2. navigator.credentials.get() with the challenge
//   3. Send WebAuthn assertion + client public key to /verify
//   4. HPKE-decrypt the returned session signing key with the client private key
//   5. ECDSA-sign the quote's payloadToSign bytes (verbatim) with the session key
// See https://grid.lightspark.com/payouts-and-b2b/embedded-wallets/client-keys
export default function AuthenticateAndSign({
  authMethodId,
  payloadToSign,
  onComplete,
  disabled,
}: Props) {
  void onComplete // wired up once passkey signing is implemented below
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!authMethodId || !payloadToSign) return
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      // 1. Request a fresh challenge.
      const challenge = await apiPost<{ challenge: string; requestId: string }>(
        `/api/auth/credentials/${encodeURIComponent(authMethodId)}/challenge`,
        {},
      )

      // 2. Run navigator.credentials.get(), build assertion + client public key,
      //    POST to /verify, HPKE-decrypt session key, ECDSA-sign payloadToSign.
      //    Stub for now — see client-keys docs for the full implementation.
      void challenge
      throw new Error(
        'Passkey signing not yet implemented in this sample. See client-keys docs.',
      )

      // const data = await apiPost<{ signature: string }>(...)
      // setResponse(JSON.stringify(data, null, 2))
      // onComplete(data)
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
      <p className="text-xs text-yellow-300/80 mb-3">
        This step requires P-256 keypair generation, HPKE decryption, and ECDSA signing — left as
        a TODO in this scaffold.
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
