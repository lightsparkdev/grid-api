interface Props {
  kycUrl: string | null
  expiresAt: string | null
  disabled: boolean
  onComplete: () => void
}

// Sumsub sandbox behavior (https://docs.sumsub.com/docs/test-in-sandbox):
// no real checks run — outcomes are driven by which test document you upload.
const SUMSUB_TEMPLATES_URL = 'https://docs.sumsub.com/docs/verification-document-templates'

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
          <div className="mt-3 rounded border border-gray-800 bg-gray-900/50 p-3 text-xs text-gray-400 space-y-1.5">
            <p className="font-semibold text-gray-300">Sample data for the sandbox Sumsub flow</p>
            <p>
              Sandbox runs no real checks — the outcome depends on the document you upload.
              Any other image (even a photo of your cat) is accepted with mock data
              (&ldquo;Mock firstName / Mock lastName&rdquo;).
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                <span className="text-green-400">To pass:</span> select <span className="text-gray-300">Germany</span> as
                the issuing country, pick <span className="text-gray-300">ID card</span> or{' '}
                <span className="text-gray-300">passport</span>, and upload the accepted Germany
                templates from Sumsub&apos;s collection. China ID and India Aadhaar templates also pass.
              </li>
              <li>
                <span className="text-red-400">To fail:</span> upload a rejected template — Spain or
                California documents trigger a resubmission request; the Cyprus ID card causes a
                final rejection.
              </li>
              <li>
                For the selfie/liveness step, any live camera face works in sandbox.
              </li>
            </ul>
            <p>
              Download the test documents from{' '}
              <a
                href={SUMSUB_TEMPLATES_URL}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Sumsub&apos;s verification document templates ↗
              </a>
              .
            </p>
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-500">Generate a link in the previous step first.</p>
      )}
    </div>
  )
}
