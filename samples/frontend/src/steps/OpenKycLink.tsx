interface Props {
  kycUrl: string | null
  expiresAt: string | null
  disabled: boolean
  onComplete: () => void
}

export default function OpenKycLink({ kycUrl, expiresAt, disabled, onComplete }: Props) {
  return (
    <div>
      <p className="text-sm text-gray-400 mb-2">
        Send the customer to the hosted verification flow. The link is single-use
        {expiresAt ? ` and expires at ${expiresAt}` : ''} — regenerate one in the previous
        step if it lapses.
      </p>
      {kycUrl && !disabled ? (
        <>
          <a
            href={kycUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => onComplete()}
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium"
          >
            Open hosted KYC flow ↗
          </a>
          <p className="mt-2 text-xs text-gray-500 font-mono break-all">{kycUrl}</p>
        </>
      ) : (
        <p className="text-sm text-gray-500">Generate a link in the previous step first.</p>
      )}
    </div>
  )
}
