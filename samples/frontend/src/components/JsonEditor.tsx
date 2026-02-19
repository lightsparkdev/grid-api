import { useState, useEffect } from 'react'

interface JsonEditorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export default function JsonEditor({ value, onChange, disabled }: JsonEditorProps) {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      JSON.parse(value)
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    }
  }, [value])

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        spellCheck={false}
        className="w-full h-72 bg-gray-900 text-green-400 font-mono text-sm p-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-y disabled:opacity-50"
      />
      {error && (
        <p className="text-red-400 text-xs mt-1">Invalid JSON: {error}</p>
      )}
    </div>
  )
}
