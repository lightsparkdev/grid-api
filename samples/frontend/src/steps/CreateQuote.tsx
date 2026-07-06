import { useState, useEffect } from 'react'
import JsonEditor from '../components/JsonEditor'
import ResponsePanel from '../components/ResponsePanel'
import { apiPost, apiGet } from '../lib/api'

interface Props {
  customerId: string | null
  externalAccountId: string | null
  destCurrency: string
  onComplete: (response: Record<string, unknown>) => void
  disabled: boolean
}

const SOURCE_CURRENCIES = ['USD', 'USDC'] as const

// Currencies that fund over a crypto network and therefore require `cryptoNetwork`.
const CRYPTO_SOURCE_CURRENCIES = ['USDC']
// Networks a stablecoin funding source can deposit on.
const CRYPTO_NETWORKS = ['BASE', 'ETHEREUM', 'POLYGON', 'SOLANA']

// Decimals per source currency, used to scale the default sending amount into the
// currency's smallest unit (lockedCurrencyAmount with lockedCurrencySide=SENDING).
const SOURCE_CURRENCY_DECIMALS: Record<string, number> = { USD: 2, USDC: 6 }
// Default amount to send, in major units of the source currency (e.g. 10 USD / 10 USDC).
const DEFAULT_SEND_UNITS = 10

export default function CreateQuote({ customerId, externalAccountId, destCurrency, onComplete, disabled }: Props) {
  const [body, setBody] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sourceCurrency, setSourceCurrency] = useState<string>(SOURCE_CURRENCIES[0])
  const [cryptoNetwork, setCryptoNetwork] = useState<string>(CRYPTO_NETWORKS[0])
  const [minSendingAmount, setMinSendingAmount] = useState<number | null>(null)

  const isCryptoSource = CRYPTO_SOURCE_CURRENCIES.includes(sourceCurrency)

  // Look up the corridor's minimum sending amount so the default clears it.
  // Minimums vary widely by corridor (e.g. USD->EUR ~$23 vs USD->MXN ~$1).
  useEffect(() => {
    let cancelled = false
    setMinSendingAmount(null)
    const decimals = SOURCE_CURRENCY_DECIMALS[sourceCurrency] ?? 2
    const probe = DEFAULT_SEND_UNITS * 10 ** decimals
    apiGet<{ data?: Array<{ minSendingAmount?: number }> }>(
      `/api/exchange-rates?sourceCurrency=${sourceCurrency}&destinationCurrency=${destCurrency}&sendingAmount=${probe}`
    )
      .then((res) => {
        if (cancelled) return
        const mins = (res.data ?? []).map((r) => r.minSendingAmount ?? 0)
        setMinSendingAmount(mins.length ? Math.max(...mins) : null)
      })
      .catch(() => { if (!cancelled) setMinSendingAmount(null) })
    return () => { cancelled = true }
  }, [sourceCurrency, destCurrency])

  useEffect(() => {
    const source: Record<string, unknown> = {
      sourceType: "REALTIME_FUNDING",
      currency: sourceCurrency,
      customerId: customerId ?? "<customer-id>"
    }
    // cryptoNetwork is required when funding from a crypto currency (e.g. USDC).
    if (isCryptoSource) source.cryptoNetwork = cryptoNetwork
    // Scale the default amount to the source currency's smallest unit so it isn't
    // dust for high-decimal currencies (e.g. 1000 is $10.00 USD but only 0.001 USDC).
    const decimals = SOURCE_CURRENCY_DECIMALS[sourceCurrency] ?? 2
    const defaultAmount = DEFAULT_SEND_UNITS * 10 ** decimals
    // Floor to the corridor minimum (+5% buffer for FX drift) when it exceeds the
    // default. Don't clamp to maxSendingAmount — it is unreliable for some corridors.
    const flooredToMin = minSendingAmount ? Math.ceil(minSendingAmount * 1.05) : 0
    const lockedCurrencyAmount = Math.max(defaultAmount, flooredToMin)
    setBody(JSON.stringify({
      source,
      destination: {
        destinationType: "ACCOUNT",
        accountId: externalAccountId ?? "<external-account-id>"
      },
      lockedCurrencyAmount,
      lockedCurrencySide: "SENDING",
      purposeOfPayment: "GIFT"
    }, null, 2))
  }, [customerId, externalAccountId, sourceCurrency, destCurrency, isCryptoSource, cryptoNetwork, minSendingAmount])

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
      {isCryptoSource && (
        <div className="mb-3">
          <label htmlFor="crypto-network" className="block text-sm font-medium text-gray-300 mb-1">Funding Network</label>
          <select
            id="crypto-network"
            value={cryptoNetwork}
            onChange={(e) => setCryptoNetwork(e.target.value)}
            disabled={disabled || loading}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-100 focus:outline-none focus:border-blue-500"
          >
            {CRYPTO_NETWORKS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Required when funding from a crypto currency — the network the customer deposits {sourceCurrency} on.</p>
        </div>
      )}
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
