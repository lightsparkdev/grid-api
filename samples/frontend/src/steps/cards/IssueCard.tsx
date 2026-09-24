import { useEffect, useRef, useState } from 'react'
import JsonEditor from '../../components/JsonEditor'
import ResponsePanel from '../../components/ResponsePanel'
import { apiPost } from '../../lib/api'
import { randomUUID } from '../../lib/uuid'

interface Props {
  customerId: string | null
  fundingSource: string | null
  disabled: boolean
  onComplete: (card: Record<string, unknown>) => void
}

export default function IssueCard({ customerId, fundingSource, disabled, onComplete }: Props) {
  const [body, setBody] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  // Issuance is fee-bearing and irreversible. A retry of the same body reuses its
  // key and gets the first card back. An edited body needs a new key, or Grid
  // rejects it as a conflicting reuse.
  const idempotencyKey = useRef(randomUUID())
  const keyedBody = useRef('')

  useEffect(() => {
    setBody(JSON.stringify({
      customerId: customerId ?? '<customer-id>',
      form: 'VIRTUAL',
      fundingSource: fundingSource ?? '<internal-account-id>',
      maxSpendPerTransaction: 20_000,
      maxTransactionsPerDay: 20,
    }, null, 2))
  }, [customerId, fundingSource])

  const submit = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)
    if (body !== keyedBody.current) {
      idempotencyKey.current = randomUUID()
      keyedBody.current = body
    }
    try {
      const data = await apiPost<Record<string, unknown>>('/api/cards', JSON.parse(body), {
        'Idempotency-Key': idempotencyKey.current,
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
        Issue a virtual card. Limits are in cents: this card can authorize up to $200 per
        transaction and 20 transactions per UTC day.
      </p>
      <JsonEditor value={body} onChange={setBody} disabled={disabled || loading} />
      <div className="mt-2 flex items-center gap-3">
        <button
          onClick={submit}
          disabled={disabled || loading || !customerId || !fundingSource}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded text-sm font-medium"
        >
          {loading ? 'Issuing...' : 'Issue Card'}
        </button>
        <span className="text-xs text-gray-500 font-mono">Idempotency-Key: {idempotencyKey.current.slice(0, 8)}…</span>
      </div>
      <ResponsePanel response={response} error={error} />
    </div>
  )
}
