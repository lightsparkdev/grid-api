import { useState, useEffect, useRef } from 'react'

interface WebhookEvent {
  timestamp: number
  type: string
  raw: string
}

export default function WebhookStream() {
  const [events, setEvents] = useState<WebhookEvent[]>([])
  const [connected, setConnected] = useState(false)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    const connect = () => {
      const es = new EventSource('/api/sse')
      eventSourceRef.current = es

      es.onopen = () => setConnected(true)
      es.onmessage = (event) => {
        const raw = event.data?.trim()
        if (!raw || raw === 'heartbeat') return
        try {
          const data = JSON.parse(raw)
          if (data.type === 'connected') return
          setEvents((prev) => [{
            timestamp: Date.now(),
            type: data.type ?? 'unknown',
            raw: JSON.stringify(data, null, 2)
          }, ...prev])
        } catch {
          // Skip non-JSON messages (heartbeats, etc.)
        }
      }
      es.onerror = () => {
        setConnected(false)
        es.close()
        setTimeout(connect, 3000)
      }
    }

    connect()
    return () => eventSourceRef.current?.close()
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-lg font-semibold">Webhooks</h2>
        <span className={`inline-block w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-xs text-gray-500">{connected ? 'Connected' : 'Disconnected'}</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2">
        {events.length === 0 && (
          <p className="text-sm text-gray-500">No webhook events received yet.</p>
        )}
        {events.map((evt, i) => (
          <div key={i} className="bg-gray-900 border border-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-purple-900 text-purple-300 text-xs rounded font-mono">
                  {evt.type}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <button
                onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                className="text-xs text-gray-400 hover:text-gray-200"
              >
                {expandedIndex === i ? '\u25BC' : '\u25B6'}
              </button>
            </div>
            {expandedIndex === i && (
              <pre className="mt-2 text-xs font-mono text-gray-300 overflow-auto max-h-48">
                {evt.raw}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
