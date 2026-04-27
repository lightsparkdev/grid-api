import { useEffect, useState } from 'react'
import JsonEditor from '../../components/JsonEditor'
import ResponsePanel from '../../components/ResponsePanel'
import { apiPost } from '../../lib/api'

interface Props {
  walletAccountId: string | null
  onComplete: (response: Record<string, unknown>) => void
  disabled: boolean
}

// Backend route TODO: POST /api/sandbox/internal-accounts/{id}/fund
// → Grid: POST /sandbox/internal-accounts/{id}/fund
export default function FundEmbeddedWallet({ walletAccountId, onComplete, disabled }: Props) {
  const [body, setBody] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setBody(JSON.stringify({
      currencyCode: 'USDB',
      currencyAmount: 100_00, // 100.00 USDB in minor units
    }, null, 2))
  }, [walletAccountId])

  const submit = async () => {
    if (!walletAccountId) return
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const path = `/api/sandbox/internal-accounts/${encodeURIComponent(walletAccountId)}/fund`
      const data = await apiPost<Record<string, unknown>>(path, JSON.parse(body))
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
        Sandbox-only: deposit funds into the embedded wallet.
      </p>
      <JsonEditor value={body} onChange={setBody} disabled={disabled || loading} />
      <button
        onClick={submit}
        disabled={disabled || loading || !walletAccountId}
        className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded text-sm font-medium"
      >
        {loading ? 'Funding...' : 'Fund Wallet'}
      </button>
      <ResponsePanel response={response} error={error} />
    </div>
  )
}
