import { useState } from 'react'

interface ResponsePanelProps {
  response: string | null
  error: string | null
}

export default function ResponsePanel({ response, error }: ResponsePanelProps) {
  const [expanded, setExpanded] = useState(true)

  if (!response && !error) return null

  return (
    <div className="mt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-gray-400 hover:text-gray-200 mb-1"
      >
        {expanded ? '\u25BC' : '\u25B6'} Response
      </button>
      {expanded && (
        <pre
          className={`text-sm font-mono p-3 rounded-lg overflow-auto max-h-96 ${
            error
              ? 'bg-red-950 text-red-300 border border-red-800'
              : 'bg-gray-900 text-gray-300 border border-gray-700'
          }`}
        >
          {error ?? response}
        </pre>
      )}
    </div>
  )
}
