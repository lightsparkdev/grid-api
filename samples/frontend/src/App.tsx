import { useState } from 'react'
import Sidebar, { FlowKey } from './components/Sidebar'
import WebhookStream from './components/WebhookStream'
import PayoutFlow from './flows/PayoutFlow'
import UsdcPayoutFlow from './flows/UsdcPayoutFlow'
import EmbeddedWalletFlow from './flows/EmbeddedWalletFlow'

const FLOW_META: Record<FlowKey, { title: string; subtitle: string }> = {
  payout: {
    title: 'Payout to Bank Account',
    subtitle: 'Send a real time payment funded with USDC',
  },
  'usdc-payout': {
    title: 'Send USDC to a Wallet',
    subtitle: 'Send USDC on-chain to an external wallet, funded with USD',
  },
  'embedded-wallet': {
    title: 'Global Account',
    subtitle: 'Issue a self-custody dollar account and withdraw on behalf of a user',
  },
}

export default function App() {
  const [activeFlow, setActiveFlow] = useState<FlowKey>('payout')
  const meta = FLOW_META[activeFlow]

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pb-12">
      <header className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-xl font-bold">Grid API Sample</h1>
        <p className="text-sm text-gray-400">{meta.subtitle}</p>
      </header>
      <div className="flex">
        <Sidebar activeFlow={activeFlow} onSelect={setActiveFlow} />
        <main className="flex-1 p-6 min-h-[calc(100vh-73px)] max-w-5xl">
          <h2 className="text-lg font-semibold mb-4">{meta.title}</h2>
          {activeFlow === 'payout' && <PayoutFlow key="payout" />}
          {activeFlow === 'usdc-payout' && <UsdcPayoutFlow key="usdc-payout" />}
          {activeFlow === 'embedded-wallet' && <EmbeddedWalletFlow key="embedded-wallet" />}
        </main>
      </div>
      <WebhookStream />
    </div>
  )
}
