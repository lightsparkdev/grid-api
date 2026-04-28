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
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const eventSourceRef = useRef<EventSource | null>(null)
  const openRef = useRef(open)
  openRef.current = open

  useEffect(() => {
    const connect = () => {
      const es = new EventSource('/api/sse')
      eventSourceRef.current = es

      es.onopen = () => setConnected(true)
      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'connected') return
          setEvents((prev) => [{
            timestamp: Date.now(),
            type: data.type ?? 'unknown',
            raw: JSON.stringify(data, null, 2)
          }, ...prev])
        } catch {
          setEvents((prev) => [{
            timestamp: Date.now(),
            type: 'raw',
            raw: event.data
          }, ...prev])
        }
        if (!openRef.current) setUnread((n) => n + 1)
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

  const toggle = () => {
    setOpen((prev) => {
      if (!prev) setUnread(0)
      return !prev
    })
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-800 bg-gray-950/95 backdrop-blur">
      <button
        onClick={toggle}
        className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-900/60"
      >
        <span className="text-sm font-semibold text-gray-100">Webhooks</span>
        <span className={`inline-block w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-xs text-gray-500">{connected ? 'Connected' : 'Disconnected'}</span>
        {unread > 0 && !open && (
          <span className="ml-1 px-1.5 py-0.5 text-xs font-mono bg-purple-900 text-purple-200 rounded">
            {unread} new
          </span>
        )}
        <span className="ml-auto text-xs text-gray-500">
          {events.length} event{events.length === 1 ? '' : 's'}
        </span>
        <span className="text-xs text-gray-400">{open ? '▼' : '▲'}</span>
      </button>
      {open && (
        <div className="h-72 overflow-y-auto px-4 pb-3 space-y-2 border-t border-gray-800">
          {events.length === 0 ? (
            <p className="text-sm text-gray-500 pt-3">No webhook events received yet.</p>
          ) : (
            events.map((evt, i) => (
              <div key={i} className="bg-gray-900 border border-gray-700 rounded-lg p-3 mt-2">
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
                    {expandedIndex === i ? '▼' : '▶'}
                  </button>
                </div>
                {expandedIndex === i && (
                  <pre className="mt-2 text-xs font-mono text-gray-300 overflow-auto max-h-48">
                    {evt.raw}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
