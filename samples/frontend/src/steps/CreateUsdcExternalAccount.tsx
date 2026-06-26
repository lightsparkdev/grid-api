import { useState, useEffect } from 'react'
import JsonEditor from '../components/JsonEditor'
import ResponsePanel from '../components/ResponsePanel'
import { apiPost } from '../lib/api'

interface Props {
  customerId: string | null
  onComplete: (response: Record<string, unknown>) => void
  disabled: boolean
  selectedNetwork: string
  onNetworkChange: (network: string) => void
}

// USDC is settled to an on-chain wallet address. Each network maps to a Grid
// wallet external-account type; EVM networks share the 0x address format.
const NETWORK_CONFIGS: Record<string, {
  label: string
  accountType: string
  address: string
  description: string
}> = {
  BASE: {
    label: "Base",
    accountType: "BASE_WALLET",
    address: "0xAbCDEF1234567890aBCdEf1234567890ABcDef12",
    description: "USDC on Base",
  },
  ETHEREUM: {
    label: "Ethereum",
    accountType: "ETHEREUM_WALLET",
    address: "0xAbCDEF1234567890aBCdEf1234567890ABcDef12",
    description: "USDC on Ethereum",
  },
  POLYGON: {
    label: "Polygon",
    accountType: "POLYGON_WALLET",
    address: "0xAbCDEF1234567890aBCdEf1234567890ABcDef12",
    description: "USDC on Polygon",
  },
  SOLANA: {
    label: "Solana",
    accountType: "SOLANA_WALLET",
    address: "7EYnhQoR9YM3N7UoaKRoA44Uy8JeaZV3qyouov87awMs",
    description: "USDC on Solana",
  },
  TRON: {
    label: "Tron",
    accountType: "TRON_WALLET",
    address: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
    description: "USDC on Tron",
  },
}

export { NETWORK_CONFIGS }

export default function CreateUsdcExternalAccount({ customerId, onComplete, disabled, selectedNetwork, onNetworkChange }: Props) {
  const [body, setBody] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const config = NETWORK_CONFIGS[selectedNetwork]
    setBody(JSON.stringify({
      customerId: customerId ?? "<customer-id>",
      currency: "USDC",
      platformAccountId: `acct_${Math.random().toString(36).slice(2, 10)}`,
      accountInfo: {
        accountType: config.accountType,
        address: config.address,
      },
    }, null, 2))
  }, [customerId, selectedNetwork])

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

  const config = NETWORK_CONFIGS[selectedNetwork]

  return (
    <div>
      <p className="text-sm text-gray-400 mb-2">
        Create a {config.description} wallet account for customer <code className="text-blue-400">{customerId ?? '...'}</code>
      </p>
      <div className="mb-3">
        <label htmlFor="usdc-network" className="block text-sm font-medium text-gray-300 mb-1">Network</label>
        <select
          id="usdc-network"
          value={selectedNetwork}
          onChange={(e) => onNetworkChange(e.target.value)}
          disabled={disabled || loading}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-100 focus:outline-none focus:border-blue-500"
        >
          {Object.entries(NETWORK_CONFIGS).map(([code, cfg]) => (
            <option key={code} value={code}>{cfg.label}</option>
          ))}
        </select>
      </div>
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
