import { useState } from 'react'
import JsonEditor from '../components/JsonEditor'
import ResponsePanel from '../components/ResponsePanel'
import { apiPost } from '../lib/api'

const DEFAULT_BODY = JSON.stringify({
  platformCustomerId: `cust_${Math.random().toString(36).slice(2, 10)}`,
  customerType: "INDIVIDUAL",
  fullName: "Jack Doe",
  birthDate: "1992-03-25",
  address: {
    line1: "123 Pine Street",
    line2: "Unit 501",
    city: "Seattle",
    state: "WA",
    postalCode: "98101",
    country: "US"
  }
}, null, 2)

interface Props {
  onComplete: (response: Record<string, unknown>) => void
  disabled: boolean
}

export default function CreateCustomer({ onComplete, disabled }: Props) {
  const [body, setBody] = useState(DEFAULT_BODY)
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const data = await apiPost<Record<string, unknown>>('/api/customers', JSON.parse(body))
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
      <p className="text-sm text-gray-400 mb-2">Create an individual customer on the Grid platform.</p>
      <JsonEditor value={body} onChange={setBody} disabled={disabled || loading} />
      <button
        onClick={submit}
        disabled={disabled || loading}
        className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded text-sm font-medium"
      >
        {loading ? 'Creating...' : 'Create Customer'}
      </button>
      <ResponsePanel response={response} error={error} />
    </div>
  )
}
