export interface CardData {
  id?: string
  status?: string
  brand?: string
  last4?: string
  expMonth?: number
  expYear?: number
  currency?: string
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-400/15 text-emerald-200 ring-emerald-300/30',
  PROCESSING: 'bg-amber-400/15 text-amber-200 ring-amber-300/30',
  PENDING_KYC: 'bg-amber-400/15 text-amber-200 ring-amber-300/30',
  FROZEN: 'bg-sky-400/15 text-sky-200 ring-sky-300/30',
  CLOSED: 'bg-red-400/15 text-red-200 ring-red-300/30',
}

interface Props {
  card: CardData | null
  holderName?: string
}

// Renders the card resource as a physical-looking card. Grid only returns last4
// and expiry; the full PAN and CVV are shown through the reveal iframe instead.
export default function CardVisual({ card, holderName }: Props) {
  const status = card?.status ?? 'NOT ISSUED'
  const frozen = status === 'FROZEN'
  const closed = status === 'CLOSED'
  const exp = card?.expMonth && card?.expYear
    ? `${String(card.expMonth).padStart(2, '0')}/${String(card.expYear).slice(-2)}`
    : '••/••'

  return (
    <div className="relative w-full max-w-[360px] aspect-[1.586] select-none">
      <div
        className={`absolute inset-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/10 transition-all duration-500 ${
          closed ? 'grayscale opacity-60' : ''
        } ${!card ? 'opacity-40' : ''}`}
        style={{
          background:
            'radial-gradient(120% 90% at 100% 0%, rgba(99,102,241,0.55) 0%, transparent 55%),' +
            'radial-gradient(90% 80% at 0% 100%, rgba(14,165,233,0.45) 0%, transparent 60%),' +
            'linear-gradient(135deg, #0b1020 0%, #111827 55%, #0b1020 100%)',
        }}
      >
        {/* Sheen */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent" />
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border border-white/10" />
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full border border-white/10" />

        <div className="relative h-full flex flex-col justify-between p-5 text-white">
          <div className="flex items-start justify-between">
            <span className="text-sm font-semibold tracking-wide">Grid</span>
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ring-1 ${
              STATUS_STYLES[status] ?? 'bg-white/10 text-white/60 ring-white/20'
            }`}>
              {status.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* EMV chip */}
            <div className="h-8 w-11 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 ring-1 ring-amber-900/30 grid grid-cols-3 gap-px p-1 opacity-90">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-[2px] bg-amber-700/30" />
              ))}
            </div>
            {/* Contactless */}
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-white/70" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M8.5 8.5a5 5 0 0 1 0 7" />
              <path d="M12 6a8.5 8.5 0 0 1 0 12" />
              <path d="M15.5 3.5a12 12 0 0 1 0 17" />
            </svg>
          </div>

          <div>
            <div className="font-mono text-lg tracking-[0.2em] text-white/90">
              •••• •••• •••• {card?.last4 ?? '••••'}
            </div>
            <div className="mt-3 flex items-end justify-between">
              <div className="flex gap-6">
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-white/50">Cardholder</div>
                  <div className="text-xs font-medium uppercase tracking-wide">{holderName ?? '—'}</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-white/50">Expires</div>
                  <div className="text-xs font-mono">{exp}</div>
                </div>
              </div>
              <span className="text-lg font-black italic tracking-tight text-white/90">
                {card?.brand === 'MASTERCARD' ? 'mastercard' : 'VISA'}
              </span>
            </div>
          </div>
        </div>

        {frozen && (
          <div className="absolute inset-0 backdrop-blur-[2px] bg-sky-300/10 flex items-center justify-center">
            <div className="flex items-center gap-2 rounded-full bg-sky-950/70 px-3 py-1.5 ring-1 ring-sky-300/30 text-sky-100 text-xs font-semibold">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 2v20M4.9 4.9l14.2 14.2M2 12h20M4.9 19.1 19.1 4.9" />
              </svg>
              Frozen
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
