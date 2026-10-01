import { useEffect, useState } from 'react'
import StepWizard from '../components/StepWizard'
import CardVisual, { CardData } from '../components/CardVisual'
import CreateCustomer from '../steps/CreateCustomer'
import FundCardAccount from '../steps/cards/FundCardAccount'
import IssueCard from '../steps/cards/IssueCard'
import RevealCard from '../steps/cards/RevealCard'
import CardTransactions from '../steps/cards/CardTransactions'
import CardControls from '../steps/cards/CardControls'
import { apiGet } from '../lib/api'

type Tab = 'transactions' | 'reveal' | 'controls'

const TABS: { key: Tab; label: string }[] = [
  { key: 'transactions', label: 'Transactions' },
  { key: 'reveal', label: 'Card details' },
  { key: 'controls', label: 'Controls' },
]

type Card = CardData & { maxSpendPerTransaction?: number | null; fundingSource?: string }

export default function CardIssuanceFlow() {
  const [activeStep, setActiveStep] = useState(0)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [holderName, setHolderName] = useState<string | undefined>()
  const [fundingSource, setFundingSource] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [card, setCard] = useState<Card | null>(null)
  const [tab, setTab] = useState<Tab>('transactions')

  // New cards start in PROCESSING while the issuer provisions them. Poll until
  // they settle into ACTIVE (a card.status_change webhook also fires).
  useEffect(() => {
    if (!card?.id || card.status !== 'PROCESSING') return
    const id = setInterval(async () => {
      try {
        setCard(await apiGet<Card>(`/api/cards/${encodeURIComponent(card.id!)}`))
      } catch { /* keep polling */ }
    }, 2000)
    return () => clearInterval(id)
  }, [card?.id, card?.status])

  const steps = [
    {
      title: '1. Create Cardholder',
      summary: customerId ? `ID: ${customerId}` : null,
      content: (
        <CreateCustomer
          disabled={activeStep !== 0}
          onComplete={(data) => {
            setCustomerId(data.id as string)
            setHolderName(data.fullName as string | undefined)
            setActiveStep(1)
          }}
        />
      ),
    },
    {
      title: '2. Fund the Card Account',
      summary: balance ? `Balance: ${balance}` : null,
      content: (
        <FundCardAccount
          customerId={customerId}
          disabled={activeStep !== 1}
          onComplete={(account) => {
            setFundingSource(account.id)
            const b = account.balance
            if (b) setBalance(`$${(b.amount / 10 ** (b.currency?.decimals ?? 2)).toFixed(2)}`)
            setActiveStep(2)
          }}
        />
      ),
    },
    {
      title: '3. Issue a Virtual Card',
      summary: card?.id ? `ID: ${card.id}` : null,
      content: (
        <IssueCard
          customerId={customerId}
          fundingSource={fundingSource}
          disabled={activeStep !== 2}
          onComplete={(data) => {
            setCard(data as Card)
            setActiveStep(3)
          }}
        />
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <StepWizard steps={steps} activeStep={activeStep} />

      {card && (
        <section className="rounded-xl border border-gray-800 bg-gradient-to-b from-gray-900 to-gray-950 p-6">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-[340px] shrink-0 space-y-4">
              <CardVisual card={card} holderName={holderName} />
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <dt className="text-gray-500">Card ID</dt>
                <dd className="font-mono text-gray-300 truncate" title={card.id}>{card.id}</dd>
                <dt className="text-gray-500">Funding source</dt>
                <dd className="font-mono text-gray-300 truncate" title={card.fundingSource}>{card.fundingSource}</dd>
                <dt className="text-gray-500">Currency</dt>
                <dd className="text-gray-300">{card.currency ?? 'USD'}</dd>
                <dt className="text-gray-500">Per-txn limit</dt>
                <dd className="text-gray-300">
                  {card.maxSpendPerTransaction != null ? `$${(card.maxSpendPerTransaction / 100).toFixed(2)}` : 'None'}
                </dd>
              </dl>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex gap-1 border-b border-gray-800 mb-4">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`px-3 py-2 text-sm -mb-px border-b-2 transition-colors ${
                      tab === t.key
                        ? 'border-blue-500 text-gray-100'
                        : 'border-transparent text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {tab === 'transactions' && (
                <CardTransactions cardId={card.id!} disabled={card.status === 'CLOSED'} />
              )}
              {tab === 'reveal' && (
                <RevealCard cardId={card.id!} disabled={card.status === 'CLOSED'} />
              )}
              {tab === 'controls' && (
                <CardControls key={card.id} card={card} onUpdate={(data) => setCard(data as Card)} />
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
