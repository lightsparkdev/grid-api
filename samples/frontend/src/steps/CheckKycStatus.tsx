import { useState } from 'react'
import ResponsePanel from '../components/ResponsePanel'
import { apiGet } from '../lib/api'

const STATUS_STYLES: Record<string, string> = {
  APPROVED: 'bg-green-600/20 border-green-600/40 text-green-300',
  PENDING: 'bg-amber-600/20 border-amber-600/40 text-amber-300',
  REJECTED: 'bg-red-600/20 border-red-600/40 text-red-300',
  HOLD: 'bg-red-600/20 border-red-600/40 text-red-300',
  UNVERIFIED: 'bg-gray-600/20 border-gray-600/40 text-gray-300',
}

interface Props {
  customerId: string | null
  disabled: boolean
  onComplete: (response: Record<string, unknown>) => void
}

export default function CheckKycStatus({ customerId, disabled, onComplete }: Props) {
  const [status, setStatus] = useState<string | null>(null)
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  const refresh = async () => {
    if (!customerId) return
    setLoading(true)
    setError(null)
    try {
      const data = await apiGet<Record<string, unknown>>(`/api/customers/${customerId}`)
      setResponse(JSON.stringify(data, null, 2))
      const kycStatus = data.kycStatus as string | undefined
      setStatus(kycStatus ?? null)
      if (!completed && (kycStatus === 'APPROVED' || kycStatus === 'REJECTED')) {
        setCompleted(true)
        onComplete(data)
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p className="text-sm text-gray-400 mb-2">
        Complete verification in the hosted flow (previous step), then refresh to poll the
        customer&apos;s <code className="text-gray-300">kycStatus</code>. Status changes also
        arrive live as <code className="text-gray-300">CUSTOMER.KYC_*</code> events in the
        webhook panel below.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={refresh}
          disabled={disabled || loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded text-sm font-medium"
        >
          {loading ? 'Refreshing...' : 'Refresh Status'}
        </button>
        {status && (
          <span
            className={`px-3 py-1 rounded border text-xs font-semibold tracking-wide ${
              STATUS_STYLES[status] ?? STATUS_STYLES.UNVERIFIED
            }`}
          >
            {status}
          </span>
        )}
      </div>
      <ResponsePanel response={response} error={error} />
    </div>
  )
}
