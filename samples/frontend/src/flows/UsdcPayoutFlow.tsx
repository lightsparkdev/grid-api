import { useState } from 'react'
import StepWizard from '../components/StepWizard'
import CreateCustomer from '../steps/CreateCustomer'
import CreateUsdcExternalAccount from '../steps/CreateUsdcExternalAccount'
import CreateQuote from '../steps/CreateQuote'
import SandboxFund from '../steps/SandboxFund'

export default function UsdcPayoutFlow() {
  const [activeStep, setActiveStep] = useState(0)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [externalAccountId, setExternalAccountId] = useState<string | null>(null)
  const [quoteId, setQuoteId] = useState<string | null>(null)
  const [selectedNetwork, setSelectedNetwork] = useState('BASE')

  const advance = () => setActiveStep((s) => s + 1)

  const restartFromExternalAccount = () => {
    setExternalAccountId(null)
    setQuoteId(null)
    setActiveStep(1)
  }

  const steps = [
    {
      title: '1. Create Customer',
      summary: customerId ? `ID: ${customerId}` : null,
      content: (
        <CreateCustomer
          disabled={activeStep !== 0}
          onComplete={(data) => {
            setCustomerId(data.id as string)
            advance()
          }}
        />
      ),
    },
    {
      title: '2. Create USDC Wallet Account',
      summary: externalAccountId ? `ID: ${externalAccountId}` : null,
      content: (
        <CreateUsdcExternalAccount
          customerId={customerId}
          disabled={activeStep !== 1}
          selectedNetwork={selectedNetwork}
          onNetworkChange={setSelectedNetwork}
          onComplete={(data) => {
            setExternalAccountId(data.id as string)
            advance()
          }}
        />
      ),
    },
    {
      title: '3. Create Quote',
      summary: quoteId ? `ID: ${quoteId}` : null,
      content: (
        <CreateQuote
          customerId={customerId}
          externalAccountId={externalAccountId}
          destCurrency="USDC"
          disabled={activeStep !== 2}
          onComplete={(data) => {
            setQuoteId((data.quoteId ?? data.id) as string)
            advance()
          }}
        />
      ),
    },
    {
      title: '4. Simulate Funding (Sandbox Only)',
      summary: activeStep > 3 ? 'Funded' : null,
      content: (
        <SandboxFund
          quoteId={quoteId}
          disabled={activeStep !== 3}
          onComplete={() => advance()}
        />
      ),
    },
  ]

  return (
    <>
      <StepWizard steps={steps} activeStep={activeStep} />
      {activeStep >= 1 && (
        <button
          onClick={restartFromExternalAccount}
          className="mt-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium text-gray-300"
        >
          Start New Payment
        </button>
      )}
    </>
  )
}
