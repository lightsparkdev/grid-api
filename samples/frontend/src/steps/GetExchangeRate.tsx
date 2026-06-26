import { useState } from 'react'
import ResponsePanel from '../components/ResponsePanel'
import { apiGet } from '../lib/api'

const CURRENCIES = ['USD', 'USDC', 'MXN', 'BRL', 'INR', 'EUR', 'GBP', 'PHP', 'CAD']

export default function GetExchangeRate() {
  const [sourceCurrency, setSourceCurrency] = useState('USD')
  const [destinationCurrency, setDestinationCurrency] = useState('USDC')
  const [sendingAmount, setSendingAmount] = useState('100000')
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const params = new URLSearchParams({ sourceCurrency, destinationCurrency })
      if (sendingAmount) params.set('sendingAmount', sendingAmount)
      const data = await apiGet<Record<string, unknown>>(`/api/exchange-rates?${params.toString()}`)
      setResponse(JSON.stringify(data, null, 2))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const selectClass =
    'w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-100 focus:outline-none focus:border-blue-500'

  return (
    <div>
      <p className="text-sm text-gray-400 mb-3">
        Look up the cached FX rate, fees, and receiving amount for a currency corridor.
      </p>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label htmlFor="src-currency" className="block text-sm font-medium text-gray-300 mb-1">Source Currency</label>
          <select id="src-currency" value={sourceCurrency} onChange={(e) => setSourceCurrency(e.target.value)} disabled={loading} className={selectClass}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="dst-currency" className="block text-sm font-medium text-gray-300 mb-1">Destination Currency</label>
          <select id="dst-currency" value={destinationCurrency} onChange={(e) => setDestinationCurrency(e.target.value)} disabled={loading} className={selectClass}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="mb-3">
        <label htmlFor="sending-amount" className="block text-sm font-medium text-gray-300 mb-1">Sending Amount</label>
        <input
          id="sending-amount"
          type="number"
          min="0"
          value={sendingAmount}
          onChange={(e) => setSendingAmount(e.target.value)}
          disabled={loading}
          className={selectClass}
        />
        <p className="text-xs text-gray-500 mt-1">In the smallest unit of the source currency (e.g. cents). 100000 = 1,000.00 USD.</p>
      </div>
      <button
        onClick={submit}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded text-sm font-medium"
      >
        {loading ? 'Fetching...' : 'Get Exchange Rate'}
      </button>
      <ResponsePanel response={response} error={error} />
    </div>
  )
}
