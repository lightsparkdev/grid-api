export type FlowKey = 'payout' | 'usdc-payout' | 'exchange-rates' | 'embedded-wallet'

interface FlowEntry {
  key: FlowKey
  label: string
  description: string
}

const FLOWS: FlowEntry[] = [
  {
    key: 'exchange-rates',
    label: 'Exchange Rates',
    description: 'Look up FX rates and fees for a corridor',
  },
  {
    key: 'payout',
    label: 'Payout to Bank Account',
    description: 'Send a real-time payment funded with USDC',
  },
  {
    key: 'usdc-payout',
    label: 'Send USDC to a Wallet',
    description: 'Send USDC on-chain to an external wallet, funded with USD',
  },
  {
    key: 'embedded-wallet',
    label: 'Global Account',
    description: 'Issue a self-custody dollar account and withdraw on behalf of a user',
  },
]

interface SidebarProps {
  activeFlow: FlowKey
  onSelect: (flow: FlowKey) => void
}

export default function Sidebar({ activeFlow, onSelect }: SidebarProps) {
  return (
    <nav className="w-64 shrink-0 border-r border-gray-800 p-4 min-h-[calc(100vh-73px)]">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 px-2">
        Flows
      </h2>
      <ul className="space-y-1">
        {FLOWS.map((flow) => {
          const isActive = flow.key === activeFlow
          return (
            <li key={flow.key}>
              <button
                onClick={() => onSelect(flow.key)}
                className={`w-full text-left rounded px-3 py-2 transition-colors ${
                  isActive
                    ? 'bg-blue-600/20 border border-blue-600/40 text-blue-100'
                    : 'border border-transparent hover:bg-gray-800/60 text-gray-300'
                }`}
              >
                <div className="text-sm font-medium">{flow.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{flow.description}</div>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
