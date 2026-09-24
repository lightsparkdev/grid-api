import { useEffect, useState } from 'react'
import { apiPost } from '../../lib/api'

const SAMPLE_CSS_URL =
  'https://cdn.jsdelivr.net/gh/lightsparkdev/grid-api@main/samples/frontend/public/card-reveal.css'

interface Props {
  cardId: string
  disabled: boolean
}

// POST /cards/{id}/reveal mints a short-lived URL for the processor's iframe.
// The full PAN and CVV render inside that iframe and never touch this app's
// servers. The URL is a bearer secret: render it immediately, never store it.
export default function RevealCard({ cardId, disabled }: Props) {
  const [url, setUrl] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  // The stylesheet loads inside the processor's iframe, so it must be a public
  // HTTPS URL. This app's /card-reveal.css works when the app is served over
  // HTTPS (for example behind an ngrok tunnel). Otherwise use the published copy.
  const [cssUrl, setCssUrl] = useState(
    window.location.protocol === 'https:'
      ? `${window.location.origin}/card-reveal.css`
      : SAMPLE_CSS_URL,
  )

  useEffect(() => {
    if (!expiresAt) return
    const tick = () => {
      const left = Math.max(0, Math.round((expiresAt.getTime() - Date.now()) / 1000))
      setSecondsLeft(left)
      if (left === 0) {
        setUrl(null)
        setExpiresAt(null)
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  const reveal = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiPost<{ panEmbedUrl: string; expiresAt: string }>(
        `/api/cards/${encodeURIComponent(cardId)}/reveal`,
        cssUrl.trim() ? { cssUrl: cssUrl.trim() } : {},
      )
      setUrl(data.panEmbedUrl)
      setExpiresAt(new Date(data.expiresAt))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const hide = () => {
    setUrl(null)
    setExpiresAt(null)
  }

  return (
    <div>
      <p className="text-sm text-gray-400 mb-3">
        Request a reveal right before showing the card. The returned{' '}
        <code className="text-blue-400">panEmbedUrl</code> loads the processor's iframe with the
        full number, CVV, and expiry, and expires within minutes.
      </p>

      <label className="block text-xs text-gray-500 mb-3">
        Stylesheet URL <span className="text-gray-600">(optional, HTTPS, overrides your platform's <code>panRevealCssUrl</code> for this reveal)</span>
        <input
          value={cssUrl}
          onChange={(e) => setCssUrl(e.target.value)}
          disabled={disabled || loading || url !== null}
          placeholder="https://your-app.example.com/card-reveal.css"
          className="mt-1 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none disabled:opacity-50"
        />
      </label>

      {url ? (
        <div className="overflow-hidden">
          <iframe
            src={url}
            title="Card details"
            className="w-full h-52 block"
            scrolling="no"
            sandbox="allow-scripts"
            style={{ colorScheme: "normal" }}
          />
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-700 bg-gray-900/40 h-52 flex flex-col items-center justify-center gap-2 text-gray-500">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="10" width="16" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
          <span className="text-xs">Card details are hidden</span>
        </div>
      )}

      <div className="mt-3 flex items-center gap-3">
        {url ? (
          <button
            onClick={hide}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium text-gray-200"
          >
            Hide
          </button>
        ) : (
          <button
            onClick={reveal}
            disabled={disabled || loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded text-sm font-medium"
          >
            {loading ? 'Requesting...' : 'Reveal Card Details'}
          </button>
        )}
        {url && (
          <span className="text-xs text-gray-400">
            URL expires in <span className="font-mono text-amber-300">{Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}</span>
          </span>
        )}
      </div>
      {error && (
        <pre className="mt-3 text-sm font-mono p-3 rounded-lg bg-red-950 text-red-300 border border-red-800 whitespace-pre-wrap">{error}</pre>
      )}
    </div>
  )
}
