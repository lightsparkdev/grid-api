import { useState } from 'react'
import JsonEditor from '../components/JsonEditor'
import ResponsePanel from '../components/ResponsePanel'
import { apiPost } from '../lib/api'

// redirectUri is optional and must be a public https URL (the KYC provider
// rejects http:// and localhost), so the local sample omits it by default.
const DEFAULT_BODY = '{}'

interface Props {
  customerId: string | null
  disabled: boolean
  onComplete: (response: Record<string, unknown>) => void
}

export default function CreateKycLink({ customerId, disabled, onComplete }: Props) {
  const [body, setBody] = useState(DEFAULT_BODY)
  const [response, setResponse] = useState<string | null>(null)
  const [kycUrl, setKycUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)
    setKycUrl(null)
    try {
      const data = await apiPost<Record<string, unknown>>(
        `/api/customers/${customerId}/kyc-link`,
        JSON.parse(body),
      )
      setResponse(JSON.stringify(data, null, 2))
      setKycUrl(data.kycUrl as string)
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
        re-run this step to mint a fresh one. Optionally set <code className="text-gray-300">redirectUri</code>{' '}
        to return the customer to your app afterwards (must be a public https URL).
      </p>
      <JsonEditor value={body} onChange={setBody} disabled={disabled || loading} />
      <button
        onClick={submit}
        disabled={disabled || loading}
        className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded text-sm font-medium"
      >
        {loading ? 'Generating...' : 'Generate KYC Link'}
      </button>
      {kycUrl && (
        <p className="mt-3 text-sm">
          <a
            href={kycUrl}
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:text-blue-300 underline break-all"
          >
            Open hosted KYC flow ↗
          </a>
        </p>
      )}
      <ResponsePanel response={response} error={error} />
    </div>
  )
}
