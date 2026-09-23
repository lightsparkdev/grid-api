import { useState } from 'react'
import ResponsePanel from '../../components/ResponsePanel'
import { apiGet, apiPost } from '../../lib/api'

interface Account {
  id: string
  type: string
  balance?: { amount: number; currency?: { code: string; decimals: number } }
}

interface Props {
  customerId: string | null
  disabled: boolean
  onComplete: (account: Account) => void
}

const FUND_AMOUNT = 50_000 // $500.00 in cents

// A card is bound to one internal account that funds its authorizations.
// Here that is the customer's auto-provisioned USD fiat account, topped up
// with the sandbox fund helper so the card has a balance to spend.
export default function FundCardAccount({ customerId, disabled, onComplete }: Props) {
  const [account, setAccount] = useState<Account | null>(null)
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<'find' | 'fund' | null>(null)

  const find = async () => {
    if (!customerId) return
    setLoading('find')
    setError(null)
    try {
      // Grid provisions the fiat account asynchronously right after the customer
      // is created, so a lookup immediately afterwards can come back empty.
      const url = `/api/internal-accounts?customerId=${encodeURIComponent(customerId)}&type=INTERNAL_FIAT`
      let usd: Account | undefined
      for (let attempt = 0; attempt < 10 && !usd; attempt++) {
        if (attempt > 0) await new Promise((r) => setTimeout(r, 1500))
        const data = await apiGet<{ data: Account[] }>(url)
        setResponse(JSON.stringify(data, null, 2))
        usd = data.data.find((a) => a.balance?.currency?.code === 'USD')
      }
      if (!usd) throw new Error('No USD internal account found for this customer yet. Try again in a few seconds.')
      setAccount(usd)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(null)
    }
  }

  const fund = async () => {
    if (!account) return
    setLoading('fund')
    setError(null)
    try {
      const data = await apiPost<Account>(
        `/api/sandbox/internal-accounts/${encodeURIComponent(account.id)}/fund`,
        { amount: FUND_AMOUNT },
      )
      setResponse(JSON.stringify(data, null, 2))
      const funded = { ...account, balance: data.balance ?? account.balance }
      setAccount(funded)
      onComplete(funded)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      <p className="text-sm text-gray-400 mb-3">
        Every card is bound to one internal account, its <code className="text-blue-400">fundingSource</code>.
        Find the customer's USD account and top it up in the sandbox.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={find}
          disabled={disabled || loading !== null || !customerId}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded text-sm font-medium"
        >
          {loading === 'find' ? 'Looking up...' : '1. Find USD Account'}
        </button>
        <button
          onClick={fund}
          disabled={disabled || loading !== null || !account}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded text-sm font-medium"
        >
          {loading === 'fund' ? 'Funding...' : `2. Fund $${(FUND_AMOUNT / 100).toFixed(2)}`}
        </button>
        {account && (
          <span className="text-xs font-mono text-gray-400 truncate">{account.id}</span>
        )}
      </div>
      <ResponsePanel response={response} error={error} />
    </div>
  )
}
