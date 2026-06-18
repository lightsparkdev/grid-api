import GetExchangeRate from '../steps/GetExchangeRate'

export default function ExchangeRatesFlow() {
  return (
    <div className="rounded-lg border border-blue-600 bg-gray-900 p-4">
      <GetExchangeRate />
    </div>
  )
}
