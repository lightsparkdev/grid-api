import { useState } from 'react'
import StepWizard from '../components/StepWizard'
import CreateCustomer from '../steps/CreateCustomer'
import CreateExternalAccount from '../steps/CreateExternalAccount'
import FindEmbeddedWallet from '../steps/embeddedWallet/FindEmbeddedWallet'
import RegisterPasskey from '../steps/embeddedWallet/RegisterPasskey'
import FundEmbeddedWallet from '../steps/embeddedWallet/FundEmbeddedWallet'
import CreateWithdrawalQuote from '../steps/embeddedWallet/CreateWithdrawalQuote'
import AuthenticateAndSign from '../steps/embeddedWallet/AuthenticateAndSign'
import ExecuteSignedQuote from '../steps/embeddedWallet/ExecuteSignedQuote'

export default function EmbeddedWalletFlow() {
  const [activeStep, setActiveStep] = useState(0)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [walletAccountId, setWalletAccountId] = useState<string | null>(null)
  const [authMethodId, setAuthMethodId] = useState<string | null>(null)
  const [externalAccountId, setExternalAccountId] = useState<string | null>(null)
  const [quoteId, setQuoteId] = useState<string | null>(null)
  const [payloadToSign, setPayloadToSign] = useState<string | null>(null)
  const [signature, setSignature] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState('MX')

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
      title: '2. Find Embedded Wallet',
      summary: walletAccountId ? `ID: ${walletAccountId}` : null,
      content: (
        <FindEmbeddedWallet
          customerId={customerId}
          disabled={activeStep !== 1}
          onComplete={(data) => {
            const accounts = (data.accounts ?? data.data ?? []) as Array<Record<string, unknown>>
            const wallet = accounts[0]
            setWalletAccountId((wallet?.id ?? null) as string | null)
            advance()
          }}
        />
      ),
    },
    {
      title: '3. Register Passkey',
      summary: authMethodId ? `Auth: ${authMethodId}` : null,
      content: (
        <RegisterPasskey
          walletAccountId={walletAccountId}
          customerId={customerId}
          disabled={activeStep !== 2}
          onComplete={(data) => {
            setAuthMethodId(data.authMethodId)
            advance()
          }}
        />
      ),
    },
    {
      title: '4. Fund the Wallet (Sandbox)',
      summary: activeStep > 3 ? 'Funded' : null,
      content: (
        <FundEmbeddedWallet
          walletAccountId={walletAccountId}
          disabled={activeStep !== 3}
          onComplete={() => advance()}
        />
      ),
    },
    {
      title: '5. Add External Bank Account',
      summary: externalAccountId ? `ID: ${externalAccountId}` : null,
      content: (
        <CreateExternalAccount
          customerId={customerId}
          disabled={activeStep !== 4}
          selectedCountry={selectedCountry}
          onCountryChange={setSelectedCountry}
          onComplete={(data) => {
            setExternalAccountId(data.id as string)
            advance()
          }}
        />
      ),
    },
    {
      title: '6. Create Withdrawal Quote',
      summary: quoteId ? `ID: ${quoteId}` : null,
      content: (
        <CreateWithdrawalQuote
          customerId={customerId}
          walletAccountId={walletAccountId}
          externalAccountId={externalAccountId}
          disabled={activeStep !== 5}
          onComplete={({ quoteId, payloadToSign }) => {
            setQuoteId(quoteId)
            setPayloadToSign(payloadToSign)
            advance()
          }}
        />
      ),
    },
    {
      title: '7. Authenticate & Sign',
      summary: signature ? 'Signed' : null,
      content: (
        <AuthenticateAndSign
          authMethodId={authMethodId}
          payloadToSign={payloadToSign}
          disabled={activeStep !== 6}
          onComplete={(data) => {
            setSignature(data.signature)
            advance()
          }}
        />
      ),
    },
    {
      title: '8. Execute Withdrawal',
      summary: activeStep > 7 ? 'Submitted' : null,
      content: (
        <ExecuteSignedQuote
          quoteId={quoteId}
          signature={signature}
          disabled={activeStep !== 7}
          onComplete={() => advance()}
        />
      ),
    },
  ]

  return <StepWizard steps={steps} activeStep={activeStep} />
}
