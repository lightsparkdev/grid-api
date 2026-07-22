import { useState } from 'react'
import StepWizard from '../components/StepWizard'
import CreateCustomer from '../steps/CreateCustomer'
import CreateKycLink from '../steps/CreateKycLink'
import CheckKycStatus from '../steps/CheckKycStatus'

export default function KycOnboardingFlow() {
  const [activeStep, setActiveStep] = useState(0)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [kycLinkGenerated, setKycLinkGenerated] = useState(false)
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
      summary: kycLinkGenerated ? 'Link generated' : null,
      content: (
        <CreateKycLink
          customerId={customerId}
          disabled={activeStep < 1}
          onComplete={() => {
            setKycLinkGenerated(true)
            setActiveStep((s) => Math.max(s, 2))
          }}
        />
      ),
    },
    {
      title: '3. Track KYC Status',
      summary: finalStatus ? `Status: ${finalStatus}` : null,
      content: (
        <CheckKycStatus
          customerId={customerId}
          disabled={activeStep < 2}
          onComplete={(data) => {
            setFinalStatus(data.kycStatus as string)
          }}
        />
      ),
    },
  ]

  return <StepWizard steps={steps} activeStep={activeStep} />
}
