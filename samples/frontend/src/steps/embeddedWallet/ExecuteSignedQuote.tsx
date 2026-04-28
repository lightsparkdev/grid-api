import { useState } from 'react'
import ResponsePanel from '../../components/ResponsePanel'
import { apiPost } from '../../lib/api'

interface Props {
  quoteId: string | null
  signature: string | null
  onComplete: (response: Record<string, unknown>) => void
  disabled: boolean
}

// Backend route TODO: POST /api/quotes/{quoteId}/execute
// Backend forwards to Grid with the `Grid-Wallet-Signature` header set to the base64 signature.
export default function ExecuteSignedQuote({
  quoteId,
  signature,
  onComplete,
  disabled,
}: Props) {
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!quoteId || !signature) return
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const path = `/api/quotes/${encodeURIComponent(quoteId)}/execute`
      const data = await apiPost<Record<string, unknown>>(path, undefined, {
        'Grid-Wallet-Signature': signature,
        'Idempotency-Key': crypto.randomUUID(),
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
        Submit the signed withdrawal to Grid. The backend forwards the signature in the{' '}
        <code>Grid-Wallet-Signature</code> header.
      </p>
      <button
        onClick={submit}
        disabled={disabled || loading || !quoteId || !signature}
        className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded text-sm font-medium"
      >
        {loading ? 'Executing...' : 'Execute Withdrawal'}
      </button>
      <ResponsePanel response={response} error={error} />
    </div>
  )
}
