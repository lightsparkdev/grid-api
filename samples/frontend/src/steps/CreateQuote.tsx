import { useState, useEffect } from 'react'
import JsonEditor from '../components/JsonEditor'
import ResponsePanel from '../components/ResponsePanel'
import { apiPost } from '../lib/api'
import { COUNTRY_CONFIGS } from './CreateExternalAccount'

interface Props {
  customerId: string | null
  externalAccountId: string | null
  selectedCountry: string
  onComplete: (response: Record<string, unknown>) => void
  disabled: boolean
}

const SOURCE_CURRENCIES = ['USD', 'USDC'] as const

export default function CreateQuote({ customerId, externalAccountId, selectedCountry, onComplete, disabled }: Props) {
  const [body, setBody] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sourceCurrency, setSourceCurrency] = useState<string>(SOURCE_CURRENCIES[0])

  const destCurrency = COUNTRY_CONFIGS[selectedCountry]?.currency ?? 'USD'

  useEffect(() => {
    setBody(JSON.stringify({
      source: {
        sourceType: "REALTIME_FUNDING",
        currency: sourceCurrency,
        customerId: customerId ?? "<customer-id>"
      },
      destination: {
        destinationType: "ACCOUNT",
        accountId: externalAccountId ?? "<external-account-id>"
      },
      lockedCurrencyAmount: 1000,
      lockedCurrencySide: "SENDING",
      purposeOfPayment: "GIFT"
    }, null, 2))
  }, [customerId, externalAccountId, sourceCurrency, selectedCountry])

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
        Create a quote to send {sourceCurrency} &rarr; {destCurrency} to external account <code className="text-blue-400">{externalAccountId ?? '...'}</code>
      </p>
      <div className="mb-3">
        <label htmlFor="source-currency" className="block text-sm font-medium text-gray-300 mb-1">Source Currency</label>
        <select
          id="source-currency"
          value={sourceCurrency}
          onChange={(e) => setSourceCurrency(e.target.value)}
          disabled={disabled || loading}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-100 focus:outline-none focus:border-blue-500"
        >
          {SOURCE_CURRENCIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
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
