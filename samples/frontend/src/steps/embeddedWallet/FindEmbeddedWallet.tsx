import { useState } from 'react'
import ResponsePanel from '../../components/ResponsePanel'
import { apiGet } from '../../lib/api'

interface Props {
  customerId: string | null
  onComplete: (response: Record<string, unknown>) => void
  disabled: boolean
}

// Lists the customer's internal accounts and surfaces the auto-provisioned
// Global Account (type: EMBEDDED_WALLET) so subsequent steps can reference it.
export default function FindEmbeddedWallet({ customerId, onComplete, disabled }: Props) {
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!customerId) return
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const url = `/api/internal-accounts?customerId=${encodeURIComponent(customerId)}&type=EMBEDDED_WALLET`
      const data = await apiGet<Record<string, unknown>>(url)
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
        Locate the embedded wallet auto-provisioned for this customer.
      </p>
      <pre className="text-xs bg-gray-950 border border-gray-800 rounded p-3 mb-2 overflow-x-auto">
        GET /internal-accounts?customerId={customerId ?? '<customer-id>'}&type=EMBEDDED_WALLET
      </pre>
      <button
        onClick={submit}
        disabled={disabled || loading || !customerId}
        className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded text-sm font-medium"
      >
        {loading ? 'Looking up...' : 'Find Wallet'}
      </button>
      <ResponsePanel response={response} error={error} />
    </div>
  )
}
