import { useState } from 'react'
import StepWizard from './components/StepWizard'
import WebhookStream from './components/WebhookStream'
import CreateCustomer from './steps/CreateCustomer'
import CreateExternalAccount from './steps/CreateExternalAccount'
import CreateQuote from './steps/CreateQuote'
import SandboxFund from './steps/SandboxFund'

export default function App() {
  const [activeStep, setActiveStep] = useState(0)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [externalAccountId, setExternalAccountId] = useState<string | null>(null)
  const [quoteId, setQuoteId] = useState<string | null>(null)

  const advance = () => setActiveStep((s) => s + 1)

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
      title: '2. Create External Account',
      summary: externalAccountId ? `ID: ${externalAccountId}` : null,
      content: (
        <CreateExternalAccount
          customerId={customerId}
          disabled={activeStep !== 1}
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
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-xl font-bold">Grid API Sample</h1>
        <p className="text-sm text-gray-400">Send a real time payment to a US bank account funded with USDC</p>
      </header>
      <div className="flex">
        <main className="w-3/5 p-6 border-r border-gray-800 min-h-[calc(100vh-73px)]">
          <StepWizard steps={steps} activeStep={activeStep} />
        </main>
        <aside className="w-2/5 p-6 min-h-[calc(100vh-73px)]">
          <WebhookStream />
        </aside>
      </div>
    </div>
  )
}
