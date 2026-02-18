import { useState } from 'react'
import ResponsePanel from '../components/ResponsePanel'
import { apiPost } from '../lib/api'

interface Props {
  quoteId: string | null
  onComplete: (response: Record<string, unknown>) => void
  disabled: boolean
}

export default function ExecuteQuote({ quoteId, onComplete, disabled }: Props) {
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!quoteId) return
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const data = await apiPost<Record<string, unknown>>(`/api/quotes/${quoteId}/execute`)
      const pretty = JSON.stringify(data, null, 2)
      setResponse(pretty)
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
        Execute quote <code className="text-blue-400">{quoteId ?? '...'}</code> to initiate the payment.
      </p>
      <button
        onClick={submit}
        disabled={disabled || loading}
        className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded text-sm font-medium"
      >
        {loading ? 'Executing...' : 'Execute Quote'}
      </button>
      <ResponsePanel response={response} error={error} />
    </div>
  )
}
