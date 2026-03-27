import { useState, useEffect } from 'react'
import JsonEditor from '../components/JsonEditor'
import ResponsePanel from '../components/ResponsePanel'
import { apiPost } from '../lib/api'

interface Props {
  customerId: string | null
  onComplete: (response: Record<string, unknown>) => void
  disabled: boolean
  selectedCountry: string
  onCountryChange: (country: string) => void
}

const COUNTRY_CONFIGS: Record<string, {
  label: string
  currency: string
  accountInfo: Record<string, unknown>
  beneficiary: Record<string, unknown>
  description: string
}> = {
  IN: {
    label: "🇮🇳 India (INR)",
    currency: "INR",
    description: "INR account (UPI)",
    accountInfo: {
      accountType: "INR_ACCOUNT",
      vpa: "test@upi",
      paymentRails: ["UPI"]
    },
    beneficiary: {
      beneficiaryType: "INDIVIDUAL",
      fullName: "Priya Sharma",
      birthDate: "1991-06-12",
      nationality: "IN",
      email: "priya.sharma@example.com",
      phoneNumber: "+919876543210",
      address: {
        line1: "42 MG Road",
        city: "Bangalore",
        state: "Karnataka",
        postalCode: "560001",
        country: "IN"
      }
    }
  },
  MX: {
    label: "🇲🇽 Mexico (MXN)",
    currency: "MXN",
    description: "MXN account (SPEI/CLABE)",
    accountInfo: {
      accountType: "MXN_ACCOUNT",
      clabeNumber: "014027000005555601",
      paymentRails: ["SPEI"]
    },
    beneficiary: {
      beneficiaryType: "INDIVIDUAL",
      fullName: "Carlos García",
      birthDate: "1988-07-15",
      nationality: "MX",
      email: "carlos.garcia@example.com",
      phoneNumber: "+5215512345678",
      address: {
        line1: "Av. Reforma 222",
        city: "Mexico City",
        state: "CDMX",
        postalCode: "06600",
        country: "MX"
      }
    }
  },
  BR: {
    label: "🇧🇷 Brazil (BRL)",
    currency: "BRL",
    description: "BRL account (PIX)",
    accountInfo: {
      accountType: "BRL_ACCOUNT",
      pixKey: "carlos@example.com",
      pixKeyType: "EMAIL",
      taxId: "12345678901",
      paymentRails: ["PIX"]
    },
    beneficiary: {
      beneficiaryType: "INDIVIDUAL",
      fullName: "Ana Silva",
      birthDate: "1990-11-20",
      nationality: "BR",
      email: "ana.silva@example.com",
      phoneNumber: "+5511987654321",
      address: {
        line1: "Rua Augusta 1200",
        city: "São Paulo",
        state: "SP",
        postalCode: "01304-001",
        country: "BR"
      }
    }
  },
  PH: {
    label: "🇵🇭 Philippines (PHP)",
    currency: "PHP",
    description: "PHP account (Bank Transfer)",
    accountInfo: {
      accountType: "PHP_ACCOUNT",
      bankName: "BDO Unibank",
      accountNumber: "001234567890",
      paymentRails: ["BANK_TRANSFER"]
    },
    beneficiary: {
      beneficiaryType: "INDIVIDUAL",
      fullName: "Maria Santos",
      birthDate: "1995-04-10",
      nationality: "PH",
      email: "maria.santos@example.com",
      phoneNumber: "+639171234567",
      address: {
        line1: "123 Rizal Avenue",
        city: "Manila",
        state: "Metro Manila",
        postalCode: "1000",
        country: "PH"
      }
    }
  },
  GB: {
    label: "🇬🇧 United Kingdom (GBP)",
    currency: "GBP",
    description: "GBP account (Faster Payments)",
    accountInfo: {
      accountType: "GBP_ACCOUNT",
      sortCode: "123456",
      accountNumber: "12345678",
      paymentRails: ["FASTER_PAYMENTS"]
    },
    beneficiary: {
      beneficiaryType: "INDIVIDUAL",
      fullName: "James Smith",
      birthDate: "1985-09-03",
      nationality: "GB",
      email: "james.smith@example.com",
      phoneNumber: "+447911123456",
      address: {
        line1: "10 Downing Street",
        city: "London",
        postalCode: "SW1A 2AA",
        country: "GB"
      }
    }
  },
  EU: {
    label: "🇪🇺 Europe (EUR)",
    currency: "EUR",
    description: "EUR account (SEPA)",
    accountInfo: {
      accountType: "EUR_ACCOUNT",
      iban: "DE89370400440532013000",
      swiftCode: "DEUTDEFF",
      paymentRails: ["SEPA"]
    },
    beneficiary: {
      beneficiaryType: "INDIVIDUAL",
      fullName: "Hans Müller",
      birthDate: "1987-01-22",
      nationality: "DE",
      email: "hans.mueller@example.com",
      phoneNumber: "+4917612345678",
      address: {
        line1: "Friedrichstraße 43",
        city: "Berlin",
        postalCode: "10117",
        country: "DE"
      }
    }
  }
}

export { COUNTRY_CONFIGS }

export default function CreateExternalAccount({ customerId, onComplete, disabled, selectedCountry, onCountryChange }: Props) {
  const [body, setBody] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const config = COUNTRY_CONFIGS[selectedCountry]
    setBody(JSON.stringify({
      customerId: customerId ?? "<customer-id>",
      currency: config.currency,
      platformAccountId: `acct_${Math.random().toString(36).slice(2, 10)}`,
      accountInfo: config.accountInfo,
      beneficiary: config.beneficiary
    }, null, 2))
  }, [customerId, selectedCountry])

  const submit = async () => {
    if (!customerId) return
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const data = await apiPost<Record<string, unknown>>(
        `/api/customers/${customerId}/external-accounts`,
        JSON.parse(body)
      )
      const pretty = JSON.stringify(data, null, 2)
      setResponse(pretty)
      onComplete(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const config = COUNTRY_CONFIGS[selectedCountry]

  return (
    <div>
      <p className="text-sm text-gray-400 mb-2">
        Create a {config.description} for customer <code className="text-blue-400">{customerId ?? '...'}</code>
      </p>
      <div className="mb-3">
        <label htmlFor="destination-country" className="block text-sm font-medium text-gray-300 mb-1">Destination Country</label>
        <select
          id="destination-country"
          value={selectedCountry}
          onChange={(e) => onCountryChange(e.target.value)}
          disabled={disabled || loading}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-100 focus:outline-none focus:border-blue-500"
        >
          {Object.entries(COUNTRY_CONFIGS).map(([code, cfg]) => (
            <option key={code} value={code}>{cfg.label}</option>
          ))}
        </select>
      </div>
      <JsonEditor value={body} onChange={setBody} disabled={disabled || loading} />
      <button
        onClick={submit}
        disabled={disabled || loading}
        className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded text-sm font-medium"
      >
        {loading ? 'Creating...' : 'Create External Account'}
      </button>
      <ResponsePanel response={response} error={error} />
    </div>
  )
}
