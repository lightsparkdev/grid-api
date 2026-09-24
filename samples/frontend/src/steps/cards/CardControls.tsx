import { useState } from 'react'
import ResponsePanel from '../../components/ResponsePanel'
import { apiPatch } from '../../lib/api'
import { CardData } from '../../components/CardVisual'

interface Props {
  card: CardData & { maxSpendPerTransaction?: number | null }
  onUpdate: (card: Record<string, unknown>) => void
}

// PATCH /cards/{id}. Status changes must carry a substatus and a reason.
// Allowed transitions: ACTIVE ⇄ FROZEN, and ACTIVE | FROZEN → CLOSED (terminal).
export default function CardControls({ card, onUpdate }: Props) {
  const [limit, setLimit] = useState(
    card.maxSpendPerTransaction != null ? String(card.maxSpendPerTransaction / 100) : '',
  )
  const [confirmClose, setConfirmClose] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const patch = async (body: Record<string, unknown>, key: string) => {
    setBusy(key)
    setError(null)
    try {
      const data = await apiPatch<Record<string, unknown>>(`/api/cards/${encodeURIComponent(card.id!)}`, body)
      setResponse(JSON.stringify(data, null, 2))
      onUpdate(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(null)
      setConfirmClose(false)
    }
  }

  const status = card.status
  const closed = status === 'CLOSED'
  const frozen = status === 'FROZEN'

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-800 bg-gray-900/40 p-4">
          <div className="text-sm font-medium text-gray-200">{frozen ? 'Unfreeze card' : 'Freeze card'}</div>
          <p className="text-xs text-gray-500 mt-1 mb-3">
            A frozen card declines new authorizations with <code>CARD_NOT_ACTIVE</code>. Pending
            ones still settle.
          </p>
          <button
            onClick={() =>
              frozen
                ? patch({ status: 'ACTIVE', substatus: 'END_USER_REQUEST', reason: 'Cardholder unfroze the card.' }, 'freeze')
                : patch({ status: 'FROZEN', substatus: 'END_USER_REQUEST', reason: 'Cardholder froze the card from the app.' }, 'freeze')
            }
            disabled={closed || busy !== null || status === 'PROCESSING'}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:bg-gray-700 disabled:text-gray-500 rounded text-sm font-medium"
          >
            {busy === 'freeze' ? 'Updating...' : frozen ? 'Unfreeze' : 'Freeze'}
          </button>
        </div>

        <div className="rounded-lg border border-gray-800 bg-gray-900/40 p-4">
          <div className="text-sm font-medium text-gray-200">Per-transaction limit</div>
          <p className="text-xs text-gray-500 mt-1 mb-3">
            Caps a single authorization. Leave empty to remove the card's own limit.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">$</span>
              <input
                type="number"
                min={1}
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                disabled={closed || busy !== null}
                placeholder="No limit"
                className="w-full bg-gray-900 border border-gray-700 rounded pl-6 pr-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none disabled:opacity-50"
              />
            </div>
            <button
              onClick={() => patch({ maxSpendPerTransaction: limit ? Math.round(Number(limit) * 100) : null }, 'limit')}
              disabled={closed || busy !== null}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded text-sm font-medium"
            >
              {busy === 'limit' ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-red-900/60 bg-red-950/20 p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-red-200">Close card</div>
          <p className="text-xs text-red-300/60 mt-1">Permanent. A closed card can't be reopened.</p>
        </div>
        {confirmClose ? (
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmClose(false)}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium text-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={() => patch({ status: 'CLOSED', substatus: 'END_USER_REQUEST', reason: 'Cardholder asked us to close the card.' }, 'close')}
              disabled={busy !== null}
              className="px-3 py-2 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 rounded text-sm font-medium"
            >
              {busy === 'close' ? 'Closing...' : 'Yes, close it'}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmClose(true)}
            disabled={closed || busy !== null}
            className="px-4 py-2 border border-red-700 text-red-200 hover:bg-red-900/40 disabled:opacity-40 rounded text-sm font-medium"
          >
            {closed ? 'Closed' : 'Close Card'}
          </button>
        )}
      </div>
      <ResponsePanel response={response} error={error} />
    </div>
  )
}
