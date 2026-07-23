import { useState } from 'react'
import StepWizard from '../components/StepWizard'
import CreateCustomer from '../steps/CreateCustomer'
import CreateKycLink from '../steps/CreateKycLink'
import OpenKycLink from '../steps/OpenKycLink'
import CheckKycStatus from '../steps/CheckKycStatus'

export default function KycOnboardingFlow() {
  const [activeStep, setActiveStep] = useState(0)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [kycUrl, setKycUrl] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [finalStatus, setFinalStatus] = useState<string | null>(null)

  const steps = [
    {
      title: '1. Create Customer',
      summary: customerId ? `ID: ${customerId}` : null,
      content: (
        <CreateCustomer
          disabled={activeStep !== 0}
          onComplete={(data) => {
            setCustomerId(data.id as string)
            setActiveStep(1)
          }}
        />
      ),
    },
    {
      title: '2. Generate KYC Link',
      summary: kycUrl ? 'Link generated' : null,
      content: (
        <CreateKycLink
          customerId={customerId}
          disabled={activeStep < 1}
          onComplete={(data) => {
            setKycUrl((data.kycUrl as string) ?? null)
            setExpiresAt((data.expiresAt as string) ?? null)
            setActiveStep((s) => Math.max(s, 2))
          }}
        />
      ),
    },
    {
      title: '3. Complete Hosted Verification',
      summary: kycUrl,
      content: (
        <OpenKycLink
          kycUrl={kycUrl}
          expiresAt={expiresAt}
          disabled={activeStep < 2}
          onComplete={() => setActiveStep((s) => Math.max(s, 3))}
        />
      ),
    },
    {
      title: '4. Track KYC Status',
      summary: finalStatus ? `Status: ${finalStatus}` : null,
      content: (
        <CheckKycStatus
          customerId={customerId}
          disabled={activeStep < 3}
          onComplete={(data) => {
            setFinalStatus(data.kycStatus as string)
          }}
        />
      ),
    },
  ]

  return <StepWizard steps={steps} activeStep={activeStep} />
}
