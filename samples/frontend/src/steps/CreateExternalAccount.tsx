import { useState, useEffect } from 'react'
import JsonEditor from '../components/JsonEditor'
import ResponsePanel from '../components/ResponsePanel'
import { apiPost } from '../lib/api'

interface Props {
  customerId: string | null
  onComplete: (response: Record<string, unknown>) => void
  disabled: boolean
}

export default function CreateExternalAccount({ customerId, onComplete, disabled }: Props) {
  const [body, setBody] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setBody(JSON.stringify({
      customerId: customerId ?? "<customer-id>",
      currency: "USD",
      platformAccountId: `acct_${Math.random().toString(36).slice(2, 10)}`,
      accountInfo: {
        accountType: "US_ACCOUNT",
        accountNumber: "12345678901",
        routingNumber: "123456789",
        accountCategory: "CHECKING",
        bankName: "Chase Bank"
      },
      beneficiary: {
        beneficiaryType: "INDIVIDUAL",
        fullName: "Jack Doe",
        birthDate: "1992-03-25",
        nationality: "US",
        address: {
          line1: "123 Pine Street",
          line2: "Unit 501",
          city: "Seattle",
          state: "WA",
          postalCode: "98101",
          country: "US"
        }
      }
    }, null, 2))
  }, [customerId])

  const submit = async () => {
    if (!customerId) return
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const data = await apiPost<Record<string, unknown>>(
        `/api/customers/${customerId}/external-accounts`,
        JSON.parse(body)
      )
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
        Create a USD bank account for customer <code className="text-blue-400">{customerId ?? '...'}</code>
      </p>
      <JsonEditor value={body} onChange={setBody} disabled={disabled || loading} />
      <button
        onClick={submit}
        disabled={disabled || loading}
        className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded text-sm font-medium"
      >
        {loading ? 'Creating...' : 'Create External Account'}
      </button>
      <ResponsePanel response={response} error={error} />
    </div>
  )
}
