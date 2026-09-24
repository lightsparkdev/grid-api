import { useCallback, useEffect, useState } from 'react'
import ResponsePanel from '../../components/ResponsePanel'
import { apiGet, apiPost } from '../../lib/api'

interface Amount { amount: number; currency?: { code: string; decimals: number } }

interface CardTransaction {
  id: string
  status: string
  direction: 'DEBIT' | 'CREDIT'
  description?: string
  cardDeclinedReason?: string
  authorizedAmount?: Amount
  settledAmount?: Amount
  refundedAmount?: Amount
  originalTransactionId?: string
  authorizedAt?: string
}

// Sandbox decisioning is driven by the last three characters of the merchant
// descriptor. Descriptors over 22 characters get truncated before decisioning,
// which would cut the suffix off.
const PRESETS = [
  { label: 'Coffee', descriptor: 'BLUE BOTTLE COFFEE SF', mcc: '5814', amount: 1250, hint: 'Approved' },
  { label: 'Groceries', descriptor: 'WHOLE FOODS MKT 10234', mcc: '5411', amount: 8642, hint: 'Approved' },
  { label: 'Insufficient funds', descriptor: 'AMAZON RETAIL US-002', mcc: '5942', amount: 50000, hint: 'Declined · suffix 002' },
  { label: 'Card not active', descriptor: 'NETFLIX.COM-003', mcc: '4899', amount: 1549, hint: 'Declined · suffix 003' },
]

const STATUS_STYLES: Record<string, string> = {
  AUTHORIZED: 'bg-amber-500/15 text-amber-300 ring-amber-400/30',
  PARTIALLY_SETTLED: 'bg-amber-500/15 text-amber-300 ring-amber-400/30',
  SETTLED: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30',
  REFUNDED: 'bg-sky-500/15 text-sky-300 ring-sky-400/30',
  DECLINED: 'bg-red-500/15 text-red-300 ring-red-400/30',
  VOIDED: 'bg-gray-500/15 text-gray-300 ring-gray-400/30',
  EXCEPTION: 'bg-red-500/15 text-red-300 ring-red-400/30',
}

const fmt = (a?: Amount) =>
  a ? `$${(a.amount / 10 ** (a.currency?.decimals ?? 2)).toFixed(a.currency?.decimals ?? 2)}` : '—'

interface Props {
  cardId: string
  disabled: boolean
}

export default function CardTransactions({ cardId, disabled }: Props) {
  const [txns, setTxns] = useState<CardTransaction[]>([])
  const [loaded, setLoaded] = useState(false)
  const [descriptor, setDescriptor] = useState(PRESETS[0].descriptor)
  const [mcc, setMcc] = useState(PRESETS[0].mcc)
  const [amount, setAmount] = useState(PRESETS[0].amount)
  const [busy, setBusy] = useState<string | null>(null)
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const data = await apiGet<{ data: CardTransaction[] }>(`/api/cards/${encodeURIComponent(cardId)}/transactions`)
    setTxns(data.data ?? [])
    setLoaded(true)
    return data.data ?? []
  }, [cardId])

  useEffect(() => { refresh().catch(() => {}) }, [refresh])

  // Simulators return 202 with only an issuer token; the resulting card
  // transaction lands asynchronously. Poll the list until it changes.
  const pollUntilChanged = async (before: CardTransaction[]) => {
    const signature = (list: CardTransaction[]) => list.map((t) => `${t.id}:${t.status}:${t.settledAmount?.amount}`).join('|')
    const start = signature(before)
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 1000))
      const next = await refresh()
      if (signature(next) !== start) return
    }
  }

  const simulate = async (event: string, body: unknown, key: string) => {
    setBusy(key)
    setError(null)
    try {
      const data = await apiPost(`/api/sandbox/cards/${encodeURIComponent(cardId)}/simulate/${event}`, body)
      setResponse(JSON.stringify(data, null, 2))
      await pollUntilChanged(txns)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  const authorize = () =>
    simulate('authorization', {
      amount,
      currency: { code: 'USD' },
      merchant: { descriptor, mcc, country: 'US' },
    }, 'auth')

  const applyPreset = (p: typeof PRESETS[number]) => {
    setDescriptor(p.descriptor)
    setMcc(p.mcc)
    setAmount(p.amount)
  }

  const inputClass = 'w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none disabled:opacity-50'

  return (
    <div>
      <p className="text-sm text-gray-400 mb-3">
        Card networks can't reach the sandbox, so simulate what a merchant would send: an
        authorization, then a clearing (settle, optionally with a tip), then a return.
      </p>

      <div className="flex flex-wrap gap-2 mb-3">
        {PRESETS.map((p) => {
          const active = p.descriptor === descriptor
          return (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              disabled={disabled}
              className={`rounded-lg border px-3 py-1.5 text-left transition-colors disabled:opacity-50 ${
                active ? 'border-blue-500/60 bg-blue-500/10' : 'border-gray-700 hover:border-gray-500 bg-gray-900/40'
              }`}
            >
              <div className="text-xs font-medium text-gray-200">{p.label}</div>
              <div className="text-[10px] text-gray-500">{p.hint}</div>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-[1fr_90px_120px] gap-2">
        <label className="text-xs text-gray-500">
          Merchant descriptor
          <input className={`${inputClass} mt-1`} value={descriptor} maxLength={22} onChange={(e) => setDescriptor(e.target.value)} disabled={disabled} />
        </label>
        <label className="text-xs text-gray-500">
          MCC
          <input className={`${inputClass} mt-1`} value={mcc} onChange={(e) => setMcc(e.target.value)} disabled={disabled} />
        </label>
        <label className="text-xs text-gray-500">
          Amount (cents)
          <input className={`${inputClass} mt-1`} type="number" min={1} value={amount} onChange={(e) => setAmount(Number(e.target.value))} disabled={disabled} />
        </label>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={authorize}
          disabled={disabled || busy !== null || !descriptor || amount <= 0}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded text-sm font-medium"
        >
          {busy === 'auth' ? 'Authorizing...' : `Swipe ${fmt({ amount })}`}
        </button>
        <button
          onClick={() => refresh().catch((e) => setError((e as Error).message))}
          className="text-xs text-gray-400 hover:text-gray-200"
        >
          Refresh
        </button>
      </div>

      <div className="mt-4 rounded-lg border border-gray-800 divide-y divide-gray-800 overflow-hidden">
        {txns.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-gray-500">{loaded ? 'No transactions yet.' : 'Loading...'}</div>
        )}
        {txns.map((t) => {
          const canClear = t.status === 'AUTHORIZED' || t.status === 'PARTIALLY_SETTLED'
          const canRefund = t.direction === 'DEBIT' && t.status === 'SETTLED'
          const auth = t.authorizedAmount?.amount ?? 0
          const isCredit = t.direction === 'CREDIT'
          return (
            <div key={t.id} className="px-4 py-3 bg-gray-900/40">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-sm ${isCredit ? 'bg-sky-500/15 text-sky-300' : 'bg-gray-800 text-gray-300'}`}>
                  {isCredit ? '↩' : (t.description ?? '?').charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-gray-100 truncate">{isCredit ? `Refund · ${t.description ?? ''}` : t.description}</div>
                  <div className="text-[11px] text-gray-500 font-mono truncate">{t.id}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-mono ${isCredit ? 'text-sky-300' : 'text-gray-100'}`}>
                    {isCredit ? '+' : ''}{fmt(t.settledAmount ?? t.authorizedAmount)}
                  </div>
                  {t.settledAmount && t.authorizedAmount && t.settledAmount.amount !== t.authorizedAmount.amount && !isCredit && (
                    <div className="text-[10px] text-gray-500">auth {fmt(t.authorizedAmount)}</div>
                  )}
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ring-1 ${STATUS_STYLES[t.status] ?? 'bg-gray-500/15 text-gray-300 ring-gray-400/30'}`}>
                  {t.status.replace('_', ' ')}
                </span>
              </div>
              {t.cardDeclinedReason && (
                <div className="mt-1 ml-11 text-xs text-red-300">{t.cardDeclinedReason}</div>
              )}
              {(canClear || canRefund) && !disabled && (
                <div className="mt-2 ml-11 flex flex-wrap gap-2">
                  {canClear && (
                    <>
                      <ActionButton busy={busy === `clear-${t.id}`} disabled={busy !== null} onClick={() => simulate('clearing', { cardTransactionId: t.id, amount: auth }, `clear-${t.id}`)}>
                        Settle {fmt({ amount: auth })}
                      </ActionButton>
                      <ActionButton busy={busy === `tip-${t.id}`} disabled={busy !== null} onClick={() => simulate('clearing', { cardTransactionId: t.id, amount: Math.round(auth * 1.2) }, `tip-${t.id}`)}>
                        Settle with 20% tip
                      </ActionButton>
                      <ActionButton busy={busy === `void-${t.id}`} disabled={busy !== null} onClick={() => simulate('clearing', { cardTransactionId: t.id, amount: 0 }, `void-${t.id}`)}>
                        Expire auth
                      </ActionButton>
                    </>
                  )}
                  {canRefund && (
                    <ActionButton busy={busy === `refund-${t.id}`} disabled={busy !== null} onClick={() => simulate('return', { cardTransactionId: t.id, amount: t.settledAmount?.amount ?? auth }, `refund-${t.id}`)}>
                      Refund
                    </ActionButton>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <ResponsePanel response={response} error={error} />
    </div>
  )
}

function ActionButton({ children, busy, disabled, onClick }: { children: React.ReactNode; busy: boolean; disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-md border border-gray-700 bg-gray-800/60 hover:bg-gray-700 disabled:opacity-50 px-2.5 py-1 text-xs text-gray-200"
    >
      {busy ? 'Working...' : children}
    </button>
  )
}
