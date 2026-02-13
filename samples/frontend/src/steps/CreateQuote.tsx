import { useState, useEffect } from 'react'
import JsonEditor from '../components/JsonEditor'
import ResponsePanel from '../components/ResponsePanel'
import { apiPost } from '../lib/api'

interface Props {
  customerId: string | null
  externalAccountId: string | null
  onComplete: (response: Record<string, unknown>) => void
  disabled: boolean
}

export default function CreateQuote({ customerId, externalAccountId, onComplete, disabled }: Props) {
  const [body, setBody] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setBody(JSON.stringify({
      source: {
        sourceType: "REALTIME_FUNDING",
        currency: "USDC",
        customerId: customerId ?? "<customer-id>"
      },
      destination: {
        destinationType: "ACCOUNT",
        accountId: externalAccountId ?? "<external-account-id>"
      },
      lockedCurrencyAmount: 1000,
      lockedCurrencySide: "SENDING"
    }, null, 2))
  }, [customerId, externalAccountId])

  const submit = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const data = await apiPost<Record<string, unknown>>('/api/quotes', JSON.parse(body))
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
        Create a quote to send USDC &rarr; USD to external account <code className="text-blue-400">{externalAccountId ?? '...'}</code>
      </p>
      <JsonEditor value={body} onChange={setBody} disabled={disabled || loading} />
      <button
        onClick={submit}
        disabled={disabled || loading}
        className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded text-sm font-medium"
      >
        {loading ? 'Creating...' : 'Create Quote'}
      </button>
      <ResponsePanel response={response} error={error} />
    </div>
  )
}
