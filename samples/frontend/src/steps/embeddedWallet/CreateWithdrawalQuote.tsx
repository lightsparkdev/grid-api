import { useEffect, useState } from 'react'
import JsonEditor from '../../components/JsonEditor'
import ResponsePanel from '../../components/ResponsePanel'
import { apiPost } from '../../lib/api'

interface Props {
  customerId: string | null
  walletAccountId: string | null
  externalAccountId: string | null
  onComplete: (response: { quoteId: string; payloadToSign: string }) => void
  disabled: boolean
}

// Creates a quote with the Global Account as the source. The quote response
// carries a payloadToSign — step 7 signs it, step 8 executes the quote with
// that signature in the Grid-Wallet-Signature header.
export default function CreateWithdrawalQuote({
  customerId,
  walletAccountId,
  externalAccountId,
  onComplete,
  disabled,
}: Props) {
  const [body, setBody] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setBody(JSON.stringify({
      source: {
        sourceType: 'ACCOUNT',
        accountId: walletAccountId ?? '<wallet-account-id>',
        customerId: customerId ?? '<customer-id>',
      },
      destination: {
        destinationType: 'ACCOUNT',
        accountId: externalAccountId ?? '<external-account-id>',
      },
      lockedCurrencySide: 'SENDING',
      // USDB has 6 decimals — 10_000_000 minor units = 10 USDB.
      lockedCurrencyAmount: 10_000_000,
      description: 'Withdrawal from Global Account',
    }, null, 2))
  }, [customerId, walletAccountId, externalAccountId])

  const submit = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const data = await apiPost<{
        id?: string
        quoteId?: string
        paymentInstructions?: Array<{
          accountOrWalletInfo?: { accountType?: string; payloadToSign?: string }
          payloadToSign?: string
        }>
        payloadToSign?: string
      }>('/api/quotes', JSON.parse(body))
      setResponse(JSON.stringify(data, null, 2))
      // paymentInstructions is an array — for an embedded-wallet source, look
      // for the instruction whose accountOrWalletInfo carries the payloadToSign.
      const signingInstruction = data.paymentInstructions?.find(
        (i) => i.accountOrWalletInfo?.payloadToSign || i.payloadToSign,
      )
      const payloadToSign =
        signingInstruction?.accountOrWalletInfo?.payloadToSign ??
        signingInstruction?.payloadToSign ??
        data.payloadToSign ??
        ''
      onComplete({
        quoteId: (data.quoteId ?? data.id) as string,
        payloadToSign,
      })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p className="text-sm text-gray-400 mb-2">
        Generate a withdrawal quote. The response includes a <code>payloadToSign</code> the
        customer must sign with their passkey before execution.
      </p>
      <JsonEditor value={body} onChange={setBody} disabled={disabled || loading} />
      <button
        onClick={submit}
        disabled={disabled || loading}
        className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded text-sm font-medium"
      >
        {loading ? 'Quoting...' : 'Create Withdrawal Quote'}
      </button>
      <ResponsePanel response={response} error={error} />
    </div>
  )
}
