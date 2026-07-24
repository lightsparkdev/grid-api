import { useState } from 'react'
import ResponsePanel from '../components/ResponsePanel'
import { apiPost } from '../lib/api'

interface Props {
  customerId: string | null
  disabled: boolean
  onComplete: (response: Record<string, unknown>) => void
}

export default function CreateKycLink({ customerId, disabled, onComplete }: Props) {
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!customerId) return
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      // No request body: redirectUri is optional and must be a public https URL
      // (the KYC provider rejects http:// and localhost), so the local sample omits it.
      const data = await apiPost<Record<string, unknown>>(`/api/customers/${customerId}/kyc-link`)
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
        Generate a single-use hosted verification link for this customer. Each link expires —
        re-run this step to mint a fresh one.
      </p>
      <button
        onClick={submit}
        disabled={disabled || loading}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded text-sm font-medium"
      >
        {loading ? 'Generating...' : 'Generate KYC Link'}
      </button>
      <ResponsePanel response={response} error={error} />
    </div>
  )
}
